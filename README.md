# tmn-tetris-2phh

> **Status**: 🎨 DESIGNING

## 概要

クラシックテトリスゲーム。ブロックを回転・移動させて、ラインを消去し、高得点を目指すWebアプリケーション。

## 機能

- [ ] ゲームプレイ
- [ ] ハイスコア保存
- [ ] スコア表示
- [ ] ゲーム難易度選択
- [ ] モバイル対応

## 画面

| パス | 画面名 | 説明 |
|------|--------|------|
| `/` | ホーム | ゲームスタート画面。難易度選択とハイスコア表示 |
| `/game` | ゲーム画面 | テトリスのメインゲーム画面 |

## データ

### GameScore

| フィールド | 型 | 説明 |
|-----------|-----|------|
| difficulty | string | ゲーム難易度（easy, medium, hard） |
| score | number | プレイヤーのスコア |
| date | string | スコア記録日 |

## 認証

なし

---

## Tech Stack

- Framework: Next.js 14 (App Router)
- Styling: Tailwind CSS + shadcn/ui
- Database: localStorage (ブラウザストレージ)
- Hosting: Vercel
