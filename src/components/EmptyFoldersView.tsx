// ==========================================
// Empty Folders View Component
// ==========================================

import type { ReactElement } from "react";
import { Folder, Trash2 } from "lucide-react";

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
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#374151] border-t-[#f59e0b] mx-auto mb-4"></div>
          <div className="text-white text-lg mb-2">
            {scanProgress?.phase || "スキャン中..."}
          </div>
          <div className="text-[#6b7280] text-sm">
            {scanProgress?.scanned_files || 0} フォルダ確認済み
          </div>
        </div>
      </div>
    );
  }

  if (emptyFolders.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-[#6b7280]">
          <Folder size={48} className="mx-auto mb-4 opacity-50" />
          <div className="text-lg">空フォルダは見つかりませんでした</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Summary banner */}
      <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg p-4 mb-4 flex justify-between items-center">
        <div className="text-[#f59e0b] font-medium">
          {emptyFolders.length} 個の空フォルダ
        </div>
        <button
          type="button"
          onClick={onDeleteAll}
          className="bg-[#f87171] hover:bg-red-500 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
        >
          すべて削除
        </button>
      </div>

      {/* Folder list */}
      <div className="flex-1 overflow-auto space-y-2">
        {emptyFolders.map((folder) => (
          <div
            key={folder.path}
            className="bg-[#030712] border border-[#1f2937] rounded-lg p-3 flex items-center justify-between group hover:bg-[#111827] transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Folder size={20} className="text-[#f59e0b] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[#d1d5db] font-medium truncate">
                  {folder.name}
                </div>
                <div className="text-[11px] text-[#6b7280] font-mono truncate">
                  {folder.path}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onDelete(folder.path)}
              className="opacity-0 group-hover:opacity-100 text-[#6b7280] hover:text-red-400 transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
