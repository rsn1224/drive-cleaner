// ==========================================
// Main App Component - Drive Cleaner
// ==========================================

import type { ReactElement } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { MainContent } from "./components/MainContent";
import { PreviewModal } from "./components/PreviewModal";
import { QuickActions } from "./components/QuickActions";
import { StatusBar } from "./components/StatusBar";
import { Toolbar } from "./components/Toolbar";
import { BottomNav } from "./components/layout/BottomNav";
import { HudHeader } from "./components/layout/HudHeader";
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

  const [activeTab, setActiveTab] = useState<"dashboard" | "files" | "settings" | "logs">("dashboard");

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

  return (
    <ErrorBoundary>
      <div className="h-screen bg-black flex flex-col relative overflow-hidden">
        {/* Scanline overlay */}
        <div className="scanline-overlay" />

        {/* HUD Header */}
        <HudHeader
          mode={scan.mode}
          onBack={() => scan.setMode("browse")}
        />

        {/* Main content - pt-14 for header, pb-16 for bottom nav */}
        <main className={`flex-1 overflow-auto ${scan.mode === "browse" ? "pt-14 pb-16" : "pt-14"}`}>
          {scan.mode === "browse" ? (
            // Tab content
            activeTab === "dashboard" ? (
              <div className="p-4">
                <QuickActions actions={quickActions} disabled={fileBrowser.loading} />
              </div>
            ) : activeTab === "files" ? (
              <div className="flex flex-col h-full">
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

                  onDelete={handleDeleteItem}
                />
              </div>
            ) : (
              <div className="p-4 text-center text-white/40 hud-label pt-20">
                {activeTab === "settings" ? "CONFIG_MODULE // COMING_SOON" : "LOG_VIEWER // COMING_SOON"}
              </div>
            )
          ) : (
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
              onDelete={handleDeleteItem}
            />
          )}
        </main>

        {/* Status bar - fixed positioning */}
        <div className={scan.mode === "browse" ? "fixed bottom-16 w-full z-40" : "fixed bottom-0 w-full z-40"}>
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
        </div>

        {/* Bottom Nav */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hidden={scan.mode !== "browse"}
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
