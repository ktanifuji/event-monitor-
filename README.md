# 🎵 イベント定員監視システム

Twipla.jpのイベント定員を自動監視し、空きが出た際に通知するWebアプリです。

## 📝 概要

「Gassyoh スピーカーが2台あり MEGAMIX Release Party 東京場所」の定員状況を30分間隔で監視し、定員に空きが出た際に自動で通知します。

- **監視対象**: https://twipla.jp/events/682940
- **監視間隔**: 30分ごと
- **通知方法**: GitHub Issues、ブラウザ通知、音声アラート

## 🚀 特徴

- ✅ **完全無料**: GitHub Actions + GitHub Pagesで運用コスト0円
- 🔄 **自動監視**: GitHub Actionsによる定期実行
- 📱 **リアルタイム表示**: Webインターフェースで現在の状況を確認
- 🔔 **多様な通知**: ブラウザ通知、音声アラート、GitHub Issues
- 📊 **履歴管理**: 定員状況の履歴を自動保存・表示
- 📱 **レスポンシブ**: モバイル・デスクトップ対応

## 🛠️ セットアップ

### 1. リポジトリのフォーク・クローン

```bash
git clone https://github.com/ktanifuji/event-capacity-monitor.git
cd event-capacity-monitor
```

### 2. GitHub設定

#### GitHub Pagesの有効化
1. リポジトリの `Settings` → `Pages`
2. Source: `GitHub Actions`
3. 保存

#### GitHub Actionsの権限設定
1. リポジトリの `Settings` → `Actions` → `General`
2. Workflow permissions: `Read and write permissions` を選択
3. 保存

### 3. 初回実行

GitHub Actionsが自動で開始されます。手動実行も可能：

1. `Actions` タブを開く
2. `Event Capacity Monitor` ワークフローを選択
3. `Run workflow` をクリック

## 📱 使用方法

### Webアプリにアクセス
https://ktanifuji.github.io/event-capacity-monitor

### 機能
- **現在の定員状況**: リアルタイムで参加者数と空き状況を表示
- **通知設定**: ブラウザ通知と音声アラートのオン/オフ
- **監視履歴**: 過去の定員状況の推移を確認
- **イベント情報**: イベント詳細と参加リンク

### 通知について

#### ブラウザ通知
- 初回アクセス時に通知許可を求められます
- 定員に空きが出ると自動でプッシュ通知が表示されます

#### GitHub Issues通知
- 定員状況に変化があると自動でIssueが作成されます
- リポジトリをWatchしていればメール通知も受け取れます

## 🔧 技術仕様

### アーキテクチャ
```
GitHub Actions (監視・データ収集)
    ↓
GitHub Repository (データ保存)
    ↓
GitHub Pages (Webアプリ配信)
    ↓
ユーザーブラウザ (表示・通知)
```

### 使用技術
- **バックエンド**: Node.js, GitHub Actions
- **フロントエンド**: HTML, CSS, JavaScript
- **データ取得**: Axios, Cheerio (Web Scraping)
- **通知**: GitHub Issues API, Browser Notification API
- **ホスティング**: GitHub Pages

### ファイル構成
```
event-capacity-monitor/
├── .github/workflows/
│   └── monitor.yml          # GitHub Actions設定
├── docs/                    # GitHub Pages用
│   ├── index.html          # メインページ
│   ├── script.js           # フロントエンドロジック
│   ├── style.css           # スタイルシート
│   └── data/
│       └── status.json     # 監視結果データ
├── scripts/
│   └── monitor.js          # 監視スクリプト
├── package.json
└── README.md
```

## 📊 データ形式

### status.json
```json
{
  "current": {
    "timestamp": "2025-06-20T12:00:00.000Z",
    "eventUrl": "https://twipla.jp/events/682940",
    "currentParticipants": 42,
    "maxCapacity": 42,
    "availableSlots": 0,
    "isFull": true,
    "lastChecked": "2025/6/20 21:00:00"
  },
  "previous": { /* 前回の状態 */ },
  "history": [ /* 過去の状態配列 */ ]
}
```

## 🚨 通知トリガー

以下の場合に通知が発生します：

1. **満員 → 空きあり**: 最も重要な通知
2. **空き数増加**: 参加チャンスの拡大

## ⚙️ カスタマイズ

### 監視間隔の変更
`.github/workflows/monitor.yml` の cron設定を変更：
```yaml
schedule:
  - cron: '*/15 * * * *'  # 15分間隔に変更
```

### 監視対象イベントの変更
`scripts/monitor.js` のEVENT_URL変数を変更：
```javascript
const EVENT_URL = 'https://twipla.jp/events/YOUR_EVENT_ID';
```

## 🛡️ 注意事項

- Twipla.jpの利用規約を遵守してください
- 過度なアクセスを避けるため、監視間隔は15分以上を推奨
- GitHub Actionsの使用制限（月2000分）にご注意ください

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 🤝 コントリビューション

バグ報告、機能要望、プルリクエストを歓迎します！

## 🔗 リンク

- **Webアプリ**: https://ktanifuji.github.io/event-capacity-monitor
- **イベントページ**: https://twipla.jp/events/682940
- **GitHub**: https://github.com/ktanifuji/event-capacity-monitor

## 📞 サポート

問題が発生した場合は、GitHubのIssuesページでお知らせください。

---

🎵 **楽しいイベントライフを！** 🎵