// ==========================================
// Empty Folders View Component
// ==========================================

import { Folder, Trash2 } from "lucide-react";
import type { ReactElement } from "react";

import type { EmptyFolder, ScanProgress } from "../types";

interface EmptyFoldersViewProps {
  emptyFolders: EmptyFolder[];
  scanning: boolean;
  scanProgress: ScanProgress | null;
  onDelete: (path: string) => void;
  onDeleteAll: () => void;
}

export function EmptyFoldersView({
  emptyFolders,
  scanning,
  scanProgress,
  onDelete,
  onDeleteAll,
}: EmptyFoldersViewProps): ReactElement {
  if (scanning) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-white/10 border-t-tertiary mx-auto mb-4"></div>
          <div className="text-tertiary text-lg mb-2 font-mono tracking-widest uppercase">
            {scanProgress?.phase || "スキャン中..."}
          </div>
          <div className="text-white/40 text-sm">
            {scanProgress?.scanned_files || 0} フォルダ確認済み
          </div>
        </div>
      </div>
    );
  }

  if (emptyFolders.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-white/40">
          <Folder size={48} className="mx-auto mb-4 opacity-50" />
          <div className="text-lg">空フォルダは見つかりませんでした</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Summary banner */}
      <div className="bg-tertiary/5 border border-tertiary/20 hud-bracket p-4 mb-4 flex justify-between items-center">
        <div className="text-tertiary font-medium">
          {emptyFolders.length} 個の空フォルダ
        </div>
        <button
          type="button"
          onClick={onDeleteAll}
          className="bg-error/80 hover:bg-error text-black font-mono font-bold tracking-wider px-4 py-2 text-sm transition-colors"
        >
          すべて削除
        </button>
      </div>

      {/* Folder list */}
      <div className="flex-1 overflow-auto space-y-2">
        {emptyFolders.map((folder) => (
          <div
            key={folder.path}
            className="bg-black border border-white/5 border-l-2 border-l-tertiary p-3 flex items-center justify-between group hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Folder size={20} className="text-tertiary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-white/90 font-medium truncate">
                  {folder.name}
                </div>
                <div className="text-[11px] text-white/40 font-mono truncate">
                  {folder.path}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onDelete(folder.path)}
              className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-error transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
