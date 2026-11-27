// ==========================================
// Efeitos (game feel / "juice") - Mundo de Julia & Livia
// Pequena biblioteca sem dependencias para deixar os jogos mais vivos:
//   Efeitos.confete()                 chuva de confete na tela toda (vitoria)
//   Efeitos.estrelas(alvo, opts)      estrelinhas/emoji saindo de um ponto ou elemento
//   Efeitos.pulo(el)                  "squash & stretch" (acerto, toque)
//   Efeitos.balanco(el)               balancinho suave de "ops" (erro, sem punir)
//   Efeitos.texto(alvo, '+1', opts)   texto que sobe e some (+1, ⭐, Muito bem!)
//   Efeitos.brilho(el)                brilho que passa por cima (recompensa)
//   Efeitos.vibrar('acerto'|'erro'|ms) vibracao curta (Android; iOS ignora)
//   Efeitos.acerto(el) / Efeitos.erro(el)  combinacoes prontas (anima + vibra)
// Tudo usa transform/opacity (GPU) e um unico <canvas> de particulas com
// requestAnimationFrame + tempo real (delta), ajustado ao devicePixelRatio.
// Respeita "reduzir movimento" do aparelho (prefers-reduced-motion).
// Toque em qualquer botao ganha um "afundar" leve (propriedade CSS scale,
// que nao briga com o transform que o jogo ja usa). Desligar: <body data-efeitos-toque="off">
// ==========================================
(function () {
    const reduce = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const CORES = ['#ff5e7e', '#ffb43b', '#ffe14d', '#5fd36b', '#3fb6ff', '#8b6bff', '#ff7ad9'];
    const rnd = (a, b) => a + Math.random() * (b - a);

    // ---------- canvas de particulas (um so, criado sob demanda) ----------
    let cv = null, cx = null, parts = [], running = false, last = 0, dpr = 1;
    const emojiCache = new Map();

    function ensureCanvas() {
        if (cv && cv.isConnected) return;
        cv = document.createElement('canvas');
        cv.className = 'efeitos-canvas';
        cv.setAttribute('aria-hidden', 'true');
        cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483000;contain:strict';
        document.body.appendChild(cv);
        cx = cv.getContext('2d');
        resize();
    }
    function resize() {
        if (!cv) return;
        dpr = Math.min(window.devicePixelRatio || 1, 2);   // 2x basta: 3x pesa no tablet
        cv.width = Math.round(innerWidth * dpr);
        cv.height = Math.round(innerHeight * dpr);
        cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener('resize', resize);

    // Emoji desenhado uma vez num canvas pequeno e reaproveitado (fillText a cada quadro pesa)
    function emojiSprite(ch, size) {
        const k = ch + '|' + size;
        if (emojiCache.has(k)) return emojiCache.get(k);
        const c = document.createElement('canvas');
        const s = Math.ceil(size * 1.3 * dpr);
        c.width = c.height = s;
        const g = c.getContext('2d');
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = `${size * dpr}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
        g.fillText(ch, s / 2, s / 2 + size * dpr * 0.06);
        emojiCache.set(k, c);
        return c;
    }

    function loop(t) {
        const dt = Math.max(0, Math.min(0.05, (t - last) / 1000)) || 0.016;   // nunca negativo (rAF anterior ao add); aba voltando: nao "teleporta"
        last = t;
        cx.clearRect(0, 0, innerWidth, innerHeight);
        for (let i = parts.length - 1; i >= 0; i--) {
            const p = parts[i];
            p.life -= dt;
            if (p.life <= 0 || p.y > innerHeight + 40) { parts.splice(i, 1); continue; }
            p.vx *= Math.pow(p.drag, dt * 60);
            p.vy = p.vy * Math.pow(p.drag, dt * 60) + p.g * dt;
            p.x += p.vx * dt; p.y += p.vy * dt;
            p.rot += p.vr * dt;
            p.wob += dt * 8;
            const a = Math.min(1, p.life / p.fade);
            cx.globalAlpha = a;
            cx.save();
            cx.translate(p.x, p.y);
            cx.rotate(p.rot);
            if (p.kind === 'confete') {
                cx.scale(1, Math.abs(Math.cos(p.wob)) * 0.8 + 0.2);   // papel girando
                cx.fillStyle = p.color;
                cx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            } else if (p.kind === 'estrela') {
                const s = p.size * (p.grow ? Math.max(0.05, Math.min(1, (p.max - p.life) * 6)) : 1);
                star(cx, s, p.color);
            } else if (p.kind === 'emoji') {
                const img = p.img, s = p.size * (0.6 + 0.4 * Math.min(1, (p.max - p.life) * 5));
                cx.drawImage(img, -s * 0.65, -s * 0.65, s * 1.3, s * 1.3);
            } else {
                cx.fillStyle = p.color;
                cx.beginPath(); cx.arc(0, 0, Math.max(0.5, p.size / 2), 0, Math.PI * 2); cx.fill();
            }
            cx.restore();
        }
        cx.globalAlpha = 1;
        if (parts.length) requestAnimationFrame(loop);
        else { running = false; cx.clearRect(0, 0, innerWidth, innerHeight); }
    }
    function star(g, r, color) {
        g.fillStyle = color;
        g.beginPath();
        for (let i = 0; i < 10; i++) {
            const rr = i % 2 ? r * 0.45 : r;
            const ang = -Math.PI / 2 + i * Math.PI / 5;
            g[i ? 'lineTo' : 'moveTo'](Math.cos(ang) * rr, Math.sin(ang) * rr);
        }
        g.closePath(); g.fill();
        g.fillStyle = 'rgba(255,255,255,.55)';
        g.beginPath(); g.arc(-r * 0.15, -r * 0.2, r * 0.18, 0, Math.PI * 2); g.fill();
    }
    function add(p) {
        ensureCanvas();
        p.max = p.life;
        p.fade = p.fade || Math.min(0.4, p.life);
        p.drag = p.drag || 0.985;
        p.rot = p.rot || 0; p.vr = p.vr || 0; p.wob = Math.random() * 6;
        parts.push(p);
        if (parts.length > 400) parts.splice(0, parts.length - 400);   // limite para tablet fraco
        if (!running) { running = true; last = performance.now(); requestAnimationFrame(loop); }
    }

    // centro de um elemento (ou {x,y}, ou evento)
    function pontoDe(alvo) {
        if (!alvo) return { x: innerWidth / 2, y: innerHeight / 2 };
        if (alvo.getBoundingClientRect) {
            const r = alvo.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }
        if ('clientX' in alvo) return { x: alvo.clientX, y: alvo.clientY };
        return { x: alvo.x, y: alvo.y };
    }

    // ---------- API ----------
    function confete(opts) {
        opts = opts || {};
        if (reduce()) return estrelas(null, { quantidade: 8 });
        const n = opts.quantidade || Math.round(Math.min(160, innerWidth / 6));
        const cores = opts.cores || CORES;
        for (let i = 0; i < n; i++) {
            const lado = i % 2 ? 1 : -1;
            // dois "canhoes" nos cantos de baixo + chuva de cima
            if (i < n * 0.6) {
                add({ kind: 'confete', x: lado < 0 ? -10 : innerWidth + 10, y: innerHeight * rnd(0.55, 0.85),
                      vx: -lado * rnd(260, 720), vy: -rnd(520, 980), g: 900, drag: 0.975,
                      size: rnd(8, 14), color: cores[i % cores.length], life: rnd(2.2, 3.4), vr: rnd(-8, 8), rot: rnd(0, 6) });
            } else {
                add({ kind: 'confete', x: rnd(0, innerWidth), y: rnd(-120, -10), vx: rnd(-60, 60), vy: rnd(80, 200), g: 260,
                      drag: 0.99, size: rnd(8, 13), color: cores[i % cores.length], life: rnd(3, 4.2), vr: rnd(-6, 6) });
            }
        }
    }

    function estrelas(alvo, opts) {
        opts = opts || {};
        const p0 = pontoDe(alvo);
        const n = reduce() ? Math.min(4, opts.quantidade || 4) : (opts.quantidade || 14);
        const forca = opts.forca || 1;
        const emoji = opts.emoji ? [].concat(opts.emoji) : null;
        for (let i = 0; i < n; i++) {
            const ang = (i / n) * Math.PI * 2 + rnd(-0.3, 0.3);
            const v = rnd(160, 380) * forca * (reduce() ? 0.3 : 1);
            const base = { x: p0.x, y: p0.y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v - 120 * forca,
                           g: opts.gravidade != null ? opts.gravidade : 520, drag: 0.94, life: rnd(0.7, 1.1), vr: rnd(-5, 5) };
            if (emoji) {
                const size = opts.tamanho || 28;
                add(Object.assign(base, { kind: 'emoji', size, img: emojiSprite(emoji[i % emoji.length], size) }));
            } else {
                add(Object.assign(base, { kind: i % 3 ? 'estrela' : 'ponto', size: rnd(7, 13) * (opts.escala || 1),
                                          color: (opts.cores || CORES)[i % (opts.cores || CORES).length], grow: true }));
            }
        }
    }

    function anima(el, frames, opts) {
        if (!el || !el.animate) return null;
        try { return el.animate(frames, Object.assign({ composite: 'add' }, opts)); }
        catch (e) { try { return el.animate(frames, opts); } catch (e2) { return null; } }
    }

    // squash & stretch com a propriedade "scale" (separada do transform do jogo)
    function pulo(el, forca) {
        if (!el || reduce()) return;
        const f = forca || 1;
        const sq = 1 - 0.12 * f, st = 1 + 0.1 * f;
        try {
            el.animate([
                { scale: '1 1' },
                { scale: `${st} ${sq}`, offset: 0.25 },
                { scale: `${sq} ${st}`, offset: 0.5 },
                { scale: `${1 + 0.03 * f} ${1 - 0.03 * f}`, offset: 0.75 },
                { scale: '1 1' }
            ], { duration: 420, easing: 'ease-out' });
        } catch (e) {}
    }

    // erro: balanco curto e pequeno (8px), sem tremer a tela inteira
    function balanco(el) {
        if (!el) return;
        const a = reduce() ? 3 : 8;
        try {
            el.animate([
                { translate: '0 0' }, { translate: `${-a}px 0` }, { translate: `${a}px 0` },
                { translate: `${-a * 0.6}px 0` }, { translate: `${a * 0.3}px 0` }, { translate: '0 0' }
            ], { duration: 380, easing: 'ease-in-out' });
        } catch (e) {}
    }

    function texto(alvo, txt, opts) {
        opts = opts || {};
        const p0 = pontoDe(alvo);
        const d = document.createElement('div');
        d.textContent = txt;
        d.setAttribute('aria-hidden', 'true');
        d.style.cssText = `position:fixed;left:${p0.x}px;top:${p0.y}px;transform:translate(-50%,-50%);pointer-events:none;` +
            `z-index:2147483001;font:900 ${opts.tamanho || 34}px 'Fredoka One','Nunito',system-ui,sans-serif;` +
            `color:${opts.cor || '#fff'};-webkit-text-stroke:${opts.contorno === false ? 0 : 2}px rgba(60,30,90,.55);` +
            `text-shadow:0 3px 0 rgba(0,0,0,.18),0 6px 14px rgba(0,0,0,.25);white-space:nowrap;will-change:transform,opacity`;
        document.body.appendChild(d);
        const dur = reduce() ? 700 : 1000;
        const an = d.animate([
            { transform: 'translate(-50%,-50%) scale(.4)', opacity: 0 },
            { transform: 'translate(-50%,-80%) scale(1.15)', opacity: 1, offset: 0.2 },
            { transform: 'translate(-50%,-110%) scale(1)', opacity: 1, offset: 0.6 },
            { transform: 'translate(-50%,-190%) scale(.9)', opacity: 0 }
        ], { duration: dur, easing: 'cubic-bezier(.2,.8,.3,1)' });
        an.onfinish = () => d.remove();
        setTimeout(() => d.remove(), dur + 200);
    }

    function brilho(el) {
        if (!el || reduce()) return;
        const r = el.getBoundingClientRect();
        if (!r.width) return;
        const s = document.createElement('div');
        s.setAttribute('aria-hidden', 'true');
        const radius = getComputedStyle(el).borderRadius || '16px';
        s.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;` +
            `pointer-events:none;z-index:2147482999;border-radius:${radius};overflow:hidden`;
        const shine = document.createElement('div');
        shine.style.cssText = 'position:absolute;top:-20%;bottom:-20%;width:40%;left:-50%;transform:skewX(-20deg);' +
            'background:linear-gradient(90deg,transparent,rgba(255,255,255,.75),transparent)';
        s.appendChild(shine);
        document.body.appendChild(s);
        const an = shine.animate([{ left: '-50%' }, { left: '120%' }], { duration: 650, easing: 'ease-in-out' });
        an.onfinish = () => s.remove();
        setTimeout(() => s.remove(), 900);
    }

    const VIBRA = { acerto: 18, erro: [30, 40, 30], toque: 8, vitoria: [20, 60, 20, 60, 40] };
    function vibrar(p) {
        try {
            if (localStorage.getItem('vibrar') === 'off') return;
            const v = parseFloat(localStorage.getItem('audioVolume'));
            if (!isNaN(v) && v <= 0) return;   // modo silencioso: sem vibrar tambem
        } catch (e) {}
        try { if (navigator.vibrate) navigator.vibrate(typeof p === 'string' ? (VIBRA[p] || 10) : p); } catch (e) {}
    }

    function acerto(el, opts) {
        opts = opts || {};
        pulo(el);
        if (el) estrelas(el, { quantidade: opts.quantidade || 12, emoji: opts.emoji });
        if (opts.texto) texto(el, opts.texto);
        vibrar('acerto');
    }
    function erro(el) {
        balanco(el);
        vibrar('erro');
    }
    function vitoria(opts) {
        confete(opts);
        vibrar('vitoria');
    }

    // ---------- toque: botao "afunda" ao apertar ----------
    function pressFeedback(e) {
        if (document.body && document.body.dataset.efeitosToque === 'off') return;
        const b = e.target.closest && e.target.closest('button, .btn, [role="button"], .option, .choice, .card-btn');
        if (!b || b.disabled || reduce()) return;
        try {
            b.animate([{ scale: '1' }, { scale: '0.94' }, { scale: '1.02' }, { scale: '1' }],
                      { duration: 260, easing: 'ease-out' });
        } catch (err) {}
    }
    window.addEventListener('pointerdown', pressFeedback, { passive: true, capture: true });

    window.Efeitos = { confete, estrelas, pulo, balanco, texto, brilho, vibrar, acerto, erro, vitoria, anima, reduzir: reduce };
})();
