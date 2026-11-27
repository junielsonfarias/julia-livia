// ==========================================
// Duelo Relampago - Julia x Livia AO MESMO TEMPO (tela dividida)
// Cada uma responde perguntas do seu nivel. 60 segundos. Errou = 1,5 s parada.
// Sem voz durante o jogo (as duas jogando juntas = vozes se atropelariam):
// por isso o nivel Facil usa so figuras e numeros.
// ==========================================

const SECONDS = 60;
const FREEZE_MS = 1500;
const IDS = ['julia', 'livia'];
const state = { scores: { julia: 0, livia: 0 }, timeLeft: SECONDS, timer: null, countdown: null, startDelay: null, running: false, pos: 'lado', gameId: 0, exitArmed: null };

function goBack() {
    stopGame();
    if (window.parent !== window) {
        try { if (window.parent.closeGameModal) { window.parent.closeGameModal(); return; } } catch (e) {}
    }
    if (window.history.length > 1) window.history.back();
    else window.location.href = '../index.html';
}
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.body.classList.toggle('playing', id === 'game-screen');
}
function goHome() {
    document.getElementById('score-line').innerHTML = Duelo.scoreText('relampago');
    showScreen('start-screen');
}

// Contagem: no frente a frente aparece duas vezes (uma virada para a Livia)
function setCountdown(text) {
    const cd = document.getElementById('countdown');
    const frente = state.pos === 'frente';
    cd.classList.toggle('frente', frente);
    cd.innerHTML = frente ? `<span class="cd-flip">${text}</span><span>${text}</span>` : `<span>${text}</span>`;
}

// Sair pede dois toques (o botao fica perto das maos das duas; evita sair sem querer)
function askExit() {
    const btn = document.getElementById('exit-btn');
    if (state.exitArmed) {
        clearTimeout(state.exitArmed);
        state.exitArmed = null;
        btn.classList.remove('armed');
        stopGame();
        goHome();
        return;
    }
    btn.classList.add('armed');
    state.exitArmed = setTimeout(() => { state.exitArmed = null; btn.classList.remove('armed'); }, 2500);
}

function startGame() {
    stopGame();
    state.gameId++;
    state.scores = { julia: 0, livia: 0 };
    state.timeLeft = SECONDS;
    document.getElementById('arena').className = 'arena ' + state.pos;
    IDS.forEach(id => {
        document.getElementById('score-' + id).textContent = '0';
        document.getElementById('q-' + id).innerHTML = '';
        document.getElementById('freeze-' + id).hidden = true;
    });
    const clock = document.getElementById('clock');
    clock.textContent = SECONDS;
    clock.classList.remove('warning');   // sobrava vermelho/pulsando da partida anterior
    showScreen('game-screen');
    // Contagem 3-2-1
    const cd = document.getElementById('countdown');
    cd.hidden = false;
    let n = 3;
    setCountdown(n);
    KidsAudio.play('tick');
    state.countdown = setInterval(() => {
        n--;
        if (n > 0) { setCountdown(n); KidsAudio.play('tick'); return; }
        clearInterval(state.countdown);
        state.countdown = null;
        setCountdown('JÁ!');
        KidsAudio.play('start');
        state.startDelay = setTimeout(() => {
            cd.hidden = true;
            state.running = true;
            IDS.forEach(nextQuestion);
            state.timer = setInterval(tick, 1000);
        }, 450);
    }, 750);
}

function tick() {
    state.timeLeft--;
    const clock = document.getElementById('clock');
    clock.textContent = state.timeLeft;
    clock.classList.toggle('warning', state.timeLeft <= 10);
    if (state.timeLeft <= 5 && state.timeLeft > 0) KidsAudio.play('tick');
    if (state.timeLeft <= 0) endGame();
}

function nextQuestion(pid) {
    if (!state.running) return;
    const q = DueloPerguntas.generate(Duelo.getLevel(pid), { visualOnly: true });
    const box = document.getElementById('q-' + pid);
    DueloPerguntas.render(box, q, ok => onAnswer(pid, ok));
}

function onAnswer(pid, ok) {
    if (!state.running) return;
    const id = state.gameId;
    const alive = () => state.running && id === state.gameId;
    if (ok) {
        state.scores[pid]++;
        const el = document.getElementById('score-' + pid);
        el.textContent = state.scores[pid];
        el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
        KidsAudio.play('correct');
        setTimeout(() => { if (alive()) nextQuestion(pid); }, 350);
    } else {
        KidsAudio.play('wrong');
        const fr = document.getElementById('freeze-' + pid);
        // Timers de uma partida que ja acabou (ou foi trocada) nao mexem na tela nova
        setTimeout(() => {
            if (!alive()) return;
            fr.hidden = false;
            setTimeout(() => { if (id !== state.gameId) return; fr.hidden = true; if (alive()) nextQuestion(pid); }, FREEZE_MS);
        }, 500);
    }
}

function stopGame() {
    state.running = false;
    if (state.exitArmed) { clearTimeout(state.exitArmed); state.exitArmed = null; }
    const ex = document.getElementById('exit-btn');
    if (ex) ex.classList.remove('armed');
    IDS.forEach(id => { const f = document.getElementById('freeze-' + id); if (f) f.hidden = true; });
    if (state.timer) { clearInterval(state.timer); state.timer = null; }
    if (state.countdown) { clearInterval(state.countdown); state.countdown = null; }
    if (state.startDelay) { clearTimeout(state.startDelay); state.startDelay = null; }
    const cd = document.getElementById('countdown');
    if (cd) cd.hidden = true;
}

function endGame() {
    stopGame();
    KidsAudio.play('timeup');
    const { julia, livia } = state.scores;
    const winner = julia === livia ? 'empate' : (julia > livia ? 'julia' : 'livia');
    Duelo.recordResult('relampago', winner);
    document.getElementById('final-julia').textContent = julia;
    document.getElementById('final-livia').textContent = livia;
    if (winner === 'empate') {
        document.getElementById('winner-emoji').textContent = '🤝';
        document.getElementById('winner-title').textContent = 'Empate!';
    } else {
        document.getElementById('winner-emoji').textContent = Duelo.PLAYERS[winner].emoji;
        document.getElementById('winner-title').textContent = `${Duelo.PLAYERS[winner].name} venceu! 🏆`;
    }
    document.getElementById('score-line-end').innerHTML = Duelo.scoreText('relampago');
    const id = state.gameId;
    setTimeout(() => {
        // saiu (Sair? duplo) ou recomecou nesse meio-tempo: nao sobrepoe a tela atual
        if (id !== state.gameId || !document.getElementById('game-screen').classList.contains('active')) return;
        showScreen('result-screen');
        KidsAudio.play('win');
        KidsAudio.speak(winner === 'empate' ? 'Empate! As duas foram incríveis!' : `${Duelo.PLAYERS[winner].name} venceu!`);
    }, 800);
}

function speakIntro() {
    KidsAudio.speak('Duelo relâmpago! As duas jogam ao mesmo tempo, cada uma na sua metade da tela. ' +
        'Livia: conte as figuras, ache a figura igual, ou toque no grupo que tem mais. ' +
        'Errou? Espera a ampulheta. Quem acertar mais em um minuto vence!', { rate: 0.9 });
}

document.addEventListener('DOMContentLoaded', () => {
    Duelo.mountLevelPickers();
    document.getElementById('score-line').innerHTML = Duelo.scoreText('relampago');
    try { state.pos = localStorage.getItem('relampago_pos') || 'lado'; } catch (e) {}
    document.querySelectorAll('.pos-btn').forEach(b => {
        b.classList.toggle('selected', b.dataset.pos === state.pos);
        b.onclick = () => {
            state.pos = b.dataset.pos;
            document.querySelectorAll('.pos-btn').forEach(x => x.classList.toggle('selected', x === b));
            try { localStorage.setItem('relampago_pos', state.pos); } catch (e) {}
            KidsAudio.play('select');
        };
    });
});
