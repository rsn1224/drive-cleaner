# Drive Cleaner

## 概要

ディスク容量分析・ファイル管理デスクトップアプリ（Tauri v2）。
大容量ファイルの検出、重複ファイルの特定、一時ファイルの安全なクリーンアップを提供する。

## スタック

| 層 | 技術 |
|----|------|
| フロントエンド | React 19 + TypeScript strict + Vite + Tailwind CSS v4 |
| バックエンド | Tauri v2 + Rust (tokio, rayon, blake3, jwalk) |
| UI | Lucide React + react-window（仮想スクロール） |
| Lint | Biome v2（TS + noExplicitAny: error）/ cargo clippy |
| Test | Vitest（TS）/ cargo test（Rust）|

## 開発コマンド

```bash
# フロントエンド
npm run dev                               # 開発サーバー起動
npm run typecheck                         # tsc --noEmit
npx biome check --write src/             # lint + format (自動修正)
npx biome check src/                     # lint のみ確認

# Rust バックエンド
cd src-tauri && cargo clippy -- -D warnings
cd src-tauri && cargo fmt
cd src-tauri && cargo test

# プロダクション
npm run build
```

## アーキテクチャ

```
src/                        # React フロントエンド
├── App.tsx                 # ルートコンポーネント
├── components/             # UI コンポーネント
├── hooks/                  # カスタムフック
├── lib/                    # ユーティリティ（IPC ヘルパー等）
├── types/                  # 型定義
└── i18n/                   # 国際化

src-tauri/src/              # Rust バックエンド
├── lib.rs                  # Tauri ビルダー + invoke_handler 登録
├── state.rs                # ScanState（CancellationToken 管理）
├── error.rs                # AppError enum (thiserror + serde)
├── types.rs                # 共通型定義
└── commands/               # Tauri コマンド（薄いラッパー）
    ├── scan.rs             # スキャン開始・キャンセル
    ├── disk_usage.rs       # ディスク使用量
    ├── drives.rs           # ドライブ一覧
    ├── large_files.rs      # 大容量ファイル検出
    ├── empty_folders.rs    # 空フォルダ検出
    ├── temp_cleaner.rs     # 一時ファイルクリーンアップ
    ├── old_files.rs        # 古いファイル検出
    ├── file_types.rs       # ファイルタイプ分析
    ├── similar_images.rs   # 類似画像検出
    ├── recycle_bin.rs      # ゴミ箱操作
    ├── preview.rs          # ファイルプレビュー
    ├── export.rs           # 結果エクスポート
    ├── browse.rs           # ファイルブラウズ
    └── temp_paths.rs       # 一時ファイルパス取得
```

## Tauri v2 固有の注意点

→ 詳細: `~/.claude/rules/tauri-v2-gotchas.md`（全プロジェクト共通）

- `invoke()` エラーは `Error` インスタンスではなく plain object
- 新コマンド追加後は `lib.rs` の `invoke_handler![]` への登録を忘れずに
- Rust 引数 `snake_case` → JS 側 `camelCase` に変換される
- `AppError` は `{ kind, message }` 形式でシリアライズされる

## 重要な設計決定

| 決定 | 理由 |
|------|------|
| `jwalk` で並列ファイルスキャン | `WalkDir` より大幅に高速 |
| `blake3` でハッシュ計算 | SHA256 より高速な重複検出 |
| `rayon` でCPU並列処理 | 大容量ディレクトリのスキャン性能 |
| `CancellationToken` でキャンセル | 長時間スキャンのユーザー中断対応 |
| `react-window` で仮想スクロール | 数万件のファイルリスト表示 |

## 完了条件

- [ ] `npm run typecheck` エラーなし
- [ ] `npx biome check src/` エラーなし（noExplicitAny: error を含む）
- [ ] `cargo clippy -- -D warnings` 警告なし
- [ ] `cargo test` 全グリーン
- [ ] Vitest 全グリーン
