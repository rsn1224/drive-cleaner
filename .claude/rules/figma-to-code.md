# Figma → コード変換ルール（drive-cleaner/ プロジェクト固有）

> `figma-implement-design` スキルを使う際は、このファイルのルールを**全て適用**すること。
> HUD（ヘッドアップディスプレイ）スタイルのデザインシステムに準拠する。

---

## 1. 色/トークン変換

### 基本規則

- Figma の hex/RGB 値をコードに hardcode 禁止
- 必ず `src/index.css` の CSS 変数を使う（`src/lib/design-tokens.ts` を参照してもよい）

### CSS 変数対応表

| セマンティクス | CSS 変数 | 実値 |
|--------------|---------|------|
| プライマリ（Cyan） | `--color-primary` | `#00F0FF` |
| セカンダリ（Green） | `--color-secondary` | `#00FF66` |
| ターシャリ（Amber） | `--color-tertiary` | `#FFB800` |
| エラー | `--color-error` | `#FF4D4D` |
| 背景（最暗） | `--color-surface` | `#000000` |
| コンテナ | `--color-surface-container` | `#0A0A0A` |
| 高レベル | `--color-surface-high` | `#121212` |
| 最高レベル | `--color-surface-higher` | `#1A1A1A` |

### Tailwind での使い方

```tsx
<div className="bg-surface text-primary border border-primary/30">
<span className="text-secondary">
<div className="text-tertiary">
```

---

## 2. HUD デコレーションパターン

### コーナーブラケット（既存 CSS クラスを使う）

`src/index.css` に `.bracket-tl`, `.bracket-tr`, `.bracket-bl`, `.bracket-br` が定義済み。

```tsx
// OK: 既存クラスを使う
<div className="relative p-4">
  <div className="bracket-tl" />
  <div className="bracket-tr" />
  {/* content */}
  <div className="bracket-bl" />
  <div className="bracket-br" />
</div>

// NG: 独自 CSS でブラケットを実装する
```

### スキャンライン効果

```tsx
<div className="relative overflow-hidden">
  <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,240,255,0.03)_2px,rgba(0,240,255,0.03)_4px)] pointer-events-none" />
  {/* content */}
</div>
```

### グリッド背景

```tsx
<div className="bg-[linear-gradient(rgba(0,240,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]">
```

---

## 3. フォント

### HUD ラベル

```tsx
// HUD 系のラベル・数値には Space Grotesk を使う
<span className="font-hud text-primary text-xs tracking-widest uppercase">
  DISK USAGE
</span>
// font-family: var(--font-family-hud) = "Space Grotesk"
```

---

## 4. アイコン

**Material Symbols を使う（`lucide-react` は使わない）**

```tsx
// OK
<span className="material-symbols-outlined text-primary">delete</span>
<span className="material-symbols-outlined text-secondary">folder</span>
<span className="material-symbols-outlined text-tertiary">warning</span>

// NG
import { Trash2 } from 'lucide-react';
```

よく使うアイコン名: `delete`, `folder`, `folder_open`, `description`, `storage`, `warning`, `error`, `check_circle`, `refresh`, `cancel`, `search`

---

## 5. コンポーネントマッピング

| Figma コンポーネント | コード実装 |
|--------------------|-----------|
| スキャンボタン | `<button className="border border-primary/50 text-primary hover:bg-primary/10 font-hud ...">` |
| プログレスバー | `<div className="h-1 bg-surface-higher"><div className="h-full bg-primary transition-all" style={{ width: \`${pct}%\` }} /></div>` |
| ファイルリストアイテム | `src/components/` の既存コンポーネントを優先 |

---

## 6. インタラクション状態

```tsx
// Hover（Cyan グロー）
'hover:bg-primary/10 hover:border-primary/70 hover:shadow-[0_0_8px_rgba(0,240,255,0.3)]'

// Active
'active:bg-primary/20'

// Disabled
'disabled:pointer-events-none disabled:opacity-40 disabled:text-primary/30'

// Focus
'focus:outline-none focus:ring-1 focus:ring-primary/70 focus:ring-offset-0'
```

---

## 7. 実装後チェックリスト

- [ ] `--color-primary/secondary/tertiary` の CSS 変数のみ使用（hex hardcode なし）
- [ ] アイコンは Material Symbols（`<span class="material-symbols-outlined">`）
- [ ] HUD ラベルは `font-hud` クラス（Space Grotesk）を適用
- [ ] コーナーブラケットは `.bracket-tl/tr/bl/br` クラスを使用
- [ ] `pnpm typecheck` エラーなし
- [ ] `pnpm check` エラーなし
