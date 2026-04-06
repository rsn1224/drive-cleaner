---
description: React 19 + TypeScript + Tailwind CSS v4 のフロントエンドルール
globs: "src/**/*.{ts,tsx}"
---

# TypeScript / React ルール

## 型安全
- `any` 型禁止 → `unknown` + 型ガード
- 関数には戻り値の型を明示
- Tauri invoke は型付きラッパー関数経由で呼ぶ（`src/lib/tauri-commands.ts`）

## コンポーネント
- named export 必須（default export 禁止）
- Props の型は interface で定義（type より interface 優先）
- コンポーネントは300行以下（超過時は分割）

## 状態管理（Zustand v5）
- ストアはドメインごとに分割（1ストア1責務）
- `set()` 内でストア外の副作用を呼ばない
- セレクタでの不要な再レンダリングを防ぐ

## スタイル（Tailwind CSS v4）
- インラインスタイル禁止 → Tailwind クラスを使う
- デザイントークンが定義されている場合は CSS 変数を参照
- レスポンシブは mobile-first（`sm:`, `md:`, `lg:`）

## Biome
- `npx biome check --apply src/` で自動修正
- import の並び替えは Biome に任せる（手動整理禁止）
