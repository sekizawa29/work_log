# GitHubへのプッシュ手順

## 1. GitHubで新しいリポジトリを作成

1. GitHub (https://github.com) にアクセスしてログイン
2. 右上の「+」ボタンから「New repository」を選択
3. リポジトリ名を入力（例: `work-log` または `time-tracker`）
4. Descriptionに説明を入力（任意）
5. **Public** または **Private** を選択
6. **「Add a README file」のチェックは外す**（既にREADME.mdがあるため）
7. 「Create repository」をクリック

## 2. ローカルリポジトリをGitHubにプッシュ

GitHubでリポジトリを作成すると、コマンドが表示されます。
以下のコマンドを実行してください：

```bash
# GitHubリポジトリをリモートとして追加
git remote add origin https://github.com/YOUR_USERNAME/REPOSITORY_NAME.git

# mainブランチにリネーム（GitHubのデフォルトブランチ名に合わせる）
git branch -M main

# GitHubにプッシュ
git push -u origin main
```

**注意**: `YOUR_USERNAME` と `REPOSITORY_NAME` を実際の値に置き換えてください。

## 3. プッシュ後の確認

GitHubのリポジトリページをブラウザで開いて、ファイルがアップロードされているか確認してください。

## 今後の作業フロー

### 変更をコミット

```bash
# 変更を確認
git status

# ファイルをステージング
git add .

# コミット
git commit -m "機能追加: 新しい機能の説明"

# GitHubにプッシュ
git push
```

### ブランチを使った開発

```bash
# 新しいブランチを作成して切り替え
git checkout -b feature/new-feature

# 作業...

# 変更をコミット
git add .
git commit -m "新機能を追加"

# GitHubにプッシュ
git push -u origin feature/new-feature
```

その後、GitHubでPull Requestを作成してmainブランチにマージできます。

## トラブルシューティング

### 認証エラーが出る場合

GitHubの認証方法は以下の2つがあります：

1. **Personal Access Token (推奨)**
   - GitHub Settings > Developer settings > Personal access tokens
   - 新しいトークンを生成
   - プッシュ時にパスワードの代わりにトークンを使用

2. **SSH Key**
   - SSH keyを生成してGitHubに登録
   - リモートURLをSSH形式に変更:
     ```bash
     git remote set-url origin git@github.com:YOUR_USERNAME/REPOSITORY_NAME.git
     ```

## デプロイ（オプション）

### Vercelにデプロイ

```bash
# Vercel CLIをインストール
npm install -g vercel

# デプロイ
vercel
```

または、GitHubリポジトリをVercelに接続して自動デプロイも可能です。

### GitHub Pagesにデプロイ

`vite.config.ts` にbase設定を追加：

```typescript
export default defineConfig({
  plugins: [react()],
  base: '/REPOSITORY_NAME/',
})
```

`.github/workflows/deploy.yml` を作成してGitHub Actionsでデプロイできます。
