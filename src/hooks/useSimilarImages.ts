// ==========================================
// Similar Images Hook
// ==========================================

import { listen } from "@tauri-apps/api/event";
import { useCallback, useState } from "react";
import { notifyComplete } from "../lib/notify";
import { extractErrorMessage, invoke } from "../lib/tauri";
import { useToast } from "../lib/toastContext";
import type { ScanProgress, SimilarImageGroup } from "../types";

const DEFAULT_THRESHOLD = 10;

export function useSimilarImages(currentPath: string) {
  const notify = useToast();
  const [groups, setGroups] = useState<SimilarImageGroup[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);

  const handleScan = useCallback(async (): Promise<void> => {
    setScanning(true);
    setScanProgress({ phase: "準備中...", scanned_files: 0 });
    setGroups([]);

    const unlistenProgress = listen<ScanProgress>("scan_progress", (event) => {
      setScanProgress(event.payload);
    });

    try {
      const results = await invoke<SimilarImageGroup[]>("find_similar_images", {
        targetDir: currentPath,
        threshold: DEFAULT_THRESHOLD,
      });
      setGroups(results);
      await notifyComplete("スキャン完了", `${results.length} グループの類似画像を検出しました`);
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

  const removeGroup = useCallback((index: number): void => {
    setGroups((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    groups,
    scanning,
    scanProgress,
    handleScan,
    removeGroup,
  };
}
