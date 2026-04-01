import {
  Eye,
  File as FileIcon,
  Folder,
  FolderInput,
  FolderOpen,
  MoveRight,
  Pencil,
  ShieldOff,
  Trash2,
  X,
} from "lucide-react";
import {
  type CSSProperties,
  type ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { FixedSizeList as List } from "react-window";

import { messages } from "../i18n/messages";
import { formatSize, ROW_HEIGHT } from "../lib/utils";
import type { FileNode } from "../types";

interface BrowseViewProps {
  sortedNodes: FileNode[];
  loading: boolean;
  listHeight: number;
  listContainerRef: React.RefObject<HTMLDivElement | null>;
  selectedPaths: Set<string>;
  renameTarget: { path: string; name: string } | null;
  onNavigate: (path: string) => void;
  onPreview: (path: string) => void;
  onDelete: (path: string) => void;
  onSecureDelete?: (path: string) => void;
  onMove: (path: string) => void;
  onRename: (path: string, name: string) => void;
  onRenameSubmit: (newName: string) => void;
  onRenameClear: () => void;
  onToggleSelect: (path: string) => void;
  onBulkMove: () => void;
  onClearSelection: () => void;
  onOrganize: () => void;
}

export function BrowseView({
  sortedNodes,
  loading,
  listHeight,
  listContainerRef,
  selectedPaths,
  renameTarget,
  onNavigate,
  onPreview,
  onDelete,
  onSecureDelete,
  onMove,
  onRename,
  onRenameSubmit,
  onRenameClear,
  onToggleSelect,
  onBulkMove,
  onClearSelection,
  onOrganize,
}: BrowseViewProps): ReactElement {
  const Row = useCallback(
    ({ index, style }: { index: number; style: CSSProperties }) => {
      const node = sortedNodes[index];
      if (!node) return null;

      const isSelected = selectedPaths.has(node.path);

      const folderInteraction = node.is_dir
        ? {
            role: "button" as const,
            tabIndex: 0,
            onClick: () => onNavigate(node.path),
            onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
              if (e.key === "Enter" || e.key === " ") onNavigate(node.path);
            },
          }
        : {};

      return (
        <div
          style={style}
          className={`group flex items-center justify-between px-3 hover:bg-primary/5 cursor-pointer transition-colors ${
            isSelected ? "bg-primary/10" : ""
          }`}
          {...folderInteraction}
        >
          {/* Checkbox */}
          <button
            type="button"
            aria-label={isSelected ? "選択解除" : "選択"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(node.path);
            }}
            className="shrink-0 w-4 h-4 mr-2 border border-white/20 flex items-center justify-center transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {isSelected && (
              <div className="w-2 h-2 bg-primary" />
            )}
          </button>

          <div className="flex items-center gap-3 overflow-hidden flex-1">
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
                  title={messages.preview}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview(node.path);
                  }}
                  className="p-1.5 text-white/30 hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                  aria-label={messages.preview}
                >
                  <Eye size={16} />
                </button>
              )}
              <button
                type="button"
                title={messages.move}
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(node.path);
                }}
                className="p-1.5 text-white/30 hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                aria-label={messages.move}
              >
                <MoveRight size={16} />
              </button>
              <button
                type="button"
                title={messages.rename}
                onClick={(e) => {
                  e.stopPropagation();
                  onRename(node.path, node.name);
                }}
                className="p-1.5 text-white/30 hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                aria-label={messages.rename}
              >
                <Pencil size={16} />
              </button>
              {onSecureDelete && !node.is_dir && (
                <button
                  type="button"
                  title={messages.secureDelete}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSecureDelete(node.path);
                  }}
                  className="p-1.5 text-white/30 hover:text-warning transition-colors focus-visible:ring-2 focus-visible:ring-warning focus-visible:outline-none"
                  aria-label={messages.secureDelete}
                >
                  <ShieldOff size={16} />
                </button>
              )}
              <button
                type="button"
                title={messages.delete}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(node.path);
                }}
                className="p-1.5 text-white/30 hover:text-error transition-colors focus-visible:ring-2 focus-visible:ring-error focus-visible:outline-none"
                aria-label={messages.delete}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      );
    },
    [sortedNodes, selectedPaths, onNavigate, onPreview, onDelete, onSecureDelete, onMove, onRename, onToggleSelect],
  );

  const actionBar = (
    <div className="flex items-center justify-between px-3 py-1.5 border-b border-primary/10 bg-black shrink-0">
      <div className="flex items-center gap-2">
        {selectedPaths.size > 0 && (
          <>
            <span className="text-xs text-primary font-mono">
              {selectedPaths.size}{messages.selectedCount}
            </span>
            <button
              type="button"
              onClick={onBulkMove}
              className="px-2 py-1 text-[11px] bg-primary/10 text-primary border border-primary/40 hover:bg-primary/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <MoveRight size={12} className="inline mr-1" />
              {messages.bulkMoveSelected}
            </button>
            <button
              type="button"
              onClick={onClearSelection}
              className="p-1 text-white/30 hover:text-white/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="選択解除"
            >
              <X size={12} />
            </button>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={onOrganize}
        className="px-2 py-1 text-[11px] text-white/40 hover:text-primary hover:bg-white/5 border border-transparent hover:border-primary/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        title={messages.organizeByType}
      >
        <FolderInput size={12} className="inline mr-1" />
        {messages.organizeByType}
      </button>
    </div>
  );

  if (loading) {
    return (
      <>
        {actionBar}
        <div ref={listContainerRef} className="flex-1 relative overflow-auto p-2">
          <div className="absolute inset-0 flex items-center justify-center text-white/40">
            {messages.loading}
          </div>
        </div>
      </>
    );
  }

  if (sortedNodes.length === 0) {
    return (
      <>
        {actionBar}
        <div ref={listContainerRef} className="flex-1 relative overflow-auto p-2">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40 gap-3">
            <FolderOpen size={48} className="opacity-50" />
            <span className="text-sm text-white/40 hud-label">{messages.folderEmpty}</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {actionBar}
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

      {/* Rename modal */}
      {renameTarget && (
        <RenameModal
          target={renameTarget}
          onSubmit={onRenameSubmit}
          onClose={onRenameClear}
        />
      )}
    </>
  );
}

interface RenameModalProps {
  target: { path: string; name: string };
  onSubmit: (newName: string) => void;
  onClose: () => void;
}

function RenameModal({ target, onSubmit, onClose }: RenameModalProps): ReactElement {
  const [value, setValue] = useState(target.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    // Select filename without extension
    const dot = target.name.lastIndexOf(".");
    inputRef.current?.setSelectionRange(0, dot > 0 ? dot : target.name.length);
  }, [target.name]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSubmit(value);
    if (e.key === "Escape") onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-label="閉じる"
        tabIndex={-1}
      />
      {/* Dialog */}
      <div
        role="dialog"
        aria-modal
        aria-label={messages.renameTitle}
        className="relative bg-[#0a0a0a] border border-primary/30 p-4 w-80 z-10"
      >
        <div className="text-xs text-primary font-mono mb-3 hud-label">
          {messages.renameTitle}
        </div>
        <div className="text-xs text-white/40 mb-1">{messages.renameCurrentName}</div>
        <div className="text-xs text-white/70 font-mono mb-3 truncate">{target.name}</div>
        <div className="text-xs text-white/40 mb-1">{messages.renameNewName}</div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={messages.renamePlaceholder}
          className="w-full bg-white/5 border border-white/20 focus:border-primary/60 text-white/90 text-sm px-2 py-1.5 outline-none font-mono"
        />
        <div className="flex gap-2 mt-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-xs text-white/40 hover:text-white/60 border border-white/10 hover:border-white/20 transition-colors"
          >
            {messages.renameCancel}
          </button>
          <button
            type="button"
            onClick={() => onSubmit(value)}
            disabled={!value.trim()}
            className="px-3 py-1 text-xs bg-primary/10 text-primary border border-primary/40 hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {messages.renameConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}
