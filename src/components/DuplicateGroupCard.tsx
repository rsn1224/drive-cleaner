// ==========================================
// Duplicate Group Card - single duplicate file group
// ==========================================

import { Eye, Trash2 } from 'lucide-react';
import type { ReactElement } from 'react';

import { messages } from '../i18n/messages';
import { formatSize } from '../lib/utils';
import type { DuplicateGroup } from '../types';

interface DuplicateGroupCardProps {
  group: DuplicateGroup;
  selectedPaths: Set<string>;
  onTogglePath: (path: string) => void;
  onPreview: (path: string) => void;
  onDelete: (path: string, hash: string) => void;
}

export function DuplicateGroupCard({
  group,
  selectedPaths,
  onTogglePath,
  onPreview,
  onDelete,
}: DuplicateGroupCardProps): ReactElement {
  return (
    <fieldset
      className="min-w-0 bg-black border border-white/5 border-l-2 border-l-primary overflow-hidden mx-3"
      aria-label={messages.duplicateGroup}
    >
      <div className="flex justify-between items-center px-3 py-2.5 border-b border-white/5">
        <span className="text-xs text-primary">
          {messages.wastedSpace}: {formatSize(group.size * (group.paths.length - 1))}
        </span>
        <span className="text-xs text-white/40 font-mono">
          {messages.fileSize}: {formatSize(group.size)}
        </span>
      </div>
      <div className="bg-black">
        {group.paths.map((p, idx) => {
          const isSelected = selectedPaths.has(p);
          return (
            <div
              key={p}
              className={`group flex justify-between items-center px-3 py-2 border-b border-white/5 last:border-b-0 transition-colors ${
                isSelected ? 'bg-error/5 hover:bg-error/10' : 'hover:bg-primary/5'
              }`}
            >
              <div className="flex items-center flex-1 min-w-0 mr-3 gap-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onTogglePath(p)}
                  className="shrink-0 accent-primary cursor-pointer"
                  aria-label={`${p} を選択`}
                />
                {idx === 0 && !isSelected ? (
                  <span className="bg-secondary text-black text-[10px] px-1.5 py-0.5 font-medium shrink-0">
                    {messages.keep}
                  </span>
                ) : isSelected ? (
                  <span className="bg-error/20 text-error text-[10px] px-1.5 py-0.5 font-medium shrink-0 border border-error/30">
                    {messages.markForDeletion}
                  </span>
                ) : (
                  <span className="w-12 shrink-0" />
                )}
                <span className="text-[11px] text-white/40 font-mono truncate">{p}</span>
              </div>
              <div className="flex gap-1 reveal-on-hover shrink-0">
                <button
                  type="button"
                  title={messages.preview}
                  onClick={() => onPreview(p)}
                  className="touch-target p-1.5 text-white/30 hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                  aria-label={messages.preview}
                >
                  <Eye size={14} />
                </button>
                <button
                  type="button"
                  title={messages.delete}
                  onClick={() => onDelete(p, group.hash)}
                  className="touch-target p-1.5 text-white/30 hover:text-error transition-colors focus-visible:ring-2 focus-visible:ring-error focus-visible:outline-none"
                  aria-label={messages.delete}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
