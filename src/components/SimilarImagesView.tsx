// ==========================================
// Similar Images View Component
// ==========================================

import { Eye, Images, Trash2 } from 'lucide-react';
import type { ReactElement } from 'react';

import { messages } from '../i18n/messages';
import type { ScanProgress, SimilarImageGroup } from '../types';

interface SimilarImagesViewProps {
  groups: SimilarImageGroup[];
  scanning: boolean;
  scanProgress: ScanProgress | null;
  onPreview: (path: string) => void;
  onDelete: (path: string) => void;
}

export function SimilarImagesView({
  groups,
  scanning,
  scanProgress,
  onPreview,
  onDelete,
}: SimilarImagesViewProps): ReactElement {
  if (scanning) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-2 border-white/10 border-t-secondary mx-auto mb-4" />
          <div className="text-secondary text-lg mb-2 font-mono tracking-widest uppercase">
            {scanProgress?.phase || messages.scanning}
          </div>
          {scanProgress && scanProgress.scanned_files > 0 && (
            <div className="text-white/40 text-sm">
              {scanProgress.scanned_files.toLocaleString()} {messages.filesProcessed}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-white/40">
          <Images size={48} className="mx-auto mb-4 opacity-50" />
          <div className="text-lg">{messages.noSimilarImagesFound}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary banner */}
      <div className="bg-secondary/5 border border-secondary/20 hud-bracket p-4 mx-3 mt-3 flex justify-between items-center">
        <span className="text-white/90 text-sm">
          {groups.length} {messages.similarImagesGroups} の類似画像グループ
        </span>
      </div>

      {/* Groups */}
      {groups.map((group) => (
        <fieldset
          key={group.paths.join('|')}
          className="min-w-0 bg-black border border-secondary border-l-2 overflow-hidden mx-3"
          aria-label={messages.similarImagesGroup}
        >
          {/* Group header */}
          <div className="flex justify-between items-center px-3 py-2.5 border-b border-white/5">
            <span className="text-[13px] text-secondary">
              {messages.hammingDistance}: {group.distance}/64
            </span>
            <span className="text-xs text-white/40 font-mono">{group.paths.length} ファイル</span>
          </div>

          {/* Files in group */}
          <div className="bg-black">
            {group.paths.map((p, idx) => (
              <div
                key={p}
                className="group flex justify-between items-center px-3 py-2 border-b border-white/5 last:border-b-0 hover:bg-secondary/5 transition-colors"
              >
                <div className="flex items-center flex-1 min-w-0 mr-3 gap-2">
                  {idx === 0 && (
                    <span className="bg-secondary text-black text-[10px] px-1.5 py-0.5 font-medium shrink-0">
                      {messages.keep}
                    </span>
                  )}
                  <span className="text-[11px] text-white/40 font-mono truncate">{p}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    type="button"
                    title={messages.preview}
                    onClick={() => onPreview(p)}
                    className="p-1.5 text-white/30 hover:text-secondary transition-colors focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none"
                    aria-label={messages.preview}
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    type="button"
                    title={messages.delete}
                    onClick={() => {
                      onDelete(p);
                    }}
                    className="p-1.5 text-white/30 hover:text-error transition-colors focus-visible:ring-2 focus-visible:ring-error focus-visible:outline-none"
                    aria-label={messages.delete}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
