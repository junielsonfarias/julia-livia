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
    gameState.streak = 0;
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
// Saida suave da pergunta atual (opacity/transform) e entrada da nova
let turnTimer = null;
function nextQuestion() {
    const content = document.querySelector('#game-screen .game-content');
    clearTimeout(turnTimer);
    const render = () => {
        document.getElementById('feedback').textContent = '';
        document.getElementById('feedback').className = 'feedback';
        gameState.wrongTries = 0;
        gameState.streakQ = 0;
        gameState.locked = false;
        if (gameState.mode === 'compare') generateCompareQuestion();
        else generateCountQuestion();
        if (content) {
            content.classList.remove('leaving');
            content.classList.add('entering');
            turnTimer = setTimeout(() => content.classList.remove('entering'), 420);
        }
    };
    // primeira pergunta (tela acabou de abrir) entra direto
    if (!content || !document.getElementById('game-screen').classList.contains('active') ||
        !document.getElementById('options-area').children.length) return render();
    content.classList.add('leaving');
    turnTimer = setTimeout(render, 230);
}

// Figuras 3D com entrada escalonada (50 ms cada). "offset" continua a contagem do atraso
function objectsHTML(emoji, n, offset) {
    const fig = window.Emoji3D ? Emoji3D.html(emoji, 'obj3d') : emoji;
    let out = '';
    for (let i = 0; i < n; i++) {
        out += `<span class="object-item" style="animation-delay:${((offset || 0) + i) * 50}ms">${fig}</span>`;
    }
    return out;
}

// Tocar nas figuras para contar: cada toque marca o numero e toca uma nota que sobe
function wireCounting(box) {
    let count = 0;
    box.querySelectorAll('.object-item').forEach(el => {
        el.addEventListener('pointerdown', () => {
            if (el.dataset.count) { if (window.Efeitos) Efeitos.pulo(el, 0.5); return; }
            count++;
            el.dataset.count = count;
            el.classList.add('counted');
            if (window.KidsAudio) KidsAudio.note(count - 1);
            if (window.Efeitos) Efeitos.pulo(el, 0.8);
        });
    });
}

// Ajuda: conta sozinho, uma figura por vez, com notas subindo (sem dar a resposta em botao)
function countWave(box, done) {
    const items = [...box.querySelectorAll('.object-item')];
    items.forEach(el => { el.classList.remove('counted', 'lit'); delete el.dataset.count; });
    items.forEach((el, i) => setTimeout(() => {
        el.dataset.count = i + 1;
        el.classList.add('counted', 'lit');
        if (window.KidsAudio) KidsAudio.note(Math.min(i, 10));
        if (i === items.length - 1 && done) done();
    }, 140 + i * 160));
}

// Gerar pergunta de contagem
function generateCountQuestion() {
    // Gerar numero aleatorio
    gameState.currentNumber = Math.floor(Math.random() * gameState.maxNumber) + 1;
    gameState.currentObject = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];

    // Mostrar objetos
    const objectsDisplay = document.getElementById('objects-display');
    objectsDisplay.className = 'objects-display' + (gameState.currentNumber > 10 ? ' many' : '');
    objectsDisplay.innerHTML = objectsHTML(gameState.currentObject, gameState.currentNumber);
    wireCounting(objectsDisplay);

    // Atualizar pergunta
    const emoji = gameState.currentObject;
    document.getElementById('question-text').innerHTML = `Quantos ${window.Emoji3D ? Emoji3D.html(emoji) : emoji} tem?`;
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
            <div class="compare-group" id="left-group">${objectsHTML(gameState.leftObject, gameState.leftCount)}</div>
            <div class="compare-vs">OU</div>
            <div class="compare-group" id="right-group">${objectsHTML(gameState.rightObject, gameState.rightCount, gameState.leftCount)}</div>
        </div>
    `;
    objectsDisplay.className = 'objects-display compare-mode';
    objectsDisplay.querySelectorAll('.compare-group').forEach(wireCounting);

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

    if (options.length === 6) optionsArea.classList.add('six');
    options.forEach((num, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.style.animationDelay = (120 + i * 40) + 'ms';
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

    const e3 = ch => window.Emoji3D ? Emoji3D.html(ch) : ch;
    const options = [
        { value: 'left', text: `${e3(gameState.leftObject)} Esquerda`, emoji: e3('👈') },
        { value: 'equal', text: 'São Iguais', emoji: e3('🤝') },
        { value: 'right', text: `Direita ${e3(gameState.rightObject)}`, emoji: e3('👉') }
    ];

    options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn compare-btn';
        btn.style.animationDelay = (120 + i * 60) + 'ms';
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
        const first = !gameState.wrongTries;
        let rightBtn = null;
        buttons.forEach(btn => {
            btn.style.pointerEvents = 'none';
            btn.classList.remove('hint-glow');
            if (btn.dataset.value === correct) { btn.classList.add('correct'); rightBtn = btn; }
        });
        playSound('correct');
        gameState.streak = first ? (gameState.streak || 0) + 1 : 0;
        if (window.Efeitos && rightBtn) Efeitos.acerto(rightBtn, { texto: first ? '+10' : '+5', emoji: ['⭐', '💖', '✨'] });
        const praise = getRandomPraise();
        feedbackEl.textContent = `${praise} ${correctText}`;
        feedbackEl.className = 'feedback correct';
        // elogio falado um pouco depois do som (nao atropela)
        setTimeout(() => speak(`${praise} ${spokenCorrect}`), 300);
        // as figuras "acendem" uma a uma, contando junto
        if (gameState.mode !== 'compare') {
            document.querySelectorAll('#objects-display .object-item').forEach((el, i) =>
                setTimeout(() => el.classList.add('lit'), i * 45));
        }
        gameState.score += first ? 10 : 5;
        gameState.questionsAnswered++;
        updateStats();
        updateProgress();
        const wait = gameState.mode !== 'compare' && gameState.currentNumber > 10 ? 1900 : 1600;
        setTimeout(gameState.questionsAnswered >= gameState.questionsPerLevel ? showWinScreen : nextQuestion, wait);
        return;
    }

    // Erro sem punir (aprendizagem sem erro):
    // 1º: balanca e repete a instrucao | 2º: some uma parte das erradas e conta junto | 3º: brilha a certa
    gameState.wrongTries = (gameState.wrongTries || 0) + 1;
    if (gameState.wrongTries <= 2) gameState.mistakes++;
    gameState.streak = 0;
    const wrongs = [...buttons].filter(b => b.dataset.value !== correct && !b.classList.contains('faded'));
    buttons.forEach(btn => {
        if (btn.dataset.value === answer) {
            btn.classList.add('faded');
            btn.style.pointerEvents = 'none';
            if (window.Efeitos) Efeitos.erro(btn);
        }
    });
    if (window.KidsAudio) KidsAudio.play('pop');
    feedbackEl.className = 'feedback wrong';

    if (gameState.wrongTries === 1) {
        feedbackEl.textContent = gameState.mode === 'compare' ? 'Quase! Olhe de novo 👀' : 'Quase! Toque em cada figura para contar 👆';
        speak(gameState.mode === 'compare' ? 'Quase! Olhe de novo e tente outra vez!' : 'Quase! Toque em cada figura para contar, e tente outra vez!');
        return;
    }
    if (gameState.wrongTries === 2) {
        // tira metade das erradas que sobraram
        const rest = wrongs.filter(b => b.dataset.value !== answer);
        rest.sort(() => Math.random() - 0.5).slice(0, Math.ceil(rest.length / 2)).forEach(b => {
            b.classList.add('faded'); b.style.pointerEvents = 'none';
        });
        feedbackEl.textContent = 'Vamos contar juntas! 🎵';
        speak('Vamos contar juntas!');
        if (gameState.mode === 'compare') document.querySelectorAll('#objects-display .compare-group').forEach(g => countWave(g));
        else countWave(document.getElementById('objects-display'));
        return;
    }
    // 3º erro em diante: a resposta certa brilha
    buttons.forEach(btn => { if (btn.dataset.value === correct) btn.classList.add('hint-glow'); });
    feedbackEl.textContent = `Olha aqui! ✨ ${correctText}`;
    speak(`${spokenCorrect} Toque no que está brilhando!`);
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
    if (window.Efeitos) setTimeout(() => Efeitos.vitoria(), 200);
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

// Explicacao falada da tela inicial (Livia ainda nao le)
function speakIntro() {
    speak('Vamos contar! Nos pintinhos e na águia, você conta as figuras e toca no número certo. ' +
        'O pintinho é o mais fácil. Nas carinhas pensando, você escolhe qual grupo tem mais.', { rate: 0.9 });
}

function repeatPrompt() {
    playSound('click');
    if (lastPrompt) speak(lastPrompt);
}

// Inicializacao
document.addEventListener('DOMContentLoaded', () => {
    showScreen('start-screen');
});
