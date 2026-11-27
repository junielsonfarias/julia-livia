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

function renderBoard() {
    const board = document.getElementById('board');
    const cells = [];
    for (let i = 0; i < CELLS; i++) {
        const { row, col } = cellIndexToGrid(i);
        const sp = SPECIAL[i];
        const label = i === 0 ? '🚩' : i === CELLS - 1 ? '🏁' : (sp ? SPECIAL_ICON[sp] : i);
        const pawns = ['julia', 'livia'].filter(p => state.pos[p] === i).map(p => `<span class="pawn ${p}">${P[p].emoji}</span>`).join('');
        cells.push(`<div class="cell ${sp || ''} ${i === 0 ? 'start' : ''} ${i === CELLS - 1 ? 'finish' : ''}" style="grid-row:${row + 1};grid-column:${col + 1}">
            <span class="cell-label">${label}</span><span class="pawns">${pawns}</span></div>`);
    }
    board.innerHTML = cells.join('');
    ['julia', 'livia'].forEach(p => { document.getElementById('pos-' + p).textContent = state.pos[p]; });
}

function updateTurnUI() {
    const p = P[state.turn];
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
    renderBoard();
    showScreen('game-screen');
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
        KidsAudio.play('click');
        await wait(260);
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
    document.getElementById('winner-emoji').textContent = w.emoji;
    document.getElementById('winner-title').textContent = `${w.name} venceu! 🏆`;
    document.getElementById('winner-msg').textContent = `Chegou primeiro ao 🏁! ${l.name} parou na casa ${state.pos[l.id]}.`;
    document.getElementById('score-line-end').innerHTML = Duelo.scoreText('trilha');
    setTimeout(() => {
        showScreen('result-screen');
        KidsAudio.play('win');
        KidsAudio.speak(`${w.name} venceu! Parabéns!`);
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
