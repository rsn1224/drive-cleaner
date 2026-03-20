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
    <div className="flex items-center justify-between bg-black px-3 py-2 border-b border-primary/10">
      <div className="flex items-center gap-2 overflow-hidden min-w-0">
        <button
          type="button"
          title="上のフォルダへ"
          onClick={onGoUp}
          className="p-1.5 text-white/30 hover:text-primary bg-white/5 border border-white/10 hover:border-primary/40 transition-colors shrink-0"
        >
          <ArrowUp size={16} />
        </button>
        <div className="flex items-center gap-1 overflow-hidden min-w-0">
          {breadcrumbs.map((crumb, idx) => (
            <div key={crumb.path} className="flex items-center shrink-0">
              {idx > 0 && (
                <ChevronRight
                  size={12}
                  className="text-white/20 mx-0.5"
                />
              )}
              <button
                type="button"
                onClick={() => onNavigate(crumb.path)}
                className={`px-2 py-0.5 text-xs transition-colors ${
                  idx === breadcrumbs.length - 1
                    ? "bg-primary/10 text-primary border border-primary/40"
                    : "text-white/40 hover:bg-white/5 hover:text-white/60"
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
            className={`px-2 py-1 text-[11px] transition-colors ${
              sortKey === "name"
                ? "bg-primary/10 text-primary border border-primary/40"
                : "text-white/40 hover:bg-white/5"
            }`}
          >
            名前{" "}
            {sortKey === "name" ? (sortDir === "asc" ? "↑" : "↓") : ""}
          </button>
          <button
            type="button"
            onClick={() => onToggleSort("size")}
            className={`px-2 py-1 text-[11px] transition-colors ${
              sortKey === "size"
                ? "bg-primary/10 text-primary border border-primary/40"
                : "text-white/40 hover:bg-white/5"
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
