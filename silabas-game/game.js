// ==========================================
// Monte a Palavra - Consciencia silabica (5 anos)
// Toque nas silabas na ordem certa para formar a palavra da figura.
// ==========================================

const ROUNDS = 10;
const state = { mode: 2, words: [], round: 0, current: null, filled: 0, mistakes: 0, slotMisses: 0, locked: false, roundTimer: null };

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

function speakIntro() {
    KidsAudio.speak('Monte a palavra! Olhe a figura e escute a palavra. Depois toque nos pedacinhos, as sílabas, na ordem certa. ' +
        'Para começar, toque no botão verde: palavras de dois pedacinhos.', { rate: 0.9 });
}

// Pecas da rodada: TODAS as silabas da palavra (inclusive repetidas, ex.: BA-NA-NA)
// + 2 intrusas que nao se parecem com nenhuma silaba da palavra (nem com/sem acento).
function buildTiles(w, allSyllables) {
    const needed = new Set(w.syllables.map(s => semAcento(s)));
    const pool = [...new Set(allSyllables)].filter(s => !needed.has(semAcento(s)));
    const extras = [];
    for (const s of shuffle(pool)) {
        if (extras.some(x => semAcento(x) === semAcento(s))) continue;
        extras.push(s);
        if (extras.length === 2) break;
    }
    return shuffle([...w.syllables.map(s => ({ s, extra: false })), ...extras.map(s => ({ s, extra: true }))]);
}

function startGame(mode) {
    clearTimeout(state.roundTimer);
    state.mode = mode;
    state.words = shuffle(getPalavras(mode)).slice(0, ROUNDS);
    state.round = 0;
    state.mistakes = 0;
    document.getElementById('total').textContent = state.words.length;
    document.getElementById('slots').classList.remove('done');
    KidsAudio.play('start');
    showScreen('game-screen');
    showRound(true);
}

function showRound(first) {
    const w = state.words[state.round];
    state.current = w;
    state.filled = 0;
    state.slotMisses = 0;
    state.locked = false;
    document.getElementById('round').textContent = state.round + 1;
    document.getElementById('picture').textContent = w.emoji;

    const slots = document.getElementById('slots');
    slots.innerHTML = '';
    w.syllables.forEach((_, i) => {
        const s = document.createElement('div');
        s.className = 'slot' + (i === 0 ? ' next' : '');
        // Silaba ja colocada: tocar nela fala de novo ("ba")
        s.onclick = () => { if (s.textContent) KidsAudio.speak(s.textContent.toLowerCase(), { rate: 0.8 }); };
        slots.appendChild(s);
    });

    const allSyl = getPalavras('variadas').flatMap(p => p.syllables);
    const tiles = document.getElementById('tiles');
    tiles.innerHTML = '';
    buildTiles(w, allSyl).forEach(t => {
        const b = document.createElement('button');
        b.className = 'tile';
        b.type = 'button';
        b.textContent = t.s;
        b.onclick = () => pickTile(b, t.s);
        tiles.appendChild(b);
    });

    setTimeout(() => {
        if (state.current !== w || state.filled > 0) return;
        if (first) KidsAudio.speak(`Toque nas sílabas na ordem. ${w.word.toLowerCase()}!`, { rate: 0.85 });
        else sayWord();
    }, 400);
}

function sayWord() {
    if (state.current) KidsAudio.speak(state.current.word.toLowerCase(), { rate: 0.85 });
}

// Fala a palavra em pedacinhos: "ba... na... na"
function saySyllables(interrupt) {
    const w = state.current;
    if (w) KidsAudio.speak(w.syllables.map(s => s.toLowerCase()).join('... '), { rate: 0.75, interrupt: interrupt !== false });
}

function pickTile(btn, syl) {
    if (state.locked || btn.disabled) return;
    const w = state.current;
    // Aceita silaba igual mesmo que seja outro botao (ex.: BA-NA-NA)
    if (syl === w.syllables[state.filled]) {
        btn.classList.add('used');
        btn.disabled = true;
        document.querySelectorAll('.tile.hint').forEach(t => t.classList.remove('hint'));
        state.slotMisses = 0;
        const slots = document.querySelectorAll('.slot');
        slots[state.filled].textContent = syl;
        slots[state.filled].classList.remove('next');
        slots[state.filled].classList.add('filled');
        state.filled++;
        KidsAudio.speak(syl.toLowerCase(), { rate: 0.9 });
        if (state.filled < w.size) {
            slots[state.filled].classList.add('next');
            KidsAudio.play('flip');
        } else {
            state.locked = true;
            KidsAudio.play('correct');
            document.getElementById('slots').classList.add('done');
            setTimeout(() => KidsAudio.speak(w.word.toLowerCase() + '! Muito bem!', { rate: 0.85 }), 450);
            state.roundTimer = setTimeout(nextRound, 2200);
        }
    } else {
        state.mistakes++;
        state.slotMisses++;
        KidsAudio.play('wrong');
        // Fala a peca tocada ("ma"); a dica entra na fila depois dela (interrupt:false)
        KidsAudio.speak(syl.toLowerCase(), { rate: 0.8 });
        btn.classList.remove('shake'); void btn.offsetWidth; btn.classList.add('shake');
        setTimeout(() => btn.classList.remove('shake'), 450);
        // A dica falada sai um pouco depois: se nesse meio tempo ela ja acertou a peca,
        // a dica nao pode cortar a voz da silaba certa (nem o "Muito bem")
        const filledNow = state.filled;
        const stillHere = () => state.current === w && state.filled === filledNow;
        if (state.slotMisses >= 2) {
            // Segunda tentativa errada: a peca certa brilha e a voz diz qual procurar
            const need = w.syllables[state.filled];
            const right = [...document.querySelectorAll('.tile:not(.used)')].find(t => t.textContent === need);
            if (right) right.classList.add('hint');
            setTimeout(() => { if (stillHere()) KidsAudio.speak(`Procure: ${need.toLowerCase()}`, { rate: 0.8, interrupt: false }); }, 350);
        } else {
            setTimeout(() => { if (stillHere()) saySyllables(false); }, 350);
        }
    }
}

function nextRound() {
    state.round++;
    document.getElementById('slots').classList.remove('done');
    if (state.round >= state.words.length) return finish();
    showRound(false);
}

function finish() {
    const stars = state.mistakes <= 2 ? 3 : state.mistakes <= 6 ? 2 : 1;
    document.getElementById('done-count').textContent = state.words.length;
    document.getElementById('stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    const msg = stars === 3 ? 'Perfeito! Você é craque nas sílabas!' :
        stars === 2 ? 'Muito bom! Continue treinando!' : 'Você conseguiu! Vamos jogar de novo?';
    document.getElementById('result-msg').textContent = msg;
    showScreen('result-screen');
    KidsAudio.play('win');
    setTimeout(() => KidsAudio.speak(`Você montou ${state.words.length} palavras! Ganhou ${stars} ${stars === 1 ? 'estrela' : 'estrelas'}! ${msg}`), 900);
}

if (typeof module !== 'undefined') module.exports = { buildTiles };
