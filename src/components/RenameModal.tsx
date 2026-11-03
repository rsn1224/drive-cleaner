// ==========================================
// Rename Modal Component
// ==========================================

import { type ReactElement, useEffect, useRef, useState } from 'react';

import { messages } from '../i18n/messages';

interface RenameModalProps {
  target: { path: string; name: string };
  onSubmit: (newName: string) => void;
  onClose: () => void;
}

export function RenameModal({ target, onSubmit, onClose }: RenameModalProps): ReactElement {
  const [value, setValue] = useState(target.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    // Select filename without extension
    const dot = target.name.lastIndexOf('.');
    inputRef.current?.setSelectionRange(0, dot > 0 ? dot : target.name.length);
  }, [target.name]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSubmit(value);
    if (e.key === 'Escape') onClose();
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
        className="relative bg-surface-container border border-primary/30 p-4 w-full max-w-80 mx-4 z-10"
      >
        <div className="text-xs text-primary font-mono mb-3 hud-label">{messages.renameTitle}</div>
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
          className="w-full bg-white/5 border border-white/20 focus:border-primary/60 text-white/90 text-base sm:text-sm px-2 py-2 sm:py-1.5 outline-none font-mono"
        />
        <div className="flex gap-2 mt-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 sm:px-3 sm:py-1 text-xs text-white/40 hover:text-white/60 border border-white/10 hover:border-white/20 transition-colors"
          >
            {messages.renameCancel}
          </button>
          <button
            type="button"
            onClick={() => onSubmit(value)}
            disabled={!value.trim()}
            className="px-4 py-2 sm:px-3 sm:py-1 text-xs bg-primary/10 text-primary border border-primary/40 hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {messages.renameConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}
