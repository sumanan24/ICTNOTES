'use strict';

/** @class ConfettiEffect */
class ConfettiEffect {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.active = false;
    }

    burst() {
        this.active = true;
        const colors = ['#2196f3','#42a5f5','#ffeb3b','#4caf50','#e91e63','#fff'];
        for (let i = 0; i < 120; i++) {
            this.particles.push({
                x: this.canvas.width / 2,
                y: this.canvas.height / 2,
                vx: (Math.random() - 0.5) * 14,
                vy: Math.random() * -12 - 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4,
                life: 80 + Math.random() * 40
            });
        }
        this.animate();
    }

    animate() {
        if (!this.active) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.25;
            p.life--;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        this.particles = this.particles.filter(p => p.life > 0);
        if (this.particles.length) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.active = false;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}

/** @class MouseMasterAcademy — main application */
class MouseMasterAcademy {
    constructor() {
        this.playerName = '';
        this.currentLevel = 1;
        this.scoreSystem = new MMAScore();
        this.engine = null;
        this.levelInstance = null;
        this.timer = null;
        this.timeLeft = 0;
        this.timeLimit = 60;
        this.levelCompleting = false;
        this.confetti = new ConfettiEffect(document.getElementById('confettiCanvas'));
        this.resizeConfetti();
        window.addEventListener('resize', () => this.resizeConfetti());
        this.bindUI();
        this.loadPlayer();
    }

    resizeConfetti() {
        const c = document.getElementById('confettiCanvas');
        c.width = window.innerWidth;
        c.height = window.innerHeight;
    }

    $(id) { return document.getElementById(id); }

    showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        this.$(id).classList.add('active');
    }

    bindUI() {
        this.$('btnStart').addEventListener('click', () => this.startGame());
        this.$('playerName').addEventListener('keydown', e => {
            if (e.key === 'Enter') this.startGame();
        });
        this.$('btnBackHome').addEventListener('click', () => this.showScreen('screen-welcome'));
        this.$('btnLeaderboard').addEventListener('click', () => this.showLeaderboard());
        this.$('btnLbBack').addEventListener('click', () => this.showScreen('screen-welcome'));
        this.$('btnFullscreen').addEventListener('click', () => this.toggleFullscreen());
        this.$('btnQuitLevel').addEventListener('click', () => this.quitLevel());
        this.$('btnNextLevel').addEventListener('click', () => this.nextLevel());
        this.$('btnLevelSelect').addEventListener('click', () => this.showLevelSelect());
        this.$('btnCertBack').addEventListener('click', () => this.showLevelSelect());
        this.$('btnPrintCert').addEventListener('click', () => MMACert.print());
        this.$('btnDownloadCert').addEventListener('click', () => MMACert.download());
        this.$('btnViewCert').addEventListener('click', () => this.finishGame());
    }

    loadPlayer() {
        const name = MMAStorage.getPlayer();
        if (name) this.$('playerName').value = name;
    }

    startGame() {
        const name = this.$('playerName').value.trim();
        if (!name) {
            this.$('playerName').focus();
            this.$('playerName').style.borderColor = '#c62828';
            return;
        }
        this.playerName = name;
        MMAStorage.setPlayer(name);
        MMAAudio.resume();
        this.showLevelSelect();
    }

    showLevelSelect() {
        this.stopLevel();
        this.$('playerChip').textContent = '👤 ' + this.playerName;
        const progress = MMAStorage.getProgress();
        const count = Object.values(progress).filter(Boolean).length;
        this.$('overallProgressLabel').textContent = count + ' / 15';
        this.$('overallProgressBar').style.width = (count / 15 * 100) + '%';

        const grid = this.$('levelGrid');
        grid.innerHTML = '';
        const scores = MMAStorage.getLevelScores();

        LEVELS.forEach(lv => {
            const card = document.createElement('button');
            card.type = 'button';
            const unlocked = MMAStorage.isLevelUnlocked(lv.id);
            const done = !!progress[lv.id];
            card.className = 'level-card' + (done ? ' completed' : '') + (!unlocked ? ' locked' : '');
            const stars = scores[lv.id]?.stars || 0;
            card.innerHTML = `
                ${!unlocked ? '<span class="lock-icon">🔒</span>' : ''}
                <div class="num">${lv.id}</div>
                <h3>${lv.icon} ${lv.name}</h3>
                <p>${lv.diff}</p>
                <div class="stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>`;
            if (unlocked) {
                card.addEventListener('click', () => this.startLevel(lv.id));
            }
            grid.appendChild(card);
        });

        this.showScreen('screen-levels');

        const certBtn = this.$('levelActions');
        const allDone = count >= 15;
        certBtn.hidden = !allDone;
        if (allDone) {
            this.scoreSystem.totals = MMAStorage.getTotals();
        }
    }

    startLevel(levelId) {
        this.levelCompleting = false;
        this.currentLevel = levelId;
        const def = LEVELS[levelId - 1];
        this.timeLimit = def.time;
        this.timeLeft = def.time;
        this.scoreSystem.resetSession();
        this.scoreSystem.timeLimit = def.time;
        this.scoreSystem.timeLeft = def.time;

        this.$('hudLevelBadge').textContent = 'Level ' + levelId;
        this.$('hudLevelTitle').textContent = def.name;
        this.$('levelInstruction').textContent = def.instruction;
        this.$('hudScore').textContent = '0';
        this.$('hudTimer').textContent = this.timeLeft;
        this.$('levelProgressBar').style.width = '0%';
        this.$('levelProgressText').textContent = '0%';
        this.updateLiveStars(0);

        this.showScreen('screen-game');
        MMAAudio.resume();

        if (this.engine) this.engine.destroy();
        this.engine = new CanvasEngine(this.$('gameCanvas'));

        const callbacks = {
            onProgress: (pct) => this.updateProgress(pct),
            onComplete: () => this.completeLevel(),
            recordClick: (ok, dbl) => this.scoreSystem.recordClick(ok, dbl),
            recordDrag: (ok) => this.scoreSystem.recordDrag(ok),
            setTracing: (pct) => this.scoreSystem.setTracing(pct)
        };

        this.levelInstance = LevelRunner.create(levelId, this.engine, callbacks);
        this.startTimer();
    }

    startTimer() {
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.scoreSystem.timeLeft = this.timeLeft;
            this.$('hudTimer').textContent = this.timeLeft;
            if (this.timeLeft <= 0) this.failLevel();
        }, 1000);
    }

    stopLevel() {
        clearInterval(this.timer);
        if (this.levelInstance?.destroy) this.levelInstance.destroy();
        if (this.engine) { this.engine.destroy(); this.engine = null; }
        this.levelInstance = null;
    }

    updateProgress(pct) {
        const p = Math.min(100, Math.round(pct));
        this.$('levelProgressBar').style.width = p + '%';
        this.$('levelProgressText').textContent = p + '%';
        this.$('hudScore').textContent = this.scoreSystem.getLevelPoints();
        const timeRatio = this.timeLimit > 0 ? this.timeLeft / this.timeLimit : 1;
        const acc = this.scoreSystem.accuracyPct() / 100;
        this.updateLiveStars(this.scoreSystem.calcStars(acc, timeRatio));
    }

    updateLiveStars(n) {
        this.$('liveStars').textContent = '★'.repeat(n) + '☆'.repeat(3 - n);
    }

    completeLevel() {
        if (this.levelCompleting) return;
        this.levelCompleting = true;
        clearInterval(this.timer);

        const progress = MMAStorage.getProgress();
        progress[this.currentLevel] = true;
        MMAStorage.setProgress(progress);

        const acc = this.scoreSystem.accuracyPct() / 100;
        const timeRatio = this.timeLeft / this.timeLimit;
        const stars = this.scoreSystem.calcStars(acc, timeRatio);
        const points = this.scoreSystem.finalizeLevel(this.currentLevel, this.timeLeft, this.timeLimit, stars);

        const levelScores = MMAStorage.getLevelScores();
        const prev = levelScores[this.currentLevel];
        if (!prev || stars > prev.stars || points > prev.points) {
            levelScores[this.currentLevel] = { stars, points, accuracy: this.scoreSystem.accuracyPct() };
            MMAStorage.setLevelScores(levelScores);
        }

        MMAAudio.success();
        this.confetti.burst();
        this.stopLevel();
        this.showResult(stars, points);
    }

    failLevel() {
        MMAAudio.fail();
        this.stopLevel();
        alert('Time\'s up! Try again.');
        this.showLevelSelect();
    }

    quitLevel() {
        if (confirm('Quit this level?')) {
            this.stopLevel();
            this.showLevelSelect();
        }
    }

    showResult(stars, points) {
        const acc = this.scoreSystem.accuracyPct();
        this.$('resultStars').textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
        this.$('resultStats').innerHTML = `
            <div><strong>Level Points:</strong> ${points}</div>
            <div><strong>Accuracy:</strong> ${acc}%</div>
            <div><strong>Time Left:</strong> ${this.timeLeft}s</div>
            <div><strong>Total Score:</strong> ${this.scoreSystem.getGrandTotal()} / ${TOTAL_MAX}</div>
            <div><strong>Grade:</strong> ${this.scoreSystem.getGrade()}</div>`;

        const badges = [];
        if (stars === 3) badges.push('⭐ Perfect');
        if (acc >= 90) badges.push('🎯 Sharpshooter');
        if (this.timeLeft > this.timeLimit * 0.5) badges.push('⚡ Speed Star');
        if (this.currentLevel >= 11) badges.push('🏅 Hard Mode');
        this.$('badgeRow').innerHTML = badges.map(b => `<span class="badge">${b}</span>`).join('');

        const nextBtn = this.$('btnNextLevel');
        if (this.currentLevel >= 15) {
            nextBtn.textContent = '🎓 View Certificate';
            nextBtn.onclick = () => this.finishGame();
        } else {
            nextBtn.textContent = 'Next Level →';
            nextBtn.onclick = () => this.nextLevel();
        }

        this.showScreen('screen-result');
    }

    nextLevel() {
        if (this.currentLevel < 15) {
            this.startLevel(this.currentLevel + 1);
        } else {
            this.finishGame();
        }
    }

    finishGame() {
        this.scoreSystem.totals = MMAStorage.getTotals();
        const total = this.scoreSystem.getGrandTotal();
        const grade = this.scoreSystem.getGrade();

        if (MMAStorage.completedCount() < 15) {
            alert('Complete all 15 levels to earn your certificate!');
            return;
        }

        MMAStorage.addLeaderboard({
            name: this.playerName,
            score: total,
            grade,
            levels: MMAStorage.completedCount(),
            date: new Date().toLocaleDateString()
        });

        if (grade === 'Retry') {
            alert('Score below 600. Complete more levels with better accuracy to earn your certificate!');
            this.showLevelSelect();
        } else {
            this.showCertificate();
        }
    }

    showCertificate() {
        const total = this.scoreSystem.getGrandTotal();
        const grade = this.scoreSystem.getGrade();
        MMACert.render(this.playerName, total, grade);
        this.showScreen('screen-certificate');
    }

    showLeaderboard() {
        const lb = MMAStorage.getLeaderboard();
        const tbody = this.$('leaderboardBody');
        const empty = this.$('lbEmpty');
        tbody.innerHTML = '';

        if (!lb.length) {
            empty.style.display = 'block';
            this.$('leaderboardTable').style.display = 'none';
        } else {
            empty.style.display = 'none';
            this.$('leaderboardTable').style.display = 'table';
            lb.forEach((e, i) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${i + 1}</td><td>${e.name}</td><td>${e.score}</td>
                    <td>${e.grade}</td><td>${e.levels}/15</td><td>${e.date}</td>`;
                tbody.appendChild(tr);
            });
        }
        this.showScreen('screen-leaderboard');
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.mmaApp = new MouseMasterAcademy();
});
