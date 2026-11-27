// Jogo do Corpo Humano - Para criancas de 4 anos
// Mundo de Julia & Livia
// BNCC: EI03CG02 - Demonstrar controle e adequacao do uso do corpo

// Partes do corpo
// art: artigo (o/a/os/as) | identify: aparece no "Onde Está?" (tem area clicavel propria)
// emoji: usado no "Qual é o Nome?" (null = fica fora desse modo, por nao ter emoji claro)
const BODY_PARTS = [
    { id: 'head', name: 'Cabeça', art: 'a', emoji: null, identify: true, hint: 'Onde fica o cérebro!' },
    { id: 'hair', name: 'Cabelo', art: 'o', emoji: '💇', identify: true, hint: 'Fica em cima da cabeça!' },
    { id: 'eyes', name: 'Olhos', art: 'os', emoji: '👀', identify: true, hint: 'Usamos para ver!' },
    { id: 'nose', name: 'Nariz', art: 'o', emoji: '👃', identify: true, hint: 'Usamos para cheirar!' },
    { id: 'mouth', name: 'Boca', art: 'a', emoji: '👄', identify: true, hint: 'Usamos para comer e falar!' },
    { id: 'ears', name: 'Orelhas', art: 'as', emoji: '👂', identify: true, hint: 'Usamos para ouvir!' },
    { id: 'neck', name: 'Pescoço', art: 'o', emoji: null, identify: true, hint: 'Liga a cabeça ao corpo!' },
    { id: 'shoulders', name: 'Ombros', art: 'os', emoji: null, identify: true, hint: 'Ficam em cima dos braços!' },
    { id: 'arms', name: 'Braços', art: 'os', emoji: '💪', identify: true, hint: 'Usamos para abraçar!' },
    { id: 'hands', name: 'Mãos', art: 'as', emoji: '👐', identify: true, hint: 'Ficam no fim dos braços!' },
    { id: 'fingers', name: 'Dedos', art: 'os', emoji: '☝️', identify: false, hint: 'Temos 10 deles nas mãos!' },
    { id: 'belly', name: 'Barriga', art: 'a', emoji: null, identify: true, hint: 'Onde fica a comida!' },
    { id: 'legs', name: 'Pernas', art: 'as', emoji: '🦵', identify: true, hint: 'Usamos para andar!' },
    { id: 'knees', name: 'Joelhos', art: 'os', emoji: null, identify: true, hint: 'Dobram as pernas!' },
    { id: 'feet', name: 'Pés', art: 'os', emoji: '🦶', identify: true, hint: 'Ficam no fim das pernas!' },
    { id: 'teeth', name: 'Dentes', art: 'os', emoji: '🦷', identify: false, hint: 'Usamos para mastigar!' },
    { id: 'tongue', name: 'Língua', art: 'a', emoji: '👅', identify: false, hint: 'Sente o gosto da comida!' }
];

// Partes que ficam DENTRO de outra (tocar no nariz tambem vale como "cabeça")
const PART_PARENTS = {
    hair: ['head'], eyes: ['head'], nose: ['head'], mouth: ['head'], ears: ['head'],
    knees: ['legs']
};

// "Qual é o Nome?": partes que nao aparecem juntas como opcao
const NAME_CONFLICTS = {
    fingers: ['hands'], hands: ['fingers'],
    tongue: ['mouth'], mouth: ['tongue']
};

const PREP = { o: 'no', a: 'na', os: 'nos', as: 'nas' };            // Toque no nariz
const THIS_IS = { o: 'Esse é', a: 'Essa é', os: 'Esses são', as: 'Essas são' };

function partLower(part) { return part.name.toLowerCase(); }
function touchPhrase(part) { return `Toque ${PREP[part.art]} ${partLower(part)}!`; }
function thisIsPhrase(part) { return `${THIS_IS[part.art]} ${part.art} ${partLower(part)}!`; }

// Partes de cada modo
function getPool() {
    return gameState.gameMode === 'identify'
        ? BODY_PARTS.filter(p => p.identify)
        : BODY_PARTS.filter(p => p.emoji);
}

// Estado do jogo
let gameState = {
    score: 0,
    currentPart: null,
    questionsAnswered: 0,
    questionsPerLevel: 8,
    usedParts: [],
    gameMode: 'identify', // 'identify' ou 'name'
    mistakes: 0,
    streak: 0,       // acertos seguidos (notas sobem)
    tries: 0,        // erros na pergunta atual
    locked: false
};

// Aprendizagem sem erro: 1o erro balanca e repete a instrucao;
// 2o/3o erro destaca onde esta a resposta. A pergunta continua ate acertar.
function tryAgain(touchedEl, rightEls, spoken) {
    gameState.mistakes++;
    gameState.tries++;
    gameState.streak = 0;
    playSound('wrong');
    if (touchedEl && window.Efeitos) Efeitos.erro(touchedEl);
    const feedbackEl = document.getElementById('feedback');
    feedbackEl.textContent = 'Quase! Tente de novo!';
    feedbackEl.className = 'feedback wrong';
    if (gameState.tries >= 2) rightEls.forEach(el => el && el.classList.add('dica'));
    speak(`Quase! ${spoken}`);
}

let lastPrompt = '';
let nextTimer = null;   // proxima pergunta/vitoria agendada (cancelada ao sair ou reiniciar)

function clearNextTimer() {
    if (nextTimer) { clearTimeout(nextTimer); nextTimer = null; }
}

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
    clearNextTimer();
    gameState.score = 0;
    gameState.questionsAnswered = 0;
    gameState.usedParts = [];
    gameState.mistakes = 0;
    showScreen('start-screen');
}

// Iniciar jogo
function startGame(mode) {
    clearNextTimer();
    gameState.gameMode = mode || 'identify';
    gameState.score = 0;
    gameState.questionsAnswered = 0;
    gameState.usedParts = [];
    gameState.mistakes = 0;
    gameState.streak = 0;
    updateStats();
    updateProgress();
    playSound('start');
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
    gameState.locked = false;

    // Selecionar parte do corpo aleatoria nao usada
    const pool = getPool();
    let availableParts = pool.filter(p => !gameState.usedParts.includes(p.id));
    if (availableParts.length === 0) {
        gameState.usedParts = [];
        availableParts = pool;
    }

    gameState.currentPart = availableParts[Math.floor(Math.random() * availableParts.length)];
    gameState.usedParts.push(gameState.currentPart.id);
    gameState.tries = 0;

    const questionText = document.getElementById('question-text');
    const bodyArea = document.getElementById('body-area');

    if (gameState.gameMode === 'identify') {
        // Modo: Onde esta? - Mostrar corpo e clicar na parte
        const part = gameState.currentPart;
        questionText.innerHTML = `Toque ${PREP[part.art]} <span class="highlight">${partLower(part)}</span>`;
        renderBodyForIdentify(bodyArea);
        sayPrompt(`${touchPhrase(part)} ${part.hint}`);
    } else {
        // Modo: Qual e o nome? - Mostrar o emoji e escolher o nome
        questionText.textContent = 'Qual é o nome desta parte?';
        const options = renderOptionsForName(bodyArea);
        const names = options.map(partLower);
        sayPrompt(`Qual é o nome desta parte? ${names.slice(0, -1).join(', ')} ou ${names[names.length - 1]}?`);
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
        <svg viewBox="0 0 200 350" preserveAspectRatio="none" class="body-svg">
            <!-- Luz e volume (gradientes): o desenho e as areas continuam iguais -->
            <defs>
                <radialGradient id="pele" cx="35%" cy="30%" r="75%">
                    <stop offset="0" stop-color="#FFE7C2"/><stop offset=".6" stop-color="#FFD699"/><stop offset="1" stop-color="#EDB872"/>
                </radialGradient>
                <linearGradient id="peleV" x1="0" x2="1">
                    <stop offset="0" stop-color="#FFE3B8"/><stop offset=".55" stop-color="#FFD699"/><stop offset="1" stop-color="#E9B26C"/>
                </linearGradient>
                <linearGradient id="camisa" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stop-color="#90CAF9"/><stop offset=".5" stop-color="#64B5F6"/><stop offset="1" stop-color="#3D8FD8"/>
                </linearGradient>
                <linearGradient id="calca" x1="0" x2="1">
                    <stop offset="0" stop-color="#7B5A4E"/><stop offset=".5" stop-color="#5D4037"/><stop offset="1" stop-color="#432C25"/>
                </linearGradient>
                <radialGradient id="sapato" cx="40%" cy="30%" r="80%">
                    <stop offset="0" stop-color="#666"/><stop offset="1" stop-color="#222"/>
                </radialGradient>
                <linearGradient id="cabelo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#6B4F3A"/><stop offset="1" stop-color="#3E2C20"/>
                </linearGradient>
            </defs>
            <!-- Sombra no chao -->
            <ellipse cx="100" cy="343" rx="62" ry="6" fill="#000" opacity=".12"/>
            <!-- Cabeca -->
            <circle cx="100" cy="40" r="35" fill="url(#pele)" stroke="#333" stroke-width="2"/>
            <!-- Cabelo -->
            <path d="M65 30 Q100 0 135 30" fill="url(#cabelo)" stroke="#333" stroke-width="1"/>
            <!-- Olhos -->
            <circle cx="85" cy="35" r="5" fill="#333"/>
            <circle cx="115" cy="35" r="5" fill="#333"/>
            <circle cx="83.5" cy="33" r="1.6" fill="#fff"/>
            <circle cx="113.5" cy="33" r="1.6" fill="#fff"/>
            <!-- Bochechas -->
            <circle cx="78" cy="56" r="6" fill="#FF8A80" opacity=".35"/>
            <circle cx="122" cy="56" r="6" fill="#FF8A80" opacity=".35"/>
            <!-- Nariz -->
            <path d="M100 42 L95 55 L105 55 Z" fill="#E6B87A"/>
            <!-- Boca -->
            <path d="M85 65 Q100 75 115 65" stroke="#E57373" stroke-width="3" fill="none"/>
            <!-- Orelhas -->
            <ellipse cx="60" cy="40" rx="8" ry="12" fill="url(#pele)" stroke="#333" stroke-width="1"/>
            <ellipse cx="140" cy="40" rx="8" ry="12" fill="url(#pele)" stroke="#333" stroke-width="1"/>
            <!-- Pescoco -->
            <rect x="90" y="75" width="20" height="25" fill="url(#pele)" stroke="#333" stroke-width="1"/>
            <!-- Corpo/Tronco -->
            <rect x="60" y="100" width="80" height="100" rx="10" fill="url(#camisa)" stroke="#333" stroke-width="2"/>
            <!-- Ombros -->
            <ellipse cx="55" cy="110" rx="15" ry="10" fill="url(#camisa)" stroke="#333" stroke-width="1"/>
            <ellipse cx="145" cy="110" rx="15" ry="10" fill="url(#camisa)" stroke="#333" stroke-width="1"/>
            <!-- Bracos -->
            <rect x="25" y="110" width="25" height="80" rx="10" fill="url(#peleV)" stroke="#333" stroke-width="2"/>
            <rect x="150" y="110" width="25" height="80" rx="10" fill="url(#peleV)" stroke="#333" stroke-width="2"/>
            <!-- Maos -->
            <circle cx="37" cy="200" r="15" fill="url(#pele)" stroke="#333" stroke-width="2"/>
            <circle cx="163" cy="200" r="15" fill="url(#pele)" stroke="#333" stroke-width="2"/>
            <!-- Barriga (marca na camiseta) -->
            <ellipse cx="100" cy="160" rx="20" ry="15" fill="#4A90D9" opacity="0.5"/>
            <!-- Pernas -->
            <rect x="65" y="200" width="28" height="120" rx="10" fill="url(#calca)" stroke="#333" stroke-width="2"/>
            <rect x="107" y="200" width="28" height="120" rx="10" fill="url(#calca)" stroke="#333" stroke-width="2"/>
            <!-- Joelhos -->
            <ellipse cx="79" cy="280" rx="12" ry="8" fill="#4E342E" opacity="0.3"/>
            <ellipse cx="121" cy="280" rx="12" ry="8" fill="#4E342E" opacity="0.3"/>
            <!-- Pes -->
            <ellipse cx="79" cy="330" rx="20" ry="12" fill="url(#sapato)" stroke="#222" stroke-width="2"/>
            <ellipse cx="121" cy="330" rx="20" ry="12" fill="url(#sapato)" stroke="#222" stroke-width="2"/>
        </svg>
    `;

    // Areas clicaveis (coordenadas do viewBox 200x350, igual a proporcao do .body-figure)
    // Ordem: das maiores para as menores - as menores ficam por cima.
    // Partes em pares tem uma area de cada lado.
    const VIEW_W = 200, VIEW_H = 350;
    const clickAreas = [
        { id: 'head', x: 63, y: 3, w: 74, h: 74 },
        { id: 'hair', x: 63, y: 3, w: 74, h: 24 },
        { id: 'ears', x: 48, y: 25, w: 22, h: 30 },
        { id: 'ears', x: 130, y: 25, w: 22, h: 30 },
        { id: 'eyes', x: 74, y: 27, w: 52, h: 16 },
        { id: 'nose', x: 91, y: 43, w: 18, h: 15 },
        { id: 'mouth', x: 80, y: 59, w: 40, h: 16 },
        { id: 'neck', x: 86, y: 77, w: 28, h: 23 },
        { id: 'belly', x: 72, y: 138, w: 56, h: 50 },
        { id: 'arms', x: 22, y: 122, w: 32, h: 63 },
        { id: 'arms', x: 146, y: 122, w: 32, h: 63 },
        { id: 'shoulders', x: 36, y: 98, w: 38, h: 24 },
        { id: 'shoulders', x: 126, y: 98, w: 38, h: 24 },
        { id: 'hands', x: 19, y: 185, w: 36, h: 33 },
        { id: 'hands', x: 145, y: 185, w: 36, h: 33 },
        { id: 'legs', x: 62, y: 200, w: 34, h: 116 },
        { id: 'legs', x: 104, y: 200, w: 34, h: 116 },
        { id: 'knees', x: 62, y: 268, w: 34, h: 24 },
        { id: 'knees', x: 104, y: 268, w: 34, h: 24 },
        { id: 'feet', x: 57, y: 316, w: 44, h: 30 },
        { id: 'feet', x: 99, y: 316, w: 44, h: 30 }
    ];

    // A parte pedida ganha uma folga invisivel em volta (::before) e fica por cima:
    // tocar perto do nariz/olhos/joelhos tambem vale. O desenho nao muda.
    const target = gameState.currentPart.id;
    clickAreas.forEach(area => {
        const clickZone = document.createElement('div');
        clickZone.className = 'click-zone' + (area.id === target ? ' alvo' : '') +
            (area.w * area.h < 900 ? ' pequena' : '');
        clickZone.dataset.partId = area.id;
        clickZone.style.cssText = `
            position: absolute;
            left: ${area.x / VIEW_W * 100}%;
            top: ${area.y / VIEW_H * 100}%;
            width: ${area.w / VIEW_W * 100}%;
            height: ${area.h / VIEW_H * 100}%;
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

    // Mostrar emoji grande da parte (cada parte tem um emoji unico)
    const partDisplay = document.createElement('div');
    partDisplay.className = 'part-display';
    partDisplay.innerHTML = `<span class="big-emoji">${window.Emoji3D ? Emoji3D.html(gameState.currentPart.emoji, 'fig') : gameState.currentPart.emoji}</span>`;
    container.appendChild(partDisplay);

    // Criar opcoes
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'name-options';

    // Pegar 3 partes aleatorias diferentes + a correta
    // Sem pares que a figura mostra juntos (☝️ e uma mao; 👅 sai da boca): so uma resposta certa
    const blocked = NAME_CONFLICTS[gameState.currentPart.id] || [];
    const otherParts = getPool().filter(p => p.id !== gameState.currentPart.id && !blocked.includes(p.id));
    const shuffledOthers = otherParts.sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [gameState.currentPart, ...shuffledOthers].sort(() => Math.random() - 0.5);

    options.forEach((part, i) => {
        const btn = document.createElement('button');
        btn.className = 'name-btn';
        btn.style.setProperty('--i', i);
        btn.dataset.partId = part.id;
        // O botao mostra so o NOME (o emoji ja esta na pergunta)
        btn.innerHTML = `<span class="name-text">${part.name}</span>`;
        btn.onclick = () => checkNameAnswer(part);
        optionsDiv.appendChild(btn);
    });

    container.appendChild(optionsDiv);

    // Dica
    const hint = document.createElement('div');
    hint.className = 'hint-text';
    hint.textContent = `Dica: ${gameState.currentPart.hint}`;
    container.appendChild(hint);
    return options;
}

// Verificar resposta (modo identificar)
function checkIdentifyAnswer(partId) {
    if (gameState.locked) return;
    const feedbackEl = document.getElementById('feedback');
    const target = gameState.currentPart.id;
    // Vale tocar na propria parte ou numa parte que fica dentro dela
    const isCorrect = partId === target || (PART_PARENTS[partId] || []).includes(target);
    const targetZones = [...document.querySelectorAll(`.click-zone[data-part-id="${target}"]`)];

    if (!isCorrect) {
        // Sem castigo: marca leve na area tocada e tenta de novo
        const touched = [...document.querySelectorAll(`.click-zone[data-part-id="${partId}"]`)];
        touched.forEach(z => {
            z.classList.remove('wrong'); void z.offsetWidth; z.classList.add('wrong');
            setTimeout(() => z.classList.remove('wrong'), 700);
        });
        const part = gameState.currentPart;
        tryAgain(touched[0], targetZones, `${touchPhrase(part)} ${part.hint}`);
        return;
    }
    gameState.locked = true;

    // Trava todas as areas
    document.querySelectorAll('.click-zone').forEach(z => { z.style.pointerEvents = 'none'; });
    // Mostrar a(s) area(s) correta(s)
    targetZones.forEach(z => z.classList.add('correct'));
    if (window.Efeitos && targetZones[0]) Efeitos.estrelas(targetZones[0], { quantidade: 16, emoji: ['⭐', '💜'] });

    const msg = thisIsPhrase(gameState.currentPart);
    handleAnswerResult(true, feedbackEl, msg, msg);
}

// Verificar resposta (modo nome)
function checkNameAnswer(part) {
    if (gameState.locked) return;
    const feedbackEl = document.getElementById('feedback');
    const buttons = [...document.querySelectorAll('.name-btn')];
    const isCorrect = part.id === gameState.currentPart.id;
    const chosen = buttons.find(b => b.dataset.partId === part.id);
    const right = buttons.find(b => b.dataset.partId === gameState.currentPart.id);

    if (!isCorrect) {
        chosen.classList.add('fora');
        chosen.disabled = true;
        // 2o erro: some com mais uma opcao errada
        if (gameState.tries >= 1) {
            const rest = buttons.filter(b => b !== right && !b.classList.contains('fora'));
            if (rest.length) { rest[0].classList.add('fora'); rest[0].disabled = true; }
        }
        tryAgain(chosen, [right], `Qual é o nome desta parte? ${gameState.currentPart.hint}`);
        return;
    }
    gameState.locked = true;
    buttons.forEach(btn => {
        btn.style.pointerEvents = 'none';
        if (btn !== right) btn.classList.add('fora');
    });
    right.classList.add('correct');
    if (window.Efeitos) Efeitos.acerto(right, { emoji: ['⭐', '💜'] });

    const msg = thisIsPhrase(gameState.currentPart);
    handleAnswerResult(true, feedbackEl, msg, msg);
}

// Processar resultado da resposta
function handleAnswerResult(isCorrect, feedbackEl, wrongMessage, spokenAnswer) {
    if (isCorrect) {
        playSound('correct');
        gameState.streak++;
        if (window.KidsAudio && KidsAudio.note) setTimeout(() => KidsAudio.note(gameState.streak), 150);
        const praise = getRandomPraise();
        feedbackEl.textContent = praise;
        feedbackEl.className = 'feedback correct';
        speak(`${praise} ${spokenAnswer}`);
        gameState.score += 10;
        gameState.questionsAnswered++;
        updateStats();
        updateProgress();

        if (gameState.questionsAnswered >= gameState.questionsPerLevel) {
            nextTimer = setTimeout(showWinScreen, 2200);
        } else {
            nextTimer = setTimeout(nextQuestion, 2200);
        }
    } else {
        playSound('wrong');
        gameState.mistakes++;
        feedbackEl.textContent = wrongMessage;
        feedbackEl.className = 'feedback wrong';
        speak(spokenAnswer);

        nextTimer = setTimeout(nextQuestion, 3000);
    }
}

// Frases de elogio
function getRandomPraise() {
    const praises = [
        'Muito bem!',
        'Perfeito!',
        'Isso mesmo!',
        'Parabéns!',
        'Você conhece o corpo!',
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
    speak(`Parabéns! Você conhece o corpo humano! Ganhou ${stars} ${stars === 1 ? 'estrela' : 'estrelas'}!`);
    showScreen('win-screen');
}

// Jogar novamente
function playAgain() {
    startGame(gameState.gameMode);
}

// Sons do sistema (audio compartilhado: um unico AudioContext)
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
