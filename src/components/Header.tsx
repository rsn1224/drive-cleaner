// ==========================================
// Header Component
// ==========================================

import {
    BarChart3,
    Clock,
    Download,
    FolderOpen,
    HardDrive,
    PieChart,
    Search,
    StopCircle,
    Trash,
    Trash2,
    X
} from "lucide-react";

import type { AppMode } from "../types";

interface HeaderProps {
  mode: AppMode;
  scanning: boolean;
  duplicatesCount: number;
  loading: boolean;
  onSelectFolder: () => void;
  onScanDuplicates: () => void;
  onCancelScan: () => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  onBulkDelete: () => void;
  onCloseMode: () => void;
  onScanLargeFiles: () => void;
  onScanEmptyFolders: () => void;
  onScanOldFiles: () => void;
  onScanFileTypes: () => void;
  onScanDiskUsage: () => void;
  onScanTempFiles: () => void;
}

export function Header({
  mode,
  scanning,
  duplicatesCount,
  loading,
  onSelectFolder,
  onScanDuplicates,
  onCancelScan,
  onExportJson,
  onExportCsv,
  onBulkDelete,
  onCloseMode,
  onScanLargeFiles,
  onScanEmptyFolders,
  onScanOldFiles,
  onScanFileTypes,
  onScanDiskUsage,
  onScanTempFiles,
}: HeaderProps) {
  return (
    <div className="flex justify-between items-center bg-[#111827] p-3 rounded-lg border border-[#1f2937]">
      <h1 className="text-lg font-bold text-white tracking-wide">
        Drive Cleaner
      </h1>
      <div className="flex gap-2">
        {mode !== "browse" && mode !== "duplicates" ? (
          <button
            type="button"
            onClick={onCloseMode}
            className="flex items-center gap-1.5 text-[#9ca3af] hover:text-white px-3 py-2 rounded-md text-[13px] border border-[#4b5563] transition-colors"
          >
            <X size={14} /> 閉じる
          </button>
        ) : mode === "duplicates" ? (
          <>
            {scanning ? (
              <button
                type="button"
                onClick={onCancelScan}
                className="bg-[#f87171] hover:bg-red-500 border border-[#f87171] text-white px-3 py-2 rounded-md text-[13px] flex items-center gap-1.5 transition-colors"
              >
                <StopCircle size={16} /> スキャン中止
              </button>
            ) : (
              <>
                {duplicatesCount > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={onExportJson}
                      className="flex items-center gap-1.5 text-[#9ca3af] hover:text-white px-3 py-2 rounded-md text-[13px] border border-[#4b5563] transition-colors"
                    >
                      <Download size={14} /> JSON
                    </button>
                    <button
                      type="button"
                      onClick={onExportCsv}
                      className="flex items-center gap-1.5 text-[#9ca3af] hover:text-white px-3 py-2 rounded-md text-[13px] border border-[#4b5563] transition-colors"
                    >
                      <Download size={14} /> CSV
                    </button>
                    <button
                      type="button"
                      onClick={onBulkDelete}
                      className="flex items-center gap-1.5 bg-[#f87171] border border-[#f87171] text-white px-3 py-2 rounded-md text-[13px] transition-colors"
                    >
                      <Trash2 size={14} /> 一括削除
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={onCloseMode}
                  className="flex items-center gap-1.5 text-[#9ca3af] hover:text-white px-3 py-2 rounded-md text-[13px] border border-[#4b5563] transition-colors"
                >
                  <X size={14} /> 閉じる
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onSelectFolder}
              className="bg-[#374151] hover:bg-[#4b5563] border border-[#4b5563] text-white px-3 py-2 rounded-md text-[13px] transition-colors"
            >
              フォルダ選択
            </button>
            <button
              type="button"
              onClick={onScanLargeFiles}
              disabled={loading}
              className="bg-[#22c55e] hover:bg-green-500 disabled:bg-green-900 disabled:text-green-400 border border-[#22c55e] text-white px-3 py-2 rounded-md text-[13px] flex items-center gap-1.5 transition-colors"
            >
              <HardDrive size={16} /> 大容量スキャン
            </button>
            <button
              type="button"
              onClick={onScanEmptyFolders}
              disabled={loading}
              className="bg-[#f59e0b] hover:bg-amber-500 disabled:bg-amber-900 disabled:text-amber-400 border border-[#f59e0b] text-white px-3 py-2 rounded-md text-[13px] flex items-center gap-1.5 transition-colors"
            >
              <FolderOpen size={16} /> 空フォルダ
            </button>
            <button
              type="button"
              onClick={onScanTempFiles}
              disabled={loading}
              className="bg-[#f97316] hover:bg-orange-500 disabled:bg-orange-900 disabled:text-orange-400 border border-[#f97316] text-white px-3 py-2 rounded-md text-[13px] flex items-center gap-1.5 transition-colors"
            >
              <Trash size={16} /> 一時クリーン
            </button>
            <button
              type="button"
              onClick={onScanDiskUsage}
              disabled={loading}
              className="bg-[#06b6d4] hover:bg-cyan-500 disabled:bg-cyan-900 disabled:text-cyan-400 border border-[#06b6d4] text-white px-3 py-2 rounded-md text-[13px] flex items-center gap-1.5 transition-colors"
            >
              <PieChart size={16} /> ディスク使用量
            </button>
            <button
              type="button"
              onClick={onScanFileTypes}
              disabled={loading}
              className="bg-[#8b5cf6] hover:bg-violet-500 disabled:bg-violet-900 disabled:text-violet-400 border border-[#8b5cf6] text-white px-3 py-2 rounded-md text-[13px] flex items-center gap-1.5 transition-colors"
            >
              <BarChart3 size={16} /> 種別分析
            </button>
            <button
              type="button"
              onClick={onScanOldFiles}
              disabled={loading}
              className="bg-[#ef4444] hover:bg-red-500 disabled:bg-red-900 disabled:text-red-400 border border-[#ef4444] text-white px-3 py-2 rounded-md text-[13px] flex items-center gap-1.5 transition-colors"
            >
              <Clock size={16} /> 古いファイル
            </button>
            <button
              type="button"
              onClick={onScanDuplicates}
              disabled={loading}
              className="bg-[#6366f1] hover:bg-indigo-500 disabled:bg-indigo-900 disabled:text-indigo-400 border border-[#6366f1] text-white px-3 py-2 rounded-md text-[13px] flex items-center gap-1.5 transition-colors"
            >
              <Search size={16} /> 重複スキャン
            </button>
          </>
        )}
      </div>
    </div>
  );
}
