import { listen } from "@tauri-apps/api/event";
import { ask, message } from "@tauri-apps/plugin-dialog";
import { useCallback, useState } from "react";

import { extractErrorMessage, invoke } from "../lib/tauri";
import type { CleanResult, ScanProgress, TempScanResult } from "../types";

export function useTempCleaner() {
  const [scanResult, setScanResult] = useState<TempScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const [cleaning, setCleaning] = useState(false);

  const handleScan = useCallback(async (): Promise<void> => {
    setScanning(true);
    setScanProgress({ phase: "準備中...", scanned_files: 0 });
    setScanResult(null);

    const unlistenProgress = listen<ScanProgress>("scan_progress", (event) => {
      setScanProgress(event.payload);
    });

    try {
      const result = await invoke<TempScanResult>("scan_temp_files", {});
      setScanResult(result);
    } catch (e) {
      if (e !== "Scan was cancelled") {
        const msg = extractErrorMessage(e);
        await message(`スキャンエラー: ${msg}`, { title: "エラー", kind: "error" });
      }
    } finally {
      setScanning(false);
      setScanProgress(null);
      unlistenProgress.then((fn) => fn());
    }
  }, []);

  const handleCleanAll = useCallback(async (): Promise<void> => {
    if (!scanResult) return;
    const allPaths = scanResult.categories.flatMap((c) => c.items.map((i) => i.path));
    if (allPaths.length === 0) return;

    const confirmed = await ask(
      `${allPaths.length} 個の一時ファイルを削除します。よろしいですか？`,
      { title: "クリーン確認", kind: "warning" },
    );
    if (!confirmed) return;

    setCleaning(true);
    try {
      const result = await invoke<CleanResult>("clean_temp_files", { paths: allPaths });
      await message(
        `${result.deleted_count} ファイル削除、${formatFreed(result.freed_size)} 解放`,
        { title: "完了" },
      );
      setScanResult(null); // クリーン後はリセット
    } catch (e) {
      const msg = extractErrorMessage(e);
      await message(`クリーンエラー: ${msg}`, { title: "エラー", kind: "error" });
    } finally {
      setCleaning(false);
    }
  }, [scanResult]);

  const handleCleanCategory = useCallback(async (categoryName: string): Promise<void> => {
    if (!scanResult) return;
    const category = scanResult.categories.find((c) => c.name === categoryName);
    if (!category) return;

    const paths = category.items.map((i) => i.path);
    const confirmed = await ask(
      `${category.name} の ${paths.length} 個のファイルを削除します。`,
      { title: "クリーン確認", kind: "warning" },
    );
    if (!confirmed) return;

    setCleaning(true);
    try {
      const result = await invoke<CleanResult>("clean_temp_files", { paths });
      await message(
        `${result.deleted_count} ファイル削除、${formatFreed(result.freed_size)} 解放`,
        { title: "完了" },
      );
      // 削除したカテゴリを結果から除去
      setScanResult((prev) => {
        if (!prev) return null;
        const updated = prev.categories.filter((c) => c.name !== categoryName);
        return {
          categories: updated,
          total_files: updated.reduce((a, c) => a + c.file_count, 0),
          total_size: updated.reduce((a, c) => a + c.total_size, 0),
        };
      });
    } catch (e) {
      const msg = extractErrorMessage(e);
      await message(`クリーンエラー: ${msg}`, { title: "エラー", kind: "error" });
    } finally {
      setCleaning(false);
    }
  }, [scanResult]);

  return {
    scanResult,
    scanning,
    scanProgress,
    cleaning,
    handleScan,
    handleCleanAll,
    handleCleanCategory,
  };
}

// ヘルパー（ファイル内に定義）
function formatFreed(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(1)} GB`;
}
