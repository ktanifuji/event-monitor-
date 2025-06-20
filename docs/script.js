class EventMonitor {
    constructor() {
        this.statusData = null;
        this.notificationPermission = false;
        this.settings = this.loadSettings();
        this.init();
    }

    async init() {
        await this.loadStatus();
        this.setupEventListeners();
        this.requestNotificationPermission();
        this.startPeriodicUpdate();
        this.applySettings();
    }

    // 設定の読み込み
    loadSettings() {
        const saved = localStorage.getItem('eventMonitorSettings');
        return saved ? JSON.parse(saved) : {
            browserNotifications: true,
            soundAlerts: true
        };
    }

    // 設定の保存
    saveSettings() {
        localStorage.setItem('eventMonitorSettings', JSON.stringify(this.settings));
    }

    // 設定の適用
    applySettings() {
        document.getElementById('browser-notifications').checked = this.settings.browserNotifications;
        document.getElementById('sound-alerts').checked = this.settings.soundAlerts;
    }

    // 状態データの読み込み
    async loadStatus() {
        try {
            const response = await fetch('data/status.json');
            if (response.ok) {
                this.statusData = await response.json();
                this.updateDisplay();
            } else {
                this.showError('データの読み込みに失敗しました');
            }
        } catch (error) {
            this.showError('データの読み込み中にエラーが発生しました: ' + error.message);
        }
    }

    // 表示の更新
    updateDisplay() {
        if (!this.statusData || !this.statusData.current) {
            this.showError('有効なデータがありません');
            return;
        }

        const current = this.statusData.current;
        
        // エラーがある場合
        if (current.error) {
            this.showError('監視エラー: ' + current.error);
            return;
        }

        // 現在の状況を表示
        this.displayCurrentStatus(current);
        
        // 履歴を表示
        this.displayHistory();
        
        // 最終更新時刻を表示
        this.updateTimestamps();

        // 変化をチェック（通知）
        this.checkForChanges();
    }

    // 現在の状況表示
    displayCurrentStatus(status) {
        const statusContainer = document.getElementById('current-status');
        const isAvailable = status.availableSlots > 0;
        
        statusContainer.innerHTML = `
            <div class="status-item ${isAvailable ? 'available' : 'full'}">
                <div class="status-number">${status.currentParticipants}</div>
                <div class="status-label">現在の参加者</div>
            </div>
            <div class="status-item">
                <div class="status-number">${status.maxCapacity}</div>
                <div class="status-label">定員</div>
            </div>
            <div class="status-item ${isAvailable ? 'available' : 'full'}">
                <div class="status-number">${status.availableSlots}</div>
                <div class="status-label">空き</div>
            </div>
            <div class="status-item">
                <div class="status-number">${isAvailable ? '✅' : '❌'}</div>
                <div class="status-label">${isAvailable ? '参加可能' : '満員'}</div>
            </div>
        `;

        // 空きがある場合は目立たせる
        if (isAvailable) {
            statusContainer.classList.add('pulse');
        } else {
            statusContainer.classList.remove('pulse');
        }
    }

    // 履歴表示
    displayHistory() {
        const historyContainer = document.getElementById('history-list');
        const history = this.statusData.history || [];
        
        if (history.length === 0) {
            historyContainer.innerHTML = '<div class="loading">履歴データがありません</div>';
            return;
        }

        const historyHTML = history.slice(-10).reverse().map(item => {
            if (!item || item.error) return '';
            
            const time = new Date(item.timestamp).toLocaleString('ja-JP');
            const isAvailable = item.availableSlots > 0;
            
            return `
                <div class="history-item">
                    <div class="history-time">${time}</div>
                    <div class="history-status ${isAvailable ? 'available' : 'full'}">
                        ${item.currentParticipants}/${item.maxCapacity}人 
                        (空き: ${item.availableSlots}人)
                    </div>
                </div>
            `;
        }).join('');

        historyContainer.innerHTML = historyHTML || '<div class="loading">履歴データがありません</div>';
    }

    // タイムスタンプ更新
    updateTimestamps() {
        const lastUpdate = document.getElementById('last-update');
        const nextCheck = document.getElementById('next-check');
        
        if (this.statusData.current && this.statusData.current.lastChecked) {
            lastUpdate.textContent = `最終更新: ${this.statusData.current.lastChecked}`;
        }

        // 次回チェック時刻（30分後）
        const nextCheckTime = new Date();
        nextCheckTime.setMinutes(nextCheckTime.getMinutes() + 30);
        nextCheck.textContent = `次回チェック: ${nextCheckTime.toLocaleTimeString('ja-JP')}`;
    }

    // 変化のチェック（通知用）
    checkForChanges() {
        const current = this.statusData.current;
        const previous = this.statusData.previous;

        if (!previous || previous.error || current.error) return;

        // 満員から空きが出た場合
        if (previous.isFull && !current.isFull) {
            this.showNotification(
                '🎉 定員に空きが出ました！',
                `現在 ${current.availableSlots} 人分の空きがあります。今すぐ申し込みましょう！`
            );
        }
        // 空きが増えた場合
        else if (current.availableSlots > previous.availableSlots) {
            this.showNotification(
                '📈 空きが増えました',
                `${previous.availableSlots} → ${current.availableSlots} 人分の空きになりました`
            );
        }
    }

    // 通知表示
    showNotification(title, message) {
        // ブラウザ通知
        if (this.settings.browserNotifications && this.notificationPermission) {
            new Notification(title, {
                body: message,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎵</text></svg>',
                tag: 'event-capacity-change'
            });
        }

        // 音声アラート
        if (this.settings.soundAlerts) {
            this.playNotificationSound();
        }

        // 画面上での通知
        this.showInPageNotification(title, message);
    }

    // 音声通知
    playNotificationSound() {
        // Web Audio APIを使用した通知音
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }

    // ページ内通知
    showInPageNotification(title, message) {
        const notification = document.createElement('div');
        notification.className = 'in-page-notification';
        notification.innerHTML = `
            <strong>${title}</strong><br>
            ${message}
        `;
        
        // スタイルを設定
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(45deg, #10b981, #059669)',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '10px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
            zIndex: '9999',
            maxWidth: '300px',
            animation: 'slideIn 0.3s ease'
        });

        document.body.appendChild(notification);

        // 5秒後に自動削除
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // エラー表示
    showError(message) {
        const statusContainer = document.getElementById('current-status');
        statusContainer.innerHTML = `
            <div class="status-item full">
                <div class="status-number">❌</div>
                <div class="status-label">エラー</div>
            </div>
            <div class="loading" style="grid-column: 1 / -1;">
                ${message}
            </div>
        `;
    }

    // 通知許可の要求
    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            this.notificationPermission = permission === 'granted';
        }
    }

    // イベントリスナーの設定
    setupEventListeners() {
        // 通知設定の変更
        document.getElementById('browser-notifications').addEventListener('change', (e) => {
            this.settings.browserNotifications = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('sound-alerts').addEventListener('change', (e) => {
            this.settings.soundAlerts = e.target.checked;
            this.saveSettings();
        });

        // テスト通知
        document.getElementById('test-notification').addEventListener('click', () => {
            this.showNotification(
                '🔔 テスト通知',
                'これはテスト通知です。設定が正常に動作しています。'
            );
        });

        // ページの可視性変更時の処理
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.loadStatus(); // ページが再表示されたら状態を更新
            }
        });
    }

    // 定期更新の開始
    startPeriodicUpdate() {
        // 5分ごとにデータを更新
        setInterval(() => {
            this.loadStatus();
        }, 5 * 60 * 1000);
    }
}

// CSS アニメーションの追加
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// アプリケーションの開始
document.addEventListener('DOMContentLoaded', () => {
    new EventMonitor();
});