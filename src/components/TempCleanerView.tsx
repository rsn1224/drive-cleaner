// ==========================================
// Temp Cleaner View Component
// ==========================================

import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import type { ReactElement } from "react";
import { useState } from "react";

import { formatSize } from "../lib/utils";
import type { ScanProgress, TempScanResult } from "../types";

interface TempCleanerViewProps {
  scanResult: TempScanResult | null;
  scanning: boolean;
  scanProgress: ScanProgress | null;
  cleaning: boolean;
  onCleanAll: () => void;
  onCleanCategory: (categoryName: string) => void;
}

export function TempCleanerView({
  scanResult,
  scanning,
  scanProgress,
  cleaning,
  onCleanAll,
  onCleanCategory,
}: TempCleanerViewProps): ReactElement {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  if (scanning) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#374151] border-t-[#f97316] mx-auto mb-4"></div>
          <div className="text-white text-lg mb-2">
            {scanProgress?.phase || "スキャン中..."}
          </div>
          {scanProgress && scanProgress.scanned_files > 0 && (
            <div className="text-[#6b7280] text-sm">
              {scanProgress.scanned_files} ファイル処理済み
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!scanResult || scanResult.categories.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-[#6b7280]">
          <Trash2 size={48} className="mx-auto mb-4 opacity-50" />
          <div className="text-lg">一時ファイルは見つかりませんでした</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Summary banner */}
      <div className="bg-[#f97316]/10 border border-[#f97316]/30 rounded-lg p-4 mb-4 flex justify-between items-center">
        <div className="text-[#f97316] font-medium">
          {scanResult.total_files} 一時ファイル
        </div>
        <div className="text-[#f97316]">
          合計: {formatSize(scanResult.total_size)}
        </div>
        <button
          type="button"
          onClick={onCleanAll}
          disabled={cleaning}
          className="bg-[#f87171] hover:bg-red-500 disabled:bg-red-900 disabled:text-red-400 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-colors"
        >
          {cleaning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              クリーン中...
            </>
          ) : (
            <>
              <Trash2 size={16} />
              すべてクリーン
            </>
          )}
        </button>
      </div>

      {/* Category list */}
      <div className="flex-1 overflow-auto space-y-3">
        {scanResult.categories.map((category) => {
          const isExpanded = expandedCategories.has(category.name);
          
          return (
            <div
              key={category.name}
              className="bg-[#030712] border border-[#1f2937] rounded-lg p-4"
            >
              {/* Category header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.name)}
                    className="text-[#6b7280] hover:text-[#d1d5db] transition-colors"
                  >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  <Trash2 size={20} className="text-[#f97316]" />
                  <div>
                    <div className="text-[#d1d5db] font-medium">
                      {category.name}
                    </div>
                    <div className="text-[11px] text-[#6b7280] font-mono">
                      {category.path}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[#6b7280] text-sm">
                      {category.file_count} ファイル
                    </div>
                    <div className="text-[#f97316] font-mono text-sm">
                      {formatSize(category.total_size)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onCleanCategory(category.name)}
                    disabled={cleaning}
                    className="border border-[#4b5563] hover:border-[#f97316] disabled:border-gray-600 text-[#6b7280] hover:text-[#f97316] disabled:text-gray-500 px-3 py-1 rounded text-sm transition-colors"
                  >
                    {cleaning ? "処理中..." : "クリーン"}
                  </button>
                </div>
              </div>

              {/* Expanded items */}
              {isExpanded && (
                <div className="border-t border-[#1f2937] pt-3">
                  <div className="text-[11px] text-[#6b7280] mb-2">
                    ファイル一覧 ({category.items.length})
                  </div>
                  <div className="space-y-1 max-h-32 overflow-auto">
                    {category.items.map((item) => (
                      <div
                        key={item.path}
                        className="flex justify-between items-center text-[11px] text-[#6b7280] hover:bg-[#1f2937] px-2 py-1 rounded"
                      >
                        <span className="truncate flex-1 mr-2">{item.name}</span>
                        <span className="font-mono text-[#9ca3af]">
                          {formatSize(item.size)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
