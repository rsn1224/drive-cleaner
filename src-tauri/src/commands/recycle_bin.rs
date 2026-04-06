// ==========================================
// Recycle Bin Commands for Drive Cleaner
// ==========================================

use tracing::{info, warn};

use crate::types::{CleanResult, RecycleBinInfo};

/// A-Z 全ドライブの $Recycle.Bin をスキャンし、ゴミ箱内のアイテム数と合計サイズを返す。
/// アクセス拒否エラーは無視してスキップする。
#[tauri::command]
pub async fn get_recycle_bin_info() -> RecycleBinInfo {
    tokio::task::spawn_blocking(collect_recycle_bin_info)
        .await
        .unwrap_or(RecycleBinInfo {
            item_count: 0,
            total_size: 0,
        })
}

/// 実際のスキャン処理（spawn_blocking 内とテストから呼ぶ）
fn collect_recycle_bin_info() -> RecycleBinInfo {
    let mut item_count: u64 = 0;
    let mut total_size: u64 = 0;

    for drive_byte in b'A'..=b'Z' {
        let bin_path = format!("{}:\\$Recycle.Bin", drive_byte as char);
        let bin = std::path::Path::new(&bin_path);
        if !bin.exists() {
            continue;
        }

        let Ok(sid_dirs) = std::fs::read_dir(bin) else {
            continue;
        };

        for sid_entry in sid_dirs.flatten() {
            if !sid_entry.path().is_dir() {
                continue;
            }
            let Ok(items) = std::fs::read_dir(sid_entry.path()) else {
                continue;
            };
            for item in items.flatten() {
                let name = item.file_name().to_string_lossy().to_string();
                // $R* = 実際のファイルデータ。$I* はメタデータなのでカウント外
                if name.starts_with("$R") {
                    if let Ok(meta) = item.metadata() {
                        item_count += 1;
                        total_size += meta.len();
                    }
                }
            }
        }
    }

    info!("Recycle bin: {} items, {} bytes", item_count, total_size);
    RecycleBinInfo {
        item_count,
        total_size,
    }
}

/// ゴミ箱を空にする。$R* ファイルと対応する $I* メタデータファイルを削除する。
#[tauri::command]
pub async fn empty_recycle_bin() -> Result<CleanResult, String> {
    // Phase 1: blocking directory enumeration in spawn_blocking to avoid blocking the async runtime
    let paths_to_delete: Vec<std::path::PathBuf> = tokio::task::spawn_blocking(|| {
        let mut paths = Vec::new();
        for drive_byte in b'A'..=b'Z' {
            let bin_path = format!("{}:\\$Recycle.Bin", drive_byte as char);
            let bin = std::path::Path::new(&bin_path);
            if !bin.exists() {
                continue;
            }
            let Ok(sid_dirs) = std::fs::read_dir(bin) else {
                continue;
            };
            for sid_entry in sid_dirs.flatten() {
                if !sid_entry.path().is_dir() {
                    continue;
                }
                let Ok(items) = std::fs::read_dir(sid_entry.path()) else {
                    continue;
                };
                for item in items.flatten() {
                    let name = item.file_name().to_string_lossy().to_string();
                    if name.starts_with("$R") || name.starts_with("$I") {
                        paths.push(item.path());
                    }
                }
            }
        }
        paths
    })
    .await
    .map_err(|e| e.to_string())?;

    // Phase 2: async deletion
    let mut deleted_count: usize = 0;
    let mut freed_size: u64 = 0;
    let mut errors: Vec<String> = Vec::new();

    for item_path in paths_to_delete {
        match tokio::fs::metadata(&item_path).await {
            Ok(meta) => {
                let size = meta.len();
                match tokio::fs::remove_file(&item_path).await {
                    Ok(()) => {
                        deleted_count += 1;
                        freed_size += size;
                    }
                    Err(e) => {
                        warn!("Failed to delete recycle bin item {:?}: {}", item_path, e);
                        errors.push(format!("{}: {}", item_path.display(), e));
                    }
                }
            }
            Err(e) => {
                warn!("Cannot access recycle bin item {:?}: {}", item_path, e);
            }
        }
    }

    info!(
        "Emptied recycle bin: {} files deleted, {} bytes freed",
        deleted_count, freed_size
    );
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
    fn recycle_bin_info_is_valid() {
        let info = collect_recycle_bin_info();
        // サイズと件数の整合性チェック（空でも正常）
        if info.item_count == 0 {
            assert_eq!(info.total_size, 0);
        }
    }
}
