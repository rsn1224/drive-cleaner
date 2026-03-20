// ==========================================
// Old Files Commands for Drive Cleaner
// ==========================================

use std::time::SystemTime;

use chrono::{DateTime, Local};
use jwalk::WalkDir;
use tauri::{AppHandle, Emitter, State};
use tokio_util::sync::CancellationToken;
use tracing::info;

use crate::state::ScanState;
use crate::types::{OldFile, ScanProgress};

const SECS_PER_DAY: u64 = 86400;

#[tauri::command]
pub async fn find_old_files(
    app: AppHandle,
    state: State<'_, ScanState>,
    target_dir: String,
    min_days: u64,
    top_n: usize,
) -> Result<Vec<OldFile>, String> {
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

    let now = SystemTime::now();
    let mut results: Vec<OldFile> = Vec::new();
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

        if entry.file_type().is_file() {
            if let Ok(meta) = entry.metadata() {
                if let Ok(modified) = meta.modified() {
                    if let Ok(elapsed) = now.duration_since(modified) {
                        let days_old = elapsed.as_secs() / SECS_PER_DAY;
                        if days_old >= min_days {
                            let datetime: DateTime<Local> = modified.into();
                            results.push(OldFile {
                                path: entry.path().to_string_lossy().into_owned(),
                                name: entry.file_name().to_string_lossy().into_owned(),
                                size: meta.len(),
                                modified_at: datetime.format("%Y-%m-%dT%H:%M:%S").to_string(),
                                days_old,
                            });
                        }
                    }
                }
            }

            scanned += 1;
            if scanned.is_multiple_of(1000) {
                let _ = app.emit(
                    "scan_progress",
                    ScanProgress {
                        phase: "古いファイル検索中...".to_string(),
                        scanned_files: scanned,
                    },
                );
            }
        }
    }

    // 最も古い順にソート、先頭 top_n 件のみ返す
    results.sort_by(|a, b| b.days_old.cmp(&a.days_old));
    results.truncate(top_n);

    info!(
        "Old file scan complete: {} files found (>= {} days) from {} scanned",
        results.len(),
        min_days,
        scanned
    );

    Ok(results)
}
