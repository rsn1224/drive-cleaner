// ==========================================
// Main Content Component
// ==========================================

import type { ReactElement } from "react";
import type { useDiskUsage } from "../hooks/useDiskUsage";
import type { useEmptyFolders } from "../hooks/useEmptyFolders";
// Hook return types
import type { useFileBrowser } from "../hooks/useFileBrowser";
import type { useFileTypes } from "../hooks/useFileTypes";
import type { useLargeFiles } from "../hooks/useLargeFiles";
import type { useOldFiles } from "../hooks/useOldFiles";
import type { useScan } from "../hooks/useScan";
import type { useSimilarImages } from "../hooks/useSimilarImages";
import type { useTempCleaner } from "../hooks/useTempCleaner";
import type { AppMode } from "../types";
import { BrowseView } from "./BrowseView";
import { DiskUsageView } from "./DiskUsageView";
import { DuplicatesView } from "./DuplicatesView";
import { EmptyFoldersView } from "./EmptyFoldersView";
import { FileTypesView } from "./FileTypesView";
import { LargeFilesView } from "./LargeFilesView";
import { OldFilesView } from "./OldFilesView";
import { SimilarImagesView } from "./SimilarImagesView";
import { TempCleanerView } from "./TempCleanerView";

interface MainContentProps {
  mode: AppMode;
  fileBrowser: ReturnType<typeof useFileBrowser>;
  scan: ReturnType<typeof useScan>;
  largeFiles: ReturnType<typeof useLargeFiles>;
  emptyFolders: ReturnType<typeof useEmptyFolders>;
  oldFiles: ReturnType<typeof useOldFiles>;
  fileTypes: ReturnType<typeof useFileTypes>;
  diskUsage: ReturnType<typeof useDiskUsage>;
  tempCleaner: ReturnType<typeof useTempCleaner>;
  similarImages: ReturnType<typeof useSimilarImages>;
  onDelete: (path: string, hash?: string) => void;
}

export function MainContent({
  mode,
  fileBrowser,
  scan,
  largeFiles,
  emptyFolders,
  oldFiles,
  fileTypes,
  diskUsage,
  tempCleaner,
  similarImages,
  onDelete,
}: MainContentProps): ReactElement | null {
  if (mode === "browse") {
    return (
      <BrowseView
        sortedNodes={fileBrowser.sortedNodes}
        loading={fileBrowser.loading}
        listHeight={fileBrowser.listHeight}
        listContainerRef={fileBrowser.listContainerRef}
        selectedPaths={fileBrowser.selectedPaths}
        renameTarget={fileBrowser.renameTarget}
        onNavigate={fileBrowser.loadDirectory}
        onPreview={fileBrowser.handlePreview}
        onDelete={onDelete}
        onSecureDelete={fileBrowser.handleSecureDeleteItem}
        onMove={fileBrowser.handleMoveItem}
        onRename={fileBrowser.handleRenameStart}
        onRenameSubmit={fileBrowser.handleRenameSubmit}
        onRenameClear={fileBrowser.handleRenameClear}
        onToggleSelect={fileBrowser.toggleSelect}
        onBulkMove={fileBrowser.handleBulkMove}
        onClearSelection={fileBrowser.clearSelection}
        onOrganize={fileBrowser.handleOrganizeByType}
      />
    );
  }

  if (mode === "duplicates") {
    return (
      <DuplicatesView
        duplicates={scan.duplicates}
        scanning={scan.scanning}
        scanProgress={scan.scanProgress}
        totalSaveable={scan.totalSaveable}
        onPreview={fileBrowser.handlePreview}
        onDelete={onDelete}
        onBulkDelete={scan.handleBulkDelete}
        onBulkDeleteSelected={scan.handleBulkDeleteSelected}
        onExportJson={scan.handleExportJson}
        onExportCsv={scan.handleExportCsv}
      />
    );
  }

  if (mode === "large_files") {
    return (
      <LargeFilesView
        largeFiles={largeFiles.largeFiles}
        scanning={largeFiles.scanning}
        scanProgress={largeFiles.scanProgress}
        totalSize={largeFiles.totalSize}
        onPreview={fileBrowser.handlePreview}
        onDelete={onDelete}
      />
    );
  }

  if (mode === "empty_folders") {
    return (
      <EmptyFoldersView
        emptyFolders={emptyFolders.emptyFolders}
        scanning={emptyFolders.scanning}
        scanProgress={emptyFolders.scanProgress}
        onDelete={onDelete}
        onDeleteAll={emptyFolders.handleDeleteAll}
      />
    );
  }

  if (mode === "old_files") {
    return (
      <OldFilesView
        oldFiles={oldFiles.oldFiles}
        scanning={oldFiles.scanning}
        scanProgress={oldFiles.scanProgress}
        totalSize={oldFiles.totalSize}
        onPreview={fileBrowser.handlePreview}
        onDelete={onDelete}
      />
    );
  }

  if (mode === "file_types") {
    return (
      <FileTypesView
        analysis={fileTypes.analysis}
        scanning={fileTypes.scanning}
        scanProgress={fileTypes.scanProgress}
      />
    );
  }

  if (mode === "disk_usage") {
    return (
      <DiskUsageView
        currentFolder={diskUsage.currentFolder}
        scanning={diskUsage.scanning}
        scanProgress={diskUsage.scanProgress}
        breadcrumbs={diskUsage.breadcrumbs}
        onDrillDown={diskUsage.drillDown}
        onNavigateUp={diskUsage.navigateUp}
      />
    );
  }

  if (mode === "temp_cleaner") {
    return (
      <TempCleanerView
        scanResult={tempCleaner.scanResult}
        scanning={tempCleaner.scanning}
        scanProgress={tempCleaner.scanProgress}
        cleaning={tempCleaner.cleaning}
        recycleBinInfo={tempCleaner.recycleBinInfo}
        onCleanAll={tempCleaner.handleCleanAll}
        onCleanCategory={tempCleaner.handleCleanCategory}
        onEmptyRecycleBin={tempCleaner.handleEmptyRecycleBin}
      />
    );
  }

  if (mode === "similar_images") {
    return (
      <SimilarImagesView
        groups={similarImages.groups}
        scanning={similarImages.scanning}
        scanProgress={similarImages.scanProgress}
        onPreview={fileBrowser.handlePreview}
        onDelete={onDelete}
      />
    );
  }

  return null;
}
