// ==========================================
// Scan Commands for Drive Cleaner
// ==========================================

use std::collections::HashMap;
use std::fs::File;
use std::io::Read;

use jwalk::WalkDir;
use rayon::prelude::*;
use tauri::{AppHandle, Emitter, State};
use tokio_util::sync::CancellationToken;
use tracing::info;

use crate::state::ScanState;
use crate::types::{DuplicateGroup, ScanProgress};

const PARTIAL_HASH_BYTES: usize = 4096;
const FULL_HASH_BUFFER: usize = 65536;

// Hash functions
fn calc_partial_hash(path: &str) -> Result<String, std::io::Error> {
    let mut file = File::open(path)?;
    let mut buffer = [0u8; PARTIAL_HASH_BYTES];
    let bytes_read = file.read(&mut buffer)?;
    let hash = blake3::hash(&buffer[..bytes_read]);
    Ok(hash.to_hex().to_string())
}

fn calc_full_hash(path: &str) -> Result<String, std::io::Error> {
    let mut file = File::open(path)?;
    let mut hasher = blake3::Hasher::new();
    let mut buffer = [0u8; FULL_HASH_BUFFER];
    loop {
        let bytes_read = file.read(&mut buffer)?;
        if bytes_read == 0 {
            break;
        }
        hasher.update(&buffer[..bytes_read]);
    }
    Ok(hasher.finalize().to_hex().to_string())
}

// Helper: cancellation check & progress emit
fn check_cancelled(token: &CancellationToken) -> Result<(), String> {
    if token.is_cancelled() {
        Err("Scan was cancelled".to_string())
    } else {
        Ok(())
    }
}

fn emit_progress(app: &AppHandle, phase: &str, count: usize) {
    let _ = app.emit(
        "scan_progress",
        ScanProgress {
            phase: phase.to_string(),
            scanned_files: count,
        },
    );
}

#[tauri::command]
pub fn cancel_scan(state: State<'_, ScanState>) -> Result<(), String> {
    let mut token_guard = state
        .cancel_token
        .lock()
        .map_err(|e| format!("Lock poisoned: {e}"))?;

    if let Some(token) = token_guard.take() {
        token.cancel();
        info!("Scan cancelled by user");
    }
    Ok(())
}

#[tauri::command]
pub async fn find_duplicates(
    app: AppHandle,
    state: State<'_, ScanState>,
    target_dir: String,
) -> Result<(), String> {
    // Issue new cancellation token, cancel old scan if running
    let token = CancellationToken::new();
    {
        let mut token_guard = state
            .cancel_token
            .lock()
            .map_err(|e| format!("Lock poisoned: {e}"))?;
        if let Some(old_token) = token_guard.as_ref() {
            old_token.cancel();
        }
        *token_guard = Some(token.clone());
    }

    emit_progress(&app, "ファイル収集&サイズ比較中...", 0);

    // Phase 1: Group by size using jwalk (parallel traversal, no symlink follow)
    let mut size_map: HashMap<u64, Vec<String>> = HashMap::new();
    let mut scanned_count: usize = 0;

    for entry in WalkDir::new(&target_dir)
        .follow_links(false)
        .sort(true)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        check_cancelled(&token)?;

        if entry.file_type().is_file() {
            if let Ok(metadata) = entry.metadata() {
                let size = metadata.len();
                if size > 0 {
                    size_map
                        .entry(size)
                        .or_default()
                        .push(entry.path().to_string_lossy().into_owned());
                    scanned_count += 1;

                    if scanned_count.is_multiple_of(1000) {
                        emit_progress(&app, "ファイルサイズ比較中...", scanned_count);
                    }
                }
            }
        }
    }

    // Keep only groups with 2+ files of same size
    let potential_duplicates: Vec<(u64, Vec<String>)> = size_map
        .into_iter()
        .filter(|(_, paths)| paths.len() > 1)
        .collect();

    info!(
        "Phase 1 complete: {scanned_count} files scanned, {} size groups",
        potential_duplicates.len()
    );

    let mut chunk_buffer: Vec<DuplicateGroup> = Vec::new();
    let mut processed_count: usize = 0;

    // Phase 2 & 3: Partial hash → Full hash (rayon parallel)
    for (size, paths) in potential_duplicates {
        check_cancelled(&token)?;

        // Phase 2: Partial hash in parallel
        let partial_results: Vec<(String, String)> = paths
            .par_iter()
            .filter_map(|path| {
                calc_partial_hash(path)
                    .ok()
                    .map(|hash| (hash, path.clone()))
            })
            .collect();

        let mut partial_hash_map: HashMap<String, Vec<String>> = HashMap::new();
        for (hash, path) in partial_results {
            partial_hash_map.entry(hash).or_default().push(path);
        }

        // Phase 3: Full hash for groups where partial hash matched
        for (_, partial_paths) in partial_hash_map {
            if partial_paths.len() <= 1 {
                continue;
            }

            let full_results: Vec<(String, String)> = partial_paths
                .par_iter()
                .filter_map(|path| {
                    calc_full_hash(path)
                        .ok()
                        .map(|hash| (hash, path.clone()))
                })
                .collect();

            let mut full_hash_map: HashMap<String, Vec<String>> = HashMap::new();
            for (hash, path) in full_results {
                full_hash_map.entry(hash).or_default().push(path);
            }

            for (hash, full_paths) in full_hash_map {
                if full_paths.len() > 1 {
                    let group = DuplicateGroup {
                        hash,
                        size,
                        paths: full_paths,
                    };
                    chunk_buffer.push(group);
                    processed_count += 1;

                    // Emit chunk every 10 groups
                    if chunk_buffer.len() >= 10 {
                        let _ = app.emit("duplicate_chunk", &chunk_buffer);
                        chunk_buffer.clear();
                    }

                    if processed_count.is_multiple_of(50) {
                        emit_progress(&app, "重複検出中...", processed_count);
                    }
                }
            }
        }
    }

    // Emit remaining chunk
    if !chunk_buffer.is_empty() {
        let _ = app.emit("duplicate_chunk", &chunk_buffer);
    }

    emit_progress(&app, "完了！", processed_count);
    info!("Scan complete: {} duplicate groups found", processed_count);

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;

    #[test]
    fn partial_hash_deterministic() {
        let dir = std::env::temp_dir().join("dc_test_partial");
        std::fs::create_dir_all(&dir).unwrap();
        let path = dir.join("test.bin");
        let mut f = std::fs::File::create(&path).unwrap();
        f.write_all(b"hello world test data for hashing").unwrap();
        drop(f);

        let h1 = calc_partial_hash(path.to_str().unwrap()).unwrap();
        let h2 = calc_partial_hash(path.to_str().unwrap()).unwrap();
        assert_eq!(h1, h2, "same file should produce same hash");

        std::fs::remove_file(&path).ok();
        std::fs::remove_dir(&dir).ok();
    }

    #[test]
    fn full_hash_deterministic() {
        let dir = std::env::temp_dir().join("dc_test_full");
        std::fs::create_dir_all(&dir).unwrap();
        let path = dir.join("test.bin");
        let mut f = std::fs::File::create(&path).unwrap();
        f.write_all(b"full hash test data content").unwrap();
        drop(f);

        let h1 = calc_full_hash(path.to_str().unwrap()).unwrap();
        let h2 = calc_full_hash(path.to_str().unwrap()).unwrap();
        assert_eq!(h1, h2, "same file should produce same hash");

        std::fs::remove_file(&path).ok();
        std::fs::remove_dir(&dir).ok();
    }

    #[test]
    fn different_content_different_hash() {
        let dir = std::env::temp_dir().join("dc_test_diff");
        std::fs::create_dir_all(&dir).unwrap();

        let p1 = dir.join("a.bin");
        let p2 = dir.join("b.bin");
        std::fs::write(&p1, b"content A").unwrap();
        std::fs::write(&p2, b"content B").unwrap();

        let h1 = calc_full_hash(p1.to_str().unwrap()).unwrap();
        let h2 = calc_full_hash(p2.to_str().unwrap()).unwrap();
        assert_ne!(h1, h2, "different content should produce different hash");

        std::fs::remove_file(&p1).ok();
        std::fs::remove_file(&p2).ok();
        std::fs::remove_dir(&dir).ok();
    }

    #[test]
    fn hash_nonexistent_file_errors() {
        assert!(calc_partial_hash("/nonexistent/path/file.bin").is_err());
        assert!(calc_full_hash("/nonexistent/path/file.bin").is_err());
    }
}
