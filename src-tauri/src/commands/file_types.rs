// ==========================================
// File Types Analysis Commands for Drive Cleaner
// ==========================================

use std::collections::{HashMap, HashSet};

use jwalk::WalkDir;
use tauri::{AppHandle, Emitter, State};
use tokio_util::sync::CancellationToken;
use tracing::info;

use crate::state::ScanState;
use crate::types::{FileCategory, FileTypeAnalysis, ScanProgress};

fn categorize_extension(ext: &str) -> &'static str {
    match ext {
        "jpg" | "jpeg" | "png" | "gif" | "bmp" | "webp" | "svg" | "ico" | "tiff" | "raw" => "画像",
        "mp4" | "avi" | "mkv" | "mov" | "wmv" | "flv" | "webm" | "m4v" => "動画",
        "mp3" | "wav" | "flac" | "aac" | "ogg" | "wma" | "m4a" => "音楽",
        "pdf" | "doc" | "docx" | "xls" | "xlsx" | "ppt" | "pptx" | "txt" | "md" | "rtf" | "csv" => "文書",
        "zip" | "rar" | "7z" | "tar" | "gz" | "bz2" | "xz" | "zst" => "アーカイブ",
        "rs" | "ts" | "tsx" | "js" | "jsx" | "py" | "java" | "c" | "cpp" | "h" | "go" | "rb"
        | "php" | "swift" | "kt" | "cs" | "html" | "css" | "scss" | "json" | "toml" | "yaml"
        | "yml" | "xml" | "sql" | "sh" | "bat" | "ps1" => "コード",
        _ => "その他",
    }
}

#[tauri::command]
pub async fn analyze_file_types(
    app: AppHandle,
    state: State<'_, ScanState>,
    target_dir: String,
) -> Result<FileTypeAnalysis, String> {
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

    // HashMap: category -> (extensions set, file_count, total_size)
    let mut map: HashMap<&str, (HashSet<String>, usize, u64)> = HashMap::new();
    let mut total_files: usize = 0;
    let mut total_size: u64 = 0;
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
                let size = meta.len();
                let ext = entry
                    .path()
                    .extension()
                    .and_then(|e| e.to_str())
                    .unwrap_or("")
                    .to_lowercase();

                let category = categorize_extension(&ext);
                let entry_data = map.entry(category).or_insert_with(|| (HashSet::new(), 0, 0));

                if !ext.is_empty() {
                    entry_data.0.insert(ext);
                }
                entry_data.1 += 1;
                entry_data.2 += size;

                total_files += 1;
                total_size += size;
            }

            scanned += 1;
            if scanned.is_multiple_of(1000) {
                let _ = app.emit(
                    "scan_progress",
                    ScanProgress {
                        phase: "ファイル種別分析中...".to_string(),
                        scanned_files: scanned,
                    },
                );
            }
        }
    }

    // total_size 降順でソート
    let mut categories: Vec<FileCategory> = map
        .into_iter()
        .map(|(cat, (exts, count, size))| {
            let mut ext_list: Vec<String> = exts.into_iter().collect();
            ext_list.sort();
            FileCategory {
                category: cat.to_string(),
                extensions: ext_list,
                file_count: count,
                total_size: size,
            }
        })
        .collect();
    categories.sort_by(|a, b| b.total_size.cmp(&a.total_size));

    info!(
        "File type analysis complete: {} categories, {} files, {} bytes",
        categories.len(),
        total_files,
        total_size
    );

    Ok(FileTypeAnalysis {
        categories,
        total_files,
        total_size,
    })
}
