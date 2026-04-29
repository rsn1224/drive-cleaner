# Drive Cleaner

ディスク容量分析・ファイル管理デスクトップアプリ。大容量ファイルの検出、重複ファイルの特定、一時ファイルの安全なクリーンアップを提供する。

## スタック

| 層 | 技術 |
|----|------|
| フロントエンド | React 19 + TypeScript strict + Vite + Tailwind CSS v4 |
| バックエンド | Tauri v2 + Rust (tokio, rayon, blake3, jwalk) |
| UI | Lucide React + react-window（仮想スクロール） |
| Lint | Biome v2 / cargo clippy |
| Test | Vitest（TS）/ cargo test（Rust）|

## 前提条件

- Node.js >= 22 / pnpm
- Rust stable（`rustup update stable`）
- Windows 10/11

## セットアップ

```bash
pnpm install
```

## 開発コマンド

```bash
# フロントエンド開発サーバー（Vite のみ）
pnpm dev

# Tauri フルスタック起動（推奨）
pnpm tauri dev

# ビルド
pnpm build

# 品質チェック
pnpm typecheck                          # TypeScript 型チェック
pnpm check                              # Biome lint + format（自動修正）
pnpm lint                               # Biome lint のみ（修正なし）
pnpm test                               # Vitest

# Rust（src-tauri/ で実行）
export PATH="$HOME/.cargo/bin:$PATH" && RUSTC_WRAPPER=""
cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings
cargo fmt --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
```

## ディレクトリ構成

```
src/                        # React フロントエンド
├── App.tsx
├── components/
├── hooks/
├── lib/                    # IPC ヘルパー等
├── types/
└── i18n/

src-tauri/src/              # Rust バックエンド
├── lib.rs                  # Tauri ビルダー + invoke_handler 登録
├── state.rs                # ScanState（CancellationToken 管理）
├── error.rs                # AppError enum
├── types.rs
└── commands/               # Tauri コマンド（薄いラッパー）
    ├── scan.rs
    ├── large_files.rs
    ├── empty_folders.rs
    ├── temp_cleaner.rs
    └── ...
```

## 完了条件

```bash
pnpm typecheck          # エラーなし
pnpm lint               # エラーなし（noExplicitAny 含む）
cargo clippy -- -D warnings   # 警告なし
cargo test              # 全グリーン
pnpm test               # 全グリーン
```
