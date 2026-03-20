// ==========================================
// Browse Commands for Drive Cleaner
// ==========================================

use crate::types::FileNode;
use tokio::fs as async_fs;
use tracing::warn;

#[tauri::command]
pub fn get_directory_contents(path: String) -> Result<Vec<FileNode>, String> {
    let entries = std::fs::read_dir(&path).map_err(|e| e.to_string())?;
    let mut nodes: Vec<FileNode> = entries
        .filter_map(|entry| {
            let entry = entry.ok()?;
            let meta = entry.metadata().ok()?;
            let is_dir = meta.is_dir();
            let size = if is_dir { 0 } else { meta.len() };
            Some(FileNode {
                name: entry.file_name().to_string_lossy().to_string(),
                path: entry.path().to_string_lossy().to_string(),
                is_dir,
                size,
            })
        })
        .collect();

    // Folders first, then case-insensitive alphabetical
    nodes.sort_by(|a, b| {
        b.is_dir
            .cmp(&a.is_dir)
            .then_with(|| a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });

    Ok(nodes)
}

#[tauri::command]
pub async fn delete_item(path: String) -> Result<(), String> {
    let meta = async_fs::metadata(&path)
        .await
        .map_err(|e| e.to_string())?;

    if meta.is_dir() {
        async_fs::remove_dir_all(&path)
            .await
            .map_err(|e| e.to_string())
    } else {
        async_fs::remove_file(&path)
            .await
            .map_err(|e| e.to_string())
    }
}

#[allow(dead_code)]
#[tauri::command]
pub async fn bulk_delete(paths: Vec<String>) -> Result<usize, String> {
    let mut success_count = 0;
    for path in &paths {
        let meta = match async_fs::metadata(path).await {
            Ok(m) => m,
            Err(e) => {
                warn!("bulk_delete: skip {path}: {e}");
                continue;
            }
        };
        let result = if meta.is_dir() {
            async_fs::remove_dir_all(path).await
        } else {
            async_fs::remove_file(path).await
        };
        match result {
            Ok(()) => success_count += 1,
            Err(e) => warn!("bulk_delete: failed {path}: {e}"),
        }
    }
    Ok(success_count)
}
