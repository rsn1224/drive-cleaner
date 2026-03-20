// ==========================================
// Main App Component - Drive Cleaner
// ==========================================

import type { DragEvent, ReactElement } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FolderOpen } from "lucide-react";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { Header } from "./components/Header";
import { MainContent } from "./components/MainContent";
import { PreviewModal } from "./components/PreviewModal";
import { StatusBar } from "./components/StatusBar";
import { Toolbar } from "./components/Toolbar";
import { useDiskUsage } from "./hooks/useDiskUsage";
import { useEmptyFolders } from "./hooks/useEmptyFolders";
import { useFileBrowser } from "./hooks/useFileBrowser";
import { useFileTypes } from "./hooks/useFileTypes";
import { useLargeFiles } from "./hooks/useLargeFiles";
import { useOldFiles } from "./hooks/useOldFiles";
import { useScan } from "./hooks/useScan";
import { useScanActions } from "./hooks/useScanActions";
import { useTempCleaner } from "./hooks/useTempCleaner";
import { buildQuickActions } from "./lib/quickActions";

function App(): ReactElement {
  const fileBrowser = useFileBrowser();
  const scan = useScan(fileBrowser.currentPath);
  const largeFiles = useLargeFiles(fileBrowser.currentPath);
  const emptyFolders = useEmptyFolders(fileBrowser.currentPath);
  const oldFiles = useOldFiles(fileBrowser.currentPath);
  const fileTypes = useFileTypes(fileBrowser.currentPath);
  const diskUsage = useDiskUsage(fileBrowser.currentPath);
  const tempCleaner = useTempCleaner();

  const scanActions = useScanActions({
    setMode: scan.setMode,
    handleScanDuplicates: scan.handleScanDuplicates,
    handleScanLargeFiles: largeFiles.handleScanLargeFiles,
    handleScanEmptyFolders: emptyFolders.handleScanEmptyFolders,
    handleScanOldFiles: oldFiles.handleScanOldFiles,
    handleAnalyzeFileTypes: fileTypes.handleAnalyzeFileTypes,
    handleAnalyzeDiskUsage: diskUsage.handleAnalyzeDiskUsage,
    handleScanTempFiles: tempCleaner.handleScan,
  });

  const quickActions = useMemo(
    () => buildQuickActions(scanActions),
    [scanActions],
  );

  const [isDragging, setIsDragging] = useState(false);

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

  const handleDeleteItem = useCallback(
    async (path: string, hash?: string) => {
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
    },
    [fileBrowser, scan, largeFiles, emptyFolders, oldFiles],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

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
  }, [
    fileBrowser.currentPath,
    fileBrowser.preview,
    fileBrowser,
    scan.mode,
    scan,
  ]);

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
      if (path) {
        fileBrowser.loadDirectory(path);
      }
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
        {isDragging && (
          <div className="absolute inset-0 z-50 bg-indigo-500/10 border-2 border-dashed border-indigo-500 flex items-center justify-center flex-col gap-4 text-indigo-400 pointer-events-none">
            <FolderOpen size={48} />
            <span className="text-sm font-medium">フォルダをドロップして開く</span>
          </div>
        )}

        <Header
          mode={scan.mode}
          scanning={scan.scanning}
          duplicatesCount={scan.duplicates.length}
          loading={fileBrowser.loading}
          onSelectFolder={fileBrowser.handleSelectFolder}
          onCancelScan={scan.handleCancelScan}
          onExportJson={scan.handleExportJson}
          onExportCsv={scan.handleExportCsv}
          onBulkDelete={scan.handleBulkDelete}
          onCloseMode={() => scan.setMode("browse")}
          scanActions={scanActions}
        />

        <Toolbar
          breadcrumbs={fileBrowser.breadcrumbs}
          mode={scan.mode}
          sortKey={fileBrowser.sortKey}
          sortDir={fileBrowser.sortDir}
          onNavigate={fileBrowser.loadDirectory}
          onGoUp={fileBrowser.handleGoUp}
          onToggleSort={fileBrowser.toggleSort}
        />

        <MainContent
          mode={scan.mode}
          fileBrowser={fileBrowser}
          scan={scan}
          largeFiles={largeFiles}
          emptyFolders={emptyFolders}
          oldFiles={oldFiles}
          fileTypes={fileTypes}
          diskUsage={diskUsage}
          tempCleaner={tempCleaner}
          quickActions={quickActions}
          onDelete={handleDeleteItem}
        />

        <StatusBar
          mode={scan.mode}
          folderCount={folderCount}
          fileCount={fileCount}
          totalSize={totalSize}
          duplicatesGroupCount={scan.duplicates.length}
          duplicatesFileCount={scan.duplicates.reduce(
            (acc, g) => acc + g.paths.length,
            0,
          )}
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
