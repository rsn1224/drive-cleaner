---
description: Tauri v2 + Rust バックエンドのコーディングルール
globs: "src-tauri/**/*.rs"
---

# Rust（Tauri v2）ルール

## エラーハンドリング
- `unwrap()` / `expect()` は本番コード禁止 → `?` 演算子 + 専用エラー型
- テストコードでは理由コメント付きで許可

## 状態管理
- `Mutex<大きな構造体>` 禁止 → 個別 `manage()` を使う
- `Arc<Mutex<T>>` のロック競合が激しい場合は `parking_lot::RwLock` に

## 非同期
- CPU バウンドな処理を `async` 内に書かない → `tokio::task::spawn_blocking`
- `Mutex` のロックを保持したまま `.await` しない

## パフォーマンス
- `Vec::with_capacity(n)` で事前確保（ホットパスで `Vec::new()` 禁止）
- `HashMap` のパフォーマンス優先時は `ahash::AHashMap` を検討

## Tauri v2 固有
- コマンドは薄いラッパーに留める（ビジネスロジックは services/ に）
- `State<T>` の取得は引数で受ける（グローバルアクセス禁止）
