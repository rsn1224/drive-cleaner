// ==========================================
// Disk Usage View Component
// ==========================================

import { ChevronRight, Folder } from "lucide-react";
import type { ReactElement } from "react";

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
          <div className="animate-spin h-12 w-12 border-2 border-white/10 border-t-primary mx-auto mb-4"></div>
          <div className="text-primary text-lg mb-2 font-mono tracking-widest uppercase">
            {scanProgress?.phase || "分析中..."}
          </div>
        </div>
      </div>
    );
  }

  if (!currentFolder) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-white/40">
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
        <div className="flex items-center gap-2 px-4 py-2 hud-label text-white/40 border-b border-primary/10">
          {breadcrumbs.map((crumb, idx) => (
            <div key={crumb.path} className="flex items-center gap-2">
              {idx > 0 && <ChevronRight size={12} />}
              <button
                type="button"
                onClick={() => onNavigateUp(crumb.path)}
                className="hover:text-white/60 transition-colors"
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Summary banner */}
      <div className="bg-primary/5 border border-primary/20 hud-bracket p-4 mb-4 flex justify-between items-center">
        <div className="text-primary font-medium">
          {currentFolder.name} • {currentFolder.file_count} ファイル
        </div>
        <div className="text-primary">
          合計: {formatSize(currentFolder.size)}
        </div>
      </div>

      {/* Folder list */}
      <div className="flex-1 overflow-auto space-y-2">
        {currentFolder.children.length === 0 ? (
          <div className="text-center text-white/40 py-8">
            サブフォルダがありません
          </div>
        ) : (
          currentFolder.children.map((child) => {
            const percent = formatPercent(child.size, currentFolder.size);
            
            return (
              <div
                key={child.path}
                className="bg-black border border-white/5 p-3 cursor-pointer hover:border-primary/40 border-l-2 border-l-primary/30 transition-colors"
                onClick={() => onDrillDown(child.path, child.name)}
              >
                <div className="flex items-center gap-3">
                  {/* Folder icon */}
                  <Folder size={20} className="text-primary flex-shrink-0" />
                  
                  {/* Folder info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-white/90 font-medium truncate font-mono tracking-widest">
                      {child.name}
                    </div>
                    <div className="text-white/30 text-[11px]">
                      {child.file_count} ファイル
                    </div>
                  </div>

                  {/* Size bar and info */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-24 bg-white/5 h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-primary shadow-[0_0_12px_rgba(0,240,255,0.6)] transition-all duration-300"
                        style={{ width: percent }}
                      />
                    </div>
                    <div className="text-primary font-mono text-sm whitespace-nowrap">
                      {formatSize(child.size)} ({percent})
                    </div>
                    <ChevronRight size={16} className="text-white/30" />
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
