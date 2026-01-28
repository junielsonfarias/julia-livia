// Jogo das Fracoes - Para criancas de 9 anos
// Mundo de Julia & Livia
// Habilidade BNCC: EF04MA09

// Fracoes comuns para o jogo
const FRACTIONS = [
    { num: 1, den: 2, name: 'um meio', decimal: 0.5 },
    { num: 1, den: 3, name: 'um terco', decimal: 0.333 },
    { num: 2, den: 3, name: 'dois tercos', decimal: 0.666 },
    { num: 1, den: 4, name: 'um quarto', decimal: 0.25 },
    { num: 2, den: 4, name: 'dois quartos', decimal: 0.5 },
    { num: 3, den: 4, name: 'tres quartos', decimal: 0.75 },
    { num: 1, den: 5, name: 'um quinto', decimal: 0.2 },
    { num: 2, den: 5, name: 'dois quintos', decimal: 0.4 },
    { num: 3, den: 5, name: 'tres quintos', decimal: 0.6 },
    { num: 4, den: 5, name: 'quatro quintos', decimal: 0.8 },
    { num: 1, den: 6, name: 'um sexto', decimal: 0.166 },
    { num: 5, den: 6, name: 'cinco sextos', decimal: 0.833 },
    { num: 1, den: 8, name: 'um oitavo', decimal: 0.125 },
    { num: 3, den: 8, name: 'tres oitavos', decimal: 0.375 },
    { num: 5, den: 8, name: 'cinco oitavos', decimal: 0.625 },
    { num: 7, den: 8, name: 'sete oitavos', decimal: 0.875 }
];

// Fracoes equivalentes
const EQUIVALENTS = [
    { fractions: [{ num: 1, den: 2 }, { num: 2, den: 4 }, { num: 3, den: 6 }, { num: 4, den: 8 }] },
    { fractions: [{ num: 1, den: 3 }, { num: 2, den: 6 }] },
    { fractions: [{ num: 2, den: 3 }, { num: 4, den: 6 }] },
    { fractions: [{ num: 1, den: 4 }, { num: 2, den: 8 }] },
    { fractions: [{ num: 3, den: 4 }, { num: 6, den: 8 }] }
];

// Estado do jogo
let gameState = {
    mode: 'identify',
    currentQuestion: 0,
    score: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    totalQuestions: 10,
    currentFraction: null,
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
    gameState.score = 0;
    gameState.currentQuestion = 0;
    showScreen('start-screen');
}

// Iniciar jogo
function startGame(mode) {
    gameState.mode = mode;
    gameState.currentQuestion = 0;
    gameState.score = 0;
    gameState.correctAnswers = 0;
    gameState.wrongAnswers = 0;
    updateStats();
    nextQuestion();
    showScreen('game-screen');
}

// Atualizar estatisticas
function updateStats() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('question-num').textContent = gameState.currentQuestion + 1;
    document.getElementById('total-questions').textContent = gameState.totalQuestions;
}

// Atualizar barra de progresso
function updateProgress() {
    const progress = (gameState.currentQuestion / gameState.totalQuestions) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
}

// Proxima pergunta
function nextQuestion() {
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    updateProgress();

    if (gameState.mode === 'identify') {
        generateIdentifyQuestion();
    } else if (gameState.mode === 'compare') {
        generateCompareQuestion();
    } else {
        generateEquivalentQuestion();
    }
}

// Gerar pergunta de identificacao
function generateIdentifyQuestion() {
    // Selecionar fracao aleatoria
    const simpleFractions = FRACTIONS.filter(f => f.den <= 6);
    gameState.currentFraction = simpleFractions[Math.floor(Math.random() * simpleFractions.length)];
    gameState.correctAnswer = gameState.currentFraction;

    document.getElementById('question-text').textContent = 'Qual fracao representa a parte colorida?';

    // Criar visualizacao
    const display = document.getElementById('fraction-display');
    display.innerHTML = createPizzaVisualization(gameState.currentFraction.num, gameState.currentFraction.den);

    // Criar opcoes
    createIdentifyOptions();
}

// Criar visualizacao de pizza
function createPizzaVisualization(numerator, denominator) {
    const sliceAngle = 360 / denominator;
    let slicesHtml = '';

    for (let i = 0; i < denominator; i++) {
        const startAngle = i * sliceAngle - 90;
        const endAngle = (i + 1) * sliceAngle - 90;
        const filled = i < numerator;

        const x1 = 50 + 45 * Math.cos(startAngle * Math.PI / 180);
        const y1 = 50 + 45 * Math.sin(startAngle * Math.PI / 180);
        const x2 = 50 + 45 * Math.cos(endAngle * Math.PI / 180);
        const y2 = 50 + 45 * Math.sin(endAngle * Math.PI / 180);

        const largeArcFlag = sliceAngle > 180 ? 1 : 0;

        slicesHtml += `
            <path d="M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArcFlag} 1 ${x2} ${y2} Z"
                  fill="${filled ? '#ff6b6b' : '#f0f0f0'}"
                  stroke="#333" stroke-width="2"/>
        `;
    }

    return `
        <div class="pizza-container">
            <svg viewBox="0 0 100 100" class="pizza-svg">
                ${slicesHtml}
                <circle cx="50" cy="50" r="45" fill="none" stroke="#333" stroke-width="2"/>
            </svg>
            <p class="pizza-hint">${numerator} de ${denominator} partes coloridas</p>
        </div>
    `;
}

// Criar opcoes de identificacao
function createIdentifyOptions() {
    const optionsArea = document.getElementById('options-area');
    optionsArea.innerHTML = '';

    // Opcao correta + 3 aleatorias
    const otherFractions = FRACTIONS.filter(f =>
        !(f.num === gameState.currentFraction.num && f.den === gameState.currentFraction.den) &&
        f.den <= 6
    );
    const shuffledOthers = otherFractions.sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [gameState.currentFraction, ...shuffledOthers].sort(() => Math.random() - 0.5);

    options.forEach(fraction => {
        const btn = document.createElement('button');
        btn.className = 'option-btn fraction-btn';
        btn.innerHTML = `
            <span class="fraction-display-small">
                <span class="frac-num">${fraction.num}</span>
                <span class="frac-bar"></span>
                <span class="frac-den">${fraction.den}</span>
            </span>
        `;
        btn.onclick = () => checkAnswer(fraction, 'identify');
        optionsArea.appendChild(btn);
    });
}

// Gerar pergunta de comparacao
function generateCompareQuestion() {
    const simpleFractions = FRACTIONS.filter(f => f.den <= 6);

    // Selecionar duas fracoes diferentes
    let frac1, frac2;
    do {
        frac1 = simpleFractions[Math.floor(Math.random() * simpleFractions.length)];
        frac2 = simpleFractions[Math.floor(Math.random() * simpleFractions.length)];
    } while (frac1.decimal === frac2.decimal);

    gameState.currentFraction = { frac1, frac2 };
    gameState.correctAnswer = frac1.decimal > frac2.decimal ? 'left' : 'right';

    document.getElementById('question-text').textContent = 'Qual fracao e MAIOR?';

    // Criar visualizacao
    const display = document.getElementById('fraction-display');
    display.innerHTML = `
        <div class="compare-container">
            <div class="compare-item" id="left-fraction">
                ${createBarVisualization(frac1.num, frac1.den)}
                <div class="fraction-label">
                    <span class="frac-num">${frac1.num}</span>
                    <span class="frac-bar"></span>
                    <span class="frac-den">${frac1.den}</span>
                </div>
            </div>
            <div class="compare-vs">ou</div>
            <div class="compare-item" id="right-fraction">
                ${createBarVisualization(frac2.num, frac2.den)}
                <div class="fraction-label">
                    <span class="frac-num">${frac2.num}</span>
                    <span class="frac-bar"></span>
                    <span class="frac-den">${frac2.den}</span>
                </div>
            </div>
        </div>
    `;

    // Criar opcoes
    createCompareOptions();
}

// Criar visualizacao de barra
function createBarVisualization(numerator, denominator) {
    let barsHtml = '';
    for (let i = 0; i < denominator; i++) {
        const filled = i < numerator;
        barsHtml += `<div class="bar-segment ${filled ? 'filled' : ''}"></div>`;
    }
    return `<div class="bar-visual">${barsHtml}</div>`;
}

// Criar opcoes de comparacao
function createCompareOptions() {
    const optionsArea = document.getElementById('options-area');
    optionsArea.innerHTML = '';
    optionsArea.className = 'options-area compare-options';

    const options = [
        { value: 'left', text: `${gameState.currentFraction.frac1.num}/${gameState.currentFraction.frac1.den}`, emoji: '👈' },
        { value: 'equal', text: 'Sao Iguais', emoji: '🤝' },
        { value: 'right', text: `${gameState.currentFraction.frac2.num}/${gameState.currentFraction.frac2.den}`, emoji: '👉' }
    ];

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn compare-btn';
        btn.innerHTML = `<span class="compare-emoji">${opt.emoji}</span><span>${opt.text}</span>`;
        btn.onclick = () => checkAnswer(opt.value, 'compare');
        optionsArea.appendChild(btn);
    });
}

// Gerar pergunta de equivalentes
function generateEquivalentQuestion() {
    // Selecionar um grupo de equivalentes
    const group = EQUIVALENTS[Math.floor(Math.random() * EQUIVALENTS.length)];
    const baseFraction = group.fractions[0];
    const equivalentFraction = group.fractions[Math.floor(Math.random() * (group.fractions.length - 1)) + 1];

    gameState.currentFraction = baseFraction;
    gameState.correctAnswer = equivalentFraction;

    document.getElementById('question-text').textContent = `Qual fracao e equivalente a ${baseFraction.num}/${baseFraction.den}?`;

    // Criar visualizacao
    const display = document.getElementById('fraction-display');
    display.innerHTML = `
        <div class="equivalent-display">
            ${createBarVisualization(baseFraction.num, baseFraction.den)}
            <div class="fraction-big">
                <span class="frac-num">${baseFraction.num}</span>
                <span class="frac-bar"></span>
                <span class="frac-den">${baseFraction.den}</span>
            </div>
            <span class="equals-sign">=</span>
            <span class="question-mark">?</span>
        </div>
    `;

    // Criar opcoes
    createEquivalentOptions(equivalentFraction);
}

// Criar opcoes de equivalentes
function createEquivalentOptions(correctFraction) {
    const optionsArea = document.getElementById('options-area');
    optionsArea.innerHTML = '';
    optionsArea.className = 'options-area';

    // Gerar opcoes incorretas (fracoes nao equivalentes)
    const wrongOptions = FRACTIONS.filter(f =>
        Math.abs(f.decimal - gameState.currentFraction.num / gameState.currentFraction.den) > 0.01 &&
        f.den <= 8
    ).slice(0, 3);

    const options = [correctFraction, ...wrongOptions].sort(() => Math.random() - 0.5);

    options.forEach(fraction => {
        const btn = document.createElement('button');
        btn.className = 'option-btn fraction-btn';
        btn.innerHTML = `
            <span class="fraction-display-small">
                <span class="frac-num">${fraction.num}</span>
                <span class="frac-bar"></span>
                <span class="frac-den">${fraction.den}</span>
            </span>
        `;
        btn.onclick = () => checkAnswer(fraction, 'equivalent');
        optionsArea.appendChild(btn);
    });
}

// Verificar resposta
function checkAnswer(answer, type) {
    const feedbackEl = document.getElementById('feedback');
    const buttons = document.querySelectorAll('.option-btn');
    let isCorrect = false;

    if (type === 'identify') {
        isCorrect = answer.num === gameState.correctAnswer.num && answer.den === gameState.correctAnswer.den;
    } else if (type === 'compare') {
        isCorrect = answer === gameState.correctAnswer;
    } else {
        isCorrect = answer.num === gameState.correctAnswer.num && answer.den === gameState.correctAnswer.den;
    }

    // Desabilitar botoes
    buttons.forEach(btn => btn.style.pointerEvents = 'none');

    // Marcar resposta
    buttons.forEach(btn => {
        if (type === 'identify' || type === 'equivalent') {
            const numEl = btn.querySelector('.frac-num');
            const denEl = btn.querySelector('.frac-den');
            if (numEl && denEl) {
                const btnNum = parseInt(numEl.textContent);
                const btnDen = parseInt(denEl.textContent);
                if (btnNum === answer.num && btnDen === answer.den) {
                    btn.classList.add(isCorrect ? 'correct' : 'wrong');
                }
                if (btnNum === gameState.correctAnswer.num && btnDen === gameState.correctAnswer.den) {
                    btn.classList.add('correct');
                }
            }
        } else {
            if (btn.textContent.includes(answer === 'left' ? '👈' : (answer === 'right' ? '👉' : '🤝'))) {
                btn.classList.add(isCorrect ? 'correct' : 'wrong');
            }
        }
    });

    if (isCorrect) {
        playSound('correct');
        feedbackEl.textContent = getRandomPraise();
        feedbackEl.className = 'feedback correct';
        gameState.score += 10;
        gameState.correctAnswers++;
    } else {
        playSound('wrong');
        if (type === 'identify') {
            feedbackEl.textContent = `A resposta correta e ${gameState.correctAnswer.num}/${gameState.correctAnswer.den}`;
        } else if (type === 'compare') {
            const winner = gameState.correctAnswer === 'left' ? gameState.currentFraction.frac1 : gameState.currentFraction.frac2;
            feedbackEl.textContent = `${winner.num}/${winner.den} e maior!`;
        } else {
            feedbackEl.textContent = `${gameState.correctAnswer.num}/${gameState.correctAnswer.den} e equivalente!`;
        }
        feedbackEl.className = 'feedback wrong';
        gameState.wrongAnswers++;
    }

    gameState.currentQuestion++;
    updateStats();

    if (gameState.currentQuestion >= gameState.totalQuestions) {
        setTimeout(showResults, 2000);
    } else {
        setTimeout(nextQuestion, 2000);
    }
}

// Mostrar resultados
function showResults() {
    const percentage = (gameState.correctAnswers / gameState.totalQuestions) * 100;

    let icon, title, message;
    if (percentage >= 80) {
        icon = '🏆';
        title = 'Excelente!';
        message = 'Voce domina as fracoes!';
    } else if (percentage >= 60) {
        icon = '🎉';
        title = 'Muito Bem!';
        message = 'Continue praticando!';
    } else if (percentage >= 40) {
        icon = '👍';
        title = 'Bom Trabalho!';
        message = 'Tente novamente para melhorar!';
    } else {
        icon = '💪';
        title = 'Nao Desista!';
        message = 'A pratica leva a perfeicao!';
    }

    document.getElementById('result-icon').textContent = icon;
    document.getElementById('result-title').textContent = title;
    document.getElementById('result-message').textContent = message;
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('correct-count').textContent = gameState.correctAnswers;
    document.getElementById('wrong-count').textContent = gameState.wrongAnswers;

    // Calcular estrelas
    let stars = 1;
    if (percentage >= 80) stars = 3;
    else if (percentage >= 50) stars = 2;

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
    showScreen('result-screen');
}

// Jogar novamente
function playAgain() {
    startGame(gameState.mode);
}

// Frases de elogio
function getRandomPraise() {
    const praises = ['Correto!', 'Muito bem!', 'Excelente!', 'Perfeito!', 'Incrivel!', 'Genial!'];
    return praises[Math.floor(Math.random() * praises.length)];
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
