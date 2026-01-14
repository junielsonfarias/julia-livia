// Jogo de Sequencia Logica - Para criancas de 9 anos
// Mundo de Julia & Livia

// Estado do jogo
let gameState = {
    mode: 'numbers',
    level: 1,
    score: 0,
    questionsAnswered: 0,
    questionsPerLevel: 5,
    currentAnswer: null,
    difficulty: 1
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
    gameState.level = 1;
    gameState.score = 0;
    gameState.difficulty = 1;
    updateStats();
    showScreen('start-screen');
}

// Atualizar estatisticas na tela
function updateStats() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('current-level').textContent = gameState.level;
}

// Iniciar jogo
function startGame(mode) {
    gameState.mode = mode;
    gameState.questionsAnswered = 0;
    gameState.score = 0;
    gameState.difficulty = 1;
    updateStats();
    updateProgress();
    nextQuestion();
    showScreen('game-screen');
}

// Proxima pergunta
function nextQuestion() {
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';

    // Limpar classes das opcoes
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('correct', 'wrong');
    });

    if (gameState.mode === 'numbers') {
        generateNumberSequence();
    } else if (gameState.mode === 'patterns') {
        generatePatternSequence();
    } else {
        // Modo misto
        if (Math.random() > 0.5) {
            generateNumberSequence();
        } else {
            generatePatternSequence();
        }
    }
}

// Gerar sequencia numerica
function generateNumberSequence() {
    const sequenceTypes = [
        'arithmetic',      // +2, +3, +5, etc.
        'geometric',       // x2, x3, etc.
        'fibonacci',       // cada numero e a soma dos dois anteriores
        'squares',         // quadrados perfeitos
        'alternate'        // alterna entre duas operacoes
    ];

    // Escolher tipo baseado na dificuldade
    const availableTypes = sequenceTypes.slice(0, Math.min(gameState.difficulty + 2, sequenceTypes.length));
    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];

    let sequence = [];
    let answer;
    let questionText = 'Complete a sequencia:';

    switch(type) {
        case 'arithmetic':
            const step = Math.floor(Math.random() * (3 + gameState.difficulty)) + 2;
            const start = Math.floor(Math.random() * 10) + 1;
            for (let i = 0; i < 5; i++) {
                sequence.push(start + (step * i));
            }
            answer = sequence[4];
            sequence[4] = '?';
            questionText = `Qual o proximo numero? (+${step})`;
            break;

        case 'geometric':
            const multiplier = Math.floor(Math.random() * 2) + 2; // x2 ou x3
            let geoStart = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < 5; i++) {
                sequence.push(geoStart * Math.pow(multiplier, i));
            }
            answer = sequence[4];
            sequence[4] = '?';
            questionText = `Qual o proximo numero? (x${multiplier})`;
            break;

        case 'fibonacci':
            sequence = [1, 1, 2, 3, 5];
            answer = 8;
            sequence[4] = '?';
            questionText = 'Sequencia de Fibonacci - qual o proximo?';
            break;

        case 'squares':
            sequence = [1, 4, 9, 16, 25];
            answer = 25;
            sequence[4] = '?';
            questionText = 'Quadrados perfeitos - qual o proximo?';
            break;

        case 'alternate':
            // +2, +3, +2, +3, ...
            sequence = [1, 3, 6, 8, 11];
            answer = 11;
            sequence[4] = '?';
            questionText = 'Sequencia alternada - qual o proximo?';
            break;
    }

    gameState.currentAnswer = answer;

    // Atualizar UI
    document.getElementById('question-text').textContent = questionText;

    const sequenceDisplay = document.getElementById('sequence-display');
    sequenceDisplay.innerHTML = '';
    sequence.forEach((num, index) => {
        const item = document.createElement('div');
        item.className = 'sequence-item' + (num === '?' ? ' mystery' : '');
        item.textContent = num;
        sequenceDisplay.appendChild(item);
    });

    // Gerar opcoes
    generateNumberOptions(answer);
}

// Gerar opcoes para sequencias numericas
function generateNumberOptions(correctAnswer) {
    const options = [correctAnswer];

    // Gerar opcoes erradas proximas do valor correto
    while (options.length < 4) {
        const offset = Math.floor(Math.random() * 10) - 5;
        const wrongAnswer = correctAnswer + offset;
        if (wrongAnswer > 0 && !options.includes(wrongAnswer) && wrongAnswer !== correctAnswer) {
            options.push(wrongAnswer);
        }
    }

    // Embaralhar
    options.sort(() => Math.random() - 0.5);

    const optionsArea = document.getElementById('options-area');
    optionsArea.innerHTML = '';

    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.onclick = () => checkAnswer(option);
        optionsArea.appendChild(btn);
    });
}

// Gerar sequencia de padroes
function generatePatternSequence() {
    const shapes = ['circle', 'square', 'triangle'];
    const colors = ['pattern-red', 'pattern-blue', 'pattern-green', 'pattern-yellow'];

    const patternTypes = [
        'shape-repeat',     // circulo, quadrado, circulo, quadrado, ?
        'color-repeat',     // vermelho, azul, vermelho, azul, ?
        'grow',             // pequeno, medio, grande, ?
        'alternate-shape'   // duas formas alternando
    ];

    const type = patternTypes[Math.floor(Math.random() * patternTypes.length)];

    let sequence = [];
    let answer;
    let options = [];
    let questionText = 'Complete o padrao:';

    switch(type) {
        case 'shape-repeat':
            const shape1 = shapes[0];
            const shape2 = shapes[1];
            const color = colors[Math.floor(Math.random() * colors.length)];
            sequence = [
                { shape: shape1, color },
                { shape: shape2, color },
                { shape: shape1, color },
                { shape: shape2, color },
                { shape: '?', color: '' }
            ];
            answer = { shape: shape1, color };
            options = [
                { shape: shape1, color },
                { shape: shape2, color },
                { shape: shapes[2], color },
                { shape: shape1, color: colors[1] }
            ];
            questionText = 'Qual forma vem a seguir?';
            break;

        case 'color-repeat':
            const baseShape = shapes[Math.floor(Math.random() * shapes.length)];
            const color1 = colors[0];
            const color2 = colors[1];
            sequence = [
                { shape: baseShape, color: color1 },
                { shape: baseShape, color: color2 },
                { shape: baseShape, color: color1 },
                { shape: baseShape, color: color2 },
                { shape: '?', color: '' }
            ];
            answer = { shape: baseShape, color: color1 };
            options = [
                { shape: baseShape, color: color1 },
                { shape: baseShape, color: color2 },
                { shape: baseShape, color: colors[2] },
                { shape: baseShape, color: colors[3] }
            ];
            questionText = 'Qual cor vem a seguir?';
            break;

        case 'alternate-shape':
            const altColor = colors[Math.floor(Math.random() * colors.length)];
            sequence = [
                { shape: 'circle', color: altColor },
                { shape: 'square', color: altColor },
                { shape: 'triangle', color: altColor },
                { shape: 'circle', color: altColor },
                { shape: '?', color: '' }
            ];
            answer = { shape: 'square', color: altColor };
            options = [
                { shape: 'circle', color: altColor },
                { shape: 'square', color: altColor },
                { shape: 'triangle', color: altColor },
                { shape: 'circle', color: colors[1] }
            ];
            questionText = 'Qual forma completa o padrao?';
            break;

        default:
            // Padrao simples de repeticao
            const simpleShape = shapes[0];
            const simpleColor = colors[0];
            sequence = [
                { shape: simpleShape, color: simpleColor },
                { shape: simpleShape, color: simpleColor },
                { shape: simpleShape, color: simpleColor },
                { shape: simpleShape, color: simpleColor },
                { shape: '?', color: '' }
            ];
            answer = { shape: simpleShape, color: simpleColor };
            options = [
                { shape: simpleShape, color: simpleColor },
                { shape: shapes[1], color: simpleColor },
                { shape: simpleShape, color: colors[1] },
                { shape: shapes[2], color: colors[2] }
            ];
    }

    gameState.currentAnswer = answer;

    // Atualizar UI
    document.getElementById('question-text').textContent = questionText;

    const sequenceDisplay = document.getElementById('sequence-display');
    sequenceDisplay.innerHTML = '';

    sequence.forEach((item, index) => {
        const container = document.createElement('div');
        container.className = 'sequence-item' + (item.shape === '?' ? ' mystery' : '');

        if (item.shape === '?') {
            container.textContent = '?';
        } else {
            const shapeEl = document.createElement('div');
            shapeEl.className = `pattern-item ${item.shape} ${item.color}`;
            container.appendChild(shapeEl);
        }

        sequenceDisplay.appendChild(container);
    });

    // Gerar opcoes de padrao
    generatePatternOptions(options, answer);
}

// Gerar opcoes para sequencias de padrao
function generatePatternOptions(options, correctAnswer) {
    // Embaralhar opcoes
    options.sort(() => Math.random() - 0.5);

    const optionsArea = document.getElementById('options-area');
    optionsArea.innerHTML = '';

    options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.dataset.index = index;

        const shapeEl = document.createElement('div');
        shapeEl.className = `pattern-item ${option.shape} ${option.color}`;
        btn.appendChild(shapeEl);

        btn.onclick = () => checkPatternAnswer(option, correctAnswer, btn);
        optionsArea.appendChild(btn);
    });
}

// Verificar resposta numerica
function checkAnswer(answer) {
    const feedbackEl = document.getElementById('feedback');
    const isCorrect = answer === gameState.currentAnswer;

    // Encontrar o botao clicado
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
        if (parseInt(btn.textContent) === answer) {
            btn.classList.add(isCorrect ? 'correct' : 'wrong');
        }
        if (parseInt(btn.textContent) === gameState.currentAnswer) {
            btn.classList.add('correct');
        }
    });

    processAnswer(isCorrect, feedbackEl);
}

// Verificar resposta de padrao
function checkPatternAnswer(answer, correctAnswer, clickedBtn) {
    const feedbackEl = document.getElementById('feedback');
    const isCorrect = answer.shape === correctAnswer.shape && answer.color === correctAnswer.color;

    clickedBtn.classList.add(isCorrect ? 'correct' : 'wrong');

    if (!isCorrect) {
        // Mostrar a resposta correta
        document.querySelectorAll('.option-btn').forEach(btn => {
            const shapeEl = btn.querySelector('.pattern-item');
            if (shapeEl && shapeEl.classList.contains(correctAnswer.shape) && shapeEl.classList.contains(correctAnswer.color)) {
                btn.classList.add('correct');
            }
        });
    }

    processAnswer(isCorrect, feedbackEl);
}

// Processar resposta
function processAnswer(isCorrect, feedbackEl) {
    if (isCorrect) {
        playSound('correct');
        feedbackEl.textContent = getRandomPraise();
        feedbackEl.className = 'feedback correct';
        gameState.score += 10 + (gameState.difficulty * 5);
        gameState.questionsAnswered++;
        updateStats();
        updateProgress();

        // Aumentar dificuldade gradualmente
        if (gameState.questionsAnswered % 3 === 0) {
            gameState.difficulty = Math.min(gameState.difficulty + 1, 5);
        }

        if (gameState.questionsAnswered >= gameState.questionsPerLevel) {
            setTimeout(showWinScreen, 1500);
        } else {
            setTimeout(nextQuestion, 1500);
        }
    } else {
        playSound('wrong');
        feedbackEl.textContent = 'Nao foi dessa vez! A resposta certa esta marcada.';
        feedbackEl.className = 'feedback wrong';

        setTimeout(nextQuestion, 2500);
    }
}

// Frases de elogio aleatorias
function getRandomPraise() {
    const praises = [
        'Excelente raciocinio!',
        'Voce e muito esperto!',
        'Incrivel!',
        'Logica perfeita!',
        'Fantastico!',
        'Genial!',
        'Muito bem!',
        'Continue assim!'
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
    const maxScore = gameState.questionsPerLevel * 15 * 3;
    const percentage = gameState.score / maxScore;
    let stars = 1;
    if (percentage >= 0.8) stars = 3;
    else if (percentage >= 0.5) stars = 2;

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

// Proximo nivel
function nextLevel() {
    gameState.level++;
    gameState.questionsAnswered = 0;
    gameState.questionsPerLevel = Math.min(5 + gameState.level, 8);
    gameState.difficulty = Math.min(gameState.difficulty + 1, 5);
    updateStats();
    updateProgress();
    nextQuestion();
    showScreen('game-screen');
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
