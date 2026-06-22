'use strict';

const MMA_KEYS = {
    player: 'mma_playerName',
    progress: 'mma_progress',
    scores: 'mma_levelScores',
    leaderboard: 'mma_leaderboard',
    certId: 'mma_certId',
    totals: 'mma_totals'
};

/** @class StorageManager */
class StorageManager {
    get(key, fallback = null) {
        try {
            const v = localStorage.getItem(key);
            return v ? JSON.parse(v) : fallback;
        } catch { return fallback; }
    }

    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    getPlayer() { return localStorage.getItem(MMA_KEYS.player) || ''; }
    setPlayer(name) { localStorage.setItem(MMA_KEYS.player, name); }

    getProgress() { return this.get(MMA_KEYS.progress, {}); }
    setProgress(p) { this.set(MMA_KEYS.progress, p); }

    getLevelScores() { return this.get(MMA_KEYS.scores, {}); }
    setLevelScores(s) { this.set(MMA_KEYS.scores, s); }

    getLeaderboard() { return this.get(MMA_KEYS.leaderboard, []); }
    addLeaderboard(entry) {
        const lb = this.getLeaderboard();
        lb.push(entry);
        lb.sort((a, b) => b.score - a.score);
        this.set(MMA_KEYS.leaderboard, lb.slice(0, 20));
    }

    getTotals() {
        const defaults = {
            singleClick: { hits: 0, tries: 0 },
            doubleClick: { hits: 0, tries: 0 },
            dragDrop: { hits: 0, tries: 0 },
            tracing: { best: 0 },
            levelsDone: 0,
            speedSum: 0
        };
        const raw = this.get(MMA_KEYS.totals, defaults);
        if (!raw || typeof raw.singleClick !== 'object') return { ...defaults };
        return {
            singleClick: { hits: raw.singleClick?.hits || 0, tries: raw.singleClick?.tries || 0 },
            doubleClick: { hits: raw.doubleClick?.hits || 0, tries: raw.doubleClick?.tries || 0 },
            dragDrop: { hits: raw.dragDrop?.hits || 0, tries: raw.dragDrop?.tries || 0 },
            tracing: { best: raw.tracing?.best || 0 },
            levelsDone: raw.levelsDone || 0,
            speedSum: raw.speedSum || 0
        };
    }
    setTotals(t) { this.set(MMA_KEYS.totals, t); }

    getCertId() { return localStorage.getItem(MMA_KEYS.certId) || ''; }
    setCertId(id) { localStorage.setItem(MMA_KEYS.certId, id); }

    completedCount() {
        return Object.values(this.getProgress()).filter(Boolean).length;
    }

    isLevelUnlocked(level) {
        if (level === 1) return true;
        return !!this.getProgress()[level - 1];
    }
}

window.MMAStorage = new StorageManager();
