// ==========================================
// Jogo da Velha do Saber - duelo Julia x Livia
// Escolhe a casa -> responde pergunta do seu nivel -> acertou, a casa e sua.
// Opcao "Melhor de 3": quem vencer 2 partidas leva a serie.
// ==========================================

const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
const P = Duelo.PLAYERS;
const state = {
    cells: Array(9).fill(null), turn: 'julia', busy: false, over: false, pending: null, gameId: 0,
    series: null          // { julia, livia, games } quando "Melhor de 3" esta ligado
};

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
    state.gameId++;
    state.series = null;
    document.getElementById('score-line').innerHTML = Duelo.scoreText('velha');
    showScreen('start-screen');
}

function speakIntro() {
    KidsAudio.speak('Jogo da velha do saber! Na sua vez, toque numa casa vazia e responda a pergunta. ' +
        'Acertou? A casa fica com a sua figura. Errou? Passa a vez. ' +
        'Quem fizer uma linha de três figuras iguais vence!', { rate: 0.9 });
}

// Figura 3D (Emoji3D) com reserva para o emoji em texto
const fig = (e, cls) => (window.Emoji3D ? Emoji3D.html(e, cls) : e);

// Peca: anel desenhado a traco (stroke-dashoffset) na cor da jogadora + figura 3D que "cai" na casa.
// So a peca recem-colocada (state.justPlaced) anima; as outras ja aparecem prontas.
function pieceHTML(owner, fresh) {
    return `<span class="piece${fresh ? ' fresh' : ''}" style="--pc:${P[owner].color}">
        <svg class="ring" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42" pathLength="100"/></svg>
        <span class="fig">${fig(P[owner].emoji)}</span></span>`;
}

// Linha da vitoria: traco de luz que se desenha por cima das 3 casas
function drawWinLine(line) {
    const box = document.getElementById('ttt');
    const cells = box.querySelectorAll('.ttt-cell');
    const a = cells[line[0]], b = cells[line[2]];
    if (!a || !b) return;
    const c = el => ({ x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + el.offsetHeight / 2 });
    const p1 = c(a), p2 = c(b);
    const dx = p2.x - p1.x, dy = p2.y - p1.y, len = Math.hypot(dx, dy) || 1, ext = a.offsetWidth * 0.32;
    const x1 = p1.x - dx / len * ext, y1 = p1.y - dy / len * ext, x2 = p2.x + dx / len * ext, y2 = p2.y + dy / len * ext;
    const W = box.clientWidth, H = box.clientHeight, sw = a.offsetWidth * 0.11;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'win-line');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = `<line class="glow" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="${sw * 2.2}" pathLength="100"/>
        <line class="core" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="${sw}" pathLength="100"/>
        <line class="shine" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="${sw * 0.35}" pathLength="100"/>`;
    box.appendChild(svg);
}

function renderBoard(winLine) {
    const box = document.getElementById('ttt');
    box.innerHTML = '';
    state.cells.forEach((owner, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ttt-cell' + (owner ? ' ' + owner : '') + (winLine && winLine.includes(i) ? ' win' : '');
        b.innerHTML = owner ? pieceHTML(owner, state.justPlaced === i) : '';
        b.setAttribute('aria-label', owner ? `Casa de ${P[owner].name}` : `Casa ${i + 1} vazia`);
        b.disabled = !!owner || state.over;
        b.onclick = () => chooseCell(i);
        box.appendChild(b);
    });
    // efeitos da peca nova (pulo e estrelinhas na cor da jogadora)
    if (state.justPlaced != null && window.Efeitos) {
        const el = box.children[state.justPlaced];
        setTimeout(() => { Efeitos.estrelas(el, { quantidade: 12 }); KidsAudio.play('pop'); }, 260);
    }
    state.justPlaced = null;
}

function seriesText() {
    const s = state.series;
    if (!s) return '';
    return `🏅 Melhor de 3 — 👸 ${s.julia} × ${s.livia} 🧚 (partida ${Math.min(s.games + 1, 3)})`;
}

function updateTurnUI() {
    const p = P[state.turn];
    ['julia', 'livia'].forEach(id => document.getElementById('p-' + id).classList.toggle('active', id === state.turn));
    const banner = document.getElementById('turn-banner');
    banner.textContent = `Vez da ${p.name}!`;
    banner.style.setProperty('--pc', p.color);
    document.getElementById('ttt').style.setProperty('--pc', p.color);
    const sl = document.getElementById('series-line');
    sl.textContent = seriesText();
    sl.hidden = !state.series;
}

// Botao "Comecar" da tela inicial: le a opcao Melhor de 3
function startMatch() {
    state.series = document.getElementById('opt-best3').checked ? { julia: 0, livia: 0, games: 0 } : null;
    startGame();
}

// Botao do resultado: proxima partida da serie, ou revanche (nova serie se estava ligada)
function playAgain() {
    if (state.series && seriesWinner()) state.series = { julia: 0, livia: 0, games: 0 };
    startGame();
}

function seriesWinner() {
    const s = state.series;
    if (!s) return null;
    if (s.julia >= 2) return 'julia';
    if (s.livia >= 2) return 'livia';
    if (s.games >= 3) return s.julia === s.livia ? 'empate' : (s.julia > s.livia ? 'julia' : 'livia');
    return null;
}

function startGame() {
    // toque duplo em "Comecar"/"Revanche": a 2a chamada nao reinicia (nem troca de novo quem comeca)
    if (document.getElementById('game-screen').classList.contains('active') && !state.over) return;
    state.gameId++;
    state.cells = Array(9).fill(null);
    state.turn = Duelo.nextStarter('velha');
    state.busy = false;
    state.over = false;
    state.pending = null;
    document.getElementById('q-overlay').hidden = true;
    renderBoard();
    updateTurnUI();
    showScreen('game-screen');
    KidsAudio.play('start');
    announce();
}

function announce() {
    KidsAudio.play('turn');
    // interrupt:false = nao corta o "Acertou!/Nao foi dessa vez" que ainda esta sendo falado
    KidsAudio.speak(`Vez da ${P[state.turn].name}! Escolha uma casa.`, { rate: 0.95, interrupt: false });
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
    DueloPerguntas.render(box, q, ok => onAnswer(ok, q, level), { hearButton: level !== 'dificil' });
    document.getElementById('q-overlay').hidden = false;
    if (level !== 'dificil') setTimeout(() => KidsAudio.speak(q.speak, { rate: 0.85 }), 250);
}

function onAnswer(ok, q, level) {
    const id = state.gameId;
    const box = document.getElementById('question');
    const sayExplain = level === 'facil' && q.explain ? ' ' + q.explain : '';
    if (ok) {
        KidsAudio.play('correct');
        DueloPerguntas.feedback(box, '✅ Acertou! A casa é sua!', 'good');
        KidsAudio.speak('Acertou! A casa é sua!', { rate: 0.95 });
        state.cells[state.pending] = state.turn;
        state.justPlaced = state.pending;
    } else {
        const el = document.querySelectorAll('.ttt-cell')[state.pending];
        if (el && window.Efeitos) Efeitos.erro(el);
        KidsAudio.play('wrong');
        DueloPerguntas.feedback(box, `❌ Não foi dessa vez. ${q.explain || ''}`, 'bad');
        KidsAudio.speak('Não foi dessa vez!' + sayExplain, { rate: 0.95 });
    }
    setTimeout(() => {
        if (id !== state.gameId) return;
        document.getElementById('q-overlay').hidden = true;
        state.busy = false;
        const win = LINES.find(l => l.every(c => state.cells[c] === state.turn));
        if (win) return finish(state.turn, win);
        if (state.cells.every(Boolean)) return finish('empate');
        state.turn = state.turn === 'julia' ? 'livia' : 'julia';
        renderBoard();
        updateTurnUI();
        announce();
    }, ok ? 1300 : 2600);
}

function finish(winner, line) {
    const id = state.gameId;
    state.over = true;
    renderBoard(line);
    Duelo.recordResult('velha', winner);
    if (line) setTimeout(() => {
        if (id !== state.gameId) return;
        drawWinLine(line);
        KidsAudio.play('sparkle');
        if (window.Efeitos) Efeitos.vitoria();
    }, 450);
    else if (window.Efeitos) Efeitos.estrelas(document.getElementById('ttt'), { quantidade: 20, emoji: ['🤝', '⭐'] });

    let title, voice, emoji;
    if (winner === 'empate') { emoji = '🤝'; title = 'Deu velha! Empate!'; voice = 'Deu velha! Empate!'; }
    else { emoji = P[winner].emoji; title = `${P[winner].name} venceu! 🏆`; voice = `${P[winner].name} venceu! Parabéns!`; }

    const s = state.series;
    let againLabel = 'Revanche! ⚔️';
    const seriesEl = document.getElementById('series-result');
    if (s) {
        s.games++;
        if (winner !== 'empate') s[winner]++;
        const sw = seriesWinner();
        seriesEl.textContent = `🏅 Melhor de 3 — 👸 Julia ${s.julia} × ${s.livia} Livia 🧚`;
        if (sw) {
            if (sw === 'empate') { emoji = '🤝'; title = 'A série terminou empatada!'; voice += ' A melhor de três terminou empatada!'; }
            else { emoji = '🏅'; title = `${P[sw].name} venceu a melhor de 3! 🏆`; voice += ` ${P[sw].name} venceu a melhor de três!`; }
            againLabel = 'Nova série ⚔️';
        } else {
            voice += ` Está ${s.julia} a ${s.livia}. Vamos para a próxima partida!`;
            againLabel = 'Próxima partida ▶️';
        }
    }
    seriesEl.hidden = !s;
    document.getElementById('winner-emoji').innerHTML = fig(emoji);
    document.getElementById('winner-title').textContent = title;
    document.getElementById('again-btn').textContent = againLabel;
    document.getElementById('score-line-end').innerHTML = Duelo.scoreText('velha');
    KidsAudio.play('win');
    setTimeout(() => {
        if (id !== state.gameId) return;
        showScreen('result-screen');
        KidsAudio.speak(voice, { interrupt: false });
    }, line ? 2000 : 1400);
}

document.addEventListener('DOMContentLoaded', () => {
    Duelo.mountLevelPickers();
    document.getElementById('score-line').innerHTML = Duelo.scoreText('velha');
    const best3 = document.getElementById('opt-best3');
    try { best3.checked = localStorage.getItem('velha_best3') === '1'; } catch (e) {}
    best3.addEventListener('change', () => {
        try { localStorage.setItem('velha_best3', best3.checked ? '1' : '0'); } catch (e) {}
    });
});
