// ==========================================
// Status Bar Component
// ==========================================

import { formatSize } from "../lib/utils";
import type { AppMode } from "../types";

interface StatusBarProps {
  mode: AppMode;
  folderCount: number;
  fileCount: number;
  totalSize: number;
  duplicatesGroupCount: number;
  duplicatesFileCount: number;
  totalSaveable: number;
  largeFilesCount: number;
  largeFilesTotalSize: number;
  emptyFoldersCount: number;
  oldFilesCount: number;
  oldFilesTotalSize: number;
  fileTypesTotal: number;
  fileTypesCategoryCount: number;
  diskUsageFileCount: number;
  diskUsageTotalSize: number;
  tempFilesCount: number;
  tempFilesTotalSize: number;
}

export function StatusBar({
  mode,
  folderCount,
  fileCount,
  totalSize,
  duplicatesGroupCount,
  duplicatesFileCount,
  totalSaveable,
  largeFilesCount,
  largeFilesTotalSize,
  emptyFoldersCount,
  oldFilesCount,
  oldFilesTotalSize,
  fileTypesTotal,
  fileTypesCategoryCount,
  diskUsageFileCount,
  diskUsageTotalSize,
  tempFilesCount,
  tempFilesTotalSize,
}: StatusBarProps) {
  return (
    <div className="bg-black/95 border-t border-primary/10 backdrop-blur-md px-3 py-1 flex justify-between items-center hud-label text-white/40">
      {mode === "browse" ? (
        <>
          <span>{folderCount} フォルダ, {fileCount} ファイル</span>
          <span className="text-primary font-mono">合計: {formatSize(totalSize)}</span>
        </>
      ) : mode === "duplicates" ? (
        <>
          <span>
            {duplicatesGroupCount} グループ, {duplicatesFileCount} ファイル
          </span>
          <span className="text-primary font-mono">節約可能: {formatSize(totalSaveable)}</span>
        </>
      ) : mode === "large_files" ? (
        <>
          <span>{largeFilesCount} ファイル</span>
          <span className="text-primary font-mono">合計: {formatSize(largeFilesTotalSize)}</span>
        </>
      ) : mode === "empty_folders" ? (
        <>
          <span>{emptyFoldersCount} 空フォルダ</span>
          <span></span>
        </>
      ) : mode === "old_files" ? (
        <>
          <span>{oldFilesCount} ファイル</span>
          <span className="text-primary font-mono">合計: {formatSize(oldFilesTotalSize)}</span>
        </>
      ) : mode === "file_types" ? (
        <>
          <span>{fileTypesTotal} ファイル, {fileTypesCategoryCount} カテゴリ</span>
          <span></span>
        </>
      ) : mode === "disk_usage" ? (
        <>
          <span>{diskUsageFileCount} ファイル</span>
          <span className="text-primary font-mono">合計: {formatSize(diskUsageTotalSize)}</span>
        </>
      ) : mode === "temp_cleaner" ? (
        <>
          <span>{tempFilesCount} 一時ファイル</span>
          <span className="text-primary font-mono">合計: {formatSize(tempFilesTotalSize)}</span>
        </>
      ) : null}
    </div>
  );
}
