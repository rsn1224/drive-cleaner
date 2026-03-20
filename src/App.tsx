// ==========================================
// Main App Component - Drive Cleaner
// ==========================================

import {
  BarChart3,
  Clock,
  FolderOpen,
  HardDrive,
  PieChart,
  Search,
  Trash,
} from "lucide-react";
import type { DragEvent, ReactElement } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BrowseView } from "./components/BrowseView";
import { DiskUsageView } from "./components/DiskUsageView";
import { DuplicatesView } from "./components/DuplicatesView";
import { EmptyFoldersView } from "./components/EmptyFoldersView";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { FileTypesView } from "./components/FileTypesView";
import { Header } from "./components/Header";
import { LargeFilesView } from "./components/LargeFilesView";
import { OldFilesView } from "./components/OldFilesView";
import { PreviewModal } from "./components/PreviewModal";
import { QuickActions } from "./components/QuickActions";
import { StatusBar } from "./components/StatusBar";
import { TempCleanerView } from "./components/TempCleanerView";
import { Toolbar } from "./components/Toolbar";
import { useDiskUsage } from "./hooks/useDiskUsage";
import { useEmptyFolders } from "./hooks/useEmptyFolders";
import { useFileBrowser } from "./hooks/useFileBrowser";
import { useFileTypes } from "./hooks/useFileTypes";
import { useLargeFiles } from "./hooks/useLargeFiles";
import { useOldFiles } from "./hooks/useOldFiles";
import { useScan } from "./hooks/useScan";
import { useTempCleaner } from "./hooks/useTempCleaner";

function App(): ReactElement {
  // Custom hooks
  const fileBrowser = useFileBrowser();
  const scan = useScan(fileBrowser.currentPath);
  const largeFiles = useLargeFiles(fileBrowser.currentPath);
  const emptyFolders = useEmptyFolders(fileBrowser.currentPath);
  const oldFiles = useOldFiles(fileBrowser.currentPath);
  const fileTypes = useFileTypes(fileBrowser.currentPath);
  const diskUsage = useDiskUsage(fileBrowser.currentPath);
  const tempCleaner = useTempCleaner();

  // Quick actions for dashboard
  const quickActions = useMemo(() => [
    {
      id: "large_files",
      icon: HardDrive,
      label: "大容量ファイル",
      description: "トップ100件を検出",
      color: "#22c55e",
      onClick: () => {
        scan.setMode("large_files");
        largeFiles.handleScanLargeFiles();
      },
    },
    {
      id: "empty_folders",
      icon: FolderOpen,
      label: "空フォルダ",
      description: "空のフォルダを検出",
      color: "#f59e0b",
      onClick: () => {
        scan.setMode("empty_folders");
        emptyFolders.handleScanEmptyFolders();
      },
    },
    {
      id: "old_files",
      icon: Clock,
      label: "古いファイル",
      description: "1年以上未更新",
      color: "#ef4444",
      onClick: () => {
        scan.setMode("old_files");
        oldFiles.handleScanOldFiles();
      },
    },
    {
      id: "file_types",
      icon: BarChart3,
      label: "種別分析",
      description: "カテゴリ別集計",
      color: "#8b5cf6",
      onClick: () => {
        scan.setMode("file_types");
        fileTypes.handleAnalyzeFileTypes();
      },
    },
    {
      id: "disk_usage",
      icon: PieChart,
      label: "ディスク使用量",
      description: "フォルダ別サイズ",
      color: "#06b6d4",
      onClick: () => {
        scan.setMode("disk_usage");
        diskUsage.handleAnalyzeDiskUsage();
      },
    },
    {
      id: "temp_cleaner",
      icon: Trash,
      label: "一時クリーン",
      description: "一時ファイル削除",
      color: "#f97316",
      onClick: () => {
        scan.setMode("temp_cleaner");
        tempCleaner.handleScan();
      },
    },
    {
      id: "duplicates",
      icon: Search,
      label: "重複スキャン",
      description: "重複ファイル検出",
      color: "#6366f1",
      onClick: () => {
        scan.setMode("duplicates");
        scan.handleScanDuplicates();
      },
    },
  ], [scan, largeFiles, emptyFolders, oldFiles, fileTypes, diskUsage, tempCleaner]);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);

  // Computed values for StatusBar
  const folderCount = useMemo(
    () => fileBrowser.nodes.filter((n) => n.is_dir).length,
    [fileBrowser.nodes],
  );
  const fileCount = useMemo(
    () => fileBrowser.nodes.filter((n) => !n.is_dir).length,
    [fileBrowser.nodes],
  );
  const totalSize = useMemo(
    () => fileBrowser.nodes.reduce((acc, n) => acc + n.size, 0),
    [fileBrowser.nodes],
  );

  // Combined handlers
  const handleDeleteItem = useCallback(async (path: string, hash?: string) => {
    if (scan.mode === "duplicates" && hash) {
      await fileBrowser.handleDeleteItem(path);
      scan.removeDuplicate(path, hash);
    } else if (scan.mode === "large_files") {
      await fileBrowser.handleDeleteItem(path);
      largeFiles.removeFile(path);
    } else if (scan.mode === "empty_folders") {
      await fileBrowser.handleDeleteItem(path);
      emptyFolders.removeFolder(path);
    } else if (scan.mode === "old_files") {
      await fileBrowser.handleDeleteItem(path);
      oldFiles.removeFile(path);
    } else {
      await fileBrowser.handleDeleteItem(path);
    }
  }, [fileBrowser, scan, largeFiles, emptyFolders, oldFiles]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        fileBrowser.handleGoUp();
      }
      if (e.key === "Escape") {
        if (fileBrowser.preview) {
          fileBrowser.setPreview(null);
        } else if (scan.mode !== "browse") {
          scan.setMode("browse");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fileBrowser.currentPath, fileBrowser.preview, scan.mode]);

  // Drag handlers
  const handleDragOver = (e: DragEvent): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (): void => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent): void => {
    e.preventDefault();
    setIsDragging(false);
    const items = e.dataTransfer.files;
    if (items.length > 0) {
      const path = (items[0] as File & { path?: string }).path;
      if (path) fileBrowser.loadDirectory(path);
    }
  };

  return (
    <ErrorBoundary>
      <div
        className="h-screen bg-[#0a0a0a] flex flex-col font-sans p-4 gap-3 relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-50 bg-indigo-500/10 border-2 border-dashed border-indigo-500 flex items-center justify-center flex-col gap-4 text-indigo-400 pointer-events-none">
            <FolderOpen size={48} />
            <span className="text-sm font-medium">フォルダをドロップして開く</span>
          </div>
        )}

        {/* Header */}
        <Header
          mode={scan.mode}
          scanning={scan.scanning}
          duplicatesCount={scan.duplicates.length}
          loading={fileBrowser.loading}
          onSelectFolder={fileBrowser.handleSelectFolder}
          onScanDuplicates={scan.handleScanDuplicates}
          onCancelScan={scan.handleCancelScan}
          onExportJson={scan.handleExportJson}
          onExportCsv={scan.handleExportCsv}
          onBulkDelete={scan.handleBulkDelete}
          onCloseMode={() => scan.setMode("browse")}
          onScanLargeFiles={() => {
            scan.setMode("large_files");
            largeFiles.handleScanLargeFiles();
          }}
          onScanEmptyFolders={() => {
            scan.setMode("empty_folders");
            emptyFolders.handleScanEmptyFolders();
          }}
          onScanFileTypes={() => {
            scan.setMode("file_types");
            fileTypes.handleAnalyzeFileTypes();
          }}
          onScanDiskUsage={() => {
            scan.setMode("disk_usage");
            diskUsage.handleAnalyzeDiskUsage();
          }}
          onScanTempFiles={() => {
            scan.setMode("temp_cleaner");
            tempCleaner.handleScan();
          }}
          onScanOldFiles={() => {
            scan.setMode("old_files");
            oldFiles.handleScanOldFiles();
          }}
        />

        {/* Toolbar */}
        <Toolbar
          breadcrumbs={fileBrowser.breadcrumbs}
          mode={scan.mode}
          sortKey={fileBrowser.sortKey}
          sortDir={fileBrowser.sortDir}
          onNavigate={fileBrowser.loadDirectory}
          onGoUp={fileBrowser.handleGoUp}
          onToggleSort={fileBrowser.toggleSort}
        />

        {/* Main content */}
        {scan.mode === "browse" ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <QuickActions actions={quickActions} disabled={fileBrowser.loading} />
            <BrowseView
              sortedNodes={fileBrowser.sortedNodes}
              loading={fileBrowser.loading}
              listHeight={fileBrowser.listHeight}
              listContainerRef={fileBrowser.listContainerRef}
              onNavigate={fileBrowser.loadDirectory}
              onPreview={fileBrowser.handlePreview}
              onDelete={handleDeleteItem}
            />
          </div>
        ) : scan.mode === "duplicates" ? (
          <DuplicatesView
            duplicates={scan.duplicates}
            scanning={scan.scanning}
            scanProgress={scan.scanProgress}
            totalSaveable={scan.totalSaveable}
            onPreview={fileBrowser.handlePreview}
            onDelete={handleDeleteItem}
          />
        ) : scan.mode === "large_files" ? (
          <LargeFilesView
            largeFiles={largeFiles.largeFiles}
            scanning={largeFiles.scanning}
            scanProgress={largeFiles.scanProgress}
            totalSize={largeFiles.totalSize}
            onPreview={fileBrowser.handlePreview}
            onDelete={handleDeleteItem}
          />
        ) : scan.mode === "empty_folders" ? (
          <EmptyFoldersView
            emptyFolders={emptyFolders.emptyFolders}
            scanning={emptyFolders.scanning}
            scanProgress={emptyFolders.scanProgress}
            onDelete={handleDeleteItem}
            onDeleteAll={emptyFolders.handleDeleteAll}
          />
        ) : scan.mode === "old_files" ? (
          <OldFilesView
            oldFiles={oldFiles.oldFiles}
            scanning={oldFiles.scanning}
            scanProgress={oldFiles.scanProgress}
            totalSize={oldFiles.totalSize}
            onPreview={fileBrowser.handlePreview}
            onDelete={handleDeleteItem}
          />
        ) : scan.mode === "file_types" ? (
          <FileTypesView
            analysis={fileTypes.analysis}
            scanning={fileTypes.scanning}
            scanProgress={fileTypes.scanProgress}
          />
        ) : scan.mode === "disk_usage" ? (
          <DiskUsageView
            currentFolder={diskUsage.currentFolder}
            scanning={diskUsage.scanning}
            scanProgress={diskUsage.scanProgress}
            breadcrumbs={diskUsage.breadcrumbs}
            onDrillDown={diskUsage.drillDown}
            onNavigateUp={diskUsage.navigateUp}
          />
        ) : scan.mode === "temp_cleaner" ? (
          <TempCleanerView
            scanResult={tempCleaner.scanResult}
            scanning={tempCleaner.scanning}
            scanProgress={tempCleaner.scanProgress}
            cleaning={tempCleaner.cleaning}
            onCleanAll={tempCleaner.handleCleanAll}
            onCleanCategory={tempCleaner.handleCleanCategory}
          />
        ) : null}

        {/* Status bar */}
        <StatusBar
          mode={scan.mode}
          folderCount={folderCount}
          fileCount={fileCount}
          totalSize={totalSize}
          duplicatesGroupCount={scan.duplicates.length}
          duplicatesFileCount={scan.duplicates.reduce((acc, g) => acc + g.paths.length, 0)}
          totalSaveable={scan.totalSaveable}
          largeFilesCount={largeFiles.largeFiles.length}
          largeFilesTotalSize={largeFiles.totalSize}
          emptyFoldersCount={emptyFolders.emptyFolders.length}
          oldFilesCount={oldFiles.oldFiles.length}
          oldFilesTotalSize={oldFiles.totalSize}
          fileTypesTotal={fileTypes.analysis?.total_files ?? 0}
          fileTypesCategoryCount={fileTypes.analysis?.categories.length ?? 0}
          diskUsageFileCount={diskUsage.currentFolder?.file_count ?? 0}
          diskUsageTotalSize={diskUsage.currentFolder?.size ?? 0}
          tempFilesCount={tempCleaner.scanResult?.total_files ?? 0}
          tempFilesTotalSize={tempCleaner.scanResult?.total_size ?? 0}
        />

        {/* Preview modal */}
        {fileBrowser.preview && (
          <PreviewModal
            preview={fileBrowser.preview}
            previewPath={fileBrowser.previewPath}
            onClose={() => fileBrowser.setPreview(null)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
