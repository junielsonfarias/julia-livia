// ==========================================
// Caca-Rimas - Livia (5 anos) - consciencia fonologica (rimas)
// BNCC EI03EF07 (rimas, aliteracoes)
// Ouça a palavra e encontre a figura que RIMA com ela.
// ==========================================

// Grupos de palavras que rimam (mesmo som final). Usamos so figuras faceis de reconhecer.
const RIMAS = {
    ATO: [['GATO', '🐱'], ['PATO', '🦆'], ['RATO', '🐭'], ['SAPATO', '👞'], ['PRATO', '🍽️']],
    AO: [['MÃO', '✋'], ['PÃO', '🍞'], ['CÃO', '🐕'], ['AVIÃO', '✈️'], ['LIMÃO', '🍋'], ['LEÃO', '🦁'], ['BALÃO', '🎈'], ['CAMINHÃO', '🚚']],
    ELA: [['JANELA', '🪟'], ['PANELA', '🍳'], ['VELA', '🕯️'], ['ESTRELA', '⭐']],
    OLA: [['BOLA', '⚽'], ['CEBOLA', '🧅'], ['ESCOLA', '🏫']],
    ELHA: [['ABELHA', '🐝'], ['OVELHA', '🐑'], ['ORELHA', '👂']],
    ADA: [['FADA', '🧚'], ['ESPADA', '🗡️'], ['SALADA', '🥗'], ['ESCADA', '🪜']],
    OCA: [['FOCA', '🦭'], ['BOCA', '👄'], ['PIPOCA', '🍿'], ['MINHOCA', '🪱']],
    ACA: [['VACA', '🐮'], ['FACA', '🔪']],
    EDO: [['DEDO', '☝️'], ['BRINQUEDO', '🧸']],
    OTA: [['BOTA', '👢'], ['GOTA', '💧']],
    ELHO: [['COELHO', '🐰'], ['JOELHO', '🦵'], ['ESPELHO', '🪞']],
    UA: [['LUA', '🌙'], ['RUA', '🛣️']],
    ANA: [['BANANA', '🍌'], ['CABANA', '🛖']],
    EIRA: [['CADEIRA', '🪑'], ['MAMADEIRA', '🍼'], ['BANHEIRA', '🛁']]
};

const ROUNDS = 10;
const state = { round: 0, items: [], current: null, tries: 0, hits: 0, locked: false };

// Monta lista de palavras com figura e seu grupo de rima
const WORDS = Object.entries(RIMAS).flatMap(([grupo, list]) =>
    list.filter(([, emoji]) => emoji).map(([word, emoji]) => ({ word, emoji, grupo })));
const GROUPS = [...new Set(WORDS.map(w => w.grupo))].filter(g => WORDS.filter(w => w.grupo === g).length >= 2);

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

// Duas palavras "parecem rimar" se terminam com as mesmas 2 letras (ex.: BOLA e MALA).
// Nao usamos esse tipo como opcao errada para nao confundir.
const end2 = w => semAcento(w).slice(-2);

function makeRound() {
    const grupo = GROUPS[Math.floor(Math.random() * GROUPS.length)];
    const [target, rhyme] = shuffle(WORDS.filter(w => w.grupo === grupo));
    const wrongs = [];
    for (const w of shuffle(WORDS)) {
        if (w.grupo === grupo || end2(w.word) === end2(target.word)) continue;
        if (wrongs.some(x => x.grupo === w.grupo || x.emoji === w.emoji) || w.emoji === rhyme.emoji || w.emoji === target.emoji) continue;
        wrongs.push(w);
        if (wrongs.length === 2) break;
    }
    return { target, rhyme, options: shuffle([rhyme, ...wrongs]) };
}

function startGame() {
    state.round = 0;
    state.hits = 0;
    state.items = [];
    const usedTargets = new Set();
    let guard = 0;
    while (state.items.length < ROUNDS && guard++ < 200) {
        const r = makeRound();
        if (usedTargets.has(r.target.word)) continue;
        usedTargets.add(r.target.word);
        state.items.push(r);
    }
    document.getElementById('total').textContent = state.items.length;
    KidsAudio.play('start');
    showScreen('game-screen');
    showRound();
}

function showRound() {
    const r = state.items[state.round];
    state.current = r;
    state.tries = 0;
    state.locked = false;
    document.getElementById('round').textContent = state.round + 1;
    document.getElementById('target-pic').textContent = r.target.emoji;
    document.getElementById('target-word').textContent = r.target.word;
    document.getElementById('rhyme-slot').textContent = '?';
    document.getElementById('rhyme-slot').className = 'rhyme-slot';
    const box = document.getElementById('options');
    box.innerHTML = '';
    r.options.forEach(o => {
        const b = document.createElement('button');
        b.className = 'rhyme-option';
        b.innerHTML = `<span class="opt-emoji">${o.emoji}</span><span class="opt-word">${o.word}</span>`;
        b.setAttribute('aria-label', o.word.toLowerCase());
        b.onclick = () => choose(b, o);
        box.appendChild(b);
    });
    const card = document.getElementById('card');
    card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop');
    // interrupt:false = espera o "Rimou!" da rodada anterior terminar
    setTimeout(() => { if (state.current === r) sayPrompt(false); }, 350);
}

function sayPrompt(interrupt) {
    const r = state.current;
    if (!r) return;
    const names = r.options.map(o => o.word.toLowerCase()).join('... ');
    KidsAudio.speak(`O que rima com ${r.target.word.toLowerCase()}? ... ${names}`, { rate: 0.85, interrupt: interrupt !== false });
}

function speakIntro() {
    KidsAudio.speak('Caça-rimas! Palavras que rimam terminam com o mesmo som, como gato e pato. ' +
        'Escute a palavra e toque na figura que rima com ela. Toque no botão Começar para jogar.', { rate: 0.9 });
}

function choose(btn, o) {
    if (state.locked || btn.disabled) return;
    const r = state.current;
    state.tries++;
    if (o.grupo === r.target.grupo) {
        state.locked = true;
        if (state.tries === 1) state.hits++;
        btn.classList.add('right');
        const slot = document.getElementById('rhyme-slot');
        slot.textContent = o.emoji;
        slot.classList.add('filled');
        KidsAudio.play('correct');
        setTimeout(() => KidsAudio.speak(`${r.target.word.toLowerCase()}... ${o.word.toLowerCase()}! Rimou!`, { rate: 0.85 }), 400);
        setTimeout(nextRound, 2700);
    } else {
        btn.classList.add('wrong-pick');
        btn.disabled = true;
        KidsAudio.play('wrong');
        KidsAudio.speak(`${r.target.word.toLowerCase()}, ${o.word.toLowerCase()}... não rima. Tente outra!`, { rate: 0.9 });
    }
}

function nextRound() {
    state.round++;
    if (state.round >= state.items.length) return finish();
    showRound();
}

function finish() {
    const n = state.items.length;
    const stars = state.hits >= n - 1 ? 3 : state.hits >= n * 0.6 ? 2 : 1;
    document.getElementById('hits').textContent = state.hits;
    document.getElementById('rounds').textContent = n;
    document.getElementById('stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    showScreen('result-screen');
    KidsAudio.play('win');
    KidsAudio.speak(`Você achou ${state.hits} rimas de primeira! ` +
        (stars === 3 ? 'Parabéns! Você é a rainha das rimas!' : 'Muito bem! Vamos rimar mais?'));
}
