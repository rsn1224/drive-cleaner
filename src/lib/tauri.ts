// ==========================================
// Tauri API wrappers for Drive Cleaner
// ==========================================

import { invoke } from "@tauri-apps/api/core";

export function extractErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : JSON.stringify(e);
}

// Re-export invoke for convenience
export { invoke };
