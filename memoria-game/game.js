// Jogo da Memoria - Para criancas de 4 anos
// Mundo de Julia & Livia

// Emojis de animais fofinhos para as cartas
const ANIMALS = [
    '🐶', '🐱', '🐰', '🦊', '🐻', '🐼',
    '🐨', '🦁', '🐯', '🐮', '🐷', '🐸',
    '🐵', '🐔', '🦄', '🐝', '🦋', '🐢',
    '🐙', '🦀'
];

// Estado do jogo
let gameState = {
    level: 'easy',
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

    // Selecionar animais aleatorios
    const shuffledAnimals = [...ANIMALS].sort(() => Math.random() - 0.5);
    const selectedAnimals = shuffledAnimals.slice(0, gameState.totalPairs);

    // Criar pares
    const cardPairs = [...selectedAnimals, ...selectedAnimals];

    // Embaralhar
    gameState.cards = cardPairs.sort(() => Math.random() - 0.5);

    // Criar elementos
    gameState.cards.forEach((animal, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.dataset.animal = animal;
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-back"></div>
                <div class="card-front">${animal}</div>
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

    // Som de clique
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
    const match = card1.dataset.animal === card2.dataset.animal;

    gameState.isLocked = true;

    if (match) {
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
            }, i * 300);
        }
    });

    playSound('win');
    showScreen('win-screen');
}

// Reiniciar jogo
function restartGame() {
    startGame(gameState.level);
}

// Sons simples com Web Audio API
function playSound(type) {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;

        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0.1, now);

        switch(type) {
            case 'flip':
                osc.frequency.setValueAtTime(600, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'match':
                osc.frequency.setValueAtTime(523, now);
                osc.frequency.setValueAtTime(659, now + 0.1);
                osc.frequency.setValueAtTime(784, now + 0.2);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
            case 'wrong':
                osc.frequency.setValueAtTime(200, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
            case 'win':
                osc.frequency.setValueAtTime(523, now);
                osc.frequency.setValueAtTime(659, now + 0.15);
                osc.frequency.setValueAtTime(784, now + 0.3);
                osc.frequency.setValueAtTime(1047, now + 0.45);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
                osc.start(now);
                osc.stop(now + 0.6);
                break;
            case 'star':
                osc.frequency.setValueAtTime(880, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
        }

        setTimeout(() => ctx.close(), 1000);
    } catch(e) {}
}

// Inicializacao
document.addEventListener('DOMContentLoaded', () => {
    showScreen('start-screen');
});
