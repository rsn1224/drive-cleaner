// ==========================================
// Large Files Commands for Drive Cleaner
// ==========================================

use std::cmp::Reverse;
use std::collections::BinaryHeap;

use jwalk::WalkDir;
use tauri::{AppHandle, Emitter, State};
use tokio_util::sync::CancellationToken;
use tracing::info;

use crate::state::ScanState;
use crate::types::{LargeFile, ScanProgress};

#[tauri::command]
pub async fn find_large_files(
    app: AppHandle,
    state: State<'_, ScanState>,
    target_dir: String,
    top_n: usize,
    min_size: u64,
) -> Result<Vec<LargeFile>, String> {
    // 1. CancellationToken を取得（既存の cancel_scan で中止可能）
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

    // 2. jwalk で走査、BinaryHeap (min-heap) でトップN を維持
    let mut heap: BinaryHeap<Reverse<(u64, String, String)>> = BinaryHeap::new();
    let mut scanned: usize = 0;

    for entry in WalkDir::new(&target_dir)
        .follow_links(false)
        .sort(true)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        // キャンセルチェック
        if token.is_cancelled() {
            return Err("Scan was cancelled".to_string());
        }

        if entry.file_type().is_file() {
            if let Ok(meta) = entry.metadata() {
                let size = meta.len();
                if size >= min_size {
                    let path = entry.path().to_string_lossy().into_owned();
                    let name = entry.file_name().to_string_lossy().into_owned();

                    if heap.len() < top_n {
                        heap.push(Reverse((size, path, name)));
                    } else if let Some(&Reverse((min_size_in_heap, _, _))) = heap.peek() {
                        if size > min_size_in_heap {
                            heap.pop();
                            heap.push(Reverse((size, path, name)));
                        }
                    }
                }

                scanned += 1;
                if scanned.is_multiple_of(1000) {
                    let _ = app.emit(
                        "scan_progress",
                        ScanProgress {
                            phase: "大容量ファイル検索中...".to_string(),
                            scanned_files: scanned,
                        },
                    );
                }
            }
        }
    }

    // 3. 結果をサイズ降順で返す
    let mut results: Vec<LargeFile> = heap
        .into_iter()
        .map(|Reverse((size, path, name))| LargeFile { path, size, name })
        .collect();
    results.sort_by(|a, b| b.size.cmp(&a.size));

    info!(
        "Large file scan complete: {} files found from {} scanned",
        results.len(),
        scanned
    );

    Ok(results)
}
