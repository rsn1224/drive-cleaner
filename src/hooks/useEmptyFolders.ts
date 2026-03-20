import { listen } from "@tauri-apps/api/event";
import { ask, message } from "@tauri-apps/plugin-dialog";
import { useCallback, useState } from "react";

import { extractErrorMessage, invoke } from "../lib/tauri";
import type { EmptyFolder, ScanProgress } from "../types";

export function useEmptyFolders(currentPath: string) {
  const [emptyFolders, setEmptyFolders] = useState<EmptyFolder[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);

  const handleScanEmptyFolders = useCallback(async (): Promise<void> => {
    setScanning(true);
    setScanProgress({ phase: "準備中...", scanned_files: 0 });
    setEmptyFolders([]);

    const unlistenProgress = listen<ScanProgress>("scan_progress", (event) => {
      setScanProgress(event.payload);
    });

    try {
      const results = await invoke<EmptyFolder[]>("find_empty_folders", {
        targetDir: currentPath,
      });
      setEmptyFolders(results);
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
      unlistenProgress.then((fn) => fn());
    }
  }, [currentPath]);

  const handleDeleteAll = useCallback(async (): Promise<void> => {
    if (emptyFolders.length === 0) return;

    const confirmed = await ask(
      `${emptyFolders.length} 個の空フォルダを削除します。よろしいですか？`,
      { title: "一括削除確認", kind: "warning" },
    );
    if (!confirmed) return;

    try {
      const paths = emptyFolders.map((f) => f.path);
      const deleted = await invoke<number>("delete_empty_folders", { paths });
      await message(`${deleted} 個の空フォルダを削除しました`, { title: "完了" });
      setEmptyFolders([]);
    } catch (e) {
      const msg = extractErrorMessage(e);
      await message(`削除エラー: ${msg}`, {
        title: "エラー",
        kind: "error",
      });
    }
  }, [emptyFolders]);

  const removeFolder = useCallback((path: string): void => {
    setEmptyFolders((prev) => prev.filter((f) => f.path !== path));
  }, []);

  return {
    emptyFolders,
    scanning,
    scanProgress,
    handleScanEmptyFolders,
    handleDeleteAll,
    removeFolder,
  };
}
