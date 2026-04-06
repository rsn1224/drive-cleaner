// ==========================================
// Similar Images Command - pHash (Average Hash)
// ==========================================

use rayon::prelude::*;
use serde::Serialize;
use std::path::Path;
use std::sync::atomic::{AtomicUsize, Ordering};
use tauri::{Emitter, State};
use tokio_util::sync::CancellationToken;

use crate::state::ScanState;
use crate::types::ScanProgress;

const IMAGE_EXTENSIONS: &[&str] = &["jpg", "jpeg", "png", "gif", "bmp", "webp"];

#[derive(Debug, Serialize, Clone)]
pub struct SimilarImageGroup {
    pub paths: Vec<String>,
    /// Hamming distance between hashes (0 = identical, max 64)
    pub distance: u32,
}

/// Compute 64-bit Average Hash: resize to 8×8 grayscale, compare each pixel to mean.
fn compute_ahash(path: &str) -> Result<u64, String> {
    let img = image::open(path).map_err(|e| e.to_string())?;
    let resized = img
        .resize_exact(8, 8, image::imageops::FilterType::Lanczos3)
        .into_luma8();
    let pixels: Vec<u8> = resized.into_raw();
    let mean = pixels.iter().map(|&p| p as u32).sum::<u32>() / 64;
    let hash = pixels.iter().enumerate().fold(0u64, |acc, (i, &p)| {
        if p as u32 >= mean {
            acc | (1u64 << i)
        } else {
            acc
        }
    });
    Ok(hash)
}

fn hamming_distance(a: u64, b: u64) -> u32 {
    (a ^ b).count_ones()
}

fn is_image(path: &Path) -> bool {
    path.extension()
        .and_then(|e| e.to_str())
        .map(|e| IMAGE_EXTENSIONS.contains(&e.to_lowercase().as_str()))
        .unwrap_or(false)
}

#[tauri::command]
pub async fn find_similar_images(
    target_dir: String,
    threshold: u32,
    window: tauri::Window,
    state: State<'_, ScanState>,
) -> Result<Vec<SimilarImageGroup>, String> {
    let threshold = if threshold == 0 { 10 } else { threshold };

    // キャンセルトークンを登録
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

    // 画像パスを収集
    let image_paths: Vec<String> = jwalk::WalkDir::new(&target_dir)
        .follow_links(false)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_file())
        .filter(|e| is_image(&e.path()))
        .map(|e| e.path().to_string_lossy().to_string())
        .collect();

    let total = image_paths.len();
    if total == 0 {
        return Ok(vec![]);
    }

    // AtomicUsize で完了数をカウント（par_iter の順不同を防ぐ）
    let counter = AtomicUsize::new(0);
    let hashes: Vec<(String, u64)> = image_paths
        .par_iter()
        .filter_map(|path| {
            let done = counter.fetch_add(1, Ordering::Relaxed) + 1;
            // 100件ごとまたは最初と最後にプログレスを通知
            if done == 1 || done.is_multiple_of(100) || done == total {
                let _ = window.emit(
                    "scan_progress",
                    ScanProgress {
                        phase: format!("画像ハッシュ計算中... ({done}/{total})"),
                        scanned_files: done,
                    },
                );
            }
            compute_ahash(path).ok().map(|h| (path.clone(), h))
        })
        .collect();

    // O(n^2) ペア比較（キャンセル対応: 1000イテレーションごとにチェック）
    let n = hashes.len();
    let mut visited = vec![false; n];
    let mut groups: Vec<SimilarImageGroup> = Vec::new();

    for i in 0..n {
        // 1000ループごとにキャンセルを確認
        if i % 1000 == 0 && token.is_cancelled() {
            return Err("Scan was cancelled".to_string());
        }

        if visited[i] {
            continue;
        }
        let mut group_paths = vec![hashes[i].0.clone()];
        let mut max_dist = 0u32;

        for j in (i + 1)..n {
            if visited[j] {
                continue;
            }
            let dist = hamming_distance(hashes[i].1, hashes[j].1);
            if dist <= threshold {
                group_paths.push(hashes[j].0.clone());
                visited[j] = true;
                if dist > max_dist {
                    max_dist = dist;
                }
            }
        }

        if group_paths.len() > 1 {
            visited[i] = true;
            groups.push(SimilarImageGroup {
                paths: group_paths,
                distance: max_dist,
            });
        }
    }

    // 距離の近い順（最も類似したグループを先頭に）
    groups.sort_by_key(|g| g.distance);

    Ok(groups)
}
