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
    streak: 0,      // acertos seguidos (notas sobem)
    tries: 0,       // erros na pergunta atual
    locked: false   // trava os botoes depois do acerto
};

// ---------- Formas com volume (SVG: gradiente + brilho + sombra no chao) ----------
// cor: [clara, base, escura]
const SHAPE_TONES = {
    red: ['#ff8a80', '#f44336', '#b71c1c'],
    blue: ['#82c8ff', '#2196f3', '#0d47a1'],
    yellow: ['#fff9a8', '#ffe03b', '#d4a000'],
    green: ['#a5e6a8', '#4caf50', '#1b5e20'],
    purple: ['#e1a6ef', '#9c27b0', '#4a148c'],
    orange: ['#ffd08a', '#ff9800', '#c25e00'],
    pink: ['#ff9fc0', '#e91e63', '#880e4f']
};
// estrela de 5 pontas centrada em (50,48)
const STAR_PATH = (() => {
    const pts = [];
    for (let i = 0; i < 10; i++) {
        const r = i % 2 ? 19 : 44;
        const a = -Math.PI / 2 + i * Math.PI / 5;
        pts.push((50 + r * Math.cos(a)).toFixed(1) + ' ' + (50 + r * Math.sin(a)).toFixed(1));
    }
    return 'M' + pts.join(' L') + ' Z';
})();
const SHAPE_GEOM = {
    circle: '<circle cx="50" cy="47" r="38" %s/>',
    square: '<rect x="14" y="11" width="72" height="72" rx="11" %s/>',
    triangle: '<path d="M50 12 L88 80 L12 80 Z" stroke-linejoin="round" stroke-width="9" %s/>',
    rectangle: '<rect x="5" y="24" width="90" height="50" rx="9" %s/>',
    diamond: '<path d="M50 6 L88 47 L50 88 L12 47 Z" stroke-linejoin="round" stroke-width="7" %s/>',
    oval: '<ellipse cx="50" cy="48" rx="45" ry="29" %s/>',
    star: '<path d="' + STAR_PATH + '" stroke-linejoin="round" stroke-width="5" %s/>'
};

// Gradientes uma vez so no documento (cada forma usa url(#tom-cor))
function ensureShapeDefs() {
    if (document.getElementById('shape3d-defs')) return;
    const grads = Object.entries(SHAPE_TONES).map(([c, t]) =>
        `<radialGradient id="tom-${c}" cx="35%" cy="28%" r="80%">` +
        `<stop offset="0" stop-color="${t[0]}"/><stop offset=".55" stop-color="${t[1]}"/><stop offset="1" stop-color="${t[2]}"/></radialGradient>`
    ).join('');
    const svg = `<svg id="shape3d-defs" width="0" height="0" style="position:absolute;width:0;height:0" aria-hidden="true"><defs>${grads}` +
        `<radialGradient id="brilho3d" cx="32%" cy="22%" r="45%"><stop offset="0" stop-color="#fff" stop-opacity=".85"/>` +
        `<stop offset=".5" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs></svg>`;
    document.body.insertAdjacentHTML('afterbegin', svg);
}

// HTML de uma forma 3D (shape: circle/square/...; color: red/blue/...)
function shape3d(shape, color, cls) {
    ensureShapeDefs();
    const g = SHAPE_GEOM[shape] || SHAPE_GEOM.circle;
    const strokeAttr = /stroke-width/.test(g) ? `stroke="url(#tom-${color})"` : '';
    const base = g.replace('%s', `fill="url(#tom-${color})" ${strokeAttr}`);
    const gloss = g.replace('%s', 'fill="url(#brilho3d)" stroke="none"');
    return `<span class="shape3d ${cls || ''}" data-shape="${shape}" data-color="${color}">` +
        `<svg viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="50" cy="94" rx="30" ry="4.5" fill="#000" opacity=".2"/>` +
        `${base}${gloss}</svg></span>`;
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
    gameState.streak = 0;
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
    gameState.tries = 0;

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
        ${shape3d('circle', targetColor.class, 'alvo-forma')}
        <span style="font-family: 'Fredoka One', cursive; font-size: 1.5rem; margin-left: 15px; color: #333;">
            ${targetColor.ptName}
        </span>
    `;

    // Criar opcoes
    const optionsArea = document.getElementById('options-area');
    optionsArea.innerHTML = '';
    optionsArea.classList.toggle('many', options.length > 6);

    options.forEach((color, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.dataset.answer = color.name;
        btn.style.setProperty('--i', i);
        btn.innerHTML = shape3d('circle', color.class, 'opcao-forma');
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
        ${shape3d(targetShape.class, displayColor.class, 'alvo-forma')}
        <span style="font-family: 'Fredoka One', cursive; font-size: 1.5rem; margin-left: 15px; color: #333;">
            ${targetShape.ptName}
        </span>
    `;

    // Criar opcoes
    const optionsArea = document.getElementById('options-area');
    optionsArea.innerHTML = '';
    optionsArea.classList.toggle('many', options.length > 6);

    options.forEach((option, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.dataset.shape = option.shape.name;
        btn.dataset.correct = option.isCorrect;
        btn.style.setProperty('--i', i);
        btn.innerHTML = shape3d(option.shape.class, option.color.class, 'opcao-forma');
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
        buttons.forEach(btn => {
            btn.style.pointerEvents = 'none';
            if (!btn.classList.contains('correct')) btn.classList.add('fora');
        });
        const hit = [...buttons].find(b => b.classList.contains('correct'));
        if (hit && window.Efeitos) Efeitos.acerto(hit, { emoji: ['⭐', '✨'] });
        playSound('correct');
        gameState.streak++;
        if (window.KidsAudio && KidsAudio.note) setTimeout(() => KidsAudio.note(gameState.streak), 150);
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
        gameState.tries++;
        gameState.streak = 0;
        feedbackEl.textContent = 'Quase! Tente de novo!';
        feedbackEl.className = 'feedback wrong';
        // Aprendizagem sem erro: o botao errado sai de cena (balanca e apaga);
        // 2o erro tira mais uma opcao errada; 3o destaca a resposta certa
        const isRight = btn => type === 'color'
            ? btn.dataset.answer === gameState.correctAnswer.name
            : btn.dataset.shape === gameState.correctAnswer.name;
        buttons.forEach(btn => {
            if (btn.classList.contains('wrong') && !btn.classList.contains('fora')) {
                btn.style.pointerEvents = 'none';
                btn.classList.add('fora');
                if (window.Efeitos) Efeitos.erro(btn);
            }
        });
        if (gameState.tries >= 2) {
            const rest = [...buttons].filter(b => !isRight(b) && !b.classList.contains('fora'));
            if (rest.length) { rest[0].classList.add('fora'); rest[0].style.pointerEvents = 'none'; }
        }
        if (gameState.tries >= 3) buttons.forEach(b => { if (isRight(b)) b.classList.add('dica'); });
        speak(`Quase! ${lastPrompt}`);
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
    if (window.Efeitos) setTimeout(() => Efeitos.vitoria(), 200);
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
    const prev = document.querySelector('.shapes-preview');
    if (prev) prev.innerHTML = shape3d('circle', 'red') + shape3d('square', 'blue') + shape3d('triangle', 'yellow');
    showScreen('start-screen');
});
