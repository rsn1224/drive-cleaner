// ==========================================
// Empty Folders Commands for Drive Cleaner
// ==========================================

use jwalk::WalkDir;
use tauri::{AppHandle, Emitter, State};
use tokio_util::sync::CancellationToken;
use tracing::{info, warn};

use crate::state::ScanState;
use crate::types::{EmptyFolder, ScanProgress};

#[tauri::command]
pub async fn find_empty_folders(
    app: AppHandle,
    state: State<'_, ScanState>,
    target_dir: String,
) -> Result<Vec<EmptyFolder>, String> {
    let token = CancellationToken::new();
    {
        let mut guard = state
            .cancel_token
            .lock()
            .map_err(|e| format!("Lock poisoned: {e}"))?;
        if let Some(old) = guard.as_ref() {
            old.cancel();
        }
        *guard = Some(token.clone());
    }

    let mut results: Vec<EmptyFolder> = Vec::new();
    let mut scanned: usize = 0;

    for entry in WalkDir::new(&target_dir)
        .follow_links(false)
        .sort(true)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        if token.is_cancelled() {
            return Err("Scan was cancelled".to_string());
        }

        if entry.file_type().is_dir() {
            let path = entry.path();
            // read_dir で中身を確認 — エントリが0件なら空
            if let Ok(mut entries) = std::fs::read_dir(&path) {
                if entries.next().is_none() {
                    // target_dir 自体は除外
                    let path_str = path.to_string_lossy().into_owned();
                    if path_str != target_dir {
                        results.push(EmptyFolder {
                            name: entry.file_name().to_string_lossy().into_owned(),
                            path: path_str,
                        });
                    }
                }
            }

            scanned += 1;
            if scanned.is_multiple_of(1000) {
                let _ = app.emit(
                    "scan_progress",
                    ScanProgress {
                        phase: "空フォルダ検索中...".to_string(),
                        scanned_files: scanned,
                    },
                );
            }
        }
    }

    results.sort_by(|a, b| a.path.cmp(&b.path));

    info!(
        "Empty folder scan complete: {} empty folders found from {} dirs scanned",
        results.len(),
        scanned
    );

    Ok(results)
}

#[tauri::command]
pub async fn delete_empty_folders(paths: Vec<String>) -> Result<usize, String> {
    let mut deleted = 0usize;
    for path in &paths {
        match tokio::fs::remove_dir(path).await {
            Ok(()) => deleted += 1,
            Err(e) => warn!("Failed to delete empty folder {path}: {e}"),
        }
    }
    info!("Deleted {deleted}/{} empty folders", paths.len());
    Ok(deleted)
}
