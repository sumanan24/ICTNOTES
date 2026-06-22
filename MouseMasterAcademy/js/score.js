'use strict';

const SCORE_MAX = {
    singleClick: 100,
    doubleClick: 100,
    dragDrop: 150,
    tracing: 200,
    speed: 200,
    completion: 250
};

const TOTAL_MAX = Object.values(SCORE_MAX).reduce((a, b) => a + b, 0);

/** @class ScoreSystem */
class ScoreSystem {
    constructor() {
        this.resetSession();
        this.totals = MMAStorage.getTotals();
    }

    resetSession() {
        this.session = {
            singleClick: { earned: 0, max: SCORE_MAX.singleClick, hits: 0, tries: 0 },
            doubleClick: { earned: 0, max: SCORE_MAX.doubleClick, hits: 0, tries: 0 },
            dragDrop: { earned: 0, max: SCORE_MAX.dragDrop, hits: 0, tries: 0 },
            tracing: { earned: 0, max: SCORE_MAX.tracing, pct: 0 },
            speed: { earned: 0, max: SCORE_MAX.speed },
            completion: { earned: 0, max: SCORE_MAX.completion, levels: 0 }
        };
    }

    recordClick(success, isDouble = false) {
        const cat = isDouble ? this.session.doubleClick : this.session.singleClick;
        cat.tries++;
        if (success) cat.hits++;
    }

    recordDrag(success) {
        this.session.dragDrop.tries++;
        if (success) this.session.dragDrop.hits++;
    }

    setTracing(pct) {
        this.session.tracing.pct = Math.max(this.session.tracing.pct, pct);
    }

    calcCategoryPoints(cat, hits, tries, max) {
        if (!tries) return 0;
        const acc = hits / tries;
        return Math.round(acc * max);
    }

    finalizeLevel(levelNum, timeLeft, timeLimit, stars) {
        const s = this.session;
        const t = this.totals;

        t.singleClick.hits += s.singleClick.hits;
        t.singleClick.tries += s.singleClick.tries;
        t.doubleClick.hits += s.doubleClick.hits;
        t.doubleClick.tries += s.doubleClick.tries;
        t.dragDrop.hits += s.dragDrop.hits;
        t.dragDrop.tries += s.dragDrop.tries;
        t.tracing.best = Math.max(t.tracing.best || 0, s.tracing.pct);
        t.levelsDone = MMAStorage.completedCount();
        t.speedSum = (t.speedSum || 0) + (timeLimit > 0 ? timeLeft / timeLimit : 0) * (stars / 3);

        MMAStorage.setTotals(t);
        return this.getLevelPoints();
    }

    getLevelPoints() {
        const s = this.session;
        const sc = s.singleClick.tries ? (s.singleClick.hits / s.singleClick.tries) * 30 : 0;
        const dc = s.doubleClick.tries ? (s.doubleClick.hits / s.doubleClick.tries) * 30 : 0;
        const dd = s.dragDrop.tries ? (s.dragDrop.hits / s.dragDrop.tries) * 40 : 0;
        const tr = (s.tracing.pct / 100) * 50;
        const sp = (this.timeLimit > 0 ? this.timeLeft / this.timeLimit : 0) * 20;
        return Math.round(sc + dc + dd + tr + sp + 10);
    }

    getGrandTotal() {
        const t = this.totals;
        const sc = t.singleClick.tries ? (t.singleClick.hits / t.singleClick.tries) * SCORE_MAX.singleClick : 0;
        const dc = t.doubleClick.tries ? (t.doubleClick.hits / t.doubleClick.tries) * SCORE_MAX.doubleClick : 0;
        const dd = t.dragDrop.tries ? (t.dragDrop.hits / t.dragDrop.tries) * SCORE_MAX.dragDrop : 0;
        const tr = (t.tracing.best / 100) * SCORE_MAX.tracing;
        const avgSpeed = t.levelsDone ? t.speedSum / t.levelsDone : 0;
        const sp = avgSpeed * SCORE_MAX.speed;
        const comp = (t.levelsDone / 15) * SCORE_MAX.completion;
        return Math.round(sc + dc + dd + tr + sp + comp);
    }

    getGrade(score = this.getGrandTotal()) {
        if (score >= 900) return 'A+';
        if (score >= 800) return 'A';
        if (score >= 700) return 'B';
        if (score >= 600) return 'C';
        return 'Retry';
    }

    calcStars(accuracy, timeRatio) {
        const combined = accuracy * 0.6 + timeRatio * 0.4;
        if (combined >= 0.85) return 3;
        if (combined >= 0.6) return 2;
        return 1;
    }

    accuracyPct() {
        const s = this.session;
        const tries = s.singleClick.tries + s.doubleClick.tries + s.dragDrop.tries;
        const hits = s.singleClick.hits + s.doubleClick.hits + s.dragDrop.hits;
        return tries ? Math.round((hits / tries) * 100) : 100;
    }
}

window.MMAScore = ScoreSystem;
window.SCORE_MAX = SCORE_MAX;
window.TOTAL_MAX = TOTAL_MAX;
