const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// 監視対象のイベントURL
const EVENT_URL = 'https://twipla.jp/events/682940';
const DATA_FILE = 'docs/data/status.json';

// 現在の状態を取得
async function checkEventCapacity() {
    try {
        console.log('イベントページをチェック中...');
        const response = await axios.get(EVENT_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        
        // 参加者情報を抽出（例：「参加者 (42人／定員42人)」）
        const participantText = $('body').text();
        const participantMatch = participantText.match(/参加者\s*\((\d+)人／定員(\d+)人\)/);
        
        if (!participantMatch) {
            throw new Error('参加者情報を取得できませんでした');
        }

        const currentParticipants = parseInt(participantMatch[1]);
        const maxCapacity = parseInt(participantMatch[2]);
        const availableSlots = maxCapacity - currentParticipants;
        
        const status = {
            timestamp: new Date().toISOString(),
            eventUrl: EVENT_URL,
            currentParticipants,
            maxCapacity,
            availableSlots,
            isFull: availableSlots === 0,
            lastChecked: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
        };

        console.log(`現在の状況: ${currentParticipants}/${maxCapacity}人 (空き: ${availableSlots}人)`);
        
        return status;

    } catch (error) {
        console.error('エラーが発生しました:', error.message);
        return {
            timestamp: new Date().toISOString(),
            error: error.message,
            lastChecked: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
        };
    }
}

// 過去の状態を読み込み
function loadPreviousStatus() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.log('過去のデータを読み込めませんでした:', error.message);
    }
    return null;
}

// 状態の変化をチェック
function checkForChanges(previousStatus, currentStatus) {
    if (!previousStatus || previousStatus.error) {
        return false;
    }

    // 定員に空きが出た場合
    if (previousStatus.isFull && !currentStatus.isFull) {
        return {
            type: 'availability',
            message: `🎉 定員に空きが出ました！現在 ${currentStatus.availableSlots} 人分の空きがあります。`
        };
    }

    // 空きが増えた場合
    if (currentStatus.availableSlots > previousStatus.availableSlots) {
        return {
            type: 'increase',
            message: `📈 空きが増えました！${previousStatus.availableSlots} → ${currentStatus.availableSlots} 人分`
        };
    }

    return false;
}

// GitHub Issue作成（通知用）
async function createNotificationIssue(change, status) {
    const { Octokit } = require('@octokit/rest');
    
    if (!process.env.GITHUB_TOKEN) {
        console.log('GitHub Tokenが設定されていないため、Issue作成をスキップします');
        return;
    }

    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });

    try {
        await octokit.rest.issues.create({
            owner: 'ktanifuji',
            repo: 'event-capacity-monitor',
            title: `🚨 イベント定員状況変化通知 - ${status.lastChecked}`,
            body: `${change.message}

## 現在の状況
- 参加者: ${status.currentParticipants}/${status.maxCapacity}人
- 空き: ${status.availableSlots}人
- 最終確認: ${status.lastChecked}

## イベント詳細
- URL: ${status.eventUrl}
- イベント名: Gassyoh スピーカーが2台あり MEGAMIX Release Party

[参加申し込みはこちら](${status.eventUrl})`,
            labels: ['notification', 'capacity-change']
        });

        console.log('GitHub Issueで通知を作成しました');
    } catch (error) {
        console.error('Issue作成に失敗しました:', error.message);
    }
}

// メイン処理
async function main() {
    const previousStatus = loadPreviousStatus();
    const currentStatus = await checkEventCapacity();

    // 変化をチェック
    const change = checkForChanges(previousStatus, currentStatus);
    if (change) {
        console.log('変化を検出:', change.message);
        await createNotificationIssue(change, currentStatus);
    }

    // 履歴を保存
    const history = {
        current: currentStatus,
        previous: previousStatus,
        lastUpdate: new Date().toISOString(),
        history: []
    };

    // 過去の履歴を保持（最大50件）
    if (previousStatus && previousStatus.history) {
        history.history = [...previousStatus.history.slice(-49), previousStatus.current].filter(Boolean);
    }

    // データディレクトリ作成
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // 結果を保存
    fs.writeFileSync(DATA_FILE, JSON.stringify(history, null, 2));
    console.log('状態を保存しました');
}

// 実行
main().catch(console.error);