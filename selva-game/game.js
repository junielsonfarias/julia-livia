// ==========================================
// Aventura na Selva - jogo de tabuleiro (2 a 4 jogadores)
// Julia, Livia e convidados atravessam a selva ate o Templo Dourado.
// Dado 3D animado a cada jogada, casas com surpresas e desafios
// (perguntas do nivel de cada jogador).
// ==========================================

const CELLS = 36;            // 0 = saida, 35 = Templo Dourado
const COLS = 6;
const EVENTS = {
    3: 'cipo', 5: 'desafio', 7: 'macaco', 9: 'elefante', 11: 'desafio', 13: 'areia',
    15: 'cocos', 17: 'desafio', 19: 'jacare', 21: 'tesouro', 23: 'macaco', 25: 'desafio',
    27: 'cipo', 29: 'areia', 31: 'jacare', 33: 'desafio'
};
const EVENT_INFO = {
    desafio: { emoji: '🗿', title: 'Desafio da Estátua!', text: 'A estátua da selva quer te perguntar: acerte e avance, erre e vai voltar!' },
    macaco: { emoji: '🐒', title: 'Macacos travessos!', text: 'Macacos fazem bagunça sem parar: três casas para trás você vai voltar!' },
    cipo: { emoji: '🌿', title: 'Balançou no cipó!', text: 'Pegue o cipó e balance com coragem: quatro casas à frente nessa viagem!' },
    elefante: { emoji: '🐘', title: 'Carona do elefante!', text: 'O elefante passou e te deu carona: avance três casas, sua campeona!' },
    areia: { emoji: '🌀', title: 'Areia movediça!', text: 'Areia movediça, devagar, devagarinho: fique uma rodada parada no caminho!' },
    cocos: { emoji: '🥥', title: 'Chuva de cocos!', text: 'Chuva de cocos caiu lá do céu: os outros voltam duas casas, que escarcéu!' },
    jacare: { emoji: '🐊', title: 'Rio dos jacarés!', text: 'Os jacarés guardam o rio da floresta: responda certinho para seguir a festa!' },
    tesouro: { emoji: '💎', title: 'Um tesouro!', text: 'Achou um tesouro escondido no chão: jogue de novo, que emoção!' }
};
const GUEST_EMOJIS = ['🦁', '🐯', '🐵', '🦊', '🐸', '🐼', '🐨', '🦄'];
const GUEST_COLORS = ['#e67e22', '#16a085', '#2980b9', '#c0392b'];
const MAX_PLAYERS = 4;

const state = {
    setup: [],          // jogadores escolhidos na preparacao
    players: [],        // { id, name, emoji, color, level, pos, skip }
    turn: 0,
    busy: false,
    over: false
};

// ---------- Utilidades ----------
const sleep = ms => new Promise(r => setTimeout(r, ms));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

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
    window.scrollTo(0, 0);
}
function goSetup() {
    renderSetup();
    document.getElementById('score-line').innerHTML = Duelo.scoreText('selva');
    showScreen('setup-screen');
}
function speakIntro() {
    KidsAudio.speak('Aventura na Selva! Cada um joga o dado na sua vez e anda pela trilha. ' +
        'Cuidado com as surpresas: macacos, areia movediça e jacarés. Na estátua mágica, responda a pergunta para avançar. ' +
        'A cada rodada, você tira uma Carta da Selva: pode ser uma curiosidade, um desafio, um prêmio ou um azar! ' +
        'Quem chegar primeiro ao Templo Dourado vence!', { rate: 0.92 });
}

// ---------- Preparacao (jogadores e convidados) ----------
const SETUP_KEY = 'selva_jogadores_v1';

function defaultSetup() {
    const P = Duelo.PLAYERS;
    return [
        { id: 'julia', name: P.julia.name, emoji: P.julia.emoji, color: P.julia.color, level: Duelo.getLevel('julia'), on: true, fixed: true },
        { id: 'livia', name: P.livia.name, emoji: P.livia.emoji, color: P.livia.color, level: Duelo.getLevel('livia'), on: true, fixed: true }
    ];
}

function loadSetup() {
    try {
        const saved = JSON.parse(localStorage.getItem(SETUP_KEY));
        if (Array.isArray(saved) && saved.length >= 2) {
            // niveis da Julia e da Livia vem sempre da escolha compartilhada dos duelos
            saved.forEach(p => {
                if (!p.fixed || !Duelo.PLAYERS[p.id]) return;
                const P = Duelo.PLAYERS[p.id];
                p.name = P.name; p.emoji = P.emoji; p.color = P.color;
                p.level = Duelo.getLevel(p.id);
            });
            return saved;
        }
    } catch (e) {}
    return defaultSetup();
}
function saveSetup() { try { localStorage.setItem(SETUP_KEY, JSON.stringify(state.setup)); } catch (e) {} }

function renderSetup() {
    const box = document.getElementById('player-setup');
    box.innerHTML = '';
    state.setup.forEach((p, i) => {
        const row = document.createElement('div');
        row.className = 'setup-row' + (p.on ? '' : ' off');
        row.style.setProperty('--pc', p.color);
        row.innerHTML = `
            <button class="setup-toggle" type="button" aria-pressed="${p.on}" title="${p.on ? 'Vai jogar' : 'Não vai jogar'}">${p.on ? '✅' : '⬜'}</button>
            ${p.fixed ? `<span class="setup-emoji">${p.emoji}</span><span class="setup-name">${esc(p.name)}</span>`
                      : `<button class="setup-emoji pick" type="button" title="Trocar bichinho">${p.emoji}</button>
                         <input class="setup-name-input" type="text" maxlength="12" value="${esc(p.name)}" aria-label="Nome do convidado">`}
            <select class="setup-level" aria-label="Nível de ${esc(p.name)}">
                ${Object.entries(Duelo.LEVELS).map(([k, v]) => `<option value="${k}" ${p.level === k ? 'selected' : ''}>${v}</option>`).join('')}
            </select>
            ${p.fixed ? '' : '<button class="setup-remove" type="button" title="Remover convidado">✕</button>'}`;
        row.querySelector('.setup-toggle').onclick = () => { p.on = !p.on; saveSetup(); renderSetup(); KidsAudio.play('select'); };
        row.querySelector('.setup-level').onchange = e => {
            p.level = e.target.value;
            if (p.fixed) Duelo.setLevel(p.id, p.level);
            saveSetup();
        };
        const pickBtn = row.querySelector('.pick');
        if (pickBtn) pickBtn.onclick = () => {
            const used = state.setup.map(x => x.emoji);
            const next = GUEST_EMOJIS.find((e, k) => k > GUEST_EMOJIS.indexOf(p.emoji) && !used.includes(e)) ||
                         GUEST_EMOJIS.find(e => !used.includes(e)) || p.emoji;
            p.emoji = next; saveSetup(); renderSetup(); KidsAudio.play('flip');
        };
        const input = row.querySelector('.setup-name-input');
        if (input) input.oninput = () => { p.name = input.value.trim() || 'Convidado'; saveSetup(); };
        const rm = row.querySelector('.setup-remove');
        if (rm) rm.onclick = () => { state.setup.splice(i, 1); saveSetup(); renderSetup(); };
        box.appendChild(row);
    });
    const count = state.setup.filter(p => p.on).length;
    document.getElementById('add-guest').hidden = state.setup.length >= MAX_PLAYERS;
    const start = document.getElementById('start-btn');
    start.disabled = count < 2;
    start.textContent = count < 2 ? 'Escolha pelo menos 2 jogadores' : `Começar a aventura com ${count} 🌴`;
}

function addGuest() {
    if (state.setup.length >= MAX_PLAYERS) return;
    const used = state.setup.map(p => p.emoji);
    const n = state.setup.filter(p => !p.fixed).length;
    state.setup.push({
        id: 'convidado' + Date.now(), name: 'Convidado ' + (n + 1),
        emoji: GUEST_EMOJIS.find(e => !used.includes(e)) || '🙂',
        color: GUEST_COLORS.find(c => !state.setup.some(p => p.color === c)) || GUEST_COLORS[n % GUEST_COLORS.length],
        level: 'medio', on: true, fixed: false
    });
    saveSetup();
    renderSetup();
    KidsAudio.play('select');
    const inputs = document.querySelectorAll('.setup-name-input');
    if (inputs.length) { inputs[inputs.length - 1].focus(); inputs[inputs.length - 1].select(); }
}

// ---------- Tabuleiro ----------
// Trilha em zigue-zague que SOBE da saida (embaixo) ate o Templo (no alto),
// desenhada em SVG (caminho de terra, rio, atalhos em seta). As casas sao
// pedras redondas por cima do caminho e os peoes deslizam de casa em casa.
const VB = 600;                       // tamanho do desenho (viewBox)
const PITCH = VB / COLS;              // distancia entre casas
const RIVER_ROW = 3;                  // fileira que atravessa o rio (casas 18 a 23)
// Atalhos desenhados: para onde cada casa leva
const JUMPS = { cipo: 4, elefante: 3, macaco: -3 };
const EVENT_EFFECT = {
    desafio: 'Responda certo e avance duas casas.',
    macaco: 'Volta três casas.',
    cipo: 'Avança quatro casas.',
    elefante: 'Avança três casas.',
    areia: 'Fica uma rodada sem jogar.',
    cocos: 'Os outros voltam duas casas.',
    jacare: 'Responda certo para atravessar o rio.',
    tesouro: 'Joga o dado de novo.'
};
let boardBuilt = false;

function cellGrid(i) {
    const row = Math.floor(i / COLS);
    const col = row % 2 === 0 ? i % COLS : COLS - 1 - (i % COLS);
    return { row, col };
}

// Centro da casa no desenho (fileira 0 embaixo)
function cellXY(i) {
    const { row, col } = cellGrid(i);
    return { x: (col + 0.5) * PITCH, y: VB - (row + 0.5) * PITCH };
}

function trailPath() {
    let d = '';
    for (let i = 0; i < CELLS; i++) {
        const { x, y } = cellXY(i);
        if (i === 0) { d += `M${x} ${y}`; continue; }
        const prev = cellXY(i - 1);
        if (prev.y !== y) {
            // Curva na ponta da fileira (para fora, como uma estrada)
            const out = prev.x > VB / 2 ? 46 : -46;
            d += ` C${prev.x + out} ${prev.y} ${x + out} ${y} ${x} ${y}`;
        } else d += ` L${x} ${y}`;
    }
    return d;
}

function jumpArrows() {
    let s = '';
    Object.entries(EVENTS).forEach(([cell, ev]) => {
        if (!JUMPS[ev]) return;
        const from = +cell, to = from + JUMPS[ev];
        if (to < 0 || to >= CELLS) return;
        const a = cellXY(from), b = cellXY(to);
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        // Curva para o lado, para nao passar por cima das casas do meio
        const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
        const bend = 38;
        const cx = mx - dy / len * bend, cy = my + dx / len * bend;
        const good = JUMPS[ev] > 0;
        s += `<path class="jump ${good ? 'up' : 'down'}" d="M${a.x} ${a.y} Q${cx} ${cy} ${b.x} ${b.y}" marker-end="url(#${good ? 'arrow-up' : 'arrow-down'})"/>`;
    });
    return s;
}

// Figura 3D (Emoji3D) com reserva para o emoji em texto
const fig = (e, cls) => (window.Emoji3D ? Emoji3D.html(e, cls) : e);
const reduzMov = () => (window.Efeitos ? Efeitos.reduzir() : false);

// Faixa com bordas onduladas (rio)
function wavyBand(y1, y2, amp) {
    let d = `M-40 ${y1}`;
    for (let x = -40; x < 640; x += 40) d += ` q20 ${-amp} 40 0`;
    d += ` L640 ${y2}`;
    for (let x = 640; x > -40; x -= 40) d += ` q-20 ${amp} -40 0`;
    return d + ' Z';
}

// Enfeites da selva entre as fileiras (posicoes fixas, em % do tabuleiro)
const DECOR = [
    ['🌴', 1, 2, 2.2], ['🌴', 93, 50, 2], ['🌺', 48, 33.3, 1.2], ['🍄', 6, 83.3, 1.2], ['🦜', 86, 16.6, 1.4],
    ['🌿', 30, 66.6, 1.3], ['🦋', 64, 66.6, 1.2], ['🌸', 72, 33.3, 1.1], ['🐍', 20, 33.3, 1.2], ['🌿', 94, 96, 1.3],
    ['🐸', 40, 83.3, 1.1], ['🌴', 1, 50, 1.8]
];

function buildBoard() {
    const board = document.getElementById('board');
    const riverY = VB - (RIVER_ROW + 1) * PITCH;
    const finish = cellXY(CELLS - 1);
    const path = trailPath();
    const rTop = riverY + 10, rH = PITCH - 20;
    let cells = '';
    for (let i = 0; i < CELLS; i++) {
        const { x, y } = cellXY(i);
        const ev = EVENTS[i];
        const kind = i === 0 ? 'start' : i === CELLS - 1 ? 'finish' : ev || 'plain';
        const label = i === 0 ? fig('🚩') : i === CELLS - 1 ? fig('🛕') : ev ? fig(EVENT_INFO[ev].emoji) : i;
        const num = ev ? `<small class="cell-num">${i}</small>` : '';
        cells += `<button type="button" class="cell ${kind}" data-cell="${i}" style="left:${x / VB * 100}%;top:${y / VB * 100}%" aria-label="Casa ${i}${ev ? ': ' + EVENT_INFO[ev].title : ''}"><span class="cell-label">${label}</span>${num}</button>`;
    }
    // Reflexos de luz no rio (fixos) e brilhos que piscam devagar (camada animada)
    let glints = '', twinkles = '';
    for (let k = 0; k < 10; k++) {
        const gx = 10 + k * 64 + (k % 2) * 22, gy = rTop + 12 + (k % 3) * (rH - 24) / 2;
        glints += `<ellipse cx="${gx}" cy="${gy}" rx="${12 + (k % 3) * 7}" ry="2.4"/>`;
        if (k % 3 === 1) twinkles += `<circle class="twinkle" style="animation-delay:${k * 0.45}s" cx="${gx + 16}" cy="${gy}" r="3.2"/>`;
    }
    // Duas camadas: a de baixo (textura, sombra, relevo) e parada e fica numa camada propria
    // (os filtros sao calculados uma vez so); a de cima tem as animacoes leves (ondas, setas, brilho)
    board.innerHTML = `
        <svg class="board-art" viewBox="0 0 ${VB} ${VB}" aria-hidden="true">
            <defs>
                <filter id="manchas" filterUnits="userSpaceOnUse" x="-40" y="-40" width="680" height="680">
                    <feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves="3" seed="7" result="n1"/>
                    <feColorMatrix in="n1" type="matrix" result="escuro"
                        values="0 0 0 0 0.10  0 0 0 0 0.30  0 0 0 0 0.08  1.9 0 0 0 -0.78"/>
                    <feColorMatrix in="n1" type="matrix" result="claro"
                        values="0 0 0 0 0.50  0 0 0 0 0.74  0 0 0 0 0.28  0 1.3 0 0 -0.74"/>
                    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="1" seed="2" result="n2"/>
                    <feColorMatrix in="n2" type="matrix" result="grao"
                        values="0 0 0 0 0.04  0 0 0 0 0.12  0 0 0 0 0.03  0.5 0 0 0 -0.19"/>
                    <feMerge><feMergeNode in="escuro"/><feMergeNode in="claro"/><feMergeNode in="grao"/></feMerge>
                </filter>
                <filter id="terra" x="-5%" y="-5%" width="110%" height="110%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="3" result="t"/>
                    <feColorMatrix in="t" type="matrix" result="pintas"
                        values="0 0 0 0 0.36  0 0 0 0 0.22  0 0 0 0 0.08  2.6 0 0 0 -1.12"/>
                    <feComposite in="pintas" in2="SourceGraphic" operator="in" result="p2"/>
                    <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="p2"/></feMerge>
                </filter>
                <filter id="sombra" x="-10%" y="-10%" width="120%" height="130%"><feGaussianBlur stdDeviation="6"/></filter>
                <linearGradient id="rioGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#14608f"/><stop offset=".3" stop-color="#2f9ad6"/>
                    <stop offset=".55" stop-color="#5cc9f3"/><stop offset=".8" stop-color="#2a8fca"/><stop offset="1" stop-color="#114f7a"/>
                </linearGradient>
            </defs>
            <rect x="-40" y="-40" width="680" height="680" fill="#3a8429"/>
            <rect x="-40" y="-40" width="680" height="680" filter="url(#manchas)"/>
            <path d="${wavyBand(rTop - 8, rTop + rH + 8, 5)}" fill="#c4a062"/>
            <path d="${wavyBand(rTop - 3, rTop + rH + 3, 4)}" fill="#8a6a35" opacity=".55"/>
            <path d="${wavyBand(rTop, rTop + rH, 4)}" fill="url(#rioGrad)"/>
            <g class="glints" fill="#fff" opacity=".45">${glints}</g>
            <path class="trail-shadow" d="${path}" filter="url(#sombra)"/>
            <path class="trail-edge" d="${path}"/>
            <path class="trail-dirt" d="${path}" filter="url(#terra)"/>
            <path class="trail-light" d="${path}"/>
            <path class="trail-dash" d="${path}"/>
        </svg>
        <svg class="trail" viewBox="0 0 ${VB} ${VB}" aria-hidden="true">
            <defs>
                <pattern id="waves" width="40" height="14" patternUnits="userSpaceOnUse">
                    <path d="M0 7 Q10 0 20 7 T40 7" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="2.2"/>
                </pattern>
                <marker id="arrow-up" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                    <path d="M0 0 L10 5 L0 10 z" fill="#d4ffb0"/></marker>
                <marker id="arrow-down" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                    <path d="M0 0 L10 5 L0 10 z" fill="#ffc2ad"/></marker>
                <radialGradient id="templeGlow"><stop offset="0" stop-color="#fff59d" stop-opacity=".95"/><stop offset="1" stop-color="#fff59d" stop-opacity="0"/></radialGradient>
                <clipPath id="rioClip"><rect x="-40" y="${rTop}" width="680" height="${rH}"/></clipPath>
            </defs>
            <g clip-path="url(#rioClip)"><rect class="river-waves" x="-80" y="${rTop + 4}" width="${VB + 160}" height="${rH - 8}" fill="url(#waves)"/></g>
            <g class="twinkles" fill="#fff">${twinkles}</g>
            <circle class="temple-glow" cx="${finish.x}" cy="${finish.y}" r="${PITCH * 0.95}" fill="url(#templeGlow)"/>
            ${jumpArrows()}
        </svg>
        <div class="decor" aria-hidden="true">${DECOR.map(([e, l, t, s]) => `<span style="left:${l}%;top:${t}%;font-size:${s}em">${fig(e)}</span>`).join('')}</div>
        ${cells}
        <div class="pawn-layer" id="pawn-layer"></div>`;
    board.querySelectorAll('.cell').forEach(c => c.addEventListener('click', () => explainCell(+c.dataset.cell)));
    boardBuilt = true;
}

// Tocar numa casa: a voz conta o que ela faz (para quem ainda nao le)
function explainCell(i) {
    const ev = EVENTS[i];
    let text;
    if (i === 0) text = 'Saída! Todos começam aqui.';
    else if (i === CELLS - 1) text = 'Templo Dourado! Quem chegar aqui primeiro vence.';
    else if (ev) text = `${EVENT_INFO[ev].title} ${EVENT_EFFECT[ev]}`;
    else text = `Casa ${i}.`;
    flashCell(i, 'peek');
    KidsAudio.speak(text, { rate: 0.95 });
}

function flashCell(i, cls) {
    const el = document.querySelector(`.cell[data-cell="${i}"]`);
    if (!el) return;
    el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), 1200);
}

// Peoes: um elemento por jogador, que desliza ate a casa nova
const PAWN_SPOTS = {
    1: [[0, 0]],
    2: [[-0.22, 0], [0.22, 0]],
    3: [[-0.22, -0.18], [0.22, -0.18], [0, 0.2]],
    4: [[-0.22, -0.2], [0.22, -0.2], [-0.22, 0.2], [0.22, 0.2]]
};

function updatePawns() {
    const layer = document.getElementById('pawn-layer');
    if (!layer) return;
    const cur = state.players[state.turn];
    // jogadores que nao estao nesta partida (nova partida com outros jogadores)
    layer.querySelectorAll('.pawn').forEach(el => {
        if (!state.players.some(p => p.id === el.dataset.pid)) el.remove();
    });
    state.players.forEach(p => {
        let el = layer.querySelector(`[data-pid="${p.id}"]`);
        if (!el) {
            el = document.createElement('span');
            el.className = 'pawn';
            el.dataset.pid = p.id;
            el.innerHTML = `<span class="pawn-shadow"></span><span class="pawn-base"></span><span class="pawn-body">${fig(p.emoji)}</span>`;
            el.title = p.name;
            el.style.setProperty('--pc', p.color);
            layer.appendChild(el);
        }
        const here = state.players.filter(o => o.pos === p.pos);
        const spot = PAWN_SPOTS[Math.min(4, here.length)][here.indexOf(p)] || [0, 0];
        const { x, y } = cellXY(p.pos);
        if (el.dataset.pos !== undefined && el.dataset.pos !== String(p.pos)) hopPawn(el);
        el.dataset.pos = p.pos;
        // posicao em cqw (o tabuleiro e quadrado): move so com transform, sem recalcular o layout
        el.style.setProperty('--x', ((x + spot[0] * PITCH) / VB * 100).toFixed(2));
        el.style.setProperty('--y', ((y + spot[1] * PITCH) / VB * 100).toFixed(2));
        el.classList.toggle('small', here.length > 2);
        el.classList.toggle('current', p === cur && !state.over);
    });
}

// Pulo de uma casa: agacha, estica no ar, achata ao cair (squash & stretch); a sombra encolhe no alto
const HOP_MS = 330;
function hopPawn(el) {
    if (reduzMov() || !el.animate) return;
    const body = el.querySelector('.pawn-body'), shadow = el.querySelector('.pawn-shadow');
    try {
        body.animate([
            { transform: 'translateY(0) scale(1.14, .84)' },
            { transform: 'translateY(-12%) scale(.88, 1.14)', offset: 0.18 },
            { transform: 'translateY(-46%) scale(.96, 1.05)', offset: 0.5 },
            { transform: 'translateY(0) scale(1.16, .82)', offset: 0.84 },
            { transform: 'translateY(0) scale(1, 1)' }
        ], { duration: HOP_MS, easing: 'linear' });
        shadow.animate([
            { transform: 'scale(1.1)', opacity: 1 },
            { transform: 'scale(.55)', opacity: 0.45, offset: 0.5 },
            { transform: 'scale(1.15)', opacity: 1, offset: 0.84 },
            { transform: 'scale(1)', opacity: 1 }
        ], { duration: HOP_MS, easing: 'ease-in-out' });
    } catch (e) {}
}

function cellEl(i) { return document.querySelector(`.cell[data-cell="${i}"]`); }
function pawnEl(p) { return document.querySelector(`.pawn[data-pid="${p.id}"]`); }

function renderBoard() {
    if (!boardBuilt || !document.getElementById('pawn-layer')) buildBoard();
    renderRanking();
}

function renderRanking() {
    const cur = state.players[state.turn];
    updatePawns();
    document.getElementById('ranking').innerHTML = state.players.map(p => `
        <div class="rank-row ${p === cur ? 'current' : ''}" style="--pc:${p.color}">
            <span class="rank-emoji">${p.emoji}</span><span class="rank-name">${esc(p.name)}${p.skip ? ' 🌀' : ''}${p.shield ? ' 🛡️' : ''}${p.web ? ' 🕸️' : ''}${(p.statuses || []).map(st => ` <span class="badge-status" title="Desafio">${st.icon}${st.rounds}</span>`).join('')}</span>
            <span class="rank-pos">casa ${p.pos}</span>
            <span class="rank-bar"><i style="width:${Math.round(p.pos / (CELLS - 1) * 100)}%"></i></span></div>`).join('');
}

// ---------- Fluxo do jogo ----------
function startGame() {
    const chosen = state.setup.filter(p => p.on);
    if (chosen.length < 2) return;
    // toque duplo em "Jogar de novo": a 2a chamada nao reinicia a partida que acabou de comecar
    if (document.getElementById('game-screen').classList.contains('active') && !state.over) return;
    state.players = chosen.map(p => ({ id: p.id, name: p.name, emoji: p.emoji, color: p.color, level: p.level, pos: 0, skip: false, statuses: [], shield: false, web: false }));
    // Alterna entre Julia e Livia quem comeca; convidados entram na sequencia
    // (se so uma delas joga, ela comeca; se nenhuma joga, o primeiro convidado)
    const hasJulia = state.players.some(p => p.id === 'julia');
    const hasLivia = state.players.some(p => p.id === 'livia');
    const starter = hasJulia && hasLivia ? Duelo.nextStarter('selva') : (hasJulia ? 'julia' : 'livia');
    const idx = state.players.findIndex(p => p.id === starter);
    state.turn = idx >= 0 ? idx : 0;
    state.over = false;
    state.busy = false;
    renderBoard();
    showScreen('game-screen');
    KidsAudio.play('start');
    beginTurn();
}

function beginTurn(note) {
    if (state.over) return;
    const p = state.players[state.turn];
    renderRanking();
    const who = document.getElementById('turn-who');
    who.innerHTML = `<span class="who-emoji">${fig(p.emoji)}</span> Vez de <b>${esc(p.name)}</b>`;
    document.getElementById('turn-card').style.setProperty('--pc', p.color);
    const btn = document.getElementById('roll-btn');
    if (p.skip) {
        p.skip = false;
        btn.disabled = true;
        setMsg(`🌀 ${esc(p.name)} ainda está na areia movediça e perde esta vez.`);
        KidsAudio.speak(`${p.name} ainda está presa na areia movediça!`, { rate: 0.95 });
        setTimeout(nextTurn, 2600);
        return;
    }
    const enable = () => {
        btn.disabled = false;
        setMsg((note ? note + '<br>' : '') + 'Toque em <b>Jogar o dado</b>!');
        KidsAudio.play('turn');
        KidsAudio.speak(`Vez de ${p.name}!`, { rate: 0.95, interrupt: false });
    };
    if (p.statuses && p.statuses.length) {
        // Desafios de varias rodadas (silencio, flamingo...) que terminam nesta vez
        btn.disabled = true;
        state.busy = true;
        resolveStatuses(p).then(() => {
            state.busy = false;
            if (state.over) return;
            renderRanking();
            enable();
        });
        return;
    }
    enable();
}

function setMsg(html) { document.getElementById('turn-msg').innerHTML = html; }

async function rollTurn() {
    if (state.busy || state.over) return;
    state.busy = true;
    const btn = document.getElementById('roll-btn');
    btn.disabled = true;
    const p = state.players[state.turn];
    let n = await Dado.roll({ name: p.name, emoji: p.emoji, theme: 'selva' });
    if (p.web) {
        p.web = false;
        const half = Math.max(1, Math.ceil(n / 2));
        setMsg(`🕸️ ${p.emoji} tirou ${n}, mas a teia segura: anda só <b>${half}</b>.`);
        n = half;
        renderRanking();
        await sleep(900);
    } else setMsg(`${p.emoji} tirou <b>${n}</b>!`);
    await move(p, n);
    if (state.over) return;
    let again = await landOn(p);
    if (state.over) return;
    // Carta da Selva da rodada (curiosidade, frase, desafio, premio ou consequencia)
    await sleep(300);
    if (await drawCard(p)) again = true;
    state.busy = false;
    if (state.over) return;
    if (again) beginTurn(`💎 ${esc(p.name)} joga de novo!`);
    else nextTurn();
}

async function move(p, steps) {
    const dir = steps > 0 ? 1 : -1;
    for (let s = 0; s < Math.abs(steps); s++) {
        const next = p.pos + dir;
        if (next < 0 || next > CELLS - 1) break;
        p.pos = next;
        renderBoard();
        // uma nota por casa: sobe quando avanca, desce quando volta
        KidsAudio.note(dir > 0 ? s : Math.max(0, 5 - s), 0.16);
        await sleep(HOP_MS + 20);
        if (p.pos === CELLS - 1) { finish(p); return; }
    }
}

// Mostra a tela do evento e espera o "Continuar" (ou a resposta da pergunta)
function showEvent(ev, extra) {
    return new Promise(resolve => {
        const info = EVENT_INFO[ev];
        const ov = document.getElementById('event-overlay');
        const card = document.getElementById('event-card');
        document.getElementById('event-emoji').innerHTML = fig(info.emoji);
        document.getElementById('event-title').textContent = info.title;
        document.getElementById('event-text').textContent = info.text;
        card.className = 'event-card ev-' + ev;
        const qBox = document.getElementById('event-question');
        const ok = document.getElementById('event-ok');
        qBox.hidden = true;
        ok.hidden = false;
        ov.hidden = false;
        KidsAudio.play(['macaco', 'areia', 'cocos'].includes(ev) ? 'wrong' : 'star');
        KidsAudio.speak(info.title + ' ' + info.text, { rate: 0.95 });
        if (extra && extra.question) {
            ok.hidden = true;
            const p = extra.player;
            const q = DueloPerguntas.generate(p.level);
            qBox.hidden = false;
            qBox.style.setProperty('--pc', p.color);
            DueloPerguntas.render(qBox, q, correct => {
                KidsAudio.play(correct ? 'correct' : 'wrong');
                DueloPerguntas.feedback(qBox, correct ? '✅ Acertou!' : `❌ ${q.explain || 'Não foi dessa vez.'}`, correct ? 'good' : 'bad');
                // interrompe o texto/pergunta ainda na fila: senao o "Acertou!" so tocaria depois
                // e seria cortado pelo "Vez de ..." do proximo jogador
                if (p.level !== 'dificil') KidsAudio.speak(correct ? 'Acertou!' : 'Não foi dessa vez!');
                setTimeout(() => { ov.hidden = true; resolve(correct); }, correct ? 1300 : 2600);
            }, { hearButton: p.level !== 'dificil' });
            if (p.level !== 'dificil') setTimeout(() => KidsAudio.speak(q.speak, { rate: 0.85, interrupt: false }), 200);
        } else {
            ok.onclick = () => { ov.hidden = true; resolve(true); };
        }
    });
}

// Efeitos da casa especial: estrelas nas boas, balanco nas travessas, brilho nos desafios
const GOOD_EVENTS = { cipo: ['🌿', '⭐'], elefante: ['🐘', '⭐'], tesouro: ['💎', '✨'] };
function cellFx(i, ev) {
    const el = cellEl(i);
    if (!el || !window.Efeitos) return;
    if (GOOD_EVENTS[ev]) { Efeitos.estrelas(el, { quantidade: 16, emoji: GOOD_EVENTS[ev] }); Efeitos.pulo(el); KidsAudio.play('sparkle'); }
    else if (ev === 'desafio' || ev === 'jacare') Efeitos.brilho(el);
    else Efeitos.balanco(el);
}
function pawnFx(p) {
    const el = pawnEl(p);
    if (el && window.Efeitos) Efeitos.acerto(el.querySelector('.pawn-body'), { emoji: ['⭐', '🌟'] });
}

// Resolve a casa onde caiu. Devolve true se joga de novo.
async function landOn(p) {
    flashCell(p.pos, 'landed');
    const ev = EVENTS[p.pos];
    if (!ev) return false;
    cellFx(p.pos, ev);
    await sleep(250);
    if (ev === 'desafio' || ev === 'jacare') {
        const correct = await showEvent(ev, { question: true, player: p });
        if (ev === 'desafio') {
            if (correct) { setMsg(`🗿 ${esc(p.name)} acertou e avança 2!`); pawnFx(p); await move(p, 2); }
            else { setMsg(`🗿 ${esc(p.name)} errou e volta 2.`); await move(p, -2); }
        } else {
            if (correct) { setMsg(`🐊 ${esc(p.name)} atravessou o rio!`); pawnFx(p); }
            else { setMsg(`🐊 Os jacarés assustaram ${esc(p.name)}: volta 4.`); await move(p, -4); }
        }
        return false;
    }
    await showEvent(ev);
    if (['macaco', 'areia'].includes(ev) && useShield(p)) return false;
    if (ev === 'macaco') await move(p, -3);
    else if (ev === 'cipo') await move(p, 4);
    else if (ev === 'elefante') await move(p, 3);
    else if (ev === 'areia') { p.skip = true; renderRanking(); }
    else if (ev === 'cocos') {
        state.players.filter(o => o !== p).forEach(o => { if (!useShield(o)) o.pos = Math.max(0, o.pos - 2); });
        renderBoard();
    } else if (ev === 'tesouro') return true;
    return false;
}

function nextTurn() {
    if (state.over) return;
    state.turn = (state.turn + 1) % state.players.length;
    beginTurn();
}

function finish(winner) {
    state.over = true;
    state.busy = false;
    const te = cellEl(CELLS - 1);
    if (te && window.Efeitos) { Efeitos.estrelas(te, { quantidade: 24, emoji: ['⭐', '✨', '🏆'] }); KidsAudio.play('sparkle'); }
    document.getElementById('event-overlay').hidden = true;
    const key = (winner.id === 'julia' || winner.id === 'livia') ? winner.id : 'convidado';
    Duelo.recordResult('selva', key);
    const sorted = state.players.slice().sort((a, b) => b.pos - a.pos);
    document.getElementById('winner-emoji').innerHTML = fig(winner.emoji);
    document.getElementById('winner-title').textContent = `${winner.name} chegou ao Templo Dourado! 🏆`;
    document.getElementById('winner-msg').textContent = 'Que aventura! A selva inteira está comemorando!';
    document.getElementById('final-ranking').innerHTML = sorted.map((p, i) =>
        `<div class="final-row" style="--pc:${p.color}"><b>${['🥇', '🥈', '🥉', '🏅'][i]}</b> ${p.emoji} ${esc(p.name)} <span>casa ${p.pos}</span></div>`).join('');
    document.getElementById('score-line-end').innerHTML = Duelo.scoreText('selva');
    setTimeout(() => {
        showScreen('result-screen');
        KidsAudio.play('win');
        KidsAudio.speak(`${winner.name} venceu a Aventura na Selva!`);
        if (window.Efeitos) {
            Efeitos.vitoria();
            Efeitos.estrelas(document.getElementById('winner-emoji'), { quantidade: 18, emoji: ['🌺', '🍃', '🦋', '💎'] });
        }
    }, 600);
}

document.addEventListener('DOMContentLoaded', () => {
    state.setup = loadSetup();
    renderSetup();
    document.getElementById('score-line').innerHTML = Duelo.scoreText('selva');
});
