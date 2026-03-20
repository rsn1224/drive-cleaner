// ==========================================
// Scan Hook for Drive Cleaner
// ==========================================

import { listen } from "@tauri-apps/api/event";
import { ask, message, save } from "@tauri-apps/plugin-dialog";
import { useCallback, useMemo, useState } from "react";

import { extractErrorMessage, invoke } from "../lib/tauri";
import type { AppMode, DuplicateGroup, ScanProgress } from "../types";

export function useScan(currentPath: string) {
  // State
  const [mode, setMode] = useState<AppMode>("browse");
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);

  // Computed
  const totalSaveable = useMemo(() => {
    return duplicates.reduce((acc, group) => {
      return acc + group.size * (group.paths.length - 1);
    }, 0);
  }, [duplicates]);

  // Duplicate scan
  const handleScanDuplicates = useCallback(async () => {
    setMode("duplicates");
    setScanning(true);
    setScanProgress({ phase: "準備中...", scanned_files: 0 });
    setDuplicates([]);

    const unlistenProgressP = listen<ScanProgress>(
      "scan_progress",
      (event) => {
        setScanProgress(event.payload);
      }
    );

    const unlistenChunkP = listen<DuplicateGroup[]>(
      "duplicate_chunk",
      (event) => {
        setDuplicates((prev) => {
          const filtered = event.payload.filter((g) => g.size > 1024 * 1024);
          const combined = [...prev, ...filtered];
          return combined.sort(
            (a, b) =>
              b.size * b.paths.length - a.size * a.paths.length
          );
        });
      }
    );

    try {
      await invoke("find_duplicates", { targetDir: currentPath });
    } catch (e) {
      if (e !== "Scan was cancelled") {
        const msg = extractErrorMessage(e);
        await message(`スキャンエラー: ${msg}`, {
          title: "エラー",
          kind: "error",
        });
      }
    } finally {
      setScanning(false);
      setScanProgress(null);
      unlistenProgressP.then((fn) => fn());
      unlistenChunkP.then((fn) => fn());
    }
  }, [currentPath]);

  const handleCancelScan = useCallback(async () => {
    try {
      await invoke("cancel_scan");
    } catch {
      // ignore
    }
  }, []);

  // Bulk delete (all non-KEEP duplicates)
  const handleBulkDelete = useCallback(async () => {
    const pathsToDelete = duplicates.flatMap((g) => g.paths.slice(1));
    if (pathsToDelete.length === 0) return;

    const confirmed = await ask(
      `${pathsToDelete.length}個の重複ファイルを削除します。よろしいですか？`,
      { title: "一括削除確認", kind: "warning" }
    );
    if (!confirmed) return;

    try {
      await invoke("bulk_delete", { paths: pathsToDelete });
      setDuplicates((prev) =>
        prev.map((group) => ({
          ...group,
          paths: group.paths.slice(0, 1), // Keep only first file
        }))
      );
    } catch (e) {
      const msg = extractErrorMessage(e);
      await message(`一括削除に失敗しました: ${msg}`, {
        title: "エラー",
        kind: "error",
      });
    }
  }, [duplicates]);

  // Export functions
  const handleExport = useCallback(async (format: "json" | "csv") => {
    const ext = format === "json" ? "json" : "csv";
    const outputPath = await save({
      title: `エクスポート (${format.toUpperCase()})`,
      defaultPath: `duplicates.${ext}`,
      filters: [{ name: format.toUpperCase(), extensions: [ext] }],
    });
    if (!outputPath) return;

    try {
      await invoke("export_duplicates", {
        groups: duplicates,
        format,
        outputPath,
      });
      await message(`エクスポート完了: ${outputPath}`, { title: "完了" });
    } catch (e) {
      const msg = extractErrorMessage(e);
      await message(`エクスポートエラー: ${msg}`, {
        title: "エラー",
        kind: "error",
      });
    }
  }, [duplicates]);

  const handleExportJson = useCallback(() => handleExport("json"), [handleExport]);
  const handleExportCsv = useCallback(() => handleExport("csv"), [handleExport]);

  const removeDuplicate = useCallback((path: string, hash: string): void => {
    setDuplicates((prev) =>
      prev
        .map((group) => {
          if (group.hash === hash) {
            return { ...group, paths: group.paths.filter((p) => p !== path) };
          }
          return group;
        })
        .filter((group) => group.paths.length > 1)
    );
  }, []);

  return {
    mode,
    setMode,
    duplicates,
    scanning,
    scanProgress,
    totalSaveable,
    handleScanDuplicates,
    handleCancelScan,
    handleBulkDelete,
    handleExportJson,
    handleExportCsv,
    removeDuplicate,
  };
}
