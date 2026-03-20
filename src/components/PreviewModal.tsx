// ==========================================
// Preview Modal Component
// ==========================================

import type { ReactElement } from "react";
import { X } from "lucide-react";

import { formatSize } from "../lib/utils";
import type { FilePreview } from "../types";

interface PreviewModalProps {
  preview: FilePreview;
  previewPath: string;
  onClose: () => void;
}

export function PreviewModal({
  preview,
  previewPath,
  onClose,
}: PreviewModalProps): ReactElement {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-primary/20 hud-bracket max-w-4xl max-h-[80vh] w-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-primary/10">
          <h3 className="text-primary font-medium truncate hud-label tracking-widest">
            プレビュー: {previewPath.split(/[\\/]/).pop()}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-white/30 hover:text-error p-1 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {preview.kind === "text" ? (
            <div className="bg-black border border-white/5 p-4 font-mono text-sm text-white/90 whitespace-pre-wrap break-all">
              {preview.content}
            </div>
          ) : preview.kind === "image" ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <img
                src={preview.content}
                alt="Preview"
                className="max-w-full max-h-[60vh] object-contain"
              />
            </div>
          ) : (
            <div className="text-center text-white/40 py-8">
              <p className="mb-2">このファイル形式はプレビューできません</p>
              <p className="text-sm text-white/30">
                サイズ: {formatSize(preview.size)}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-primary/10 flex justify-between items-center">
          <span className="text-xs text-white/30 font-mono">
            {previewPath}
          </span>
          <span className="text-xs text-white/30">
            {formatSize(preview.size)}
          </span>
        </div>
      </div>
    </div>
  );
}
