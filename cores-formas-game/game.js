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
    { name: 'circulo', class: 'circle', ptName: 'Círculo', article: 'o' },
    { name: 'quadrado', class: 'square', ptName: 'Quadrado', article: 'o' },
    { name: 'triangulo', class: 'triangle', ptName: 'Triângulo', article: 'o' },
    { name: 'retangulo', class: 'rectangle', ptName: 'Retângulo', article: 'o' },
    { name: 'losango', class: 'diamond', ptName: 'Losango', article: 'o' },
    { name: 'oval', class: 'oval', ptName: 'Oval', article: 'o' },
    { name: 'estrela', class: 'star', ptName: 'Estrela', article: 'a' }
];

// Estado do jogo
let gameState = {
    mode: 'colors', // 'colors', 'shapes', 'mixed'
    level: 1,
    score: 0,
    questionsAnswered: 0,
    questionsPerLevel: 5,
    currentQuestion: null,
    correctAnswer: null,
    mistakes: 0,    // erros no nivel (define as estrelas)
    locked: false   // trava os botoes depois do acerto
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
    gameState.level = 1;
    gameState.score = 0;
    gameState.questionsAnswered = 0;
    gameState.questionsPerLevel = 5;
    gameState.mistakes = 0;
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
    gameState.level = 1;
    gameState.questionsAnswered = 0;
    gameState.questionsPerLevel = 5;
    gameState.score = 0;
    gameState.mistakes = 0;
    updateStats();
    updateProgress();
    playSound('start');
    nextQuestion();
    showScreen('game-screen');
}

// Proxima pergunta
function nextQuestion() {
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    gameState.locked = false;

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
    sayPrompt(`Encontre o ${targetColor.name}!`);

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
    sayPrompt(`Encontre ${targetShape.article} ${targetShape.ptName.toLowerCase()}!`);

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
    if (gameState.locked) return;
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
        // Trava todos os botoes (evita toque duplo somar pontos)
        gameState.locked = true;
        buttons.forEach(btn => { btn.style.pointerEvents = 'none'; });
        playSound('correct');
        const praise = getRandomPraise();
        feedbackEl.textContent = praise;
        feedbackEl.className = 'feedback correct';
        const target = gameState.correctAnswer;
        speak(type === 'color'
            ? `${praise} Esse é o ${target.name}!`
            : `${praise} Esse é ${target.article} ${target.ptName.toLowerCase()}!`);
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
        gameState.mistakes++;
        feedbackEl.textContent = 'Tente novamente!';
        feedbackEl.className = 'feedback wrong';
        // Desabilita so o botao errado
        buttons.forEach(btn => {
            if (btn.classList.contains('wrong')) btn.style.pointerEvents = 'none';
        });
        speak(`Esse não. ${lastPrompt}`);
    }
}

// Frases de elogio aleatorias
function getRandomPraise() {
    const praises = [
        'Muito bem!',
        'Parabéns!',
        'Excelente!',
        'Você acertou!',
        'Isso mesmo!',
        'Incrível!',
        'Ótimo trabalho!',
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
    // Estrelas dependem dos erros: 3 (ate 1 erro), 2 (ate 3), senao 1
    let stars = 1;
    if (gameState.mistakes <= 1) stars = 3;
    else if (gameState.mistakes <= 3) stars = 2;

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
    speak(`Muito bem! Você ganhou ${stars} ${stars === 1 ? 'estrela' : 'estrelas'}!`);
    showScreen('win-screen');
}

// Proximo nivel
function nextLevel() {
    // Toque duplo no botao pulava dois niveis
    if (!document.getElementById('win-screen').classList.contains('active')) return;
    gameState.level++;
    gameState.questionsAnswered = 0;
    gameState.mistakes = 0;
    gameState.questionsPerLevel = Math.min(5 + gameState.level, 10); // Aumenta perguntas por nivel
    updateStats();
    updateProgress();
    nextQuestion();
    showScreen('game-screen');
}

// Sons (audio compartilhado: um unico AudioContext)
function playSound(type) {
    if (window.KidsAudio) KidsAudio.play(type);
}

// Voz em portugues
function speak(text, opts) {
    if (window.KidsAudio) KidsAudio.speak(text, opts);
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

// Inicializacao
document.addEventListener('DOMContentLoaded', () => {
    showScreen('start-screen');
});
