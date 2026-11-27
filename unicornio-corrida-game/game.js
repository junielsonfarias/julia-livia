// ==========================================
// Corrida de Unicornio - Mundo de Julia & Livia
// Corrida lateral na estrada do arco-iris, desenhada em <canvas>.
// Bater num obstaculo so deixa mais devagar (nunca tem "game over").
// ==========================================

function goBack() {
    if (window.parent !== window) {
        try { if (window.parent.closeGameModal) { window.parent.closeGameModal(); return; } } catch (e) {}
    }
    if (window.history.length > 1) window.history.back();
    else window.location.href = '../index.html';
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.body.classList.toggle('racing', id === 'race-screen');
    if (id === 'setup-screen') startPreview();
}

// ---------- Armazenamento (sempre com try/catch) ----------
const STORE = 'unicornio_corrida_';
function saveData(key, value) {
    try { localStorage.setItem(STORE + key, JSON.stringify(value)); } catch (e) {}
}
function loadData(key, def) {
    try {
        const v = localStorage.getItem(STORE + key);
        return v ? JSON.parse(v) : def;
    } catch (e) { return def; }
}

function play(name) { try { KidsAudio.play(name); } catch (e) {} }
function say(text, opts) { try { KidsAudio.speak(text, opts || {}); } catch (e) {} }

// ---------- Dados ----------
const TAU = Math.PI * 2;
const RAINBOW = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa'];
const ROAD_BANDS = ['#ffc9c9', '#ffd8a8', '#fff3bf', '#d3f9d8', '#d0ebff', '#e5dbff'];

const COLORS = {
    rosa:   { name: 'Rosa',   body: '#ffcce3', shade: '#f5a3c9', line: '#d77aa8', hoof: '#c2589a', chip: '#ff9ccb' },
    lilas:  { name: 'Lilás',  body: '#e6d6ff', shade: '#c4a8f5', line: '#9f7fdc', hoof: '#7b55c4', chip: '#c09cff' },
    azul:   { name: 'Azul',   body: '#cdeaff', shade: '#96cbf2', line: '#6aa7d8', hoof: '#3f7fbf', chip: '#74c0fc' },
    branco: { name: 'Branco', body: '#ffffff', shade: '#e2e6f0', line: '#b8bfd1', hoof: '#9aa3ba', chip: '#ffffff' },
    menta:  { name: 'Menta',  body: '#cff7e4', shade: '#97e0bf', line: '#63c09a', hoof: '#3c9c76', chip: '#63e6be' }
};
const PLAYERS = {
    julia:     { name: 'Julia',     emoji: '👸' },
    livia:     { name: 'Livia',     emoji: '🧚' },
    convidado: { name: 'Convidado', emoji: '🙂' }
};
// length = distancia ate o castelo; speed = velocidade normal (unidades/s)
const DIFFS = {
    facil:  { name: 'Fácil',  speed: 250, rival: 0.80, length: 12000, gap: [720, 1080], portals: 2, obstacle: 0.5, hint: true },
    normal: { name: 'Normal', speed: 310, rival: 0.96, length: 17000, gap: [500, 800],  portals: 3, obstacle: 0.62, hint: false },
    rapido: { name: 'Rápido', speed: 380, rival: 0.99, length: 21000, gap: [400, 640],  portals: 3, obstacle: 0.72, hint: false }
};
const RIVAL_NAME = 'Estrelinha';

const GRAVITY = 2200;
const JUMP_V = 880;
const JUMP2_V = 760;

// ---------- Opcoes ----------
const opts = Object.assign({ who: 'livia', color: 'rosa', diff: 'facil' }, loadData('opcoes', {}));
if (!PLAYERS[opts.who]) opts.who = 'livia';
if (!COLORS[opts.color]) opts.color = 'rosa';
if (!DIFFS[opts.diff]) opts.diff = 'facil';

function speakIntro() {
    say('Corrida de Unicórnio! Seu unicórnio corre sozinho pela estrada do arco-íris. ' +
        'Toque na tela para pular. Toque duas vezes para pular mais alto. ' +
        'Pule as nuvens de chuva, as pedras e as poças. Pegue as estrelas e os corações. ' +
        'Passe pelo arco-íris para correr mais rápido! ' +
        'No portal mágico, responda a pergunta e ganhe um turbo. ' +
        'Chegue primeiro no castelo!', { rate: 0.92 });
}

function buildSetup() {
    const row = document.getElementById('color-row');
    row.innerHTML = '';
    Object.keys(COLORS).forEach(key => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'color-btn';
        b.dataset.color = key;
        b.style.background = COLORS[key].chip;
        b.setAttribute('aria-label', COLORS[key].name);
        b.textContent = '🦄';
        b.addEventListener('click', () => {
            opts.color = key; play('select'); say(COLORS[key].name); refreshSetup();
        });
        row.appendChild(b);
    });
    document.querySelectorAll('.pick.who').forEach(b => b.addEventListener('click', () => {
        opts.who = b.dataset.who;
        // Livia comeca sugerindo o Facil
        if (opts.who === 'livia' && opts.diff === 'rapido') opts.diff = 'facil';
        play('select'); say(PLAYERS[opts.who].name); refreshSetup();
    }));
    document.querySelectorAll('.pick.diff').forEach(b => b.addEventListener('click', () => {
        opts.diff = b.dataset.diff; play('select'); say(DIFFS[opts.diff].name); refreshSetup();
    }));
    refreshSetup();
}

function recordKey() { return 'recorde_' + opts.who + '_' + opts.diff; }

function recordText() {
    const r = loadData(recordKey(), null);
    if (!r) return 'Primeira corrida de ' + PLAYERS[opts.who].name + ' no ' + DIFFS[opts.diff].name + '!';
    return 'Recorde de ' + PLAYERS[opts.who].name + ' no ' + DIFFS[opts.diff].name + ': ⭐ ' + r.stars +
        ' · 🏆 ' + r.wins + (r.wins === 1 ? ' vitória' : ' vitórias');
}

function refreshSetup() {
    document.querySelectorAll('.pick.who').forEach(b => b.classList.toggle('selected', b.dataset.who === opts.who));
    document.querySelectorAll('.pick.diff').forEach(b => b.classList.toggle('selected', b.dataset.diff === opts.diff));
    document.querySelectorAll('.color-btn').forEach(b => b.classList.toggle('selected', b.dataset.color === opts.color));
    document.getElementById('score-line').textContent = recordText();
    saveData('opcoes', opts);
}

// ---------- Previa animada na tela inicial ----------
let previewRaf = 0;
function startPreview() {
    if (previewRaf) return;
    const cv = document.getElementById('preview');
    const c = cv.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = 220 * dpr; cv.height = 150 * dpr;
    let phase = 0, last = performance.now();
    function tick(now) {
        if (!document.getElementById('setup-screen').classList.contains('active') || document.hidden) {
            previewRaf = 0; return;
        }
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        phase += dt * 9;
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        c.clearRect(0, 0, 220, 150);
        // estradinha arco-iris
        for (let i = 0; i < ROAD_BANDS.length; i++) {
            c.fillStyle = ROAD_BANDS[i];
            c.fillRect(10, 128 + i * 3, 200, 3);
        }
        drawUnicorn(c, 100, 132, 0.95, COLORS[opts.color], phase, 0, false);
        previewRaf = requestAnimationFrame(tick);
    }
    previewRaf = requestAnimationFrame(tick);
}

// ==========================================
// Desenho do unicornio (origem = patas no chao, olhando para a direita)
// ==========================================
function drawLeg(c, hx, hy, a, b, color, hoof) {
    const kx = hx + Math.sin(a) * 16, ky = hy + Math.cos(a) * 16;
    const fx = kx + Math.sin(a + b) * 17, fy = ky + Math.cos(a + b) * 17;
    c.strokeStyle = color;
    c.lineWidth = 9;
    c.beginPath(); c.moveTo(hx, hy); c.lineTo(kx, ky); c.lineTo(fx, fy); c.stroke();
    c.fillStyle = hoof;
    c.beginPath(); c.arc(fx, fy + 1, 5.5, 0, TAU); c.fill();
}

function drawUnicorn(c, x, y, s, col, phase, height, blink, air) {
    c.save();
    c.translate(x, y - height);
    c.scale(s, s);
    const bob = air ? 0 : -Math.abs(Math.sin(phase)) * 4;
    c.translate(0, bob);
    c.lineCap = 'round';
    c.lineJoin = 'round';

    const sp = Math.sin(phase), cp = Math.cos(phase);
    // pernas de tras (mais escuras, atras do corpo)
    if (air) {
        drawLeg(c, -26, -40, 0.9, -0.2, col.shade, col.hoof);
        drawLeg(c, 22, -40, -0.9, 1.4, col.shade, col.hoof);
    } else {
        drawLeg(c, -26, -40, sp * 0.7, Math.max(0, cp) * 0.9, col.shade, col.hoof);
        drawLeg(c, 22, -40, -sp * 0.7, -Math.max(0, -cp) * 1.1, col.shade, col.hoof);
    }

    // cauda arco-iris
    const wave = Math.sin(phase * 0.8) * 4;
    c.lineWidth = 5;
    for (let i = 0; i < RAINBOW.length; i++) {
        c.strokeStyle = RAINBOW[i];
        c.beginPath();
        c.moveTo(-34, -56 + i * 1.5);
        c.quadraticCurveTo(-62, -60 + i * 4 + wave, -58 - i, -22 + i * 3 + wave * 1.5);
        c.stroke();
    }

    // corpo
    c.fillStyle = col.body;
    c.strokeStyle = col.line;
    c.lineWidth = 2;
    c.beginPath(); c.ellipse(0, -52, 38, 20, 0, 0, TAU); c.fill(); c.stroke();
    // pescoco
    c.beginPath();
    c.moveTo(14, -66); c.lineTo(30, -100); c.lineTo(46, -94); c.lineTo(36, -52);
    c.closePath(); c.fill();
    // cabeca
    c.beginPath(); c.ellipse(46, -98, 16, 12, 0.35, 0, TAU); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(57, -89, 11, 8.5, 0.35, 0, TAU); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(46, -98, 15, 11, 0.35, 0, TAU); c.fill();
    // orelha
    c.beginPath(); c.moveTo(35, -106); c.lineTo(37, -121); c.lineTo(44, -108); c.closePath(); c.fill(); c.stroke();
    // chifre dourado
    c.fillStyle = '#ffd43b';
    c.strokeStyle = '#f59f00';
    c.beginPath(); c.moveTo(43, -108); c.lineTo(51, -107); c.lineTo(56, -136); c.closePath(); c.fill(); c.stroke();
    c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(45, -114); c.lineTo(51, -116); c.moveTo(47, -121); c.lineTo(52, -123); c.moveTo(49, -128); c.lineTo(53, -129); c.stroke();
    // bochecha e olho
    c.fillStyle = 'rgba(255,120,170,.45)';
    c.beginPath(); c.arc(52, -92, 4.5, 0, TAU); c.fill();
    if (blink) {
        c.strokeStyle = '#333'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(43, -100); c.quadraticCurveTo(47, -97, 51, -100); c.stroke();
    } else {
        c.fillStyle = '#2b2b3a';
        c.beginPath(); c.arc(47, -100, 3.6, 0, TAU); c.fill();
        c.fillStyle = '#fff';
        c.beginPath(); c.arc(48.2, -101.3, 1.3, 0, TAU); c.fill();
        c.strokeStyle = '#2b2b3a'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(44, -103); c.lineTo(42, -106); c.stroke();
    }
    c.fillStyle = col.line;
    c.beginPath(); c.arc(62, -88, 1.5, 0, TAU); c.fill();
    // crina arco-iris
    c.lineWidth = 6;
    for (let i = 0; i < RAINBOW.length; i++) {
        c.strokeStyle = RAINBOW[i];
        const w = Math.sin(phase + i) * 2;
        c.beginPath();
        c.moveTo(38 - i * 2.4, -108 + i * 7);
        c.quadraticCurveTo(26 - i * 3 + w, -104 + i * 8, 20 - i * 3 + w, -88 + i * 8);
        c.stroke();
    }
    // topete
    c.strokeStyle = RAINBOW[0]; c.lineWidth = 5;
    c.beginPath(); c.moveTo(41, -109); c.quadraticCurveTo(48, -108, 52, -101); c.stroke();

    // pernas da frente (mais claras, na frente do corpo)
    c.lineWidth = 2;
    if (air) {
        drawLeg(c, -18, -40, 1.1, -0.4, col.body, col.hoof);
        drawLeg(c, 28, -40, -1.1, 1.6, col.body, col.hoof);
    } else {
        drawLeg(c, -18, -40, -sp * 0.7, Math.max(0, -cp) * 0.9, col.body, col.hoof);
        drawLeg(c, 28, -40, sp * 0.7, -Math.max(0, cp) * 1.1, col.body, col.hoof);
    }
    c.restore();
}

// ==========================================
// Corrida
// ==========================================
const raceScreen = document.getElementById('race-screen');
const canvas = document.getElementById('race-canvas');
const ctx = canvas.getContext('2d');
const bannerEl = document.getElementById('banner');
const hudStars = document.getElementById('hud-stars');
const mMe = document.getElementById('m-me');
const mRival = document.getElementById('m-rival');

let cssW = 0, cssH = 0, dpr = 1, scale = 1, viewW = 640, viewH = 420, groundY = 370;
let skyGrad = null, grassGrad = null;
let G = null;            // estado da corrida
let rafId = 0, lastNow = 0;
let paused = false;

function resize() {
    if (!raceScreen.classList.contains('active')) return;
    const r = raceScreen.getBoundingClientRect();
    cssW = Math.max(1, r.width); cssH = Math.max(1, r.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    // tablets baratos: limita a quantidade de pixels
    const maxPx = 2400000;
    if (cssW * cssH * dpr * dpr > maxPx) dpr = Math.max(1, Math.sqrt(maxPx / (cssW * cssH)));
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    // em pe (retrato) mostra um pouco menos de pista para os bichinhos ficarem maiores
    scale = Math.min(cssH / 420, cssW / (cssH > cssW ? 520 : 640));
    viewW = cssW / scale;
    viewH = cssH / scale;
    groundY = Math.min(viewH - 46, Math.max(370, viewH * 0.7));
    skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, '#a5d8ff');
    skyGrad.addColorStop(0.55, '#d0bfff');
    skyGrad.addColorStop(1, '#ffd6e7');
    grassGrad = ctx.createLinearGradient(0, groundY, 0, viewH);
    grassGrad.addColorStop(0, '#8ce99a');
    grassGrad.addColorStop(1, '#51cf66');
    if (G && (paused || G.mode === 'portal')) render();
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 200));

function rand(a, b) { return a + Math.random() * (b - a); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
}

// ---------- Pista ----------
const OBST = {
    rock:   { w: 54, h: 46 },
    cloud:  { w: 76, h: 86 },
    puddle: { w: 100, h: 7 }
};

function buildCourse(d) {
    const items = [];
    const L = d.length;
    const portals = [];
    for (let i = 1; i <= d.portals; i++) portals.push(Math.round(L * i / (d.portals + 1) + rand(-300, 300)));
    portals.forEach(x => items.push({ type: 'portal', x, done: false }));
    let total = 0;
    let x = 1000;
    let lastType = '';
    while (x < L - 600) {
        if (portals.some(p => Math.abs(x - p) < 420)) { x += 450; continue; }
        const r = Math.random();
        if (r < d.obstacle) {
            let t = pick(['rock', 'cloud', 'puddle']);
            if (t === lastType) t = pick(['rock', 'cloud', 'puddle']);
            lastType = t;
            items.push({ type: t, x, w: OBST[t].w, h: OBST[t].h, done: false });
            if (Math.random() < 0.6) {
                // arco de estrelas por cima do obstaculo (pega pulando)
                [[-60, 140], [0, 185], [60, 140]].forEach(o => items.push({ type: 'star', x: x + o[0], y: o[1], done: false }));
                total += 3;
            }
        } else if (r < d.obstacle + 0.13) {
            items.push({ type: 'arch', x, done: false });
            lastType = 'arch';
        } else {
            const n = 4 + Math.floor(Math.random() * 2);
            for (let i = 0; i < n; i++) items.push({ type: 'star', x: x - 90 + i * 48, y: 50, done: false });
            total += n;
            if (Math.random() < 0.45) {
                items.push({ type: 'heart', x: x + 20, y: 170, done: false });
                total += 2;
            }
            lastType = 'stars';
        }
        x += rand(d.gap[0], d.gap[1]);
    }
    items.sort((a, b) => a.x - b.x);
    return { items, total };
}

// ---------- Cenario fixo (nuvens/brilhos) ----------
const CLOUDS = [];
for (let i = 0; i < 6; i++) CLOUDS.push({ x: i * 190 + rand(0, 80), y: rand(60, 200), s: rand(0.7, 1.3) });
const SPARKS = [];
for (let i = 0; i < 18; i++) SPARKS.push({ x: rand(0, 1), y: rand(0.08, 0.6), p: rand(0, TAU) });

// ---------- Particulas (pool fixo) ----------
const PARTS = [];
for (let i = 0; i < 120; i++) PARTS.push({ on: false });
function spawn(x, y, vx, vy, life, color, size, kind) {
    for (let i = 0; i < PARTS.length; i++) {
        const p = PARTS[i];
        if (!p.on) {
            p.on = true; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = life; p.max = life;
            p.color = color; p.size = size; p.kind = kind || 0;
            return;
        }
    }
}

// ---------- Iniciar ----------
function startRace() {
    play('click');
    saveData('opcoes', opts);
    const d = DIFFS[opts.diff];
    const course = buildCourse(d);
    const rivalColors = Object.keys(COLORS).filter(k => k !== opts.color);
    G = {
        d, L: d.length,
        items: course.items, totalStars: course.total, first: 0,
        mode: 'countdown', cd: 0, saidGo: false, t: 0,
        stars: 0, hits: 0, portalsRight: 0,
        shake: 0, finishT: 0, winner: null, hintSaid: false,
        player: { dist: 0, speed: 0, y: 0, vy: 0, jumps: 0, phase: 0, slowT: 0, boostT: 0, boostMul: 1, invuln: 0, blinkT: 2 },
        rival: {
            dist: 0, speed: 0, y: 0, vy: 0, phase: 1.5, boostT: 0, hopT: rand(2, 4), nextBoost: rand(7, 12),
            done: false, color: COLORS[pick(rivalColors)], blinkT: 3
        },
        speechAt: 0
    };
    PARTS.forEach(p => { p.on = false; });
    hudStars.textContent = '0';
    mMe.textContent = PLAYERS[opts.who].emoji;
    mMe.style.background = COLORS[opts.color].chip;
    mRival.style.background = G.rival.color.chip;
    mMe.style.left = '0%'; mRival.style.left = '0%';
    document.getElementById('portal-overlay').hidden = true;
    document.getElementById('pause-overlay').hidden = true;
    paused = false;
    blurFocus();
    showScreen('race-screen');
    resize();
    banner('Preparar...', true);
    say('Preparar...', { rate: 0.9 });
    startLoop();
}

function goSetup() {
    stopLoop();
    G = null; paused = false;
    try { KidsAudio.stop(); } catch (e) {}
    refreshSetup();
    showScreen('setup-screen');
}

function startLoop() {
    if (rafId) return;
    lastNow = performance.now();
    rafId = requestAnimationFrame(frame);
}
function stopLoop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
}

function frame(now) {
    rafId = 0;
    if (!G || paused || !raceScreen.classList.contains('active')) return;
    let dt = (now - lastNow) / 1000;
    lastNow = now;
    if (dt > 0.05) dt = 0.05;
    if (dt < 0) dt = 0;
    update(dt);
    if (!G) return;
    render();
    rafId = requestAnimationFrame(frame);
}

// ---------- Mensagens ----------
let bannerTimer = 0;
function banner(text, small) {
    bannerEl.textContent = text;
    bannerEl.classList.remove('show');
    bannerEl.classList.toggle('small', !!small);
    void bannerEl.offsetWidth; // reinicia a animacao
    bannerEl.classList.add('show');
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => bannerEl.classList.remove('show'), 1400);
}
// Fala sem atropelar demais (no maximo uma frase a cada ~2,5s)
function sayThrottled(text) {
    if (!G || G.t - G.speechAt < 2.5) return;
    G.speechAt = G.t;
    say(text, { rate: 1 });
}

// ---------- Controles ----------
function jump() {
    if (!G || paused || G.mode !== 'run') return;
    const p = G.player;
    if (p.y <= 0 && p.vy <= 0) {
        p.vy = JUMP_V; p.jumps = 1;
        play('click');
        const sx = p.dist - 20;
        for (let i = 0; i < 5; i++) spawn(sx, groundY, rand(-80, 20), rand(-80, -20), 0.4, '#fff', rand(3, 5), 0);
    } else if (p.jumps < 2) {
        p.vy = JUMP2_V; p.jumps = 2;
        play('flip');
        for (let i = 0; i < 8; i++) spawn(p.dist, groundY - p.y - 30, rand(-120, 120), rand(-60, 120), 0.5, pick(RAINBOW), rand(3, 5), 1);
    }
}

raceScreen.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button, .overlay')) return;
    e.preventDefault();
    jump();
});
const jumpBtn = document.getElementById('jump-btn');
jumpBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); jumpBtn.classList.add('press'); jump(); });
['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => jumpBtn.addEventListener(ev, () => jumpBtn.classList.remove('press')));
jumpBtn.addEventListener('click', (e) => e.preventDefault());

window.addEventListener('keydown', (e) => {
    if (!raceScreen.classList.contains('active') || !G) return;
    if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        if (e.repeat) return;
        if (G.mode === 'run' && !paused) jump();
    } else if ((e.key === 'p' || e.key === 'P') && G.mode !== 'portal') {
        if (paused) resumeGame(); else pauseGame();
    }
});

document.getElementById('pause-btn').addEventListener('click', () => { play('click'); pauseGame(); });
document.getElementById('resume-btn').addEventListener('click', () => { play('click'); resumeGame(); });

function pauseGame() {
    if (!G || paused || G.mode === 'portal') return;
    paused = true;
    stopLoop();
    try { KidsAudio.stop(); } catch (e) {}
    document.getElementById('pause-overlay').hidden = false;
}
function resumeGame() {
    if (!G) return;
    paused = false;
    document.getElementById('pause-overlay').hidden = true;
    blurFocus();
    startLoop();
}
function blurFocus() {
    try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) {}
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (G && raceScreen.classList.contains('active')) {
            if (G.mode === 'portal') stopLoop(); else pauseGame();
        }
    } else {
        if (G && G.mode === 'portal' && !paused) startLoop();
        if (document.getElementById('setup-screen').classList.contains('active')) startPreview();
    }
});

// ---------- Atualizacao ----------
function update(dt) {
    G.t += dt;
    const p = G.player, r = G.rival, d = G.d;
    if (G.shake > 0) G.shake -= dt;
    updateParticles(dt);
    blinkStep(p, dt); blinkStep(r, dt);

    if (G.mode === 'countdown') {
        G.cd += dt;
        p.phase += dt * 3; r.phase += dt * 3;
        if (G.cd >= 1.6 && !G.saidGo) {
            G.saidGo = true;
            G.mode = 'run';
            banner('Já! 🌈');
            say('Já!', { rate: 1 });
            play('start');
        }
        return;
    }
    if (G.mode === 'portal') return;

    // --- jogador ---
    let target = d.speed;
    if (p.slowT > 0) { p.slowT -= dt; target *= 0.45; }
    if (p.boostT > 0) {
        p.boostT -= dt; target *= p.boostMul;
        if (Math.random() < 0.6) spawn(p.dist - 40, groundY - p.y - rand(20, 60), rand(-160, -60), rand(-30, 30), 0.5, pick(RAINBOW), rand(3, 6), 1);
    }
    if (G.mode === 'finish') target = d.speed * 0.8;
    p.speed += (target - p.speed) * Math.min(1, dt * (target > p.speed ? 2.5 : 6));
    p.dist += p.speed * dt;
    p.phase += dt * (5 + p.speed / 35);
    if (p.y > 0 || p.vy > 0) {
        p.vy -= GRAVITY * dt;
        p.y += p.vy * dt;
        if (p.y <= 0) {
            p.y = 0; p.vy = 0; p.jumps = 0;
            for (let i = 0; i < 4; i++) spawn(p.dist + rand(-20, 20), groundY, rand(-60, 60), rand(-60, -10), 0.35, '#fff', rand(3, 5), 0);
        }
    }
    if (p.invuln > 0) p.invuln -= dt;

    // --- itens ---
    const camX = p.dist - viewW * 0.28;
    while (G.first < G.items.length && G.items[G.first].x < camX - 250) G.first++;
    if (G.mode === 'run') {
        for (let i = G.first; i < G.items.length; i++) {
            const it = G.items[i];
            if (it.x > p.dist + 200) break;
            if (it.done) continue;
            checkItem(it, p);
            if (G.mode !== 'run') break;
        }
        // dica falada no Facil para a primeira vez
        if (d.hint && !G.hintSaid) {
            const next = nextObstacle(p.dist);
            if (next && next.x - p.dist < 380) { G.hintSaid = true; sayThrottled('Toque para pular!'); }
        }
    }

    // --- rival ---
    updateRival(dt);

    // --- chegada ---
    if (G.mode === 'run' && p.dist >= G.L) {
        G.mode = 'finish';
        G.finishT = 0;
        G.winner = r.done ? 'rival' : 'player';
        p.boostT = 0; p.slowT = 0;
        if (G.winner === 'player') { play('win'); banner('🏆 Chegou!'); }
        else { play('turn'); banner('Chegou! 🏰', true); }
        for (let i = 0; i < 40; i++) {
            spawn(G.L + rand(-100, 100), groundY - rand(120, 260), rand(-200, 200), rand(-250, 50), rand(1, 1.8), pick(RAINBOW), rand(4, 7), 2);
        }
    }
    if (G.mode === 'finish') {
        G.finishT += dt;
        if (G.finishT > 2.4) { endRace(); return; }
    }

    // atualiza barra de progresso (so quando muda)
    setMarker(mMe, p.dist / G.L);
    setMarker(mRival, r.dist / G.L);
}

function blinkStep(u, dt) {
    u.blinkT -= dt;
    if (u.blinkT < -0.12) u.blinkT = rand(2, 4.5);
}

function setMarker(el, frac) {
    const pct = Math.max(0, Math.min(1, frac)) * 100;
    const v = pct.toFixed(1) + '%';
    if (el.style.left !== v) el.style.left = v;
}

function nextObstacle(dist) {
    for (let i = G.first; i < G.items.length; i++) {
        const it = G.items[i];
        if (it.x > dist + 600) return null;
        if (!it.done && OBST[it.type] && it.x > dist) return it;
    }
    return null;
}

function checkItem(it, p) {
    const t = it.type;
    if (OBST[t]) {
        const half = it.w / 2;
        if (p.dist + 22 > it.x - half && p.dist - 22 < it.x + half) {
            if (p.y < it.h - 4 && p.invuln <= 0) {
                it.done = true;
                hitObstacle(it, p);
            }
        } else if (p.dist - 22 > it.x + half) {
            it.done = true; // passou por cima
        }
    } else if (t === 'star' || t === 'heart') {
        const cy = p.y + 55;
        const dx = it.x - (p.dist + 10), dy = it.y - cy;
        if (dx * dx + dy * dy < (t === 'heart' ? 60 * 60 : 50 * 50)) {
            it.done = true;
            const gain = t === 'heart' ? 2 : 1;
            G.stars += gain;
            hudStars.textContent = G.stars;
            const box = hudStars.parentElement;
            box.classList.remove('bump'); void box.offsetWidth; box.classList.add('bump');
            play('star');
            const col = t === 'heart' ? '#ff6b9d' : '#ffd43b';
            for (let i = 0; i < (t === 'heart' ? 12 : 6); i++) {
                spawn(it.x, groundY - it.y, rand(-150, 150), rand(-150, 150), 0.5, col, rand(3, 5), 1);
            }
            if (t === 'heart') { p.boostT = Math.max(p.boostT, 1); p.boostMul = Math.max(p.boostMul, 1.3); sayThrottled('Coração!'); }
        }
    } else if (t === 'arch') {
        if (p.dist >= it.x) {
            it.done = true;
            p.boostT = 2.4; p.boostMul = 1.6; p.slowT = 0;
            play('correct');
            banner('🌈 Turbo!');
            sayThrottled(pick(['Arco-íris! Mais rápido!', 'Turbo do arco-íris!', 'Uau, que rápido!']));
        }
    } else if (t === 'portal') {
        if (p.dist >= it.x) {
            it.done = true;
            openPortal();
        }
    }
}

function hitObstacle(it, p) {
    G.hits++;
    p.slowT = 1.1; p.invuln = 1.6; p.boostT = 0;
    G.shake = 0.25;
    play('wrong');
    const msgs = { rock: 'Ops, a pedra!', cloud: 'Ops, molhou!', puddle: 'Splash!' };
    banner(it.type === 'puddle' ? '💦 Splash!' : 'Ops!', true);
    if (G.d.hint) sayThrottled(msgs[it.type] + ' Pule na próxima!');
    const col = it.type === 'puddle' || it.type === 'cloud' ? '#74c0fc' : '#adb5bd';
    for (let i = 0; i < 10; i++) spawn(it.x, groundY - rand(0, 30), rand(-120, 160), rand(-220, -60), 0.6, col, rand(3, 6), 3);
}

function updateRival(dt) {
    const r = G.rival, p = G.player, d = G.d;
    if (r.done) {
        r.dist += 120 * dt; // entra no castelo
        r.phase += dt * 10;
        return;
    }
    if (G.mode === 'finish' && G.winner === 'player') {
        // o jogador ja chegou: rival continua ate o fim
    }
    let mult = d.rival * (1 + 0.07 * Math.sin(G.t * 0.6 + 1.3));
    const gap = r.dist - p.dist;
    const prog = r.dist / G.L;
    if (opts.diff === 'facil') {
        if (gap > 100) mult *= 0.8;
        if (prog > 0.7 && gap > -50) mult *= 0.85;
        if (gap < -700) mult = Math.min(mult * 1.15, 0.92);
    } else if (opts.diff === 'normal') {
        if (gap > 400) mult *= 0.9;
        if (gap < -500) mult *= 1.08;
    } else {
        if (gap > 600) mult *= 0.94;
        if (gap < -300) mult *= 1.1;
    }
    // turbos do rival de vez em quando
    r.nextBoost -= dt;
    if (r.nextBoost <= 0) {
        r.nextBoost = rand(9, 15);
        if (!(opts.diff === 'facil' && prog > 0.6)) r.boostT = 1.5;
    }
    if (r.boostT > 0) {
        r.boostT -= dt; mult *= opts.diff === 'facil' ? 1.2 : 1.4;
        if (Math.random() < 0.4) spawn(r.dist - 40, rivalGround() - r.y - rand(15, 45), rand(-140, -60), rand(-20, 20), 0.4, pick(RAINBOW), rand(2, 4), 1);
    }
    const target = d.speed * mult;
    r.speed += (target - r.speed) * Math.min(1, dt * 2);
    r.dist += r.speed * dt;
    r.phase += dt * (5 + r.speed / 35);
    // pulinhos de enfeite
    r.hopT -= dt;
    if (r.hopT <= 0 && r.y <= 0) { r.vy = 650; r.hopT = rand(2.5, 5); }
    if (r.y > 0 || r.vy > 0) {
        r.vy -= GRAVITY * dt; r.y += r.vy * dt;
        if (r.y <= 0) { r.y = 0; r.vy = 0; }
    }
    if (r.dist >= G.L) {
        r.done = true;
        r.dist = G.L;
        if (G.mode === 'run') {
            banner('Estrelinha chegou!', true);
            G.speechAt = -10;
            sayThrottled('A Estrelinha chegou ao castelo! Continue, você consegue!');
        }
    }
}

function updateParticles(dt) {
    for (let i = 0; i < PARTS.length; i++) {
        const q = PARTS[i];
        if (!q.on) continue;
        q.life -= dt;
        if (q.life <= 0) { q.on = false; continue; }
        q.x += q.vx * dt; q.y += q.vy * dt;
        if (q.kind === 2 || q.kind === 3) q.vy += 500 * dt;
    }
}

// ---------- Portal magico (pergunta) ----------
const QCOLORS = [
    { n: 'AZUL', c: '#339af0' }, { n: 'VERMELHO', c: '#fa5252' }, { n: 'AMARELO', c: '#fcc419' },
    { n: 'VERDE', c: '#40c057' }, { n: 'ROSA', c: '#f783ac' }, { n: 'ROXO', c: '#9775fa' }, { n: 'LARANJA', c: '#ff922b' }
];
let currentQ = null;

function makeQuestion() {
    const easy = opts.who === 'livia' || (opts.who === 'convidado' && opts.diff === 'facil');
    if (easy) {
        if (Math.random() < 0.5) {
            const three = shuffle(QCOLORS.slice()).slice(0, 3);
            const ans = pick(three);
            return {
                html: 'Toque na cor <span class="hl" style="background:' + ans.c + '">' + ans.n + '</span>',
                speech: 'Toque na cor ' + ans.n.toLowerCase() + '!',
                visual: '',
                options: three.map(o => ({ color: o.c, label: o.n, right: o === ans })),
                answerSpeech: ans.n.toLowerCase()
            };
        }
        const n = 1 + Math.floor(Math.random() * 5);
        const nums = [n];
        while (nums.length < 3) { const k = 1 + Math.floor(Math.random() * 5); if (nums.indexOf(k) < 0) nums.push(k); }
        return {
            html: 'Quantas estrelas?',
            speech: 'Quantas estrelas tem aqui? Conte e toque no número!',
            visual: '⭐'.repeat(n),
            options: shuffle(nums).map(k => ({ text: String(k), right: k === n })),
            answerSpeech: String(n)
        };
    }
    let a, b, ans, html, speech;
    const lvl = opts.diff;
    const mult = Math.random() < (opts.who === 'julia' ? 0.6 : 0.45);
    if (mult) {
        const maxA = lvl === 'facil' ? 3 : lvl === 'normal' ? 5 : 9;
        a = 2 + Math.floor(Math.random() * (maxA - 1));
        b = 1 + Math.floor(Math.random() * (lvl === 'rapido' ? 9 : 10));
        ans = a * b;
        html = a + ' × ' + b + ' = ?';
        speech = 'Quanto é ' + a + ' vezes ' + b + '?';
    } else {
        const max = lvl === 'facil' ? 10 : lvl === 'normal' ? 20 : 50;
        a = 1 + Math.floor(Math.random() * (max - 1));
        b = 1 + Math.floor(Math.random() * Math.max(1, max - a));
        ans = a + b;
        html = a + ' + ' + b + ' = ?';
        speech = 'Quanto é ' + a + ' mais ' + b + '?';
    }
    const opt = [ans];
    let guard = 0;
    while (opt.length < 3 && guard++ < 50) {
        const delta = pick([1, 2, mult ? a : 10, -1, -2, mult ? -a : -10]);
        const k = ans + delta;
        if (k > 0 && opt.indexOf(k) < 0) opt.push(k);
    }
    while (opt.length < 3) opt.push(ans + opt.length * 3);
    return {
        html, speech, visual: '',
        options: shuffle(opt).map(k => ({ text: String(k), right: k === ans })),
        answerSpeech: String(ans)
    };
}

function openPortal() {
    G.mode = 'portal';
    play('turn');
    currentQ = makeQuestion();
    currentQ.answered = false;
    document.getElementById('q-text').innerHTML = currentQ.html;
    document.getElementById('q-visual').textContent = currentQ.visual;
    const fb = document.getElementById('q-feedback');
    fb.textContent = ''; fb.className = 'q-feedback';
    const box = document.getElementById('q-options');
    box.innerHTML = '';
    currentQ.options.forEach(o => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'q-opt' + (o.color ? ' color' : '');
        if (o.color) { b.style.background = o.color; b.setAttribute('aria-label', o.label); }
        else b.textContent = o.text;
        b.addEventListener('click', () => answerPortal(o, b));
        box.appendChild(b);
    });
    document.getElementById('portal-overlay').hidden = false;
    say('Portal mágico! ' + currentQ.speech, { rate: 0.9 });
}

document.getElementById('q-hear').addEventListener('click', () => {
    if (currentQ) say(currentQ.speech, { rate: 0.9 });
});

function answerPortal(o, btn) {
    if (!currentQ || currentQ.answered || !G) return;
    currentQ.answered = true;
    const fb = document.getElementById('q-feedback');
    const btns = document.querySelectorAll('#q-options .q-opt');
    btns.forEach((b, i) => {
        if (currentQ.options[i].right) b.classList.add('right');
        else if (b === btn) b.classList.add('wrong');
    });
    let wait;
    if (o.right) {
        G.portalsRight++;
        play('correct');
        fb.textContent = 'Isso! Turbo mágico! ✨';
        say('Isso! Turbo mágico!', { rate: 1 });
        wait = 1100;
    } else {
        play('wrong');
        fb.textContent = 'Quase! Era ' + currentQ.answerSpeech.replace(/^\w/, c => c.toUpperCase());
        fb.className = 'q-feedback soft';
        say('Quase! Era ' + currentQ.answerSpeech + '. Vamos continuar!', { rate: 0.95 });
        wait = 1900;
    }
    const right = o.right;
    setTimeout(() => {
        if (!G || G.mode !== 'portal') return;
        document.getElementById('portal-overlay').hidden = true;
        blurFocus();
        G.mode = 'run';
        const p = G.player;
        if (right) {
            p.boostT = 3.2; p.boostMul = 1.75; p.slowT = 0;
            banner('✨ Turbo!');
            for (let i = 0; i < 20; i++) spawn(p.dist, groundY - 60, rand(-200, 200), rand(-200, 100), 0.8, pick(RAINBOW), rand(3, 6), 1);
        }
        p.invuln = Math.max(p.invuln, 1); // nao bate logo depois de voltar
        lastNow = performance.now();
        if (!paused) startLoop();
    }, wait);
}

// ---------- Fim ----------
function endRace() {
    stopLoop();
    const won = G.winner === 'player';
    const total = Math.max(1, G.totalStars);
    const ratio = G.stars / total;
    let rating = 1;
    if (won && ratio >= 0.55) rating = 3;
    else if (won || ratio >= 0.5) rating = 2;
    const name = PLAYERS[opts.who].name;

    const prev = loadData(recordKey(), { stars: 0, rating: 0, wins: 0, races: 0 });
    const rec = {
        stars: Math.max(prev.stars || 0, G.stars),
        rating: Math.max(prev.rating || 0, rating),
        wins: (prev.wins || 0) + (won ? 1 : 0),
        races: (prev.races || 0) + 1
    };
    const newRecord = G.stars > (prev.stars || 0) && (prev.races || 0) > 0;
    saveData(recordKey(), rec);

    document.getElementById('winner-emoji').textContent = won ? '🏆' : '🦄';
    document.getElementById('winner-title').textContent = won ? 'Você venceu!' : 'Quase!';
    document.getElementById('winner-msg').textContent = won
        ? 'Parabéns, ' + (opts.who === 'convidado' ? 'campeão' : name) + '! Seu unicórnio chegou primeiro ao castelo 🏰'
        : 'A ' + RIVAL_NAME + ' chegou primeiro. Na próxima você consegue!';
    document.getElementById('rating').innerHTML = [1, 2, 3].map(i => '<span class="' + (i <= rating ? '' : 'off') + '">⭐</span>').join('');
    document.getElementById('stars-line').textContent = '⭐ ' + G.stars + ' de ' + total + ' estrelas' +
        (G.d.portals ? ' · ✨ ' + G.portalsRight + ' de ' + G.d.portals + ' portais' : '');
    document.getElementById('score-line-end').textContent = (newRecord ? '🎉 Novo recorde! ' : '') + recordText();

    const starsSpoken = G.stars === 1 ? 'uma estrela' : G.stars + ' estrelas';
    const speech = won
        ? 'Você venceu! Parabéns' + (opts.who === 'convidado' ? '' : ', ' + name) + '! Você pegou ' + starsSpoken + '.'
        : 'A ' + RIVAL_NAME + ' chegou primeiro. Quase! Você pegou ' + starsSpoken + '. Vamos de novo?';
    G = null;
    showScreen('result-screen');
    setTimeout(() => say(speech + (newRecord ? ' Novo recorde!' : ''), { rate: 0.95 }), 300);
}

// ==========================================
// Desenho da corrida
// ==========================================
function rivalGround() { return groundY - 44; }

function render() {
    if (!G) return;
    const p = G.player, r = G.rival;
    const c = ctx;
    let camX = p.dist - viewW * 0.28;
    let sx = 0, sy = 0;
    if (G.shake > 0) { sx = rand(-4, 4); sy = rand(-3, 3); }
    c.setTransform(dpr * scale, 0, 0, dpr * scale, sx * dpr * scale, sy * dpr * scale);

    drawBackground(c, camX);
    const roadTop = groundY - 72, roadBottom = groundY + 16;
    drawRoad(c, camX, roadTop, roadBottom);

    // castelo no fim (atras de tudo da pista)
    drawCastle(c, G.L + 70 - camX, roadTop + 6);
    drawFinishLine(c, G.L - camX, roadTop, roadBottom);

    // rival (faixa de tras, um pouco menor)
    const rx = r.dist - camX;
    if (rx > -100 && rx < viewW + 100 && !(r.done && r.dist > G.L + 90)) {
        shadow(c, rx, rivalGround(), 0.8, r.y);
        drawUnicorn(c, rx, rivalGround(), 0.78, r.color, r.phase, r.y, r.blinkT < 0, r.y > 0);
    }

    // itens da faixa do jogador
    const items = G.items;
    let nextObs = null;
    for (let i = G.first; i < items.length; i++) {
        const it = items[i];
        const x = it.x - camX;
        if (x > viewW + 150) break;
        if (x < -150) continue;
        if ((it.type === 'star' || it.type === 'heart') && it.done) continue;
        if (it.type === 'portal' && it.done) continue;
        drawItem(c, it, x);
        if (!nextObs && OBST[it.type] && !it.done && it.x > p.dist) nextObs = it;
    }

    // dica (seta piscando) no Facil
    if (G.d.hint && nextObs && G.mode === 'run' && p.y <= 0) {
        const ahead = nextObs.x - p.dist;
        if (ahead < 330 && ahead > 40) drawHintArrow(c, nextObs.x - camX, groundY - nextObs.h - 40);
    }

    // jogador
    const px = p.dist - camX;
    shadow(c, px, groundY, 1, p.y);
    const flick = p.invuln > 0 && p.slowT <= 0 && Math.floor(G.t * 12) % 2 === 0;
    if (!flick) {
        if (p.slowT > 0) c.globalAlpha = 0.75;
        drawUnicorn(c, px, groundY, 1, COLORS[opts.color], p.phase, p.y, p.blinkT < 0, p.y > 0);
        c.globalAlpha = 1;
    }
    if (p.slowT > 0) drawDizzy(c, px + 40, groundY - p.y - 150);

    drawParticles(c, camX);
}

function drawBackground(c, camX) {
    c.fillStyle = skyGrad;
    c.fillRect(-10, -10, viewW + 20, groundY + 10);
    // sol
    c.fillStyle = 'rgba(255, 236, 153, .55)';
    c.beginPath(); c.arc(viewW - 90, 95, 52, 0, TAU); c.fill();
    c.fillStyle = '#ffe066';
    c.beginPath(); c.arc(viewW - 90, 95, 36, 0, TAU); c.fill();
    // brilhos
    c.fillStyle = '#fff';
    const t = G.t;
    for (let i = 0; i < SPARKS.length; i++) {
        const s = SPARKS[i];
        const a = 0.5 + 0.5 * Math.sin(t * 2.5 + s.p);
        if (a < 0.25) continue;
        const x = ((s.x * (viewW + 40) - camX * 0.05) % (viewW + 40) + viewW + 40) % (viewW + 40) - 20;
        const y = s.y * (groundY - 120);
        const z = 2 + a * 3;
        c.globalAlpha = a;
        c.fillRect(x - z, y - 0.8, z * 2, 1.6);
        c.fillRect(x - 0.8, y - z, 1.6, z * 2);
    }
    c.globalAlpha = 1;
    // nuvens
    const span = Math.max(viewW + 300, 1140);
    c.fillStyle = 'rgba(255,255,255,.9)';
    for (let i = 0; i < CLOUDS.length; i++) {
        const cl = CLOUDS[i];
        const x = ((cl.x - camX * 0.12) % span + span) % span - 150;
        const y = cl.y * Math.min(1, (groundY - 150) / 260);
        cloudShape(c, x, y, 1.1 * cl.s);
    }
    // morros (dois planos)
    hills(c, camX * 0.25, groundY - 72, 120, 60, 0.0045, '#d0bfff');
    hills(c, camX * 0.5, groundY - 72, 70, 40, 0.008, '#b2f2bb');
}

function cloudShape(c, x, y, s) {
    c.beginPath();
    c.arc(x, y, 22 * s, 0, TAU);
    c.arc(x + 24 * s, y - 12 * s, 26 * s, 0, TAU);
    c.arc(x + 50 * s, y, 22 * s, 0, TAU);
    c.rect(x, y - 2 * s, 50 * s, 22 * s);
    c.fill();
}

function hills(c, off, base, height, amp, freq, color) {
    c.fillStyle = color;
    c.beginPath();
    c.moveTo(-10, base + 2);
    for (let x = -10; x <= viewW + 20; x += 20) {
        const w = x + off;
        const y = base - height + amp * 0.5 - Math.sin(w * freq) * amp * 0.6 - Math.sin(w * freq * 2.7 + 1) * amp * 0.25;
        c.lineTo(x, y);
    }
    c.lineTo(viewW + 20, base + 2);
    c.closePath();
    c.fill();
}

function drawRoad(c, camX, top, bottom) {
    const h = (bottom - top) / ROAD_BANDS.length;
    for (let i = 0; i < ROAD_BANDS.length; i++) {
        c.fillStyle = ROAD_BANDS[i];
        c.fillRect(-10, top + i * h, viewW + 20, h + 1);
    }
    // bordas
    c.fillStyle = 'rgba(255,255,255,.9)';
    c.fillRect(-10, top - 3, viewW + 20, 4);
    // faixa entre as raias (tracejada, mostra a velocidade)
    const laneY = groundY - 30;
    const off = -(camX % 70);
    for (let x = off - 70; x < viewW + 70; x += 70) c.fillRect(x, laneY, 36, 4);
    // grama
    c.fillStyle = grassGrad;
    c.fillRect(-10, bottom, viewW + 20, viewH - bottom + 10);
    // florzinhas na grama (passam rapido = sensacao de velocidade)
    const fo = -(camX % 110);
    for (let x = fo - 110, k = Math.floor(camX / 110) - 1; x < viewW + 110; x += 110, k++) {
        const yy = bottom + 14 + ((k * 37) % 3) * 8;
        c.fillStyle = ['#fff', '#ffd43b', '#f783ac'][((k % 3) + 3) % 3];
        c.beginPath(); c.arc(x + ((k * 53) % 40), yy, 4, 0, TAU); c.fill();
    }
}

function shadow(c, x, y, s, height) {
    const k = Math.max(0.35, 1 - height / 260);
    c.fillStyle = 'rgba(80, 40, 120, .18)';
    c.beginPath(); c.ellipse(x + 4 * s, y + 2, 38 * s * k, 7 * s * k, 0, 0, TAU); c.fill();
}

function drawItem(c, it, x) {
    const g = groundY;
    const t = G.t;
    switch (it.type) {
        case 'rock': {
            c.fillStyle = '#868e96';
            c.beginPath();
            c.moveTo(x - 27, g + 2);
            c.quadraticCurveTo(x - 30, g - 34, x - 6, g - 46);
            c.quadraticCurveTo(x + 22, g - 48, x + 28, g + 2);
            c.closePath(); c.fill();
            c.fillStyle = '#adb5bd';
            c.beginPath(); c.ellipse(x - 6, g - 30, 9, 6, -0.4, 0, TAU); c.fill();
            c.fillStyle = '#8ce99a';
            c.beginPath(); c.ellipse(x + 2, g - 44, 12, 4, 0, 0, TAU); c.fill();
            break;
        }
        case 'cloud': {
            // chuva
            c.strokeStyle = '#4dabf7'; c.lineWidth = 3; c.lineCap = 'round';
            const ph = (t * 140) % 24;
            c.beginPath();
            for (let k = -2; k <= 2; k++) {
                const rx = x + k * 13;
                for (let yy = g - 46 + ((ph + k * 7) % 24); yy < g; yy += 24) {
                    c.moveTo(rx, yy); c.lineTo(rx - 2, yy + 9);
                }
            }
            c.stroke();
            // nuvem
            c.fillStyle = '#a5b4cb';
            const cy = g - 60 + Math.sin(t * 2 + it.x) * 3;
            c.beginPath();
            c.arc(x - 22, cy, 17, 0, TAU);
            c.arc(x, cy - 10, 22, 0, TAU);
            c.arc(x + 22, cy, 17, 0, TAU);
            c.rect(x - 22, cy, 44, 16);
            c.fill();
            // rostinho
            c.strokeStyle = '#5c677d'; c.lineWidth = 2;
            c.beginPath();
            c.moveTo(x - 10, cy - 2); c.lineTo(x - 5, cy - 2);
            c.moveTo(x + 5, cy - 2); c.lineTo(x + 10, cy - 2);
            c.moveTo(x - 5, cy + 8); c.quadraticCurveTo(x, cy + 5, x + 5, cy + 8);
            c.stroke();
            break;
        }
        case 'puddle': {
            c.fillStyle = '#74c0fc';
            c.beginPath(); c.ellipse(x, g + 2, 52, 10, 0, 0, TAU); c.fill();
            c.fillStyle = 'rgba(255,255,255,.7)';
            c.beginPath(); c.ellipse(x - 14, g, 14, 3, 0, 0, TAU); c.fill();
            break;
        }
        case 'star': {
            const y = g - it.y + Math.sin(t * 4 + it.x * 0.05) * 4;
            starShape(c, x, y, 14, '#ffd43b', '#f08c00');
            break;
        }
        case 'heart': {
            const y = g - it.y + Math.sin(t * 3 + it.x) * 5;
            const s = 1 + Math.sin(t * 6) * 0.08;
            heartShape(c, x, y, 16 * s);
            break;
        }
        case 'arch': {
            c.lineWidth = 7;
            for (let i = 0; i < RAINBOW.length; i++) {
                c.strokeStyle = RAINBOW[i];
                c.beginPath(); c.arc(x, g, 92 - i * 7, Math.PI, TAU); c.stroke();
            }
            c.fillStyle = '#fff';
            cloudShape(c, x - 112, g - 6, 0.55);
            cloudShape(c, x + 72, g - 6, 0.55);
            break;
        }
        case 'portal': {
            const cy = g - 75;
            c.fillStyle = 'rgba(151, 117, 250, .35)';
            c.beginPath(); c.ellipse(x, cy, 46, 78, 0, 0, TAU); c.fill();
            c.lineWidth = 6;
            for (let i = 0; i < 6; i++) {
                c.strokeStyle = RAINBOW[i];
                const a0 = t * 3 + i * (TAU / 6);
                c.beginPath(); c.ellipse(x, cy, 40, 70, 0, a0, a0 + 0.8); c.stroke();
            }
            c.fillStyle = '#f3f0ff';
            c.beginPath(); c.ellipse(x, cy, 26, 52, 0, 0, TAU); c.fill();
            c.fillStyle = '#7048e8';
            c.font = 'bold 44px "Fredoka One", sans-serif';
            c.textAlign = 'center'; c.textBaseline = 'middle';
            c.fillText('?', x, cy + 2);
            break;
        }
    }
}

const STAR_PTS = [];
for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const rr = i % 2 === 0 ? 1 : 0.45;
    STAR_PTS.push([Math.cos(a) * rr, Math.sin(a) * rr]);
}
function starShape(c, x, y, r, fill, stroke) {
    c.beginPath();
    for (let i = 0; i < 10; i++) {
        const px = x + STAR_PTS[i][0] * r, py = y + STAR_PTS[i][1] * r;
        if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.closePath();
    c.fillStyle = fill; c.fill();
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = 2; c.stroke(); }
}

function heartShape(c, x, y, s) {
    c.fillStyle = '#ff6b9d';
    c.beginPath();
    c.moveTo(x, y + s * 0.9);
    c.bezierCurveTo(x - s * 1.4, y, x - s * 0.8, y - s * 1.1, x, y - s * 0.4);
    c.bezierCurveTo(x + s * 0.8, y - s * 1.1, x + s * 1.4, y, x, y + s * 0.9);
    c.fill();
    c.fillStyle = 'rgba(255,255,255,.7)';
    c.beginPath(); c.arc(x - s * 0.45, y - s * 0.35, s * 0.18, 0, TAU); c.fill();
}

function drawHintArrow(c, x, y) {
    const b = Math.abs(Math.sin(G.t * 8)) * 10;
    c.fillStyle = '#e64980';
    c.strokeStyle = '#fff'; c.lineWidth = 3;
    c.beginPath();
    c.moveTo(x, y - 34 - b);
    c.lineTo(x + 18, y - 12 - b);
    c.lineTo(x + 7, y - 12 - b);
    c.lineTo(x + 7, y + 4 - b);
    c.lineTo(x - 7, y + 4 - b);
    c.lineTo(x - 7, y - 12 - b);
    c.lineTo(x - 18, y - 12 - b);
    c.closePath();
    c.fill(); c.stroke();
}

function drawDizzy(c, x, y) {
    for (let i = 0; i < 3; i++) {
        const a = G.t * 6 + i * TAU / 3;
        starShape(c, x + Math.cos(a) * 18, y + Math.sin(a) * 6, 6, '#ffd43b');
    }
}

function drawFinishLine(c, x, top, bottom) {
    if (x < -60 || x > viewW + 60) return;
    const sq = 11;
    for (let yy = top, row = 0; yy < bottom; yy += sq, row++) {
        for (let k = 0; k < 2; k++) {
            c.fillStyle = (row + k) % 2 ? '#343a40' : '#fff';
            c.fillRect(x + k * sq, yy, sq, sq);
        }
    }
}

function drawCastle(c, x, base) {
    if (x < -260 || x > viewW + 260) return;
    // torres
    const towers = [[-80, 150, 34], [80, 150, 34], [0, 200, 42]];
    c.fillStyle = '#fcc2d7';
    c.fillRect(x - 70, base - 110, 140, 110);
    towers.forEach(tw => {
        c.fillStyle = '#fcc2d7';
        c.fillRect(x + tw[0] - tw[2] / 2, base - tw[1], tw[2], tw[1]);
        c.fillStyle = '#9775fa';
        c.beginPath();
        c.moveTo(x + tw[0] - tw[2] / 2 - 6, base - tw[1]);
        c.lineTo(x + tw[0], base - tw[1] - 48);
        c.lineTo(x + tw[0] + tw[2] / 2 + 6, base - tw[1]);
        c.closePath(); c.fill();
        // bandeirinha
        c.fillStyle = '#ffd43b';
        c.fillRect(x + tw[0] - 1, base - tw[1] - 66, 2, 20);
        c.beginPath();
        c.moveTo(x + tw[0] + 1, base - tw[1] - 66);
        c.lineTo(x + tw[0] + 16, base - tw[1] - 60 + Math.sin(G.t * 5) * 2);
        c.lineTo(x + tw[0] + 1, base - tw[1] - 54);
        c.closePath(); c.fill();
        // janela
        c.fillStyle = '#fff3bf';
        c.beginPath(); c.arc(x + tw[0], base - tw[1] + 30, 7, Math.PI, TAU); c.fill();
        c.fillRect(x + tw[0] - 7, base - tw[1] + 30, 14, 12);
    });
    // ameias
    c.fillStyle = '#f783ac';
    for (let k = -60; k < 70; k += 24) c.fillRect(x + k, base - 122, 14, 14);
    // porta
    c.fillStyle = '#b05a8c';
    c.beginPath(); c.arc(x, base - 38, 24, Math.PI, TAU); c.fill();
    c.fillRect(x - 24, base - 38, 48, 38);
    // coracao na porta
    heartShape(c, x, base - 70, 9);
}

function drawParticles(c, camX) {
    for (let i = 0; i < PARTS.length; i++) {
        const q = PARTS[i];
        if (!q.on) continue;
        const a = q.life / q.max;
        const x = q.x - camX;
        if (x < -20 || x > viewW + 20) continue;
        c.globalAlpha = a;
        c.fillStyle = q.color;
        if (q.kind === 1) {
            starShape(c, x, q.y, q.size * 1.3, q.color);
        } else if (q.kind === 2) {
            c.fillRect(x - q.size / 2, q.y - q.size / 2, q.size, q.size * 0.6);
        } else {
            c.beginPath(); c.arc(x, q.y, q.size, 0, TAU); c.fill();
        }
    }
    c.globalAlpha = 1;
}

// ---------- Inicio ----------
buildSetup();
startPreview();
