// ==========================================
// Temp Cleaner Commands for Drive Cleaner
// ==========================================

use jwalk::WalkDir;
use tauri::{AppHandle, Emitter, State};
use tokio_util::sync::CancellationToken;
use tracing::{info, warn};

use crate::state::ScanState;
use crate::types::{CleanResult, ScanProgress, TempCategory, TempItem, TempScanResult};

const SAFE_EXTENSIONS: &[&str] = &[
    "tmp", "log", "bak", "old", "dmp", "etl", "chk", "temp",
];

fn is_safe_to_delete(ext: &str) -> bool {
    SAFE_EXTENSIONS.contains(&ext)
}

fn get_temp_paths() -> Vec<(String, String)> {
    // (カテゴリ名, パス) のペア
    let mut paths = Vec::new();

    // 1. %TEMP%
    let temp = std::env::temp_dir();
    paths.push(("Windows Temp".to_string(), temp.to_string_lossy().into_owned()));

    // 2. %LOCALAPPDATA%\Temp
    if let Some(local) = dirs::data_local_dir() {
        let local_temp = local.join("Temp");
        if local_temp.exists() && local_temp != temp {
            paths.push(("Local App Temp".to_string(), local_temp.to_string_lossy().into_owned()));
        }

        // 3. CrashDumps
        let crash = local.join("CrashDumps");
        if crash.exists() {
            paths.push(("クラッシュダンプ".to_string(), crash.to_string_lossy().into_owned()));
        }
    }

    // 4. Windows Prefetch (読めるファイルのみ)
    let prefetch = std::path::Path::new("C:\\Windows\\Prefetch");
    if prefetch.exists() {
        paths.push(("Windows Prefetch".to_string(), prefetch.to_string_lossy().into_owned()));
    }

    paths
}

#[tauri::command]
pub async fn scan_temp_files(
    app: AppHandle,
    state: State<'_, ScanState>,
) -> Result<TempScanResult, String> {
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

    let temp_paths = get_temp_paths();
    let mut categories: Vec<TempCategory> = Vec::new();
    let mut total_files: usize = 0;
    let mut total_size: u64 = 0;
    let mut scanned: usize = 0;

    for (name, path) in &temp_paths {
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

                    if is_safe_to_delete(&ext) {
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

    info!("Cleaned {deleted_count}/{} files, freed {} bytes", paths.len(), freed_size);
    Ok(CleanResult {
        deleted_count,
        freed_size,
        errors,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn safe_extensions_accepted() {
        assert!(is_safe_to_delete("tmp"));
        assert!(is_safe_to_delete("log"));
        assert!(is_safe_to_delete("bak"));
        assert!(is_safe_to_delete("dmp"));
        assert!(is_safe_to_delete("etl"));
        assert!(is_safe_to_delete("old"));
        assert!(is_safe_to_delete("chk"));
        assert!(is_safe_to_delete("temp"));
    }

    #[test]
    fn unsafe_extensions_rejected() {
        assert!(!is_safe_to_delete("exe"));
        assert!(!is_safe_to_delete("dll"));
        assert!(!is_safe_to_delete("sys"));
        assert!(!is_safe_to_delete("doc"));
        assert!(!is_safe_to_delete("jpg"));
        assert!(!is_safe_to_delete("rs"));
        assert!(!is_safe_to_delete(""));
    }

    #[test]
    fn temp_paths_not_empty() {
        let paths = get_temp_paths();
        assert!(!paths.is_empty(), "should find at least one temp path");
        // Windows should always have %TEMP%
        assert!(
            paths.iter().any(|(name, _)| name == "Windows Temp"),
            "should include Windows Temp"
        );
    }
}
