// ==========================================
// Temp Cleaner Commands for Drive Cleaner
// ==========================================

use jwalk::WalkDir;
use tauri::{AppHandle, Emitter, State};
use tokio_util::sync::CancellationToken;
use tracing::{info, warn};

use super::temp_paths::{
    get_browser_cache_paths, get_temp_paths, is_browser_cache_file, is_safe_to_delete,
};
use crate::state::ScanState;
use crate::types::{CleanResult, ScanProgress, TempCategory, TempItem, TempScanResult};

#[tauri::command]
pub async fn scan_temp_files(
    app: AppHandle,
    state: State<'_, ScanState>,
) -> Result<TempScanResult, String> {
    let token = CancellationToken::new();
    {
        let mut guard = state.cancel_token.lock().map_err(|e| {
            tracing::error!("Lock poisoned: {e}");
            "内部ロックエラーが発生しました".to_string()
        })?;
        if let Some(old) = guard.as_ref() {
            old.cancel();
        }
        *guard = Some(token.clone());
    }

    // システム一時ファイルとブラウザキャッシュを結合してスキャン
    let system_paths = get_temp_paths();
    let browser_paths = get_browser_cache_paths();

    let mut categories: Vec<TempCategory> = Vec::new();
    let mut total_files: usize = 0;
    let mut total_size: u64 = 0;
    let mut scanned: usize = 0;

    // (name, path, browser_cache: bool)
    let all_paths: Vec<(String, String, bool)> = system_paths
        .into_iter()
        .map(|(n, p)| (n, p, false))
        .chain(browser_paths.into_iter().map(|(n, p)| (n, p, true)))
        .collect();

    for (name, path, is_browser) in &all_paths {
        if token.is_cancelled() {
            return Err("Scan was cancelled".to_string());
        }

        let mut items: Vec<TempItem> = Vec::new();
        let mut cat_size: u64 = 0;

        for entry in WalkDir::new(path)
            .follow_links(false)
            .sort(false)
            .into_iter()
            .filter_map(|e| e.ok())
        {
            if token.is_cancelled() {
                return Err("Scan was cancelled".to_string());
            }

            if entry.file_type().is_file() {
                if let Ok(meta) = entry.metadata() {
                    let ext = entry
                        .path()
                        .extension()
                        .and_then(|e| e.to_str())
                        .unwrap_or("")
                        .to_lowercase();

                    // ブラウザキャッシュは拡張子不問、システム一時は安全な拡張子のみ
                    if *is_browser || is_safe_to_delete(&ext) {
                        let size = meta.len();
                        items.push(TempItem {
                            path: entry.path().to_string_lossy().into_owned(),
                            name: entry.file_name().to_string_lossy().into_owned(),
                            size,
                        });
                        cat_size += size;
                    }
                }

                scanned += 1;
                if scanned.is_multiple_of(500) {
                    let _ = app.emit(
                        "scan_progress",
                        ScanProgress {
                            phase: format!("{name} スキャン中..."),
                            scanned_files: scanned,
                        },
                    );
                }
            }
        }

        if !items.is_empty() {
            total_files += items.len();
            total_size += cat_size;
            categories.push(TempCategory {
                name: name.clone(),
                path: path.clone(),
                file_count: items.len(),
                total_size: cat_size,
                items,
            });
        }
    }

    info!(
        "Temp scan complete: {} categories, {} files, {} bytes",
        categories.len(),
        total_files,
        total_size
    );

    Ok(TempScanResult {
        categories,
        total_files,
        total_size,
    })
}

#[tauri::command]
pub async fn clean_temp_files(paths: Vec<String>) -> Result<CleanResult, String> {
    let mut deleted_count: usize = 0;
    let mut freed_size: u64 = 0;
    let mut errors: Vec<String> = Vec::new();

    for path in &paths {
        // セキュリティ検証: 安全な拡張子 OR ブラウザキャッシュディレクトリ配下のみ許可
        let ext = std::path::Path::new(path)
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("")
            .to_lowercase();
        if !is_safe_to_delete(&ext) && !is_browser_cache_file(path) {
            warn!("Skipping unsafe extension: {path}");
            errors.push(format!("{path}: unsafe extension .{ext}"));
            continue;
        }

        match tokio::fs::metadata(path).await {
            Ok(meta) => {
                let size = meta.len();
                match tokio::fs::remove_file(path).await {
                    Ok(()) => {
                        deleted_count += 1;
                        freed_size += size;
                    }
                    Err(e) => {
                        warn!("Failed to delete {path}: {e}");
                        errors.push(format!("{path}: {e}"));
                    }
                }
            }
            Err(e) => {
                warn!("Cannot access {path}: {e}");
                errors.push(format!("{path}: {e}"));
            }
        }
    }

    info!(
        "Cleaned {deleted_count}/{} files, freed {} bytes",
        paths.len(),
        freed_size
    );
    Ok(CleanResult {
        deleted_count,
        freed_size,
        errors,
    })
}
