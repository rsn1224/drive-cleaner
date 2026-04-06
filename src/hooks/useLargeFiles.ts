// ==========================================
// Large Files Hook
// ==========================================

import { listen } from "@tauri-apps/api/event";
import { useCallback, useMemo, useState } from "react";
import { notifyComplete } from "../lib/notify";
import { extractErrorMessage, invoke } from "../lib/tauri";
import { useToast } from "../lib/toastContext";
import type { LargeFile, ScanProgress } from "../types";

const TOP_N = 100;
const MIN_SIZE = 1_048_576; // 1MB

export function useLargeFiles(currentPath: string) {
  const notify = useToast();
  const [largeFiles, setLargeFiles] = useState<LargeFile[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);

  const totalSize = useMemo(
    () => largeFiles.reduce((acc, f) => acc + f.size, 0),
    [largeFiles],
  );

  const handleScanLargeFiles = useCallback(async (): Promise<void> => {
    setScanning(true);
    setScanProgress({ phase: "準備中...", scanned_files: 0 });
    setLargeFiles([]);

    const unlistenProgress = listen<ScanProgress>("scan_progress", (event) => {
      setScanProgress(event.payload);
    });

    try {
      const results = await invoke<LargeFile[]>("find_large_files", {
        targetDir: currentPath,
        topN: TOP_N,
        minSize: MIN_SIZE,
      });
      setLargeFiles(results);
      await notifyComplete("スキャン完了", `${results.length} 件の大容量ファイルを検出しました`);
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

  const removeFile = useCallback((path: string): void => {
    setLargeFiles((prev) => prev.filter((f) => f.path !== path));
  }, []);

  return {
    largeFiles,
    scanning,
    scanProgress,
    totalSize,
    handleScanLargeFiles,
    removeFile,
  };
}
