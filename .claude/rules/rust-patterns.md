---
description: drive-cleaner 固有の Rust 実装パターン（jwalk・blake3・CancellationToken）
globs: "src-tauri/**/*.rs"
---

# drive-cleaner Rust 実装パターン

汎用ルールは `.claude/rules/tauri-rust.md` を参照。以下は drive-cleaner 固有のパターン。

## コマンドボイラープレート

```rust
use crate::error::AppError;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ScanResult {
    pub path: String,
    pub size_bytes: u64,
    pub file_count: u64,
}

#[tauri::command]
pub async fn scan_directory(path: String) -> Result<ScanResult, AppError> {
    Ok(ScanResult { path, size_bytes: 0, file_count: 0 })
}
```

登録: `src-tauri/src/lib.rs` の `invoke_handler![]` に追加すること。

## 並列スキャン（jwalk）

```rust
use jwalk::WalkDir;

fn scan_parallel(root: &std::path::Path) -> Vec<jwalk::DirEntry<((), ())>> {
    WalkDir::new(root)
        .num_threads(rayon::current_num_threads())
        .into_iter()
        .filter_map(|e| e.ok())
        .collect()
}
```

- `WalkDir::new_all()` は使わない（メモリ消費が大きい）
- スキャン中はキャンセル可能にする（CancellationToken パターン参照）

## ハッシュ（blake3）

```rust
use blake3::Hasher;
use std::io::Read;

fn hash_file(path: &std::path::Path) -> Result<String, AppError> {
    let mut file = std::fs::File::open(path)?;
    let mut hasher = Hasher::new();
    let mut buf = [0u8; 65536];  // 64KB チャンク
    loop {
        let n = file.read(&mut buf)?;
        if n == 0 { break; }
        hasher.update(&buf[..n]);
    }
    Ok(hasher.finalize().to_hex().to_string())
}
```

## CancellationToken パターン

```rust
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

pub struct Scanner {
    cancelled: Arc<AtomicBool>,
}

impl Scanner {
    pub fn new() -> Self {
        Self { cancelled: Arc::new(AtomicBool::new(false)) }
    }

    pub fn cancel(&self) {
        self.cancelled.store(true, Ordering::Relaxed);
    }

    fn is_cancelled(&self) -> bool {
        self.cancelled.load(Ordering::Relaxed)
    }
}
```
