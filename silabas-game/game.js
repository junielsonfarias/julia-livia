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
    Letrinhas.serie.zerar();
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
    // Primeira rodada monta direto; as outras entram deslizando
    if (first) renderRound(w);
    else Letrinhas.trocar([document.querySelector('.build-card'), document.getElementById('tiles')], () => renderRound(w));

    setTimeout(() => {
        if (state.current !== w || state.filled > 0) return;
        if (first) KidsAudio.speak(`Toque nas sílabas na ordem. ${w.word.toLowerCase()}!`, { rate: 0.85 });
        else sayWord();
    }, 400);
}

function renderRound(w) {
    document.getElementById('picture').innerHTML = Letrinhas.fig(w.emoji);

    const slots = document.getElementById('slots');
    slots.classList.remove('done', 'joined');
    slots.innerHTML = '';
    w.syllables.forEach((_, i) => {
        const s = document.createElement('div');
        s.className = 'slot' + (i === 0 ? ' next' : '');
        // Silaba ja colocada: tocar nela fala de novo ("ba")
        s.onclick = () => { if (s.dataset.s) KidsAudio.speak(s.dataset.s.toLowerCase(), { rate: 0.8 }); };
        slots.appendChild(s);
    });

    const allSyl = getPalavras('variadas').flatMap(p => p.syllables);
    const tiles = document.getElementById('tiles');
    tiles.innerHTML = '';
    buildTiles(w, allSyl).forEach((t, i) => {
        const b = document.createElement('button');
        b.className = 'tile c' + (i % 4);
        b.type = 'button';
        b.textContent = t.s;
        b.dataset.s = t.s;
        b.dataset.extra = t.extra ? '1' : '0';
        b.onclick = () => pickTile(b, t.s);
        tiles.appendChild(b);
    });
}

// Palavra completa: as silabas deslizam e se juntam numa peca so
function joinSlots() {
    const box = document.getElementById('slots');
    const slots = [...box.querySelectorAll('.slot')];
    const gap = parseFloat(getComputedStyle(box).columnGap) || 10;
    const mid = (slots.length - 1) / 2;
    box.classList.add('joined');
    slots.forEach((s, i) => {
        const dx = (mid - i) * (gap + 4);   // fecha o espaco e sobrepoe a borda
        if (Efeitos.reduzir()) { s.style.transform = `translateX(${dx}px)`; return; }
        s.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${dx}px)` }],
            { duration: 380, easing: Letrinhas.EASE_BACK, fill: 'forwards' });
    });
    setTimeout(() => Efeitos.acerto(box, { emoji: ['⭐', '✨', '💜'], quantidade: 22 }), 300);
}

function hintTiles() {
    const w = state.current;
    const need = w.syllables[state.filled];
    const free = [...document.querySelectorAll('.tile:not(.used):not(.apagada)')];
    return { need, right: free.find(t => t.dataset.s === need), wrong: free.filter(t => t.dataset.s !== need && t.dataset.extra === '1') };
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
        document.querySelectorAll('.tile.dica-certa').forEach(t => t.classList.remove('dica-certa'));
        state.slotMisses = 0;
        const slots = document.querySelectorAll('.slot');
        const slot = slots[state.filled];
        slot.textContent = syl;
        slot.dataset.s = syl;
        slot.classList.remove('next');
        slot.classList.add('filled', 'landing');
        // A peca voa ate o espaco; o espaco aparece quando ela chega
        Letrinhas.voar(btn, slot, syl, 280).then(() => {
            slot.classList.remove('landing');
            Efeitos.pulo(slot);
        });
        state.filled++;
        KidsAudio.speak(syl.toLowerCase(), { rate: 0.9 });
        if (state.filled < w.size) {
            slots[state.filled].classList.add('next');
            Letrinhas.serie.acerto(null, { atraso: 0 });
        } else {
            state.locked = true;
            Letrinhas.serie.acerto(null, { nota: false });
            setTimeout(() => { KidsAudio.play('correct'); joinSlots(); }, 300);
            setTimeout(() => KidsAudio.speak(w.word.toLowerCase() + '! Muito bem!', { rate: 0.85 }), 650);
            state.roundTimer = setTimeout(nextRound, 2300);
        }
    } else {
        state.mistakes++;
        state.slotMisses++;
        Letrinhas.serie.erro();
        KidsAudio.play('wrong');
        // Fala a peca tocada ("ma"); a dica entra na fila depois dela (interrupt:false)
        KidsAudio.speak(syl.toLowerCase(), { rate: 0.8 });
        // Erro sem frustracao: 1o balanca e repete, 2o apaga uma intrusa, 3o acende a certa
        const h = hintTiles();
        Letrinhas.ajuda(state.slotMisses, { tocado: btn, erradas: h.wrong, certa: h.right });
        // A dica falada sai um pouco depois: se nesse meio tempo ela ja acertou a peca,
        // a dica nao pode cortar a voz da silaba certa (nem o "Muito bem")
        const filledNow = state.filled;
        const stillHere = () => state.current === w && state.filled === filledNow;
        if (state.slotMisses >= 3) {
            setTimeout(() => { if (stillHere()) KidsAudio.speak(`Procure: ${h.need.toLowerCase()}`, { rate: 0.8, interrupt: false }); }, 350);
        } else {
            setTimeout(() => { if (stillHere()) saySyllables(false); }, 350);
        }
    }
}

function nextRound() {
    state.round++;
    if (state.round >= state.words.length) return finish();
    showRound(false);
}

function finish() {
    const stars = state.mistakes <= 2 ? 3 : state.mistakes <= 6 ? 2 : 1;
    document.getElementById('done-count').textContent = state.words.length;
    Letrinhas.estrelas(document.getElementById('stars'), stars);
    const msg = stars === 3 ? 'Perfeito! Você é craque nas sílabas!' :
        stars === 2 ? 'Muito bom! Continue treinando!' : 'Você conseguiu! Vamos jogar de novo?';
    document.getElementById('result-msg').textContent = msg;
    showScreen('result-screen');
    KidsAudio.play('win');
    setTimeout(() => Efeitos.vitoria(), 250);
    setTimeout(() => KidsAudio.speak(`Você montou ${state.words.length} palavras! Ganhou ${stars} ${stars === 1 ? 'estrela' : 'estrelas'}! ${msg}`), 900);
}

if (typeof module !== 'undefined') module.exports = { buildTiles };
