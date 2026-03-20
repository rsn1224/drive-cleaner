// ==========================================
// Preview Commands for Drive Cleaner
// ==========================================

use std::fs::File;
use std::io::Read;

use base64::{engine::general_purpose::STANDARD as BASE64, Engine};

use crate::types::FilePreview;

const PREVIEW_TEXT_LIMIT: usize = 8192;

#[tauri::command]
pub fn get_file_preview(path: String) -> Result<FilePreview, String> {
    let meta = std::fs::metadata(&path).map_err(|e| e.to_string())?;
    let size = meta.len();

    let ext = std::path::Path::new(&path)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();

    // Image extensions → base64 encode (with size limit)
    let image_exts = ["png", "jpg", "jpeg", "gif", "bmp", "webp", "svg", "ico"];
    if image_exts.contains(&ext.as_str()) {
        // Reject images larger than 50MB to prevent memory issues
        const MAX_IMAGE_SIZE: u64 = 50 * 1024 * 1024; // 50MB
        if size > MAX_IMAGE_SIZE {
            return Ok(FilePreview {
                kind: "binary".to_string(),
                content: format!("画像ファイルが大きすぎます ({:.1} MB / 上限 50MB)", size as f64 / (1024.0 * 1024.0)),
                size,
            });
        }
        
        let bytes = std::fs::read(&path).map_err(|e| e.to_string())?;
        let b64 = BASE64.encode(&bytes);
        let mime = match ext.as_str() {
            "png" => "image/png",
            "jpg" | "jpeg" => "image/jpeg",
            "gif" => "image/gif",
            "bmp" => "image/bmp",
            "webp" => "image/webp",
            "svg" => "image/svg+xml",
            "ico" => "image/x-icon",
            _ => "application/octet-stream",
        };
        return Ok(FilePreview {
            kind: "image".to_string(),
            content: format!("data:{mime};base64,{b64}"),
            size,
        });
    }

    // Text extensions → read first 8KB
    let text_exts = [
        "txt", "md", "rs", "ts", "tsx", "js", "jsx", "json", "toml", "yaml", "yml", "xml",
        "html", "css", "csv", "log", "py", "sh", "bat", "ps1", "cfg", "ini", "env",
    ];
    if text_exts.contains(&ext.as_str()) {
        let mut file = File::open(&path).map_err(|e| e.to_string())?;
        let mut buffer = vec![0u8; PREVIEW_TEXT_LIMIT];
        let bytes_read = file.read(&mut buffer).map_err(|e| e.to_string())?;
        let text = String::from_utf8_lossy(&buffer[..bytes_read]).to_string();
        return Ok(FilePreview {
            kind: "text".to_string(),
            content: text,
            size,
        });
    }

    // Binary fallback
    Ok(FilePreview {
        kind: "binary".to_string(),
        content: format!("バイナリファイル ({ext})"),
        size,
    })
}
