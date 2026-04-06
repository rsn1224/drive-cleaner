# Drive Cleaner — デザインシステム

HUD/SCI-FI 美学を持つダークデスクトップアプリのデザイン仕様。  
CSS 変数は `src/index.css` @theme セクションで定義。JS 定数は `src/lib/design-tokens.ts` を参照。

---

## カラーシステム

| トークン | CSS変数 | 値 | 用途 |
|---------|--------|-----|------|
| Primary | `--color-primary` | `#00F0FF` | アクセント、フォーカスリング、進捗バー |
| Secondary | `--color-secondary` | `#00FF66` | KEEP バッジ、成功状態 |
| Tertiary | `--color-tertiary` | `#FFB800` | 警告、強調 |
| Error | `--color-error` | `#FF4D4D` | 削除対象、エラー状態 |
| Surface | `--color-surface` | `#000000` | ベース背景 |
| Surface Container | `--color-surface-container` | `#0A0A0A` | カード背景、ツールチップ |
| Surface High | `--color-surface-high` | `#121212` | セカンダリサーフェス |
| Surface Higher | `--color-surface-higher` | `#1A1A1A` | ホバー背景 |
| On Surface | `--color-on-surface` | `#E0E0E0` | 本文テキスト |
| Outline | `--color-outline` | `#333333` | 区切り線 |

**ルール:** コンポーネントの色は必ず上記の CSS 変数または Tailwind クラス（`text-primary`, `bg-error/20` 等）を使用すること。  
JS ライブラリ（Nivo 等）で CSS 変数が使えない場合は `src/lib/design-tokens.ts` の定数を使用すること。

---

## タイポグラフィ

| 役割 | サイズ | Tailwind | 使用箇所 |
|-----|--------|----------|---------|
| KPI / 大見出し | 24px | `text-2xl` | スキャン結果の合計数値 |
| 見出し / ボタン | 11px | `text-[11px]` | セクション見出し、ボタンテキスト |
| 本文 | 12px | `text-xs` | ファイルパス、説明文 |
| ラベル | 10px | `text-[10px]` / `.hud-label` | キャプション、バッジ |
| ナビゲーション | 9px | `text-[9px]` | BottomNav タブラベル |

**`.hud-label` クラス:**
- font-size: 10px / font-weight: 700 / text-transform: uppercase / letter-spacing: 0.2em
- HUD スタイルのラベル・キャプション全般に使用

**禁止:** `text-[13px]` などスケール外のカスタムサイズ使用禁止。

---

## スペーシング

Tailwind の 4px グリッドに準拠（1 = 4px）。

| 用途 | クラス |
|-----|--------|
| コンパクトパディング | `p-1.5` (6px) / `px-2 py-1` |
| 標準パディング | `p-3` (12px) / `px-3 py-2` |
| ゆったりパディング | `p-4` (16px) / `px-4 py-3` |
| アイテム間ギャップ | `gap-1` / `gap-2` / `gap-3` |
| セクション間ギャップ | `gap-4` / `gap-6` |

---

## シャドウ / グロー

| クラス | 定義 | 用途 |
|-------|------|------|
| `.shadow-glow-primary` | `box-shadow: 0 0 12px color-mix(in srgb, var(--color-primary) 60%, transparent)` | 進捗バー、アクティブインジケーター |
| `.glow-cyan` | `filter: drop-shadow(0 0 8px rgba(0,240,255,0.4))` | アイコングロー |
| `.glow-green` | `filter: drop-shadow(0 0 8px rgba(0,255,102,0.4))` | 成功グロー |
| `.glow-amber` | `filter: drop-shadow(0 0 8px rgba(255,184,0,0.4))` | 警告グロー |

---

## コンポーネントパターン

### ボーダースタイル

```
border border-white/5              通常カード
border border-white/5 border-l-2 border-l-primary  アクティブカード（左アクセント）
border border-primary/20           ハイライトカード
```

### フォーカスリング（全インタラクティブ要素に必須）

```
focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none
```

### ローディング状態

```tsx
<div className="animate-spin h-8 w-8 border-2 border-white/10 border-t-primary" />
```

---

## 国際化

全ユーザー向けテキストは `src/i18n/messages.ts` から参照すること。  
コンポーネント内への直接ハードコードは禁止。  
HUD スタイルの英語大文字ラベル（例: `EXECUTE_PURGE`）も messages.ts で管理する。
