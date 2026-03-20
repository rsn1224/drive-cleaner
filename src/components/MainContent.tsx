// ==========================================
// Main Content Component
// ==========================================

import type { ReactElement } from "react";

import { BrowseView } from "./BrowseView";
import { DiskUsageView } from "./DiskUsageView";
import { DuplicatesView } from "./DuplicatesView";
import { EmptyFoldersView } from "./EmptyFoldersView";
import { FileTypesView } from "./FileTypesView";
import { LargeFilesView } from "./LargeFilesView";
import { OldFilesView } from "./OldFilesView";
import { QuickActions } from "./QuickActions";
import { TempCleanerView } from "./TempCleanerView";
import type { AppMode } from "../types";
import type { QuickAction } from "../lib/quickActions";

// Hook return types
import type { useFileBrowser } from "../hooks/useFileBrowser";
import type { useScan } from "../hooks/useScan";
import type { useLargeFiles } from "../hooks/useLargeFiles";
import type { useEmptyFolders } from "../hooks/useEmptyFolders";
import type { useOldFiles } from "../hooks/useOldFiles";
import type { useFileTypes } from "../hooks/useFileTypes";
import type { useDiskUsage } from "../hooks/useDiskUsage";
import type { useTempCleaner } from "../hooks/useTempCleaner";

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
  quickActions: QuickAction[];
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
  quickActions,
  onDelete,
}: MainContentProps): ReactElement | null {
  if (mode === "browse") {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <QuickActions actions={quickActions} disabled={fileBrowser.loading} />
        <BrowseView
          sortedNodes={fileBrowser.sortedNodes}
          loading={fileBrowser.loading}
          listHeight={fileBrowser.listHeight}
          listContainerRef={fileBrowser.listContainerRef}
          onNavigate={fileBrowser.loadDirectory}
          onPreview={fileBrowser.handlePreview}
          onDelete={onDelete}
        />
      </div>
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
        onCleanAll={tempCleaner.handleCleanAll}
        onCleanCategory={tempCleaner.handleCleanCategory}
      />
    );
  }

  return null;
}
