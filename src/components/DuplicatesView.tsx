// ==========================================
// Duplicates View Component
// ==========================================

import type { ReactElement } from "react";
import { Eye, Trash2 } from "lucide-react";

import { formatSize } from "../lib/utils";
import type { DuplicateGroup, ScanProgress } from "../types";

interface DuplicatesViewProps {
  duplicates: DuplicateGroup[];
  scanning: boolean;
  scanProgress: ScanProgress | null;
  totalSaveable: number;
  onPreview: (path: string) => void;
  onDelete: (path: string, hash: string) => void;
}

export function DuplicatesView({
  duplicates,
  scanning,
  scanProgress,
  totalSaveable,
  onPreview,
  onDelete,
}: DuplicatesViewProps): ReactElement {
  return (
    <div className="space-y-2">
      {/* Scan progress (shown while scanning) */}
      {scanning && scanProgress && (
        <div className="flex items-center gap-3 p-4 border-b border-primary/10">
          <div className="animate-spin h-5 w-5 border-2 border-white/10 border-t-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-primary text-[13px] truncate font-mono tracking-widest uppercase">
              {scanProgress.phase}
            </p>
            <p className="text-[11px] text-white/40">
              {scanProgress.scanned_files.toLocaleString()} ファイル確認済
            </p>
          </div>
        </div>
      )}

      {/* Summary banner */}
      {duplicates.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 hud-bracket p-4 mx-3 mt-3 flex justify-between items-center">
          <span className="text-white/90 text-sm">
            {duplicates.length} グループ の重複を検出
          </span>
          <div className="text-right">
            <div className="text-2xl font-semibold text-primary">
              {formatSize(totalSaveable)}
            </div>
            <div className="text-xs text-white/40">節約可能</div>
          </div>
        </div>
      )}

      {/* Scanning helper text */}
      {scanning && duplicates.length > 0 && (
        <p className="text-center text-xs text-white/40 py-3">
          スキャン中... 現在 {duplicates.length} グループ発見（節約可能:{" "}
          {formatSize(totalSaveable)}）
        </p>
      )}

      {/* Duplicate groups */}
      {!scanning && duplicates.length === 0 ? (
        <div className="text-center text-white/40 mt-10">
          重複ファイルは見つかりませんでした（1MB以上）
        </div>
      ) : (
        duplicates.map((group) => (
          <div
            key={group.hash}
            className="bg-black border-l-2 border-primary border border-white/5 overflow-hidden mx-3"
          >
            <div className="flex justify-between items-center px-3 py-2.5 border-b border-white/5">
              <span className="text-[13px] text-primary">
                無駄にしている容量:{" "}
                {formatSize(group.size * (group.paths.length - 1))}
              </span>
              <span className="text-xs text-white/40 font-mono">
                Size: {formatSize(group.size)}
              </span>
            </div>
            <div className="bg-black">
              {group.paths.map((p, idx) => (
                <div
                  key={p}
                  className="group flex justify-between items-center px-3 py-2 border-b border-white/5 last:border-b-0 hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-center flex-1 min-w-0 mr-3">
                    {idx === 0 ? (
                      <span className="bg-secondary text-black text-[10px] px-1.5 py-0.5 font-medium shrink-0 mr-2">
                        KEEP
                      </span>
                    ) : (
                      <span className="w-12 shrink-0" />
                    )}
                    <span className="text-[11px] text-white/40 font-mono truncate">
                      {p}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      type="button"
                      title="プレビュー"
                      onClick={() => onPreview(p)}
                      className="p-1.5 text-white/30 hover:text-primary transition-colors"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      type="button"
                      title="削除"
                      onClick={() => onDelete(p, group.hash)}
                      className="p-1.5 text-white/30 hover:text-error transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
