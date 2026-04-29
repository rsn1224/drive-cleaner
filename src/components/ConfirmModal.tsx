// ==========================================
// In-App Confirmation Modal
// Replaces native ask() dialog which may appear behind
// frameless (decorations: false) windows on Windows.
// ==========================================

import { AlertTriangle } from 'lucide-react';
import { type ReactElement, useEffect } from 'react';

interface ConfirmModalProps {
  message: string;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  message,
  title,
  onConfirm,
  onCancel,
}: ConfirmModalProps): ReactElement {
  // Escape キーでキャンセル、Enter で確認
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onConfirm, onCancel]);

  return (
    // backdrop: button として扱い onKeyDown も付与してアクセシビリティ対応
    <button
      type="button"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 w-full"
      onClick={onCancel}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancel();
      }}
      aria-label="モーダルを閉じる"
    >
      {/* inner panel: クリックが backdrop まで伝播しないよう block */}
      <div
        className="bg-[#0a0a0a] border border-white/20 border-l-4 border-l-error w-full max-w-sm mx-4 p-6 text-left"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle size={20} className="text-error shrink-0" />
          <h2
            id="confirm-title"
            className="text-white/90 font-mono text-sm font-bold tracking-wider uppercase"
          >
            {title}
          </h2>
        </div>
        <p className="text-white/70 text-sm mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-mono text-white/50 border border-white/10 hover:border-white/30 hover:text-white/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-mono bg-error/80 hover:bg-error text-black font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error"
          >
            実行
          </button>
        </div>
      </div>
    </button>
  );
}
