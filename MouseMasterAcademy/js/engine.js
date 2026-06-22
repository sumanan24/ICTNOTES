'use strict';

/** @class CanvasEngine — reusable canvas loop & helpers */
class CanvasEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.w = 800;
        this.h = 500;
        this.dpr = 1;
        this.raf = null;
        this.running = false;
        this.onResize = null;
        this._resize();
        this._resizeHandler = () => this._resize();
        window.addEventListener('resize', this._resizeHandler);
    }

    _resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.dpr = window.devicePixelRatio || 1;
        this.w = Math.max(320, rect.width);
        this.h = Math.max(200, rect.height);
        this.canvas.width = this.w * this.dpr;
        this.canvas.height = this.h * this.dpr;
        this.canvas.style.width = this.w + 'px';
        this.canvas.style.height = this.h + 'px';
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        if (this.onResize) this.onResize();
    }

    clear(color = '#f5f9ff') {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, this.w, this.h);
    }

    start(loop) {
        this.stop();
        this.running = true;
        const tick = (ts) => {
            if (!this.running) return;
            loop(ts);
            this.raf = requestAnimationFrame(tick);
        };
        this.raf = requestAnimationFrame(tick);
    }

    stop() {
        this.running = false;
        if (this.raf) cancelAnimationFrame(this.raf);
    }

    destroy() {
        this.stop();
        window.removeEventListener('resize', this._resizeHandler);
    }

    pos(e) {
        const r = this.canvas.getBoundingClientRect();
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: (cx - r.left) * (this.w / r.width), y: (cy - r.top) * (this.h / r.height) };
    }

    hitCircle(px, py, cx, cy, r) {
        return (px - cx) ** 2 + (py - cy) ** 2 <= r * r;
    }

    hitRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    }

    rand(min, max) { return min + Math.random() * (max - min); }
    randInt(min, max) { return Math.floor(this.rand(min, max + 1)); }

    drawText(text, x, y, size = 16, color = '#1a237e', align = 'center') {
        this.ctx.fillStyle = color;
        this.ctx.font = `600 ${size}px Inter, sans-serif`;
        this.ctx.textAlign = align;
        this.ctx.fillText(text, x, y);
    }

    linePath(points, color = '#1565c0', width = 3) {
        if (points.length < 2) return;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) this.ctx.lineTo(points[i].x, points[i].y);
        this.ctx.stroke();
    }
}

window.CanvasEngine = CanvasEngine;
