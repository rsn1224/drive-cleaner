// ==========================================
// Old Files View Component
// ==========================================

import { Clock, Eye, Trash2 } from "lucide-react";
import type { ReactElement } from "react";

import { formatDate, formatSize } from "../lib/utils";
import type { OldFile, ScanProgress } from "../types";

interface OldFilesViewProps {
  oldFiles: OldFile[];
  scanning: boolean;
  scanProgress: ScanProgress | null;
  totalSize: number;
  onPreview: (path: string) => void;
  onDelete: (path: string) => void;
}

export function OldFilesView({
  oldFiles,
  scanning,
  scanProgress,
  totalSize,
  onPreview,
  onDelete,
}: OldFilesViewProps): ReactElement {
  if (scanning) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-white/10 border-t-error mx-auto mb-4"></div>
          <div className="text-error text-lg mb-2 font-mono tracking-widest uppercase">
            {scanProgress?.phase || "スキャン中..."}
          </div>
          <div className="text-white/40 text-sm">
            {scanProgress?.scanned_files || 0} ファイル処理済み
          </div>
        </div>
      </div>
    );
  }

  if (oldFiles.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-white/40">
          <Clock size={48} className="mx-auto mb-4 opacity-50" />
          <div className="text-lg">1年以上未更新のファイルは見つかりませんでした</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Summary banner */}
      <div className="bg-error/5 border border-error/20 hud-bracket p-4 mb-4 flex justify-between items-center">
        <div className="text-error font-medium">
          {oldFiles.length} 個の古いファイル（1年以上未更新）
        </div>
        <div className="text-error">
          合計: {formatSize(totalSize)}
        </div>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-auto space-y-2">
        {oldFiles.map((file) => (
          <div
            key={file.path}
            className="bg-black border border-white/5 border-l-2 border-l-error p-3 flex items-center justify-between group hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Clock size={20} className="text-error flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-white/90 font-medium truncate">
                  {file.name}
                </div>
                <div className="text-[11px] text-white/40 font-mono truncate">
                  {file.path}
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-error font-mono text-sm">
                    {file.days_old}日前
                  </span>
                  <span className="text-white/30 text-[11px]">
                    {formatDate(file.modified_at)}
                  </span>
                  <span className="text-white/50 font-mono text-sm">
                    {formatSize(file.size)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => onPreview(file.path)}
                className="text-white/30 hover:text-primary transition-colors"
              >
                <Eye size={16} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(file.path)}
                className="text-white/30 hover:text-error transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
