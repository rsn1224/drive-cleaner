import {
  Eye,
  File as FileIcon,
  Folder,
  FolderInput,
  FolderOpen,
  MoreHorizontal,
  MoveRight,
  Pencil,
  ShieldOff,
  Trash2,
  X,
} from 'lucide-react';
import { type ReactElement, useCallback, useMemo, useState } from 'react';
import { List, type RowComponentProps } from 'react-window';

import { messages } from '../i18n/messages';
import { formatSize, ROW_HEIGHT } from '../lib/utils';
import type { FileNode } from '../types';
import { RenameModal } from './RenameModal';
import { type RowAction, RowActionSheet } from './RowActionSheet';

interface BrowseViewProps {
  sortedNodes: FileNode[];
  loading: boolean;
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

interface BrowseRowData {
  sortedNodes: FileNode[];
  selectedPaths: Set<string>;
  onNavigate: (path: string) => void;
  onPreview: (path: string) => void;
  onDelete: (path: string) => void;
  onSecureDelete?: (path: string) => void;
  onMove: (path: string) => void;
  onRename: (path: string, name: string) => void;
  onToggleSelect: (path: string) => void;
  onOpenActions: (node: FileNode) => void;
}

function BrowseRow({
  index,
  style,
  sortedNodes,
  selectedPaths,
  onNavigate,
  onPreview,
  onDelete,
  onSecureDelete,
  onMove,
  onRename,
  onToggleSelect,
  onOpenActions,
}: RowComponentProps<BrowseRowData>): ReactElement | null {
  const node = sortedNodes[index];
  if (!node) return null;

  const isSelected = selectedPaths.has(node.path);

  const folderInteraction = node.is_dir
    ? {
        role: 'button' as const,
        tabIndex: 0,
        onClick: () => onNavigate(node.path),
        onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' || e.key === ' ') onNavigate(node.path);
        },
      }
    : {};

  return (
    <div
      style={style}
      className={`group flex items-center justify-between px-3 hover:bg-primary/5 cursor-pointer transition-colors ${
        isSelected ? 'bg-primary/10' : ''
      }`}
      {...folderInteraction}
    >
      {/* Checkbox */}
      <button
        type="button"
        aria-label={isSelected ? '選択解除' : '選択'}
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect(node.path);
        }}
        className="group/check shrink-0 w-10 h-10 -ml-3 sm:w-6 sm:h-6 sm:-ml-1 sm:mr-1 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span className="w-4 h-4 border border-white/20 flex items-center justify-center transition-colors group-hover/check:border-primary/60">
          {isSelected && <span className="w-2 h-2 bg-primary" />}
        </span>
      </button>

      <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
        {node.is_dir ? (
          <Folder className="text-primary shrink-0" size={20} />
        ) : (
          <FileIcon className="text-white/30 shrink-0" size={20} />
        )}
        <div className="flex flex-col min-w-0">
          <span className="text-white/90 truncate select-none text-sm">{node.name}</span>
          {!node.is_dir && (
            <span className="sm:hidden text-[11px] text-white/40 font-mono">
              {formatSize(node.size)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {!node.is_dir && (
          <span className="hidden sm:inline text-xs text-white/50 font-mono">
            {formatSize(node.size)}
          </span>
        )}
        {/* スマホ幅: 操作はボトムシートにまとめる */}
        <button
          type="button"
          title={messages.moreActions}
          onClick={(e) => {
            e.stopPropagation();
            onOpenActions(node);
          }}
          className="sm:hidden touch-target -mr-2 text-white/50 active:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          aria-label={messages.moreActions}
        >
          <MoreHorizontal size={20} />
        </button>
        <div className="hidden sm:flex gap-1 reveal-on-hover">
          {!node.is_dir && (
            <button
              type="button"
              title={messages.preview}
              onClick={(e) => {
                e.stopPropagation();
                onPreview(node.path);
              }}
              className="touch-target p-1.5 text-white/30 hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
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
            className="touch-target p-1.5 text-white/30 hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
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
            className="touch-target p-1.5 text-white/30 hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
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
              className="touch-target p-1.5 text-white/30 hover:text-warning transition-colors focus-visible:ring-2 focus-visible:ring-warning focus-visible:outline-none"
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
            className="touch-target p-1.5 text-white/30 hover:text-error transition-colors focus-visible:ring-2 focus-visible:ring-error focus-visible:outline-none"
            aria-label={messages.delete}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function BrowseView({
  sortedNodes,
  loading,
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
  const [actionTarget, setActionTarget] = useState<FileNode | null>(null);
  const closeActions = useCallback((): void => setActionTarget(null), []);

  const sheetActions = useMemo((): RowAction[] => {
    if (!actionTarget) return [];
    const { path, name, is_dir } = actionTarget;
    const list: RowAction[] = [];
    if (is_dir) {
      list.push({
        id: 'open',
        icon: 'folder_open',
        label: messages.open,
        onSelect: () => onNavigate(path),
      });
    } else {
      list.push({
        id: 'preview',
        icon: 'visibility',
        label: messages.preview,
        onSelect: () => onPreview(path),
      });
    }
    list.push(
      {
        id: 'move',
        icon: 'drive_file_move',
        label: messages.move,
        onSelect: () => onMove(path),
      },
      {
        id: 'rename',
        icon: 'edit',
        label: messages.rename,
        onSelect: () => onRename(path, name),
      },
    );
    if (onSecureDelete && !is_dir) {
      list.push({
        id: 'secure-delete',
        icon: 'shield',
        label: messages.secureDelete,
        tone: 'warning',
        onSelect: () => onSecureDelete(path),
      });
    }
    list.push({
      id: 'delete',
      icon: 'delete',
      label: messages.delete,
      tone: 'error',
      onSelect: () => onDelete(path),
    });
    return list;
  }, [actionTarget, onNavigate, onPreview, onMove, onRename, onSecureDelete, onDelete]);

  const actionBar = (
    <div className="flex items-center justify-between px-3 py-1.5 border-b border-primary/10 bg-black shrink-0">
      <div className="flex items-center gap-2">
        {selectedPaths.size > 0 && (
          <>
            <span className="text-xs text-primary font-mono">
              {selectedPaths.size}
              {messages.selectedCount}
            </span>
            <button
              type="button"
              onClick={onBulkMove}
              className="px-3 py-2 sm:px-2 sm:py-1 text-[11px] bg-primary/10 text-primary border border-primary/40 hover:bg-primary/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <MoveRight size={12} className="inline mr-1" />
              {messages.bulkMoveSelected}
            </button>
            <button
              type="button"
              onClick={onClearSelection}
              className="touch-target p-1 text-white/30 hover:text-white/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
        className="px-3 py-2 sm:px-2 sm:py-1 text-[11px] text-white/40 hover:text-primary hover:bg-white/5 border border-transparent hover:border-primary/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
        <div ref={listContainerRef} className="flex-1 min-h-0 relative overflow-auto p-2">
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
        <div ref={listContainerRef} className="flex-1 min-h-0 relative overflow-auto p-2">
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
      <div ref={listContainerRef} className="flex-1 min-h-0 relative overflow-auto p-2">
        <List
          className="h-full"
          rowCount={sortedNodes.length}
          rowHeight={ROW_HEIGHT}
          rowComponent={BrowseRow}
          rowProps={{
            sortedNodes,
            selectedPaths,
            onNavigate,
            onPreview,
            onDelete,
            onSecureDelete,
            onMove,
            onRename,
            onToggleSelect,
            onOpenActions: setActionTarget,
          }}
        />
      </div>

      {actionTarget && (
        <RowActionSheet node={actionTarget} actions={sheetActions} onClose={closeActions} />
      )}

      {/* Rename modal */}
      {renameTarget && (
        <RenameModal target={renameTarget} onSubmit={onRenameSubmit} onClose={onRenameClear} />
      )}
    </>
  );
}
