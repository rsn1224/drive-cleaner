import { listen } from "@tauri-apps/api/event";
import { message } from "@tauri-apps/plugin-dialog";
import { useCallback, useMemo, useState } from "react";

import { extractErrorMessage, invoke } from "../lib/tauri";
import type { OldFile, ScanProgress } from "../types";

const MIN_DAYS = 365;
const TOP_N = 200;

export function useOldFiles(currentPath: string) {
  const [oldFiles, setOldFiles] = useState<OldFile[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);

  const totalSize = useMemo(
    () => oldFiles.reduce((acc, f) => acc + f.size, 0),
    [oldFiles],
  );

  const handleScanOldFiles = useCallback(async (): Promise<void> => {
    setScanning(true);
    setScanProgress({ phase: "準備中...", scanned_files: 0 });
    setOldFiles([]);

    const unlistenProgress = listen<ScanProgress>("scan_progress", (event) => {
      setScanProgress(event.payload);
    });

    try {
      const results = await invoke<OldFile[]>("find_old_files", {
        targetDir: currentPath,
        minDays: MIN_DAYS,
        topN: TOP_N,
      });
      setOldFiles(results);
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

  const removeFile = useCallback((path: string): void => {
    setOldFiles((prev) => prev.filter((f) => f.path !== path));
  }, []);

  return {
    oldFiles,
    scanning,
    scanProgress,
    totalSize,
    handleScanOldFiles,
    removeFile,
  };
}
