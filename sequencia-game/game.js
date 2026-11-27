// Jogo de Sequência Lógica - Julia (4º ano) - estilo olimpiada (OBMEP Mirim / Canguru)
// Mundo de Julia & Livia
// A regra NAO aparece na pergunta: descobrir o padrao faz parte do desafio.
// Depois de cada resposta aparece a explicacao da regra.

// Estado do jogo
let gameState = {
    mode: 'numbers',
    level: 1,
    score: 0,
    questionsAnswered: 0,
    questionsPerLevel: 6,
    currentAnswer: null,
    currentExplain: '',
    difficulty: 1,
    answered: false,
    levelWrong: 0
};

let starTimers = [];
function clearStarTimers() {
    starTimers.forEach(clearTimeout);
    starTimers = [];
}

const SHAPES = ['circle', 'square', 'triangle'];
const COLORS = ['pattern-red', 'pattern-blue', 'pattern-green', 'pattern-yellow'];
const SHAPE_NAMES = { circle: 'círculo', square: 'quadrado', triangle: 'triângulo' };
const COLOR_NAMES = { 'pattern-red': 'vermelho', 'pattern-blue': 'azul', 'pattern-green': 'verde', 'pattern-yellow': 'amarelo' };

function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffleList(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Funcao para voltar
function goBack() {
    if (window.parent !== window) {
        try {
            if (window.parent.closeGameModal) {
                window.parent.closeGameModal();
                return;
            }
        } catch (e) {}
    }
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = '../index.html';
    }
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function goToMenu() {
    clearStarTimers();
    gameState.level = 1;
    gameState.score = 0;
    gameState.difficulty = 1;
    updateStats();
    showScreen('start-screen');
}

function updateStats() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('current-level').textContent = gameState.level;
}

function startGame(mode) {
    gameState.mode = mode;
    gameState.level = 1;
    gameState.questionsAnswered = 0;
    gameState.questionsPerLevel = 6;
    gameState.score = 0;
    gameState.difficulty = 1;
    gameState.levelWrong = 0;
    clearStarTimers();
    playSound('start');
    updateStats();
    updateProgress();
    showScreen('game-screen');
    nextQuestion();
}

function nextQuestion() {
    gameState.answered = false;
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('explain').innerHTML = '';
    document.getElementById('next-btn').hidden = true;

    if (gameState.mode === 'numbers') generateNumberSequence();
    else if (gameState.mode === 'patterns') generatePatternSequence();
    else if (Math.random() > 0.5) generateNumberSequence();
    else generatePatternSequence();
}

// ==========================================
// SEQUENCIAS NUMERICAS
// ==========================================
function generateNumberSequence() {
    const d = gameState.difficulty;
    // Tipos liberados conforme a dificuldade sobe
    const types = ['soma', 'subtrai', 'meio'];
    if (d >= 2) types.push('alternada', 'dobra', 'posicao');
    if (d >= 3) types.push('diferencas', 'fibonacci', 'quadrados');
    if (d >= 4) types.push('posicao', 'meio');
    const type = pick(types);

    let seq = [], answer, hole = 4, question = 'Qual número substitui o “?”', explain = '';

    switch (type) {
        case 'soma': {
            const k = rnd(2, 4 + 2 * d), a = rnd(1, 20);
            seq = [0, 1, 2, 3, 4].map(i => a + k * i);
            explain = `Cada número é o anterior <b>mais ${k}</b>: ${seq[3]} + ${k} = ${seq[4]}.`;
            break;
        }
        case 'subtrai': {
            const k = rnd(2, 3 + 2 * d), a = k * 5 + rnd(5, 40);
            seq = [0, 1, 2, 3, 4].map(i => a - k * i);
            explain = `Cada número é o anterior <b>menos ${k}</b>: ${seq[3]} − ${k} = ${seq[4]}.`;
            break;
        }
        case 'meio': {
            const k = rnd(3, 5 + 2 * d), a = rnd(1, 30);
            seq = [0, 1, 2, 3, 4].map(i => a + k * i);
            hole = rnd(1, 3);
            question = 'Qual número está faltando no meio da sequência?';
            explain = `A sequência aumenta de <b>${k} em ${k}</b>. O número que falta é ${seq[hole - 1]} + ${k} = ${seq[hole]}. Confira: ${seq[hole]} + ${k} = ${seq[hole + 1]} ✔`;
            break;
        }
        case 'alternada': {
            const p = rnd(2, 6);
            let q;
            // q diferente de p: com saltos iguais a sequencia nao seria "alternada" (e a explicacao ficaria errada)
            do { q = rnd(1, 4) * -1 + (Math.random() < .5 ? 0 : rnd(5, 9)); } while (q === p);
            const a = rnd(5, 20);
            seq = [a];
            for (let i = 1; i < 6; i++) seq.push(seq[i - 1] + (i % 2 ? p : q));
            hole = 5;
            const qs = q >= 0 ? `+${q}` : `${q}`;
            explain = `Os saltos se alternam: <b>+${p}, ${qs}, +${p}, ${qs}...</b> O próximo salto é +${p}: ${seq[4]} + ${p} = ${seq[5]}.`;
            break;
        }
        case 'dobra': {
            const m = pick([2, 2, 3]), a = rnd(1, 4);
            seq = [0, 1, 2, 3, 4].map(i => a * Math.pow(m, i));
            explain = `Cada número é o anterior <b>vezes ${m}</b>${m === 2 ? ' (o dobro)' : ' (o triplo)'}: ${seq[3]} × ${m} = ${seq[4]}.`;
            break;
        }
        case 'diferencas': {
            const a = rnd(1, 10), s = rnd(1, 3);
            seq = [a];
            for (let i = 1; i < 6; i++) seq.push(seq[i - 1] + s + i - 1);
            hole = 5;
            const diffs = seq.slice(1).map((v, i) => v - seq[i]);
            explain = `Olhe os saltos: <b>+${diffs.slice(0, 4).join(', +')}</b>... cada salto aumenta 1. O próximo é +${diffs[4]}: ${seq[4]} + ${diffs[4]} = ${seq[5]}.`;
            break;
        }
        case 'fibonacci': {
            const a = rnd(1, 5), b = rnd(a, a + 4);
            seq = [a, b];
            for (let i = 2; i < 6; i++) seq.push(seq[i - 1] + seq[i - 2]);
            hole = 5;
            explain = `Cada número é a <b>soma dos dois anteriores</b>: ${seq[3]} + ${seq[4]} = ${seq[5]}.`;
            break;
        }
        case 'quadrados': {
            const n = rnd(1, 5);
            seq = [0, 1, 2, 3, 4].map(i => (n + i) * (n + i));
            explain = `São números “quadrados”: ${seq.map((v, i) => `${n + i}×${n + i}`).join(', ')}. O próximo é ${n + 4} × ${n + 4} = ${seq[4]}.`;
            break;
        }
        case 'posicao': {
            const k = rnd(2, 6), a = rnd(1, 9), pos = pick([10, 12, 15, 20]);
            seq = [0, 1, 2, 3].map(i => a + k * i);
            answer = a + k * (pos - 1);
            showNumberSequence([...seq, '...'], -1, `Continuando esta sequência, qual será o <b>${pos}º número</b>?`);
            gameState.currentAnswer = answer;
            gameState.currentExplain = `A sequência começa em ${a} e aumenta ${k} a cada passo. Do 1º até o ${pos}º número são <b>${pos - 1} saltos</b> de ${k}: ${a} + ${pos - 1} × ${k} = ${a} + ${(pos - 1) * k} = ${answer}. (Cuidado: não são ${pos} saltos!)`;
            generateNumberOptions(answer, [a + k * pos, k * pos, answer - 1]);
            return;
        }
    }

    answer = seq[hole];
    const shown = seq.slice();
    shown[hole] = '?';
    gameState.currentAnswer = answer;
    gameState.currentExplain = explain;
    showNumberSequence(shown, hole, question);
    generateNumberOptions(answer);
}

function showNumberSequence(shown, hole, question) {
    document.getElementById('question-text').innerHTML = question;
    const display = document.getElementById('sequence-display');
    display.innerHTML = '';
    shown.forEach(num => {
        const item = document.createElement('div');
        item.className = 'sequence-item' + (num === '?' ? ' mystery' : '');
        item.textContent = num;
        display.appendChild(item);
    });
}

function generateNumberOptions(correctAnswer, traps) {
    const options = [correctAnswer];
    (traps || []).forEach(t => { if (t > 0 && !options.includes(t)) options.push(t); });
    let guard = 0;
    while (options.length < 4 && guard++ < 100) {
        const offset = rnd(-6, 6);
        const wrong = correctAnswer + offset;
        if (wrong > 0 && !options.includes(wrong)) options.push(wrong);
    }
    const optionsArea = document.getElementById('options-area');
    optionsArea.innerHTML = '';
    shuffleList(options.slice(0, 4)).forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.onclick = () => checkAnswer(option);
        optionsArea.appendChild(btn);
    });
}

// ==========================================
// PADROES DE FIGURAS (grupo que se repete)
// ==========================================
function randomUnit(len) {
    // Grupo de figuras que se repete; garante que nao seja tudo igual e que o grupo
    // nao seja formado por um grupo menor repetido (ex.: A B A B com "grupo de 4"),
    // senao a explicacao ("o grupo tem 4 figuras") nao bate com o que a crianca ve.
    const key = u => u.shape + u.color;
    const hasSmallerPeriod = unit => {
        for (let p = 1; p < unit.length; p++) {
            if (unit.length % p === 0 && unit.every((u, i) => key(u) === key(unit[i % p]))) return true;
        }
        return false;
    };
    let unit;
    do {
        unit = Array.from({ length: len }, () => ({ shape: pick(SHAPES), color: pick(COLORS) }));
    } while (new Set(unit.map(key)).size < Math.min(len, 2) || hasSmallerPeriod(unit));
    return unit;
}

function itemName(it) { return `${SHAPE_NAMES[it.shape]} ${COLOR_NAMES[it.color]}`; }

function generatePatternSequence() {
    const d = gameState.difficulty;
    const len = Math.min(4, 2 + Math.floor(Math.random() * Math.min(3, d + 1)));
    const unit = randomUnit(len);
    const askPosition = d >= 2 && Math.random() < 0.45;

    let shownCount, answerIndex, question;
    if (askPosition) {
        shownCount = len * 2;
        answerIndex = pick([15, 20, 23, 30, 50]);
        question = `O grupo de figuras continua se repetindo. Qual figura estará na <b>${answerIndex}ª posição</b>?`;
    } else {
        shownCount = len * 2 + rnd(0, len - 1);
        answerIndex = shownCount + 1;
        question = 'Qual figura vem a seguir?';
    }

    const at = pos => unit[(pos - 1) % len];
    const answer = at(answerIndex);
    const sequence = Array.from({ length: shownCount }, (_, i) => at(i + 1));
    if (!askPosition) sequence.push({ shape: '?', color: '' });

    const r = answerIndex % len;
    gameState.currentAnswer = answer;
    gameState.currentExplain = askPosition
        ? `O grupo que se repete tem <b>${len} figuras</b>. ${answerIndex} ÷ ${len} = ${Math.floor(answerIndex / len)} grupos completos e resto ${r}. ` +
          (r === 0 ? `Resto 0 quer dizer que a posição ${answerIndex} é a <b>última</b> figura do grupo: ${itemName(answer)}.`
                   : `Resto ${r} quer dizer a <b>${r}ª figura</b> do grupo: ${itemName(answer)}.`)
        : `O grupo de ${len} figuras se repete. Depois da ${shownCount}ª figura vem a ${((shownCount) % len) + 1}ª figura do grupo: ${itemName(answer)}.`;

    document.getElementById('question-text').innerHTML = question;
    const display = document.getElementById('sequence-display');
    display.innerHTML = '';
    sequence.forEach(item => {
        const container = document.createElement('div');
        container.className = 'sequence-item' + (item.shape === '?' ? ' mystery' : '');
        if (item.shape === '?') container.textContent = '?';
        else {
            const shapeEl = document.createElement('div');
            shapeEl.className = `pattern-item ${item.shape} ${item.color}`;
            container.appendChild(shapeEl);
        }
        display.appendChild(container);
    });
    if (askPosition) {
        const more = document.createElement('div');
        more.className = 'sequence-item';
        more.textContent = '...';
        display.appendChild(more);
    }

    // Opcoes: resposta + outras figuras do grupo + uma "quase igual"
    const key = it => it.shape + it.color;
    const options = [answer];
    unit.forEach(u => { if (!options.some(o => key(o) === key(u))) options.push(u); });
    let guard = 0;
    while (options.length < 4 && guard++ < 50) {
        const cand = Math.random() < .5 ? { shape: answer.shape, color: pick(COLORS) } : { shape: pick(SHAPES), color: answer.color };
        if (!options.some(o => key(o) === key(cand))) options.push(cand);
    }
    generatePatternOptions(options.slice(0, 4), answer);
}

// Gerar opcoes para sequencias de padrao
function generatePatternOptions(options, correctAnswer) {
    const optionsArea = document.getElementById('options-area');
    optionsArea.innerHTML = '';
    shuffleList(options).forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn pattern-option';
        const shapeEl = document.createElement('div');
        shapeEl.className = `pattern-item ${option.shape} ${option.color}`;
        btn.appendChild(shapeEl);
        btn.onclick = () => checkPatternAnswer(option, correctAnswer, btn);
        optionsArea.appendChild(btn);
    });
}

// Verificar resposta numerica
function checkAnswer(answer) {
    if (gameState.answered) return;
    const isCorrect = answer === gameState.currentAnswer;
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
        if (parseInt(btn.textContent) === answer) btn.classList.add(isCorrect ? 'correct' : 'wrong');
        if (parseInt(btn.textContent) === gameState.currentAnswer) btn.classList.add('correct');
    });
    processAnswer(isCorrect);
}

// Verificar resposta de padrao
function checkPatternAnswer(answer, correctAnswer, clickedBtn) {
    if (gameState.answered) return;
    const isCorrect = answer.shape === correctAnswer.shape && answer.color === correctAnswer.color;
    document.querySelectorAll('.option-btn').forEach(btn => { btn.disabled = true; });
    clickedBtn.classList.add(isCorrect ? 'correct' : 'wrong');
    if (!isCorrect) {
        document.querySelectorAll('.option-btn').forEach(btn => {
            const shapeEl = btn.querySelector('.pattern-item');
            if (shapeEl && shapeEl.classList.contains(correctAnswer.shape) && shapeEl.classList.contains(correctAnswer.color)) {
                btn.classList.add('correct');
            }
        });
    }
    processAnswer(isCorrect);
}

// Processar resposta: mostra a regra e espera "Proxima"
function processAnswer(isCorrect) {
    gameState.answered = true;
    const feedbackEl = document.getElementById('feedback');
    if (isCorrect) {
        playSound('correct');
        feedbackEl.textContent = getRandomPraise();
        feedbackEl.className = 'feedback correct';
        gameState.score += 10 + (gameState.difficulty * 5);
        gameState.questionsAnswered++;
        updateStats();
        updateProgress();
        if (gameState.questionsAnswered % 3 === 0) {
            gameState.difficulty = Math.min(gameState.difficulty + 1, 5);
        }
    } else {
        playSound('wrong');
        feedbackEl.textContent = 'Não foi dessa vez! A resposta certa está marcada.';
        feedbackEl.className = 'feedback wrong';
        gameState.levelWrong++;
    }
    document.getElementById('explain').innerHTML = '🔎 <b>A regra:</b> ' + gameState.currentExplain;
    const nextBtn = document.getElementById('next-btn');
    nextBtn.textContent = gameState.questionsAnswered >= gameState.questionsPerLevel ? 'Ver resultado 🏆' : 'Próxima ➜';
    nextBtn.hidden = false;
}

function goNext() {
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn.hidden) return;   // evita toque duplo
    nextBtn.hidden = true;
    playSound('click');
    if (gameState.questionsAnswered >= gameState.questionsPerLevel) showWinScreen();
    else nextQuestion();
}

function getRandomPraise() {
    const praises = ['Excelente raciocínio!', 'Você descobriu a regra!', 'Incrível!', 'Lógica perfeita!', 'Fantástico!', 'Genial!', 'Muito bem!', 'Pensou como uma olímpica!'];
    return praises[Math.floor(Math.random() * praises.length)];
}

function updateProgress() {
    const progress = (gameState.questionsAnswered / gameState.questionsPerLevel) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
}

function showWinScreen() {
    document.getElementById('final-score').textContent = gameState.score;
    // Estrelas pelo numero de erros no nivel
    const wrong = gameState.levelWrong;
    let stars = 1;
    if (wrong <= 1) stars = 3;
    else if (wrong <= 3) stars = 2;
    const levelMsg = document.getElementById('level-message');
    if (levelMsg) {
        levelMsg.textContent = wrong === 0
            ? `Você completou o nível ${gameState.level} sem errar nenhuma!`
            : `Você completou o nível ${gameState.level} com ${wrong} erro${wrong > 1 ? 's' : ''}.`;
    }
    clearStarTimers();
    const starsDisplay = document.getElementById('stars-display');
    starsDisplay.querySelectorAll('.star').forEach((star, i) => {
        star.classList.remove('earned');
        if (i < stars) starTimers.push(setTimeout(() => { star.classList.add('earned'); playSound('star'); }, i * 300));
    });
    playSound('win');
    showScreen('win-screen');
}

function nextLevel() {
    clearStarTimers();
    gameState.level++;
    gameState.questionsAnswered = 0;
    gameState.levelWrong = 0;
    gameState.questionsPerLevel = Math.min(6 + gameState.level, 10);
    gameState.difficulty = Math.min(gameState.difficulty + 1, 5);
    updateStats();
    updateProgress();
    playSound('start');
    showScreen('game-screen');
    nextQuestion();
}

// Sons: usa o audio compartilhado (um unico AudioContext)
function playSound(type) {
    try { if (window.KidsAudio) KidsAudio.play(type); } catch (e) {}
}

// Inicializacao
document.addEventListener('DOMContentLoaded', () => {
    showScreen('start-screen');
});
