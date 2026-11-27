// Jogo das Emocoes - Para criancas de 4 anos
// Mundo de Julia & Livia
// Campo BNCC: O eu, o outro e o nos (EI03EO01)

// Emocoes e suas caracteristicas
// As situacoes foram escritas para ter UMA resposta clara.
const EMOTIONS = [
    {
        emoji: '😊',
        name: 'Feliz',
        description: 'Contente, alegre',
        situations: [
            'Está brincando no parquinho com os amigos',
            'Vai brincar com os amigos',
            'Comeu seu doce favorito',
            'Ganhou o jogo de corrida'
        ]
    },
    {
        emoji: '😢',
        name: 'Triste',
        description: 'Chateado, com vontade de chorar',
        situations: [
            'Perdeu seu brinquedo favorito',
            'O amigo não quis brincar',
            'O sorvete caiu no chão',
            'Teve que se despedir do vovô'
        ]
    },
    {
        emoji: '😠',
        name: 'Bravo',
        description: 'Com raiva, irritado',
        situations: [
            'Alguém pegou seu brinquedo sem pedir',
            'Alguém empurrou você na fila',
            'O irmão bagunçou seu desenho',
            'O colega derrubou sua torre de blocos de propósito'
        ]
    },
    {
        emoji: '😨',
        name: 'Com Medo',
        description: 'Assustado, preocupado',
        situations: [
            'Ouviu um barulho estranho no escuro',
            'Viu um cachorro muito grande latindo',
            'Ouviu um trovão muito forte',
            'Se perdeu da mamãe no mercado'
        ]
    },
    {
        emoji: '😮',
        name: 'Surpreso',
        description: 'Espantado, admirado',
        situations: [
            'Abriu a caixa e pulou um boneco de mola',
            'Viu um truque de mágica',
            'Viu um coelho sair da cartola',
            'Acordou e o quintal estava cheio de bolhas de sabão'
        ]
    },
    {
        emoji: '😴',
        name: 'Cansado',
        description: 'Com sono, sem energia',
        situations: [
            'Brincou o dia inteiro',
            'Acordou muito cedo',
            'Fez muitas atividades na escola',
            'Andou muito no passeio'
        ]
    },
    {
        emoji: '🥰',
        name: 'Amado',
        description: 'Querido, com carinho',
        situations: [
            'Recebeu um beijo da mamãe',
            'O papai disse que te ama',
            'A vovó fez carinho no seu cabelo',
            'Ganhou um abraço apertado'
        ]
    },
    {
        emoji: '😳',
        name: 'Envergonhado',
        description: 'Tímido, sem graça',
        situations: [
            'Errou na frente de todo mundo',
            'Esqueceu a letra da música na apresentação',
            'Tropeçou e todos viram',
            'Vestiu a blusa do avesso e todos riram'
        ]
    }
];

// Emocoes parecidas que nunca aparecem juntas como opcao no modo situacao
// (assim so uma opcao pode estar certa)
const CONFLICTS = {
    // Feliz x Cansado: "Brincou o dia inteiro" / "Ganhou o jogo de corrida" servem para os dois
    'Feliz': ['Amado', 'Surpreso', 'Cansado'],
    'Amado': ['Feliz'],
    'Surpreso': ['Feliz', 'Com Medo'],
    'Triste': ['Bravo', 'Envergonhado', 'Com Medo'],
    'Bravo': ['Triste'],
    'Com Medo': ['Surpreso', 'Envergonhado', 'Triste'],
    'Envergonhado': ['Triste', 'Com Medo'],
    'Cansado': ['Feliz']
};

// Estado do jogo
let gameState = {
    mode: 'emoji', // 'emoji' ou 'situation'
    score: 0,
    currentEmotion: null,
    currentSituation: '',
    questionsAnswered: 0,
    questionsPerLevel: 8,
    usedEmotions: [],
    usedSituations: [],
    mistakes: 0,
    locked: false
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
    gameState.usedEmotions = [];
    gameState.usedSituations = [];
    gameState.mistakes = 0;
    showScreen('start-screen');
}

// Iniciar jogo
function startGame(mode) {
    gameState.mode = mode;
    gameState.score = 0;
    gameState.questionsAnswered = 0;
    gameState.usedEmotions = [];
    gameState.usedSituations = [];
    gameState.mistakes = 0;
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

    if (gameState.mode === 'emoji') {
        generateEmojiQuestion();
    } else {
        generateSituationQuestion();
    }
}

// Gerar pergunta de emoji (identificar a emocao)
function generateEmojiQuestion() {
    // Selecionar emocao aleatoria nao usada
    let availableEmotions = EMOTIONS.filter(e => !gameState.usedEmotions.includes(e.name));
    if (availableEmotions.length === 0) {
        gameState.usedEmotions = [];
        availableEmotions = EMOTIONS;
    }

    gameState.currentEmotion = availableEmotions[Math.floor(Math.random() * availableEmotions.length)];
    gameState.usedEmotions.push(gameState.currentEmotion.name);

    // Atualizar pergunta
    document.getElementById('question-text').textContent = 'Como essa pessoa está se sentindo?';

    // Mostrar emoji grande
    const emotionDisplay = document.getElementById('emotion-display');
    emotionDisplay.innerHTML = `<span class="big-emoji">${gameState.currentEmotion.emoji}</span>`;

    // Criar opcoes (emocao correta + 3 aleatorias)
    const options = createEmotionOptions();
    sayPrompt(`Como essa pessoa está se sentindo? ${listOptions(options)}`);
}

// Gerar pergunta de situacao
function generateSituationQuestion() {
    // Selecionar emocao e situacao aleatoria
    let availableEmotions = EMOTIONS.filter(e => !gameState.usedEmotions.includes(e.name));
    if (availableEmotions.length === 0) {
        gameState.usedEmotions = [];
        availableEmotions = EMOTIONS;
    }

    gameState.currentEmotion = availableEmotions[Math.floor(Math.random() * availableEmotions.length)];
    gameState.usedEmotions.push(gameState.currentEmotion.name);

    // Selecionar situacao aleatoria desta emocao
    const situations = gameState.currentEmotion.situations;
    gameState.currentSituation = situations[Math.floor(Math.random() * situations.length)];

    // Atualizar pergunta
    document.getElementById('question-text').textContent = 'Como você se sentiria?';

    // Mostrar situacao
    const emotionDisplay = document.getElementById('emotion-display');
    emotionDisplay.innerHTML = `
        <div class="situation-card">
            <span class="situation-icon">📖</span>
            <p class="situation-text">${gameState.currentSituation}</p>
        </div>
    `;

    // Criar opcoes
    const options = createEmotionOptions();
    sayPrompt(`${gameState.currentSituation}. Como você se sentiria? ${listOptions(options)}`);
}

// "Feliz, triste, bravo ou cansado?"
function listOptions(options) {
    const names = options.map(e => e.name.toLowerCase());
    return names.slice(0, -1).join(', ') + ' ou ' + names[names.length - 1] + '?';
}

// Criar opcoes de emocoes
function createEmotionOptions() {
    const optionsArea = document.getElementById('options-area');
    optionsArea.innerHTML = '';

    // Emocao correta + 3 aleatorias
    // No modo situacao, tira as emocoes parecidas para so uma resposta servir
    const current = gameState.currentEmotion;
    const blocked = gameState.mode === 'situation' ? (CONFLICTS[current.name] || []) : [];
    const otherEmotions = EMOTIONS.filter(e => e.name !== current.name && !blocked.includes(e.name));
    const shuffledOthers = otherEmotions.sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [gameState.currentEmotion, ...shuffledOthers].sort(() => Math.random() - 0.5);

    options.forEach(emotion => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.dataset.name = emotion.name;
        btn.innerHTML = `
            <span class="option-emoji">${emotion.emoji}</span>
            <span class="option-name">${emotion.name}</span>
        `;
        btn.onclick = () => checkAnswer(emotion);
        optionsArea.appendChild(btn);
    });
    return options;
}

// Verificar resposta
function checkAnswer(emotion) {
    if (gameState.locked) return;
    gameState.locked = true;
    const feedbackEl = document.getElementById('feedback');
    const buttons = document.querySelectorAll('.option-btn');
    const isCorrect = emotion.name === gameState.currentEmotion.name;

    // Desabilitar botoes
    buttons.forEach(btn => {
        btn.style.pointerEvents = 'none';
        const name = btn.dataset.name;
        if (name === emotion.name) {
            btn.classList.add(isCorrect ? 'correct' : 'wrong');
        }
        if (name === gameState.currentEmotion.name) {
            btn.classList.add('correct');
        }
    });

    if (isCorrect) {
        playSound('correct');
        const praise = getRandomPraise();
        feedbackEl.textContent = praise;
        feedbackEl.className = 'feedback correct';
        speak(`${praise} ${gameState.currentEmotion.name}!`);
        gameState.score += 10;
        gameState.questionsAnswered++;
        updateStats();
        updateProgress();

        if (gameState.questionsAnswered >= gameState.questionsPerLevel) {
            setTimeout(showWinScreen, 2000);
        } else {
            setTimeout(nextQuestion, 2000);
        }
    } else {
        playSound('wrong');
        gameState.mistakes++;
        const em = gameState.currentEmotion;
        const lead = gameState.mode === 'situation' ? 'Você se sentiria' : 'Essa pessoa está';
        feedbackEl.innerHTML = `${lead} <strong>${em.name}</strong>! ${em.description}`;
        feedbackEl.className = 'feedback wrong';
        speak(`${lead} ${em.name.toLowerCase()}! ${em.description}.`);

        setTimeout(nextQuestion, 3500);
    }
}

// Frases de elogio
function getRandomPraise() {
    const praises = [
        'Muito bem!',
        'Perfeito!',
        'Isso mesmo!',
        'Parabéns!',
        'Você entende as emoções!',
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
    speak(`Muito bem! Você conhece as emoções! Ganhou ${stars} ${stars === 1 ? 'estrela' : 'estrelas'}!`);
    showScreen('win-screen');
}

// Jogar novamente
function playAgain() {
    startGame(gameState.mode);
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
