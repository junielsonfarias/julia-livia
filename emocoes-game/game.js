// Jogo das Emocoes - Para criancas de 4 anos
// Mundo de Julia & Livia
// Campo BNCC: O eu, o outro e o nos (EI03EO01)

// Emocoes e suas caracteristicas
const EMOTIONS = [
    {
        emoji: '😊',
        name: 'Feliz',
        description: 'Contente, alegre',
        situations: [
            'Ganhou um presente de aniversario',
            'Vai brincar com os amigos',
            'Comeu seu doce favorito',
            'Ganhou um abraco da mamae'
        ]
    },
    {
        emoji: '😢',
        name: 'Triste',
        description: 'Chateado, com vontade de chorar',
        situations: [
            'Perdeu seu brinquedo favorito',
            'O amigo nao quis brincar',
            'Caiu e se machucou',
            'Teve que se despedir do vovo'
        ]
    },
    {
        emoji: '😠',
        name: 'Bravo',
        description: 'Com raiva, irritado',
        situations: [
            'Alguem pegou seu brinquedo sem pedir',
            'Nao conseguiu fazer o que queria',
            'O irmao bagunçou seu desenho',
            'Teve que parar de jogar'
        ]
    },
    {
        emoji: '😨',
        name: 'Com Medo',
        description: 'Assustado, preocupado',
        situations: [
            'Ouviu um barulho estranho no escuro',
            'Viu um cachorro muito grande',
            'Vai ao medico tomar vacina',
            'Esta em um lugar novo e nao conhece ninguem'
        ]
    },
    {
        emoji: '😮',
        name: 'Surpreso',
        description: 'Espantado, admirado',
        situations: [
            'Ganhou uma festa surpresa',
            'Viu um truque de magica',
            'Recebeu um presente inesperado',
            'Descobriu que vai viajar'
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
            'Recebeu um beijo da mamae',
            'O papai disse que te ama',
            'O amigo dividiu o lanche',
            'Ganhou um abraco apertado'
        ]
    },
    {
        emoji: '😔',
        name: 'Envergonhado',
        description: 'Timido, sem graca',
        situations: [
            'Errou na frente de todo mundo',
            'Esqueceu a letra da musica',
            'Tropecou e todos viram',
            'Tem que falar para muitas pessoas'
        ]
    }
];

// Estado do jogo
let gameState = {
    mode: 'emoji', // 'emoji' ou 'situation'
    score: 0,
    currentEmotion: null,
    currentSituation: '',
    questionsAnswered: 0,
    questionsPerLevel: 8,
    usedEmotions: [],
    usedSituations: []
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
    gameState.usedEmotions = [];
    gameState.usedSituations = [];
    showScreen('start-screen');
}

// Iniciar jogo
function startGame(mode) {
    gameState.mode = mode;
    gameState.score = 0;
    gameState.questionsAnswered = 0;
    gameState.usedEmotions = [];
    gameState.usedSituations = [];
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
    document.getElementById('question-text').textContent = 'Como essa pessoa esta se sentindo?';

    // Mostrar emoji grande
    const emotionDisplay = document.getElementById('emotion-display');
    emotionDisplay.innerHTML = `<span class="big-emoji">${gameState.currentEmotion.emoji}</span>`;

    // Criar opcoes (emocao correta + 3 aleatorias)
    createEmotionOptions();
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
    document.getElementById('question-text').textContent = 'Como voce se sentiria?';

    // Mostrar situacao
    const emotionDisplay = document.getElementById('emotion-display');
    emotionDisplay.innerHTML = `
        <div class="situation-card">
            <span class="situation-icon">📖</span>
            <p class="situation-text">${gameState.currentSituation}</p>
        </div>
    `;

    // Criar opcoes
    createEmotionOptions();
}

// Criar opcoes de emocoes
function createEmotionOptions() {
    const optionsArea = document.getElementById('options-area');
    optionsArea.innerHTML = '';

    // Emocao correta + 3 aleatorias
    const otherEmotions = EMOTIONS.filter(e => e.name !== gameState.currentEmotion.name);
    const shuffledOthers = otherEmotions.sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [gameState.currentEmotion, ...shuffledOthers].sort(() => Math.random() - 0.5);

    options.forEach(emotion => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = `
            <span class="option-emoji">${emotion.emoji}</span>
            <span class="option-name">${emotion.name}</span>
        `;
        btn.onclick = () => checkAnswer(emotion);
        optionsArea.appendChild(btn);
    });
}

// Verificar resposta
function checkAnswer(emotion) {
    const feedbackEl = document.getElementById('feedback');
    const buttons = document.querySelectorAll('.option-btn');
    const isCorrect = emotion.name === gameState.currentEmotion.name;

    // Desabilitar botoes
    buttons.forEach(btn => {
        btn.style.pointerEvents = 'none';
        const name = btn.querySelector('.option-name').textContent;
        if (name === emotion.name) {
            btn.classList.add(isCorrect ? 'correct' : 'wrong');
        }
        if (name === gameState.currentEmotion.name) {
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
        feedbackEl.innerHTML = `Essa pessoa esta <strong>${gameState.currentEmotion.name}</strong>! ${gameState.currentEmotion.description}`;
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
        'Voce entende as emocoes!',
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
    startGame(gameState.mode);
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
