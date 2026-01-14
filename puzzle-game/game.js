// Jogo de Quebra-Cabeca - Para criancas de 4 anos
// Mundo de Julia & Livia

// Imagens para os puzzles (cada imagem tem 9 pecas - emojis que formam um tema)
const PUZZLES = [
    {
        name: 'Animais',
        image: '🐶',
        pieces: ['🐶', '🐱', '🐰', '🐻', '🦊', '🐼', '🐨', '🦁', '🐯']
    },
    {
        name: 'Frutas',
        image: '🍎',
        pieces: ['🍎', '🍌', '🍊', '🍇', '🍓', '🍑', '🍒', '🥝', '🍋']
    },
    {
        name: 'Flores',
        image: '🌸',
        pieces: ['🌸', '🌺', '🌻', '🌷', '🌹', '💐', '🌼', '🪻', '🌾']
    },
    {
        name: 'Natureza',
        image: '🌳',
        pieces: ['🌳', '🌲', '🌴', '🌵', '🌿', '🍀', '🌱', '🪴', '🍃']
    },
    {
        name: 'Espaco',
        image: '🚀',
        pieces: ['🚀', '🌙', '⭐', '🌟', '☀️', '🪐', '🌍', '🌈', '☁️']
    },
    {
        name: 'Doces',
        image: '🍭',
        pieces: ['🍭', '🍬', '🍫', '🧁', '🎂', '🍩', '🍪', '🍰', '🍦']
    }
];

// Estado do jogo
let gameState = {
    currentPuzzle: null,
    moves: 0,
    placedPieces: [],
    selectedPiece: null
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
    showScreen('start-screen');
}

// Inicializacao
document.addEventListener('DOMContentLoaded', () => {
    createPuzzleOptions();
    showScreen('start-screen');
});

// Criar opcoes de puzzle
function createPuzzleOptions() {
    const optionsContainer = document.getElementById('puzzle-options');
    optionsContainer.innerHTML = '';

    PUZZLES.forEach((puzzle, index) => {
        const option = document.createElement('button');
        option.className = 'puzzle-option';
        option.textContent = puzzle.image;
        option.title = puzzle.name;
        option.onclick = () => startPuzzle(index);
        optionsContainer.appendChild(option);
    });
}

// Iniciar puzzle
function startPuzzle(index) {
    gameState.currentPuzzle = PUZZLES[index];
    gameState.moves = 0;
    gameState.placedPieces = new Array(9).fill(null);
    gameState.selectedPiece = null;

    updateMoves();
    setupPuzzleBoard();
    setupPiecesTray();
    showScreen('game-screen');

    document.getElementById('puzzle-image').textContent = gameState.currentPuzzle.image;
}

// Atualizar contador de jogadas
function updateMoves() {
    document.getElementById('moves').textContent = gameState.moves;
}

// Configurar tabuleiro do puzzle
function setupPuzzleBoard() {
    const board = document.getElementById('puzzle-board');
    board.innerHTML = '';

    for (let i = 0; i < 9; i++) {
        const slot = document.createElement('div');
        slot.className = 'puzzle-slot';
        slot.dataset.index = i;
        slot.onclick = () => placeSelectedPiece(i);
        board.appendChild(slot);
    }
}

// Configurar bandeja de pecas
function setupPiecesTray() {
    const tray = document.getElementById('pieces-tray');
    tray.innerHTML = '';

    // Embaralhar pecas
    const shuffledPieces = [...gameState.currentPuzzle.pieces].sort(() => Math.random() - 0.5);

    shuffledPieces.forEach((piece, originalIndex) => {
        const pieceEl = document.createElement('div');
        pieceEl.className = 'puzzle-piece';
        pieceEl.textContent = piece;
        pieceEl.dataset.piece = piece;

        // Encontrar o indice correto desta peca
        pieceEl.dataset.correctIndex = gameState.currentPuzzle.pieces.indexOf(piece);

        pieceEl.onclick = () => selectPiece(pieceEl);

        // Suporte a drag and drop
        pieceEl.draggable = true;
        pieceEl.ondragstart = (e) => {
            pieceEl.classList.add('dragging');
            e.dataTransfer.setData('text/plain', piece);
            e.dataTransfer.setData('correctIndex', pieceEl.dataset.correctIndex);
        };
        pieceEl.ondragend = () => pieceEl.classList.remove('dragging');

        tray.appendChild(pieceEl);
    });

    // Adicionar eventos de drop nos slots
    document.querySelectorAll('.puzzle-slot').forEach(slot => {
        slot.ondragover = (e) => {
            e.preventDefault();
            slot.classList.add('highlight');
        };
        slot.ondragleave = () => slot.classList.remove('highlight');
        slot.ondrop = (e) => {
            e.preventDefault();
            slot.classList.remove('highlight');
            const piece = e.dataTransfer.getData('text/plain');
            const correctIndex = parseInt(e.dataTransfer.getData('correctIndex'));
            const slotIndex = parseInt(slot.dataset.index);
            placePiece(piece, slotIndex, correctIndex);
        };
    });
}

// Selecionar peca (para mobile/click)
function selectPiece(pieceEl) {
    // Remover selecao anterior
    document.querySelectorAll('.puzzle-piece').forEach(p => p.classList.remove('selected'));

    // Selecionar esta peca
    pieceEl.classList.add('selected');
    gameState.selectedPiece = {
        element: pieceEl,
        piece: pieceEl.dataset.piece,
        correctIndex: parseInt(pieceEl.dataset.correctIndex)
    };

    playSound('click');
}

// Colocar peca selecionada no slot
function placeSelectedPiece(slotIndex) {
    if (!gameState.selectedPiece) return;

    placePiece(
        gameState.selectedPiece.piece,
        slotIndex,
        gameState.selectedPiece.correctIndex
    );
}

// Colocar peca no slot
function placePiece(piece, slotIndex, correctIndex) {
    const slot = document.querySelectorAll('.puzzle-slot')[slotIndex];

    // Verificar se o slot ja esta ocupado
    if (gameState.placedPieces[slotIndex] !== null) {
        return;
    }

    gameState.moves++;
    updateMoves();

    // Verificar se a peca esta no lugar correto
    if (slotIndex === correctIndex) {
        // Correto!
        slot.textContent = piece;
        slot.classList.add('filled');
        gameState.placedPieces[slotIndex] = piece;

        // Remover peca da bandeja
        const pieceEl = document.querySelector(`.puzzle-piece[data-piece="${piece}"]`);
        if (pieceEl) pieceEl.remove();

        playSound('correct');

        // Verificar se completou
        if (gameState.placedPieces.filter(p => p !== null).length === 9) {
            setTimeout(showWinScreen, 500);
        }
    } else {
        // Errado
        slot.classList.add('wrong');
        setTimeout(() => slot.classList.remove('wrong'), 500);
        playSound('wrong');
    }

    // Limpar selecao
    document.querySelectorAll('.puzzle-piece').forEach(p => p.classList.remove('selected'));
    gameState.selectedPiece = null;
}

// Tela de vitoria
function showWinScreen() {
    document.getElementById('win-image').textContent = gameState.currentPuzzle.image;
    document.getElementById('final-moves').textContent = gameState.moves;

    // Calcular estrelas baseado nas jogadas
    const perfectMoves = 9; // Minimo de jogadas
    let stars = 1;
    if (gameState.moves <= perfectMoves) stars = 3;
    else if (gameState.moves <= perfectMoves * 1.5) stars = 2;

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

// Sons
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
            case 'click':
                osc.frequency.setValueAtTime(600, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'correct':
                osc.frequency.setValueAtTime(523, now);
                osc.frequency.setValueAtTime(659, now + 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            case 'wrong':
                osc.frequency.setValueAtTime(200, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
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
