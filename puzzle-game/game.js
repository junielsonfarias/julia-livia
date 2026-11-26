// Jogo de Quebra-Cabeca - Para criancas de 4 anos
// Mundo de Julia & Livia
// Melhoria: Niveis de dificuldade e temas educativos

// Configuracoes de dificuldade
const DIFFICULTY = {
    easy: { grid: 2, total: 4, name: 'Fácil' },
    medium: { grid: 3, total: 9, name: 'Médio' },
    hard: { grid: 4, total: 16, name: 'Difícil' }
};

// Temas de puzzles
const PUZZLE_THEMES = {
    emojis: [
        {
            name: 'Animais',
            image: '🐶',
            pieces4: ['🐶', '🐱', '🐰', '🐻'],
            pieces9: ['🐶', '🐱', '🐰', '🐻', '🦊', '🐼', '🐨', '🦁', '🐯'],
            pieces16: ['🐶', '🐱', '🐰', '🐻', '🦊', '🐼', '🐨', '🦁', '🐯', '🐮', '🐷', '🐸', '🐵', '🐔', '🦆', '🦋']
        },
        {
            name: 'Frutas',
            image: '🍎',
            pieces4: ['🍎', '🍌', '🍊', '🍇'],
            pieces9: ['🍎', '🍌', '🍊', '🍇', '🍓', '🍑', '🍒', '🥝', '🍋'],
            pieces16: ['🍎', '🍌', '🍊', '🍇', '🍓', '🍑', '🍒', '🥝', '🍋', '🍐', '🥭', '🍍', '🥥', '🍈', '🫐', '🍏']
        },
        {
            name: 'Natureza',
            image: '🌳',
            pieces4: ['🌳', '🌲', '🌴', '🌵'],
            pieces9: ['🌳', '🌲', '🌴', '🌵', '🌿', '🍀', '🌱', '🪴', '🍃'],
            pieces16: ['🌳', '🌲', '🌴', '🌵', '🌿', '🍀', '🌱', '🪴', '🍃', '🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '🌾']
        },
        {
            name: 'Espaço',
            image: '🚀',
            pieces4: ['🚀', '🌙', '⭐', '🪐'],
            pieces9: ['🚀', '🌙', '⭐', '🌟', '☀️', '🪐', '🌍', '🌈', '☁️'],
            pieces16: ['🚀', '🌙', '⭐', '🌟', '☀️', '🪐', '🌍', '🌈', '☁️', '🌎', '🌏', '💫', '✨', '🌤️', '🌥️', '🛸']
        },
        {
            name: 'Doces',
            image: '🍭',
            pieces4: ['🍭', '🍬', '🍫', '🧁'],
            pieces9: ['🍭', '🍬', '🍫', '🧁', '🎂', '🍩', '🍪', '🍰', '🍦'],
            pieces16: ['🍭', '🍬', '🍫', '🧁', '🎂', '🍩', '🍪', '🍰', '🍦', '🍨', '🥧', '🧇', '🥞', '🍮', '🥐', '🥨']
        }
    ],
    numbers: {
        name: 'Números',
        image: '🔢',
        pieces4: ['1', '2', '3', '4'],
        pieces9: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        pieces16: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16']
    },
    letters: {
        name: 'Letras',
        image: '🔤',
        pieces4: ['A', 'B', 'C', 'D'],
        pieces9: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
        pieces16: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P']
    }
};

// Estado do jogo
let gameState = {
    currentPuzzle: null,
    difficulty: 'easy',   // comeca no 2x2 (mais facil para os pequenos)
    gridSize: 2,
    totalPieces: 4,
    moves: 0,
    placedPieces: [],
    selectedPiece: null,
    theme: 'emojis',
    themeIndex: 0
};

let lastPrompt = '';

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
    speechStop();
    showScreen('start-screen');
}

// "Outro Puzzle": comeca um novo quebra-cabeca de verdade
// (proximo tema de emojis, ou o mesmo tema de numeros/letras embaralhado de novo)
function anotherPuzzle() {
    if (gameState.theme === 'emojis') {
        const next = (gameState.themeIndex + 1) % PUZZLE_THEMES.emojis.length;
        startPuzzle('emojis', next);
    } else {
        startPuzzle(gameState.theme, 0);
    }
}

// Inicializacao
document.addEventListener('DOMContentLoaded', () => {
    createDifficultyOptions();
    createThemeOptions();
    showScreen('start-screen');
});

// Criar opcoes de dificuldade
function createDifficultyOptions() {
    const container = document.getElementById('difficulty-options');
    if (!container) return;

    container.innerHTML = '';

    Object.entries(DIFFICULTY).forEach(([key, config]) => {
        const btn = document.createElement('button');
        btn.className = `difficulty-btn ${key}`;
        btn.dataset.difficulty = key;
        if (key === gameState.difficulty) btn.classList.add('selected');

        btn.innerHTML = `
            <span class="diff-grid">${config.grid}x${config.grid}</span>
            <span class="diff-name">${config.name}</span>
        `;

        btn.onclick = () => selectDifficulty(key);
        container.appendChild(btn);
    });
}

// Selecionar dificuldade
function selectDifficulty(diff) {
    gameState.difficulty = diff;
    gameState.gridSize = DIFFICULTY[diff].grid;
    gameState.totalPieces = DIFFICULTY[diff].total;

    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.difficulty === diff);
    });

    // Recriar opcoes de tema para atualizar previews
    createThemeOptions();

    playSound('click');
}

// Criar opcoes de tema
function createThemeOptions() {
    const container = document.getElementById('puzzle-options');
    if (!container) return;

    container.innerHTML = '';

    // Adicionar puzzles de emoji
    PUZZLE_THEMES.emojis.forEach((puzzle, index) => {
        const option = document.createElement('button');
        option.className = 'puzzle-option emoji-puzzle';
        option.textContent = puzzle.image;
        option.title = puzzle.name;
        option.onclick = () => startPuzzle('emojis', index);
        container.appendChild(option);
    });

    // Adicionar puzzle de numeros
    const numOption = document.createElement('button');
    numOption.className = 'puzzle-option number-puzzle';
    numOption.innerHTML = '<span class="number-icon">123</span>';
    numOption.title = 'Números em Sequência';
    numOption.onclick = () => startPuzzle('numbers', 0);
    container.appendChild(numOption);

    // Adicionar puzzle de letras
    const letterOption = document.createElement('button');
    letterOption.className = 'puzzle-option letter-puzzle';
    letterOption.innerHTML = '<span class="letter-icon">ABC</span>';
    letterOption.title = 'Letras do Alfabeto';
    letterOption.onclick = () => startPuzzle('letters', 0);
    container.appendChild(letterOption);
}

// Iniciar puzzle
function startPuzzle(theme, index) {
    gameState.theme = theme;
    gameState.themeIndex = index;
    gameState.moves = 0;
    gameState.placedPieces = new Array(gameState.totalPieces).fill(null);
    gameState.selectedPiece = null;

    // Configurar puzzle baseado no tema
    if (theme === 'emojis') {
        const puzzle = PUZZLE_THEMES.emojis[index];
        gameState.currentPuzzle = {
            name: puzzle.name,
            image: puzzle.image,
            pieces: getPiecesForDifficulty(puzzle)
        };
    } else if (theme === 'numbers') {
        gameState.currentPuzzle = {
            name: PUZZLE_THEMES.numbers.name,
            image: PUZZLE_THEMES.numbers.image,
            pieces: getPiecesForDifficulty(PUZZLE_THEMES.numbers)
        };
    } else if (theme === 'letters') {
        gameState.currentPuzzle = {
            name: PUZZLE_THEMES.letters.name,
            image: PUZZLE_THEMES.letters.image,
            pieces: getPiecesForDifficulty(PUZZLE_THEMES.letters)
        };
    }

    updateMoves();
    setupPuzzleBoard();
    setupPiecesTray();
    showScreen('game-screen');

    // Atualizar dica visual
    const hintEl = document.getElementById('puzzle-image');
    if (theme === 'numbers') {
        hintEl.textContent = '1→' + gameState.totalPieces;
    } else if (theme === 'letters') {
        hintEl.textContent = 'A→' + gameState.currentPuzzle.pieces[gameState.totalPieces - 1];
    } else {
        hintEl.textContent = gameState.currentPuzzle.image;
    }

    // Atualizar texto da dica
    const hintText = document.querySelector('.hint-text');
    if (hintText) {
        if (theme === 'numbers') {
            hintText.textContent = 'Coloque os números em ordem!';
        } else if (theme === 'letters') {
            hintText.textContent = 'Coloque as letras em ordem!';
        } else {
            hintText.textContent = 'Monte esta imagem!';
        }
    }

    playSound('start');
    sayPrompt('Toque numa peça e depois no lugar com o desenho igual!');
}

// Obter pecas baseado na dificuldade
function getPiecesForDifficulty(puzzle) {
    const key = `pieces${gameState.totalPieces}`;
    return puzzle[key] || puzzle.pieces9;
}

// Atualizar contador de jogadas
function updateMoves() {
    document.getElementById('moves').textContent = gameState.moves;
}

// Configurar tabuleiro do puzzle
function setupPuzzleBoard() {
    const board = document.getElementById('puzzle-board');
    board.innerHTML = '';

    // Definir grid dinamico
    board.style.gridTemplateColumns = `repeat(${gameState.gridSize}, 1fr)`;

    for (let i = 0; i < gameState.totalPieces; i++) {
        const slot = document.createElement('div');
        slot.className = 'puzzle-slot';
        slot.dataset.index = i;
        slot.onclick = () => placeSelectedPiece(i);

        // Mostrar a peca esperada como "sombra" clarinha no espaco vazio
        // (assim a crianca sabe o que vai em cada lugar)
        slot.dataset.hint = gameState.currentPuzzle.pieces[i];

        board.appendChild(slot);
    }

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

// Configurar bandeja de pecas
function setupPiecesTray() {
    const tray = document.getElementById('pieces-tray');
    tray.innerHTML = '';

    // Embaralhar pecas
    const shuffledPieces = [...gameState.currentPuzzle.pieces].sort(() => Math.random() - 0.5);

    shuffledPieces.forEach((piece) => {
        const pieceEl = document.createElement('div');
        pieceEl.className = 'puzzle-piece';

        // Estilo diferente para numeros/letras
        if (gameState.theme === 'numbers' || gameState.theme === 'letters') {
            pieceEl.classList.add('text-piece');
        }

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

        // Estilo para numeros/letras
        if (gameState.theme === 'numbers' || gameState.theme === 'letters') {
            slot.classList.add('text-filled');
        }

        gameState.placedPieces[slotIndex] = piece;

        // Remover peca da bandeja
        const pieceEl = document.querySelector(`.puzzle-piece[data-piece="${piece}"]`);
        if (pieceEl) pieceEl.remove();

        playSound('correct');
        if (gameState.theme === 'numbers' || gameState.theme === 'letters') {
            speak(piece);
        }

        // Limpar selecao (so depois de acertar)
        document.querySelectorAll('.puzzle-piece').forEach(p => p.classList.remove('selected'));
        gameState.selectedPiece = null;

        // Verificar se completou
        if (gameState.placedPieces.filter(p => p !== null).length === gameState.totalPieces) {
            setTimeout(showWinScreen, 500);
        }
    } else {
        // Errado
        slot.classList.add('wrong');
        setTimeout(() => slot.classList.remove('wrong'), 500);
        playSound('wrong');
        speak('Aqui não. Procure a sombra igual!');
        // A peca continua selecionada para tentar outro lugar
    }
}

// Tela de vitoria
function showWinScreen() {
    const winImage = document.getElementById('win-image');
    if (gameState.theme === 'numbers') {
        winImage.textContent = '🔢';
    } else if (gameState.theme === 'letters') {
        winImage.textContent = '🔤';
    } else {
        winImage.textContent = gameState.currentPuzzle.image;
    }

    document.getElementById('final-moves').textContent = gameState.moves;

    // Calcular estrelas baseado nas jogadas
    const perfectMoves = gameState.totalPieces;
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
    speak(`Parabéns! Você montou o quebra-cabeça! Ganhou ${stars} ${stars === 1 ? 'estrela' : 'estrelas'}!`);
    showScreen('win-screen');
}

// Sons (audio compartilhado: um unico AudioContext)
function playSound(type) {
    if (window.KidsAudio) KidsAudio.play(type);
}

// Voz em portugues
function speak(text, opts) {
    if (window.KidsAudio) KidsAudio.speak(text, opts);
}

function speechStop() {
    try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) {}
}

// Fala a instrucao e guarda para o botao Ouvir
function sayPrompt(text) {
    lastPrompt = text;
    speak(text);
}

function repeatPrompt() {
    playSound('click');
    if (lastPrompt) speak(lastPrompt);
}
