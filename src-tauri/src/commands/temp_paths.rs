// ==========================================
// Temp Path Helpers for Drive Cleaner
// ==========================================

pub const SAFE_EXTENSIONS: &[&str] = &["tmp", "log", "bak", "old", "dmp", "etl", "chk", "temp"];

/// ブラウザキャッシュディレクトリのパス断片（セキュリティ検証用）
pub const BROWSER_CACHE_DIRS: &[&str] = &[
    "Google\\Chrome\\User Data",
    "Microsoft\\Edge\\User Data",
    "BraveSoftware\\Brave-Browser\\User Data",
    "Mozilla\\Firefox\\Profiles",
    "Opera Software\\Opera Stable",
    // Unix
    "google-chrome/Default/Cache",
    "chromium/Default/Cache",
    "mozilla/firefox",
];

pub fn is_safe_to_delete(ext: &str) -> bool {
    SAFE_EXTENSIONS.contains(&ext)
}

/// ブラウザキャッシュディレクトリ配下のファイルかどうかを検証する。
/// パスにブラウザ固有のディレクトリ断片が含まれている場合のみ true を返す。
pub fn is_browser_cache_file(path: &str) -> bool {
    BROWSER_CACHE_DIRS.iter().any(|dir| path.contains(dir))
}

/// ブラウザキャッシュのパスリストを返す（カテゴリ名, パス）
pub fn get_browser_cache_paths() -> Vec<(String, String)> {
    let mut paths = Vec::new();

    if let Some(local) = dirs::data_local_dir() {
        // Chrome
        let chrome = local
            .join("Google")
            .join("Chrome")
            .join("User Data")
            .join("Default")
            .join("Cache");
        if chrome.exists() {
            paths.push((
                "Chrome キャッシュ".to_string(),
                chrome.to_string_lossy().into_owned(),
            ));
        }
        // Edge
        let edge = local
            .join("Microsoft")
            .join("Edge")
            .join("User Data")
            .join("Default")
            .join("Cache");
        if edge.exists() {
            paths.push((
                "Edge キャッシュ".to_string(),
                edge.to_string_lossy().into_owned(),
            ));
        }
        // Brave
        let brave = local
            .join("BraveSoftware")
            .join("Brave-Browser")
            .join("User Data")
            .join("Default")
            .join("Cache");
        if brave.exists() {
            paths.push((
                "Brave キャッシュ".to_string(),
                brave.to_string_lossy().into_owned(),
            ));
        }
    }

    if let Some(roaming) = dirs::data_dir() {
        // Opera
        let opera = roaming
            .join("Opera Software")
            .join("Opera Stable")
            .join("Cache");
        if opera.exists() {
            paths.push((
                "Opera キャッシュ".to_string(),
                opera.to_string_lossy().into_owned(),
            ));
        }
        // Firefox (profile 名が可変)
        let ff_profiles = roaming.join("Mozilla").join("Firefox").join("Profiles");
        if let Ok(entries) = std::fs::read_dir(&ff_profiles) {
            for entry in entries.flatten() {
                let cache2 = entry.path().join("cache2");
                if cache2.exists() {
                    let profile_name = entry.file_name().to_string_lossy().to_string();
                    paths.push((
                        format!("Firefox キャッシュ ({})", profile_name),
                        cache2.to_string_lossy().into_owned(),
                    ));
                }
            }
        }
    }

    paths
}

pub fn get_temp_paths() -> Vec<(String, String)> {
    // (カテゴリ名, パス) のペア
    let mut paths = Vec::new();

    // 1. %TEMP%
    let temp = std::env::temp_dir();
    paths.push((
        "Windows Temp".to_string(),
        temp.to_string_lossy().into_owned(),
    ));

    // 2. %LOCALAPPDATA%\Temp
    if let Some(local) = dirs::data_local_dir() {
        let local_temp = local.join("Temp");
        if local_temp.exists() && local_temp != temp {
            paths.push((
                "Local App Temp".to_string(),
                local_temp.to_string_lossy().into_owned(),
            ));
        }

        // 3. CrashDumps
        let crash = local.join("CrashDumps");
        if crash.exists() {
            paths.push((
                "クラッシュダンプ".to_string(),
                crash.to_string_lossy().into_owned(),
            ));
        }
    }

    // 4. Windows Prefetch (読めるファイルのみ)
    let prefetch = std::path::Path::new("C:\\Windows\\Prefetch");
    if prefetch.exists() {
        paths.push((
            "Windows Prefetch".to_string(),
            prefetch.to_string_lossy().into_owned(),
        ));
    }

    paths
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
