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
    correctAnswer: '', // 'left', 'right' ou 'equal'
    mistakes: 0,      // erros na rodada (define as estrelas)
    triesLeft: 2,     // tentativas na pergunta atual
    locked: false     // evita toque duplo
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
    gameState.score = 0;
    gameState.questionsAnswered = 0;
    gameState.mistakes = 0;
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
    gameState.mistakes = 0;
    updateStats();
    updateProgress();
    playSound('start');
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
    gameState.triesLeft = 2;
    gameState.locked = false;

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
    sayPrompt('Quantos tem? Conte e toque no número!');

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
    sayPrompt('Qual grupo tem mais? Esquerda, direita, ou são iguais?');

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
        btn.dataset.value = num;
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
        { value: 'equal', text: 'São Iguais', emoji: '🤝' },
        { value: 'right', text: `Direita ${gameState.rightObject}`, emoji: '👉' }
    ];

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn compare-btn';
        btn.innerHTML = `<span class="compare-emoji">${opt.emoji}</span><span>${opt.text}</span>`;
        btn.dataset.value = opt.value;
        btn.onclick = () => checkCompareAnswer(opt.value);
        optionsArea.appendChild(btn);
    });
}

// Verificar resposta de comparacao
function checkCompareAnswer(answer) {
    if (gameState.locked) return;
    const isCorrect = answer === gameState.correctAnswer;
    let correctText;
    if (gameState.correctAnswer === 'left') {
        correctText = `A esquerda tem mais! (${gameState.leftCount} > ${gameState.rightCount})`;
    } else if (gameState.correctAnswer === 'right') {
        correctText = `A direita tem mais! (${gameState.rightCount} > ${gameState.leftCount})`;
    } else {
        correctText = `São iguais! (${gameState.leftCount} = ${gameState.rightCount})`;
    }
    const spoken = correctText.replace(/\s*\(.*\)/, '');
    handleAnswer(String(answer), String(gameState.correctAnswer), isCorrect, correctText, spoken);
}

// Verificar resposta
function checkAnswer(answer) {
    if (gameState.locked) return;
    const n = gameState.currentNumber;
    const isCorrect = answer === n;
    const correctText = n === 1 ? 'É 1!' : `São ${n}!`;
    handleAnswer(String(answer), String(n), isCorrect, correctText, correctText);
}

// Logica comum: acerto, primeira tentativa errada (pode tentar de novo) e segundo erro
function handleAnswer(answer, correct, isCorrect, correctText, spokenCorrect) {
    const feedbackEl = document.getElementById('feedback');
    const buttons = document.querySelectorAll('.option-btn');

    if (isCorrect) {
        gameState.locked = true;
        buttons.forEach(btn => {
            btn.style.pointerEvents = 'none';
            if (btn.dataset.value === correct) btn.classList.add('correct');
        });
        playSound('correct');
        const praise = getRandomPraise();
        feedbackEl.textContent = `${praise} ${correctText}`;
        feedbackEl.className = 'feedback correct';
        speak(`${praise} ${spokenCorrect}`);
        gameState.score += 10;
        gameState.questionsAnswered++;
        updateStats();
        updateProgress();

        if (gameState.questionsAnswered >= gameState.questionsPerLevel) {
            setTimeout(showWinScreen, 1800);
        } else {
            setTimeout(nextQuestion, 1800);
        }
        return;
    }

    playSound('wrong');
    gameState.mistakes++;
    gameState.triesLeft--;

    // Marca o botao errado e desabilita so ele
    buttons.forEach(btn => {
        if (btn.dataset.value === answer) {
            btn.classList.add('wrong');
            btn.style.pointerEvents = 'none';
        }
    });

    if (gameState.triesLeft > 0) {
        feedbackEl.textContent = 'Quase! Tente de novo!';
        feedbackEl.className = 'feedback wrong';
        speak(gameState.mode === 'compare' ? 'Quase! Olhe de novo e tente outra vez!' : 'Quase! Conte de novo e tente outra vez!');
        return;
    }

    // Segundo erro: mostra a resposta certa e segue
    gameState.locked = true;
    buttons.forEach(btn => {
        btn.style.pointerEvents = 'none';
        if (btn.dataset.value === correct) btn.classList.add('correct');
    });
    feedbackEl.textContent = gameState.mode === 'compare' ? correctText : `Não! ${correctText}`;
    feedbackEl.className = 'feedback wrong';
    speak(spokenCorrect);
    setTimeout(nextQuestion, 2800);
}

// Frases de elogio
function getRandomPraise() {
    const praises = [
        'Muito bem!',
        'Perfeito!',
        'Isso mesmo!',
        'Parabéns!',
        'Você é demais!',
        'Incrível!',
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
    // Estrelas dependem dos erros: 3 (ate 1 erro), 2 (ate 3), senao 1
    let stars = 1;
    if (gameState.mistakes <= 1) stars = 3;
    else if (gameState.mistakes <= 3) stars = 2;

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
    speak(`Muito bem! Você ganhou ${stars} ${stars === 1 ? 'estrela' : 'estrelas'}!`);
    showScreen('win-screen');
}

// Jogar novamente
function playAgain() {
    startGame(gameState.difficulty, gameState.mode);
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
