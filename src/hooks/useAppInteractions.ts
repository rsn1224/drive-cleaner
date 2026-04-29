// ==========================================
// App-level keyboard shortcuts and drag-and-drop
// ==========================================

import type { DragEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';

import type { useEmptyFolders } from './useEmptyFolders';
import type { useFileBrowser } from './useFileBrowser';
import type { useLargeFiles } from './useLargeFiles';
import type { useOldFiles } from './useOldFiles';
import type { useScan } from './useScan';
import type { useSimilarImages } from './useSimilarImages';

type FileBrowser = ReturnType<typeof useFileBrowser>;
type Scan = ReturnType<typeof useScan>;
type LargeFiles = ReturnType<typeof useLargeFiles>;
type EmptyFolders = ReturnType<typeof useEmptyFolders>;
type OldFiles = ReturnType<typeof useOldFiles>;
type SimilarImages = ReturnType<typeof useSimilarImages>;

interface UseAppInteractionsArgs {
  fileBrowser: FileBrowser;
  scan: Scan;
  largeFiles: LargeFiles;
  emptyFolders: EmptyFolders;
  oldFiles: OldFiles;
  similarImages: SimilarImages;
}

interface UseAppInteractionsResult {
  isDragging: boolean;
  handleDeleteItem: (path: string, hash?: string) => Promise<void>;
  handleDragOver: (e: DragEvent) => void;
  handleDragLeave: () => void;
  handleDrop: (e: DragEvent) => void;
}

export function useAppInteractions({
  fileBrowser,
  scan,
  largeFiles,
  emptyFolders,
  oldFiles,
  similarImages,
}: UseAppInteractionsArgs): UseAppInteractionsResult {
  const [isDragging, setIsDragging] = useState(false);

  const handleDeleteItem = useCallback(
    async (path: string, hash?: string) => {
      if (scan.mode === 'duplicates' && hash) {
        await fileBrowser.handleDeleteItem(path);
        scan.removeDuplicate(path, hash);
      } else if (scan.mode === 'large_files') {
        await fileBrowser.handleDeleteItem(path);
        largeFiles.removeFile(path);
      } else if (scan.mode === 'empty_folders') {
        await fileBrowser.handleDeleteItem(path);
        emptyFolders.removeFolder(path);
      } else if (scan.mode === 'old_files') {
        await fileBrowser.handleDeleteItem(path);
        oldFiles.removeFile(path);
      } else if (scan.mode === 'similar_images') {
        await fileBrowser.handleDeleteItem(path);
        const groupIndex = similarImages.groups.findIndex((g) => g.paths.includes(path));
        if (groupIndex !== -1) similarImages.removeGroup(groupIndex);
      } else {
        await fileBrowser.handleDeleteItem(path);
      }
    },
    [fileBrowser, scan, largeFiles, emptyFolders, oldFiles, similarImages],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        fileBrowser.handleGoUp();
      }
      if (e.key === 'Escape') {
        if (fileBrowser.preview) {
          fileBrowser.setPreview(null);
        } else if (scan.mode !== 'browse') {
          scan.setMode('browse');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fileBrowser.preview, fileBrowser, scan.mode, scan]);

  const handleDragOver = (e: DragEvent): void => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (): void => setIsDragging(false);
  const handleDrop = (e: DragEvent): void => {
    e.preventDefault();
    setIsDragging(false);
    const items = e.dataTransfer.files;
    if (items.length > 0) {
      const path = (items[0] as File & { path?: string }).path;
      if (path) fileBrowser.loadDirectory(path);
    }
  };

  return {
    isDragging,
    handleDeleteItem,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}
