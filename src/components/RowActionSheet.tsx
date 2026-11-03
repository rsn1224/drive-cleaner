// ==========================================
// Row Action Sheet Component
// スマホ幅でファイル行の操作をまとめて表示するボトムシート
// ==========================================

import { type ReactElement, useEffect } from 'react';

import { messages } from '../i18n/messages';
import type { FileNode } from '../types';

export interface RowAction {
  id: string;
  icon: string;
  label: string;
  tone?: 'default' | 'warning' | 'error';
  onSelect: () => void;
}

interface RowActionSheetProps {
  node: FileNode;
  actions: RowAction[];
  onClose: () => void;
}

const TONE_CLASS: Record<NonNullable<RowAction['tone']>, string> = {
  default: 'text-white/80 active:bg-primary/10',
  warning: 'text-warning active:bg-warning/10',
  error: 'text-error active:bg-error/10',
};

export function RowActionSheet({ node, actions, onClose }: RowActionSheetProps): ReactElement {
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-label={messages.close}
        tabIndex={-1}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={messages.moreActions}
        className="relative w-full max-w-md bg-surface-container border-t border-primary/30 safe-bottom"
      >
        <div className="px-4 pt-3 pb-2 border-b border-white/5">
          <div className="hud-label text-primary/70 mb-1">{messages.moreActions}</div>
          <div className="text-sm text-white/90 truncate">{node.name}</div>
        </div>
        <ul>
          {actions.map((action) => (
            <li key={action.id}>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  action.onSelect();
                }}
                className={`w-full flex items-center gap-4 px-4 min-h-12 text-sm text-left transition-colors focus-visible:outline-none focus-visible:bg-primary/10 ${
                  TONE_CLASS[action.tone ?? 'default']
                }`}
              >
                <span className="material-symbols-outlined text-xl">{action.icon}</span>
                {action.label}
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-12 border-t border-white/5 text-sm text-white/50 active:bg-white/5 focus-visible:outline-none focus-visible:bg-white/5"
        >
          {messages.renameCancel}
        </button>
      </div>
    </div>
  );
}
