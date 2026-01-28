// Jogo de Cores e Formas - Para criancas de 4 anos
// Mundo de Julia & Livia

// Configuracoes do jogo
const COLORS = [
    { name: 'vermelho', class: 'red', ptName: 'Vermelho' },
    { name: 'azul', class: 'blue', ptName: 'Azul' },
    { name: 'amarelo', class: 'yellow', ptName: 'Amarelo' },
    { name: 'verde', class: 'green', ptName: 'Verde' },
    { name: 'roxo', class: 'purple', ptName: 'Roxo' },
    { name: 'laranja', class: 'orange', ptName: 'Laranja' },
    { name: 'rosa', class: 'pink', ptName: 'Rosa' }
];

const SHAPES = [
    { name: 'circulo', class: 'circle', ptName: 'Circulo' },
    { name: 'quadrado', class: 'square', ptName: 'Quadrado' },
    { name: 'triangulo', class: 'triangle', ptName: 'Triangulo' }
];

// Estado do jogo
let gameState = {
    mode: 'colors', // 'colors', 'shapes', 'mixed'
    level: 1,
    score: 0,
    questionsAnswered: 0,
    questionsPerLevel: 5,
    currentQuestion: null,
    correctAnswer: null
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

    if (gameState.mode === 'colors') {
        generateColorQuestion();
    } else if (gameState.mode === 'shapes') {
        generateShapeQuestion();
    } else {
        // Modo misto - alternar entre cores e formas
        if (Math.random() > 0.5) {
            generateColorQuestion();
        } else {
            generateShapeQuestion();
        }
    }
}

// Gerar pergunta de cores
function generateColorQuestion() {
    const shuffledColors = [...COLORS].sort(() => Math.random() - 0.5);
    const targetColor = shuffledColors[0];
    const options = shuffledColors.slice(0, 6);

    // Garantir que a resposta correta esta nas opcoes
    if (!options.includes(targetColor)) {
        options[0] = targetColor;
    }

    // Embaralhar opcoes
    options.sort(() => Math.random() - 0.5);

    gameState.currentQuestion = { type: 'color', target: targetColor };
    gameState.correctAnswer = targetColor;

    // Atualizar UI
    document.getElementById('question-text').textContent = 'Encontre a cor:';

    const targetDisplay = document.getElementById('target-display');
    targetDisplay.innerHTML = `
        <div class="target-shape circle ${targetColor.class}"></div>
        <span style="font-family: 'Fredoka One', cursive; font-size: 1.5rem; margin-left: 15px; color: #333;">
            ${targetColor.ptName}
        </span>
    `;

    // Criar opcoes
    const optionsArea = document.getElementById('options-area');
    optionsArea.innerHTML = '';

    options.forEach(color => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.dataset.answer = color.name;
        btn.innerHTML = `<div class="option-shape circle ${color.class}"></div>`;
        btn.onclick = () => checkAnswer(color, 'color');
        optionsArea.appendChild(btn);
    });
}

// Gerar pergunta de formas
function generateShapeQuestion() {
    const shuffledShapes = [...SHAPES].sort(() => Math.random() - 0.5);
    const targetShape = shuffledShapes[0];

    // Criar opcoes com diferentes cores para a mesma forma + formas diferentes
    const options = [];
    const usedColors = [];

    // Adicionar a forma correta com uma cor
    const correctColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    options.push({ shape: targetShape, color: correctColor, isCorrect: true });
    usedColors.push(correctColor.name);

    // Adicionar formas incorretas
    const otherShapes = SHAPES.filter(s => s.name !== targetShape.name);
    otherShapes.forEach(shape => {
        let color;
        do {
            color = COLORS[Math.floor(Math.random() * COLORS.length)];
        } while (usedColors.includes(color.name) && usedColors.length < COLORS.length);
        usedColors.push(color.name);
        options.push({ shape: shape, color: color, isCorrect: false });
    });

    // Adicionar mais formas para completar 6 opcoes
    while (options.length < 6) {
        const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        let color;
        do {
            color = COLORS[Math.floor(Math.random() * COLORS.length)];
        } while (usedColors.includes(color.name) && usedColors.length < COLORS.length);
        usedColors.push(color.name);
        options.push({
            shape: randomShape,
            color: color,
            isCorrect: randomShape.name === targetShape.name
        });
    }

    // Embaralhar opcoes
    options.sort(() => Math.random() - 0.5);

    gameState.currentQuestion = { type: 'shape', target: targetShape };
    gameState.correctAnswer = targetShape;

    // Atualizar UI
    document.getElementById('question-text').textContent = 'Encontre a forma:';

    const targetDisplay = document.getElementById('target-display');
    const displayColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    targetDisplay.innerHTML = `
        <div class="target-shape ${targetShape.class} ${displayColor.class}"></div>
        <span style="font-family: 'Fredoka One', cursive; font-size: 1.5rem; margin-left: 15px; color: #333;">
            ${targetShape.ptName}
        </span>
    `;

    // Criar opcoes
    const optionsArea = document.getElementById('options-area');
    optionsArea.innerHTML = '';

    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.dataset.shape = option.shape.name;
        btn.dataset.correct = option.isCorrect;
        btn.innerHTML = `<div class="option-shape ${option.shape.class} ${option.color.class}"></div>`;
        btn.onclick = () => checkAnswer(option, 'shape');
        optionsArea.appendChild(btn);
    });
}

// Verificar resposta
function checkAnswer(answer, type) {
    const feedbackEl = document.getElementById('feedback');
    let isCorrect = false;

    if (type === 'color') {
        isCorrect = answer.name === gameState.correctAnswer.name;
    } else {
        isCorrect = answer.isCorrect || answer.shape.name === gameState.correctAnswer.name;
    }

    // Encontrar o botao clicado
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
        if (type === 'color' && btn.dataset.answer === answer.name) {
            btn.classList.add(isCorrect ? 'correct' : 'wrong');
        } else if (type === 'shape' && btn.dataset.shape === answer.shape.name) {
            if (answer.isCorrect || answer.shape.name === gameState.correctAnswer.name) {
                btn.classList.add('correct');
            } else {
                btn.classList.add('wrong');
            }
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

        // Verificar se completou o nivel
        if (gameState.questionsAnswered >= gameState.questionsPerLevel) {
            setTimeout(showWinScreen, 1500);
        } else {
            setTimeout(nextQuestion, 1500);
        }
    } else {
        playSound('wrong');
        feedbackEl.textContent = 'Tente novamente!';
        feedbackEl.className = 'feedback wrong';
    }
}

// Frases de elogio aleatorias
function getRandomPraise() {
    const praises = [
        'Muito bem!',
        'Parabens!',
        'Excelente!',
        'Voce acertou!',
        'Isso mesmo!',
        'Incrivel!',
        'Otimo trabalho!',
        'Perfeito!'
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

    // Calcular estrelas baseado na pontuacao
    const maxScore = gameState.questionsPerLevel * 10;
    const percentage = gameState.score / maxScore;
    let stars = 1;
    if (percentage >= 1) stars = 3;
    else if (percentage >= 0.7) stars = 2;

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
    gameState.questionsPerLevel = Math.min(5 + gameState.level, 10); // Aumenta perguntas por nivel
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
