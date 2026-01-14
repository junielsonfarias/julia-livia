// Jogo de Contar - Para criancas de 4 anos
// Mundo de Julia & Livia

// Objetos fofinhos para contar
const OBJECTS = [
    '🍎', '🍌', '🍊', '🍇', '🍓',
    '🌸', '🌺', '🌻', '🌷', '🌹',
    '🦋', '🐝', '🐞', '🐌', '🐛',
    '⭐', '🌙', '☀️', '🌈', '💎',
    '🎈', '🎀', '🧸', '🎁', '🍭',
    '🐱', '🐶', '🐰', '🐻', '🐼'
];

// Estado do jogo
let gameState = {
    difficulty: 'easy',
    maxNumber: 5,
    score: 0,
    totalStars: 0,
    currentNumber: 0,
    currentObject: '',
    questionsAnswered: 0,
    questionsPerLevel: 8
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
    gameState.score = 0;
    gameState.questionsAnswered = 0;
    updateStats();
    showScreen('start-screen');
}

// Atualizar estatisticas
function updateStats() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('stars').textContent = gameState.totalStars;
}

// Iniciar jogo
function startGame(difficulty) {
    gameState.difficulty = difficulty;
    gameState.maxNumber = difficulty === 'easy' ? 5 : 10;
    gameState.score = 0;
    gameState.questionsAnswered = 0;
    updateStats();
    updateProgress();
    nextQuestion();
    showScreen('game-screen');
}

// Proxima pergunta
function nextQuestion() {
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';

    // Gerar numero aleatorio
    gameState.currentNumber = Math.floor(Math.random() * gameState.maxNumber) + 1;
    gameState.currentObject = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];

    // Mostrar objetos
    const objectsDisplay = document.getElementById('objects-display');
    objectsDisplay.innerHTML = '';

    for (let i = 0; i < gameState.currentNumber; i++) {
        const obj = document.createElement('span');
        obj.className = 'object-item';
        obj.textContent = gameState.currentObject;
        obj.style.animationDelay = `${i * 0.1}s`;
        objectsDisplay.appendChild(obj);
    }

    // Atualizar pergunta
    const emoji = gameState.currentObject;
    document.getElementById('question-text').textContent = `Quantos ${emoji} tem?`;

    // Criar opcoes
    createOptions();
}

// Criar opcoes de numeros
function createOptions() {
    const optionsArea = document.getElementById('options-area');
    optionsArea.innerHTML = '';

    for (let i = 1; i <= gameState.maxNumber; i++) {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = i;
        btn.onclick = () => checkAnswer(i);
        optionsArea.appendChild(btn);
    }
}

// Verificar resposta
function checkAnswer(answer) {
    const feedbackEl = document.getElementById('feedback');
    const buttons = document.querySelectorAll('.option-btn');
    const isCorrect = answer === gameState.currentNumber;

    // Desabilitar botoes
    buttons.forEach(btn => {
        btn.style.pointerEvents = 'none';
        if (parseInt(btn.textContent) === answer) {
            btn.classList.add(isCorrect ? 'correct' : 'wrong');
        }
        if (parseInt(btn.textContent) === gameState.currentNumber) {
            btn.classList.add('correct');
        }
    });

    if (isCorrect) {
        playSound('correct');
        feedbackEl.textContent = getRandomPraise();
        feedbackEl.className = 'feedback correct';
        gameState.score += 10;
        gameState.questionsAnswered++;
        updateStats();
        updateProgress();

        if (gameState.questionsAnswered >= gameState.questionsPerLevel) {
            setTimeout(showWinScreen, 1500);
        } else {
            setTimeout(nextQuestion, 1500);
        }
    } else {
        playSound('wrong');
        feedbackEl.textContent = `Nao! Sao ${gameState.currentNumber}!`;
        feedbackEl.className = 'feedback wrong';

        setTimeout(nextQuestion, 2000);
    }
}

// Frases de elogio
function getRandomPraise() {
    const praises = [
        'Muito bem!',
        'Perfeito!',
        'Isso mesmo!',
        'Parabens!',
        'Voce e demais!',
        'Incrivel!',
        'Acertou!',
        'Maravilha!'
    ];
    return praises[Math.floor(Math.random() * praises.length)];
}

// Atualizar barra de progresso
function updateProgress() {
    const progress = (gameState.questionsAnswered / gameState.questionsPerLevel) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
}

// Tela de vitoria
function showWinScreen() {
    document.getElementById('final-score').textContent = gameState.score;

    // Calcular estrelas
    const maxScore = gameState.questionsPerLevel * 10;
    const percentage = gameState.score / maxScore;
    let stars = 1;
    if (percentage >= 1) stars = 3;
    else if (percentage >= 0.7) stars = 2;

    gameState.totalStars += stars;
    updateStats();

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

// Jogar novamente
function playAgain() {
    startGame(gameState.difficulty);
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
            case 'correct':
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
