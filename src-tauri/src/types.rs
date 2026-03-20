// ==========================================
// Types for Drive Cleaner
// ==========================================

use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct FileNode {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size: u64,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct DuplicateGroup {
    pub hash: String,
    pub size: u64,
    pub paths: Vec<String>,
}

#[derive(Serialize, Clone)]
pub struct LargeFile {
    pub path: String,
    pub size: u64,
    pub name: String,
}

#[derive(Serialize, Clone)]
pub struct EmptyFolder {
    pub path: String,
    pub name: String,
}

#[derive(Serialize, Clone)]
pub struct OldFile {
    pub path: String,
    pub name: String,
    pub size: u64,
    pub modified_at: String,
    pub days_old: u64,
}

#[derive(Serialize, Clone)]
pub struct FileCategory {
    pub category: String,
    pub extensions: Vec<String>,
    pub file_count: usize,
    pub total_size: u64,
}

#[derive(Serialize, Clone)]
pub struct FileTypeAnalysis {
    pub categories: Vec<FileCategory>,
    pub total_files: usize,
    pub total_size: u64,
}

#[derive(Serialize, Clone)]
pub struct FolderSize {
    pub path: String,
    pub name: String,
    pub size: u64,
    pub file_count: usize,
    pub children: Vec<FolderSize>,
}

#[derive(Serialize, Clone)]
pub struct TempCategory {
    pub name: String,
    pub path: String,
    pub file_count: usize,
    pub total_size: u64,
    pub items: Vec<TempItem>,
}

#[derive(Serialize, Clone)]
pub struct TempItem {
    pub path: String,
    pub name: String,
    pub size: u64,
}

#[derive(Serialize, Clone)]
pub struct TempScanResult {
    pub categories: Vec<TempCategory>,
    pub total_files: usize,
    pub total_size: u64,
}

#[derive(Serialize, Clone)]
pub struct CleanResult {
    pub deleted_count: usize,
    pub freed_size: u64,
    pub errors: Vec<String>,
}

#[derive(Serialize, Clone)]
pub struct ScanProgress {
    pub phase: String,
    pub scanned_files: usize,
}

#[derive(Serialize)]
pub struct FilePreview {
    pub kind: String, // "text" | "image" | "binary"
    pub content: String,
    pub size: u64,
}
