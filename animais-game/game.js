// Jogo de Sons dos Animais - Para criancas de 4 anos
// Mundo de Julia & Livia
// BNCC: EI03ET03 - Identificar e selecionar fontes de informacoes, seres vivos e ambiente

// Animais e seus sons com habitats
const ANIMALS = [
    // Fazenda
    { emoji: '🐶', name: 'Cachorro', sound: 'Au au!', freq: [300, 400, 300], habitat: 'fazenda' },
    { emoji: '🐱', name: 'Gato', sound: 'Miau!', freq: [600, 800, 600], habitat: 'fazenda' },
    { emoji: '🐮', name: 'Vaca', sound: 'Muuu!', freq: [150, 150, 120], habitat: 'fazenda' },
    { emoji: '🐷', name: 'Porco', sound: 'Oinc oinc!', freq: [350, 380, 350], habitat: 'fazenda' },
    { emoji: '🐔', name: 'Galinha', sound: 'Cocorico!', freq: [500, 700, 900], habitat: 'fazenda' },
    { emoji: '🐴', name: 'Cavalo', sound: 'Rinchar!', freq: [400, 500, 600], habitat: 'fazenda' },
    { emoji: '🐑', name: 'Ovelha', sound: 'Bee!', freq: [450, 500, 450], habitat: 'fazenda' },
    { emoji: '🦆', name: 'Pato', sound: 'Quack!', freq: [350, 400, 350], habitat: 'fazenda' },

    // Floresta
    { emoji: '🐸', name: 'Sapo', sound: 'Croac!', freq: [200, 250, 200], habitat: 'floresta' },
    { emoji: '🦁', name: 'Leao', sound: 'Roar!', freq: [100, 120, 80], habitat: 'floresta' },
    { emoji: '🦊', name: 'Raposa', sound: 'Yip yip!', freq: [500, 600, 500], habitat: 'floresta' },
    { emoji: '🐻', name: 'Urso', sound: 'Grrr!', freq: [120, 100, 90], habitat: 'floresta' },
    { emoji: '🦉', name: 'Coruja', sound: 'Uhu uhu!', freq: [300, 350, 300], habitat: 'floresta' },
    { emoji: '🐒', name: 'Macaco', sound: 'Uh uh ah!', freq: [400, 500, 450], habitat: 'floresta' },

    // Mar/Agua
    { emoji: '🐟', name: 'Peixe', sound: 'Blub blub!', freq: [500, 400, 500], habitat: 'mar' },
    { emoji: '🐢', name: 'Tartaruga', sound: '...', freq: [200, 200, 200], habitat: 'mar' },
    { emoji: '🐬', name: 'Golfinho', sound: 'Click click!', freq: [800, 1000, 800], habitat: 'mar' },
    { emoji: '🦀', name: 'Caranguejo', sound: 'Clac clac!', freq: [600, 650, 600], habitat: 'mar' },

    // Jardim
    { emoji: '🐝', name: 'Abelha', sound: 'Bzzzz!', freq: [300, 320, 300], habitat: 'jardim' },
    { emoji: '🦋', name: 'Borboleta', sound: '...', freq: [700, 800, 700], habitat: 'jardim' },
    { emoji: '🐦', name: 'Passaro', sound: 'Piu piu!', freq: [800, 900, 800], habitat: 'jardim' },
    { emoji: '🐌', name: 'Caracol', sound: '...', freq: [200, 200, 200], habitat: 'jardim' }
];

// Habitats disponiveis
const HABITATS = [
    { id: 'fazenda', name: 'Fazenda', emoji: '🏡', color: '#8B4513' },
    { id: 'floresta', name: 'Floresta', emoji: '🌲', color: '#228B22' },
    { id: 'mar', name: 'Mar', emoji: '🌊', color: '#1E90FF' },
    { id: 'jardim', name: 'Jardim', emoji: '🌻', color: '#FFD700' }
];

// Estado do jogo
let gameState = {
    score: 0,
    currentAnimal: null,
    questionsAnswered: 0,
    questionsPerLevel: 8,
    usedAnimals: [],
    gameMode: 'sounds' // 'sounds' ou 'habitat'
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
    gameState.usedAnimals = [];
    showScreen('start-screen');
}

// Iniciar jogo com modo selecionado
function startGame(mode) {
    gameState.gameMode = mode || 'sounds';
    gameState.score = 0;
    gameState.questionsAnswered = 0;
    gameState.usedAnimals = [];
    updateStats();
    updateProgress();

    // Atualizar titulo do header baseado no modo
    const headerTitle = document.querySelector('.game-header h1');
    if (gameState.gameMode === 'habitat') {
        headerTitle.textContent = 'Onde Mora?';
    } else {
        headerTitle.textContent = 'Sons dos Animais';
    }

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

    const soundText = document.getElementById('sound-text');
    const soundBtn = document.getElementById('sound-btn');
    const questionText = document.getElementById('question-text');

    if (gameState.gameMode === 'sounds') {
        soundText.textContent = '';
        soundBtn.style.display = 'inline-flex';
        questionText.textContent = 'Qual animal faz esse som?';
    } else {
        soundText.textContent = '';
        soundBtn.style.display = 'none';
    }

    // Selecionar animal aleatorio nao usado
    let availableAnimals = ANIMALS.filter(a => !gameState.usedAnimals.includes(a.name));
    if (availableAnimals.length === 0) {
        gameState.usedAnimals = [];
        availableAnimals = ANIMALS;
    }

    gameState.currentAnimal = availableAnimals[Math.floor(Math.random() * availableAnimals.length)];
    gameState.usedAnimals.push(gameState.currentAnimal.name);

    if (gameState.gameMode === 'habitat') {
        setupHabitatQuestion();
    } else {
        setupSoundQuestion();
    }
}

// Configurar pergunta de som
function setupSoundQuestion() {
    // Criar opcoes (animal correto + 5 aleatorios)
    const otherAnimals = ANIMALS.filter(a => a.name !== gameState.currentAnimal.name);
    const shuffledOthers = otherAnimals.sort(() => Math.random() - 0.5).slice(0, 5);
    const options = [gameState.currentAnimal, ...shuffledOthers].sort(() => Math.random() - 0.5);

    // Criar grid de animais
    const grid = document.getElementById('animals-grid');
    grid.innerHTML = '';
    grid.className = 'animals-grid';

    options.forEach(animal => {
        const btn = document.createElement('button');
        btn.className = 'animal-btn';
        btn.innerHTML = `
            <span class="animal-emoji">${animal.emoji}</span>
            <span class="animal-name">${animal.name}</span>
        `;
        btn.onclick = () => checkAnswer(animal);
        grid.appendChild(btn);
    });

    // Tocar som automaticamente apos um pequeno delay
    setTimeout(playAnimalSound, 500);
}

// Configurar pergunta de habitat
function setupHabitatQuestion() {
    const questionText = document.getElementById('question-text');
    questionText.innerHTML = `Onde vive o <span class="highlight-animal">${gameState.currentAnimal.emoji} ${gameState.currentAnimal.name}</span>?`;

    // Criar grid de habitats
    const grid = document.getElementById('animals-grid');
    grid.innerHTML = '';
    grid.className = 'animals-grid habitat-grid';

    // Embaralhar habitats
    const shuffledHabitats = [...HABITATS].sort(() => Math.random() - 0.5);

    shuffledHabitats.forEach(habitat => {
        const btn = document.createElement('button');
        btn.className = 'habitat-btn';
        btn.style.setProperty('--habitat-color', habitat.color);
        btn.innerHTML = `
            <span class="habitat-emoji">${habitat.emoji}</span>
            <span class="habitat-name">${habitat.name}</span>
        `;
        btn.onclick = () => checkHabitatAnswer(habitat);
        grid.appendChild(btn);
    });
}

// Tocar som do animal
function playAnimalSound() {
    if (!gameState.currentAnimal) return;

    const soundText = document.getElementById('sound-text');
    soundText.textContent = gameState.currentAnimal.sound;

    playAnimalTone(gameState.currentAnimal.freq);
}

// Reproduzir tom do animal usando Web Audio
function playAnimalTone(frequencies) {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;

        const ctx = new AudioCtx();
        const now = ctx.currentTime;

        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.frequency.setValueAtTime(freq, now + i * 0.15);
            osc.type = 'sine';

            gain.gain.setValueAtTime(0.2, now + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.15);

            osc.start(now + i * 0.15);
            osc.stop(now + i * 0.15 + 0.2);
        });

        setTimeout(() => ctx.close(), 1000);
    } catch(e) {}
}

// Verificar resposta (modo som)
function checkAnswer(animal) {
    const feedbackEl = document.getElementById('feedback');
    const buttons = document.querySelectorAll('.animal-btn');
    const isCorrect = animal.name === gameState.currentAnimal.name;

    // Desabilitar botoes
    buttons.forEach(btn => {
        btn.style.pointerEvents = 'none';
        const name = btn.querySelector('.animal-name').textContent;
        if (name === animal.name) {
            btn.classList.add(isCorrect ? 'correct' : 'wrong');
        }
        if (name === gameState.currentAnimal.name) {
            btn.classList.add('correct');
        }
    });

    handleAnswerResult(isCorrect, feedbackEl, `Era o ${gameState.currentAnimal.name}!`);
}

// Verificar resposta (modo habitat)
function checkHabitatAnswer(habitat) {
    const feedbackEl = document.getElementById('feedback');
    const buttons = document.querySelectorAll('.habitat-btn');
    const isCorrect = habitat.id === gameState.currentAnimal.habitat;

    // Encontrar o habitat correto
    const correctHabitat = HABITATS.find(h => h.id === gameState.currentAnimal.habitat);

    // Desabilitar botoes
    buttons.forEach(btn => {
        btn.style.pointerEvents = 'none';
        const name = btn.querySelector('.habitat-name').textContent;
        if (name === habitat.name) {
            btn.classList.add(isCorrect ? 'correct' : 'wrong');
        }
        if (name === correctHabitat.name) {
            btn.classList.add('correct');
        }
    });

    handleAnswerResult(isCorrect, feedbackEl, `${gameState.currentAnimal.name} vive na ${correctHabitat.name}!`);
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

        setTimeout(nextQuestion, 2000);
    }
}

// Frases de elogio
function getRandomPraise() {
    const praises = [
        'Muito bem!',
        'Perfeito!',
        'Isso mesmo!',
        'Parabens!',
        'Voce conhece os animais!',
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

    // Atualizar mensagem baseado no modo
    const winMessage = document.querySelector('.win-content p');
    if (gameState.gameMode === 'habitat') {
        winMessage.textContent = 'Voce sabe onde os animais moram!';
    } else {
        winMessage.textContent = 'Voce conhece os sons dos animais!';
    }

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

// Jogar novamente com mesmo modo
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
