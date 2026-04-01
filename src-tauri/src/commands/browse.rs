// ==========================================
// Browse Commands for Drive Cleaner
// ==========================================

use crate::types::{BulkMoveResult, FileNode};
use tracing::warn;

#[tauri::command]
pub fn get_directory_contents(path: String) -> Result<Vec<FileNode>, String> {
    let entries = std::fs::read_dir(&path).map_err(|e| e.to_string())?;
    let mut nodes: Vec<FileNode> = entries
        .filter_map(|entry| {
            let entry = entry.ok()?;
            let meta = entry.metadata().ok()?;
            let is_dir = meta.is_dir();
            let size = if is_dir { 0 } else { meta.len() };
            Some(FileNode {
                name: entry.file_name().to_string_lossy().to_string(),
                path: entry.path().to_string_lossy().to_string(),
                is_dir,
                size,
            })
        })
        .collect();

    // Folders first, then case-insensitive alphabetical
    nodes.sort_by(|a, b| {
        b.is_dir
            .cmp(&a.is_dir)
            .then_with(|| a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });

    Ok(nodes)
}

/// ゴミ箱に移動（OS 標準の Undo で復元可能）
#[tauri::command]
pub async fn delete_item(path: String) -> Result<(), String> {
    tokio::task::spawn_blocking(move || trash::delete(&path).map_err(|e| e.to_string()))
        .await
        .map_err(|e| e.to_string())?
}

#[tauri::command]
pub async fn bulk_delete(paths: Vec<String>) -> Result<usize, String> {
    let mut success_count = 0;
    for path in paths {
        match tokio::task::spawn_blocking(move || trash::delete(&path).map_err(|e| e.to_string()))
            .await
        {
            Ok(Ok(())) => success_count += 1,
            Ok(Err(e)) => warn!("bulk_delete: failed: {e}"),
            Err(e) => warn!("bulk_delete: task error: {e}"),
        }
    }
    Ok(success_count)
}

/// セキュア削除: ランダム→ゼロ→ランダムの3パス上書き後に削除
#[tauri::command]
pub async fn secure_delete_item(path: String) -> Result<(), String> {
    validate_secure_delete_path(&path)?;
    tokio::task::spawn_blocking(move || secure_delete_path(&path))
        .await
        .map_err(|e| e.to_string())?
}

/// セキュア削除のパスバリデーション:
/// - `..` トラバーサルを含むパスを拒否
/// - Windows システムディレクトリ以下のパスを拒否
fn validate_secure_delete_path(path: &str) -> Result<(), String> {
    // .. トラバーサルを拒否
    if path.contains("..") {
        return Err("セキュア削除: 相対パス('..')は使用できません".to_string());
    }

    // 正規化したパスで比較
    let canonical = std::fs::canonicalize(path)
        .map_err(|e| format!("パスの解決に失敗しました: {e}"))?;
    let canonical_lower = canonical.to_string_lossy().to_lowercase();

    // Windows システムディレクトリを保護
    let protected_prefixes = [
        "c:\\windows",
        "c:\\program files",
        "c:\\program files (x86)",
        "c:\\programdata",
        "c:\\system volume information",
    ];
    for prefix in protected_prefixes {
        if canonical_lower.starts_with(prefix) {
            return Err(format!(
                "セキュア削除: システムディレクトリ '{}' は保護されています",
                canonical.display()
            ));
        }
    }

    Ok(())
}

fn secure_delete_path(path: &str) -> Result<(), String> {
    let meta = std::fs::metadata(path).map_err(|e| e.to_string())?;
    if meta.is_dir() {
        secure_delete_dir(path)
    } else {
        overwrite_and_delete(path)
    }
}

const OVERWRITE_CHUNK: usize = 65536; // 64 KB per chunk - avoids full-file RAM allocation

fn overwrite_and_delete(path: &str) -> Result<(), String> {
    use rand::RngCore;
    use std::io::{Seek, SeekFrom, Write};

    let size = std::fs::metadata(path).map_err(|e| e.to_string())?.len();
    let mut rng = rand::thread_rng();
    let mut buf = [0u8; OVERWRITE_CHUNK];

    let mut f = std::fs::OpenOptions::new()
        .write(true)
        .open(path)
        .map_err(|e| e.to_string())?;

    // Pass 1: random
    let mut written: u64 = 0;
    while written < size {
        let chunk = ((size - written) as usize).min(OVERWRITE_CHUNK);
        rng.fill_bytes(&mut buf[..chunk]);
        f.write_all(&buf[..chunk]).map_err(|e| e.to_string())?;
        written += chunk as u64;
    }
    f.flush().map_err(|e| e.to_string())?;

    // Pass 2: zeros
    f.seek(SeekFrom::Start(0)).map_err(|e| e.to_string())?;
    let zeros = [0u8; OVERWRITE_CHUNK];
    let mut written: u64 = 0;
    while written < size {
        let chunk = ((size - written) as usize).min(OVERWRITE_CHUNK);
        f.write_all(&zeros[..chunk]).map_err(|e| e.to_string())?;
        written += chunk as u64;
    }
    f.flush().map_err(|e| e.to_string())?;

    // Pass 3: random again
    f.seek(SeekFrom::Start(0)).map_err(|e| e.to_string())?;
    let mut written: u64 = 0;
    while written < size {
        let chunk = ((size - written) as usize).min(OVERWRITE_CHUNK);
        rng.fill_bytes(&mut buf[..chunk]);
        f.write_all(&buf[..chunk]).map_err(|e| e.to_string())?;
        written += chunk as u64;
    }
    f.flush().map_err(|e| e.to_string())?;
    drop(f);

    std::fs::remove_file(path).map_err(|e| e.to_string())
}

fn secure_delete_dir(path: &str) -> Result<(), String> {
    for entry in std::fs::read_dir(path).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let child = entry.path();
        let child_str = child.to_string_lossy().to_string();
        // file_type() はシンボリックリンクを追跡しないため安全
        let file_type = entry.file_type().map_err(|e| e.to_string())?;
        if file_type.is_symlink() {
            // シンボリックリンクは追跡せずスキップ（任意ファイルの破壊を防ぐ）
            warn!("secure_delete_dir: シンボリックリンクをスキップ: {child_str}");
            continue;
        }
        if file_type.is_dir() {
            secure_delete_dir(&child_str)?;
        } else {
            overwrite_and_delete(&child_str)?;
        }
    }
    std::fs::remove_dir(path).map_err(|e| e.to_string())
}

// ==========================================
// Move / Rename / Organize Commands
// ==========================================

/// パスバリデーション: `..` トラバーサルを拒否
fn validate_move_path(path: &str) -> Result<(), String> {
    if path.contains("..") {
        return Err("相対パス('..')は使用できません".to_string());
    }
    Ok(())
}

/// ディレクトリを再帰的にコピー（クロスドライブ移動用）
fn copy_dir_recursive(from: &std::path::Path, to: &std::path::Path) -> Result<(), String> {
    std::fs::create_dir_all(to).map_err(|e| e.to_string())?;
    for entry in std::fs::read_dir(from).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let child_to = to.join(entry.file_name());
        if entry.file_type().map_err(|e| e.to_string())?.is_dir() {
            copy_dir_recursive(&entry.path(), &child_to)?;
        } else {
            std::fs::copy(entry.path(), &child_to).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

/// rename を試みて失敗したらコピー+削除にフォールバック（クロスドライブ対応）
fn move_path(from: &std::path::Path, to: &std::path::Path) -> Result<(), String> {
    match std::fs::rename(from, to) {
        Ok(()) => Ok(()),
        Err(_) => {
            if from.is_dir() {
                copy_dir_recursive(from, to)?;
                std::fs::remove_dir_all(from).map_err(|e| e.to_string())
            } else {
                std::fs::copy(from, to).map_err(|e| e.to_string())?;
                std::fs::remove_file(from).map_err(|e| e.to_string())
            }
        }
    }
}

/// ファイル/フォルダを指定パスに移動
#[tauri::command]
pub async fn move_item(from: String, to: String) -> Result<(), String> {
    validate_move_path(&from)?;
    validate_move_path(&to)?;
    tokio::task::spawn_blocking(move || {
        let to_path = std::path::Path::new(&to);
        if to_path.exists() {
            return Err("移動先に同名のファイルまたはフォルダが存在します".to_string());
        }
        move_path(std::path::Path::new(&from), to_path)
    })
    .await
    .map_err(|e| e.to_string())?
}

/// ファイル/フォルダをリネームし、成功時は新しいフルパスを返す
#[tauri::command]
pub async fn rename_item(path: String, new_name: String) -> Result<String, String> {
    const ILLEGAL: &[char] = &['/', '\\', ':', '*', '?', '"', '<', '>', '|'];
    if new_name.chars().any(|c| ILLEGAL.contains(&c)) {
        return Err(
            "ファイル名に使用できない文字が含まれています（/ \\ : * ? \" < > |）".to_string(),
        );
    }
    let trimmed = new_name.trim().to_string();
    if trimmed.is_empty() {
        return Err("ファイル名を入力してください".to_string());
    }
    tokio::task::spawn_blocking(move || {
        let from_path = std::path::Path::new(&path);
        let new_path = from_path
            .parent()
            .ok_or_else(|| "親ディレクトリを取得できません".to_string())?
            .join(&trimmed);
        if new_path.exists() {
            return Err("同名のファイルまたはフォルダが既に存在します".to_string());
        }
        std::fs::rename(from_path, &new_path).map_err(|e| e.to_string())?;
        Ok(new_path.to_string_lossy().to_string())
    })
    .await
    .map_err(|e| e.to_string())?
}

/// 複数のファイル/フォルダを指定ディレクトリに一括移動
#[tauri::command]
pub async fn bulk_move(paths: Vec<String>, dest_dir: String) -> Result<BulkMoveResult, String> {
    validate_move_path(&dest_dir)?;
    tokio::task::spawn_blocking(move || {
        let dest = std::path::Path::new(&dest_dir);
        let mut moved_count = 0;
        let mut errors: Vec<String> = Vec::new();

        for path_str in &paths {
            let from = std::path::Path::new(path_str);
            let name = from
                .file_name()
                .map(|n| n.to_string_lossy().to_string())
                .unwrap_or_else(|| path_str.clone());
            let to = dest.join(&name);
            if to.exists() {
                errors.push(format!("{name}: 移動先に同名ファイルが存在します"));
                continue;
            }
            match move_path(from, &to) {
                Ok(()) => moved_count += 1,
                Err(e) => errors.push(format!("{name}: {e}")),
            }
        }
        Ok(BulkMoveResult { moved_count, errors })
    })
    .await
    .map_err(|e| e.to_string())?
}

fn categorize_extension(ext: &str) -> &'static str {
    match ext {
        "jpg" | "jpeg" | "png" | "gif" | "webp" | "svg" | "bmp" | "ico" | "tiff" | "tif"
        | "heic" | "heif" | "raw" | "cr2" | "nef" | "arw" => "Images",
        "pdf" | "doc" | "docx" | "xls" | "xlsx" | "ppt" | "pptx" | "txt" | "md" | "csv"
        | "odt" | "ods" | "odp" | "rtf" | "pages" | "numbers" | "key" => "Documents",
        "mp4" | "mkv" | "mov" | "avi" | "wmv" | "flv" | "webm" | "m4v" | "ts" | "mpg"
        | "mpeg" | "3gp" | "vob" => "Videos",
        "mp3" | "flac" | "wav" | "aac" | "ogg" | "m4a" | "wma" | "opus" | "aiff" | "alac"
        | "ape" => "Music",
        "zip" | "tar" | "gz" | "bz2" | "7z" | "rar" | "xz" | "lzma" | "cab" | "iso"
        | "dmg" => "Archives",
        _ => "Others",
    }
}

/// フォルダ内のファイルを拡張子でカテゴリ別サブフォルダに自動整理
#[tauri::command]
pub async fn organize_by_type(target_dir: String) -> Result<BulkMoveResult, String> {
    validate_move_path(&target_dir)?;
    tokio::task::spawn_blocking(move || {
        let base = std::path::Path::new(&target_dir);
        let entries: Vec<_> = std::fs::read_dir(base)
            .map_err(|e| e.to_string())?
            .filter_map(|e| e.ok())
            .filter(|e| e.file_type().map(|t| t.is_file()).unwrap_or(false))
            .collect();

        let mut moved_count = 0;
        let mut errors: Vec<String> = Vec::new();

        for entry in entries {
            let from = entry.path();
            let name = entry.file_name().to_string_lossy().to_string();
            let ext = from
                .extension()
                .map(|e| e.to_string_lossy().to_lowercase())
                .unwrap_or_default();
            let category = categorize_extension(&ext);
            let category_dir = base.join(category);
            if let Err(e) = std::fs::create_dir_all(&category_dir) {
                errors.push(format!("{name}: フォルダ作成失敗: {e}"));
                continue;
            }
            let to = category_dir.join(&name);
            if to.exists() {
                errors.push(format!("{name}: 移動先に同名ファイルが存在します"));
                continue;
            }
            match std::fs::rename(&from, &to) {
                Ok(()) => moved_count += 1,
                Err(e) => errors.push(format!("{name}: {e}")),
            }
        }
        Ok(BulkMoveResult { moved_count, errors })
    })
    .await
    .map_err(|e| e.to_string())?
}
