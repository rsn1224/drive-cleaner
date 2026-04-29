# Drive Cleaner — アーキテクチャ

## 概要

ディスク容量分析・ファイル管理デスクトップアプリ（Tauri v2）。
Rust バックエンドが高速スキャンを担い、React フロントエンドが結果を可視化する。

---

## スタック

| 層 | 技術 | 役割 |
|----|------|------|
| UI | React 19 + TypeScript + Tailwind v4 | ダッシュボード・一覧表示 |
| IPC | Tauri v2 invoke | フロント ↔ Rust 通信 |
| バックエンド | Rust (tokio / rayon / blake3 / jwalk) | スキャン・ハッシュ計算 |
| 可視化 | @nivo/treemap | ディスク使用量ツリーマップ |
| 仮想スクロール | react-window | 数万件ファイルリスト |

---

## フロントエンド構造

```
src/
├── App.tsx              # ルートコンポーネント（Wing ルーティング）
├── components/          # UI コンポーネント
│   └── views/           # 各機能 Wing
├── hooks/               # カスタムフック（スキャン状態管理など）
├── lib/
│   └── tauri-commands.ts  # invoke 型付きラッパー（直接 invoke 禁止）
├── types/               # 共通型定義（Rust 型と同期）
└── i18n/                # 国際化リソース (en / ja)
```

### Wing 構成（App.tsx ルーティング）

| Wing | 機能 |
|------|------|
| Overview | ディスク使用量サマリー + ツリーマップ |
| LargeFiles | 大容量ファイル一覧・削除 |
| Duplicates | 重複ファイル検出（blake3 ハッシュ） |
| EmptyFolders | 空フォルダ一覧・削除 |
| OldFiles | 古いファイル（最終アクセス日基準） |
| TempCleaner | 一時ファイル安全クリーンアップ |
| SimilarImages | 類似画像グルーピング |
| RecycleBin | ゴミ箱操作 |
| Browser | ファイルブラウザ |

---

## バックエンド構造

```
src-tauri/src/
├── lib.rs               # Tauri ビルダー + invoke_handler 登録
├── state.rs             # ScanState（CancellationToken 管理）
├── error.rs             # AppError enum（thiserror + serde）
├── types.rs             # IPC 共通型（フロントの types/ と同期）
└── commands/            # Tauri コマンド（薄いラッパー）
    ├── scan.rs          # スキャン開始・キャンセル
    ├── disk_usage.rs    # ドライブ使用量
    ├── drives.rs        # ドライブ一覧
    ├── large_files.rs   # 大容量ファイル検出
    ├── empty_folders.rs # 空フォルダ検出
    ├── temp_cleaner.rs  # 一時ファイルクリーンアップ
    ├── old_files.rs     # 古いファイル検出
    ├── file_types.rs    # ファイルタイプ分析
    ├── similar_images.rs# 類似画像検出
    ├── recycle_bin.rs   # ゴミ箱操作
    ├── preview.rs       # ファイルプレビュー
    ├── export.rs        # 結果エクスポート
    ├── browse.rs        # ファイルブラウズ
    └── temp_paths.rs    # 一時ファイルパス取得
```

### コマンド設計原則

- `commands/` は **薄いラッパー** のみ（バリデーション + ビジネスロジック呼び出し）
- ビジネスロジックは将来 `services/` に抽出予定
- ファイルシステム I/O の集約先は将来 `infra/` に抽出予定
- 依存方向: `commands →（services）→（infra）`（上位が下位を呼ぶ一方向）

---

## IPC データフロー

```
React コンポーネント
  └─ src/lib/tauri-commands.ts（型付きラッパー）
       └─ invoke('command_name', { args })
            └─ src-tauri/src/commands/*.rs（薄いラッパー）
                 └─ ビジネスロジック / OS API 呼び出し
                      └─ AppError → { kind, message } でシリアライズ
```

### エラーフォーマット

```typescript
// フロントエンドで受け取るエラー形式
type AppError = {
  kind: string;   // エラー種別（"Io" | "Scan" | "Permission" など）
  message: string;
};
```

invoke のエラーは `Error` インスタンスではなく plain object のため、
必ず `extractErrorMessage` ヘルパー経由で処理する。

---

## 重要な技術選定

| 選定 | 理由 |
|------|------|
| `jwalk` | WalkDir より大幅に高速な並列ファイルシステム走査 |
| `blake3` | SHA256 より高速なハッシュ計算（重複検出用） |
| `rayon` | CPU バウンド並列処理（大容量ディレクトリ） |
| `CancellationToken` | 長時間スキャンのユーザー中断対応 |
| `react-window` | 数万件ファイルリストの仮想スクロール |

---

## テスト戦略

詳細は [TESTING.md](TESTING.md) を参照。

| 層 | フレームワーク | 対象 |
|----|--------------|------|
| Rust ユニット | `cargo test` | スキャンロジック・ハッシュ計算・重複検出 |
| TypeScript | Vitest | hooks・コンポーネント・tauri-commands ラッパー |
| E2E | 未導入（将来: Playwright） | — |

---

## セットアップ

```bash
# 依存インストール
pnpm install

# 開発サーバー（Vite のみ）
pnpm dev

# フルスタック起動（推奨）
cargo tauri dev

# Rust チェック
cd src-tauri && cargo clippy -- -D warnings
cd src-tauri && cargo test

# TypeScript チェック
pnpm typecheck
pnpm check
```
