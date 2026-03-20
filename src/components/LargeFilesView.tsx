// ==========================================
// Large Files View Component
// ==========================================

import { Eye, FileIcon, Trash2 } from "lucide-react";

import { formatSize } from "../lib/utils";
import type { LargeFile, ScanProgress } from "../types";

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
          <div className="inline-block animate-spin h-8 w-8 border-2 border-white/10 border-t-primary mb-4"></div>
          <p className="text-primary mb-2 font-mono tracking-widest uppercase">
            {scanProgress?.phase || "スキャン中..."}
          </p>
          <p className="text-white/40 text-sm">
            {scanProgress?.scanned_files || 0} ファイル処理済み
          </p>
        </div>
      </div>
    );
  }

  if (largeFiles.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-white/40">
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
      <div className="bg-primary/5 border border-primary/20 hud-bracket px-4 py-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-white/90 font-medium">
            {largeFiles.length} 個の大容量ファイル
          </span>
          <span className="text-primary font-mono">
            合計: {formatSize(totalSize)}
          </span>
        </div>
      </div>

      {/* File List */}
      <div className="space-y-2">
        {largeFiles.map((file, index) => (
          <div
            key={file.path}
            className="bg-black border border-white/5 p-3 hover:border-primary/40 transition-colors group hud-bracket"
          >
            <div className="flex items-center gap-3">
              {/* Rank */}
              <span className="text-white/30 text-sm font-mono w-8">
                #{index + 1}
              </span>

              {/* File Icon */}
              <FileIcon size={16} className="text-white/30 flex-shrink-0" />

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="text-white/90 text-sm font-medium truncate">
                  {file.name}
                </div>
                <div className="text-[11px] text-white/40 font-mono truncate">
                  {file.path}
                </div>
              </div>

              {/* Size */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-primary font-mono text-sm">
                  {formatSize(file.size)}
                </span>
                {/* Size Bar */}
                <div className="w-16 h-1.5 bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-primary shadow-[0_0_12px_rgba(0,240,255,0.6)] transition-all"
                    style={{ width: `${(file.size / maxSize) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => onPreview(file.path)}
                  className="p-1.5 text-white/30 hover:text-primary transition-colors"
                  title="プレビュー"
                >
                  <Eye size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(file.path)}
                  className="p-1.5 text-white/30 hover:text-error transition-colors"
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
