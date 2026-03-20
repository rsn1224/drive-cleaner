// ==========================================
// Preview Modal Component
// ==========================================

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
}: PreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] rounded-lg border border-[#1f2937] max-w-4xl max-h-[80vh] w-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-[#1f2937]">
          <h3 className="text-white font-medium truncate">
            プレビュー: {previewPath.split(/[\\/]/).pop()}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[#6b7280] hover:text-white p-1 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {preview.kind === "text" ? (
            <div className="bg-[#030712] rounded p-4 font-mono text-sm text-[#d1d5db] whitespace-pre-wrap break-all">
              {preview.content}
            </div>
          ) : preview.kind === "image" ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <img
                src={preview.content}
                alt="Preview"
                className="max-w-full max-h-[60vh] object-contain rounded"
              />
            </div>
          ) : (
            <div className="text-center text-[#6b7280] py-8">
              <p className="mb-2">このファイル形式はプレビューできません</p>
              <p className="text-sm text-[#4b5563]">
                サイズ: {formatSize(preview.size)}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[#1f2937] flex justify-between items-center">
          <span className="text-xs text-[#6b7280] font-mono">
            {previewPath}
          </span>
          <span className="text-xs text-[#6b7280]">
            {formatSize(preview.size)}
          </span>
        </div>
      </div>
    </div>
  );
}
