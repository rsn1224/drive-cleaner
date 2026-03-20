// ==========================================
// Scan Actions Hook
// ==========================================

import { useCallback } from "react";

import type { AppMode } from "../types";

interface ScanHooks {
  setMode: (mode: AppMode) => void;
  handleScanDuplicates: () => void;
  handleScanLargeFiles: () => Promise<void>;
  handleScanEmptyFolders: () => Promise<void>;
  handleScanOldFiles: () => Promise<void>;
  handleAnalyzeFileTypes: () => Promise<void>;
  handleAnalyzeDiskUsage: () => Promise<void>;
  handleScanTempFiles: () => Promise<void>;
}

export interface ScanActions {
  scanLargeFiles: () => void;
  scanEmptyFolders: () => void;
  scanOldFiles: () => void;
  scanFileTypes: () => void;
  scanDiskUsage: () => void;
  scanTempFiles: () => void;
  scanDuplicates: () => void;
}

export function useScanActions(hooks: ScanHooks): ScanActions {
  const scanLargeFiles = useCallback(() => {
    hooks.setMode("large_files");
    hooks.handleScanLargeFiles();
  }, [hooks.setMode, hooks.handleScanLargeFiles]);

  const scanEmptyFolders = useCallback(() => {
    hooks.setMode("empty_folders");
    hooks.handleScanEmptyFolders();
  }, [hooks.setMode, hooks.handleScanEmptyFolders]);

  const scanOldFiles = useCallback(() => {
    hooks.setMode("old_files");
    hooks.handleScanOldFiles();
  }, [hooks.setMode, hooks.handleScanOldFiles]);

  const scanFileTypes = useCallback(() => {
    hooks.setMode("file_types");
    hooks.handleAnalyzeFileTypes();
  }, [hooks.setMode, hooks.handleAnalyzeFileTypes]);

  const scanDiskUsage = useCallback(() => {
    hooks.setMode("disk_usage");
    hooks.handleAnalyzeDiskUsage();
  }, [hooks.setMode, hooks.handleAnalyzeDiskUsage]);

  const scanTempFiles = useCallback(() => {
    hooks.setMode("temp_cleaner");
    hooks.handleScanTempFiles();
  }, [hooks.setMode, hooks.handleScanTempFiles]);

  const scanDuplicates = useCallback(() => {
    hooks.setMode("duplicates");
    hooks.handleScanDuplicates();
  }, [hooks.setMode, hooks.handleScanDuplicates]);

  return {
    scanLargeFiles,
    scanEmptyFolders,
    scanOldFiles,
    scanFileTypes,
    scanDiskUsage,
    scanTempFiles,
    scanDuplicates,
  };
}
