// ==========================================
// Disk Usage Analysis Commands for Drive Cleaner
// ==========================================

use std::path::Path;

use jwalk::WalkDir;
use tauri::{AppHandle, Emitter, State};
use tokio_util::sync::CancellationToken;
use tracing::info;

use crate::state::ScanState;
use crate::types::{FolderSize, ScanProgress};

/// 指定パスのフォルダ合計サイズとファイル数を再帰計算（jwalk使用）
fn calc_folder_size(path: &Path, token: &CancellationToken) -> (u64, usize) {
    let mut size: u64 = 0;
    let mut count: usize = 0;

    for entry in WalkDir::new(path)
        .follow_links(false)
        .sort(false)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        if token.is_cancelled() {
            return (size, count);
        }
        if entry.file_type().is_file() {
            if let Ok(meta) = entry.metadata() {
                size += meta.len();
                count += 1;
            }
        }
    }
    (size, count)
}

#[tauri::command]
pub async fn analyze_disk_usage(
    app: AppHandle,
    state: State<'_, ScanState>,
    target_dir: String,
    depth: usize,
) -> Result<FolderSize, String> {
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

    let _ = app.emit(
        "scan_progress",
        ScanProgress {
            phase: "ディスク使用量分析中...".to_string(),
            scanned_files: 0,
        },
    );

    let root_path = Path::new(&target_dir);
    let root_name = root_path
        .file_name()
        .map(|n| n.to_string_lossy().into_owned())
        .unwrap_or_else(|| target_dir.clone());

    let mut children: Vec<FolderSize> = Vec::new();
    let mut root_file_size: u64 = 0;
    let mut root_file_count: usize = 0;

    // 直下のエントリを読み取り
    let entries = std::fs::read_dir(root_path).map_err(|e| e.to_string())?;

    for entry in entries {
        if token.is_cancelled() {
            return Err("Scan was cancelled".to_string());
        }

        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();

        if path.is_file() {
            if let Ok(meta) = entry.metadata() {
                root_file_size += meta.len();
                root_file_count += 1;
            }
        } else if path.is_dir() && depth > 0 {
            let (size, count) = calc_folder_size(&path, &token);
            let name = path
                .file_name()
                .map(|n| n.to_string_lossy().into_owned())
                .unwrap_or_default();

            children.push(FolderSize {
                path: path.to_string_lossy().into_owned(),
                name,
                size,
                file_count: count,
                children: Vec::new(), // 子の子はドリルダウン時に取得
            });
        }
    }

    // サイズ降順ソート
    children.sort_by(|a, b| b.size.cmp(&a.size));

    let total_size = root_file_size + children.iter().map(|c| c.size).sum::<u64>();
    let total_count = root_file_count + children.iter().map(|c| c.file_count).sum::<usize>();

    info!(
        "Disk usage analysis complete: {} children, {} total size",
        children.len(),
        total_size
    );

    Ok(FolderSize {
        path: target_dir,
        name: root_name,
        size: total_size,
        file_count: total_count,
        children,
    })
}
