// ==========================================
// Jogo da Velha do Saber - duelo Julia x Livia
// Escolhe a casa -> responde pergunta do seu nivel -> acertou, a casa e sua.
// ==========================================

const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const P = Duelo.PLAYERS;
const state = { cells: Array(9).fill(null), turn: 'julia', busy: false, over: false, pending: null };

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
    document.getElementById('score-line').innerHTML = Duelo.scoreText('velha');
    showScreen('start-screen');
}

function renderBoard(winLine) {
    const box = document.getElementById('ttt');
    box.innerHTML = '';
    state.cells.forEach((owner, i) => {
        const b = document.createElement('button');
        b.className = 'ttt-cell' + (owner ? ' ' + owner : '') + (winLine && winLine.includes(i) ? ' win' : '');
        b.textContent = owner ? P[owner].emoji : '';
        b.setAttribute('aria-label', owner ? `Casa de ${P[owner].name}` : `Casa ${i + 1} vazia`);
        b.disabled = !!owner || state.over;
        b.onclick = () => chooseCell(i);
        box.appendChild(b);
    });
}

function updateTurnUI() {
    const p = P[state.turn];
    ['julia', 'livia'].forEach(id => document.getElementById('p-' + id).classList.toggle('active', id === state.turn));
    const banner = document.getElementById('turn-banner');
    banner.textContent = `Vez da ${p.name}!`;
    banner.style.setProperty('--pc', p.color);
    document.getElementById('ttt').style.setProperty('--pc', p.color);
}

function startGame() {
    state.cells = Array(9).fill(null);
    state.turn = Duelo.nextStarter('velha');
    state.busy = false;
    state.over = false;
    document.getElementById('q-overlay').hidden = true;
    renderBoard();
    updateTurnUI();
    showScreen('game-screen');
    KidsAudio.play('start');
    announce();
}

function announce() {
    KidsAudio.play('turn');
    KidsAudio.speak(`Vez da ${P[state.turn].name}! Escolha uma casa.`, { rate: 0.95 });
}

function chooseCell(i) {
    if (state.busy || state.over || state.cells[i]) return;
    state.busy = true;
    state.pending = i;
    document.querySelectorAll('.ttt-cell')[i].classList.add('picked');
    KidsAudio.play('select');
    const level = Duelo.getLevel(state.turn);
    const q = DueloPerguntas.generate(level);
    const box = document.getElementById('question');
    box.style.setProperty('--pc', P[state.turn].color);
    DueloPerguntas.render(box, q, ok => onAnswer(ok, q), { hearButton: level !== 'dificil' });
    document.getElementById('q-overlay').hidden = false;
    if (level !== 'dificil') setTimeout(() => KidsAudio.speak(q.speak, { rate: 0.85 }), 250);
}

function onAnswer(ok, q) {
    const box = document.getElementById('question');
    if (ok) {
        KidsAudio.play('correct');
        DueloPerguntas.feedback(box, '✅ Acertou! A casa é sua!', 'good');
        state.cells[state.pending] = state.turn;
    } else {
        KidsAudio.play('wrong');
        DueloPerguntas.feedback(box, `❌ Não foi dessa vez. ${q.explain || ''}`, 'bad');
    }
    setTimeout(() => {
        document.getElementById('q-overlay').hidden = true;
        state.busy = false;
        const win = LINES.find(l => l.every(c => state.cells[c] === state.turn));
        if (win) return finish(state.turn, win);
        if (state.cells.every(Boolean)) return finish('empate');
        state.turn = state.turn === 'julia' ? 'livia' : 'julia';
        renderBoard();
        updateTurnUI();
        announce();
    }, ok ? 1100 : 2400);
}

function finish(winner, line) {
    state.over = true;
    renderBoard(line);
    Duelo.recordResult('velha', winner);
    if (winner === 'empate') {
        document.getElementById('winner-emoji').textContent = '🤝';
        document.getElementById('winner-title').textContent = 'Deu velha! Empate!';
    } else {
        document.getElementById('winner-emoji').textContent = P[winner].emoji;
        document.getElementById('winner-title').textContent = `${P[winner].name} venceu! 🏆`;
    }
    document.getElementById('score-line-end').innerHTML = Duelo.scoreText('velha');
    KidsAudio.play('win');
    setTimeout(() => {
        showScreen('result-screen');
        KidsAudio.speak(winner === 'empate' ? 'Deu velha! Empate!' : `${P[winner].name} venceu! Parabéns!`);
    }, 1400);
}

document.addEventListener('DOMContentLoaded', () => {
    Duelo.mountLevelPickers();
    document.getElementById('score-line').innerHTML = Duelo.scoreText('velha');
});
