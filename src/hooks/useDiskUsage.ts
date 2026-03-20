import { listen } from "@tauri-apps/api/event";
import { message } from "@tauri-apps/plugin-dialog";
import { useCallback, useState } from "react";

import { extractErrorMessage, invoke } from "../lib/tauri";
import type { FolderSize, ScanProgress } from "../types";

export function useDiskUsage(currentPath: string) {
  const [folderCache, setFolderCache] = useState<Map<string, FolderSize>>(new Map());
  const [currentFolderPath, setCurrentFolderPath] = useState<string>("");
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ name: string; path: string }[]>([]);

  // 現在表示中のフォルダ
  const currentFolder = folderCache.get(currentFolderPath) ?? null;

  const fetchFolder = useCallback(async (path: string): Promise<FolderSize | null> => {
    const unlistenProgress = listen<ScanProgress>("scan_progress", (event) => {
      setScanProgress(event.payload);
    });

    try {
      const result = await invoke<FolderSize>("analyze_disk_usage", {
        targetDir: path,
        depth: 1,
      });
      setFolderCache((prev) => new Map(prev).set(path, result));
      return result;
    } catch (e) {
      if (e !== "Scan was cancelled") {
        const msg = extractErrorMessage(e);
        await message(`スキャンエラー: ${msg}`, {
          title: "エラー",
          kind: "error",
        });
      }
      return null;
    } finally {
      setScanProgress(null);
      unlistenProgress.then((fn) => fn());
    }
  }, []);

  // 初回スキャン（ルート）
  const handleAnalyzeDiskUsage = useCallback(async (): Promise<void> => {
    setScanning(true);
    setScanProgress({ phase: "準備中...", scanned_files: 0 });
    setFolderCache(new Map());

    const result = await fetchFolder(currentPath);
    if (result) {
      setCurrentFolderPath(currentPath);
      setBreadcrumbs([{ name: result.name, path: currentPath }]);
    }

    setScanning(false);
  }, [currentPath, fetchFolder]);

  // ドリルダウン（scanning 中は無視して競合防止）
  const drillDown = useCallback(async (path: string, name: string): Promise<void> => {
    if (scanning) return;

    const cached = folderCache.get(path);
    if (cached) {
      setCurrentFolderPath(path);
      setBreadcrumbs((prev) => [...prev, { name, path }]);
      return;
    }

    setScanning(true);
    const result = await fetchFolder(path);
    if (result) {
      setCurrentFolderPath(path);
      setBreadcrumbs((prev) => [...prev, { name, path }]);
    }
    setScanning(false);
  }, [scanning, folderCache, fetchFolder]);

  // パンくずナビゲーション
  const navigateUp = useCallback((path: string): void => {
    setCurrentFolderPath(path);
    setBreadcrumbs((prev) => {
      const idx = prev.findIndex((b) => b.path === path);
      return idx >= 0 ? prev.slice(0, idx + 1) : prev;
    });
  }, []);

  return {
    currentFolder,
    scanning,
    scanProgress,
    breadcrumbs,
    handleAnalyzeDiskUsage,
    drillDown,
    navigateUp,
  };
}
