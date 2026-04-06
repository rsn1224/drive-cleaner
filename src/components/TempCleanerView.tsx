// ==========================================
// Temp Cleaner View Component
// ==========================================

import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import type { ReactElement } from "react";
import { useState } from "react";

import { messages } from "../i18n/messages";
import { formatSize } from "../lib/utils";
import type { RecycleBinInfo, ScanProgress, TempScanResult } from "../types";

interface TempCleanerViewProps {
  scanResult: TempScanResult | null;
  scanning: boolean;
  scanProgress: ScanProgress | null;
  cleaning: boolean;
  recycleBinInfo: RecycleBinInfo | null;
  onCleanAll: () => void;
  onCleanCategory: (categoryName: string) => void;
  onEmptyRecycleBin: () => void;
}

export function TempCleanerView({
  scanResult,
  scanning,
  scanProgress,
  cleaning,
  recycleBinInfo,
  onCleanAll,
  onCleanCategory,
  onEmptyRecycleBin,
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
          <div className="animate-spin h-12 w-12 border-2 border-white/10 border-tertiary mx-auto mb-4"></div>
          <div className="text-tertiary text-lg mb-2 font-mono tracking-widest uppercase">
            {scanProgress?.phase || messages.scanning}
          </div>
          {scanProgress && scanProgress.scanned_files > 0 && (
            <div className="text-white/40 text-sm">
              {scanProgress.scanned_files} {messages.filesProcessed}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!scanResult || scanResult.categories.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-white/40">
          <Trash2 size={48} className="mx-auto mb-4 opacity-50" />
          <div className="text-lg">{messages.noTempFilesFound}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Recycle Bin widget */}
      <div className="bg-black border border-white/10 border-l-2 border-l-tertiary p-4 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trash2 size={20} className="text-tertiary shrink-0" />
          <div>
            <div className="text-white/90 font-medium text-sm">{messages.recycleBin}</div>
            {recycleBinInfo === null ? (
              <div className="text-[11px] text-white/40">{messages.loading}</div>
            ) : recycleBinInfo.item_count === 0 ? (
              <div className="text-[11px] text-white/40">{messages.recycleBinEmpty}</div>
            ) : (
              <div className="text-[11px] text-white/40 font-mono">
                {recycleBinInfo.item_count.toLocaleString()} {messages.recycleBinItems} / {formatSize(recycleBinInfo.total_size)}
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onEmptyRecycleBin}
          disabled={cleaning || recycleBinInfo === null || recycleBinInfo.item_count === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono bg-error/10 border border-error/30 text-error hover:bg-error/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 size={12} />
          {messages.recycleBinEmptyAction}
        </button>
      </div>

      {/* Summary banner */}
      <div className="bg-tertiary/5 border border-tertiary/20 hud-bracket p-4 mb-4 flex justify-between items-center">
        <div className="text-tertiary font-medium">
          {scanResult.total_files} {messages.tempFiles}
        </div>
        <div className="text-tertiary">
          {messages.total}: {formatSize(scanResult.total_size)}
        </div>
        <button
          type="button"
          onClick={onCleanAll}
          disabled={cleaning}
          className="bg-error/80 hover:bg-error disabled:bg-error/50 disabled:text-white/30 text-black font-mono font-bold tracking-wider px-4 py-2 text-sm flex items-center gap-2 transition-colors focus-visible:ring-2 focus-visible:ring-error focus-visible:outline-none"
          aria-label={messages.cleanAll}
        >
          {cleaning ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent" />
              {messages.cleaning}
            </>
          ) : (
            <>
              <Trash2 size={16} />
              {messages.cleanAll}
            </>
          )}
        </button>
      </div>

      {/* Category list */}
      <div className="flex-1 overflow-auto space-y-3">
        {scanResult.categories.map((category) => {
          const isExpanded = expandedCategories.has(category.name);
          
          return (
            <section
              key={category.name}
              className="bg-black border border-white/5 border-l-2 border-l-tertiary p-4"
              aria-label={category.name}
            >
              {/* Category header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.name)}
                    className="text-white/30 hover:text-white/60 transition-colors focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:outline-none"
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? "折りたたむ" : "展開する"}
                  >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  <Trash2 size={20} className="text-tertiary" />
                  <div>
                    <div className="text-white/90 font-medium">
                      {category.name}
                    </div>
                    <div className="text-[11px] text-white/40 font-mono">
                      {category.path}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-white/50 text-sm">
                      {category.file_count} {messages.files}
                    </div>
                    <div className="text-tertiary font-mono text-sm">
                      {formatSize(category.total_size)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onCleanCategory(category.name)}
                    disabled={cleaning}
                    className="border border-white/10 hover:border-tertiary disabled:border-white/5 text-white/30 hover:text-tertiary disabled:text-white/10 px-3 py-1 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:outline-none"
                  >
                    {cleaning ? messages.processing : messages.clean}
                  </button>
                </div>
              </div>

              {/* Expanded items */}
              {isExpanded && (
                <div className="border-t border-white/5 pt-3">
                  <div className="text-[10px] text-white/40 mb-2 hud-label">
                    {messages.fileList} ({category.items.length})
                  </div>
                  <div className="space-y-1 max-h-32 overflow-auto">
                    {category.items.map((item) => (
                      <div
                        key={item.path}
                        className="flex justify-between items-center text-[10px] text-white/30 hover:bg-white/5 px-2 py-1"
                      >
                        <span className="truncate flex-1 mr-2">{item.name}</span>
                        <span className="font-mono text-white/50">
                          {formatSize(item.size)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
