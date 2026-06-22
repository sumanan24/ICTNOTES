'use strict';

/** @class LevelRunner — factory for all 15 levels */
class LevelRunner {
    static create(levelId, engine, callbacks) {
        const methods = {
            1: LevelRunner.l1BalloonPop,
            2: LevelRunner.l2TargetHunter,
            3: LevelRunner.l3ColorMatch,
            4: LevelRunner.l4FruitCatcher,
            5: LevelRunner.l5ObjectSort,
            6: LevelRunner.l6HiddenObject,
            7: LevelRunner.l7ConnectDots,
            8: LevelRunner.l8ShapeTrace,
            9: LevelRunner.l9Puzzle,
            10: LevelRunner.l10Maze,
            11: LevelRunner.l11PathFollow,
            12: LevelRunner.l12Memory,
            13: LevelRunner.l13Traffic,
            14: LevelRunner.l14ComputerLab,
            15: LevelRunner.l15Tournament
        };
        const fn = methods[levelId];
        if (!fn) return null;
        return fn(engine, callbacks);
    }

    /* ── L1 Balloon Pop ── */
    static l1BalloonPop(eng, cb) {
        const colors = ['#e53935','#1e88e5','#43a047','#fb8c00','#8e24aa','#00acc1'];
        let balloons = [], popped = 0, goal = 20, spawnT = 0;
        const spawn = () => {
            balloons.push({
                x: eng.rand(40, eng.w - 40), y: eng.h + 30,
                r: eng.rand(22, 34), color: colors[eng.randInt(0, colors.length - 1)],
                vy: eng.rand(-2.2, -1.2), life: 280
            });
        };
        for (let i = 0; i < 5; i++) spawn();

        const click = (e) => {
            const p = eng.pos(e);
            for (let i = balloons.length - 1; i >= 0; i--) {
                const b = balloons[i];
                if (eng.hitCircle(p.x, p.y, b.x, b.y, b.r)) {
                    balloons.splice(i, 1);
                    popped++;
                    MMAAudio.pop();
                    cb.recordClick(true);
                    cb.onProgress(popped / goal * 100);
                    if (popped >= goal) cb.onComplete();
                    return;
                }
            }
            cb.recordClick(false);
            MMAAudio.fail();
        };

        eng.canvas.addEventListener('click', click);
        eng.start(() => {
            spawnT++;
            if (spawnT % 35 === 0 && balloons.length < 12) spawn();
            balloons.forEach(b => { b.y += b.vy; b.life--; });
            balloons = balloons.filter(b => b.life > 0 && b.y > -50);
            eng.clear('#e8f4fd');
            balloons.forEach(b => {
                eng.ctx.fillStyle = b.color;
                eng.ctx.beginPath();
                eng.ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                eng.ctx.fill();
                eng.ctx.strokeStyle = 'rgba(0,0,0,0.15)';
                eng.ctx.stroke();
                eng.ctx.fillStyle = 'rgba(255,255,255,0.4)';
                eng.ctx.beginPath();
                eng.ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2);
                eng.ctx.fill();
            });
            eng.drawText(`Popped: ${popped} / ${goal}`, eng.w / 2, 28, 18);
        });

        return { destroy: () => eng.canvas.removeEventListener('click', click) };
    }

    /* ── L2 Target Hunter ── */
    static l2TargetHunter(eng, cb) {
        let targets = [], obstacles = [], hits = 0, goal = 15, t = 0;
        const mkTarget = () => ({
            x: eng.rand(50, eng.w - 50), y: eng.rand(50, eng.h - 50),
            r: 22, vx: eng.rand(-2, 2), vy: eng.rand(-2, 2)
        });
        const mkObs = () => ({
            x: eng.rand(40, eng.w - 80), y: eng.rand(40, eng.h - 80),
            w: 50, h: 30, vx: eng.rand(-1.5, 1.5), vy: eng.rand(-1.5, 1.5)
        });
        for (let i = 0; i < 4; i++) { targets.push(mkTarget()); obstacles.push(mkObs()); }

        const click = (e) => {
            const p = eng.pos(e);
            for (const o of obstacles) {
                if (eng.hitRect(p.x, p.y, o.x, o.y, o.w, o.h)) {
                    cb.recordClick(false);
                    MMAAudio.fail();
                    return;
                }
            }
            let got = false;
            for (let i = targets.length - 1; i >= 0; i--) {
                if (eng.hitCircle(p.x, p.y, targets[i].x, targets[i].y, targets[i].r)) {
                    targets.splice(i, 1);
                    targets.push(mkTarget());
                    hits++;
                    got = true;
                    MMAAudio.click();
                    cb.recordClick(true);
                    cb.onProgress(hits / goal * 100);
                    if (hits >= goal) cb.onComplete();
                    return;
                }
            }
            if (!got) { cb.recordClick(false); MMAAudio.fail(); }
        };

        eng.canvas.addEventListener('click', click);
        eng.start(() => {
            t++;
            [...targets, ...obstacles].forEach(o => {
                o.x += o.vx; o.y += o.vy;
                if (o.x < 30 || o.x > eng.w - 30) o.vx *= -1;
                if (o.y < 30 || o.y > eng.h - 30) o.vy *= -1;
            });
            eng.clear('#eef6ff');
            obstacles.forEach(o => {
                eng.ctx.fillStyle = '#ef5350';
                eng.ctx.fillRect(o.x, o.y, o.w, o.h);
                eng.drawText('✕', o.x + o.w / 2, o.y + o.h / 2 + 5, 16, '#fff');
            });
            targets.forEach(tg => {
                eng.ctx.fillStyle = '#43a047';
                eng.ctx.beginPath();
                eng.ctx.arc(tg.x, tg.y, tg.r, 0, Math.PI * 2);
                eng.ctx.fill();
                eng.ctx.fillStyle = '#fff';
                eng.ctx.beginPath();
                eng.ctx.arc(tg.x, tg.y, tg.r * 0.5, 0, Math.PI * 2);
                eng.ctx.fill();
                eng.ctx.fillStyle = '#c62828';
                eng.ctx.beginPath();
                eng.ctx.arc(tg.x, tg.y, tg.r * 0.2, 0, Math.PI * 2);
                eng.ctx.fill();
            });
            eng.drawText(`Hits: ${hits}/${goal}`, eng.w / 2, 26, 17);
        });
        return { destroy: () => eng.canvas.removeEventListener('click', click) };
    }

    /* ── L3 Color Match ── */
    static l3ColorMatch(eng, cb) {
        const palette = ['#e53935','#1e88e5','#fdd835','#43a047','#8e24aa'];
        let targetColor = palette[eng.randInt(0, palette.length - 1)];
        let objects = [], correct = 0, goal = 12, wrong = 0;

        const spawn = () => {
            objects = [];
            for (let i = 0; i < 9; i++) {
                const c = palette[eng.randInt(0, palette.length - 1)];
                objects.push({
                    x: 80 + (i % 3) * (eng.w - 160) / 2,
                    y: 100 + Math.floor(i / 3) * ((eng.h - 140) / 2),
                    r: 30, color: c, isTarget: c === targetColor
                });
            }
        };
        spawn();

        const click = (e) => {
            const p = eng.pos(e);
            for (const o of objects) {
                if (eng.hitCircle(p.x, p.y, o.x, o.y, o.r)) {
                    if (o.isTarget) {
                        correct++;
                        MMAAudio.pop();
                        cb.recordClick(true);
                        targetColor = palette[eng.randInt(0, palette.length - 1)];
                        spawn();
                        cb.onProgress(correct / goal * 100);
                        if (correct >= goal) cb.onComplete();
                    } else {
                        wrong++;
                        MMAAudio.fail();
                        cb.recordClick(false);
                    }
                    return;
                }
            }
        };

        eng.canvas.addEventListener('click', click);
        eng.start(() => {
            eng.clear('#f3f8ff');
            eng.ctx.fillStyle = targetColor;
            eng.ctx.fillRect(eng.w / 2 - 50, 12, 100, 36);
            eng.ctx.strokeStyle = '#333';
            eng.ctx.strokeRect(eng.w / 2 - 50, 12, 100, 36);
            eng.drawText('Match this color', eng.w / 2, 62, 14, '#5c6bc0');
            objects.forEach(o => {
                eng.ctx.fillStyle = o.color;
                eng.ctx.beginPath();
                eng.ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
                eng.ctx.fill();
            });
            eng.drawText(`${correct}/${goal}`, eng.w - 50, 26, 16);
        });
        return { destroy: () => eng.canvas.removeEventListener('click', click) };
    }

    /* ── L4 Fruit Catcher ── */
    static l4FruitCatcher(eng, cb) {
        const fruits = [
            { emoji: '🍎', label: 'Apple', color: '#ef5350', bx: 0 },
            { emoji: '🍌', label: 'Banana', color: '#fdd835', bx: 1 },
            { emoji: '🍇', label: 'Grape', color: '#7e57c2', bx: 2 }
        ];
        let items = fruits.map((f, i) => ({
            ...f, x: eng.rand(80, eng.w - 80), y: eng.rand(80, eng.h * 0.45),
            placed: false, id: i
        }));
        let drag = null, placed = 0;
        const basketY = eng.h - 70;
        const basketW = (eng.w - 80) / 3;

        const down = (e) => {
            e.preventDefault();
            const p = eng.pos(e);
            for (const it of items) {
                if (!it.placed && eng.hitCircle(p.x, p.y, it.x, it.y, 28)) {
                    drag = { it, ox: p.x - it.x, oy: p.y - it.y };
                    MMAAudio.drag();
                    return;
                }
            }
        };
        const move = (e) => {
            if (!drag) return;
            e.preventDefault();
            const p = eng.pos(e);
            drag.it.x = p.x - drag.ox;
            drag.it.y = p.y - drag.oy;
        };
        const up = () => {
            if (!drag) return;
            const it = drag.it;
            const bx = 40 + it.bx * basketW + basketW / 2;
            if (Math.abs(it.x - bx) < basketW / 2 && it.y > basketY - 40) {
                it.placed = true;
                it.x = bx; it.y = basketY;
                placed++;
                MMAAudio.success();
                cb.recordDrag(true);
                cb.onProgress(placed / items.length * 100);
                if (placed >= items.length) cb.onComplete();
            } else cb.recordDrag(false);
            drag = null;
        };

        ['mousedown','touchstart'].forEach(ev => eng.canvas.addEventListener(ev, down));
        ['mousemove','touchmove'].forEach(ev => eng.canvas.addEventListener(ev, move));
        ['mouseup','touchend'].forEach(ev => eng.canvas.addEventListener(ev, up));

        eng.start(() => {
            eng.clear('#fff8e8');
            fruits.forEach((f, i) => {
                const bx = 40 + i * basketW;
                eng.ctx.fillStyle = f.color + '33';
                eng.ctx.fillRect(bx, basketY - 20, basketW - 10, 50);
                eng.ctx.strokeStyle = f.color;
                eng.ctx.strokeRect(bx, basketY - 20, basketW - 10, 50);
                eng.drawText(f.label, bx + basketW / 2 - 5, basketY + 30, 12, f.color);
            });
            items.forEach(it => {
                eng.drawText(it.emoji, it.x, it.y, 36);
            });
            eng.drawText(`Placed: ${placed}/${items.length}`, eng.w / 2, 24, 16);
        });

        return { destroy: () => {
            ['mousedown','touchstart','mousemove','touchmove','mouseup','touchend'].forEach(ev =>
                eng.canvas.removeEventListener(ev, ev.includes('down') || ev.includes('start') ? down :
                    ev.includes('move') ? move : up));
        }};
    }

    /* ── L5 Object Sorting ── */
    static l5ObjectSort(eng, cb) {
        const cats = [
            { name: 'Input', color: '#1e88e5', x: 0 },
            { name: 'Output', color: '#43a047', x: 1 },
            { name: 'Storage', color: '#fb8c00', x: 2 }
        ];
        const items = [
            { label: '⌨️', cat: 0 }, { label: '🖱️', cat: 0 }, { label: '🎤', cat: 0 },
            { label: '🖨️', cat: 1 }, { label: '🔊', cat: 1 }, { label: '🖥️', cat: 1 },
            { label: '💾', cat: 2 }, { label: '📀', cat: 2 }, { label: '💿', cat: 2 }
        ].map((it, i) => ({
            ...it, x: eng.rand(60, eng.w - 60), y: eng.rand(60, eng.h * 0.4),
            placed: false, id: i
        }));
        let drag = null, done = 0;
        const boxW = (eng.w - 60) / 3, boxY = eng.h - 80;

        const down = (e) => {
            e.preventDefault();
            const p = eng.pos(e);
            for (const it of items) {
                if (!it.placed && eng.hitCircle(p.x, p.y, it.x, it.y, 26)) {
                    drag = { it, ox: p.x - it.x, oy: p.y - it.y };
                    return;
                }
            }
        };
        const move = (e) => {
            if (!drag) return;
            e.preventDefault();
            const p = eng.pos(e);
            drag.it.x = p.x - drag.ox;
            drag.it.y = p.y - drag.oy;
        };
        const up = () => {
            if (!drag) return;
            const it = drag.it;
            const bx = 30 + it.cat * boxW + boxW / 2;
            if (Math.abs(it.x - bx) < boxW / 2 && it.y > boxY - 30) {
                it.placed = true; it.x = bx; it.y = boxY;
                done++;
                MMAAudio.pop();
                cb.recordDrag(true);
                cb.onProgress(done / items.length * 100);
                if (done >= items.length) cb.onComplete();
            } else cb.recordDrag(false);
            drag = null;
        };

        ['mousedown','touchstart'].forEach(ev => eng.canvas.addEventListener(ev, down));
        ['mousemove','touchmove'].forEach(ev => eng.canvas.addEventListener(ev, move));
        ['mouseup','touchend'].forEach(ev => eng.canvas.addEventListener(ev, up));

        eng.start(() => {
            eng.clear('#f0f4ff');
            cats.forEach(c => {
                const bx = 30 + c.x * boxW;
                eng.ctx.fillStyle = c.color + '22';
                eng.ctx.fillRect(bx, boxY - 25, boxW - 8, 55);
                eng.ctx.strokeStyle = c.color;
                eng.ctx.strokeRect(bx, boxY - 25, boxW - 8, 55);
                eng.drawText(c.name, bx + boxW / 2 - 4, boxY + 28, 13, c.color);
            });
            items.forEach(it => eng.drawText(it.label, it.x, it.y, 32));
            eng.drawText(`Sorted: ${done}/${items.length}`, eng.w / 2, 22, 16);
        });

        return { destroy: () => {
            ['mousedown','touchstart'].forEach(ev => eng.canvas.removeEventListener(ev, down));
            ['mousemove','touchmove'].forEach(ev => eng.canvas.removeEventListener(ev, move));
            ['mouseup','touchend'].forEach(ev => eng.canvas.removeEventListener(ev, up));
        }};
    }

    /* ── L6 Hidden Objects ── */
    static l6HiddenObject(eng, cb) {
        const hidden = [
            { emoji: '🔑', x: 0.15, y: 0.7, found: false },
            { emoji: '📎', x: 0.75, y: 0.25, found: false },
            { emoji: '✏️', x: 0.45, y: 0.55, found: false },
            { emoji: '📌', x: 0.85, y: 0.65, found: false },
            { emoji: '🔍', x: 0.25, y: 0.3, found: false },
            { emoji: '📐', x: 0.6, y: 0.75, found: false }
        ].map(h => ({ ...h, px: h.x * eng.w, py: h.y * eng.h }));

        const click = (e) => {
            const p = eng.pos(e);
            for (const h of hidden) {
                if (!h.found && eng.hitCircle(p.x, p.y, h.px, h.py, 22)) {
                    h.found = true;
                    MMAAudio.pop();
                    cb.recordClick(true);
                    const found = hidden.filter(x => x.found).length;
                    cb.onProgress(found / hidden.length * 100);
                    if (found >= hidden.length) cb.onComplete();
                    return;
                }
            }
            cb.recordClick(false);
        };

        eng.canvas.addEventListener('click', click);
        eng.onResize = () => hidden.forEach(h => { h.px = h.x * eng.w; h.py = h.y * eng.h; });

        eng.start(() => {
            eng.clear('#dce8f5');
            eng.ctx.fillStyle = '#90caf9';
            eng.ctx.fillRect(20, eng.h * 0.5, eng.w - 40, eng.h * 0.4);
            eng.ctx.fillStyle = '#5d4037';
            eng.ctx.fillRect(20, eng.h * 0.45, eng.w - 40, 20);
            eng.ctx.fillStyle = '#fff';
            eng.ctx.fillRect(eng.w * 0.1, eng.h * 0.15, eng.w * 0.35, eng.h * 0.3);
            eng.ctx.fillStyle = '#ffcc80';
            eng.ctx.beginPath();
            eng.ctx.arc(eng.w * 0.7, eng.h * 0.2, 40, 0, Math.PI * 2);
            eng.ctx.fill();
            hidden.forEach(h => {
                eng.ctx.globalAlpha = h.found ? 1 : 0.35;
                eng.drawText(h.emoji, h.px, h.py, h.found ? 28 : 20);
                eng.ctx.globalAlpha = 1;
            });
            const found = hidden.filter(x => x.found).length;
            eng.drawText(`Found: ${found}/${hidden.length}`, eng.w / 2, 24, 16);
        });

        return { destroy: () => eng.canvas.removeEventListener('click', click) };
    }

    /* ── L7 Connect Dots ── */
    static l7ConnectDots(eng, cb) {
        const n = 10;
        let dots = [], next = 1, lines = [];
        const layout = () => {
            dots = [];
            for (let i = 1; i <= n; i++) {
                const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
                const r = Math.min(eng.w, eng.h) * 0.32;
                dots.push({
                    num: i,
                    x: eng.w / 2 + Math.cos(angle) * r,
                    y: eng.h / 2 + Math.sin(angle) * r
                });
            }
        };
        layout();
        eng.onResize = layout;

        const click = (e) => {
            const p = eng.pos(e);
            for (const d of dots) {
                if (d.num === next && eng.hitCircle(p.x, p.y, d.x, d.y, 20)) {
                    if (next > 1) lines.push({ from: dots[next - 2], to: d });
                    next++;
                    MMAAudio.click();
                    cb.recordClick(true);
                    cb.onProgress((next - 1) / n * 100);
                    if (next > n) cb.onComplete();
                    return;
                }
            }
            if (next <= n) { cb.recordClick(false); MMAAudio.fail(); }
        };

        eng.canvas.addEventListener('click', click);
        eng.start(() => {
            eng.clear('#eef2ff');
            lines.forEach(l => eng.linePath([l.from, l.to], '#1565c0', 3));
            dots.forEach(d => {
                eng.ctx.fillStyle = d.num < next ? '#43a047' : d.num === next ? '#1e88e5' : '#b0bec5';
                eng.ctx.beginPath();
                eng.ctx.arc(d.x, d.y, 18, 0, Math.PI * 2);
                eng.ctx.fill();
                eng.drawText(String(d.num), d.x, d.y + 6, 14, '#fff');
            });
            eng.drawText(`Next: ${next <= n ? next : '✓'}`, eng.w / 2, 26, 16);
        });

        return { destroy: () => eng.canvas.removeEventListener('click', click) };
    }

    /* ── L8 Shape Tracing ── */
    static l8ShapeTrace(eng, cb) {
        const shapes = ['circle', 'square', 'triangle'];
        let shapeIdx = 0, drawing = false, path = [], allPaths = [], totalAcc = 0;

        const guide = (type) => {
            const cx = eng.w / 2, cy = eng.h / 2, s = Math.min(eng.w, eng.h) * 0.28;
            if (type === 'circle') {
                eng.ctx.strokeStyle = '#bbdefb';
                eng.ctx.lineWidth = 20;
                eng.ctx.beginPath();
                eng.ctx.arc(cx, cy, s, 0, Math.PI * 2);
                eng.ctx.stroke();
            } else if (type === 'square') {
                eng.ctx.strokeStyle = '#bbdefb';
                eng.ctx.lineWidth = 20;
                eng.ctx.strokeRect(cx - s, cy - s, s * 2, s * 2);
            } else {
                eng.ctx.strokeStyle = '#bbdefb';
                eng.ctx.lineWidth = 20;
                eng.ctx.beginPath();
                eng.ctx.moveTo(cx, cy - s);
                eng.ctx.lineTo(cx + s, cy + s);
                eng.ctx.lineTo(cx - s, cy + s);
                eng.ctx.closePath();
                eng.ctx.stroke();
            }
        };

        const calcAcc = (pts) => {
            if (pts.length < 10) return 0;
            const cx = eng.w / 2, cy = eng.h / 2, s = Math.min(eng.w, eng.h) * 0.28;
            let close = 0;
            const type = shapes[shapeIdx];
            pts.forEach(p => {
                let dist;
                if (type === 'circle') dist = Math.abs(Math.hypot(p.x - cx, p.y - cy) - s);
                else if (type === 'square') {
                    const dx = Math.max(Math.abs(p.x - cx) - s, 0);
                    const dy = Math.max(Math.abs(p.y - cy) - s, 0);
                    dist = Math.hypot(dx, dy);
                } else {
                    dist = 30;
                }
                if (dist < 25) close++;
            });
            return Math.round((close / pts.length) * 100);
        };

        const finishShape = () => {
            const acc = calcAcc(path);
            totalAcc += acc;
            cb.setTracing(acc);
            allPaths.push([...path]);
            path = [];
            shapeIdx++;
            cb.onProgress(shapeIdx / shapes.length * 100);
            if (shapeIdx >= shapes.length) {
                cb.setTracing(Math.round(totalAcc / shapes.length));
                cb.onComplete();
            } else MMAAudio.levelUp();
        };

        const down = (e) => { e.preventDefault(); drawing = true; path = []; };
        const move = (e) => {
            if (!drawing) return;
            e.preventDefault();
            path.push(eng.pos(e));
        };
        const up = () => { if (drawing && path.length > 20) finishShape(); drawing = false; };

        ['mousedown','touchstart'].forEach(ev => eng.canvas.addEventListener(ev, down));
        ['mousemove','touchmove'].forEach(ev => eng.canvas.addEventListener(ev, move));
        ['mouseup','touchend'].forEach(ev => eng.canvas.addEventListener(ev, up));

        eng.start(() => {
            eng.clear('#f5f9ff');
            if (shapeIdx < shapes.length) {
                guide(shapes[shapeIdx]);
                eng.drawText(`Trace: ${shapes[shapeIdx]}`, eng.w / 2, 28, 18);
            }
            allPaths.forEach(pts => eng.linePath(pts, '#1565c0', 4));
            if (path.length > 1) eng.linePath(path, '#1e88e5', 4);
        });

        return { destroy: () => {
            ['mousedown','touchstart'].forEach(ev => eng.canvas.removeEventListener(ev, down));
            ['mousemove','touchmove'].forEach(ev => eng.canvas.removeEventListener(ev, move));
            ['mouseup','touchend'].forEach(ev => eng.canvas.removeEventListener(ev, up));
        }};
    }

    /* ── L9 Puzzle Builder ── */
    static l9Puzzle(eng, cb) {
        const cols = 3, rows = 3, pw = 80, ph = 60;
        const ox = (eng.w - cols * pw) / 2, oy = eng.h - rows * ph - 30;
        let pieces = [], placed = 0;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const id = r * cols + c;
                pieces.push({
                    id, col: c, row: r,
                    tx: ox + c * pw + pw / 2, ty: oy + r * ph + ph / 2,
                    x: eng.rand(60, eng.w - 60), y: eng.rand(50, eng.h * 0.4),
                    placed: false, hue: (id * 40) % 360
                });
            }
        }
        let drag = null;

        const down = (e) => {
            e.preventDefault();
            const p = eng.pos(e);
            for (const pc of pieces) {
                if (!pc.placed && eng.hitRect(p.x, p.y, pc.x - pw / 2, pc.y - ph / 2, pw, ph)) {
                    drag = { pc, ox: p.x - pc.x, oy: p.y - pc.y };
                    return;
                }
            }
        };
        const move = (e) => {
            if (!drag) return;
            e.preventDefault();
            const p = eng.pos(e);
            drag.pc.x = p.x - drag.ox;
            drag.pc.y = p.y - drag.oy;
        };
        const up = () => {
            if (!drag) return;
            const pc = drag.pc;
            if (Math.hypot(pc.x - pc.tx, pc.y - pc.ty) < 35) {
                pc.placed = true; pc.x = pc.tx; pc.y = pc.ty;
                placed++;
                MMAAudio.pop();
                cb.recordDrag(true);
                cb.onProgress(placed / pieces.length * 100);
                if (placed >= pieces.length) cb.onComplete();
            } else cb.recordDrag(false);
            drag = null;
        };

        ['mousedown','touchstart'].forEach(ev => eng.canvas.addEventListener(ev, down));
        ['mousemove','touchmove'].forEach(ev => eng.canvas.addEventListener(ev, move));
        ['mouseup','touchend'].forEach(ev => eng.canvas.addEventListener(ev, up));

        eng.start(() => {
            eng.clear('#e8eaf6');
            eng.ctx.strokeStyle = '#9fa8da';
            eng.ctx.setLineDash([4, 4]);
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    eng.ctx.strokeRect(ox + c * pw, oy + r * ph, pw, ph);
                }
            }
            eng.ctx.setLineDash([]);
            pieces.forEach(pc => {
                eng.ctx.fillStyle = `hsl(${pc.hue}, 65%, 60%)`;
                eng.ctx.fillRect(pc.x - pw / 2, pc.y - ph / 2, pw, ph);
                eng.ctx.strokeStyle = '#333';
                eng.ctx.strokeRect(pc.x - pw / 2, pc.y - ph / 2, pw, ph);
                eng.drawText(String(pc.id + 1), pc.x, pc.y + 5, 16, '#fff');
            });
            eng.drawText(`Pieces: ${placed}/${pieces.length}`, eng.w / 2, 22, 16);
        });

        return { destroy: () => {
            ['mousedown','touchstart'].forEach(ev => eng.canvas.removeEventListener(ev, down));
            ['mousemove','touchmove'].forEach(ev => eng.canvas.removeEventListener(ev, move));
            ['mouseup','touchend'].forEach(ev => eng.canvas.removeEventListener(ev, up));
        }};
    }

    /* ── L10 Maze Runner ── */
    static l10Maze(eng, cb) {
        const cell = 24;
        const maze = [
            '1111111111111111111',
            '1000000001000000001',
            '1011111011011111101',
            '1010001010010000101',
            '1010111010111011101',
            '1000100000100000001',
            '1111011111110111111',
            '1000100000000100001',
            '1011101110111101111',
            '1000001000000000001',
            '1111111111111111111'
        ];
        let player = { x: cell * 1.5, y: cell * 1.5 };
        const goal = { x: cell * 17.5, y: cell * 9.5 };
        let moves = 0, wallHits = 0;

        const wallAt = (x, y) => {
            const c = Math.floor(x / cell), r = Math.floor(y / cell);
            if (r < 0 || r >= maze.length || c < 0 || c >= maze[0].length) return true;
            return maze[r][c] === '1';
        };

        const move = (e) => {
            const p = eng.pos(e);
            if (wallAt(p.x, p.y)) {
                wallHits++;
                MMAAudio.fail();
                return;
            }
            player.x = p.x;
            player.y = p.y;
            moves++;
            if (eng.hitCircle(player.x, player.y, goal.x, goal.y, cell)) {
                cb.setTracing(Math.max(0, 100 - wallHits * 5));
                cb.onProgress(100);
                cb.onComplete();
            } else {
                cb.onProgress(Math.min(95, moves * 2));
            }
        };

        eng.canvas.addEventListener('mousemove', move);
        eng.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); move(e); });

        eng.start(() => {
            eng.clear('#eceff1');
            maze.forEach((row, r) => {
                for (let c = 0; c < row.length; c++) {
                    if (row[c] === '1') {
                        eng.ctx.fillStyle = '#37474f';
                        eng.ctx.fillRect(c * cell, r * cell, cell, cell);
                    }
                }
            });
            eng.ctx.fillStyle = '#43a047';
            eng.ctx.beginPath();
            eng.ctx.arc(goal.x, goal.y, 12, 0, Math.PI * 2);
            eng.ctx.fill();
            eng.drawText('GOAL', goal.x, goal.y - 18, 11, '#2e7d32');
            eng.ctx.fillStyle = '#1e88e5';
            eng.ctx.beginPath();
            eng.ctx.arc(player.x, player.y, 10, 0, Math.PI * 2);
            eng.ctx.fill();
            eng.drawText('Move mouse through maze', eng.w / 2, 18, 13, '#546e7a');
        });

        return { destroy: () => {
            eng.canvas.removeEventListener('mousemove', move);
        }};
    }

    /* ── L11 Path Follower ── */
    static l11PathFollow(eng, cb) {
        const points = [];
        for (let i = 0; i <= 20; i++) {
            points.push({
                x: 60 + (eng.w - 120) * (i / 20),
                y: eng.h / 2 + Math.sin(i * 0.8) * (eng.h * 0.3)
            });
        }
        let progress = 0, onPath = true, tracing = false, tracePts = [];

        const nearPath = (x, y) => {
            let minD = Infinity;
            for (const p of points) minD = Math.min(minD, Math.hypot(x - p.x, y - p.y));
            return minD < 22;
        };

        const move = (e) => {
            const p = eng.pos(e);
            if (!nearPath(p.x, p.y)) {
                onPath = false;
                MMAAudio.fail();
                return;
            }
            tracePts.push(p);
            const idx = Math.min(points.length - 1, Math.floor((p.x - 60) / (eng.w - 120) * points.length));
            progress = Math.max(progress, idx);
            cb.onProgress(progress / (points.length - 1) * 100);
            if (progress >= points.length - 2) {
                cb.setTracing(92);
                cb.onComplete();
            }
        };

        eng.canvas.addEventListener('mousemove', move);
        eng.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); move(e); });

        eng.start(() => {
            eng.clear('#e3f2fd');
            eng.linePath(points, '#90caf9', 36);
            eng.linePath(points, '#42a5f5', 14);
            eng.drawText('START', points[0].x, points[0].y - 20, 12, '#1565c0');
            eng.drawText('FINISH', points[points.length - 1].x, points[points.length - 1].y - 20, 12, '#2e7d32');
            if (tracePts.length > 1) eng.linePath(tracePts, '#1e88e5', 3);
            eng.drawText(onPath ? 'Stay on the path!' : 'Off path — return to blue!', eng.w / 2, 22, 14, onPath ? '#1565c0' : '#c62828');
        });

        return { destroy: () => eng.canvas.removeEventListener('mousemove', move) };
    }

    /* ── L12 Memory Click ── */
    static l12Memory(eng, cb) {
        const symbols = ['⭐', '❤️', '🔵', '🟢', '🟡', '🟣'];
        let cells = [], target = [], phase = 'show', timer = 0, clicked = 0, mistakes = 0;
        const cols = 3, rows = 2;
        const cw = 100, ch = 80;
        const startX = (eng.w - cols * cw) / 2 + cw / 2;
        const startY = eng.h / 2 - 20;

        const initCells = () => {
            cells = [];
            const indices = [0, 1, 2, 3, 4, 5];
            target = [];
            while (target.length < 3) {
                const pick = indices.splice(eng.randInt(0, indices.length - 1), 1)[0];
                target.push(pick);
            }
            let i = 0;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    cells.push({
                        x: startX + c * cw, y: startY + r * ch,
                        sym: symbols[i % symbols.length],
                        idx: i, isTarget: target.includes(i)
                    });
                    i++;
                }
            }
        };
        initCells();

        const click = (e) => {
            if (phase !== 'click') return;
            const p = eng.pos(e);
            for (const cell of cells) {
                if (eng.hitRect(p.x, p.y, cell.x - 40, cell.y - 35, 80, 70)) {
                    if (cell.isTarget && !cell.done) {
                        cell.done = true;
                        clicked++;
                        MMAAudio.pop();
                        cb.recordClick(true);
                        cb.onProgress(clicked / target.length * 100);
                        if (clicked >= target.length) cb.onComplete();
                    } else if (!cell.isTarget) {
                        mistakes++;
                        MMAAudio.fail();
                        cb.recordClick(false);
                    }
                    return;
                }
            }
        };

        eng.canvas.addEventListener('click', click);
        eng.start(() => {
            timer++;
            if (phase === 'show' && timer > 180) { phase = 'click'; timer = 0; }
            eng.clear('#ede7f6');
            if (phase === 'show') {
                eng.drawText('Memorize the highlighted cells!', eng.w / 2, 40, 16);
                cells.forEach(cell => {
                    const hi = cell.isTarget;
                    eng.ctx.fillStyle = hi ? '#fff9c4' : '#e0e0e0';
                    eng.ctx.fillRect(cell.x - 40, cell.y - 35, 80, 70);
                    if (hi) eng.drawText(cell.sym, cell.x, cell.y + 8, 28);
                });
            } else {
                eng.drawText('Click the cells you memorized!', eng.w / 2, 40, 16);
                cells.forEach(cell => {
                    eng.ctx.fillStyle = cell.done ? '#c8e6c9' : '#e0e0e0';
                    eng.ctx.fillRect(cell.x - 40, cell.y - 35, 80, 70);
                    eng.drawText('?', cell.x, cell.y + 8, 28, '#9e9e9e');
                });
            }
        });

        return { destroy: () => eng.canvas.removeEventListener('click', click) };
    }

    /* ── L13 Traffic Controller ── */
    static l13Traffic(eng, cb) {
        let lights = [
            { x: eng.w * 0.25, y: eng.h * 0.35, state: 'red' },
            { x: eng.w * 0.75, y: eng.h * 0.35, state: 'red' }
        ];
        let cars = [], passed = 0, goal = 12, spawnT = 0;

        const spawnCar = () => {
            cars.push({
                x: eng.rand(0, 1) > 0.5 ? -30 : eng.w + 30,
                y: eng.h * 0.65 + eng.rand(-20, 20),
                vx: eng.rand(0, 1) > 0.5 ? 2 : -2,
                lane: eng.randInt(0, 1)
            });
        };

        const click = (e) => {
            const p = eng.pos(e);
            lights.forEach(l => {
                if (eng.hitCircle(p.x, p.y, l.x, l.y, 30)) {
                    l.state = l.state === 'red' ? 'green' : 'red';
                    MMAAudio.click();
                    cb.recordClick(true);
                }
            });
        };

        eng.canvas.addEventListener('click', click);
        eng.start(() => {
            spawnT++;
            if (spawnT % 50 === 0 && cars.length < 6) spawnCar();

            cars.forEach(car => {
                const nearLight = lights.find(l => Math.abs(car.x - l.x) < 50);
                if (!nearLight || nearLight.state === 'green') car.x += car.vx;
            });

            cars = cars.filter(car => {
                if (car.x < -50 || car.x > eng.w + 50) {
                    passed++;
                    cb.onProgress(passed / goal * 100);
                    if (passed >= goal) cb.onComplete();
                    return false;
                }
                return true;
            });

            eng.clear('#eceff1');
            eng.ctx.fillStyle = '#546e7a';
            eng.ctx.fillRect(0, eng.h * 0.6, eng.w, 50);
            lights.forEach(l => {
                eng.ctx.fillStyle = '#263238';
                eng.ctx.fillRect(l.x - 12, l.y - 40, 24, 70);
                ['red', 'yellow', 'green'].forEach((c, i) => {
                    const colors = { red: '#f44336', yellow: '#ffeb3b', green: '#4caf50' };
                    eng.ctx.fillStyle = l.state === c ? colors[c] : '#333';
                    eng.ctx.beginPath();
                    eng.ctx.arc(l.x, l.y - 25 + i * 22, 8, 0, Math.PI * 2);
                    eng.ctx.fill();
                });
            });
            cars.forEach(car => {
                eng.ctx.fillStyle = car.vx > 0 ? '#1e88e5' : '#e53935';
                eng.ctx.fillRect(car.x - 20, car.y - 10, 40, 20);
            });
            eng.drawText(`Vehicles passed: ${passed}/${goal} — Click lights!`, eng.w / 2, 24, 14);
        });

        return { destroy: () => eng.canvas.removeEventListener('click', click) };
    }

    /* ── L14 Computer Lab ── */
    static l14ComputerLab(eng, cb) {
        const devices = [
            { name: 'Mouse', emoji: '🖱️', x: 0.15, y: 0.7 },
            { name: 'Keyboard', emoji: '⌨️', x: 0.35, y: 0.75 },
            { name: 'Monitor', emoji: '🖥️', x: 0.55, y: 0.45 },
            { name: 'Printer', emoji: '🖨️', x: 0.78, y: 0.65 },
            { name: 'Speaker', emoji: '🔊', x: 0.25, y: 0.4 },
            { name: 'Scanner', emoji: '📠', x: 0.7, y: 0.35 }
        ].map(d => ({ ...d, px: d.x * eng.w, py: d.y * eng.h, done: false }));
        let order = [...devices].sort(() => Math.random() - 0.5);
        let step = 0;

        const click = (e) => {
            const p = eng.pos(e);
            const want = order[step];
            for (const d of devices) {
                if (eng.hitCircle(p.x, p.y, d.px, d.py, 35)) {
                    if (d.name === want.name) {
                        d.done = true;
                        step++;
                        MMAAudio.success();
                        cb.recordClick(true);
                        cb.onProgress(step / devices.length * 100);
                        if (step >= devices.length) cb.onComplete();
                    } else {
                        MMAAudio.fail();
                        cb.recordClick(false);
                    }
                    return;
                }
            }
        };

        eng.canvas.addEventListener('click', click);
        eng.onResize = () => devices.forEach(d => { d.px = d.x * eng.w; d.py = d.y * eng.h; });

        eng.start(() => {
            eng.clear('#e8eaf6');
            eng.ctx.fillStyle = '#cfd8dc';
            eng.ctx.fillRect(eng.w * 0.1, eng.h * 0.55, eng.w * 0.8, eng.h * 0.35);
            devices.forEach(d => {
                eng.ctx.globalAlpha = d.done ? 0.4 : 1;
                eng.drawText(d.emoji, d.px, d.py, 36);
                eng.drawText(d.name, d.px, d.py + 30, 11, '#37474f');
                eng.ctx.globalAlpha = 1;
            });
            if (step < devices.length) {
                eng.drawText(`Click: ${order[step].name}`, eng.w / 2, 30, 20, '#1565c0');
            }
            eng.drawText(`${step}/${devices.length}`, eng.w - 40, 24, 14);
        });

        return { destroy: () => eng.canvas.removeEventListener('click', click) };
    }

    /* ── L15 Tournament ── */
    static l15Tournament(eng, cb) {
        let phase = 0;
        const phases = [
            { name: 'Single Click', type: 'click', count: 0, goal: 5 },
            { name: 'Double Click', type: 'dbl', count: 0, goal: 3 },
            { name: 'Drag & Drop', type: 'drag', done: false },
            { name: 'Shape Trace', type: 'trace', pts: [] },
            { name: 'Precision', type: 'precision', hits: 0, goal: 4 },
            { name: 'Speed', type: 'speed', hits: 0, goal: 8, t: 0 }
        ];
        let target = { x: eng.w / 2, y: eng.h / 2, r: 30 };
        let dragItem = { x: 100, y: 200, tx: eng.w - 100, ty: 200, done: false };
        let dragging = false, lastClick = 0, traceDraw = false;

        const click = (e) => {
            const p = eng.pos(e);
            const ph = phases[phase];
            if (ph.type === 'click') {
                if (eng.hitCircle(p.x, p.y, target.x, target.y, target.r)) {
                    ph.count++;
                    cb.recordClick(true);
                    MMAAudio.pop();
                    target.x = eng.rand(60, eng.w - 60);
                    target.y = eng.rand(80, eng.h - 60);
                    if (ph.count >= ph.goal) nextPhase();
                } else cb.recordClick(false);
            } else if (ph.type === 'dbl') {
                const now = Date.now();
                if (eng.hitCircle(p.x, p.y, target.x, target.y, target.r)) {
                    if (now - lastClick < 350) {
                        ph.count++;
                        cb.recordClick(true, true);
                        MMAAudio.levelUp();
                        target.x = eng.rand(60, eng.w - 60);
                        target.y = eng.rand(80, eng.h - 60);
                        if (ph.count >= ph.goal) nextPhase();
                    }
                    lastClick = now;
                }
            } else if (ph.type === 'precision') {
                if (eng.hitCircle(p.x, p.y, target.x, target.y, 15)) {
                    ph.hits++;
                    cb.recordClick(true);
                    MMAAudio.click();
                    target.x = eng.rand(60, eng.w - 60);
                    target.y = eng.rand(80, eng.h - 60);
                    if (ph.hits >= ph.goal) nextPhase();
                } else cb.recordClick(false);
            } else if (ph.type === 'speed') {
                if (eng.hitCircle(p.x, p.y, target.x, target.y, target.r)) {
                    ph.hits++;
                    cb.recordClick(true);
                    MMAAudio.pop();
                    target.x = eng.rand(40, eng.w - 40);
                    target.y = eng.rand(60, eng.h - 40);
                    target.r = Math.max(15, target.r - 2);
                    if (ph.hits >= ph.goal) nextPhase();
                }
            }
        };

        const nextPhase = () => {
            phase++;
            cb.onProgress(phase / phases.length * 100);
            if (phase >= phases.length) {
                cb.setTracing(88);
                cb.onComplete();
            } else MMAAudio.levelUp();
        };

        const down = (e) => {
            const ph = phases[phase];
            if (ph.type === 'drag' || ph.type === 'trace') {
                e.preventDefault();
                if (ph.type === 'drag') dragging = true;
                if (ph.type === 'trace') traceDraw = true;
            }
        };
        const move = (e) => {
            const ph = phases[phase];
            const p = eng.pos(e);
            if (ph.type === 'drag' && dragging) {
                dragItem.x = p.x; dragItem.y = p.y;
            }
            if (ph.type === 'trace' && traceDraw) {
                ph.pts.push(p);
            }
        };
        const up = () => {
            const ph = phases[phase];
            if (ph.type === 'drag' && dragging) {
                if (Math.hypot(dragItem.x - dragItem.tx, dragItem.y - dragItem.ty) < 40) {
                    ph.done = true;
                    dragItem.x = dragItem.tx; dragItem.y = dragItem.ty;
                    cb.recordDrag(true);
                    nextPhase();
                } else cb.recordDrag(false);
                dragging = false;
            }
            if (ph.type === 'trace' && traceDraw && ph.pts.length > 30) {
                cb.setTracing(85);
                nextPhase();
                traceDraw = false;
            }
        };

        const ctxMenu = (e) => {
            if (phase === 1) { e.preventDefault(); MMAAudio.click(); }
        };

        eng.canvas.addEventListener('click', click);
        eng.canvas.addEventListener('contextmenu', ctxMenu);
        ['mousedown','touchstart'].forEach(ev => eng.canvas.addEventListener(ev, down));
        ['mousemove','touchmove'].forEach(ev => eng.canvas.addEventListener(ev, move));
        ['mouseup','touchend'].forEach(ev => eng.canvas.addEventListener(ev, up));

        eng.start(() => {
            const ph = phases[phase];
            eng.clear('#e3f2fd');
            eng.drawText(`Phase ${phase + 1}/${phases.length}: ${ph.name}`, eng.w / 2, 30, 16, '#0d47a1');

            if (ph.type === 'click' || ph.type === 'dbl' || ph.type === 'precision' || ph.type === 'speed') {
                eng.ctx.fillStyle = ph.type === 'precision' ? '#e53935' : '#43a047';
                eng.ctx.beginPath();
                eng.ctx.arc(target.x, target.y, ph.type === 'precision' ? 15 : target.r, 0, Math.PI * 2);
                eng.ctx.fill();
                if (ph.type === 'dbl') eng.drawText('Double-click!', target.x, target.y + 50, 13);
                if (ph.type === 'speed') {
                    ph.t++;
                    if (ph.t % 40 === 0) { target.x = eng.rand(40, eng.w - 40); target.y = eng.rand(60, eng.h - 40); }
                }
            }
            if (ph.type === 'drag') {
                eng.ctx.strokeStyle = '#1565c0';
                eng.ctx.setLineDash([6, 4]);
                eng.ctx.strokeRect(dragItem.tx - 40, dragItem.ty - 30, 80, 60);
                eng.ctx.setLineDash([]);
                eng.drawText('DROP', dragItem.tx, dragItem.ty + 5, 14, '#1565c0');
                eng.ctx.fillStyle = '#ff9800';
                eng.ctx.fillRect(dragItem.x - 30, dragItem.y - 25, 60, 50);
            }
            if (ph.type === 'trace') {
                eng.ctx.strokeStyle = '#bbdefb';
                eng.ctx.lineWidth = 18;
                eng.ctx.beginPath();
                eng.ctx.arc(eng.w / 2, eng.h / 2, 70, 0, Math.PI * 2);
                eng.ctx.stroke();
                if (ph.pts.length > 1) eng.linePath(ph.pts, '#1565c0', 4);
                eng.drawText('Trace the circle', eng.w / 2, eng.h - 30, 14);
            }
        });

        return { destroy: () => {
            eng.canvas.removeEventListener('click', click);
            eng.canvas.removeEventListener('contextmenu', ctxMenu);
            ['mousedown','touchstart'].forEach(ev => eng.canvas.removeEventListener(ev, down));
            ['mousemove','touchmove'].forEach(ev => eng.canvas.removeEventListener(ev, move));
            ['mouseup','touchend'].forEach(ev => eng.canvas.removeEventListener(ev, up));
        }};
    }
}

window.LevelRunner = LevelRunner;
