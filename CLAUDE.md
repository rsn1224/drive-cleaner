# Drive Cleaner

> このファイルは AI アシスタント（Claude Code 等）向けのプロジェクト仕様書。
> 実装前に必ず「安全性の絶対ルール」と「既知の乖離・落とし穴」に目を通すこと。

## 概要

ディスク容量分析・ファイル管理デスクトップアプリ（Tauri v2）。
Rust バックエンドが高速スキャン（重複・大容量・空フォルダ・古いファイル・類似画像・一時ファイル）を担い、
React フロントエンドが HUD スタイル UI で結果を可視化する。

主対象は Windows 10/11。パス処理は Unix にもフォールバックする（`src/lib/utils.ts` の `IS_WINDOWS`）。
UI 文言・コミットメッセージ・コードコメントは日本語。

## スタック

| 層 | 技術 | 備考 |
|----|------|------|
| フロントエンド | React 19 + TypeScript 6 (strict) + Vite 8 | `noUncheckedIndexedAccess` 有効 |
| スタイル | Tailwind CSS v4（`@theme` で CSS 変数定義） | 設定ファイルなし、`src/index.css` に集約 |
| アイコン | lucide-react（大半） + Material Symbols（layout 系） | 混在中。「既知の乖離」参照 |
| 可視化 | @nivo/treemap（ディスク使用量） | CSS 変数不可のため `src/lib/design-tokens.ts` を使う |
| 仮想スクロール | react-window v2 | `BrowseView.tsx` のみ |
| バックエンド | Tauri v2 + Rust 2024 edition (MSRV 1.88) | `src-tauri/` |
| Rust 主要クレート | tokio / rayon / blake3 / jwalk / image / trash / sysinfo | |
| Lint / Format | Biome v2.4（TS/TSX）/ rustfmt + clippy | biome.json は未作成。「既知の乖離」参照 |
| Test | Vitest 4 + Testing Library（18 ファイル / 83 テスト）/ cargo test | |
| パッケージ管理 | pnpm 10.33（Node >= 22.12） | |

## セットアップと開発コマンド

```bash
pnpm install                              # 依存インストール

# フロントエンド
pnpm dev                                  # Vite 開発サーバーのみ（localhost:1420 固定ポート）
pnpm tauri dev                            # Tauri フルスタック起動（推奨）
pnpm build                                # tsc && vite build
pnpm typecheck                            # tsc --noEmit
pnpm test                                 # vitest run
pnpm test:watch                           # vitest（ウォッチ）
pnpm lint                                 # biome lint src/（修正なし）
pnpm check                                # biome check --write src/（★破壊的。下記参照）

# Rust バックエンド（src-tauri/ で実行）
cd src-tauri && cargo fmt
cd src-tauri && cargo clippy -- -D warnings
cd src-tauri && cargo test
```

Linux でビルドする場合は GTK 系の開発ライブラリが必要
（`libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf libdbus-1-dev pkg-config libssl-dev libgtk-3-dev`）。
未導入だと `cargo test` が `gdk-3.0` の pkg-config エラーで失敗する。CI の `rust-lint` ジョブが導入手順の正。

## ディレクトリ構成

```
src/                          # React フロントエンド
├── App.tsx                   # ルート。全フックを束ねてモード分岐 + タブ切替
├── main.tsx                  # createRoot + ToastProvider + ConfirmProvider
├── index.css                 # Tailwind v4 @theme + HUD 用ユーティリティクラス
├── components/               # UI コンポーネント（*.test.tsx を同階層に併置）
│   ├── MainContent.tsx       # AppMode → 各 View への振り分け
│   ├── BrowseView.tsx        # react-window ファイル一覧
│   ├── DuplicatesView.tsx / DuplicateGroupCard.tsx
│   ├── LargeFilesView.tsx / EmptyFoldersView.tsx / OldFilesView.tsx
│   ├── FileTypesView.tsx / DiskUsageView.tsx / SimilarImagesView.tsx
│   ├── TempCleanerView.tsx
│   ├── Toolbar.tsx / StatusBar.tsx / QuickActions.tsx / DriveOverview.tsx
│   ├── ConfirmModal.tsx / PreviewModal.tsx / ErrorBoundary.tsx
│   └── layout/               # HudHeader.tsx / BottomNav.tsx
├── hooks/                    # 機能ごとのスキャン状態フック（1 機能 1 フック）
├── lib/                      # utils / tauri / notify / cn / quickActions / 各 Context
├── types/index.ts            # Rust types.rs と手動同期する IPC 型
└── i18n/messages.ts          # 日本語 UI 文言（単一オブジェクト。多言語切替は未実装）

src-tauri/src/                # Rust バックエンド
├── main.rs                   # drive_cleaner_lib::run() を呼ぶだけ
├── lib.rs                    # tracing 初期化 + Builder + invoke_handler 登録
├── state.rs                  # ScanState { cancel_token: Mutex<Option<CancellationToken>> }
├── types.rs                  # IPC 共通型（serde、rename なし = snake_case のまま）
├── error.rs                  # AppError enum（※現状どのコマンドからも未使用）
└── commands/
    ├── browse.rs             # 一覧・削除・secure delete・移動・リネーム・一括移動・種別整理
    ├── scan.rs               # 重複検出（3 フェーズ）+ cancel_scan
    ├── large_files.rs / empty_folders.rs / old_files.rs
    ├── file_types.rs / disk_usage.rs / similar_images.rs
    ├── temp_cleaner.rs       # 一時ファイルのスキャンと削除
    ├── temp_paths.rs         # 安全拡張子・ブラウザキャッシュパス定義（mod のみ、re-export なし）
    ├── recycle_bin.rs / preview.rs / export.rs / drives.rs

design/                       # Figma 由来の HTML/PNG モック（実装の参照元）
docs/ARCHITECTURE.md          # ※内容が実装と乖離。「既知の乖離」参照
DESIGN.md                     # デザインシステム（色・タイポ・スペーシング）— 現行
HANDOFF.md                    # UI 拡張プロジェクトの作業履歴（長大なアーカイブ）
.claude/rules/*.md            # 言語別コーディングルール（本ファイルと併せて適用）
```

## Tauri コマンド一覧

全コマンドは `src-tauri/src/lib.rs` の `invoke_handler![]` に登録済み。
**戻り値のエラー型はすべて `String`**（`AppError` ではない）。

| コマンド | 引数（JS 側 camelCase） | 戻り値 | 定義 |
|---------|----------------------|--------|------|
| `get_directory_contents` | `path` | `FileNode[]` | browse.rs |
| `delete_item` | `path` | `void` | browse.rs（ゴミ箱へ） |
| `bulk_delete` | `paths` | `number`（削除数） | browse.rs |
| `secure_delete_item` | `path` | `void` | browse.rs（3 パス上書き後に削除） |
| `move_item` | `from`, `to` | `void` | browse.rs |
| `rename_item` | `path`, `newName` | `string`（新パス） | browse.rs |
| `bulk_move` | `paths`, `destDir` | `BulkMoveResult` | browse.rs |
| `organize_by_type` | `targetDir` | `BulkMoveResult` | browse.rs |
| `find_duplicates` | `targetDir` | `void`（結果はイベント） | scan.rs |
| `cancel_scan` | — | `void` | scan.rs |
| `export_duplicates` | `groups`, `format`, `outputPath` | `void` | export.rs（`"json"` / `"csv"`） |
| `find_large_files` | `targetDir`, `topN`, `minSize` | `LargeFile[]` | large_files.rs |
| `find_empty_folders` | `targetDir` | `EmptyFolder[]` | empty_folders.rs |
| `delete_empty_folders` | `paths` | `number` | empty_folders.rs |
| `find_old_files` | `targetDir`, `minDays`, `topN` | `OldFile[]` | old_files.rs |
| `analyze_file_types` | `targetDir` | `FileTypeAnalysis` | file_types.rs |
| `analyze_disk_usage` | `targetDir`, `depth` | `FolderSize` | disk_usage.rs |
| `find_similar_images` | `targetDir`, `threshold` | `SimilarImageGroup[]` | similar_images.rs |
| `scan_temp_files` | — | `TempScanResult` | temp_cleaner.rs |
| `clean_temp_files` | `paths` | `CleanResult` | temp_cleaner.rs |
| `get_file_preview` | `path` | `FilePreview` | preview.rs |
| `get_drive_info` | — | `DriveInfo[]`（Result ではない） | drives.rs |
| `get_recycle_bin_info` | — | `RecycleBinInfo`（Result ではない） | recycle_bin.rs |
| `empty_recycle_bin` | — | `CleanResult` | recycle_bin.rs |

### イベント

| イベント名 | ペイロード | 発行元 |
|-----------|-----------|--------|
| `scan_progress` | `ScanProgress { phase, scanned_files }` | 長時間スキャン系コマンド全般 |
| `duplicate_chunk` | `DuplicateGroup[]`（10 件ごと） | `find_duplicates` のみ |

## IPC 規約（重要）

- **コマンド引数は camelCase、構造体フィールドは snake_case。**
  Tauri が変換するのは引数名だけ。`types.rs` の構造体には `#[serde(rename_all = "camelCase")]` を付けていないため、
  フロントには `is_dir` / `total_files` / `modified_at` などがそのまま届く。
  `src/types/index.ts` もその形で定義されている。新しい型を足すときは**両側を snake_case で揃える**こと。
- **エラーは plain な文字列。** コマンドは `Result<T, String>` を返すので、
  `invoke()` の reject 値は `Error` インスタンスではなく素の string。
  必ず `src/lib/tauri.ts` の `extractErrorMessage()` を通すこと。
- **キャンセルの判定は文字列比較。** バックエンドは中断時に `"Scan was cancelled"` を返す。
  フックは `if (e !== 'Scan was cancelled')` でトースト表示を抑制している。この文字列を変える場合は両側を同時に直す。
- 新コマンドを足したら `lib.rs` の `invoke_handler![]` 登録と `commands/mod.rs` の `pub use` を忘れない。
- ダイアログ・通知など Tauri プラグイン API を追加で使う場合は
  `src-tauri/capabilities/default.json` に permission を追加する必要がある。

## スキャンフックのパターン

`src/hooks/use*.ts` は全て同じ形。新しいスキャン機能もこれに合わせる。

```ts
export function useXxx(currentPath: string) {
  const notify = useToast();
  const [results, setResults] = useState<Xxx[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);

  const handleScanXxx = useCallback(async (): Promise<void> => {
    setScanning(true);
    setScanProgress({ phase: '準備中...', scanned_files: 0 });
    setResults([]);

    const unlisten = listen<ScanProgress>('scan_progress', (e) => setScanProgress(e.payload));
    try {
      const res = await invoke<Xxx[]>('find_xxx', { targetDir: currentPath });
      setResults(res);
      await notifyComplete('スキャン完了', `${res.length} 件を検出しました`);
    } catch (e) {
      if (e !== 'Scan was cancelled') notify(`スキャンエラー: ${extractErrorMessage(e)}`, 'error');
    } finally {
      setScanning(false);
      setScanProgress(null);
      unlisten.then((fn) => fn());        // ★ 解除漏れ厳禁
    }
  }, [currentPath, notify]);

  return { results, scanning, scanProgress, handleScanXxx, removeXxx };
}
```

- 追加したフックは `App.tsx` で呼び、`useScanActions` にハンドラを渡し、
  `MainContent.tsx` に View 分岐を足し、`AppMode` に値を追加し、`buildQuickActions` にエントリを足す。
- `ScanState.cancel_token` は**アプリ全体で 1 本**。新しいスキャンを開始すると走行中のスキャンは自動でキャンセルされる。
  同時並行スキャンは現状サポートしない。

## 安全性の絶対ルール

- **削除は必ずユーザー確認の後**。`useConfirm()`（`src/lib/confirmContext.tsx`）を通す。
- **通常の削除は `trash` クレート経由でゴミ箱へ**。`std::fs::remove_*` での直接削除に置き換えない。
  完全消去は `secure_delete_item` のみ（ランダム → ゼロ → ランダムの 3 パス上書き後に削除）。
- **`secure_delete_item` のパス検証を外さない。** `validate_secure_delete_path()` が
  `..` を含むパスと Windows システムディレクトリ（`C:\Windows`、`C:\Program Files`、
  `C:\Program Files (x86)`、`C:\ProgramData`、`C:\System Volume Information`）配下を拒否する。
- **一時ファイル削除はホワイトリスト方式**。`clean_temp_files` は
  `temp_paths.rs` の `SAFE_EXTENSIONS`（tmp/log/bak/old/dmp/etl/chk/temp）に一致するか、
  `BROWSER_CACHE_DIRS` 配下のファイルのみ削除する。この検証を緩めない。
- **blake3 による重複検出ロジック（3 フェーズ）は変更禁止**。
  サイズ集約 → 先頭 4KB の部分ハッシュ → 64KB バッファでの全体ハッシュ、の順序とバッファサイズを維持する。
- スキャンは `follow_links(false)`。シンボリックリンク追跡を有効化しない。

## コーディング規約

`.claude/rules/` 配下のルールも併せて適用すること（`typescript-react.md` / `tauri-rust.md` / `rust-patterns.md` / `figma-to-code.md`）。
以下は実装の現状に合わせた補足。

### TypeScript / React

- **named export のみ**（default export 禁止）。Props は `interface` で定義。
- `any` 禁止（Biome の `noExplicitAny` が error）。`unknown` + 型ガードを使う。
- 関数の戻り値型は明示する（既存フックの一部は推論に頼っているが、新規コードでは明示）。
- 状態管理は **フック + Context のみ**。Zustand は導入していない（`.claude/rules/typescript-react.md` の記述は将来案）。
- インポートは相対パス（`../lib/tauri`）が現行スタイル。`@/*` エイリアスは tsconfig と vite に定義済みだが未使用。
- UI 文言は `src/i18n/messages.ts` から参照する。コンポーネントへの直書き禁止。
- 色は Tailwind のセマンティッククラス（`text-primary` / `bg-error/20` 等）を使う。
  CSS 変数が使えない箇所のみ `src/lib/design-tokens.ts` の定数を使う。
- コンポーネントは 300 行以下を目安に分割（`BrowseView.tsx` 377 行が現状の最大）。
- フォーマット実態: **スペース 2 / シングルクォート / 行幅 100**。Biome の既定値と異なるので下記の注意点を必ず読む。

### Rust

- 本番コードで `unwrap()` / `expect()` 禁止（`lib.rs` の Builder 起動部のみ例外）。テストは可。
- ログは `tracing::{info, warn, error}`。`println!` / `dbg!` を残さない。
- ファイル走査は `jwalk::WalkDir`（`std::fs::read_dir` は使わない）。`WalkDir::new_all()` はメモリ消費が大きいので不可。
- CPU バウンド処理は `rayon`、非同期 I/O は `tokio`。`Mutex` のガードを保持したまま `.await` しない。
- 長時間処理には `CancellationToken` によるキャンセルポイントを必ず入れる。
- `pub` 関数には doc comment（`///`）を付ける。

## テスト

- **TypeScript**: Vitest + jsdom。`src/test/setup.ts` が `@tauri-apps/api/core`・`event`・`plugin-dialog`・`plugin-notification`
  をモックするので、テストからは `vi.mocked(invoke)` を使う。テストは対象ファイルと同階層に `*.test.tsx` で置く。
  設定は `vitest.config.ts`（`vite.config.ts` 内の `test` ブロックは実質未使用の重複）。
- **Rust**: 各ファイル末尾の `#[cfg(test)] mod tests`。`error.rs` / `types.rs` / `scan.rs` などに配置済み。
- E2E は未導入。

## CI

`.github/workflows/ci.yml` が push / PR（main, master）と週次で 4 ジョブを実行する。

| ジョブ | 内容 |
|-------|------|
| Frontend | `pnpm typecheck` → `pnpm check` → `pnpm test` |
| Rust Lint | `cargo fmt -- --check` → `cargo clippy -- -D warnings` |
| Rust Test | `cargo test`（Rust Lint 成功が前提） |
| Security Audit | `pnpm audit --audit-level high` + `cargo audit` |

## 完了条件

コード変更後は以下をすべて確認する。

- [ ] `pnpm typecheck` エラーなし
- [ ] `pnpm test` 全グリーン
- [ ] `cd src-tauri && cargo clippy -- -D warnings` 警告なし
- [ ] `cd src-tauri && cargo fmt -- --check` 差分なし
- [ ] `cd src-tauri && cargo test` 全グリーン
- [ ] `pnpm lint` は **現状 `src/index.css` の `@theme` で parse error になる**（下記参照）。
      TS/TSX 側の lint 違反が 0 であることを確認する
- [ ] `pnpm check` は **実行しない**（下記参照）

## 既知の乖離・落とし穴

実装を触る前に把握しておくこと。いずれも本ファイル作成時点で確認済み。

1. **biome.json が存在しない。**
   Biome の既定値（タブ / ダブルクォート）と実装スタイル（スペース 2 / シングルクォート）が食い違うため、
   `pnpm check`（= `biome check --write src/`）を実行すると **64 ファイルが一括で再フォーマットされる**。
   lint 違反は 0 件で、検出はすべて format 差分。
   また `pnpm lint` は `src/index.css` の Tailwind v4 `@theme` を解釈できず parse error 1 件で失敗する。
   解消するには `biome.json` に `formatter.indentStyle: "space"` / `indentWidth: 2` /
   `javascript.formatter.quoteStyle: "single"` / `lineWidth: 100` と
   CSS パーサの `tailwindDirectives: true` を設定する必要がある。未対応。
   CI の Frontend ジョブは `--write` 付きの `pnpm check` を実行しているため、この不一致が緑のまま隠れている。

2. **`AppError` は定義されているだけで未使用。**
   `src-tauri/src/error.rs` に enum と `From<io::Error>` / `From<AppError> for String` があるが、
   `commands/` からの参照は 0 件で、全コマンドが `Result<T, String>` を返す。
   `thiserror` も依存に入っていない（`fmt::Display` を手書き）。
   シリアライズ形式は `{ kind, detail }`（`#[serde(tag = "kind", content = "detail")]`）であって `{ kind, message }` ではない。

3. **アイコンライブラリが混在。**
   `.claude/rules/figma-to-code.md` は Material Symbols を指定しているが、
   実際は 15 ファイルが `lucide-react` を使い、Material Symbols は App.tsx と layout 系の 5 ファイルのみ。
   既存ファイルを編集するときは**そのファイルの流儀に合わせる**のが安全。

4. **`docs/ARCHITECTURE.md` が実装と乖離している。**
   存在しない `src/lib/tauri-commands.ts`、`components/views/`、「Wing ルーティング」、`docs/TESTING.md`、
   en/ja 二言語 i18n、`AppError` ベースのエラーフローを記述している。
   構造の参照元としては本ファイルを優先すること。`README.md` と `DESIGN.md` は概ね実装と一致している。

5. **`.claude/settings.json` の hook が Windows 固有の絶対パスを含む。**
   `c:/dev/.claude/hooks/pre-bash.sh`、`cd /c/dev/drive-cleaner`、PowerShell の Beep など。
   別環境では失敗する。`.claude/hooks/post-edit.sh` の Biome ブロックは `biome.json` の存在を前提にしているため、
   現状は動作しない（項目 1 と連動）。

6. **`.claude/critical-context.md` の記述が古い。**
   「App.tsx 962 行 / lib.rs 487 行のリファクタリング中」とあるが、分割は完了済み（App.tsx 約 200 行、lib.rs 48 行）。

7. **`tauri.conf.json` の `beforeDevCommand` / `beforeBuildCommand` が `npm run ...`。**
   プロジェクトは pnpm 管理なので、npm 未導入環境では `pnpm tauri dev` が失敗する。

8. **`src/lib/quickActions.ts` が hex 色を直書きしている。**
   DESIGN.md の「色はトークン経由」ルールに反する。8 件のクイックアクションの `color` フィールド。

9. **`sqlite_mcp_server.db`（0 バイト）がリポジトリ直下にコミットされている。** 用途不明の残骸。

10. **`src/進行順まとめ：.ini`** という日本語ファイル名の作業メモがある。ビルドには無関係。
