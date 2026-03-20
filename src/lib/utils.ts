// ==========================================
// Utility functions for Drive Cleaner
// ==========================================


// ==========================================
// Constants
// ==========================================

export const IS_WINDOWS = navigator.userAgent.includes("Windows");
export const DEFAULT_PATH = IS_WINDOWS ? "C:\\" : "/";
export const ROW_HEIGHT = 52;

// ==========================================
// Utility functions
// ==========================================

export function formatSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function formatDate(isoString: string): string {
  const d = new Date(isoString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}/${m}/${day}`;
}

export function getParentPath(currentPath: string): string {
  const trimmed = currentPath.replace(/[\\/]+$/, "");
  const idx = Math.max(trimmed.lastIndexOf("/"), trimmed.lastIndexOf("\\"));
  if (idx <= 0) return DEFAULT_PATH;
  const parent = trimmed.slice(0, idx);
  // Windows drive root: "C:" → "C:\\"
  if (IS_WINDOWS && parent.length === 2 && parent[1] === ":") {
    return parent + "\\";
  }
  return parent;
}

export function parseBreadcrumb(path: string): { label: string; path: string }[] {
  const parts = path.split(/[\\/]/).filter(Boolean);
  const crumbs: { label: string; path: string }[] = [];

  if (IS_WINDOWS) {
    // "C:" as root
    let accumulated = "";
    for (const part of parts) {
      accumulated += accumulated ? `\\${part}` : `${part}\\`;
      crumbs.push({ label: part, path: accumulated.slice(0, -1) });
    }
  } else {
    // Unix root "/"
    let accumulated = "";
    for (const part of parts) {
      accumulated += `/${part}`;
      crumbs.push({ label: part, path: accumulated });
    }
  }

  return crumbs;
}
