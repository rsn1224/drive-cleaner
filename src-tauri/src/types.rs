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

#[derive(Serialize, Clone)]
pub struct DriveInfo {
    pub name: String,
    pub mount_point: String,
    pub total: u64,
    pub free: u64,
    pub used: u64,
    pub fs_type: String,
}

#[derive(Serialize, Clone)]
pub struct RecycleBinInfo {
    pub item_count: u64,
    pub total_size: u64,
}

#[derive(Serialize, Clone)]
pub struct BulkMoveResult {
    pub moved_count: usize,
    pub errors: Vec<String>,
}

#[derive(Serialize)]
pub struct FilePreview {
    pub kind: String, // "text" | "image" | "binary"
    pub content: String,
    pub size: u64,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn file_node_serializes() {
        let node = FileNode {
            name: "test.txt".to_string(),
            path: "/tmp/test.txt".to_string(),
            is_dir: false,
            size: 1024,
        };
        let json = serde_json::to_string(&node).unwrap();
        assert!(json.contains("\"name\":\"test.txt\""));
        assert!(json.contains("\"is_dir\":false"));
        assert!(json.contains("\"size\":1024"));
    }

    #[test]
    fn duplicate_group_roundtrips() {
        let group = DuplicateGroup {
            hash: "abc123".to_string(),
            size: 2048,
            paths: vec!["/a.txt".to_string(), "/b.txt".to_string()],
        };
        let json = serde_json::to_string(&group).unwrap();
        let parsed: DuplicateGroup = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed.hash, "abc123");
        assert_eq!(parsed.paths.len(), 2);
    }

    #[test]
    fn clean_result_serializes() {
        let result = CleanResult {
            deleted_count: 5,
            freed_size: 10240,
            errors: vec!["failed: x".to_string()],
        };
        let json = serde_json::to_string(&result).unwrap();
        assert!(json.contains("\"deleted_count\":5"));
        assert!(json.contains("\"freed_size\":10240"));
    }
}
