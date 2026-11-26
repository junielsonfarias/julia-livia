// ==========================================
// Leitura Relampago - Alfabetizacao (5 anos)
// A crianca le a palavra em voz alta. Dois jeitos de conferir:
//  - 🎤 Microfone: o reconhecimento de fala confere sozinho e avisa se
//    a palavra foi lida certa ou diferente (sem ninguem precisar marcar).
//  - 👆 Manual: um adulto toca em "Li certo!".
// 60 segundos. Recorde por modo e por leitora.
// ==========================================

const GAME_SECONDS = 60;
const RECORDS_KEY = 'leitura_recordes_v1';
const SYL_COLORS = ['#e74c3c', '#2980b9', '#27ae60', '#8e44ad', '#e67e22'];
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

const state = {
    mode: 2,
    reader: 'Livia',
    check: SpeechRec ? 'mic' : 'manual',
    deck: [],
    current: null,
    score: 0,
    readWords: [],
    skippedWords: [],
    misheard: [],          // { word, heard }
    timeLeft: GAME_SECONDS,
    timer: null,
    running: false,
    locked: false,
    recognizer: null,
    ignoreUntil: 0,        // ignora o microfone enquanto o jogo fala (botao 🔊)
    consumedIndex: -1,     // resultado de fala ja usado (evita contar duas vezes)
    lastWrongAt: 0
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

// ---------- Modo de conferencia ----------
function setCheck(mode) {
    if (mode === 'mic' && !SpeechRec) mode = 'manual';
    state.check = mode;
    document.querySelectorAll('.check').forEach(b => b.classList.toggle('selected', b.dataset.check === mode));
    try { localStorage.setItem('leitura_check', mode); } catch (e) {}
    applyCheckUI();
}

function applyCheckUI() {
    const mic = state.check === 'mic';
    document.getElementById('ok-btn').hidden = mic;
    document.getElementById('actions').classList.toggle('mic-mode', mic);
    document.getElementById('hint-keys').innerHTML = mic
        ? 'Leia em voz alta, bem pertinho do aparelho 🎤 · <kbd>→</kbd> = pular'
        : 'Teclado: <kbd>Espaço</kbd> = acertou · <kbd>→</kbd> = pular';
}

// ---------- Jogo ----------
function startGame(mode) {
    state.mode = mode;
    state.deck = shuffle(getPalavras(mode));
    state.score = 0;
    state.readWords = [];
    state.skippedWords = [];
    state.misheard = [];
    state.timeLeft = GAME_SECONDS;
    document.getElementById('score').textContent = '0';
    document.getElementById('best').textContent = bestFor(mode, state.reader);
    updateTimer();
    applyWordStyle();
    applyCheckUI();
    // Liga o microfone ANTES da contagem: assim o pedido de permissao
    // aparece antes do tempo comecar a correr.
    if (state.check === 'mic') startMic();
    countdown(() => {
        state.running = true;
        showScreen('game-screen');
        nextWord();
        state.timer = setInterval(tick, 1000);
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
    setHeard('', '');
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
    wordEl.style.fontSize = w.word.length > 8 ? 'clamp(2.2rem, 11vw, 5rem)' : '';
    document.getElementById('word-picture').textContent = showPic ? w.emoji : '';

    const card = document.getElementById('word-card');
    card.classList.remove('pop', 'good', 'skip', 'bad');
    void card.offsetWidth;
    card.classList.add('pop');
}

function setHeard(text, kind) {
    const el = document.getElementById('heard');
    el.innerHTML = text;
    el.className = 'heard' + (kind ? ' ' + kind : '');
}

function correctWord() {
    if (!state.running || state.locked) return;
    state.locked = true;
    state.score++;
    state.readWords.push(state.current.word);
    const scoreEl = document.getElementById('score');
    scoreEl.textContent = state.score;
    scoreEl.classList.remove('bump'); void scoreEl.offsetWidth; scoreEl.classList.add('bump');
    KidsAudio.play('correct');
    document.getElementById('word-card').classList.add('good');
    if (state.check === 'mic') setHeard('✅ Leu certinho!', 'good');
    floatPoint();
    setTimeout(() => { state.locked = false; if (state.running) nextWord(); }, state.check === 'mic' ? 650 : 350);
}

// Microfone ouviu outra palavra: avisa e deixa tentar de novo (ou pular)
function wrongAttempt(heardText) {
    if (!state.running || state.locked) return;
    const now = Date.now();
    if (now - state.lastWrongAt < 900) return;   // evita avisos repetidos em sequencia
    state.lastWrongAt = now;
    const heard = heardText.trim();
    state.misheard.push({ word: state.current.word, heard });
    KidsAudio.play('wrong');
    setHeard(`🤔 Ouvi “<b>${escapeHtml(heard)}</b>”. Tente de novo!`, 'bad');
    const card = document.getElementById('word-card');
    card.classList.remove('bad'); void card.offsetWidth; card.classList.add('bad');
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
    const w = state.current;
    const text = w.syllables.join('... ') + '... ' + w.word.toLowerCase();
    // Nao deixar o microfone "ouvir" a voz do proprio jogo
    state.ignoreUntil = Date.now() + 1500 + text.length * 120;
    KidsAudio.speak(text, { rate: 0.8 });
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

function escapeHtml(s) {
    return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
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

    // O que o microfone ouviu diferente (ajuda o adulto a ver onde treinar)
    const heardBox = document.getElementById('heard-box');
    const heardList = document.getElementById('heard-list');
    heardList.innerHTML = '';
    heardBox.hidden = state.misheard.length === 0;
    state.misheard.slice(-12).forEach(m => {
        const b = document.createElement('button');
        b.className = 'mini-word';
        b.innerHTML = `${escapeHtml(m.word)} <small>→ “${escapeHtml(m.heard)}”</small>`;
        b.onclick = () => KidsAudio.speak(m.word.toLowerCase(), { rate: 0.8 });
        heardList.appendChild(b);
    });

    showScreen('result-screen');
    setTimeout(() => {
        KidsAudio.play(isRecord ? 'win' : 'star');
        if (isRecord) KidsAudio.speak(`Novo recorde! ${state.score} palavras!`);
        else if (state.score > 0) KidsAudio.speak(`Você leu ${state.score} ${state.score === 1 ? 'palavra' : 'palavras'}!`);
    }, 700);
}

// ==========================================
// RECONHECIMENTO DE FALA
// ==========================================

// Distancia entre palavras (quantas letras trocar/inserir/apagar)
function editDistance(a, b) {
    const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
            );
        }
    }
    return dp[a.length][b.length];
}

// A fala reconhecida corresponde a palavra da tela?
function speechMatches(target, transcript) {
    const t = semAcento(target);
    const tokens = semAcento(transcript).replace(/[^A-Z ]/g, ' ').split(/\s+/).filter(Boolean);
    if (!tokens.length) return false;
    if (tokens.includes(t)) return true;
    // Silabas faladas separadas: "bo la" -> "BOLA"
    const joined = tokens.join('');
    if (joined === t) return true;
    for (let i = 0; i < tokens.length; i++) {
        for (let j = i + 2; j <= tokens.length; j++) {
            if (tokens.slice(i, j).join('') === t) return true;
        }
    }
    // Modo tolerante: aceita 1 letra de diferenca em palavras de 5+ letras
    if (document.getElementById('opt-lenient').checked && t.length >= 5) {
        if (tokens.some(tok => editDistance(tok, t) <= 1)) return true;
        if (editDistance(joined, t) <= 1) return true;
    }
    return false;
}

function startMic() {
    if (!SpeechRec) return;
    stopMic();
    const status = document.getElementById('mic-status');
    try {
        const rec = new SpeechRec();
        rec.lang = 'pt-BR';
        rec.continuous = true;
        rec.interimResults = true;
        rec.maxAlternatives = 5;

        rec.onstart = () => {
            state.consumedIndex = -1;
            status.innerHTML = '<span class="mic-dot"></span> Estou ouvindo...';
        };

        rec.onresult = (ev) => {
            if (!state.running || !state.current || state.locked) return;
            if (Date.now() < state.ignoreUntil) return;
            for (let i = ev.resultIndex; i < ev.results.length; i++) {
                if (i <= state.consumedIndex) continue;
                const res = ev.results[i];
                const alts = Array.from(res).map(a => a.transcript);
                if (alts.some(a => speechMatches(state.current.word, a))) {
                    state.consumedIndex = i;   // este pedaco de fala ja valeu
                    correctWord();
                    return;
                }
                if (res.isFinal) {
                    state.consumedIndex = i;
                    if (alts[0] && alts[0].trim()) wrongAttempt(alts[0]);
                } else if (alts[0] && alts[0].trim()) {
                    setHeard(`👂 ${escapeHtml(alts[0].trim())}...`, 'listening');
                }
            }
        };

        rec.onerror = (e) => {
            if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
                state.recognizer = null;
                status.textContent = '🎤 Microfone bloqueado. Usando o botão ✓ no lugar.';
                setCheck('manual');
            } else if (e.error === 'network') {
                status.textContent = '🎤 Sem internet para reconhecer a voz. Use o botão ✓.';
                setCheck('manual');
            }
            // 'no-speech' e 'aborted' sao normais: o onend religa
        };

        // O Chrome desliga o microfone de tempos em tempos: religamos
        rec.onend = () => {
            if (state.recognizer === rec && state.check === 'mic' && (state.running || state.timeLeft > 0)) {
                try { rec.start(); } catch (e) {}
            }
        };

        state.recognizer = rec;
        rec.start();
        status.textContent = '🎤 Permita o uso do microfone...';
    } catch (e) {
        status.textContent = '';
        setCheck('manual');
    }
}

function stopMic() {
    const rec = state.recognizer;
    state.recognizer = null;
    if (rec) { try { rec.abort(); } catch (e) {} }
    const status = document.getElementById('mic-status');
    if (status) status.textContent = '';
}

// ---------- Inicializacao ----------
document.addEventListener('DOMContentLoaded', () => {
    const note = document.getElementById('mic-note');
    if (!SpeechRec) {
        document.getElementById('check-mic').disabled = true;
        note.textContent = '🎤 Este navegador não reconhece voz. Para o microfone conferir sozinho, abra no Google Chrome.';
        state.check = 'manual';
    } else {
        note.textContent = '🎤 O microfone precisa de internet (o Chrome usa o serviço de voz do Google).';
        try { const c = localStorage.getItem('leitura_check'); if (c) state.check = c; } catch (e) {}
    }
    setCheck(state.check);

    ['opt-syllables', 'opt-lower', 'opt-picture', 'opt-lenient'].forEach(id => {
        const el = document.getElementById(id);
        try {
            const v = localStorage.getItem('leitura_' + id);
            if (v !== null) el.checked = v === '1';
        } catch (e) {}
        el.addEventListener('change', () => {
            try { localStorage.setItem('leitura_' + id, el.checked ? '1' : '0'); } catch (e) {}
        });
    });

    document.querySelectorAll('.check').forEach(btn => {
        btn.addEventListener('click', () => { setCheck(btn.dataset.check); KidsAudio.play('select'); });
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
        if ((e.code === 'Space' || e.code === 'Enter') && state.check === 'manual') { e.preventDefault(); correctWord(); }
        else if (e.code === 'ArrowRight') { e.preventDefault(); skipWord(); }
    });

    renderRecords();
});
