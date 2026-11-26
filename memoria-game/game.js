// Jogo da Memoria - Livia (5 anos) e duelo Julia x Livia
// Mundo de Julia & Livia

// Temas com diferentes tipos de personagens
const THEMES = {
    animais: {
        name: 'Animais',
        icon: '🐶',
        items: ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐮', '🐷', '🐸', '🐵', '🦄', '🐝', '🦋', '🐢', '🐙', '🦀', '🐧']
    },
    frutas: {
        name: 'Frutas',
        icon: '🍎',
        items: ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🍒', '🍌', '🍉', '🥝', '🍍', '🥭', '🍐', '🫐', '🍈', '🥥', '🍏', '🍅', '🥑', '🍆']
    },
    veiculos: {
        name: 'Veiculos',
        icon: '🚗',
        items: ['🚗', '🚕', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '✈️', '🚀', '🛸', '🚁', '⛵', '🚢', '🚂', '🚲', '🛵', '🏍️', '🚜', '🛺']
    },
    comidas: {
        name: 'Comidas',
        icon: '🍕',
        items: ['🍕', '🍔', '🍟', '🌭', '🍿', '🧁', '🍩', '🍪', '🎂', '🍰', '🍫', '🍬', '🍭', '🧇', '🥞', '🍦', '🥧', '🧀', '🥐', '🥯']
    },
    natureza: {
        name: 'Natureza',
        icon: '🌸',
        items: ['🌸', '🌺', '🌻', '🌹', '🌷', '💐', '🌵', '🍀', '🌈', '⭐', '🌙', '☀️', '🌊', '❄️', '🍁', '🍂', '🌴', '🌲', '🎄', '🪻']
    },
    brinquedos: {
        name: 'Brinquedos',
        icon: '🎈',
        items: ['🎈', '🎁', '🪀', '🧸', '🎮', '🎯', '🎨', '🎭', '🎪', '🎠', '🎡', '🎢', '🪁', '⚽', '🏀', '🎾', '🎳', '🎲', '🧩', '🪆']
    },
    espaco: {
        name: 'Espaco',
        icon: '🚀',
        items: ['🚀', '🛸', '🌎', '🌍', '🌏', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '⭐', '🌟', '💫', '✨', '☄️', '🪐', '👽']
    },
    rostos: {
        name: 'Carinhas',
        icon: '😊',
        items: ['😊', '😄', '😃', '🥰', '😍', '🤩', '😎', '🤗', '🤭', '😇', '🥳', '😺', '😸', '😻', '🙈', '🙉', '🙊', '👶', '🧒', '👧']
    },
    numeros: {
        name: 'Numeros',
        icon: '🔢',
        items: ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '💯', '🥇', '🥈', '🥉', '#️⃣', '*️⃣', '🔢', '➕', '➖'],
        // Versao alternativa com numeros estilizados para facilitar reconhecimento
        useStyled: true,
        styledItems: ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱', '⑲', '⑳']
    },
    letras: {
        name: 'Letras',
        icon: '🔤',
        items: ['🅰️', '🅱️', '©️', '®️', '🅾️', '🅿️', 'Ⓜ️', '🆎', '🆑', '🆒'],
        // Versao com letras estilizadas para o alfabeto completo
        useStyled: true,
        styledItems: ['Ⓐ', 'Ⓑ', 'Ⓒ', 'Ⓓ', 'Ⓔ', 'Ⓕ', 'Ⓖ', 'Ⓗ', 'Ⓘ', 'Ⓙ', 'Ⓚ', 'Ⓛ', 'Ⓜ', 'Ⓝ', 'Ⓞ', 'Ⓟ', 'Ⓠ', 'Ⓡ', 'Ⓢ', 'Ⓣ', 'Ⓤ', 'Ⓥ', 'Ⓦ', 'Ⓧ', 'Ⓨ', 'Ⓩ']
    }
};

// Estado do jogo
let gameState = {
    level: 'easy',
    theme: 'animais',
    mode: 'solo',           // 'solo' ou 'duel'
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    totalPairs: 0,
    moves: 0,
    isLocked: true,
    startTime: null,
    // Duelo
    players: ['julia', 'livia'],
    currentPlayer: 0,
    scores: { julia: 0, livia: 0 },
    extraTurn: false
};

const PLAYER_INFO = {
    julia: { name: 'Julia', emoji: '👸' },
    livia: { name: 'Livia', emoji: '🧚' }
};

const DUEL_KEY = 'memoria_duelos_v1';
const PRAISES = ['Acertou!', 'Muito bem!', 'Isso aí!', 'Que memória!', 'Parabéns!', 'Uhuu!'];
const TRY_AGAIN = ['Ops! Tente de novo!', 'Quase!', 'Não foi dessa vez!'];

// Configuracoes de nivel
const LEVELS = {
    easy: { pairs: 6, cols: 4 },
    medium: { pairs: 8, cols: 4 },
    hard: { pairs: 10, cols: 5 }
};

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Funcao para voltar
function goBack() {
    if (window.parent !== window) {
        try {
            if (window.parent.closeGameModal) {
                window.parent.closeGameModal();
                return;
            }
        } catch (e) {}
    }
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = '../index.html';
    }
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function goToMenu() {
    gameState.isLocked = true;
    renderDuelHistory();
    showScreen('start-screen');
}

function selectTheme(themeName) {
    gameState.theme = themeName;
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.theme === themeName);
    });
    playSound('select');
}

function selectMode(mode) {
    gameState.mode = mode;
    document.querySelectorAll('.mode-pick').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.mode === mode);
    });
    document.getElementById('duel-options').hidden = mode !== 'duel';
    renderDuelHistory();
    playSound('select');
}

// ---------- Historico de duelos ----------
function loadDuelHistory() {
    const empty = { julia: 0, livia: 0, empates: 0, lastStarter: 'livia' };
    try {
        return Object.assign(empty, JSON.parse(localStorage.getItem(DUEL_KEY)) || {});
    } catch (e) {
        return empty;
    }
}
function saveDuelHistory(h) {
    try { localStorage.setItem(DUEL_KEY, JSON.stringify(h)); } catch (e) {}
}
function renderDuelHistory() {
    const h = loadDuelHistory();
    const html = `🏆 Vitórias — 👸 Julia: <b>${h.julia}</b> · 🧚 Livia: <b>${h.livia}</b>` +
        (h.empates ? ` · 🤝 Empates: <b>${h.empates}</b>` : '');
    ['duel-history', 'duel-history-end'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    });
}

// ---------- Jogo ----------
function startGame(level) {
    gameState.level = level;
    gameState.matchedPairs = 0;
    gameState.moves = 0;
    gameState.flippedCards = [];
    gameState.isLocked = true;
    gameState.totalPairs = LEVELS[level].pairs;
    gameState.startTime = Date.now();
    gameState.scores = { julia: 0, livia: 0 };
    gameState.extraTurn = document.getElementById('opt-extra-turn').checked;

    document.getElementById('moves-count').textContent = '0';
    document.getElementById('pairs-count').textContent = '0';
    document.getElementById('total-pairs').textContent = gameState.totalPairs;

    const isDuel = gameState.mode === 'duel';
    document.getElementById('duel-board').hidden = !isDuel;
    if (isDuel) {
        // Alterna quem comeca a cada partida
        const h = loadDuelHistory();
        const starter = h.lastStarter === 'julia' ? 'livia' : 'julia';
        h.lastStarter = starter;
        saveDuelHistory(h);
        gameState.currentPlayer = gameState.players.indexOf(starter);
        updateDuelBoard();
    }

    playSound('start');
    createCards();
    showScreen('game-screen');

    // Mostrar todas as cartas brevemente
    setTimeout(() => {
        document.querySelectorAll('.memory-card').forEach(card => card.classList.add('flipped'));
        setTimeout(() => {
            document.querySelectorAll('.memory-card').forEach(card => card.classList.remove('flipped'));
            gameState.isLocked = false;
            if (isDuel) announceTurn();
        }, 2000);
    }, 300);
}

function createCards() {
    const grid = document.getElementById('cards-grid');
    grid.innerHTML = '';
    grid.className = 'cards-grid ' + gameState.level;

    const theme = THEMES[gameState.theme];
    const themeItems = (theme.useStyled && theme.styledItems) ? theme.styledItems : theme.items;
    const selectedItems = shuffleArray(themeItems).slice(0, gameState.totalPairs);
    gameState.cards = shuffleArray([...selectedItems, ...selectedItems]);

    const isTextTheme = gameState.theme === 'numeros' || gameState.theme === 'letras';

    gameState.cards.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.dataset.item = item;
        const textClass = isTextTheme ? ' text-theme' : '';
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-back"></div>
                <div class="card-front${textClass}">${item}</div>
            </div>
        `;
        card.addEventListener('click', () => flipCard(card));
        grid.appendChild(card);
    });
}

function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function flipCard(card) {
    if (gameState.isLocked) return;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
    if (gameState.flippedCards.length >= 2) return;

    playSound('flip');
    card.classList.add('flipped');
    gameState.flippedCards.push(card);

    if (gameState.flippedCards.length === 2) {
        gameState.moves++;
        document.getElementById('moves-count').textContent = gameState.moves;
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = gameState.flippedCards;
    const match = card1.dataset.item === card2.dataset.item;
    const isDuel = gameState.mode === 'duel';
    const player = gameState.players[gameState.currentPlayer];

    gameState.isLocked = true;

    if (match) {
        playSound('correct');
        const owner = 'by-' + (isDuel ? player : 'solo');
        card1.classList.add('matched', owner);
        card2.classList.add('matched', owner);
        gameState.matchedPairs++;
        document.getElementById('pairs-count').textContent = gameState.matchedPairs;
        gameState.flippedCards = [];

        if (isDuel) {
            gameState.scores[player]++;
            updateDuelBoard(true);
            const praise = rand(PRAISES);
            showToast(`${PLAYER_INFO[player].emoji} ${praise}`, 'good');
            speak(`${praise} Ponto para ${PLAYER_INFO[player].name}!`);
        } else {
            const praise = rand(PRAISES);
            showToast(praise, 'good');
            speak(praise);
        }

        if (gameState.matchedPairs === gameState.totalPairs) {
            setTimeout(showWinScreen, 1000);
            return;
        }

        setTimeout(() => {
            if (isDuel && !gameState.extraTurn) nextPlayer();
            gameState.isLocked = false;
        }, 1000);
    } else {
        playSound('wrong');
        card1.classList.add('miss');
        card2.classList.add('miss');
        showToast(rand(TRY_AGAIN), 'bad');

        setTimeout(() => {
            card1.classList.remove('flipped', 'miss');
            card2.classList.remove('flipped', 'miss');
            gameState.flippedCards = [];
            if (isDuel) nextPlayer();
            gameState.isLocked = false;
        }, 1200);
    }
}

// ---------- Duelo ----------
function nextPlayer() {
    gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
    updateDuelBoard();
    announceTurn();
}

function announceTurn() {
    const p = PLAYER_INFO[gameState.players[gameState.currentPlayer]];
    playSound('turn');
    speak(`Vez da ${p.name}!`, { interrupt: false });
}

function updateDuelBoard(bump) {
    const current = gameState.players[gameState.currentPlayer];
    ['julia', 'livia'].forEach(p => {
        document.getElementById('panel-' + p).classList.toggle('active', p === current);
        const scoreEl = document.getElementById('score-' + p);
        scoreEl.textContent = gameState.scores[p];
        if (bump && p === current) {
            scoreEl.classList.remove('bump'); void scoreEl.offsetWidth; scoreEl.classList.add('bump');
        }
    });
    const banner = document.getElementById('turn-banner');
    banner.textContent = `Vez da ${PLAYER_INFO[current].name}!`;
    banner.className = 'turn-banner ' + current;
    document.getElementById('cards-grid').dataset.turn = current;
}

function showToast(text, kind) {
    const t = document.getElementById('feedback-toast');
    t.textContent = text;
    t.className = 'feedback-toast show ' + kind;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => { t.className = 'feedback-toast'; }, 1100);
}

// ---------- Vitoria ----------
function showWinScreen() {
    const timeElapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;

    document.getElementById('final-moves').textContent = gameState.moves;
    document.getElementById('final-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const isDuel = gameState.mode === 'duel';
    const titleEl = document.querySelector('#win-screen h2');
    const msgEl = document.querySelector('#win-screen .win-content > p');
    const iconEl = document.querySelector('#win-screen .win-icon');
    const starsDisplay = document.getElementById('stars-display');
    document.getElementById('duel-result').hidden = !isDuel;
    starsDisplay.hidden = isDuel;

    if (isDuel) {
        const { julia, livia } = gameState.scores;
        const h = loadDuelHistory();
        document.getElementById('final-julia').textContent = julia;
        document.getElementById('final-livia').textContent = livia;
        if (julia === livia) {
            h.empates++;
            iconEl.textContent = '🤝';
            titleEl.textContent = 'Empate!';
            msgEl.textContent = 'As duas foram incríveis!';
            speak('Empate! As duas foram incríveis!');
        } else {
            const winner = julia > livia ? 'julia' : 'livia';
            h[winner]++;
            iconEl.textContent = '🏆';
            titleEl.textContent = `${PLAYER_INFO[winner].name} venceu!`;
            msgEl.textContent = `Parabéns, ${PLAYER_INFO[winner].name}! Que memória!`;
            speak(`${PLAYER_INFO[winner].name} venceu! Parabéns!`);
        }
        saveDuelHistory(h);
        renderDuelHistory();
    } else {
        iconEl.textContent = '🎉';
        titleEl.textContent = 'Parabéns!';
        msgEl.textContent = 'Você encontrou todos os pares!';
        speak('Parabéns! Você encontrou todos os pares!');

        const perfectMoves = gameState.totalPairs;
        let stars = 1;
        if (gameState.moves <= perfectMoves * 1.5) stars = 3;
        else if (gameState.moves <= perfectMoves * 2.2) stars = 2;

        starsDisplay.querySelectorAll('.star').forEach((star, i) => {
            star.classList.remove('earned');
            if (i < stars) {
                setTimeout(() => { star.classList.add('earned'); playSound('star'); }, 600 + i * 400);
            }
        });
    }

    setTimeout(() => playSound('win'), 200);
    showScreen('win-screen');
}

function restartGame() {
    startGame(gameState.level);
}

// ---------- Audio (modulo compartilhado) ----------
function playSound(type) {
    if (window.KidsAudio) KidsAudio.play(type);
}

function speak(text, opts) {
    if (window.KidsAudio) KidsAudio.speak(text, opts);
}

// Criar botoes de tema dinamicamente
function createThemeButtons() {
    const container = document.getElementById('theme-selector');
    if (!container) return;
    container.innerHTML = '';
    Object.keys(THEMES).forEach(themeKey => {
        const theme = THEMES[themeKey];
        const btn = document.createElement('button');
        btn.className = 'theme-btn' + (themeKey === gameState.theme ? ' selected' : '');
        btn.dataset.theme = themeKey;
        btn.onclick = () => selectTheme(themeKey);
        btn.innerHTML = `
            <span class="theme-icon">${theme.icon}</span>
            <span class="theme-name">${theme.name}</span>
        `;
        container.appendChild(btn);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    createThemeButtons();
    renderDuelHistory();
    showScreen('start-screen');
});
