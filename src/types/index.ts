// ==========================================
// Types for Drive Cleaner
// ==========================================

export interface FileNode {
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
}

export interface DuplicateGroup {
  hash: string;
  size: number;
  paths: string[];
}

export interface LargeFile {
  path: string;
  size: number;
  name: string;
}

export interface EmptyFolder {
  path: string;
  name: string;
}

export interface OldFile {
  path: string;
  name: string;
  size: number;
  modified_at: string;
  days_old: number;
}

export interface FileCategory {
  category: string;
  extensions: string[];
  file_count: number;
  total_size: number;
}

export interface FileTypeAnalysis {
  categories: FileCategory[];
  total_files: number;
  total_size: number;
}

export interface FolderSize {
  path: string;
  name: string;
  size: number;
  file_count: number;
  children: FolderSize[];
}

export interface TempCategory {
  name: string;
  path: string;
  file_count: number;
  total_size: number;
  items: TempItem[];
}

export interface TempItem {
  path: string;
  name: string;
  size: number;
}

export interface TempScanResult {
  categories: TempCategory[];
  total_files: number;
  total_size: number;
}

export interface CleanResult {
  deleted_count: number;
  freed_size: number;
  errors: string[];
}

export type AppMode = "browse" | "duplicates" | "large_files" | "empty_folders" | "old_files" | "file_types" | "disk_usage" | "temp_cleaner";

export interface ScanProgress {
  phase: string;
  scanned_files: number;
}

export interface FilePreview {
  kind: "text" | "image" | "binary";
  content: string;
  size: number;
}

export type SortKey = "name" | "size";
export type SortDir = "asc" | "desc";
