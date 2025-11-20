# ⏱️ Time Tracker

シンプルで美しい個人用時間計測Webアプリケーション

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?logo=vite)

## ✨ 特徴

- 🎨 **モダンでクリーンなUI**: glassmorphismを取り入れた美しいデザイン
- ⚡ **高速**: Viteによる爆速な開発体験とビルド
- 📊 **データ可視化**: クライアント別の時間配分や日次の作業時間をグラフで表示
- 💾 **ローカル保存**: ブラウザのLocalStorageにデータを保存
- 🔄 **タスク履歴**: 同じタスクを複数回記録、自動で合算
- 🎯 **オートコンプリート**: 過去のタスク名を予測入力
- 🌐 **日本語対応**: 日本語フォントスタックを最適化

## 🚀 クイックスタート

### 必要なもの

- Node.js (v18以上推奨)
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/YOUR_USERNAME/work-log.git
cd work-log

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで `http://localhost:5173` を開いてください。

## 📦 ビルド

```bash
# プロダクションビルド
npm run build

# ビルドしたファイルをプレビュー
npm run preview
```

## 🛠️ 技術スタック

- **フレームワーク**: React 19 + TypeScript
- **ビルドツール**: Vite 7
- **スタイリング**: Tailwind CSS v4
- **グラフ**: Recharts
- **アイコン**: Lucide React

## 📖 使い方

### タスクの計測

1. クライアントを選択（新規追加も可能）
2. タスク名を入力
3. 「開始」ボタンをクリック
4. 作業が終わったら「停止」ボタンをクリック

### 分析画面

「分析」タブに切り替えると以下が確認できます：

- 総作業時間、タスク数、クライアント数
- クライアント別の時間配分（円グラフ）
- 過去7日間の作業時間推移（棒グラフ）

## 📁 プロジェクト構造

```
work-log/
├── src/
│   ├── components/     # Reactコンポーネント
│   │   ├── Analytics.tsx
│   │   ├── TaskHistory.tsx
│   │   ├── TaskInput.tsx
│   │   └── Timer.tsx
│   ├── hooks/         # カスタムフック
│   │   ├── useTimeTracking.ts
│   │   └── useTimer.ts
│   ├── types/         # TypeScript型定義
│   │   └── index.ts
│   ├── utils/         # ユーティリティ関数
│   │   └── helpers.ts
│   ├── App.tsx        # メインアプリケーション
│   ├── main.tsx       # エントリーポイント
│   └── index.css      # グローバルスタイル
├── public/            # 静的ファイル
└── index.html         # HTMLテンプレート
```

## 🎯 今後の機能拡張案

- [ ] データのエクスポート/インポート（JSON/CSV）
- [ ] ダークモード対応
- [ ] クライアントカラーのカスタマイズ
- [ ] タスクのタグ付け機能
- [ ] 週次/月次レポート
- [ ] PWA対応（オフライン動作）

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

Issue や Pull Request は大歓迎です！

## 📮 お問い合わせ

質問や提案がある場合は、Issueを作成してください。
