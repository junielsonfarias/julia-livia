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

// ---------- Reconhecimento de voz NO APARELHO ----------
// Chrome recente consegue reconhecer a fala sem internet ("processLocally").
// E mais rapido (nao vai ate o servidor) e funciona offline.
// Estados: 'available' (pronto), 'downloadable'/'downloading' (precisa baixar), 'unavailable'/'unsupported'.
let localSpeech = 'unsupported';

async function checkLocalSpeech() {
    if (!SpeechRec) return 'unsupported';
    try {
        if (typeof SpeechRec.available === 'function') {
            return await SpeechRec.available({ langs: ['pt-BR'], processLocally: true });
        }
        if (typeof SpeechRec.availableOnDevice === 'function') {
            return await SpeechRec.availableOnDevice('pt-BR');
        }
    } catch (e) { /* navegador sem suporte */ }
    return 'unsupported';
}

async function installLocalSpeech() {
    const btn = document.getElementById('mic-install');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Baixando a voz em português...'; }
    let ok = false;
    try {
        if (typeof SpeechRec.install === 'function') ok = await SpeechRec.install({ langs: ['pt-BR'], processLocally: true });
        else if (typeof SpeechRec.installOnDevice === 'function') ok = await SpeechRec.installOnDevice('pt-BR');
    } catch (e) { ok = false; }
    localSpeech = await checkLocalSpeech();
    updateMicNote();
    if (!ok && localSpeech !== 'available' && btn) { btn.disabled = false; btn.textContent = '⬇️ Tentar baixar de novo'; }
}

function updateMicNote() {
    const note = document.getElementById('mic-note');
    const btn = document.getElementById('mic-install');
    if (!note || !SpeechRec) return;
    if (localSpeech === 'available') {
        note.textContent = '🎤 Voz em português instalada no aparelho: o microfone funciona sem internet e responde mais rápido.';
        if (btn) btn.hidden = true;
    } else if (localSpeech === 'downloadable' || localSpeech === 'downloading') {
        note.textContent = '🎤 Agora o microfone usa a internet. Baixe a voz em português para funcionar sem internet e mais rápido:';
        if (btn) { btn.hidden = false; btn.disabled = localSpeech === 'downloading'; btn.textContent = localSpeech === 'downloading' ? '⏳ Baixando...' : '⬇️ Baixar voz para usar sem internet'; }
    } else {
        note.textContent = '🎤 O microfone precisa de internet neste aparelho (usa o serviço de voz do Google).';
        if (btn) btn.hidden = true;
    }
}

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
    consumedTokens: 0,     // quantas palavras desse resultado ja foram usadas (o resto ainda vale)
    checkFallback: false,  // microfone trocado pelo botao so nesta partida (erro de rede, bloqueio...)
    micStartedAt: 0,
    micQuickEnds: 0,       // sessoes do microfone que terminaram logo apos comecar (evita religar sem parar)
    lastWrongAt: 0,
    prevWord: null,        // palavra anterior (fala atrasada dela nao conta como erro)
    cdTimer: null,         // contagem 3-2-1 (cancelavel ao sair)
    cdDelay: null
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
    // Ate 10 por leitora: se fosse 10 no total, os recordes da Julia (maiores)
    // apagariam os da Livia, e todo jogo dela viraria "novo recorde".
    const perName = {};
    all[mode] = list.filter(r => (perName[r.name] = (perName[r.name] || 0) + 1) <= 10);
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
// persist=false: troca so nesta partida (ex.: erro de rede), sem mudar a preferencia salva
function setCheck(mode, persist) {
    if (mode === 'mic' && !SpeechRec) mode = 'manual';
    state.check = mode;
    state.checkFallback = persist === false && mode === 'manual';
    document.querySelectorAll('.check').forEach(b => b.classList.toggle('selected', b.dataset.check === mode));
    if (persist !== false) { try { localStorage.setItem('leitura_check', mode); } catch (e) {} }
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
    stopGame();               // cancela contagem/partida anterior (toque duplo no botao)
    state.mode = mode;
    state.deck = shuffle(getPalavras(mode));
    state.score = 0;
    state.readWords = [];
    state.skippedWords = [];
    state.misheard = [];
    state.current = null;
    state.prevWord = null;
    state.locked = false;
    state.timeLeft = GAME_SECONDS;
    state.ignoreUntil = 0;
    state.micQuickEnds = 0;
    // A troca para o botao por erro (rede, microfone...) vale so para a partida em que aconteceu
    if (state.checkFallback && SpeechRec) setCheck('mic', false);
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
    state.cdTimer = setInterval(() => {
        n--;
        if (n > 0) {
            el.textContent = n;
            el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
            KidsAudio.play('tick');
        } else {
            clearInterval(state.cdTimer);
            state.cdTimer = null;
            el.textContent = 'JÁ!';
            KidsAudio.play('start');
            state.cdDelay = setTimeout(() => { state.cdDelay = null; done(); }, 500);
        }
    }, 800);
}

// Partida em andamento (contagem 3-2-1 ou jogando)
function gameActive() {
    return state.running || state.cdTimer !== null || state.cdDelay !== null;
}

function cancelCountdown() {
    if (state.cdTimer) { clearInterval(state.cdTimer); state.cdTimer = null; }
    if (state.cdDelay) { clearTimeout(state.cdDelay); state.cdDelay = null; }
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
    state.prevWord = state.current ? state.current.word : null;
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
    // Tamanho pelo que aparece na tela (com os tracinhos das silabas)
    const shown = w.word.length + (showSyl ? w.syllables.length - 1 : 0);
    wordEl.style.fontSize = shown > 10 ? 'clamp(1.9rem, 9.5vw, 4.4rem)'
        : shown > 7 ? 'clamp(2.2rem, 11vw, 5rem)' : '';
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
    setTimeout(() => { state.locked = false; if (state.running) nextWord(); }, state.check === 'mic' ? 180 : 350);
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

// Fala do jogo durante a partida, sem o microfone "ouvir" a propria voz do jogo
function speakGuarded(text) {
    const until = state.ignoreUntil = Date.now() + 1200 + text.length * 120;
    // Quando a voz termina de verdade, libera o microfone logo (a estimativa acima e so o limite).
    // So vale para esta fala: se tocou de novo, o fim da fala cortada nao libera nada.
    KidsAudio.speak(text, { rate: 0.8, onend: () => { if (state.ignoreUntil === until) state.ignoreUntil = Date.now() + 500; } });
}

function listenWord() {
    if (!state.current) return;
    const w = state.current;
    speakGuarded(w.syllables.join('... ') + '... ' + w.word.toLowerCase());
}

// Tocar numa silaba da palavra fala so ela ("ba"); sem silabas separadas, fala a palavra
function tapWord(ev) {
    if (!state.running || !state.current) return;
    const syl = ev.target.closest ? ev.target.closest('.syl') : null;
    if (syl) {
        syl.classList.add('tap');
        setTimeout(() => syl.classList.remove('tap'), 180);
        speakGuarded(syl.textContent.toLowerCase());
    } else if (!document.getElementById('opt-syllables').checked) {
        speakGuarded(state.current.word.toLowerCase());
    }
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
    cancelCountdown();
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
    } else if (state.score >= prevBest * 0.8) {
        const falta = prevBest - state.score + 1;
        icon = '🎉';
        msg = falta === 1 ? 'Quase o recorde! Faltou 1 palavra.' : `Quase o recorde! Faltaram ${falta} palavras.`;
    }
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
        else if (state.score > 0) KidsAudio.speak(`Você leu ${state.score} ${state.score === 1 ? 'palavra' : 'palavras'}! ${msg}`);
        else KidsAudio.speak(msg);
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

const GLUED = ['A', 'O', 'UM', 'UMA'];

function speechTokens(transcript) {
    return semAcento(transcript).replace(/[^A-Z ]/g, ' ').split(/\s+/).filter(Boolean);
}

// Todas as palavras do jogo (sem acento): no modo tolerante, ouvir OUTRA palavra
// do jogo nunca vale (MENINO x MENINA, JANELA x PANELA, CANETA x CANECA...)
let knownWords = null;
function isKnownWord(w) {
    if (!knownWords) knownWords = new Set(getPalavras('variadas').map(p => semAcento(p.word)));
    return knownWords.has(w);
}

// A fala reconhecida corresponde a palavra da tela?
function speechMatches(target, transcript) {
    const t = semAcento(target);
    const tokens = speechTokens(transcript);
    if (!tokens.length) return false;
    if (tokens.includes(t)) return true;
    // Artigo grudado pelo reconhecedor: "abola", "umgato" (mas SAPATO nao vale para PATO:
    // so artigos, e nunca se o resultado for outra palavra do jogo, ex.: O+VELHA)
    if (tokens.some(tok => GLUED.some(p => tok === p + t) && !isKnownWord(tok))) return true;
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
        if (tokens.some(tok => !isKnownWord(tok) && editDistance(tok, t) <= 1)) return true;
        if (!isKnownWord(joined) && editDistance(joined, t) <= 1) return true;
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
        if (localSpeech === 'available') {
            try {
                if ('processLocally' in rec) rec.processLocally = true;
                else if ('mode' in rec) rec.mode = 'ondevice-only';
            } catch (e) { /* segue pela internet */ }
        }
        // Pistas: as palavras deste modo ficam "mais provaveis" para o reconhecedor
        // (so no modo do aparelho: pelo servidor as pistas podem nao ser aceitas)
        if (localSpeech === 'available' && window.SpeechRecognitionPhrase && 'phrases' in rec) {
            try {
                // Na ordem em que vao aparecer (o baralho sai do fim): no modo Variadas
                // ha mais de 120 palavras e as primeiras da partida precisam estar na lista
                rec.phrases = state.deck.slice().reverse().slice(0, 120)
                    .map(w => new SpeechRecognitionPhrase(w.word.toLowerCase(), 4.0));
            } catch (e) { /* sem suporte a pistas */ }
        }

        rec.onstart = () => {
            state.consumedIndex = -1;
            state.consumedTokens = 0;
            state.micStartedAt = Date.now();
            status.innerHTML = '<span class="mic-dot"></span> Estou ouvindo...';
        };

        rec.onresult = (ev) => {
            if (!state.running || !state.current) return;
            if (Date.now() < state.ignoreUntil) {
                // E a voz do proprio jogo (botao 🔊): o que foi ouvido ate aqui nunca conta,
                // nem quando o resultado "final" dessa fala chegar depois
                state.consumedIndex = ev.results.length - 1;
                state.consumedTokens = Infinity;
                return;
            }
            if (state.locked) return;
            for (let i = ev.resultIndex; i < ev.results.length; i++) {
                if (i < state.consumedIndex) continue;
                const res = ev.results[i];
                // Mesmo resultado de uma palavra ja aceita: o Chrome junta falas seguidas
                // ("bola gato") num resultado so. Confere so o que veio DEPOIS.
                const skip = i === state.consumedIndex ? state.consumedTokens : 0;
                const alts = Array.from(res).map(a => skip ? speechTokens(a.transcript).slice(skip).join(' ') : a.transcript);
                const hit = alts.findIndex(a => speechMatches(state.current.word, a));
                if (hit >= 0) {
                    state.consumedIndex = i;   // este pedaco de fala ja valeu
                    state.consumedTokens = skip + speechTokens(alts[hit]).length;
                    correctWord();
                    return;
                }
                if (res.isFinal) {
                    state.consumedIndex = i;
                    state.consumedTokens = Infinity;
                    if (skip) continue;   // resto de uma fala ja aceita: nao vira "erro"
                    // Final atrasado da palavra anterior (ex.: repetiu "bola"): ignora sem dar erro
                    if (state.prevWord && alts.some(a => speechMatches(state.prevWord, a))) continue;
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
                setCheck('manual', false);
            } else if (e.error === 'network') {
                status.textContent = localSpeech === 'downloadable'
                    ? '🎤 Sem internet. Na tela inicial, baixe a voz para usar o microfone offline. Use o botão ✓.'
                    : '🎤 Sem internet para reconhecer a voz. Use o botão ✓.';
                setCheck('manual', false);
            } else if (e.error === 'audio-capture') {
                // Sem microfone: sem isto o onend religaria sem parar
                status.textContent = '🎤 Não achei o microfone. Use o botão ✓.';
                setCheck('manual', false);
            }
            else if (e.error === 'phrases-not-supported' || e.error === 'language-not-supported') {
                // Recomeca sem os recursos extras (pistas / reconhecimento no aparelho)
                localSpeech = 'unsupported';
                // Este reconhecedor nao religa sozinho (o onend religaria com as mesmas opcoes)
                if (state.recognizer === rec) state.recognizer = null;
                try { rec.abort(); } catch (err) {}
                setTimeout(() => {
                    // So se a partida continua e ninguem ligou outro microfone (Voltar / nova partida)
                    if (!state.recognizer && state.check === 'mic' && gameActive()) startMic();
                }, 150);
            }
            // 'no-speech' e 'aborted' sao normais: o onend religa
        };

        // O Chrome desliga o microfone de tempos em tempos: religamos
        rec.onend = () => {
            if (state.recognizer !== rec || state.check !== 'mic' || !gameActive()) return;
            // Terminou logo depois de comecar varias vezes seguidas (microfone ocupado,
            // erro desconhecido...): nao fica religando sem parar, passa para o botao
            state.micQuickEnds = Date.now() - state.micStartedAt < 1000 ? state.micQuickEnds + 1 : 0;
            if (state.micQuickEnds >= 5) {
                state.recognizer = null;
                status.textContent = '🎤 O microfone não está funcionando. Use o botão ✓.';
                setCheck('manual', false);
                return;
            }
            state.micStartedAt = Date.now();
            try { rec.start(); } catch (e) {}
        };

        state.recognizer = rec;
        state.micStartedAt = Date.now();
        rec.start();
        status.textContent = '🎤 Permita o uso do microfone...';
    } catch (e) {
        status.textContent = '';
        setCheck('manual', false);
    }
}

function stopMic() {
    const rec = state.recognizer;
    state.recognizer = null;
    if (rec) { try { rec.abort(); } catch (e) {} }
    const status = document.getElementById('mic-status');
    if (status) status.textContent = '';
}

// Explicacao falada da tela inicial (para quem ainda nao le)
function speakIntro() {
    KidsAudio.speak('Vamos ler! Aparece uma palavra e você lê em voz alta. ' +
        (state.check === 'mic' ? 'O microfone escuta e confere sozinho. ' : 'Um adulto toca no botão verde quando você acertar. ') +
        'Se não souber, toque em pular, ou no alto-falante para ouvir. Você tem um minuto. ' +
        'Toque no botão verde para palavras pequenas, de duas sílabas.', { rate: 0.9 });
}

// ---------- Inicializacao ----------
document.addEventListener('DOMContentLoaded', () => {
    const note = document.getElementById('mic-note');
    if (!SpeechRec) {
        document.getElementById('check-mic').disabled = true;
        note.textContent = '🎤 Este navegador não reconhece voz. Para o microfone conferir sozinho, abra no Google Chrome.';
        state.check = 'manual';
    } else {
        note.textContent = '🎤 Verificando o microfone...';
        checkLocalSpeech().then(st => { localSpeech = st; updateMicNote(); });
        const ib = document.getElementById('mic-install');
        if (ib) ib.addEventListener('click', installLocalSpeech);
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

    document.getElementById('word').addEventListener('click', tapWord);

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
