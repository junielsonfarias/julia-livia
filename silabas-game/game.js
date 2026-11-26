// ==========================================
// Monte a Palavra - Consciencia silabica (5 anos)
// Toque nas silabas na ordem certa para formar a palavra da figura.
// ==========================================

const ROUNDS = 10;
const state = { mode: 2, words: [], round: 0, current: null, filled: 0, mistakes: 0, locked: false };

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

function startGame(mode) {
    state.mode = mode;
    state.words = shuffle(getPalavras(mode)).slice(0, ROUNDS);
    state.round = 0;
    state.mistakes = 0;
    document.getElementById('total').textContent = ROUNDS;
    KidsAudio.play('start');
    showScreen('game-screen');
    showRound();
}

function showRound() {
    const w = state.words[state.round];
    state.current = w;
    state.filled = 0;
    state.locked = false;
    document.getElementById('round').textContent = state.round + 1;
    document.getElementById('picture').textContent = w.emoji;

    const slots = document.getElementById('slots');
    slots.innerHTML = '';
    w.syllables.forEach((_, i) => {
        const s = document.createElement('div');
        s.className = 'slot' + (i === 0 ? ' next' : '');
        slots.appendChild(s);
    });

    // Silabas da palavra + 2 silabas "intrusas" de outras palavras
    const pool = getPalavras('variadas').flatMap(p => p.syllables)
        .filter(s => !w.syllables.includes(s));
    const extras = shuffle([...new Set(pool)]).slice(0, 2);
    const tiles = document.getElementById('tiles');
    tiles.innerHTML = '';
    shuffle([...w.syllables.map((s, i) => ({ s, i })), ...extras.map(s => ({ s, i: -1 }))])
        .forEach(t => {
            const b = document.createElement('button');
            b.className = 'tile';
            b.textContent = t.s;
            b.onclick = () => pickTile(b, t.s);
            tiles.appendChild(b);
        });

    setTimeout(sayWord, 400);
}

function sayWord() {
    if (state.current) KidsAudio.speak(state.current.word.toLowerCase(), { rate: 0.85 });
}

function pickTile(btn, syl) {
    if (state.locked) return;
    const w = state.current;
    // Aceita silaba igual mesmo que seja outro botao (ex.: BA-NA-NA)
    if (syl === w.syllables[state.filled]) {
        btn.classList.add('used');
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
            setTimeout(() => KidsAudio.speak(w.word.toLowerCase() + '!', { rate: 0.85 }), 450);
            setTimeout(nextRound, 1700);
        }
    } else {
        state.mistakes++;
        KidsAudio.play('wrong');
        btn.classList.remove('shake'); void btn.offsetWidth; btn.classList.add('shake');
        setTimeout(() => btn.classList.remove('shake'), 450);
    }
}

function nextRound() {
    state.round++;
    if (state.round >= state.words.length) return finish();
    showRound();
}

function finish() {
    const stars = state.mistakes <= 2 ? 3 : state.mistakes <= 6 ? 2 : 1;
    document.getElementById('done-count').textContent = state.words.length;
    document.getElementById('stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    document.getElementById('result-msg').textContent =
        stars === 3 ? 'Perfeito! Você é craque nas sílabas!' :
        stars === 2 ? 'Muito bom! Continue treinando!' : 'Você conseguiu! Vamos jogar de novo?';
    showScreen('result-screen');
    KidsAudio.play('win');
}
