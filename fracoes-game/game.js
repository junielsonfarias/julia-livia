// Jogo das Frações - Julia (4º ano)
// Mundo de Julia & Livia
// Habilidade BNCC: EF04MA09

// Fracoes comuns para o jogo
const FRACTIONS = [
    { num: 1, den: 2, name: 'um meio', decimal: 0.5 },
    { num: 1, den: 3, name: 'um terço', decimal: 0.333 },
    { num: 2, den: 3, name: 'dois terços', decimal: 0.666 },
    { num: 1, den: 4, name: 'um quarto', decimal: 0.25 },
    { num: 2, den: 4, name: 'dois quartos', decimal: 0.5 },
    { num: 3, den: 4, name: 'três quartos', decimal: 0.75 },
    { num: 1, den: 5, name: 'um quinto', decimal: 0.2 },
    { num: 2, den: 5, name: 'dois quintos', decimal: 0.4 },
    { num: 3, den: 5, name: 'três quintos', decimal: 0.6 },
    { num: 4, den: 5, name: 'quatro quintos', decimal: 0.8 },
    { num: 1, den: 6, name: 'um sexto', decimal: 0.166 },
    { num: 5, den: 6, name: 'cinco sextos', decimal: 0.833 },
    { num: 1, den: 8, name: 'um oitavo', decimal: 0.125 },
    { num: 3, den: 8, name: 'três oitavos', decimal: 0.375 },
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
    correctAnswer: null,
    answered: false,
    lastKey: ''
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

let starTimers = [];
function clearStarTimers() {
    starTimers.forEach(clearTimeout);
    starTimers = [];
}

// Ir para menu inicial
function goToMenu() {
    clearStarTimers();
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
    gameState.answered = false;
    gameState.lastKey = '';
    clearStarTimers();
    playSound('start');
    updateStats();
    showScreen('game-screen');
    nextQuestion();
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
    document.getElementById('explain').innerHTML = '';
    document.getElementById('next-btn').hidden = true;
    document.getElementById('options-area').className = 'options-area';
    gameState.answered = false;
    updateProgress();
    updateStats();

    // Gera a pergunta evitando repetir exatamente a anterior
    for (let tries = 0; tries < 6; tries++) {
        if (gameState.mode === 'identify') {
            generateIdentifyQuestion();
        } else if (gameState.mode === 'compare') {
            generateCompareQuestion();
        } else if (gameState.mode === 'problems') {
            generateProblemQuestion();
        } else {
            generateEquivalentQuestion();
        }
        const key = document.getElementById('question-text').textContent + '|' + document.getElementById('fraction-display').innerHTML;
        if (key !== gameState.lastKey) { gameState.lastKey = key; break; }
    }
}

// Mesmo valor? (ex.: 1/2 e 2/4)
function sameValue(a, b) {
    return a.num * b.den === b.num * a.den;
}

// Gerar pergunta de identificacao
function generateIdentifyQuestion() {
    // Selecionar fracao aleatoria
    const simpleFractions = FRACTIONS.filter(f => f.den <= 6);
    gameState.currentFraction = simpleFractions[Math.floor(Math.random() * simpleFractions.length)];
    gameState.correctAnswer = gameState.currentFraction;

    document.getElementById('question-text').textContent = 'Qual fração representa a parte colorida?';

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
            <p class="pizza-hint">Conte: quantas partes ao todo? Quantas coloridas?</p>
        </div>
    `;
}

// Criar opcoes de identificacao
function createIdentifyOptions() {
    const optionsArea = document.getElementById('options-area');
    optionsArea.innerHTML = '';

    // Opcao correta + 3 aleatorias
    // Exclui frações de mesmo valor (ex.: pizza 2/4 e opção 1/2 seriam as duas certas)
    const otherFractions = FRACTIONS.filter(f =>
        !sameValue(f, gameState.currentFraction) && f.den <= 6
    );
    const shuffledOthers = shuffleList(otherFractions).slice(0, 3);
    const options = shuffleList([gameState.currentFraction, ...shuffledOthers]);

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
    if (Math.random() < 0.2) {
        // As vezes as duas fracoes sao iguais (equivalentes), ex.: 1/2 e 2/4
        const group = EQUIVALENTS[Math.floor(Math.random() * EQUIVALENTS.length)];
        [frac1, frac2] = shuffleList(group.fractions).slice(0, 2);
    } else {
        do {
            frac1 = simpleFractions[Math.floor(Math.random() * simpleFractions.length)];
            frac2 = simpleFractions[Math.floor(Math.random() * simpleFractions.length)];
        } while (Math.abs(frac1.num / frac1.den - frac2.num / frac2.den) < 0.001);
    }

    gameState.currentFraction = { frac1, frac2 };
    const v1 = frac1.num / frac1.den, v2 = frac2.num / frac2.den;
    gameState.correctAnswer = Math.abs(v1 - v2) < 0.001 ? 'equal' : (v1 > v2 ? 'left' : 'right');

    document.getElementById('question-text').textContent = 'Qual fração é MAIOR? (ou são iguais?)';

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
        { value: 'equal', text: 'São iguais', emoji: '🤝' },
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

    document.getElementById('question-text').textContent = `Qual fração é equivalente a ${baseFraction.num}/${baseFraction.den}?`;

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
    const wrongOptions = shuffleList(FRACTIONS.filter(f =>
        !sameValue(f, gameState.currentFraction) && f.den <= 8
    )).slice(0, 3);

    const options = shuffleList([correctFraction, ...wrongOptions]);

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
    if (gameState.answered) return;   // evita toque duplo
    gameState.answered = true;
    const feedbackEl = document.getElementById('feedback');
    const buttons = document.querySelectorAll('.option-btn');
    let isCorrect = false;

    if (type === 'identify') {
        isCorrect = answer.num === gameState.correctAnswer.num && answer.den === gameState.correctAnswer.den;
    } else if (type === 'compare' || type === 'problem') {
        isCorrect = answer === gameState.correctAnswer;
    } else {
        isCorrect = answer.num === gameState.correctAnswer.num && answer.den === gameState.correctAnswer.den;
    }

    // Desabilitar botoes
    buttons.forEach(btn => { btn.disabled = true; btn.style.pointerEvents = 'none'; });

    // Marcar resposta
    buttons.forEach(btn => {
        if (type === 'problem') {
            if (btn.dataset.value === answer) btn.classList.add(isCorrect ? 'correct' : 'wrong');
            if (btn.dataset.value === gameState.correctAnswer) btn.classList.add('correct');
        } else if (type === 'identify' || type === 'equivalent') {
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
            const emojiOf = v => v === 'left' ? '👈' : (v === 'right' ? '👉' : '🤝');
            if (btn.textContent.includes(emojiOf(answer))) {
                btn.classList.add(isCorrect ? 'correct' : 'wrong');
            }
            if (btn.textContent.includes(emojiOf(gameState.correctAnswer))) {
                btn.classList.add('correct');
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
        feedbackEl.textContent = 'Não foi dessa vez! A resposta certa está em verde.';
        feedbackEl.className = 'feedback wrong';
        gameState.wrongAnswers++;
    }

    // Explicacao + botao "Proxima" (tempo para entender o porque)
    document.getElementById('explain').innerHTML = '💡 <b>Por quê?</b> ' + explainAnswer(type);
    gameState.currentQuestion++;
    document.getElementById('score').textContent = gameState.score;
    updateProgress();
    const nextBtn = document.getElementById('next-btn');
    nextBtn.textContent = gameState.currentQuestion >= gameState.totalQuestions ? 'Ver resultado 🏆' : 'Próxima ➜';
    nextBtn.hidden = false;
}

function goNext() {
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn.hidden) return;
    nextBtn.hidden = true;
    playSound('click');
    if (gameState.currentQuestion >= gameState.totalQuestions) showResults();
    else nextQuestion();
}

function explainAnswer(type) {
    if (type === 'identify') {
        const f = gameState.correctAnswer;
        return `A pizza foi dividida em <b>${f.den}</b> partes iguais (o denominador, número de baixo) e <b>${f.num}</b> estão coloridas (o numerador, número de cima): ${f.num}/${f.den}.`;
    }
    if (type === 'compare') {
        const { frac1: a, frac2: b } = gameState.currentFraction;
        if (gameState.correctAnswer === 'equal') {
            return `${a.num}/${a.den} e ${b.num}/${b.den} são frações equivalentes: veja nas barras, a parte pintada tem o mesmo tamanho!`;
        }
        const big = gameState.correctAnswer === 'left' ? a : b;
        const small = big === a ? b : a;
        if (a.den === b.den) return `Os denominadores são iguais (${a.den}), então é maior a que tem mais partes: ${big.num}/${big.den}.`;
        if (a.num === b.num) return `Os numeradores são iguais. Quanto MAIOR o denominador, MENORES são os pedaços. Por isso ${big.num}/${big.den} é maior que ${small.num}/${small.den}.`;
        return `Compare as barras: a parte pintada de ${big.num}/${big.den} é maior que a de ${small.num}/${small.den}.`;
    }
    if (type === 'equivalent') {
        const a = gameState.currentFraction, b = gameState.correctAnswer;
        const k = b.den / a.den;
        return `Multiplicando o numerador e o denominador pelo mesmo número (${k}): ${a.num} × ${k} = ${b.num} e ${a.den} × ${k} = ${b.den}. Então ${a.num}/${a.den} = ${b.num}/${b.den}.`;
    }
    return gameState.problemExplain || '';
}

function shuffleList(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ==========================================
// SITUACOES-PROBLEMA COM FRACOES (EF04MA09)
// Treina interpretar: "quanto deu?" x "quanto sobrou?"
// ==========================================
const NOMES = ['Julia', 'Livia', 'Pedro', 'Ana', 'Lucas', 'Bia', 'Theo', 'Marina'];
const ITENS = [['figurinhas', 'f'], ['balas', 'f'], ['adesivos', 'm'], ['morangos', 'm'], ['bolinhas de gude', 'f'], ['chaveiros', 'm']];

function rnd(n) { return Math.floor(Math.random() * n); }
function pick(arr) { return arr[rnd(arr.length)]; }

function generateProblemQuestion() {
    const kind = pick(['deu', 'sobrou', 'pizza', 'comparar', 'deu', 'sobrou']);
    const nome = pick(NOMES);
    let text, correct, wrongs, explain;

    if (kind === 'deu' || kind === 'sobrou') {
        const den = pick([2, 3, 4, 5, 6]);
        const num = den === 2 ? 1 : 1 + rnd(den - 1);
        const total = den * (2 + rnd(5));
        const [itens, gen] = pick(ITENS);
        const quantos = gen === 'f' ? 'quantas' : 'quantos';
        const deles = gen === 'f' ? 'delas' : 'deles';
        const unidade = total / den;
        const parte = unidade * num;
        const resto = total - parte;
        const pergunta = kind === 'deu' ? `${quantos[0].toUpperCase() + quantos.slice(1)} ${itens} ${nome} deu?` : `Com ${quantos} ${itens} ${nome} ficou?`;
        text = `${nome} tinha ${total} ${itens}. Deu ${num}/${den} ${deles} para um amigo. ${pergunta}`;
        correct = kind === 'deu' ? parte : resto;
        wrongs = [kind === 'deu' ? resto : parte, unidade, total - num, total + num, num * den];
        explain = `1/${den} de ${total} = ${total} ÷ ${den} = ${unidade}. Então ${num}/${den} de ${total} = ${num} × ${unidade} = ${parte}. ` +
            (kind === 'deu' ? `A pergunta é quanto DEU: ${parte}.` : `A pergunta é com quanto FICOU: ${total} − ${parte} = ${resto}.`);
    } else if (kind === 'pizza') {
        const den = pick([4, 6, 8]);
        const comeu = 1 + rnd(den - 2);
        const pede = pick(['comeu', 'sobrou']);
        text = `Uma pizza foi cortada em ${den} pedaços iguais. ${nome} comeu ${comeu} pedaço(s). Que fração da pizza ${pede === 'comeu' ? nome + ' comeu' : 'sobrou'}?`;
        correct = pede === 'comeu' ? `${comeu}/${den}` : `${den - comeu}/${den}`;
        wrongs = [pede === 'comeu' ? `${den - comeu}/${den}` : `${comeu}/${den}`, `${den}/${comeu}`, `${comeu}/${den - comeu}`, `1/${den}`];
        explain = `A pizza tem ${den} pedaços (denominador). ` + (pede === 'comeu'
            ? `${nome} comeu ${comeu}: ${comeu}/${den}.`
            : `Sobraram ${den} − ${comeu} = ${den - comeu} pedaços: ${den - comeu}/${den}.`) +
            ' Leia com atenção se a pergunta é o que comeu ou o que sobrou!';
    } else {
        const outro = pick(NOMES.filter(n => n !== nome));
        const d1 = pick([2, 3, 4, 5, 6, 8]);
        let d2;
        do { d2 = pick([2, 3, 4, 5, 6, 8]); } while (d2 === d1);
        text = `${nome} comeu 1/${d1} de uma barra de chocolate. ${outro} comeu 1/${d2} de outra barra igual. Quem comeu MAIS chocolate?`;
        correct = d1 < d2 ? nome : outro;
        wrongs = [d1 < d2 ? outro : nome, 'Os dois comeram igual', 'Não dá para saber'];
        explain = `Quando o numerador é 1, quanto MAIOR o denominador, MENOR é o pedaço (a barra foi dividida em mais partes). 1/${Math.min(d1, d2)} é maior que 1/${Math.max(d1, d2)}, então quem comeu mais foi ${correct}.`;
    }

    if (typeof correct === 'number') wrongs.push(correct + 1, correct + 2, correct * 2, correct + 3);
    const opts = [String(correct)];
    for (const w of wrongs) {
        const v = String(w);
        if (opts.length < 4 && !opts.includes(v) && !(typeof w === 'number' && w <= 0)) opts.push(v);
    }
    gameState.correctAnswer = String(correct);
    gameState.problemExplain = explain;

    document.getElementById('question-text').innerHTML = highlightProblem(text);
    document.getElementById('fraction-display').innerHTML = '';
    const area = document.getElementById('options-area');
    area.innerHTML = '';
    shuffleList(opts).forEach(v => {
        const btn = document.createElement('button');
        btn.className = 'option-btn problem-btn';
        btn.dataset.value = v;
        btn.textContent = v;
        btn.onclick = () => checkAnswer(v, 'problem');
        area.appendChild(btn);
    });
}

function highlightProblem(text) {
    return text.replace(/(Deu|deu|ficou|comeu|sobrou|MAIS|Quantos|Quantas|quantos|quantas|Que fração)/g, '<mark class="kw">$1</mark>');
}


// Mostrar resultados
function showResults() {
    const percentage = (gameState.correctAnswers / gameState.totalQuestions) * 100;

    let icon, title, message;
    if (percentage >= 80) {
        icon = '🏆';
        title = 'Excelente!';
        message = 'Você domina as frações!';
    } else if (percentage >= 60) {
        icon = '🎉';
        title = 'Muito bem!';
        message = 'Continue praticando!';
    } else if (percentage >= 40) {
        icon = '👍';
        title = 'Bom trabalho!';
        message = 'Tente novamente para melhorar!';
    } else {
        icon = '💪';
        title = 'Não desista!';
        message = 'A prática leva à perfeição!';
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

    clearStarTimers();
    const starsDisplay = document.getElementById('stars-display');
    starsDisplay.querySelectorAll('.star').forEach((star, i) => {
        star.classList.remove('earned');
        if (i < stars) {
            starTimers.push(setTimeout(() => {
                star.classList.add('earned');
                playSound('star');
            }, i * 300));
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
    const praises = ['Correto!', 'Muito bem!', 'Excelente!', 'Perfeito!', 'Incrível!', 'Genial!'];
    return praises[Math.floor(Math.random() * praises.length)];
}

// Sons: usa o audio compartilhado (um unico AudioContext)
function playSound(type) {
    try { if (window.KidsAudio) KidsAudio.play(type); } catch (e) {}
}

// Inicializacao
document.addEventListener('DOMContentLoaded', () => {
    showScreen('start-screen');
});
