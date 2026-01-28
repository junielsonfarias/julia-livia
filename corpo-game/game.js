// Jogo do Corpo Humano - Para criancas de 4 anos
// Mundo de Julia & Livia
// BNCC: EI03CG02 - Demonstrar controle e adequacao do uso do corpo

// Partes do corpo
const BODY_PARTS = [
    { id: 'head', name: 'Cabeca', emoji: '🗣️', position: { top: '5%', left: '50%' }, hint: 'Onde fica o cerebro!' },
    { id: 'hair', name: 'Cabelo', emoji: '💇', position: { top: '0%', left: '50%' }, hint: 'Fica em cima da cabeca!' },
    { id: 'eyes', name: 'Olhos', emoji: '👀', position: { top: '12%', left: '50%' }, hint: 'Usamos para ver!' },
    { id: 'nose', name: 'Nariz', emoji: '👃', position: { top: '18%', left: '50%' }, hint: 'Usamos para cheirar!' },
    { id: 'mouth', name: 'Boca', emoji: '👄', position: { top: '24%', left: '50%' }, hint: 'Usamos para comer e falar!' },
    { id: 'ears', name: 'Orelhas', emoji: '👂', position: { top: '14%', left: '35%' }, hint: 'Usamos para ouvir!' },
    { id: 'neck', name: 'Pescoco', emoji: '🦒', position: { top: '30%', left: '50%' }, hint: 'Liga a cabeca ao corpo!' },
    { id: 'shoulders', name: 'Ombros', emoji: '💪', position: { top: '35%', left: '50%' }, hint: 'Ficam em cima dos bracos!' },
    { id: 'arms', name: 'Bracos', emoji: '💪', position: { top: '45%', left: '25%' }, hint: 'Usamos para abracar!' },
    { id: 'hands', name: 'Maos', emoji: '🤚', position: { top: '55%', left: '20%' }, hint: 'Ficam no fim dos bracos!' },
    { id: 'fingers', name: 'Dedos', emoji: '🖐️', position: { top: '58%', left: '20%' }, hint: 'Temos 10 deles!' },
    { id: 'belly', name: 'Barriga', emoji: '🫃', position: { top: '50%', left: '50%' }, hint: 'Onde fica a comida!' },
    { id: 'legs', name: 'Pernas', emoji: '🦵', position: { top: '70%', left: '45%' }, hint: 'Usamos para andar!' },
    { id: 'knees', name: 'Joelhos', emoji: '🦵', position: { top: '75%', left: '45%' }, hint: 'Dobram as pernas!' },
    { id: 'feet', name: 'Pes', emoji: '🦶', position: { top: '92%', left: '45%' }, hint: 'Ficam no fim das pernas!' }
];

// Estado do jogo
let gameState = {
    score: 0,
    currentPart: null,
    questionsAnswered: 0,
    questionsPerLevel: 8,
    usedParts: [],
    gameMode: 'identify' // 'identify' ou 'name'
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
    gameState.usedParts = [];
    showScreen('start-screen');
}

// Iniciar jogo
function startGame(mode) {
    gameState.gameMode = mode || 'identify';
    gameState.score = 0;
    gameState.questionsAnswered = 0;
    gameState.usedParts = [];
    updateStats();
    updateProgress();
    nextQuestion();
    showScreen('game-screen');
}

// Atualizar estatisticas
function updateStats() {
    document.getElementById('score').textContent = gameState.score;
}

// Proxima pergunta
function nextQuestion() {
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';

    // Selecionar parte do corpo aleatoria nao usada
    let availableParts = BODY_PARTS.filter(p => !gameState.usedParts.includes(p.id));
    if (availableParts.length === 0) {
        gameState.usedParts = [];
        availableParts = BODY_PARTS;
    }

    gameState.currentPart = availableParts[Math.floor(Math.random() * availableParts.length)];
    gameState.usedParts.push(gameState.currentPart.id);

    const questionText = document.getElementById('question-text');
    const bodyArea = document.getElementById('body-area');

    if (gameState.gameMode === 'identify') {
        // Modo: Onde esta? - Mostrar corpo e clicar na parte
        questionText.innerHTML = `Toque na <span class="highlight">${gameState.currentPart.name}</span>`;
        renderBodyForIdentify(bodyArea);
    } else {
        // Modo: Qual e o nome? - Mostrar parte destacada e escolher nome
        questionText.innerHTML = `Qual e o nome desta parte? ${gameState.currentPart.emoji}`;
        renderOptionsForName(bodyArea);
    }
}

// Renderizar corpo para modo identificar
function renderBodyForIdentify(container) {
    container.innerHTML = '';
    container.className = 'body-area body-identify';

    // Criar figura do corpo
    const bodyFigure = document.createElement('div');
    bodyFigure.className = 'body-figure';

    // SVG simplificado de pessoa
    bodyFigure.innerHTML = `
        <svg viewBox="0 0 200 400" class="body-svg">
            <!-- Cabeca -->
            <circle cx="100" cy="40" r="35" fill="#FFD699" stroke="#333" stroke-width="2"/>
            <!-- Cabelo -->
            <path d="M65 30 Q100 0 135 30" fill="#4A3728" stroke="#333" stroke-width="1"/>
            <!-- Olhos -->
            <circle cx="85" cy="35" r="5" fill="#333"/>
            <circle cx="115" cy="35" r="5" fill="#333"/>
            <!-- Nariz -->
            <path d="M100 42 L95 55 L105 55 Z" fill="#E6B87A"/>
            <!-- Boca -->
            <path d="M85 65 Q100 75 115 65" stroke="#E57373" stroke-width="3" fill="none"/>
            <!-- Orelhas -->
            <ellipse cx="60" cy="40" rx="8" ry="12" fill="#FFD699" stroke="#333" stroke-width="1"/>
            <ellipse cx="140" cy="40" rx="8" ry="12" fill="#FFD699" stroke="#333" stroke-width="1"/>
            <!-- Pescoco -->
            <rect x="90" y="75" width="20" height="25" fill="#FFD699" stroke="#333" stroke-width="1"/>
            <!-- Corpo/Tronco -->
            <rect x="60" y="100" width="80" height="100" rx="10" fill="#64B5F6" stroke="#333" stroke-width="2"/>
            <!-- Ombros -->
            <ellipse cx="55" cy="110" rx="15" ry="10" fill="#64B5F6" stroke="#333" stroke-width="1"/>
            <ellipse cx="145" cy="110" rx="15" ry="10" fill="#64B5F6" stroke="#333" stroke-width="1"/>
            <!-- Bracos -->
            <rect x="25" y="110" width="25" height="80" rx="10" fill="#FFD699" stroke="#333" stroke-width="2"/>
            <rect x="150" y="110" width="25" height="80" rx="10" fill="#FFD699" stroke="#333" stroke-width="2"/>
            <!-- Maos -->
            <circle cx="37" cy="200" r="15" fill="#FFD699" stroke="#333" stroke-width="2"/>
            <circle cx="163" cy="200" r="15" fill="#FFD699" stroke="#333" stroke-width="2"/>
            <!-- Barriga (marca na camiseta) -->
            <ellipse cx="100" cy="160" rx="20" ry="15" fill="#4A90D9" opacity="0.5"/>
            <!-- Pernas -->
            <rect x="65" y="200" width="28" height="120" rx="10" fill="#5D4037" stroke="#333" stroke-width="2"/>
            <rect x="107" y="200" width="28" height="120" rx="10" fill="#5D4037" stroke="#333" stroke-width="2"/>
            <!-- Joelhos -->
            <ellipse cx="79" cy="280" rx="12" ry="8" fill="#4E342E" opacity="0.3"/>
            <ellipse cx="121" cy="280" rx="12" ry="8" fill="#4E342E" opacity="0.3"/>
            <!-- Pes -->
            <ellipse cx="79" cy="330" rx="20" ry="12" fill="#333" stroke="#222" stroke-width="2"/>
            <ellipse cx="121" cy="330" rx="20" ry="12" fill="#333" stroke="#222" stroke-width="2"/>
        </svg>
    `;

    // Adicionar areas clicaveis
    const clickAreas = [
        { id: 'hair', x: 65, y: 5, w: 70, h: 30 },
        { id: 'head', x: 65, y: 5, w: 70, h: 70 },
        { id: 'eyes', x: 75, y: 25, w: 50, h: 25 },
        { id: 'nose', x: 90, y: 42, w: 20, h: 20 },
        { id: 'mouth', x: 80, y: 60, w: 40, h: 20 },
        { id: 'ears', x: 52, y: 28, w: 20, h: 25 },
        { id: 'neck', x: 85, y: 75, w: 30, h: 25 },
        { id: 'shoulders', x: 40, y: 100, w: 120, h: 25 },
        { id: 'arms', x: 20, y: 110, w: 35, h: 90 },
        { id: 'hands', x: 20, y: 185, w: 35, h: 35 },
        { id: 'fingers', x: 20, y: 185, w: 35, h: 35 },
        { id: 'belly', x: 70, y: 140, w: 60, h: 50 },
        { id: 'legs', x: 60, y: 200, w: 80, h: 100 },
        { id: 'knees', x: 60, y: 265, w: 80, h: 30 },
        { id: 'feet', x: 55, y: 315, w: 90, h: 30 }
    ];

    clickAreas.forEach(area => {
        const clickZone = document.createElement('div');
        clickZone.className = 'click-zone';
        clickZone.dataset.partId = area.id;
        clickZone.style.cssText = `
            position: absolute;
            left: ${area.x / 2}%;
            top: ${area.y / 4}%;
            width: ${area.w / 2}%;
            height: ${area.h / 4}%;
            cursor: pointer;
        `;
        clickZone.onclick = () => checkIdentifyAnswer(area.id);
        bodyFigure.appendChild(clickZone);
    });

    container.appendChild(bodyFigure);

    // Dica
    const hint = document.createElement('div');
    hint.className = 'hint-text';
    hint.textContent = `Dica: ${gameState.currentPart.hint}`;
    container.appendChild(hint);
}

// Renderizar opcoes para modo nome
function renderOptionsForName(container) {
    container.innerHTML = '';
    container.className = 'body-area body-name';

    // Mostrar emoji grande da parte
    const partDisplay = document.createElement('div');
    partDisplay.className = 'part-display';
    partDisplay.innerHTML = `<span class="big-emoji">${gameState.currentPart.emoji}</span>`;
    container.appendChild(partDisplay);

    // Criar opcoes
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'name-options';

    // Pegar 3 partes aleatorias diferentes + a correta
    const otherParts = BODY_PARTS.filter(p => p.id !== gameState.currentPart.id);
    const shuffledOthers = otherParts.sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [gameState.currentPart, ...shuffledOthers].sort(() => Math.random() - 0.5);

    options.forEach(part => {
        const btn = document.createElement('button');
        btn.className = 'name-btn';
        btn.innerHTML = `
            <span class="name-emoji">${part.emoji}</span>
            <span class="name-text">${part.name}</span>
        `;
        btn.onclick = () => checkNameAnswer(part);
        optionsDiv.appendChild(btn);
    });

    container.appendChild(optionsDiv);

    // Dica
    const hint = document.createElement('div');
    hint.className = 'hint-text';
    hint.textContent = `Dica: ${gameState.currentPart.hint}`;
    container.appendChild(hint);
}

// Verificar resposta (modo identificar)
function checkIdentifyAnswer(partId) {
    const feedbackEl = document.getElementById('feedback');
    const isCorrect = partId === gameState.currentPart.id;

    // Destacar area clicada
    const clickedZone = document.querySelector(`[data-part-id="${partId}"]`);
    if (clickedZone) {
        clickedZone.classList.add(isCorrect ? 'correct' : 'wrong');
    }

    // Se errou, mostrar a correta
    if (!isCorrect) {
        const correctZone = document.querySelector(`[data-part-id="${gameState.currentPart.id}"]`);
        if (correctZone) {
            correctZone.classList.add('correct');
        }
    }

    handleAnswerResult(isCorrect, feedbackEl, `Essa e a ${gameState.currentPart.name}!`);
}

// Verificar resposta (modo nome)
function checkNameAnswer(part) {
    const feedbackEl = document.getElementById('feedback');
    const buttons = document.querySelectorAll('.name-btn');
    const isCorrect = part.id === gameState.currentPart.id;

    // Desabilitar botoes
    buttons.forEach(btn => {
        btn.style.pointerEvents = 'none';
        const name = btn.querySelector('.name-text').textContent;
        if (name === part.name) {
            btn.classList.add(isCorrect ? 'correct' : 'wrong');
        }
        if (name === gameState.currentPart.name) {
            btn.classList.add('correct');
        }
    });

    handleAnswerResult(isCorrect, feedbackEl, `Essa e a ${gameState.currentPart.name}!`);
}

// Processar resultado da resposta
function handleAnswerResult(isCorrect, feedbackEl, wrongMessage) {
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
        feedbackEl.textContent = wrongMessage;
        feedbackEl.className = 'feedback wrong';

        setTimeout(nextQuestion, 2500);
    }
}

// Frases de elogio
function getRandomPraise() {
    const praises = [
        'Muito bem!',
        'Perfeito!',
        'Isso mesmo!',
        'Parabens!',
        'Voce conhece o corpo!',
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
    startGame(gameState.gameMode);
}

// Sons do sistema
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
