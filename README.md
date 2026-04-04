# Drive Cleaner

Windows 向けディスク容量分析・ファイル管理デスクトップアプリ（Tauri v2）。

![Platform](https://img.shields.io/badge/platform-Windows-lightgrey)

## Features

- **重複ファイル検出** — blake3 ハッシュによる高速重複スキャン
- **大容量ファイル検出** — BinaryHeap でトップN件を効率検出
- **空フォルダ検出・一括削除** — 再帰探索で空ディレクトリをクリーンアップ
- **古いファイル検出** — 最終更新日が1年以上前のファイルを検出
- **ファイル種別分析** — 拡張子カテゴリ別にサイズを集計・棒グラフ表示
- **ディスク使用量分析** — フォルダサイズのドリルダウン可視化
- **一時/キャッシュクリーナー** — Windows 定型パスの一時ファイルを安全に削除
- **ファイルブラウザ** — 仮想スクロール対応の高速ファイル一覧

## Tech Stack

| 層 | 技術 |
|----|------|
| フロントエンド | React 19 + TypeScript + Tailwind CSS v4 |
| バックエンド | Rust + Tauri v2 |
| 並列処理 | jwalk + rayon |
| ハッシュ | blake3 |
| UI | Lucide React + react-window |

## Requirements

- Windows 10 / 11

## Development

```bash
npm install
npm run tauri dev
```

### Build

```bash
npm run tauri build
```

## License

MIT
