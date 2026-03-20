import { listen } from "@tauri-apps/api/event";
import { message } from "@tauri-apps/plugin-dialog";
import { useCallback, useState } from "react";

import { extractErrorMessage, invoke } from "../lib/tauri";
import type { FileTypeAnalysis, ScanProgress } from "../types";

export function useFileTypes(currentPath: string) {
  const [analysis, setAnalysis] = useState<FileTypeAnalysis | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);

  const handleAnalyzeFileTypes = useCallback(async (): Promise<void> => {
    setScanning(true);
    setScanProgress({ phase: "準備中...", scanned_files: 0 });
    setAnalysis(null);

    const unlistenProgress = listen<ScanProgress>("scan_progress", (event) => {
      setScanProgress(event.payload);
    });

    try {
      const result = await invoke<FileTypeAnalysis>("analyze_file_types", {
        targetDir: currentPath,
      });
      setAnalysis(result);
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

  return {
    analysis,
    scanning,
    scanProgress,
    handleAnalyzeFileTypes,
  };
}
