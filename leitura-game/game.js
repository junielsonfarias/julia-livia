// ==========================================
// Leitura Relampago - Alfabetizacao (5 anos)
// A crianca le a palavra em voz alta; um adulto (ou ela mesma) toca em
// "Li certo!" e aparece a proxima. 60 segundos. Recorde por modo.
// ==========================================

const GAME_SECONDS = 60;
const RECORDS_KEY = 'leitura_recordes_v1';
const SYL_COLORS = ['#e74c3c', '#2980b9', '#27ae60', '#8e44ad', '#e67e22'];

const state = {
    mode: 2,
    reader: 'Livia',
    deck: [],
    current: null,
    score: 0,
    readWords: [],
    skippedWords: [],
    timeLeft: GAME_SECONDS,
    timer: null,
    running: false,
    locked: false,
    recognizer: null
};

const MODE_NAMES = { 2: '2 sílabas', 3: '3 sílabas', 4: '4 sílabas', variadas: 'Variadas' };

// ---------- Navegacao ----------
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
}

// ---------- Recordes ----------
function loadRecords() {
    try { return JSON.parse(localStorage.getItem(RECORDS_KEY)) || {}; } catch (e) { return {}; }
}
function saveRecords(r) {
    try { localStorage.setItem(RECORDS_KEY, JSON.stringify(r)); } catch (e) {}
}
// Estrutura: { "2": [ {name, score, date}, ... top 10 ], ... }
function bestFor(mode, reader) {
    const list = loadRecords()[mode] || [];
    const filtered = reader ? list.filter(r => r.name === reader) : list;
    return filtered.reduce((m, r) => Math.max(m, r.score), 0);
}
function addRecord(mode, name, score) {
    const all = loadRecords();
    const list = all[mode] || [];
    list.push({ name, score, date: new Date().toISOString() });
    list.sort((a, b) => b.score - a.score || a.date.localeCompare(b.date));
    all[mode] = list.slice(0, 10);
    saveRecords(all);
}

function renderRecords() {
    document.querySelectorAll('.mode-record').forEach(el => {
        const best = bestFor(el.dataset.mode, state.reader);
        el.textContent = best > 0 ? `🏆 Recorde de ${state.reader}: ${best}` : 'Sem recorde ainda';
    });
}

function showRanking() {
    const all = loadRecords();
    const box = document.getElementById('ranking');
    box.innerHTML = '';
    Object.keys(MODE_NAMES).forEach(mode => {
        const list = all[mode] || [];
        const col = document.createElement('div');
        col.className = 'rank-col';
        const medals = ['🥇', '🥈', '🥉'];
        col.innerHTML = `<h4>${MODE_NAMES[mode]}</h4>` + (list.length
            ? '<ol>' + list.slice(0, 5).map((r, i) =>
                `<li><span>${medals[i] || (i + 1) + 'º'} ${r.name}</span><b>${r.score}</b></li>`).join('') + '</ol>'
            : '<p class="empty">Ninguém jogou ainda</p>');
        box.appendChild(col);
    });
    showScreen('ranking-screen');
}

// ---------- Jogo ----------
function startGame(mode) {
    state.mode = mode;
    state.deck = shuffle(getPalavras(mode));
    state.score = 0;
    state.readWords = [];
    state.skippedWords = [];
    state.timeLeft = GAME_SECONDS;
    document.getElementById('score').textContent = '0';
    document.getElementById('best').textContent = bestFor(mode, state.reader);
    updateTimer();
    applyWordStyle();
    countdown(() => {
        state.running = true;
        showScreen('game-screen');
        nextWord();
        state.timer = setInterval(tick, 1000);
        if (document.getElementById('opt-mic').checked) startMic();
    });
}

function countdown(done) {
    showScreen('countdown-screen');
    const el = document.getElementById('countdown');
    let n = 3;
    el.textContent = n;
    KidsAudio.play('tick');
    const iv = setInterval(() => {
        n--;
        if (n > 0) {
            el.textContent = n;
            el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
            KidsAudio.play('tick');
        } else {
            clearInterval(iv);
            el.textContent = 'JÁ!';
            KidsAudio.play('start');
            setTimeout(done, 500);
        }
    }, 800);
}

function tick() {
    state.timeLeft--;
    updateTimer();
    if (state.timeLeft <= 5 && state.timeLeft > 0) KidsAudio.play('tick');
    if (state.timeLeft <= 0) endGame();
}

function updateTimer() {
    document.getElementById('time').textContent = state.timeLeft;
    const ring = document.getElementById('ring');
    const circ = 2 * Math.PI * 44;
    ring.style.strokeDasharray = circ;
    ring.style.strokeDashoffset = circ * (1 - state.timeLeft / GAME_SECONDS);
    ring.classList.toggle('warning', state.timeLeft <= 10);
}

function applyWordStyle() {
    const lower = document.getElementById('opt-lower').checked;
    document.getElementById('word').classList.toggle('lower', lower);
}

function nextWord() {
    if (state.deck.length === 0) state.deck = shuffle(getPalavras(state.mode));
    state.current = state.deck.pop();
    renderWord(state.current);
}

function renderWord(w) {
    const wordEl = document.getElementById('word');
    const showSyl = document.getElementById('opt-syllables').checked;
    const showPic = document.getElementById('opt-picture').checked;

    if (showSyl) {
        wordEl.innerHTML = w.syllables.map((s, i) =>
            `<span class="syl" style="color:${SYL_COLORS[i % SYL_COLORS.length]}">${s}</span>`
        ).join('<span class="dash">-</span>');
    } else {
        wordEl.textContent = w.word;
    }
    // Ajusta tamanho para palavras longas
    wordEl.style.fontSize = w.word.length > 8 ? 'clamp(2.2rem, 11vw, 5rem)' : '';

    document.getElementById('word-picture').textContent = showPic ? w.emoji : '';

    const card = document.getElementById('word-card');
    card.classList.remove('pop', 'good', 'skip');
    void card.offsetWidth;
    card.classList.add('pop');
}

function correctWord() {
    if (!state.running || state.locked) return;
    state.locked = true;
    state.score++;
    state.readWords.push(state.current.word);
    document.getElementById('score').textContent = state.score;
    const scoreEl = document.getElementById('score');
    scoreEl.classList.remove('bump'); void scoreEl.offsetWidth; scoreEl.classList.add('bump');
    KidsAudio.play('correct');
    const card = document.getElementById('word-card');
    card.classList.add('good');
    floatPoint();
    setTimeout(() => { state.locked = false; if (state.running) nextWord(); }, 350);
}

function skipWord() {
    if (!state.running || state.locked) return;
    state.locked = true;
    state.skippedWords.push(state.current.word);
    KidsAudio.play('flip');
    document.getElementById('word-card').classList.add('skip');
    setTimeout(() => { state.locked = false; if (state.running) nextWord(); }, 250);
}

function listenWord() {
    if (!state.current) return;
    // Fala silaba por silaba e depois a palavra inteira
    const w = state.current;
    KidsAudio.speak(w.syllables.join('... ') + '... ' + w.word.toLowerCase(), { rate: 0.8 });
}

function floatPoint() {
    const card = document.getElementById('word-card');
    const p = document.createElement('div');
    p.className = 'float-point';
    p.textContent = '+1';
    card.appendChild(p);
    setTimeout(() => p.remove(), 900);
}

function stopGame() {
    state.running = false;
    if (state.timer) { clearInterval(state.timer); state.timer = null; }
    stopMic();
}

function endGame() {
    stopGame();
    KidsAudio.play('timeup');

    const prevBest = bestFor(state.mode, state.reader);
    const prevBestAll = bestFor(state.mode);
    if (state.score > 0) addRecord(state.mode, state.reader, state.score);
    const isRecord = state.score > 0 && state.score > prevBest;

    document.getElementById('final-score').textContent = state.score;
    document.getElementById('new-record').hidden = !isRecord;

    let icon = '🌟', msg;
    if (state.score === 0) { icon = '💪'; msg = 'Vamos tentar de novo? Você consegue!'; }
    else if (isRecord) {
        icon = '🏆';
        msg = `Parabéns, ${state.reader}! Você bateu o seu recorde` + (prevBest ? ` (era ${prevBest}).` : '!');
        if (state.score > prevBestAll && prevBestAll > 0) msg += ' É o maior recorde de todos!';
    } else if (state.score >= prevBest * 0.8) { icon = '🎉'; msg = `Quase o recorde! Faltaram ${prevBest - state.score + 1} palavras.`; }
    else { msg = `Muito bem! Seu recorde é ${prevBest}. Vamos treinar mais?`; }
    document.getElementById('result-icon').textContent = icon;
    document.getElementById('result-msg').textContent = msg;

    const fill = (id, words, clickable) => {
        const box = document.getElementById(id);
        box.innerHTML = '';
        if (!words.length) { box.innerHTML = '<span class="empty">—</span>'; return; }
        [...new Set(words)].forEach(wd => {
            const b = document.createElement(clickable ? 'button' : 'span');
            b.className = 'mini-word';
            b.textContent = wd;
            if (clickable) b.onclick = () => KidsAudio.speak(wd.toLowerCase(), { rate: 0.8 });
            box.appendChild(b);
        });
    };
    fill('read-list', state.readWords, false);
    fill('skip-list', state.skippedWords, true);

    showScreen('result-screen');
    setTimeout(() => {
        KidsAudio.play(isRecord ? 'win' : 'star');
        if (isRecord) KidsAudio.speak(`Novo recorde! ${state.score} palavras!`);
        else if (state.score > 0) KidsAudio.speak(`Você leu ${state.score} ${state.score === 1 ? 'palavra' : 'palavras'}!`);
    }, 700);
}

// ---------- Microfone (opcional) ----------
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

function startMic() {
    if (!SpeechRec) return;
    const status = document.getElementById('mic-status');
    try {
        const rec = new SpeechRec();
        rec.lang = 'pt-BR';
        rec.continuous = true;
        rec.interimResults = true;
        rec.maxAlternatives = 3;
        rec.onresult = (ev) => {
            if (!state.running || !state.current) return;
            const target = semAcento(state.current.word);
            for (let i = ev.resultIndex; i < ev.results.length; i++) {
                for (let a = 0; a < ev.results[i].length; a++) {
                    const heard = semAcento(ev.results[i][a].transcript).replace(/[^A-Z ]/g, '');
                    if (heard.split(' ').includes(target)) {
                        correctWord();
                        return;
                    }
                }
            }
        };
        rec.onerror = (e) => {
            if (e.error === 'not-allowed') status.textContent = '🎤 Microfone bloqueado — use o botão ✓';
        };
        rec.onend = () => { if (state.running && state.recognizer === rec) { try { rec.start(); } catch (e) {} } };
        rec.start();
        state.recognizer = rec;
        status.textContent = '🎤 Estou ouvindo...';
    } catch (e) {
        status.textContent = '';
    }
}

function stopMic() {
    const rec = state.recognizer;
    state.recognizer = null;
    if (rec) { try { rec.stop(); } catch (e) {} }
    const status = document.getElementById('mic-status');
    if (status) status.textContent = '';
}

// ---------- Inicializacao ----------
document.addEventListener('DOMContentLoaded', () => {
    if (!SpeechRec) document.getElementById('mic-option').style.display = 'none';

    // Restaurar opcoes salvas
    ['opt-syllables', 'opt-lower', 'opt-picture', 'opt-mic'].forEach(id => {
        const el = document.getElementById(id);
        try {
            const v = localStorage.getItem('leitura_' + id);
            if (v !== null) el.checked = v === '1';
        } catch (e) {}
        el.addEventListener('change', () => {
            try { localStorage.setItem('leitura_' + id, el.checked ? '1' : '0'); } catch (e) {}
        });
    });

    document.querySelectorAll('.reader').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.reader').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            state.reader = btn.dataset.reader;
            KidsAudio.play('select');
            renderRecords();
        });
    });

    document.addEventListener('keydown', (e) => {
        if (!state.running) return;
        if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); correctWord(); }
        else if (e.code === 'ArrowRight') { e.preventDefault(); skipWord(); }
    });

    renderRecords();
});
