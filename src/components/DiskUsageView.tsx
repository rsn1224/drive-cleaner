// ==========================================
// Disk Usage View Component
// ==========================================

import { ResponsiveTreeMap } from "@nivo/treemap";
import { BarChart2, ChevronRight, Folder, Grid2x2 } from "lucide-react";
import type { ReactElement } from "react";
import { useState } from "react";

import { messages } from "../i18n/messages";
import { tokens } from "../lib/design-tokens";
import { formatSize } from "../lib/utils";
import type { FolderSize, ScanProgress } from "../types";

const TREEMAP_COLORS = [
  `${tokens.colors.primary}22`,
  `${tokens.colors.primary}44`,
  `${tokens.colors.primary}66`,
  `${tokens.colors.primary}88`,
  `${tokens.colors.primary}aa`,
];

const NIVO_THEME = {
  background: tokens.colors.surface,
  text: { fill: tokens.colors.primary, fontFamily: "monospace", fontSize: 11 },
  tooltip: {
    container: {
      background: tokens.colors.surfaceContainer,
      border: `1px solid ${tokens.colors.primary}4d`,
      color: tokens.colors.primary,
      fontFamily: "monospace",
      fontSize: 11,
    },
  },
};

function formatPercent(part: number, total: number): string {
  if (total === 0) return "0%";
  return `${((part / total) * 100).toFixed(1)}%`;
}

interface NivoNode {
  id: string;
  value?: number;
  children?: NivoNode[];
  path: string;
  name: string;
}

function toNivoData(folder: FolderSize): NivoNode {
  const childrenTotal = folder.children.reduce((s, c) => s + c.size, 0);
  const directFilesSize = Math.max(0, folder.size - childrenTotal);

  const nivoChildren: NivoNode[] = folder.children.map(toNivoData);
  if (directFilesSize > 0 && folder.children.length > 0) {
    nivoChildren.push({
      id: `${folder.path}/__files__`,
      value: directFilesSize,
      path: folder.path,
      name: messages.directFiles,
    });
  }

  return {
    id: folder.path,
    name: folder.name,
    path: folder.path,
    value: nivoChildren.length === 0 ? folder.size : undefined,
    children: nivoChildren.length > 0 ? nivoChildren : undefined,
  };
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
  const [viewMode, setViewMode] = useState<"bar" | "treemap">("bar");

  if (scanning) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-white/10 border-t-primary mx-auto mb-4"></div>
          <div className="text-primary text-lg mb-2 font-mono tracking-widest uppercase">
            {scanProgress?.phase || messages.scanning}
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
          <div className="text-lg">{messages.selectFolder}</div>
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
                className="hover:text-white/60 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                aria-label={crumb.name}
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
          {currentFolder.name} • {currentFolder.file_count} {messages.files}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-primary">
            {messages.total}: {formatSize(currentFolder.size)}
          </div>
          {/* View toggle */}
          <div className="flex border border-white/10">
            <button
              type="button"
              title="リスト表示"
              onClick={() => setViewMode("bar")}
              className={`p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                viewMode === "bar"
                  ? "bg-primary/20 text-primary"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              <BarChart2 size={14} />
            </button>
            <button
              type="button"
              title="ツリーマップ表示"
              onClick={() => setViewMode("treemap")}
              className={`p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                viewMode === "treemap"
                  ? "bg-primary/20 text-primary"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              <Grid2x2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {viewMode === "treemap" ? (
        /* Treemap view */
        <div className="flex-1 min-h-0">
          {currentFolder.children.length === 0 ? (
            <div className="text-center text-white/40 py-8">
              {messages.noSubfolders}
            </div>
          ) : (
            <ResponsiveTreeMap
              data={toNivoData(currentFolder)}
              identity="id"
              value="value"
              valueFormat={(v: number) => formatSize(v)}
              colors={TREEMAP_COLORS}
              borderWidth={1}
              borderColor={tokens.colors.surface}
              labelSkipSize={30}
              label={(node: { data: { name: string } }) => node.data.name}
              parentLabel={(node: { data: { name: string } }) => node.data.name}
              theme={NIVO_THEME}
              onClick={(node: { data: NivoNode }) => {
                if (node.data.path && !node.data.id.endsWith("/__files__")) {
                  onDrillDown(node.data.path, node.data.name);
                }
              }}
            />
          )}
        </div>
      ) : (
        /* Bar list view */
        <div className="flex-1 overflow-auto space-y-2">
          {currentFolder.children.length === 0 ? (
            <div className="text-center text-white/40 py-8">
              {messages.noSubfolders}
            </div>
          ) : (
            currentFolder.children.map((child) => {
              const percent = formatPercent(child.size, currentFolder.size);

              return (
                <button
                  key={child.path}
                  type="button"
                  className="w-full text-left bg-black border border-white/5 p-3 cursor-pointer hover:border-primary/40 border-l-2 border-l-primary/30 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                  onClick={() => onDrillDown(child.path, child.name)}
                >
                  <div className="flex items-center gap-3">
                    <Folder size={20} className="text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-white/90 font-medium truncate font-mono tracking-widest">
                        {child.name}
                      </div>
                      <div className="text-white/30 text-[11px]">
                        {child.file_count} {messages.files}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-24 bg-white/5 h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-primary shadow-glow-primary transition-all duration-300"
                          style={{ width: percent }}
                        />
                      </div>
                      <div className="text-primary font-mono text-sm whitespace-nowrap">
                        {formatSize(child.size)} ({percent})
                      </div>
                      <ChevronRight size={16} className="text-white/30" />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
