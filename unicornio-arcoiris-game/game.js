// ==========================================
// Arco-iris Magico - Mundo de Julia & Livia
// Ajude o unicornio a montar o arco-iris, faixa por faixa,
// na ordem certa: vermelho, laranja, amarelo, verde, azul, anil, violeta.
// Modos: Pegue as Cores (5 anos), Ordem do Arco-iris, Desafio do Unicornio (4o ano)
// ==========================================

const RAINBOW = [
    { id: 'vermelho', name: 'vermelho', hex: '#ff3b3b' },
    { id: 'laranja',  name: 'laranja',  hex: '#ff9f1a' },
    { id: 'amarelo',  name: 'amarelo',  hex: '#ffe11a' },
    { id: 'verde',    name: 'verde',    hex: '#2ecc40' },
    { id: 'azul',     name: 'azul',     hex: '#1e90ff' },
    { id: 'anil',     name: 'anil',     hex: '#3f3cbb' },
    { id: 'violeta',  name: 'violeta',  hex: '#b84cff' }
];
const EASY_IDS = ['vermelho', 'amarelo', 'verde', 'azul'];
const byId = id => RAINBOW.find(c => c.id === id);

// Cores para a mistura (modo Desafio)
const MIX_COLORS = {
    vermelho: '#ff3b3b', amarelo: '#ffe11a', azul: '#1e90ff', branco: '#ffffff', preto: '#222222',
    verde: '#2ecc40', laranja: '#ff9f1a', roxo: '#9b4dca', rosa: '#ff8fc7', cinza: '#9e9e9e', marrom: '#8d5524'
};
const MIXES = [
    { a: 'azul', b: 'amarelo', r: 'verde' },
    { a: 'vermelho', b: 'amarelo', r: 'laranja' },
    { a: 'vermelho', b: 'azul', r: 'roxo' },
    { a: 'vermelho', b: 'branco', r: 'rosa' },
    { a: 'preto', b: 'branco', r: 'cinza' },
    { a: 'amarelo', b: 'azul', r: 'verde' },
    { a: 'azul', b: 'vermelho', r: 'roxo' },
    { a: 'amarelo', b: 'vermelho', r: 'laranja' }
];

// Figurinhas colecionaveis de unicornio
const STICKERS = [
    { name: 'Rosinha',      body: '#ffffff', m: ['#ff5ea8', '#ff8fc7', '#ffb3d9', '#ff7eb6', '#e84393'], horn: '#f6c945', acc: '🎀', bg: '#ffe3f1' },
    { name: 'Arco-íris',    body: '#ffffff', m: ['#ff3b3b', '#ff9f1a', '#ffe11a', '#2ecc40', '#1e90ff'], horn: '#f6c945', acc: '⭐', bg: '#fff6d6' },
    { name: 'Princesa',     body: '#f6eeff', m: ['#b84cff', '#d39bff', '#8e44ad', '#c56cf0', '#6c5ce7'], horn: '#f6c945', acc: '👑', bg: '#efe3ff' },
    { name: 'Nuvenzinha',   body: '#eef8ff', m: ['#74b9ff', '#a0d8ff', '#4cc3ff', '#0984e3', '#81ecec'], horn: '#ffe08a', acc: '☁️', bg: '#e1f3ff' },
    { name: 'Florzinha',    body: '#ffffff', m: ['#55efc4', '#2ecc71', '#00b894', '#badc58', '#ff7eb6'], horn: '#f6c945', acc: '🌸', bg: '#e3fbef' },
    { name: 'Solzinho',     body: '#fffbea', m: ['#ffb142', '#ffd32a', '#ff9f1a', '#ffe66d', '#ff7f50'], horn: '#ffcf33', acc: '🌻', bg: '#fff3cf' },
    { name: 'Noturna',      body: '#ece8ff', m: ['#3f3cbb', '#6c5ce7', '#2d3436', '#a29bfe', '#5f27cd'], horn: '#f6e58d', acc: '🌙', bg: '#dcd8ff' },
    { name: 'Docinho',      body: '#ffffff', m: ['#fd79a8', '#81ecec', '#ffeaa7', '#a29bfe', '#fab1a0'], horn: '#f6c945', acc: '🍭', bg: '#fff0f6' },
    { name: 'Floco de Neve', body: '#ffffff', m: ['#c7ecee', '#dff9fb', '#7ed6df', '#badcff', '#e0e0ff'], horn: '#dfe6e9', acc: '❄️', bg: '#eefcff' },
    { name: 'Borboleta',    body: '#fff8f0', m: ['#ff7675', '#fdcb6e', '#e17055', '#ff9ff3', '#feca57'], horn: '#f6c945', acc: '🦋', bg: '#ffeede' },
    { name: 'Sereia',       body: '#f0fffb', m: ['#00cec9', '#ff7eb6', '#48dbfb', '#1dd1a1', '#ff9ff3'], horn: '#f6c945', acc: '🐚', bg: '#ddfaf5' },
    { name: 'Dourada',      body: '#fff6d5', m: ['#f9ca24', '#f0932b', '#ffd32a', '#e1b12c', '#ffeaa7'], horn: '#fff200', acc: '💎', bg: '#fff1c2' }
];

const KEY_COLLECTION = 'unicornio_arcoiris_colecao';
const KEY_BEST = 'unicornio_arcoiris_melhor_tempo';

const state = {
    mode: 'catch', easy: false,
    colors: [], step: 0, mistakes: 0, wrongTries: 0,
    locked: true, timers: [], spawnTimer: null, lastLanes: [],
    lastSpeak: 0, prompt: '',
    quiz: null, quizList: [], quizStart: 0, quizTick: null, elapsed: 0,
    galloping: false
};

// ---------- utilidades ----------
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
}

function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
const rand = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

function later(fn, ms) {
    const id = setTimeout(() => {
        state.timers = state.timers.filter(t => t !== id);
        fn();
    }, ms);
    state.timers.push(id);
    return id;
}

function stopAll() {
    state.timers.forEach(clearTimeout);
    state.timers = [];
    clearInterval(state.spawnTimer); state.spawnTimer = null;
    clearInterval(state.quizTick); state.quizTick = null;
    state.galloping = false;
    try { KidsAudio.stop(); } catch (e) {}
}

function say(text, opts) { KidsAudio.speak(text, Object.assign({ rate: 0.9 }, opts || {})); }

function readJSON(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; }
}
function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

function fmtTime(ms) {
    const s = Math.round(ms / 1000);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

function unicornSVG(st, cls) {
    const style = st ? `--body:${st.body};--m1:${st.m[0]};--m2:${st.m[1]};--m3:${st.m[2]};--m4:${st.m[3]};--m5:${st.m[4]};--horn:${st.horn}` : '';
    return `<svg class="${cls || ''}" viewBox="-10 -12 160 132" style="${style}" aria-hidden="true"><use href="#unicorn"/></svg>`;
}

// ---------- tela inicial ----------
function speakIntro() {
    say('Arco-íris mágico! O unicórnio precisa de ajuda para montar o arco-íris, uma cor de cada vez. ' +
        'No balão, pegue as cores: toque no balão da cor que o unicórnio pedir. ' +
        'No arco-íris, monte as cores na ordem certa: vermelho, laranja, amarelo, verde, azul, anil e violeta. ' +
        'No cérebro, é o desafio: responda as perguntas bem rápido. ' +
        'Cada arco-íris pronto ganha uma figurinha de unicórnio para a coleção!', { rate: 0.88 });
}

function renderStart() {
    const owned = readJSON(KEY_COLLECTION, []);
    const row = document.getElementById('sticker-row');
    row.innerHTML = STICKERS.map((st, i) => owned.includes(i)
        ? `<div class="sticker" style="background:${st.bg}" title="${st.name}">${unicornSVG(st)}<span class="acc">${st.acc}</span></div>`
        : `<div class="sticker empty" title="Ainda não ganhou">?</div>`).join('');
    document.getElementById('collection-count').textContent = owned.length + '/' + STICKERS.length;
    const best = readJSON(KEY_BEST, null);
    document.getElementById('best-time').textContent = best ? '🏆 ' + fmtTime(best) : 'sem recorde';
}

function backToMenu() {
    stopAll();
    state.locked = true;
    document.getElementById('hud-bands').textContent = '🦄';
    document.getElementById('hud-timer').hidden = true;
    renderStart();
    showScreen('start-screen');
}

// ---------- arco-iris (SVG) ----------
const CX = 200, CY = 205, R_OUT = 182, R_IN = 62;

function bandGeom(i, n) {
    const w = (R_OUT - R_IN) / n;
    const r = R_OUT - w / 2 - i * w;
    return { r, w };
}
function arcPath(r) { return `M ${CX - r} ${CY} A ${r} ${r} 0 0 1 ${CX + r} ${CY}`; }

function cloudSVG(x, y) {
    return `<g class="cloud" transform="translate(${x} ${y})">
        <ellipse cx="0" cy="6" rx="30" ry="13" fill="#fff"/>
        <circle cx="-14" cy="0" r="13" fill="#fff"/><circle cx="4" cy="-6" r="16" fill="#fff"/><circle cx="20" cy="2" r="11" fill="#fff"/>
    </g>`;
}

function buildRainbow() {
    const n = state.colors.length;
    const svg = document.getElementById('rainbow');
    let html = '';
    state.colors.forEach((c, i) => {
        const { r, w } = bandGeom(i, n);
        html += `<path class="band-empty" d="${arcPath(r)}" stroke-width="${w - 2}"/>`;
        html += `<path class="band-fill" id="band-${i}" d="${arcPath(r)}" stroke="${c.hex}" stroke-width="${w + 0.6}" pathLength="100"/>`;
    });
    html += `<path class="band-glow" d="${arcPath((R_OUT + R_IN) / 2)}" stroke-width="${R_OUT - R_IN + 10}"/>`;
    const mid = (R_OUT + R_IN) / 2;
    html += cloudSVG(CX - mid, CY - 2) + cloudSVG(CX + mid, CY - 2);
    html += `<g id="uni-pos"><g id="uni-rot"><use id="uni-use" href="#unicorn" x="-34" y="-50" width="70" height="58"/></g></g>`;
    svg.innerHTML = html;
    svg.classList.remove('shine');
    placeUnicorn(0, 0);
}

function placeUnicorn(t, rot) {
    const mid = (R_OUT + R_IN) / 2;
    const th = Math.PI * (1 - t);
    const x = CX + mid * Math.cos(th);
    const y = CY - mid * Math.sin(th) - (t === 0 ? 12 : 0);
    const pos = document.getElementById('uni-pos');
    const rotG = document.getElementById('uni-rot');
    if (!pos) return;
    pos.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    rotG.setAttribute('transform', `rotate(${(rot || 0).toFixed(1)})`);
}

function fillBand(i) {
    const p = document.getElementById('band-' + i);
    if (p) p.classList.add('on');
}
function clearBands() {
    document.querySelectorAll('#rainbow .band-fill').forEach(p => p.classList.remove('on'));
}
function hopUnicorn() {
    const g = document.getElementById('uni-use');
    if (!g) return;
    g.classList.remove('hop'); void g.getBoundingClientRect(); g.classList.add('hop');
}

function updateHud() {
    document.getElementById('hud-bands').textContent = '🌈 ' + state.step + '/' + state.colors.length;
}

// ---------- inicio de partida ----------
function startGame(mode, easy) {
    stopAll();
    state.mode = mode;
    state.easy = !!easy;
    state.colors = (mode === 'order' && state.easy) ? EASY_IDS.map(byId) : RAINBOW.slice();
    state.step = 0;
    state.mistakes = 0;
    state.wrongTries = 0;
    state.locked = true;
    buildRainbow();
    document.getElementById('confetti').innerHTML = '';
    ['catch', 'order', 'quiz'].forEach(m => { document.getElementById(m + '-area').hidden = m !== mode; });
    document.getElementById('hud-timer').hidden = mode !== 'quiz';
    updateHud();
    KidsAudio.play('start');
    showScreen('game-screen');
    if (mode === 'catch') startCatch();
    else if (mode === 'order') startOrder();
    else startQuiz();
}

function playAgain() { startGame(state.mode, state.easy); }

function repeatPrompt() {
    KidsAudio.play('click');
    if (state.prompt) say(state.prompt);
}

// ==========================================
// MODO 1: Pegue as Cores
// ==========================================
function startCatch() {
    document.getElementById('sky-field').innerHTML = '';
    state.lastLanes = [];
    setCatchTarget(true);
    // primeiros baloes logo de cara
    later(() => spawnBalloon(true), 300);
    later(() => spawnBalloon(false), 1200);
    state.spawnTimer = setInterval(() => spawnBalloon(false), 1500);
}

function target() { return state.colors[state.step]; }

function setCatchTarget(first) {
    const c = target();
    document.getElementById('catch-dot').style.background = c.hex;
    document.getElementById('catch-text').innerHTML = `Pegue o <b style="color:${c.hex}">${c.name.toUpperCase()}</b>!`;
    state.prompt = `Pegue o ${c.name}!`;
    const intro = first ? 'Ajude o unicórnio a fazer o arco-íris! ' : 'Agora, ';
    say(intro + 'pegue o ' + c.name + '!');
    state.locked = false;
}

function pickLane() {
    const lanes = [0, 1, 2, 3, 4].filter(l => !state.lastLanes.includes(l));
    const l = lanes[Math.floor(Math.random() * lanes.length)];
    state.lastLanes.push(l);
    if (state.lastLanes.length > 2) state.lastLanes.shift();
    return l;
}

function spawnBalloon(forceTarget) {
    const field = document.getElementById('sky-field');
    if (!field || state.mode !== 'catch' || state.step >= state.colors.length) return;
    const live = field.querySelectorAll('.balloon:not(.popped)');
    if (live.length >= 7) return;
    const tgt = target();
    const hasTarget = [...live].some(b => b.dataset.color === tgt.id);
    let c;
    if (forceTarget || !hasTarget || Math.random() < 0.3) c = tgt;
    else {
        const others = state.colors.filter(x => x.id !== tgt.id);
        c = others[Math.floor(Math.random() * others.length)];
    }
    const lane = pickLane();
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'balloon';
    b.dataset.color = c.id;
    b.setAttribute('aria-label', 'balão ' + c.name);
    b.style.setProperty('--c', c.hex);
    b.style.left = (3 + lane * 19 + Math.random() * 4) + '%';
    b.style.animationDuration = (9 + Math.random() * 3).toFixed(1) + 's';
    b.innerHTML = '<span class="balloon-body"></span><span class="balloon-string"></span>';
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); tapBalloon(b); });
    b.addEventListener('animationend', (e) => { if (e.animationName === 'rise') b.remove(); });
    field.appendChild(b);
}

function tapBalloon(b) {
    if (state.locked || b.classList.contains('popped') || b.classList.contains('wobble')) return;
    const tgt = target();
    const c = byId(b.dataset.color);
    if (c.id === tgt.id) {
        state.locked = true;
        b.classList.add('popped');
        sparkleAt(b);
        later(() => b.remove(), 450);
        KidsAudio.play('correct');
        fillBand(state.step);
        hopUnicorn();
        state.step++;
        updateHud();
        if (state.step >= state.colors.length) {
            say(c.name + '! O arco-íris está pronto!');
            later(celebrate, 1200);
        } else {
            say(c.name + '! ' + praise());
            later(() => setCatchTarget(false), 1500);
        }
    } else {
        state.mistakes++;
        b.classList.add('wobble');
        later(() => b.classList.remove('wobble'), 650);
        KidsAudio.play('wrong');
        const now = Date.now();
        if (now - state.lastSpeak > 700) {
            state.lastSpeak = now;
            say(`Esse é o ${c.name}. Procure o ${tgt.name}!`);
        }
    }
}

function praise() {
    const p = ['Muito bem!', 'Isso!', 'Legal!', 'Que lindo!', 'Parabéns!', 'Uau!'];
    return p[Math.floor(Math.random() * p.length)];
}

function sparkleAt(el) {
    const field = el.parentElement;
    if (!field) return;
    const fr = field.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const z = fr.width / (field.offsetWidth || fr.width) || 1;
    const x = (r.left + r.width / 2 - fr.left) / z;
    const y = (r.top + r.height / 3 - fr.top) / z;
    ['✨', '⭐', '💖', '✨', '🌟'].forEach((s, i) => {
        const sp = document.createElement('span');
        sp.className = 'spark';
        sp.textContent = s;
        sp.style.left = x + 'px';
        sp.style.top = y + 'px';
        const ang = (i / 5) * Math.PI * 2;
        sp.style.setProperty('--dx', Math.round(Math.cos(ang) * 60) + 'px');
        sp.style.setProperty('--dy', Math.round(Math.sin(ang) * 60) + 'px');
        field.appendChild(sp);
        setTimeout(() => sp.remove(), 800);
    });
}

// ==========================================
// MODO 2: Ordem do Arco-iris
// ==========================================
function startOrder() {
    const tray = document.getElementById('chip-tray');
    tray.innerHTML = '';
    tray.classList.add('waiting');
    shuffle(state.colors).forEach(c => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'chip-color';
        chip.dataset.color = c.id;
        chip.style.setProperty('--c', c.hex);
        chip.innerHTML = `<span class="chip-swatch"></span><span class="chip-name">${c.name}</span>`;
        setupDrag(chip);
        tray.appendChild(chip);
    });
    // Memoria: mostra o arco-iris completo por um instante e depois apaga
    document.getElementById('order-text').textContent = 'Olhe bem as cores!';
    state.prompt = 'Olhe bem a ordem das cores do arco-íris!';
    say('Olhe bem a ordem das cores do arco-íris!');
    state.colors.forEach((c, i) => later(() => fillBand(i), 200 + i * 160));
    later(() => {
        clearBands();
        tray.classList.remove('waiting');
        document.getElementById('order-text').textContent = 'Agora monte, de cima para baixo!';
        state.prompt = 'Agora monte o arco-íris! Toque na cor que vem primeiro, lá em cima.';
        say(state.prompt);
        state.locked = false;
    }, 200 + state.colors.length * 160 + 3000);
}

function setupDrag(chip) {
    let sx = 0, sy = 0, dragging = false, down = false;
    const zoomOf = () => {
        const scr = document.getElementById('game-screen');
        return parseFloat(scr.style.zoom) || 1;
    };
    chip.addEventListener('pointerdown', (e) => {
        if (state.locked || chip.classList.contains('used')) return;
        down = true; dragging = false;
        sx = e.clientX; sy = e.clientY;
        try { chip.setPointerCapture(e.pointerId); } catch (err) {}
    });
    chip.addEventListener('pointermove', (e) => {
        if (!down) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (!dragging && Math.hypot(dx, dy) > 12) { dragging = true; chip.classList.add('dragging'); }
        if (dragging) {
            const z = zoomOf();
            chip.style.transform = `translate(${dx / z}px, ${dy / z}px) scale(1.12)`;
        }
    });
    const end = (e, cancelled) => {
        if (!down) return;
        down = false;
        chip.classList.remove('dragging');
        chip.style.transform = '';
        if (cancelled) return;
        if (dragging) {
            const st = document.getElementById('stage').getBoundingClientRect();
            const inside = e.clientX >= st.left && e.clientX <= st.right && e.clientY >= st.top && e.clientY <= st.bottom + 30;
            if (inside) tryChip(chip);
        } else {
            tryChip(chip);
        }
    };
    chip.addEventListener('pointerup', (e) => end(e, false));
    chip.addEventListener('pointercancel', (e) => end(e, true));
}

function tryChip(chip) {
    if (state.locked || chip.classList.contains('used') || chip.classList.contains('wobble')) return;
    const want = state.colors[state.step];
    const c = byId(chip.dataset.color);
    if (c.id === want.id) {
        state.locked = true;
        chip.classList.add('used');
        later(() => { chip.hidden = true; }, 320);
        document.querySelectorAll('.chip-color.glow').forEach(x => x.classList.remove('glow'));
        KidsAudio.play('correct');
        fillBand(state.step);
        hopUnicorn();
        state.step++;
        state.wrongTries = 0;
        updateHud();
        if (state.step >= state.colors.length) {
            say(c.name + '! O arco-íris está pronto!');
            later(celebrate, 1200);
        } else {
            say(c.name + '! ' + (state.step === 1 ? 'Qual vem depois?' : praise()));
            state.prompt = 'Qual cor vem depois do ' + c.name + '?';
            later(() => { state.locked = false; }, 550);
        }
    } else {
        state.mistakes++;
        state.wrongTries++;
        chip.classList.add('wobble');
        later(() => chip.classList.remove('wobble'), 650);
        KidsAudio.play('wrong');
        if (state.wrongTries >= 2) {
            const right = document.querySelector(`.chip-color[data-color="${want.id}"]`);
            if (right) right.classList.add('glow');
            say(`Esse é o ${c.name}. Olhe a cor que está brilhando!`);
        } else {
            say(`Esse é o ${c.name}. Ainda não é a vez dele. Tente outra cor!`);
        }
    }
}

// ==========================================
// MODO 3: Desafio do Unicornio
// ==========================================
function makeQuestion(kind, used) {
    for (let tries = 0; tries < 30; tries++) {
        let q;
        if (kind === 'tab') {
            const a = rand(2, 9), b = rand(2, 10), ans = a * b;
            const cand = shuffle([ans + a, ans - a, ans + b, ans - b, ans + 1, ans - 1, ans + 10].filter(v => v > 0 && v !== ans));
            const opts = [...new Set(cand)].slice(0, 3);
            q = { key: `t${Math.min(a, b)}x${Math.max(a, b)}`, tag: 'Tabuada', text: `${a} × ${b} = ?`, speak: `Quanto é ${a} vezes ${b}?`, answer: String(ans), options: shuffle([ans, ...opts]).map(String) };
        } else if (kind === 'frac') {
            const type = rand(0, 3);
            let n, ans, label, spoken;
            if (type <= 1) { n = rand(3, 15) * 2; ans = n / 2; label = `Metade de ${n}`; spoken = `Quanto é a metade de ${n}?`; }
            else if (type === 2) { n = rand(2, 10) * 3; ans = n / 3; label = `Um terço de ${n}`; spoken = `Quanto é um terço de ${n}?`; }
            else { n = rand(2, 10) * 4; ans = n / 4; label = `Um quarto de ${n}`; spoken = `Quanto é um quarto de ${n}?`; }
            const cand = shuffle([ans + 1, ans - 1, ans + 2, ans - 2, n / 2, n, ans * 2].filter(v => v > 0 && v !== ans && Number.isInteger(v)));
            const opts = [...new Set(cand)].slice(0, 3);
            q = { key: 'f' + label, tag: 'Frações', text: label + ' = ?', speak: spoken, answer: String(ans), options: shuffle([ans, ...opts]).map(String) };
        } else {
            const m = MIXES[rand(0, MIXES.length - 1)];
            const pool = shuffle(Object.keys(MIX_COLORS).filter(k => k !== m.r && k !== m.a && k !== m.b && k !== 'branco' && k !== 'preto')).slice(0, 3);
            q = { key: 'm' + m.a + m.b, tag: 'Mistura de cores', mix: m, text: `${m.a} + ${m.b} = ?`, speak: `${m.a} misturado com ${m.b} dá qual cor?`, answer: m.r, options: shuffle([m.r, ...pool]) };
        }
        if (q.options.length === 4 && !used.has(q.key)) { used.add(q.key); return q; }
    }
    return null;
}

function startQuiz() {
    const kinds = shuffle(['tab', 'tab', 'tab', 'frac', 'frac', 'mix', 'mix']);
    const used = new Set();
    state.quizList = kinds.map(k => makeQuestion(k, used) || makeQuestion('tab', used));
    state.elapsed = 0;
    state.quizStart = Date.now();
    updateTimer();
    state.quizTick = setInterval(updateTimer, 250);
    showQuestion();
}

function updateTimer() {
    state.elapsed = Date.now() - state.quizStart;
    document.getElementById('hud-timer').textContent = '⏱ ' + fmtTime(state.elapsed);
}

function showQuestion() {
    const q = state.quizList[state.step];
    state.quiz = q;
    const card = document.getElementById('quiz-card');
    card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop');
    document.getElementById('quiz-tag').textContent = `${q.tag} · faixa ${state.step + 1} de ${state.colors.length}`;
    const qEl = document.getElementById('quiz-question');
    if (q.mix) {
        qEl.innerHTML = `<span class="mix-q"><span class="mix-dot" style="background:${MIX_COLORS[q.mix.a]}"></span><b>${q.mix.a}</b> + <span class="mix-dot" style="background:${MIX_COLORS[q.mix.b]}"></span><b>${q.mix.b}</b> = ?</span>`;
    } else {
        qEl.textContent = q.text;
    }
    const opts = document.getElementById('quiz-options');
    opts.className = 'quiz-options' + (q.mix ? ' colors' : '');
    opts.innerHTML = '';
    q.options.forEach(o => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'quiz-opt';
        b.dataset.value = o;
        if (q.mix) b.innerHTML = `<span class="mix-dot" style="background:${MIX_COLORS[o]}"></span><span>${o}</span>`;
        else b.textContent = o;
        b.addEventListener('click', () => answerQuiz(b));
        opts.appendChild(b);
    });
    state.prompt = q.speak;
    say(q.speak, { rate: 1.0 });
    state.locked = false;
}

function answerQuiz(btn) {
    if (state.locked || btn.disabled) return;
    const q = state.quiz;
    if (btn.dataset.value === q.answer) {
        state.locked = true;
        btn.classList.add('right');
        KidsAudio.play('correct');
        fillBand(state.step);
        hopUnicorn();
        const band = state.colors[state.step];
        state.step++;
        updateHud();
        if (state.step >= state.colors.length) {
            clearInterval(state.quizTick); state.quizTick = null;
            updateTimer();
            say('Certo! O arco-íris está pronto!', { rate: 1.0 });
            later(celebrate, 1100);
        } else {
            say('Certo! Faixa ' + band.name + '!', { rate: 1.05 });
            later(showQuestion, 1000);
        }
    } else {
        state.mistakes++;
        btn.disabled = true;
        btn.classList.add('wrong', 'wobble');
        KidsAudio.play('wrong');
        say('Ops! Tente de novo.', { rate: 1.05 });
    }
}

// ==========================================
// Final: arco-iris brilha e o unicornio galopa
// ==========================================
function celebrate() {
    state.locked = true;
    clearInterval(state.spawnTimer); state.spawnTimer = null;
    document.querySelectorAll('#sky-field .balloon').forEach(b => b.classList.add('popped'));
    document.getElementById('rainbow').classList.add('shine');
    KidsAudio.play('win');
    say('Uau! Que arco-íris lindo! Obrigado pela ajuda!');
    confetti();
    state.galloping = true;
    const t0 = performance.now(), dur = 3000;
    const frame = (now) => {
        if (!state.galloping) return;
        const t = Math.min(1, (now - t0) / dur);
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const th = Math.PI * (1 - e);
        // inclinacao conforme a curva (limitada para nao ficar de ponta-cabeca)
        let rot = Math.atan2(Math.cos(th), Math.sin(th)) * 180 / Math.PI;
        rot = Math.max(-35, Math.min(35, rot));
        const bounce = Math.abs(Math.sin(now / 90)) * 5;
        placeUnicorn(e === 0 ? 0.0001 : e, rot);
        const pos = document.getElementById('uni-pos');
        if (pos) pos.setAttribute('transform', pos.getAttribute('transform') + ` translate(0 ${-bounce.toFixed(1)})`);
        if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    later(showResult, dur + 1300);
}

function confetti() {
    const box = document.getElementById('confetti');
    box.innerHTML = '';
    const items = ['⭐', '✨', '💖', '🌟', '🦄', '🎉', '💜', '💛'];
    for (let i = 0; i < 26; i++) {
        const s = document.createElement('span');
        s.textContent = items[i % items.length];
        s.style.left = Math.random() * 100 + '%';
        s.style.animationDelay = (Math.random() * 1.2).toFixed(2) + 's';
        s.style.fontSize = (1 + Math.random() * 1.2).toFixed(2) + 'rem';
        box.appendChild(s);
    }
}

function starsFor() {
    const m = state.mistakes;
    if (state.mode === 'quiz') return m === 0 ? 3 : m <= 2 ? 2 : 1;
    return m <= 1 ? 3 : m <= 4 ? 2 : 1;
}

function awardSticker() {
    const owned = readJSON(KEY_COLLECTION, []);
    const missing = STICKERS.map((_, i) => i).filter(i => !owned.includes(i));
    if (!missing.length) return { idx: rand(0, STICKERS.length - 1), isNew: false };
    const idx = missing[Math.floor(Math.random() * missing.length)];
    owned.push(idx);
    writeJSON(KEY_COLLECTION, owned);
    return { idx, isNew: true, complete: missing.length === 1 };
}

function showResult() {
    state.galloping = false;
    const stars = starsFor();
    const starsEl = document.getElementById('stars');
    starsEl.innerHTML = [0, 1, 2].map(i => `<span class="star ${i < stars ? 'on' : ''}" style="animation-delay:${0.2 + i * 0.35}s">⭐</span>`).join('');
    for (let i = 0; i < stars; i++) setTimeout(() => KidsAudio.play('star'), 250 + i * 350);

    const msgs = { 3: 'Perfeito! O unicórnio amou o arco-íris!', 2: 'Muito bem! Arco-íris lindo!', 1: 'Você conseguiu! Vamos treinar mais?' };
    document.getElementById('result-title').textContent = 'Arco-íris pronto!';
    document.getElementById('result-msg').textContent = msgs[stars];

    const tl = document.getElementById('time-line');
    let timeSpeech = '';
    if (state.mode === 'quiz') {
        const best = readJSON(KEY_BEST, null);
        const isRecord = !best || state.elapsed < best;
        if (isRecord) writeJSON(KEY_BEST, state.elapsed);
        tl.innerHTML = `⏱ Tempo: <b>${fmtTime(state.elapsed)}</b> · ` +
            (isRecord ? '<span class="record">🏆 Novo recorde!</span>' : `Recorde: ${fmtTime(best)}`);
        tl.hidden = false;
        if (isRecord) timeSpeech = ' Novo recorde!';
    } else {
        tl.hidden = true;
    }

    const prize = awardSticker();
    const st = STICKERS[prize.idx];
    document.getElementById('new-sticker').innerHTML =
        `<div class="sticker big" style="background:${st.bg}">${unicornSVG(st)}<span class="acc">${st.acc}</span></div>
         <div class="sticker-label">${prize.isNew ? 'Figurinha nova' : 'Coleção completa! 🏆'}<br><b>Unicórnio ${st.name}</b></div>`;

    showScreen('result-screen');
    const starWord = stars === 1 ? 'uma estrela' : stars + ' estrelas';
    const prizeSpeech = prize.isNew
        ? ` E ganhou uma figurinha nova: o unicórnio ${st.name}!` + (prize.complete ? ' Você completou a coleção!' : '')
        : ' Sua coleção de figurinhas está completa!';
    say('Você ganhou ' + starWord + '!' + timeSpeech + prizeSpeech);
}

// ---------- inicio ----------
renderStart();
document.addEventListener('visibilitychange', () => {
    if (document.hidden) try { KidsAudio.stop(); } catch (e) {}
});
