// ==========================================
// Scan Hook for Drive Cleaner
// ==========================================

import { listen } from "@tauri-apps/api/event";
import { save } from "@tauri-apps/plugin-dialog";
import { useCallback, useMemo, useState } from "react";
import { useConfirm } from "../lib/confirmContext";
import { notifyComplete } from "../lib/notify";
import { extractErrorMessage, invoke } from "../lib/tauri";
import { useToast } from "../lib/toastContext";
import type { AppMode, DuplicateGroup, ScanProgress } from "../types";

export function useScan(currentPath: string) {
  const confirm = useConfirm();
  const notify = useToast();
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
      await notifyComplete("重複スキャン完了", "スキャンが完了しました");
    } catch (e) {
      if (e !== "Scan was cancelled") {
        const msg = extractErrorMessage(e);
        notify(`スキャンエラー: ${msg}`, "error");
      }
    } finally {
      setScanning(false);
      setScanProgress(null);
      unlistenProgressP.then((fn) => fn());
      unlistenChunkP.then((fn) => fn());
    }
  }, [currentPath, notify]);


  const handleCancelScan = useCallback(async () => {
    try {
      await invoke("cancel_scan");
    } catch {
      // キャンセルはベストエフォート。失敗しても UI は正常にリセットされる
    }
  }, []);

  // Bulk delete (all non-KEEP duplicates)
  const handleBulkDelete = useCallback(async () => {
    const pathsToDelete = duplicates.flatMap((g) => g.paths.slice(1));
    if (pathsToDelete.length === 0) return;

    const ok = await confirm(
      `${pathsToDelete.length}個の重複ファイルをゴミ箱に移動します。よろしいですか？`,
      "一括削除確認",
    );
    if (!ok) return;

    try {
      await invoke("bulk_delete", { paths: pathsToDelete });
      setDuplicates((prev) =>
        prev.map((group) => ({
          ...group,
          paths: group.paths.slice(0, 1),
        }))
      );
    } catch (e) {
      const msg = extractErrorMessage(e);
      notify(`一括削除に失敗しました: ${msg}`, "error");
    }
  }, [duplicates, confirm, notify]);

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
      notify(`エクスポート完了: ${outputPath}`, "success");
    } catch (e) {
      const msg = extractErrorMessage(e);
      notify(`エクスポートエラー: ${msg}`, "error");
    }
  }, [duplicates, notify]);

  const handleExportJson = useCallback(() => handleExport("json"), [handleExport]);
  const handleExportCsv = useCallback(() => handleExport("csv"), [handleExport]);

  // 選択したパスのみ一括削除
  const handleBulkDeleteSelected = useCallback(async (paths: string[]): Promise<void> => {
    if (paths.length === 0) return;

    const ok = await confirm(
      `選択した ${paths.length} 個のファイルをゴミ箱に移動します。よろしいですか？`,
      "削除確認",
    );
    if (!ok) return;

    try {
      await invoke("bulk_delete", { paths });
      const pathSet = new Set(paths);
      setDuplicates((prev) =>
        prev
          .map((group) => ({
            ...group,
            paths: group.paths.filter((p) => !pathSet.has(p)),
          }))
          .filter((group) => group.paths.length > 1)
      );
    } catch (e) {
      const msg = extractErrorMessage(e);
      notify(`削除に失敗しました: ${msg}`, "error");
    }
  }, [confirm, notify]);

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
    handleBulkDeleteSelected,
    handleExportJson,
    handleExportCsv,
    removeDuplicate,
  };
}
