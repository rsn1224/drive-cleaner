// ==========================================
// Toolbar Component
// ==========================================

import { ArrowUp, ChevronRight } from "lucide-react";

import type { AppMode, SortDir, SortKey } from "../types";

interface ToolbarProps {
  breadcrumbs: { label: string; path: string }[];
  mode: AppMode;
  sortKey: SortKey;
  sortDir: SortDir;
  onNavigate: (path: string) => void;
  onGoUp: () => void;
  onToggleSort: (key: SortKey) => void;
}

export function Toolbar({
  breadcrumbs,
  mode,
  sortKey,
  sortDir,
  onNavigate,
  onGoUp,
  onToggleSort,
}: ToolbarProps) {
  return (
    <div className="flex items-center justify-between bg-[#030712] px-3 py-2 border-b border-[#1f2937]">
      <div className="flex items-center gap-2 overflow-hidden min-w-0">
        <button
          type="button"
          title="上のフォルダへ"
          onClick={onGoUp}
          className="p-1.5 text-[#6b7280] hover:text-white bg-[#374151]/50 rounded-md transition-colors shrink-0"
        >
          <ArrowUp size={16} />
        </button>
        <div className="flex items-center gap-1 overflow-hidden min-w-0">
          {breadcrumbs.map((crumb, idx) => (
            <div key={crumb.path} className="flex items-center shrink-0">
              {idx > 0 && (
                <ChevronRight
                  size={12}
                  className="text-[#4b5563] mx-0.5"
                />
              )}
              <button
                type="button"
                onClick={() => onNavigate(crumb.path)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  idx === breadcrumbs.length - 1
                    ? "bg-[#374151] text-white"
                    : "text-[#6b7280] hover:bg-[#374151] hover:text-[#d1d5db]"
                }`}
              >
                {crumb.label}
              </button>
            </div>
          ))}
        </div>
      </div>
      {mode === "browse" && (
        <div className="flex gap-1 shrink-0 ml-2">
          <button
            type="button"
            onClick={() => onToggleSort("name")}
            className={`px-2 py-1 rounded text-[11px] transition-colors ${
              sortKey === "name"
                ? "bg-[#374151] text-white"
                : "text-[#6b7280] hover:bg-[#1f2937]"
            }`}
          >
            名前{" "}
            {sortKey === "name" ? (sortDir === "asc" ? "↑" : "↓") : ""}
          </button>
          <button
            type="button"
            onClick={() => onToggleSort("size")}
            className={`px-2 py-1 rounded text-[11px] transition-colors ${
              sortKey === "size"
                ? "bg-[#374151] text-white"
                : "text-[#6b7280] hover:bg-[#1f2937]"
            }`}
          >
            サイズ{" "}
            {sortKey === "size" ? (sortDir === "asc" ? "↑" : "↓") : ""}
          </button>
        </div>
      )}
    </div>
  );
}
