// Jogo da Memoria - Para criancas de 4 anos
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
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    totalPairs: 0,
    moves: 0,
    isLocked: false,
    startTime: null,
    timerInterval: null
};

// Configuracoes de nivel
const LEVELS = {
    easy: { pairs: 6, cols: 4 },
    medium: { pairs: 8, cols: 4 },
    hard: { pairs: 10, cols: 5 }
};

// Funcao para voltar
function goBack() {
    if (window.parent !== window) {
        try {
            if (window.parent.closeGameModal) {
                window.parent.closeGameModal();
                return;
            }
        } catch(e) {}
    }
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = '../index.html';
    }
}

// Mostrar tela
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Ir para menu inicial
function goToMenu() {
    if (gameState.timerInterval) clearInterval(gameState.timerInterval);
    showScreen('start-screen');
}

// Selecionar tema
function selectTheme(themeName) {
    gameState.theme = themeName;

    // Atualizar visual dos botoes de tema
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.theme === themeName) {
            btn.classList.add('selected');
        }
    });

    // Tocar som de selecao
    playSound('select');
}

// Iniciar jogo
function startGame(level) {
    gameState.level = level;
    gameState.matchedPairs = 0;
    gameState.moves = 0;
    gameState.flippedCards = [];
    gameState.isLocked = false;
    gameState.totalPairs = LEVELS[level].pairs;
    gameState.startTime = Date.now();

    // Atualizar UI
    document.getElementById('moves-count').textContent = '0';
    document.getElementById('pairs-count').textContent = '0';
    document.getElementById('total-pairs').textContent = gameState.totalPairs;

    // Tocar som de inicio
    playSound('start');

    // Criar cartas
    createCards();
    showScreen('game-screen');

    // Mostrar todas as cartas brevemente
    setTimeout(() => {
        document.querySelectorAll('.memory-card').forEach(card => {
            card.classList.add('flipped');
        });
        setTimeout(() => {
            document.querySelectorAll('.memory-card').forEach(card => {
                card.classList.remove('flipped');
            });
        }, 2000);
    }, 300);
}

// Criar cartas
function createCards() {
    const grid = document.getElementById('cards-grid');
    grid.innerHTML = '';
    grid.className = 'cards-grid ' + gameState.level;

    // Obter itens do tema selecionado
    const theme = THEMES[gameState.theme];
    // Usar itens estilizados se disponiveis, senao usar itens normais
    const themeItems = (theme.useStyled && theme.styledItems) ? theme.styledItems : theme.items;

    // Selecionar itens aleatorios
    const shuffledItems = [...themeItems].sort(() => Math.random() - 0.5);
    const selectedItems = shuffledItems.slice(0, gameState.totalPairs);

    // Criar pares
    const cardPairs = [...selectedItems, ...selectedItems];

    // Embaralhar
    gameState.cards = cardPairs.sort(() => Math.random() - 0.5);

    // Verificar se e tema de numeros ou letras para estilo especial
    const isTextTheme = gameState.theme === 'numeros' || gameState.theme === 'letras';

    // Criar elementos
    gameState.cards.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.dataset.item = item;

        // Adicionar classe especial para temas de texto
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

// Virar carta
function flipCard(card) {
    if (gameState.isLocked) return;
    if (card.classList.contains('flipped')) return;
    if (card.classList.contains('matched')) return;
    if (gameState.flippedCards.length >= 2) return;

    // Som de virar carta
    playSound('flip');

    card.classList.add('flipped');
    gameState.flippedCards.push(card);

    if (gameState.flippedCards.length === 2) {
        gameState.moves++;
        document.getElementById('moves-count').textContent = gameState.moves;
        checkMatch();
    }
}

// Verificar par
function checkMatch() {
    const [card1, card2] = gameState.flippedCards;
    const match = card1.dataset.item === card2.dataset.item;

    gameState.isLocked = true;

    if (match) {
        // Som de acerto
        playSound('match');

        card1.classList.add('matched');
        card2.classList.add('matched');
        gameState.matchedPairs++;
        document.getElementById('pairs-count').textContent = gameState.matchedPairs;
        gameState.flippedCards = [];
        gameState.isLocked = false;

        if (gameState.matchedPairs === gameState.totalPairs) {
            setTimeout(showWinScreen, 500);
        }
    } else {
        // Som de erro
        playSound('wrong');

        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            gameState.flippedCards = [];
            gameState.isLocked = false;
        }, 1000);
    }
}

// Tela de vitoria
function showWinScreen() {
    const endTime = Date.now();
    const timeElapsed = Math.floor((endTime - gameState.startTime) / 1000);
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;

    document.getElementById('final-moves').textContent = gameState.moves;
    document.getElementById('final-time').textContent =
        `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Calcular estrelas
    const perfectMoves = gameState.totalPairs;
    const goodMoves = perfectMoves * 1.5;
    let stars = 1;
    if (gameState.moves <= perfectMoves) stars = 3;
    else if (gameState.moves <= goodMoves) stars = 2;

    // Mostrar estrelas
    const starsDisplay = document.getElementById('stars-display');
    starsDisplay.querySelectorAll('.star').forEach((star, i) => {
        star.classList.remove('earned');
        if (i < stars) {
            setTimeout(() => {
                star.classList.add('earned');
                playSound('star');
            }, i * 400);
        }
    });

    // Som de vitoria
    setTimeout(() => playSound('win'), 200);

    showScreen('win-screen');
}

// Reiniciar jogo
function restartGame() {
    startGame(gameState.level);
}

// ==========================================
// SISTEMA DE AUDIO MELHORADO
// ==========================================

function playSound(type) {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;

        const ctx = new AudioCtx();
        const masterGain = ctx.createGain();
        masterGain.connect(ctx.destination);
        masterGain.gain.setValueAtTime(0.15, ctx.currentTime);

        const now = ctx.currentTime;

        switch(type) {
            case 'flip':
                // Som suave de virar carta
                playTone(ctx, masterGain, 880, now, 0.08, 'sine');
                playTone(ctx, masterGain, 1100, now + 0.03, 0.06, 'sine');
                break;

            case 'select':
                // Som de selecao de tema
                playTone(ctx, masterGain, 660, now, 0.1, 'sine');
                playTone(ctx, masterGain, 880, now + 0.08, 0.1, 'sine');
                break;

            case 'start':
                // Som animado de inicio de jogo
                playTone(ctx, masterGain, 523, now, 0.15, 'sine');
                playTone(ctx, masterGain, 659, now + 0.12, 0.15, 'sine');
                playTone(ctx, masterGain, 784, now + 0.24, 0.2, 'sine');
                break;

            case 'match':
                // Melodia alegre de acerto - Do Mi Sol (acorde maior)
                playTone(ctx, masterGain, 523, now, 0.15, 'sine'); // Do
                playTone(ctx, masterGain, 659, now + 0.1, 0.15, 'sine'); // Mi
                playTone(ctx, masterGain, 784, now + 0.2, 0.2, 'sine'); // Sol
                playTone(ctx, masterGain, 1047, now + 0.3, 0.25, 'sine'); // Do agudo
                break;

            case 'wrong':
                // Som triste mas gentil - notas descendentes
                playTone(ctx, masterGain, 330, now, 0.2, 'sine');
                playTone(ctx, masterGain, 277, now + 0.15, 0.25, 'sine');
                break;

            case 'star':
                // Som brilhante de estrela
                playTone(ctx, masterGain, 1047, now, 0.1, 'sine');
                playTone(ctx, masterGain, 1319, now + 0.08, 0.15, 'sine');
                playTone(ctx, masterGain, 1568, now + 0.16, 0.2, 'triangle');
                break;

            case 'win':
                // Fanfarra de vitoria - melodia completa
                const melody = [
                    { freq: 523, time: 0, dur: 0.15 },     // Do
                    { freq: 523, time: 0.15, dur: 0.15 },  // Do
                    { freq: 523, time: 0.3, dur: 0.15 },   // Do
                    { freq: 659, time: 0.45, dur: 0.3 },   // Mi
                    { freq: 784, time: 0.75, dur: 0.15 },  // Sol
                    { freq: 784, time: 0.9, dur: 0.15 },   // Sol
                    { freq: 659, time: 1.05, dur: 0.15 },  // Mi
                    { freq: 784, time: 1.2, dur: 0.15 },   // Sol
                    { freq: 1047, time: 1.35, dur: 0.4 }   // Do agudo
                ];
                melody.forEach(note => {
                    playTone(ctx, masterGain, note.freq, now + note.time, note.dur, 'sine');
                });
                break;
        }

        // Fechar contexto depois de um tempo
        const maxDuration = type === 'win' ? 2000 : 800;
        setTimeout(() => {
            try { ctx.close(); } catch(e) {}
        }, maxDuration);

    } catch(e) {
        console.log('Audio error:', e);
    }
}

// Funcao auxiliar para tocar um tom
function playTone(ctx, masterGain, frequency, startTime, duration, waveType = 'sine') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = waveType;
    osc.frequency.setValueAtTime(frequency, startTime);

    osc.connect(gain);
    gain.connect(masterGain);

    // Envelope suave
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.3, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
}

// Criar botoes de tema dinamicamente
function createThemeButtons() {
    const container = document.getElementById('theme-selector');
    if (!container) return;

    container.innerHTML = '';

    Object.keys(THEMES).forEach(themeKey => {
        const theme = THEMES[themeKey];
        const btn = document.createElement('button');
        btn.className = 'theme-btn' + (themeKey === 'animais' ? ' selected' : '');
        btn.dataset.theme = themeKey;
        btn.onclick = () => selectTheme(themeKey);
        btn.innerHTML = `
            <span class="theme-icon">${theme.icon}</span>
            <span class="theme-name">${theme.name}</span>
        `;
        container.appendChild(btn);
    });
}

// Inicializacao
document.addEventListener('DOMContentLoaded', () => {
    createThemeButtons();
    showScreen('start-screen');
});
