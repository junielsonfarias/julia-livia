// ==========================================
// Som da Letra - Livia (5 anos) - consciencia fonologica / alfabetica
// BNCC EI03EF09 (escrita espontanea, relacao letra-som)
// Modos: letra do comeco, vogal que falta, ache a figura
// ==========================================

const ROUNDS = 10;
const VOGAIS = ['A', 'E', 'I', 'O', 'U'];
const state = { mode: 'inicial', round: 0, items: [], current: null, tries: 0, misses: 0, hits: 0, locked: false };

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

// Letra inicial sem acento (Á -> A)
const firstLetter = w => semAcento(w.word)[0];

// Palavras com figura clara; evitamos letras com som enganoso para iniciantes (H muda, X/Q/K/W/Y)
function wordPool() {
    return getPalavras('variadas').filter(w => !/^[HXQKWY]/.test(semAcento(w.word)));
}
// Para "letra do comeco"/"ache a figura": evita inicio com som diferente do nome da letra
// (CE/CI soam como S, GE/GI como J, CH como X) - confunde quem esta aprendendo.
const SOM_ENGANOSO = /^(CE|CI|GE|GI|CH)/;
function soundPool() {
    return wordPool().filter(w => !SOM_ENGANOSO.test(semAcento(w.word)));
}

function speakIntro() {
    KidsAudio.speak('Som da letra! Escolha um jogo. Verde: com que letra começa a palavra. ' +
        'Azul: qual vogal está faltando. Roxo: ache a figura que começa com a letra. Rosa: tudo misturado.', { rate: 0.9 });
}

function startGame(mode) {
    state.mode = mode;
    state.round = 0;
    state.hits = 0;
    const used = new Set();
    state.items = [];
    for (let i = 0; i < ROUNDS; i++) {
        const kind = mode === 'misturado' ? ['inicial', 'vogal', 'figura'][Math.floor(Math.random() * 3)] : mode;
        const pool = kind === 'vogal' ? wordPool() : soundPool();
        const w = shuffle(pool).find(x => !used.has(x.word));
        if (!w) break;
        used.add(w.word);
        state.items.push({ word: w, kind });
    }
    document.getElementById('total').textContent = state.items.length;
    Letrinhas.serie.zerar();
    KidsAudio.play('start');
    showScreen('game-screen');
    showRound(true);
}

function showRound(first) {
    const item = state.items[state.round];
    state.current = item;
    state.tries = 0;
    state.misses = 0;
    state.locked = false;
    document.getElementById('round').textContent = state.round + 1;
    // Primeira rodada monta direto; as outras entram deslizando
    if (first) renderRound(item);
    else Letrinhas.trocar([document.getElementById('card'), document.getElementById('options')], () => renderRound(item));
    // interrupt:false = espera o elogio da rodada anterior terminar antes de perguntar
    setTimeout(() => { if (state.current === item) sayPrompt(false); }, 350);
}

function renderRound(item) {
    const w = item.word;
    const pic = document.getElementById('picture');
    const blank = document.getElementById('blank-word');
    const prompt = document.getElementById('prompt');
    const opts = document.getElementById('options');
    opts.innerHTML = '';
    opts.className = 'letter-options';

    if (item.kind === 'inicial') {
        item.answer = firstLetter(w);
        prompt.textContent = 'Com que letra começa?';
        pic.innerHTML = Letrinhas.fig(w.emoji, 'big-fig breathe');
        blank.innerHTML = `<span class="gap">?</span>${w.word.slice(1)}`;
        const others = shuffle('ABCDEFGJLMNOPRSTUV'.split('').filter(l => l !== item.answer)).slice(0, 2);
        shuffle([item.answer, ...others]).forEach(l => addLetterButton(l));
    } else if (item.kind === 'vogal') {
        // escolhe uma vogal (sem acento) da palavra para esconder
        const letters = w.word.split('');
        // Nao esconde vogal que nao se ouve: U mudo de QUE/QUI/GUE/GUI (BONEQUINHA, FOGUETE)
        // nem a vogal do som nasal ÃO/ÃE (AVIÃO, MÃE)
        // nem o U do OU (CENOURA, TESOURA soam "cenora", "tesora")
        const silent = i => (letters[i] === 'U' && /[QG]/.test(letters[i - 1] || '') && /[EIÉÊÍ]/.test(letters[i + 1] || '')) ||
            (letters[i] === 'U' && letters[i - 1] === 'O') ||
            /[ÃÕ]/.test(letters[i - 1] || '');
        const positions = letters.map((ch, i) => VOGAIS.includes(ch) && !silent(i) ? i : -1).filter(i => i >= 0);
        if (!positions.length) { item.kind = 'inicial'; return renderRound(item); }
        const pos = positions[Math.floor(Math.random() * positions.length)];
        item.answer = letters[pos];
        prompt.textContent = 'Qual vogal está faltando?';
        pic.innerHTML = Letrinhas.fig(w.emoji, 'big-fig breathe');
        blank.innerHTML = letters.map((ch, i) => i === pos ? '<span class="gap">?</span>' : ch).join('');
        VOGAIS.forEach(l => addLetterButton(l));
    } else {
        // ache a figura: mostra a letra, opcoes sao figuras
        item.answer = w.word;
        const letter = firstLetter(w);
        item.letter = letter;
        prompt.textContent = 'Qual figura começa com a letra:';
        pic.innerHTML = `<span class="big-letter">${letter}</span>`;
        blank.innerHTML = '';
        // 2 figuras de outras letras, sem repetir desenho (ex.: PANELA e PANELINHA usam 🍳)
        const others = [];
        for (const o of shuffle(soundPool())) {
            if (firstLetter(o) === letter || o.emoji === w.emoji || others.some(x => x.emoji === o.emoji)) continue;
            others.push(o);
            if (others.length === 2) break;
        }
        opts.classList.add('pictures');
        shuffle([w, ...others]).forEach(o => {
            const b = document.createElement('button');
            b.className = 'letter-btn picture-btn';
            b.innerHTML = Letrinhas.fig(o.emoji);
            b.dataset.ok = o.word === w.word ? '1' : '0';
            b.setAttribute('aria-label', o.word.toLowerCase());
            b.onclick = () => choose(b, o.word === w.word, o);
            opts.appendChild(b);
        });
    }
}

function addLetterButton(letter) {
    const b = document.createElement('button');
    b.className = 'letter-btn';
    b.textContent = letter;
    b.dataset.v = letter;
    b.dataset.ok = letter === state.current.answer ? '1' : '0';
    b.onclick = () => choose(b, letter === state.current.answer);
    document.getElementById('options').appendChild(b);
}

function sayPrompt(interrupt) {
    const item = state.current;
    if (!item) return;
    const word = item.word.word.toLowerCase();
    const o = { rate: 0.85, interrupt: interrupt !== false };
    if (item.kind === 'inicial') KidsAudio.speak(`Com que letra começa ${word}?`, o);
    else if (item.kind === 'vogal') KidsAudio.speak(`Qual vogal falta em ${word}?`, o);
    else KidsAudio.speak(`Qual figura começa com a letra ${item.letter}?`, o);
}

function choose(btn, ok, pictureWord) {
    if (state.locked || btn.disabled) return;
    const item = state.current;
    state.tries++;
    if (ok) {
        state.locked = true;
        if (state.tries === 1) state.hits++;
        btn.classList.remove('dica-certa');
        btn.classList.add('right');
        KidsAudio.play('correct');
        Letrinhas.serie.acerto(btn, { emoji: ['⭐', '✨'] });
        const w = item.word;
        const blank = document.getElementById('blank-word');
        blank.textContent = w.word;
        Efeitos.pulo(blank);
        if (item.kind === 'figura') document.getElementById('picture').innerHTML = `<span class="big-letter">${item.letter}</span> ${Letrinhas.fig(w.emoji, 'big-fig')}`;
        setTimeout(() => {
            const letter = item.kind === 'vogal' ? item.answer : firstLetter(w);
            KidsAudio.speak(`Isso! ${letter}... ${w.word.toLowerCase()}!`, { rate: 0.85 });
        }, 400);
        setTimeout(nextRound, 2400);
    } else {
        state.misses++;
        Letrinhas.serie.erro();
        btn.classList.add('wrong-pick');
        KidsAudio.play('wrong');
        // Erro sem frustracao: 1o balanca e repete, 2o apaga uma opcao errada, 3o acende a certa
        const all = [...document.querySelectorAll('#options .letter-btn')];
        Letrinhas.ajuda(state.misses, { tocado: btn, erradas: all.filter(b => b.dataset.ok !== '1'), certa: all.find(b => b.dataset.ok === '1') });
        setTimeout(() => btn.classList.remove('wrong-pick'), 400);
        if (state.misses >= 3) {
            const w = item.word.word.toLowerCase();
            KidsAudio.speak(item.kind === 'figura' ? `Olhe a figura que brilha: ${w}!` : `Olhe a letra que brilha! ${w}.`, { rate: 0.9 });
        } else if (pictureWord) KidsAudio.speak(`${pictureWord.word.toLowerCase()} começa com ${firstLetter(pictureWord)}. Tente outra!`, { rate: 0.9 });
        else { KidsAudio.speak('Tente de novo!', { rate: 0.95 }); setTimeout(() => { if (state.current === item && !state.locked) sayPrompt(false); }, 300); }
    }
}

function nextRound() {
    state.round++;
    if (state.round >= state.items.length) return finish();
    showRound(false);
}

function finish() {
    const stars = state.hits >= 9 ? 3 : state.hits >= 6 ? 2 : 1;
    document.getElementById('hits').textContent = state.hits;
    document.getElementById('rounds').textContent = state.items.length;
    showScreen('result-screen');
    Letrinhas.estrelas(document.getElementById('stars'), stars);
    KidsAudio.play('win');
    setTimeout(() => Efeitos.vitoria(), 250);
    KidsAudio.speak(`Você acertou ${state.hits} de primeira! ` +
        (stars === 3 ? 'Parabéns! Você é craque nas letras!' : 'Muito bem! Vamos jogar de novo?'));
}
