// ==========================================
// Duplicates View Component
// ==========================================

import { FileDown, Trash2 } from "lucide-react";
import type { ReactElement } from "react";
import { useState } from "react";

import { messages } from "../i18n/messages";
import { formatSize } from "../lib/utils";
import type { DuplicateGroup, ScanProgress } from "../types";
import { DuplicateGroupCard } from "./DuplicateGroupCard";

interface DuplicatesViewProps {
  duplicates: DuplicateGroup[];
  scanning: boolean;
  scanProgress: ScanProgress | null;
  totalSaveable: number;
  onPreview: (path: string) => void;
  onDelete: (path: string, hash: string) => void;
  onBulkDelete: () => void;
  onBulkDeleteSelected: (paths: string[]) => void;
  onExportJson: () => void;
  onExportCsv: () => void;
}

export function DuplicatesView({
  duplicates,
  scanning,
  scanProgress,
  totalSaveable,
  onPreview,
  onDelete,
  onBulkDelete,
  onBulkDeleteSelected,
  onExportJson,
  onExportCsv,
}: DuplicatesViewProps): ReactElement {
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());

  const togglePath = (path: string): void => {
    setSelectedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  // 全グループで idx > 0 のパスを全選択（最初のファイルを保持）
  const handleSelectAll = (): void => {
    const toSelect = new Set<string>();
    for (const group of duplicates) {
      for (const p of group.paths.slice(1)) {
        toSelect.add(p);
      }
    }
    setSelectedPaths(toSelect);
  };

  // 各グループで最も短いパスを保持し、残りを選択
  const handleSelectShortest = (): void => {
    const toSelect = new Set<string>();
    for (const group of duplicates) {
      const shortest = group.paths.reduce((a, b) =>
        a.length <= b.length ? a : b
      );
      for (const p of group.paths) {
        if (p !== shortest) toSelect.add(p);
      }
    }
    setSelectedPaths(toSelect);
  };

  const handleClearSelection = (): void => setSelectedPaths(new Set());

  const handleDeleteSelected = (): void => {
    onBulkDeleteSelected(Array.from(selectedPaths));
    setSelectedPaths(new Set());
  };

  const hasSelection = selectedPaths.size > 0;
  const hasDuplicates = duplicates.length > 0;

  return (
    <div className="space-y-2">
      {/* Scan progress */}
      {scanning && scanProgress && (
        <div className="flex items-center gap-3 p-4 border-b border-primary/10">
          <div className="animate-spin h-5 w-5 border-2 border-white/10 border-t-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-primary text-xs truncate font-mono tracking-widest uppercase">
              {scanProgress.phase}
            </p>
            <p className="text-[11px] text-white/40">
              {scanProgress.scanned_files.toLocaleString()} ファイル確認済
            </p>
          </div>
        </div>
      )}

      {/* Summary banner */}
      {hasDuplicates && (
        <div className="bg-primary/5 border border-primary/20 hud-bracket p-4 mx-3 mt-3">
          <div className="flex justify-between items-start mb-3">
            <span className="text-white/90 text-sm">
              {duplicates.length} {messages.duplicateGroups} の重複を検出
            </span>
            <div className="text-right">
              <div className="text-2xl font-semibold text-primary">
                {formatSize(totalSaveable)}
              </div>
              <div className="text-xs text-white/40">{messages.saveable}</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono bg-error/10 border border-error/30 text-error hover:bg-error/20 transition-colors"
            >
              <Trash2 size={12} />
              {messages.bulkDelete}
            </button>
            {hasSelection && (
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono bg-error/20 border border-error/50 text-error hover:bg-error/30 transition-colors"
              >
                <Trash2 size={12} />
                {messages.bulkDeleteSelected} ({selectedPaths.size}{messages.selectedCount})
              </button>
            )}
            <button
              type="button"
              onClick={onExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <FileDown size={12} />
              {messages.exportJson}
            </button>
            <button
              type="button"
              onClick={onExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <FileDown size={12} />
              {messages.exportCsv}
            </button>
          </div>

          {/* Smart selection buttons */}
          <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-white/5">
            <span className="text-[10px] text-white/30 font-mono self-center">{messages.autoSelect}</span>
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-2 py-1 text-[10px] font-mono bg-secondary/10 border border-secondary/20 text-secondary/70 hover:text-secondary hover:bg-secondary/20 transition-colors"
            >
              {messages.selectAll}
            </button>
            <button
              type="button"
              onClick={handleSelectShortest}
              className="px-2 py-1 text-[10px] font-mono bg-secondary/10 border border-secondary/20 text-secondary/70 hover:text-secondary hover:bg-secondary/20 transition-colors"
            >
              {messages.selectShortest}
            </button>
            {hasSelection && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="px-2 py-1 text-[10px] font-mono bg-white/5 border border-white/10 text-white/40 hover:text-white/70 transition-colors"
              >
                {messages.clearSelection}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Scanning helper text */}
      {scanning && hasDuplicates && (
        <p className="text-center text-xs text-white/40 py-3" aria-live="polite">
          {messages.scanning}... 現在 {duplicates.length} {messages.duplicateGroups}発見（{messages.saveable}:{" "}
          {formatSize(totalSaveable)})
        </p>
      )}

      {/* Duplicate groups */}
      {!scanning && duplicates.length === 0 ? (
        <div className="text-center text-white/40 mt-10">
          {messages.noDuplicatesFound}
        </div>
      ) : (
        duplicates.map((group) => (
          <DuplicateGroupCard
            key={group.hash}
            group={group}
            selectedPaths={selectedPaths}
            onTogglePath={togglePath}
            onPreview={onPreview}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
}
