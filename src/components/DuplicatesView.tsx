// ==========================================
// Duplicates View Component
// ==========================================

import { Eye, Trash2 } from "lucide-react";

import type { DuplicateGroup, ScanProgress } from "../types";
import { formatSize } from "../lib/utils";

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
}: DuplicatesViewProps) {
  return (
    <div className="space-y-2">
      {/* Scan progress (shown while scanning) */}
      {scanning && scanProgress && (
        <div className="flex items-center gap-3 p-4 border-b border-[#1f2937]">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#1f2937] border-t-[#6366f1] shrink-0" />
          <div className="min-w-0">
            <p className="text-[#818cf8] text-[13px] truncate">
              {scanProgress.phase}
            </p>
            <p className="text-[11px] text-[#6b7280]">
              {scanProgress.scanned_files.toLocaleString()} ファイル確認済
            </p>
          </div>
        </div>
      )}

      {/* Summary banner */}
      {duplicates.length > 0 && (
        <div className="bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-lg p-4 mx-3 mt-3 flex justify-between items-center">
          <span className="text-[#d1d5db] text-sm">
            {duplicates.length} グループ の重複を検出
          </span>
          <div className="text-right">
            <div className="text-2xl font-semibold text-white">
              {formatSize(totalSaveable)}
            </div>
            <div className="text-xs text-[#6b7280]">節約可能</div>
          </div>
        </div>
      )}

      {/* Scanning helper text */}
      {scanning && duplicates.length > 0 && (
        <p className="text-center text-xs text-[#6b7280] py-3">
          スキャン中... 現在 {duplicates.length} グループ発見（節約可能:{" "}
          {formatSize(totalSaveable)}）
        </p>
      )}

      {/* Duplicate groups */}
      {!scanning && duplicates.length === 0 ? (
        <div className="text-center text-[#6b7280] mt-10">
          重複ファイルは見つかりませんでした（1MB以上）
        </div>
      ) : (
        duplicates.map((group) => (
          <div
            key={group.hash}
            className="bg-[#030712] border border-[#1f2937] rounded-lg overflow-hidden mx-3"
          >
            <div className="flex justify-between items-center px-3 py-2.5 border-b border-[#1f2937]">
              <span className="text-[13px] text-[#818cf8]">
                無駄にしている容量:{" "}
                {formatSize(group.size * (group.paths.length - 1))}
              </span>
              <span className="text-xs text-[#6b7280] font-mono">
                Size: {formatSize(group.size)}
              </span>
            </div>
            <div className="bg-[#111827]">
              {group.paths.map((p, idx) => (
                <div
                  key={p}
                  className="group flex justify-between items-center px-3 py-2 border-b border-[#1f2937] last:border-b-0 hover:bg-[#1f2937] transition-colors"
                >
                  <div className="flex items-center flex-1 min-w-0 mr-3">
                    {idx === 0 ? (
                      <span className="bg-[#22c55e] text-white text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 mr-2">
                        KEEP
                      </span>
                    ) : (
                      <span className="w-12 shrink-0" />
                    )}
                    <span className="text-[11px] text-[#9ca3af] font-mono truncate">
                      {p}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      type="button"
                      title="プレビュー"
                      onClick={() => onPreview(p)}
                      className="p-1.5 text-[#6b7280] hover:text-[#818cf8] rounded transition-colors"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      type="button"
                      title="削除"
                      onClick={() => onDelete(p, group.hash)}
                      className="p-1.5 text-[#6b7280] hover:text-[#f87171] rounded transition-colors"
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
