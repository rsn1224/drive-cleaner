import { listen } from "@tauri-apps/api/event";
import { useCallback, useState } from "react";

import { useConfirm } from "../lib/confirmContext";
import { extractErrorMessage, invoke } from "../lib/tauri";
import { useToast } from "../lib/toastContext";
import type { EmptyFolder, ScanProgress } from "../types";

export function useEmptyFolders(currentPath: string) {
  const confirm = useConfirm();
  const notify = useToast();
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
        notify(`スキャンエラー: ${msg}`, "error");
      }
    } finally {
      setScanning(false);
      setScanProgress(null);
      unlistenProgress.then((fn) => fn());
    }
  }, [currentPath, notify]);

  const handleDeleteAll = useCallback(async (): Promise<void> => {
    if (emptyFolders.length === 0) return;

    const ok = await confirm(
      `${emptyFolders.length} 個の空フォルダをゴミ箱に移動します。よろしいですか？`,
      "一括削除確認",
    );
    if (!ok) return;

    try {
      const paths = emptyFolders.map((f) => f.path);
      const deleted = await invoke<number>("delete_empty_folders", { paths });
      setEmptyFolders([]);
      notify(`${deleted} 個の空フォルダを削除しました`, "success");
    } catch (e) {
      const msg = extractErrorMessage(e);
      notify(`削除エラー: ${msg}`, "error");
    }
  }, [emptyFolders, confirm, notify]);

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
