import { Eye, File as FileIcon, Folder, FolderOpen, Trash2 } from "lucide-react";
import { useCallback, type CSSProperties, type ReactElement } from "react";
import { FixedSizeList as List } from "react-window";

import { formatSize, ROW_HEIGHT } from "../lib/utils";
import type { FileNode } from "../types";

interface BrowseViewProps {
  sortedNodes: FileNode[];
  loading: boolean;
  listHeight: number;
  listContainerRef: React.RefObject<HTMLDivElement | null>;
  onNavigate: (path: string) => void;
  onPreview: (path: string) => void;
  onDelete: (path: string) => void;
}

export function BrowseView({
  sortedNodes,
  loading,
  listHeight,
  listContainerRef,
  onNavigate,
  onPreview,
  onDelete,
}: BrowseViewProps): ReactElement {
  const Row = useCallback(
    ({ index, style }: { index: number; style: CSSProperties }) => {
      const node = sortedNodes[index];
      if (!node) return null;

      return (
        <div
          style={style}
          className="group flex items-center justify-between px-3 hover:bg-primary/5 cursor-pointer transition-colors"
          onClick={() => node.is_dir && onNavigate(node.path)}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {node.is_dir ? (
              <Folder className="text-primary shrink-0" size={20} />
            ) : (
              <FileIcon className="text-white/30 shrink-0" size={20} />
            )}
            <span className="text-white/90 truncate select-none text-sm">
              {node.name}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {!node.is_dir && (
              <span className="text-xs text-white/50 font-mono">
                {formatSize(node.size)}
              </span>
            )}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!node.is_dir && (
                <button
                  type="button"
                  title="プレビュー"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview(node.path);
                  }}
                  className="p-1.5 text-white/30 hover:text-primary transition-colors"
                >
                  <Eye size={16} />
                </button>
              )}
              <button
                type="button"
                title="削除"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(node.path);
                }}
                className="p-1.5 text-white/30 hover:text-error transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      );
    },
    [sortedNodes, onNavigate, onPreview, onDelete],
  );

  if (loading) {
    return (
      <div ref={listContainerRef} className="flex-1 relative overflow-auto p-2">
        <div className="absolute inset-0 flex items-center justify-center text-white/40">
          読み込み中...
        </div>
      </div>
    );
  }

  if (sortedNodes.length === 0) {
    return (
      <div ref={listContainerRef} className="flex-1 relative overflow-auto p-2">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 gap-3">
          <FolderOpen size={48} className="opacity-50" />
          <span className="text-sm text-white/40 hud-label">フォルダは空です</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={listContainerRef} className="flex-1 relative overflow-auto p-2">
      <List
        height={listHeight}
        itemCount={sortedNodes.length}
        itemSize={ROW_HEIGHT}
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
}
