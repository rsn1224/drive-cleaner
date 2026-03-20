// ==========================================
// Disk Usage View Component
// ==========================================

import type { ReactElement } from "react";
import { ChevronRight, Folder } from "lucide-react";

import { formatSize } from "../lib/utils";
import type { FolderSize, ScanProgress } from "../types";

function formatPercent(part: number, total: number): string {
  if (total === 0) return "0%";
  return `${((part / total) * 100).toFixed(1)}%`;
}

interface DiskUsageViewProps {
  currentFolder: FolderSize | null;
  scanning: boolean;
  scanProgress: ScanProgress | null;
  breadcrumbs: { name: string; path: string }[];
  onDrillDown: (path: string, name: string) => void;
  onNavigateUp: (path: string) => void;
}

export function DiskUsageView({
  currentFolder,
  scanning,
  scanProgress,
  breadcrumbs,
  onDrillDown,
  onNavigateUp,
}: DiskUsageViewProps): ReactElement {
  if (scanning) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#374151] border-t-[#06b6d4] mx-auto mb-4"></div>
          <div className="text-white text-lg mb-2">
            {scanProgress?.phase || "分析中..."}
          </div>
        </div>
      </div>
    );
  }

  if (!currentFolder) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-[#6b7280]">
          <Folder size={48} className="mx-auto mb-4 opacity-50" />
          <div className="text-lg">フォルダを選択してください</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 text-[11px] text-[#9ca3af] border-b border-[#1f2937]">
          {breadcrumbs.map((crumb, idx) => (
            <div key={crumb.path} className="flex items-center gap-2">
              {idx > 0 && <ChevronRight size={12} />}
              <button
                type="button"
                onClick={() => onNavigateUp(crumb.path)}
                className="hover:text-[#d1d5db] transition-colors"
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Summary banner */}
      <div className="bg-[#06b6d4]/10 border border-[#06b6d4]/30 rounded-lg p-4 mb-4 flex justify-between items-center">
        <div className="text-[#06b6d4] font-medium">
          {currentFolder.name} • {currentFolder.file_count} ファイル
        </div>
        <div className="text-[#06b6d4]">
          合計: {formatSize(currentFolder.size)}
        </div>
      </div>

      {/* Folder list */}
      <div className="flex-1 overflow-auto space-y-2">
        {currentFolder.children.length === 0 ? (
          <div className="text-center text-[#6b7280] py-8">
            サブフォルダがありません
          </div>
        ) : (
          currentFolder.children.map((child) => {
            const percent = formatPercent(child.size, currentFolder.size);
            
            return (
              <div
                key={child.path}
                className="bg-[#030712] border border-[#1f2937] rounded-lg p-3 cursor-pointer hover:bg-[#1f2937]/50 transition-colors"
                onClick={() => onDrillDown(child.path, child.name)}
              >
                <div className="flex items-center gap-3">
                  {/* Folder icon */}
                  <Folder size={20} className="text-[#06b6d4] flex-shrink-0" />
                  
                  {/* Folder info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[#d1d5db] font-medium truncate">
                      {child.name}
                    </div>
                    <div className="text-[#6b7280] text-[11px]">
                      {child.file_count} ファイル
                    </div>
                  </div>

                  {/* Size bar and info */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-24 bg-[#1f2937] rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-[#06b6d4] rounded-full transition-all duration-300"
                        style={{ width: percent }}
                      />
                    </div>
                    <div className="text-[#06b6d4] font-mono text-sm whitespace-nowrap">
                      {formatSize(child.size)} ({percent})
                    </div>
                    <ChevronRight size={16} className="text-[#6b7280]" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
