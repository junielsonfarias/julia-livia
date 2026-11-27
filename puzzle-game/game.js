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
    themeIndex: 0,
    streak: 0,       // acertos seguidos (a nota sobe)
    wrongTries: 0    // erros seguidos (2o erro: o lugar certo brilha)
};

const SNAP = 75;     // raio (px na tela) para a peca "grudar" no lugar ao soltar

// Emoji como figura 3D (numeros e letras continuam texto)
function pieceHTML(piece) {
    const isText = gameState.theme === 'numbers' || gameState.theme === 'letters';
    return (!isText && window.Emoji3D) ? Emoji3D.html(piece) : piece;
}

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
        option.innerHTML = window.Emoji3D ? Emoji3D.html(puzzle.image) : puzzle.image;
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
    gameState.streak = 0;
    gameState.wrongTries = 0;
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
        hintEl.innerHTML = pieceHTML(gameState.currentPuzzle.image);
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
    sayPrompt('Arraste cada peça até o lugar com o desenho igual! Ou toque na peça e depois no lugar.');
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

        pieceEl.innerHTML = pieceHTML(piece);
        pieceEl.dataset.piece = piece;

        // Encontrar o indice correto desta peca
        pieceEl.dataset.correctIndex = gameState.currentPuzzle.pieces.indexOf(piece);

        setupPieceDrag(pieceEl);

        tray.appendChild(pieceEl);
    });
}

// Arrastar com dedo/mouse (Pointer Events). Toque sem arrastar = selecionar.
function setupPieceDrag(el) {
    let down = false, dragging = false, sx = 0, sy = 0, z = 1, pid = null;
    el.addEventListener('pointerdown', (e) => {
        if (down || (e.pointerType === 'mouse' && e.button !== 0)) return;
        down = true; dragging = false; pid = e.pointerId;
        sx = e.clientX; sy = e.clientY;
        // zoom do fit-screen: px da tela -> px do elemento
        z = (el.getBoundingClientRect().width / (el.offsetWidth || 1)) || 1;
        try { el.setPointerCapture(e.pointerId); } catch (err) {}
    });
    el.addEventListener('pointermove', (e) => {
        if (!down || e.pointerId !== pid) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (!dragging) {
            if (Math.hypot(dx, dy) < 10) return;
            dragging = true;
            el.classList.remove('returning');
            el.classList.add('dragging');
            selectPiece(el, true);
            playSound('pop');
        }
        el.style.transform = `translate(${dx / z}px, ${dy / z}px) scale(1.1)`;
        markNearSlot(e.clientX, e.clientY);
    });
    const end = (e, cancel) => {
        if (!down || e.pointerId !== pid) return;
        down = false;
        markNearSlot(-1, -1);
        if (!dragging) { if (!cancel) selectPiece(el); return; }
        el.classList.remove('dragging');
        const slot = cancel ? null : nearestSlot(e.clientX, e.clientY);
        let ok = false;
        if (slot) ok = placePiece(el.dataset.piece, +slot.dataset.index, +el.dataset.correctIndex);
        if (!ok && el.isConnected) {
            // volta suave para a bandeja (300 ms, easeOutBack)
            el.classList.add('returning');
            el.style.transform = '';
            setTimeout(() => el.classList.remove('returning'), 340);
        }
    };
    el.addEventListener('pointerup', (e) => end(e, false));
    el.addEventListener('pointercancel', (e) => end(e, true));
}

// Lugar vazio mais perto do dedo (dentro do raio de encaixe ou por cima da casa)
function nearestSlot(x, y) {
    let best = null, bestD = Infinity;
    document.querySelectorAll('.puzzle-slot:not(.filled)').forEach(s => {
        const r = s.getBoundingClientRect();
        const d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
        const lim = Math.max(SNAP, r.width * 0.5);
        if (d < lim && d < bestD) { best = s; bestD = d; }
    });
    return best;
}
function markNearSlot(x, y) {
    const near = x < 0 ? null : nearestSlot(x, y);
    document.querySelectorAll('.puzzle-slot.highlight').forEach(s => { if (s !== near) s.classList.remove('highlight'); });
    if (near) near.classList.add('highlight');
}

// Selecionar peca (para mobile/click)
function selectPiece(pieceEl, quiet) {
    // Remover selecao anterior
    document.querySelectorAll('.puzzle-piece').forEach(p => p.classList.remove('selected'));

    // Selecionar esta peca
    pieceEl.classList.add('selected');
    gameState.selectedPiece = {
        element: pieceEl,
        piece: pieceEl.dataset.piece,
        correctIndex: parseInt(pieceEl.dataset.correctIndex)
    };

    if (!quiet) playSound('click');
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
        return false;
    }

    gameState.moves++;
    updateMoves();

    // Verificar se a peca esta no lugar correto
    if (slotIndex === correctIndex) {
        // Correto!
        slot.innerHTML = pieceHTML(piece);
        slot.classList.remove('highlight', 'hint');
        slot.classList.add('filled', 'pop-in');

        // Estilo para numeros/letras
        if (gameState.theme === 'numbers' || gameState.theme === 'letters') {
            slot.classList.add('text-filled');
        }

        gameState.placedPieces[slotIndex] = piece;

        // Remover peca da bandeja
        const pieceEl = document.querySelector(`.puzzle-piece[data-piece="${piece}"]`);
        if (pieceEl) pieceEl.remove();

        playSound('correct');
        gameState.streak++;
        gameState.wrongTries = 0;
        if (window.KidsAudio) KidsAudio.note(Math.min(10, gameState.streak - 1));
        if (window.Efeitos) Efeitos.acerto(slot, { quantidade: 14 });
        document.querySelectorAll('.puzzle-slot.hint').forEach(s => s.classList.remove('hint'));
        if (gameState.theme === 'numbers' || gameState.theme === 'letters') {
            speak(piece);
        }

        // Limpar selecao (so depois de acertar)
        document.querySelectorAll('.puzzle-piece').forEach(p => p.classList.remove('selected'));
        gameState.selectedPiece = null;

        // Verificar se completou
        if (gameState.placedPieces.filter(p => p !== null).length === gameState.totalPieces) {
            setTimeout(showWinScreen, 700);
        }
        return true;
    } else {
        // Errado (sem punir): balancinho e ajuda aos poucos
        gameState.streak = 0;
        gameState.wrongTries++;
        slot.classList.add('wrong');
        setTimeout(() => slot.classList.remove('wrong'), 500);
        if (window.Efeitos) Efeitos.vibrar('erro');
        playSound('wrong');
        if (gameState.wrongTries >= 2) {
            // 2o erro: o lugar certo brilha
            const right = document.querySelectorAll('.puzzle-slot')[correctIndex];
            if (right) right.classList.add('hint');
            speak('Olhe o lugar que está brilhando!');
        } else {
            speak('Aqui não. Procure a sombra igual!');
        }
        // A peca continua selecionada para tentar outro lugar
        return false;
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
        winImage.innerHTML = pieceHTML(gameState.currentPuzzle.image);
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
    if (window.Efeitos) Efeitos.vitoria();
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
