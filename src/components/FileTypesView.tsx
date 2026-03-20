// ==========================================
// File Types View Component
// ==========================================

import { BarChart3 } from "lucide-react";
import type { ReactElement } from "react";

import { formatSize } from "../lib/utils";
import type { FileTypeAnalysis, ScanProgress } from "../types";

const CATEGORY_COLORS: Record<string, string> = {
  "画像": "#22c55e",
  "動画": "#ef4444",
  "音楽": "#f59e0b",
  "文書": "#3b82f6",
  "アーカイブ": "#8b5cf6",
  "コード": "#06b6d4",
  "その他": "#6b7280",
};

function formatPercent(part: number, total: number): string {
  if (total === 0) return "0%";
  return `${((part / total) * 100).toFixed(1)}%`;
}

interface FileTypesViewProps {
  analysis: FileTypeAnalysis | null;
  scanning: boolean;
  scanProgress: ScanProgress | null;
}

export function FileTypesView({
  analysis,
  scanning,
  scanProgress,
}: FileTypesViewProps): ReactElement {
  if (scanning) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-white/10 border-t-[#8b5cf6] mx-auto mb-4"></div>
          <div className="text-[#8b5cf6] text-lg mb-2 font-mono tracking-widest uppercase">
            {scanProgress?.phase || "分析中..."}
          </div>
          <div className="text-white/40 text-sm">
            {scanProgress?.scanned_files || 0} ファイル処理済み
          </div>
        </div>
      </div>
    );
  }

  if (!analysis || analysis.categories.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-white/40">
          <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
          <div className="text-lg">ファイルが見つかりませんでした</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Summary banner */}
      <div className="bg-[#8b5cf6]/5 border border-[#8b5cf6]/20 hud-bracket p-4 mb-4 flex justify-between items-center">
        <div className="text-[#8b5cf6] font-medium">
          {analysis.total_files} ファイル, {analysis.categories.length} カテゴリ
        </div>
        <div className="text-[#8b5cf6]">
          合計: {formatSize(analysis.total_size)}
        </div>
      </div>

      {/* Category list */}
      <div className="flex-1 overflow-auto space-y-3">
        {analysis.categories.map((category) => {
          const color = CATEGORY_COLORS[category.category] || "#6b7280";
          const percent = formatPercent(category.total_size, analysis.total_size);
          
          return (
            <div
              key={category.category}
              className="bg-black border border-white/5 p-4"
            >
              {/* Header row */}
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-white/90 font-medium">
                    {category.category}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-white/50">
                    {category.file_count} ファイル
                  </span>
                  <span className="text-white/50 font-mono">
                    {formatSize(category.total_size)}
                  </span>
                  <span className="text-[#8b5cf6] font-mono">
                    {percent}
                  </span>
                </div>
              </div>

              {/* CSS horizontal bar */}
              <div className="w-full h-1.5 bg-white/5 overflow-hidden mb-2">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: percent,
                    backgroundColor: color,
                  }}
                />
              </div>

              {/* Extensions list */}
              {category.extensions.length > 0 && (
                <div className="text-[10px] text-white/30 font-mono">
                  {category.extensions.map((ext, i) => (
                    <span key={ext}>
                      {i > 0 && ", "}
                      .{ext}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
