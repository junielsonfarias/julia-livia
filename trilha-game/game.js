// ==========================================
// Trilha do Saber - duelo por turnos Julia x Livia
// Acertou a pergunta do seu nivel -> joga o dado e anda. Quem chegar ao fim vence.
// ==========================================

const CELLS = 25;                 // casas 0 (saida) ate 24 (chegada)
const COLS = 5;
const SPECIAL = { 4: 'star', 8: 'swirl', 11: 'gift', 15: 'star', 18: 'swirl', 21: 'gift' };
const SPECIAL_ICON = { star: '⭐', swirl: '🌀', gift: '🎁' };
const P = Duelo.PLAYERS;

const state = { pos: { julia: 0, livia: 0 }, turn: 'julia', busy: false, over: false };

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
function goHome() {
    document.getElementById('score-line').innerHTML = Duelo.scoreText('trilha');
    showScreen('start-screen');
}
const wait = ms => new Promise(r => setTimeout(r, ms));

// Caminho em "cobrinha": linha 0 da esquerda p/ direita, linha 1 da direita p/ esquerda...
function cellIndexToGrid(i) {
    const row = Math.floor(i / COLS);
    const col = row % 2 === 0 ? i % COLS : COLS - 1 - (i % COLS);
    return { row, col };
}

// Figura 3D (Emoji3D) com reserva para o emoji em texto
const fig = (e, cls) => (window.Emoji3D ? Emoji3D.html(e, cls) : e);
const reduzMov = () => (window.Efeitos ? Efeitos.reduzir() : false);

// Tabuleiro montado uma vez: casas (grade), trilha desenhada (SVG por baixo) e camada dos peoes.
// Os peoes andam por cima das casas so com transform, um pulo por casa.
let boardBuilt = false;
function buildBoard() {
    const board = document.getElementById('board');
    const cells = [];
    for (let i = 0; i < CELLS; i++) {
        const { row, col } = cellIndexToGrid(i);
        const sp = SPECIAL[i];
        const label = i === 0 ? fig('🚩') : i === CELLS - 1 ? fig('🏁') : (sp ? fig(SPECIAL_ICON[sp]) : i);
        cells.push(`<div class="cell ${sp || ''} ${i === 0 ? 'start' : ''} ${i === CELLS - 1 ? 'finish' : ''}" data-cell="${i}" style="grid-row:${row + 1};grid-column:${col + 1}">
            <span class="cell-label">${label}</span></div>`);
    }
    const pawns = ['julia', 'livia'].map(p => `<span class="pawn ${p}" data-pid="${p}" style="--pc:${P[p].color}">
        <span class="pawn-shadow"></span><span class="pawn-base"></span><span class="pawn-body">${fig(P[p].emoji)}</span></span>`).join('');
    board.innerHTML = `<svg class="trail-svg" aria-hidden="true"></svg>${cells.join('')}<div class="pawn-layer">${pawns}</div>`;
    boardBuilt = true;
    if (window.ResizeObserver) new ResizeObserver(() => layoutBoard()).observe(board);
    else window.addEventListener('resize', () => layoutBoard());
}

function cellCenter(i) {
    const c = document.querySelector(`#board .cell[data-cell="${i}"]`);
    return c ? { x: c.offsetLeft + c.offsetWidth / 2, y: c.offsetTop + c.offsetHeight / 2, w: c.offsetWidth } : { x: 0, y: 0, w: 0 };
}

// Desenha a trilha de terra (com textura e relevo) ligando os centros das casas. So muda quando o tamanho muda.
function drawTrail() {
    const board = document.getElementById('board');
    const svg = board.querySelector('.trail-svg');
    const W = board.clientWidth, H = board.clientHeight;
    if (!svg || !W) return;
    const pts = [];
    for (let i = 0; i < CELLS; i++) pts.push(cellCenter(i));
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');
    const sw = pts[0].w * 0.46;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.innerHTML = `
        <defs>
            <filter id="tr-terra" x="-5%" y="-5%" width="110%" height="110%">
                <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="4" result="t"/>
                <feColorMatrix in="t" type="matrix" result="pintas" values="0 0 0 0 0.38  0 0 0 0 0.24  0 0 0 0 0.1  2.6 0 0 0 -1.1"/>
                <feComposite in="pintas" in2="SourceGraphic" operator="in" result="p2"/>
                <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="p2"/></feMerge>
            </filter>
            <filter id="tr-sombra" x="-10%" y="-10%" width="120%" height="130%"><feGaussianBlur stdDeviation="${(sw * 0.12).toFixed(1)}"/></filter>
        </defs>
        <path d="${d}" class="tr-shadow" stroke-width="${sw * 1.15}" transform="translate(0 ${(sw * 0.14).toFixed(1)})" filter="url(#tr-sombra)"/>
        <path d="${d}" class="tr-edge" stroke-width="${sw * 1.12}"/>
        <path d="${d}" class="tr-dirt" stroke-width="${sw}" filter="url(#tr-terra)"/>
        <path d="${d}" class="tr-light" stroke-width="${sw * 0.45}" transform="translate(0 ${(-sw * 0.1).toFixed(1)})"/>`;
}

// Posicao dos peoes (duas na mesma casa ficam lado a lado e menores)
function placePawns() {
    const same = state.pos.julia === state.pos.livia;
    ['julia', 'livia'].forEach(pid => {
        const el = document.querySelector(`.pawn[data-pid="${pid}"]`);
        if (!el) return;
        const c = cellCenter(state.pos[pid]);
        const dx = same ? (pid === 'julia' ? -0.2 : 0.2) * c.w : 0;
        if (el.dataset.pos !== undefined && el.dataset.pos !== String(state.pos[pid])) hopPawn(el);
        el.dataset.pos = state.pos[pid];
        el.style.setProperty('--x', (c.x + dx).toFixed(1) + 'px');
        el.style.setProperty('--y', c.y.toFixed(1) + 'px');
        el.classList.toggle('small', same);
        el.classList.toggle('current', pid === state.turn && !state.over);
    });
}

// Redimensionou: redesenha a trilha e reposiciona os peoes sem animar
function layoutBoard() {
    const board = document.getElementById('board');
    if (!boardBuilt || !board.clientWidth) return;
    board.classList.add('no-anim');
    drawTrail();
    placePawns();
    void board.offsetWidth;
    requestAnimationFrame(() => board.classList.remove('no-anim'));
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
            { transform: 'translateY(-50%) scale(.96, 1.05)', offset: 0.5 },
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

function renderBoard() {
    if (!boardBuilt) { buildBoard(); layoutBoard(); }
    placePawns();
    ['julia', 'livia'].forEach(p => { document.getElementById('pos-' + p).textContent = state.pos[p]; });
}

function cellFx(i, kind) {
    const el = document.querySelector(`#board .cell[data-cell="${i}"]`);
    if (!el || !window.Efeitos) return;
    if (kind === 'swirl') Efeitos.balanco(el);
    else { Efeitos.estrelas(el, { quantidade: 16, emoji: kind === 'gift' ? ['🎁', '✨'] : ['⭐', '🌟'] }); Efeitos.pulo(el); KidsAudio.play('sparkle'); }
}

function updateTurnUI() {
    const p = P[state.turn];
    if (boardBuilt) placePawns();
    ['julia', 'livia'].forEach(id => document.getElementById('p-' + id).classList.toggle('active', id === state.turn));
    const banner = document.getElementById('turn-banner');
    banner.textContent = `Vez da ${p.name}!`;
    banner.style.setProperty('--pc', p.color);
    document.getElementById('question').style.setProperty('--pc', p.color);
}

function startGame() {
    // toque duplo em "Revanche": a 2a chamada nao reinicia (nem troca de novo quem comeca)
    if (document.getElementById('game-screen').classList.contains('active') && !state.over) return;
    state.pos = { julia: 0, livia: 0 };
    state.turn = Duelo.nextStarter('trilha');
    state.over = false;
    state.busy = false;
    document.querySelectorAll('#board .pawn').forEach(el => { delete el.dataset.pos; });
    showScreen('game-screen');
    renderBoard();
    layoutBoard();
    KidsAudio.play('start');
    newTurn();
}

// No celular a pergunta fica acima do tabuleiro: rola a tela para o que importa agora
function focusOn(id) {
    if (window.innerWidth > 760) return;
    // Pergunta: volta ao topo (assim "Vez da ..." tambem aparece)
    if (id === 'question') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function newTurn() {
    if (state.over) return;
    focusOn('question');
    updateTurnUI();
    document.getElementById('dice-area').hidden = true;
    const level = Duelo.getLevel(state.turn);
    const q = DueloPerguntas.generate(level);
    const box = document.getElementById('question');
    DueloPerguntas.render(box, q, (ok) => onAnswer(ok, q, level), { hearButton: level !== 'dificil' });
    KidsAudio.play('turn');
    // Para niveis de quem ainda le pouco, a pergunta e falada
    setTimeout(() => KidsAudio.speak(`Vez da ${P[state.turn].name}! ${level !== 'dificil' ? q.speak : ''}`, { rate: 0.9 }), 300);
}

function onAnswer(ok, q, level) {
    if (state.over) return;
    const box = document.getElementById('question');
    if (ok) {
        KidsAudio.play('correct');
        DueloPerguntas.feedback(box, '✅ Acertou! Agora jogue o dado!', 'good');
        KidsAudio.speak('Acertou! Jogue o dado!', { rate: 0.95 });
        document.getElementById('dice-area').hidden = false;
        document.getElementById('dice').textContent = '🎲';
        document.getElementById('roll-btn').disabled = false;
    } else {
        KidsAudio.play('wrong');
        DueloPerguntas.feedback(box, `❌ Não foi dessa vez. ${q.explain || ''}`, 'bad');
        // No nivel facil a explicacao tambem e falada (Livia ainda nao le)
        KidsAudio.speak('Não foi dessa vez! ' + (level === 'facil' && q.explain ? q.explain : ''), { rate: 0.95 });
        setTimeout(() => passTurn(), 2600);
    }
}

async function rollDice() {
    if (state.busy || state.over) return;
    focusOn('board');
    state.busy = true;
    const btn = document.getElementById('roll-btn');
    btn.disabled = true;
    const dice = document.getElementById('dice');
    const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    const p = Duelo.PLAYERS[state.turn];
    // Tela animada do dado (3D, em tela cheia)
    const n = await Dado.roll({ name: p.name, emoji: p.emoji, theme: 'trilha' });
    dice.textContent = faces[n - 1];
    await move(state.turn, n);
    if (state.over) return;

    // Casa especial
    const sp = SPECIAL[state.pos[state.turn]];
    if (sp) cellFx(state.pos[state.turn], sp);
    let again = false;
    if (sp === 'star') {
        KidsAudio.play('star'); KidsAudio.speak('Estrela! Anda mais 2!');
        await wait(900); await move(state.turn, 2);
    } else if (sp === 'swirl') {
        KidsAudio.play('wrong'); KidsAudio.speak('Redemoinho! Volta 3!');
        await wait(900); await move(state.turn, -3);
    } else if (sp === 'gift') {
        KidsAudio.play('star'); KidsAudio.speak('Presente! Joga de novo!');
        again = true;
        await wait(900);
    }
    state.busy = false;
    if (state.over) return;
    if (again) newTurn(); else passTurn();
}

async function move(pid, steps) {
    const dir = steps > 0 ? 1 : -1;
    for (let s = 0; s < Math.abs(steps); s++) {
        state.pos[pid] = Math.max(0, Math.min(CELLS - 1, state.pos[pid] + dir));
        renderBoard();
        // uma nota por casa: sobe quando avanca, desce quando volta
        KidsAudio.note(dir > 0 ? s : Math.max(0, 5 - s), 0.16);
        await wait(HOP_MS + 20);
        if (state.pos[pid] === CELLS - 1) { finish(pid); return; }
    }
}

function passTurn() {
    if (state.over) return;
    state.turn = state.turn === 'julia' ? 'livia' : 'julia';
    newTurn();
}

function finish(winner) {
    state.over = true;
    state.busy = false;
    Duelo.recordResult('trilha', winner);
    const w = P[winner], l = P[winner === 'julia' ? 'livia' : 'julia'];
    document.getElementById('winner-emoji').innerHTML = fig(w.emoji);
    placePawns();
    const fin = document.querySelector(`#board .cell[data-cell="${CELLS - 1}"]`);
    if (fin && window.Efeitos) Efeitos.estrelas(fin, { quantidade: 24, emoji: ['⭐', '✨', '🏆'] });
    document.getElementById('winner-title').textContent = `${w.name} venceu! 🏆`;
    document.getElementById('winner-msg').textContent = `Chegou primeiro ao 🏁! ${l.name} parou na casa ${state.pos[l.id]}.`;
    document.getElementById('score-line-end').innerHTML = Duelo.scoreText('trilha');
    setTimeout(() => {
        showScreen('result-screen');
        KidsAudio.play('win');
        KidsAudio.speak(`${w.name} venceu! Parabéns!`);
        if (window.Efeitos) Efeitos.vitoria();
    }, 700);
}

function speakIntro() {
    KidsAudio.speak('Trilha do saber! Cada uma na sua vez. Responda a pergunta. Acertou? Joga o dado e anda na trilha. ' +
        'A estrela anda mais duas casas. O redemoinho volta três. O presente joga de novo. ' +
        'Quem chegar primeiro na bandeira de chegada vence!', { rate: 0.9 });
}

document.addEventListener('DOMContentLoaded', () => {
    Duelo.mountLevelPickers();
    document.getElementById('score-line').innerHTML = Duelo.scoreText('trilha');
});
