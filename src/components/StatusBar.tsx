// ==========================================
// Status Bar Component
// ==========================================

import { messages } from "../i18n/messages";
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
  similarImagesGroupCount: number;
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
  similarImagesGroupCount,
}: StatusBarProps) {
  return (
    <div 
      className="bg-black/95 border-t border-primary/10 backdrop-blur-md px-3 py-1 flex justify-between items-center hud-label text-white/40"
      role="status"
      aria-live="polite"
    >
      {mode === "browse" ? (
        <>
          <span>{folderCount} {messages.folders}, {fileCount} {messages.files}</span>
          <span className="text-primary font-mono">{messages.total}: {formatSize(totalSize)}</span>
        </>
      ) : mode === "duplicates" ? (
        <>
          <span>
            {duplicatesGroupCount} {messages.duplicateGroups}, {duplicatesFileCount} {messages.files}
          </span>
          <span className="text-primary font-mono">{messages.saveable}: {formatSize(totalSaveable)}</span>
        </>
      ) : mode === "large_files" ? (
        <>
          <span>{largeFilesCount} {messages.files}</span>
          <span className="text-primary font-mono">{messages.total}: {formatSize(largeFilesTotalSize)}</span>
        </>
      ) : mode === "empty_folders" ? (
        <>
          <span>{emptyFoldersCount} {messages.emptyFolders}</span>
          <span></span>
        </>
      ) : mode === "old_files" ? (
        <>
          <span>{oldFilesCount} {messages.files}</span>
          <span className="text-primary font-mono">{messages.total}: {formatSize(oldFilesTotalSize)}</span>
        </>
      ) : mode === "file_types" ? (
        <>
          <span>{fileTypesTotal} {messages.files}, {fileTypesCategoryCount} {messages.categories}</span>
          <span></span>
        </>
      ) : mode === "disk_usage" ? (
        <>
          <span>{diskUsageFileCount} {messages.files}</span>
          <span className="text-primary font-mono">{messages.total}: {formatSize(diskUsageTotalSize)}</span>
        </>
      ) : mode === "temp_cleaner" ? (
        <>
          <span>{tempFilesCount} {messages.tempFiles}</span>
          <span className="text-primary font-mono">{messages.total}: {formatSize(tempFilesTotalSize)}</span>
        </>
      ) : mode === "similar_images" ? (
        <span>{similarImagesGroupCount} {messages.similarImagesGroup}</span>
      ) : null}
    </div>
  );
}
