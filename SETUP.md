# 🚀 セットアップ手順書

## 1. GitHubリポジトリの作成

1. https://github.com/ktanifuji にログイン
2. 「New repository」をクリック
3. リポジトリ名: `event-capacity-monitor`
4. **Public** を選択（GitHub Pages使用のため）
5. 「Create repository」をクリック

## 2. ファイルのアップロード

### 方法A: GitHub Web界面を使用
1. 作成したリポジトリページで「uploading an existing file」をクリック
2. このフォルダの全ファイルをドラッグ&ドロップ
3. コミットメッセージ: "Initial commit: Add event capacity monitor"
4. 「Commit changes」をクリック

### 方法B: Git コマンドライン使用
```bash
# このフォルダで実行
git init
git add .
git commit -m "Initial commit: Add event capacity monitor"
git branch -M main
git remote add origin https://github.com/ktanifuji/event-capacity-monitor.git
git push -u origin main
```

## 3. GitHub Pages設定

1. リポジトリの「Settings」タブをクリック
2. 左サイドバーで「Pages」をクリック
3. Source: 「GitHub Actions」を選択
4. 「Save」をクリック

## 4. GitHub Actions権限設定

1. リポジトリの「Settings」タブをクリック
2. 左サイドバーで「Actions」→「General」をクリック
3. 「Workflow permissions」で「Read and write permissions」を選択
4. 「Save」をクリック

## 5. 初回実行

1. 「Actions」タブをクリック
2. 「Event Capacity Monitor」ワークフローを選択
3. 「Run workflow」をクリック
4. 「Run workflow」ボタンを押して実行

## 6. 動作確認

### Webアプリアクセス
- URL: https://ktanifuji.github.io/event-capacity-monitor
- GitHub Pagesのデプロイに数分かかる場合があります

### 監視状況確認
- GitHub Actionsが30分ごとに自動実行
- 「Actions」タブで実行履歴を確認可能
- 定員変化時に「Issues」タブに通知が作成される

## 7. 通知設定

### ブラウザ通知
- Webアプリ初回アクセス時に通知許可を求められます
- 許可することで定員変化時にプッシュ通知を受信

### メール通知
- リポジトリを「Watch」設定すると、Issues作成時にメール通知

## 🎉 完了！

設定が完了すると：
- 30分ごとに自動で定員チェック
- 定員に空きが出た際に即座に通知
- Webアプリでリアルタイム状況確認可能

## 🔧 カスタマイズ

### 監視間隔変更
`.github/workflows/monitor.yml` の cron設定を変更

### 対象イベント変更
`scripts/monitor.js` の EVENT_URL を変更

## 📞 サポート

問題が発生した場合は、GitHub Issuesで報告してください。