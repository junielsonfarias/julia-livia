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
    mode: 'count', // 'count' ou 'compare'
    difficulty: 'easy',
    maxNumber: 5,
    score: 0,
    totalStars: 0,
    currentNumber: 0,
    currentObject: '',
    questionsAnswered: 0,
    questionsPerLevel: 8,
    // Para modo comparacao
    leftCount: 0,
    rightCount: 0,
    leftObject: '',
    rightObject: '',
    correctAnswer: '' // 'left', 'right' ou 'equal'
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
function startGame(difficulty, mode = 'count') {
    gameState.mode = mode;
    gameState.difficulty = difficulty;

    // Definir maxNumber baseado na dificuldade
    if (difficulty === 'easy') {
        gameState.maxNumber = 5;
    } else if (difficulty === 'medium') {
        gameState.maxNumber = 10;
    } else {
        gameState.maxNumber = 20;
    }

    gameState.score = 0;
    gameState.questionsAnswered = 0;
    updateStats();
    updateProgress();
    nextQuestion();
    showScreen('game-screen');
}

// Iniciar modo comparacao
function startCompareGame(difficulty) {
    startGame(difficulty, 'compare');
}

// Proxima pergunta
function nextQuestion() {
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';

    if (gameState.mode === 'compare') {
        generateCompareQuestion();
    } else {
        generateCountQuestion();
    }
}

// Gerar pergunta de contagem
function generateCountQuestion() {
    // Gerar numero aleatorio
    gameState.currentNumber = Math.floor(Math.random() * gameState.maxNumber) + 1;
    gameState.currentObject = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];

    // Mostrar objetos
    const objectsDisplay = document.getElementById('objects-display');
    objectsDisplay.innerHTML = '';
    objectsDisplay.className = 'objects-display';

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

// Gerar pergunta de comparacao
function generateCompareQuestion() {
    // Gerar dois grupos com quantidades diferentes
    const maxNum = Math.min(gameState.maxNumber, 10); // Limitar para nao ficar muito grande
    gameState.leftCount = Math.floor(Math.random() * maxNum) + 1;

    // Garantir que os numeros sejam diferentes (com 20% de chance de serem iguais)
    if (Math.random() < 0.2) {
        gameState.rightCount = gameState.leftCount;
        gameState.correctAnswer = 'equal';
    } else {
        do {
            gameState.rightCount = Math.floor(Math.random() * maxNum) + 1;
        } while (gameState.rightCount === gameState.leftCount);

        gameState.correctAnswer = gameState.leftCount > gameState.rightCount ? 'left' : 'right';
    }

    gameState.leftObject = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
    gameState.rightObject = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];

    // Mostrar os dois grupos
    const objectsDisplay = document.getElementById('objects-display');
    objectsDisplay.innerHTML = `
        <div class="compare-container">
            <div class="compare-group" id="left-group">
                ${Array(gameState.leftCount).fill(gameState.leftObject).map((o, i) =>
                    `<span class="object-item" style="animation-delay: ${i * 0.1}s">${o}</span>`
                ).join('')}
            </div>
            <div class="compare-vs">OU</div>
            <div class="compare-group" id="right-group">
                ${Array(gameState.rightCount).fill(gameState.rightObject).map((o, i) =>
                    `<span class="object-item" style="animation-delay: ${i * 0.1}s">${o}</span>`
                ).join('')}
            </div>
        </div>
    `;
    objectsDisplay.className = 'objects-display compare-mode';

    // Atualizar pergunta
    document.getElementById('question-text').textContent = 'Qual grupo tem MAIS?';

    // Criar opcoes de comparacao
    createCompareOptions();
}

// Criar opcoes de numeros
function createOptions() {
    const optionsArea = document.getElementById('options-area');
    optionsArea.innerHTML = '';
    optionsArea.className = 'options-area';

    // Para numeros grandes (>10), mostrar apenas algumas opcoes proximas
    let options = [];
    if (gameState.maxNumber <= 10) {
        for (let i = 1; i <= gameState.maxNumber; i++) {
            options.push(i);
        }
    } else {
        // Mostrar a resposta correta + alguns numeros proximos
        options.push(gameState.currentNumber);
        for (let i = -2; i <= 2; i++) {
            const num = gameState.currentNumber + i;
            if (num >= 1 && num <= gameState.maxNumber && !options.includes(num)) {
                options.push(num);
            }
        }
        // Adicionar mais numeros aleatorios se necessario
        while (options.length < 6) {
            const num = Math.floor(Math.random() * gameState.maxNumber) + 1;
            if (!options.includes(num)) {
                options.push(num);
            }
        }
        options.sort((a, b) => a - b);
    }

    options.forEach(num => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = num;
        btn.onclick = () => checkAnswer(num);
        optionsArea.appendChild(btn);
    });
}

// Criar opcoes de comparacao
function createCompareOptions() {
    const optionsArea = document.getElementById('options-area');
    optionsArea.innerHTML = '';
    optionsArea.className = 'options-area compare-options';

    const options = [
        { value: 'left', text: `${gameState.leftObject} Esquerda`, emoji: '👈' },
        { value: 'equal', text: 'Sao Iguais', emoji: '🤝' },
        { value: 'right', text: `Direita ${gameState.rightObject}`, emoji: '👉' }
    ];

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn compare-btn';
        btn.innerHTML = `<span class="compare-emoji">${opt.emoji}</span><span>${opt.text}</span>`;
        btn.onclick = () => checkCompareAnswer(opt.value);
        optionsArea.appendChild(btn);
    });
}

// Verificar resposta de comparacao
function checkCompareAnswer(answer) {
    const feedbackEl = document.getElementById('feedback');
    const buttons = document.querySelectorAll('.option-btn');
    const isCorrect = answer === gameState.correctAnswer;

    // Desabilitar botoes e marcar respostas
    buttons.forEach(btn => {
        btn.style.pointerEvents = 'none';
    });

    // Encontrar botoes correto e errado
    buttons.forEach(btn => {
        const btnText = btn.textContent.toLowerCase();
        if (answer === 'left' && btnText.includes('esquerda')) {
            btn.classList.add(isCorrect ? 'correct' : 'wrong');
        } else if (answer === 'right' && btnText.includes('direita')) {
            btn.classList.add(isCorrect ? 'correct' : 'wrong');
        } else if (answer === 'equal' && btnText.includes('iguais')) {
            btn.classList.add(isCorrect ? 'correct' : 'wrong');
        }

        // Marcar o correto
        if (gameState.correctAnswer === 'left' && btnText.includes('esquerda')) {
            btn.classList.add('correct');
        } else if (gameState.correctAnswer === 'right' && btnText.includes('direita')) {
            btn.classList.add('correct');
        } else if (gameState.correctAnswer === 'equal' && btnText.includes('iguais')) {
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
        let correctText = '';
        if (gameState.correctAnswer === 'left') {
            correctText = `A esquerda tem mais! (${gameState.leftCount} > ${gameState.rightCount})`;
        } else if (gameState.correctAnswer === 'right') {
            correctText = `A direita tem mais! (${gameState.rightCount} > ${gameState.leftCount})`;
        } else {
            correctText = `Sao iguais! (${gameState.leftCount} = ${gameState.rightCount})`;
        }
        feedbackEl.textContent = correctText;
        feedbackEl.className = 'feedback wrong';

        setTimeout(nextQuestion, 2500);
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
