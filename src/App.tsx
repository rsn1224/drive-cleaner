// ==========================================
// Main App Component - Drive Cleaner
// ==========================================

import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';

import { DriveOverview } from './components/DriveOverview';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BottomNav } from './components/layout/BottomNav';
import { HudHeader } from './components/layout/HudHeader';
import { MainContent } from './components/MainContent';
import { PreviewModal } from './components/PreviewModal';
import { QuickActions } from './components/QuickActions';
import { StatusBar } from './components/StatusBar';
import { Toolbar } from './components/Toolbar';
import { useAppInteractions } from './hooks/useAppInteractions';
import { useDiskUsage } from './hooks/useDiskUsage';
import { useEmptyFolders } from './hooks/useEmptyFolders';
import { useFileBrowser } from './hooks/useFileBrowser';
import { useFileTypes } from './hooks/useFileTypes';
import { useLargeFiles } from './hooks/useLargeFiles';
import { useOldFiles } from './hooks/useOldFiles';
import { useScan } from './hooks/useScan';
import { useScanActions } from './hooks/useScanActions';
import { useSimilarImages } from './hooks/useSimilarImages';
import { useTempCleaner } from './hooks/useTempCleaner';
import { messages } from './i18n/messages';
import { buildQuickActions } from './lib/quickActions';

export function App(): ReactElement {
  const fileBrowser = useFileBrowser();
  const scan = useScan(fileBrowser.currentPath);
  const largeFiles = useLargeFiles(fileBrowser.currentPath);
  const emptyFolders = useEmptyFolders(fileBrowser.currentPath);
  const oldFiles = useOldFiles(fileBrowser.currentPath);
  const fileTypes = useFileTypes(fileBrowser.currentPath);
  const diskUsage = useDiskUsage(fileBrowser.currentPath);
  const tempCleaner = useTempCleaner();
  const similarImages = useSimilarImages(fileBrowser.currentPath);

  const scanActions = useScanActions({
    setMode: scan.setMode,
    handleScanDuplicates: scan.handleScanDuplicates,
    handleScanLargeFiles: largeFiles.handleScanLargeFiles,
    handleScanEmptyFolders: emptyFolders.handleScanEmptyFolders,
    handleScanOldFiles: oldFiles.handleScanOldFiles,
    handleAnalyzeFileTypes: fileTypes.handleAnalyzeFileTypes,
    handleAnalyzeDiskUsage: diskUsage.handleAnalyzeDiskUsage,
    handleScanTempFiles: tempCleaner.handleScan,
    handleScanSimilarImages: similarImages.handleScan,
  });

  const quickActions = useMemo(() => buildQuickActions(scanActions), [scanActions]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'files' | 'settings' | 'logs'>(
    'dashboard',
  );

  const { isDragging, handleDeleteItem, handleDragOver, handleDragLeave, handleDrop } =
    useAppInteractions({ fileBrowser, scan, largeFiles, emptyFolders, oldFiles, similarImages });

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

  return (
    <ErrorBoundary>
      <div
        className="h-screen h-dvh bg-black flex flex-col relative overflow-hidden"
        role="application"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag overlay */}
        {isDragging && (
          <div className="fixed inset-0 z-40 bg-primary/5 border-2 border-dashed border-primary flex items-center justify-center flex-col gap-4 text-primary pointer-events-none">
            <span className="material-symbols-outlined text-5xl">folder_open</span>
            <span className="hud-label">{messages.dropToScan}</span>
          </div>
        )}

        {/* Scanline overlay */}
        <div className="scanline-overlay" />

        {/* HUD Header */}
        <HudHeader mode={scan.mode} onBack={() => scan.setMode('browse')} />

        {/* Main content - 上: ヘッダー(+セーフエリア) / 下: ステータスバー + ボトムナビ(+セーフエリア) */}
        <main
          className={`flex-1 flex flex-col overflow-auto safe-x ${
            scan.mode === 'browse' ? 'main-offset-browse' : 'main-offset-scan'
          }`}
        >
          {scan.mode === 'browse' ? (
            activeTab === 'dashboard' ? (
              <div className="p-4 space-y-4">
                <DriveOverview />
                <QuickActions actions={quickActions} disabled={fileBrowser.loading} />
              </div>
            ) : activeTab === 'files' ? (
              <div className="flex flex-col flex-1 min-h-0">
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
                  similarImages={similarImages}
                  onDelete={handleDeleteItem}
                />
              </div>
            ) : (
              <div className="p-4 text-center text-white/40 hud-label pt-20">
                {activeTab === 'settings'
                  ? `${messages.configModule} // ${messages.comingSoon}`
                  : `${messages.logViewer} // ${messages.comingSoon}`}
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
              similarImages={similarImages}
              onDelete={handleDeleteItem}
            />
          )}
        </main>

        {/* Status bar */}
        <div
          className={
            scan.mode === 'browse'
              ? 'fixed bottom-nav-offset w-full z-40'
              : 'fixed bottom-0 w-full z-40 safe-bottom bg-black/95'
          }
        >
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
            similarImagesGroupCount={similarImages.groups.length}
          />
        </div>

        {/* Bottom Nav */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hidden={scan.mode !== 'browse'}
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
