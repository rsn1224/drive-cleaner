// ==========================================
// Large Files View Component
// ==========================================

import { Eye, FileIcon, Trash2 } from "lucide-react";

import type { LargeFile, ScanProgress } from "../types";
import { formatSize } from "../lib/utils";

interface LargeFilesViewProps {
  largeFiles: LargeFile[];
  scanning: boolean;
  scanProgress: ScanProgress | null;
  totalSize: number;
  onPreview: (path: string) => void;
  onDelete: (path: string) => void;
}

export function LargeFilesView({
  largeFiles,
  scanning,
  scanProgress,
  totalSize,
  onPreview,
  onDelete,
}: LargeFilesViewProps) {
  if (scanning) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
          <p className="text-white mb-2">
            {scanProgress?.phase || "スキャン中..."}
          </p>
          <p className="text-[#6b7280] text-sm">
            {scanProgress?.scanned_files || 0} ファイル処理済み
          </p>
        </div>
      </div>
    );
  }

  if (largeFiles.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-[#6b7280]">
          <FileIcon size={48} className="mx-auto mb-4 opacity-50" />
          <p>大容量ファイルは見つかりませんでした</p>
          <p className="text-sm mt-2">（1 MB 以上）</p>
        </div>
      </div>
    );
  }

  const maxSize = largeFiles[0]?.size || 1;

  return (
    <div className="flex-1 overflow-auto p-3">
      {/* Summary Banner */}
      <div className="bg-[#6366f1]/10 border border-[#6366f1]/30 rounded-lg px-4 py-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-[#d1d5db] font-medium">
            {largeFiles.length} 個の大容量ファイル
          </span>
          <span className="text-[#818cf8] font-mono">
            合計: {formatSize(totalSize)}
          </span>
        </div>
      </div>

      {/* File List */}
      <div className="space-y-2">
        {largeFiles.map((file, index) => (
          <div
            key={file.path}
            className="bg-[#030712] border border-[#1f2937] rounded-lg p-3 hover:bg-[#1f2937]/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              {/* Rank */}
              <span className="text-[#6b7280] text-sm font-mono w-8">
                #{index + 1}
              </span>

              {/* File Icon */}
              <FileIcon size={16} className="text-[#6b7280] flex-shrink-0" />

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="text-[#d1d5db] text-sm font-medium truncate">
                  {file.name}
                </div>
                <div className="text-[11px] text-[#6b7280] font-mono truncate">
                  {file.path}
                </div>
              </div>

              {/* Size */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[#818cf8] font-mono text-sm">
                  {formatSize(file.size)}
                </span>
                {/* Size Bar */}
                <div className="w-16 h-2 bg-[#1f2937] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#6366f1] transition-all"
                    style={{ width: `${(file.size / maxSize) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => onPreview(file.path)}
                  className="p-1.5 text-[#6b7280] hover:text-white hover:bg-[#374151]/50 rounded transition-colors"
                  title="プレビュー"
                >
                  <Eye size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(file.path)}
                  className="p-1.5 text-[#6b7280] hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                  title="削除"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
