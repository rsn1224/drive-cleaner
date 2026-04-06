import { type ReactElement, useCallback } from "react";
import { messages } from "../../i18n/messages";
import type { AppMode } from "../../types";

const MODE_LABELS: Record<AppMode, string> = {
  browse: messages.modeBrowser,
  duplicates: messages.modeDuplicates,
  large_files: messages.modeLargeFiles,
  empty_folders: messages.modeEmptyFolders,
  old_files: messages.modeOldFiles,
  file_types: messages.modeFileTypes,
  disk_usage: messages.modeDiskUsage,
  temp_cleaner: messages.modeTempCleaner,
  similar_images: messages.modeSimilarImages,
};

interface HudHeaderProps {
  mode: AppMode;
  onBack?: () => void;
}

export function HudHeader({ mode, onBack }: HudHeaderProps): ReactElement {
  const showBack = mode !== "browse";

  const handleMinimize = useCallback(async (): Promise<void> => {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    await getCurrentWindow().minimize();
  }, []);

  const handleMaximize = useCallback(async (): Promise<void> => {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const win = getCurrentWindow();
    if (await win.isMaximized()) {
      await win.unmaximize();
    } else {
      await win.maximize();
    }
  }, []);

  const handleClose = useCallback(async (): Promise<void> => {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    await getCurrentWindow().close();
  }, []);

  return (
    <header
      className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-14 bg-black/95 border-b border-primary/20 backdrop-blur-md"
      data-tauri-drag-region
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-primary hover:text-white transition-colors mr-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            data-testid="back-button"
            aria-label={messages.back}
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>
        )}
        <span className="material-symbols-outlined text-primary glow-cyan text-xl">terminal</span>
        <h1 className="text-sm font-bold tracking-[0.3em] text-primary glow-cyan uppercase">
          {messages.appTitle}
        </h1>
      </div>
      <div className="flex items-center gap-6">
        <span className="hud-label text-primary border-b border-primary pb-0.5">
          {MODE_LABELS[mode]}
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={handleMinimize}
            className="w-3 h-3 rounded-full bg-primary/30 hover:bg-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            title={messages.minimize}
            aria-label={messages.minimize}
          />
          <button
            type="button"
            onClick={handleMaximize}
            className="w-3 h-3 rounded-full bg-tertiary/30 hover:bg-tertiary transition-colors focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:outline-none"
            title={messages.maximize}
            aria-label={messages.maximize}
          />
          <button
            type="button"
            onClick={handleClose}
            className="w-3 h-3 rounded-full bg-error/30 hover:bg-error transition-colors focus-visible:ring-2 focus-visible:ring-error focus-visible:outline-none"
            title={messages.close}
            aria-label={messages.close}
          />
        </div>
      </div>
    </header>
  );
}
