# テキスト比較アプリ

Next.jsとReactを使用して作成されたテキスト比較アプリケーションです。2つのテキストを入力して、リアルタイムで差分を表示できます。

## 機能

- 2つのテキストエリアにテキストを入力
- リアルタイムでの差分表示
- 左右分割表示で差分を視覚的に確認
- サンプルデータの読み込み機能
- テキストのクリア機能
- レスポンシブデザイン

## 技術スタック

- **Next.js 15** - Reactフレームワーク
- **React 19** - UIライブラリ
- **TypeScript** - 型安全性
- **Tailwind CSS** - スタイリング
- **react-diff-viewer-continued** - 差分表示コンポーネント

## セットアップ

1. 依存関係をインストール:
```bash
npm install
```

2. 開発サーバーを起動:
```bash
npm run dev
```

3. ブラウザで [http://localhost:3000](http://localhost:3000) を開く

## 使用方法

1. 「サンプルデータを読み込み」ボタンをクリックしてサンプルテキストを表示
2. または、左右のテキストエリアに任意のテキストを入力
3. 下部の差分表示エリアでリアルタイムに差分を確認
4. 「クリア」ボタンでテキストをリセット

## ビルド

本番用ビルドを作成:
```bash
npm run build
```

ビルドされたアプリケーションを起動:
```bash
npm start
```

## ライセンス

MIT
