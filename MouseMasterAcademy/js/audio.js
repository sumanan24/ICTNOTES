'use strict';

/** @class AudioManager */
class AudioManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    getCtx() {
        if (!this.ctx && typeof AudioContext !== 'undefined') {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.ctx;
    }

    resume() {
        const c = this.getCtx();
        if (c?.state === 'suspended') c.resume();
    }

    tone(freq, dur = 0.1, type = 'sine', vol = 0.12) {
        if (!this.enabled) return;
        const c = this.getCtx();
        if (!c) return;
        this.resume();
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.connect(g);
        g.connect(c.destination);
        osc.type = type;
        osc.frequency.value = freq;
        const t = c.currentTime;
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.start(t);
        osc.stop(t + dur);
    }

    click() { this.tone(520, 0.06, 'square', 0.08); }
    pop() { this.tone(380, 0.08, 'sine', 0.1); this.setTimeout(() => this.tone(600, 0.1), 40); }
    success() {
        [523, 659, 784].forEach((f, i) => this.setTimeout(() => this.tone(f, 0.15, 'sine', 0.1), i * 100));
    }
    fail() { this.tone(180, 0.25, 'sawtooth', 0.08); }
    levelUp() {
        [440, 554, 659, 880].forEach((f, i) => this.setTimeout(() => this.tone(f, 0.12), i * 80));
    }
    drag() { this.tone(300, 0.04, 'triangle', 0.05); }

    setTimeout(fn, ms) { return window.setTimeout(fn, ms); }
}

window.MMAAudio = new AudioManager();
