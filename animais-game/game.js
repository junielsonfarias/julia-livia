// Jogo de Sons dos Animais - Para criancas de 4 anos
// Mundo de Julia & Livia
// BNCC: EI03ET03 - Identificar e selecionar fontes de informacoes, seres vivos e ambiente

// Animais e seus sons com habitats
// sound: onomatopeia mostrada | say: como a voz fala | sound null = fora do modo Sons
// habitat null = fora do modo "Onde Mora?"
const ANIMALS = [
    // Fazenda
    { emoji: '🐶', name: 'Cachorro', article: 'o', sound: 'Au au!', say: 'Au au! Au au!', habitat: 'fazenda' },
    { emoji: '🐱', name: 'Gato', article: 'o', sound: 'Miau!', say: 'Miaaau!', habitat: 'fazenda' },
    { emoji: '🐮', name: 'Vaca', article: 'a', sound: 'Muuu!', say: 'Muuuuu!', habitat: 'fazenda' },
    { emoji: '🐷', name: 'Porco', article: 'o', sound: 'Oinc oinc!', say: 'Oinc, oinc!', habitat: 'fazenda' },
    { emoji: '🐔', name: 'Galinha', article: 'a', sound: 'Có có có!', say: 'Có, có, có, có!', habitat: 'fazenda' },
    { emoji: '🐴', name: 'Cavalo', article: 'o', sound: 'Iiirrrí!', say: 'Iiiirrrííí!', habitat: 'fazenda' },
    { emoji: '🐑', name: 'Ovelha', article: 'a', sound: 'Mééé!', say: 'Méééé!', habitat: 'fazenda' },
    { emoji: '🦆', name: 'Pato', article: 'o', sound: 'Quá quá!', say: 'Quá, quá, quá!', habitat: 'fazenda' },

    // Floresta
    // Sapo e passaro vivem tanto na floresta quanto no jardim (duas respostas certas):
    // ficam so no modo Sons
    { emoji: '🐸', name: 'Sapo', article: 'o', sound: 'Croac!', say: 'Croac, croac!', habitat: null },
    { emoji: '🦊', name: 'Raposa', article: 'a', sound: null, say: null, habitat: 'floresta' },
    { emoji: '🐻', name: 'Urso', article: 'o', sound: 'Grrr!', say: 'Grrrrr!', habitat: 'floresta' },
    { emoji: '🦉', name: 'Coruja', article: 'a', sound: 'Uhu uhu!', say: 'Uuu-huuu! Uuu-huuu!', habitat: 'floresta' },
    { emoji: '🐒', name: 'Macaco', article: 'o', sound: 'Uh uh ah ah!', say: 'Uh, uh, ah, ah!', habitat: 'floresta' },

    // Savana: o leao nao mora na floresta, entao fica so no modo Sons
    { emoji: '🦁', name: 'Leão', article: 'o', sound: 'Roaaar!', say: 'Rrrrroaaar!', habitat: null },

    // Mar/Agua
    { emoji: '🐟', name: 'Peixe', article: 'o', sound: 'Blub blub!', say: 'Blub, blub!', habitat: 'mar' },
    { emoji: '🐢', name: 'Tartaruga', article: 'a', sound: null, say: null, habitat: 'mar' },
    { emoji: '🐬', name: 'Golfinho', article: 'o', sound: 'Ii ii ii!', say: 'Iii, iii, iii!', habitat: 'mar' },
    { emoji: '🦀', name: 'Caranguejo', article: 'o', sound: null, say: null, habitat: 'mar' },

    // Jardim
    { emoji: '🐝', name: 'Abelha', article: 'a', sound: 'Bzzzz!', say: 'Bzzzzzzz!', habitat: 'jardim' },
    { emoji: '🦋', name: 'Borboleta', article: 'a', sound: null, say: null, habitat: 'jardim' },
    { emoji: '🐦', name: 'Pássaro', article: 'o', sound: 'Piu piu!', say: 'Piu, piu, piu!', habitat: null },
    { emoji: '🐌', name: 'Caracol', article: 'o', sound: null, say: null, habitat: 'jardim' }
];

// Habitats disponiveis (prep = "vive na fazenda", "vive no mar"...)
const HABITATS = [
    { id: 'fazenda', name: 'Fazenda', prep: 'na fazenda', emoji: '🏡', color: '#8B4513' },
    { id: 'floresta', name: 'Floresta', prep: 'na floresta', emoji: '🌲', color: '#228B22' },
    { id: 'mar', name: 'Mar', prep: 'no mar', emoji: '🌊', color: '#1E90FF' },
    { id: 'jardim', name: 'Jardim', prep: 'no jardim', emoji: '🌻', color: '#FFD700' }
];

// Animais de cada modo
function getPool() {
    return gameState.gameMode === 'habitat'
        ? ANIMALS.filter(a => a.habitat)
        : ANIMALS.filter(a => a.sound);
}

// "o Gato" / "a Vaca"
function withArticle(animal, capitalize) {
    const art = capitalize ? animal.article.toUpperCase() : animal.article;
    return art + ' ' + animal.name;
}

// Estado do jogo
let gameState = {
    score: 0,
    currentAnimal: null,
    questionsAnswered: 0,
    questionsPerLevel: 8,
    usedAnimals: [],
    gameMode: 'sounds', // 'sounds' ou 'habitat'
    mistakes: 0,
    streak: 0,       // acertos seguidos (notas sobem)
    tries: 0,        // erros na pergunta atual
    locked: false
};

// Figura 3D (com reserva em texto)
function fig3d(emoji) {
    return window.Emoji3D ? Emoji3D.html(emoji, 'fig') : emoji;
}

// Aprendizagem sem erro: 1o erro balanca e repete; 2o some com outra opcao errada;
// 3o destaca a resposta certa. A pergunta continua ate acertar.
function tryAgain(chosen, right, buttons, spoken) {
    gameState.mistakes++;
    gameState.tries++;
    gameState.streak = 0;
    playSound('wrong');
    if (chosen) {
        chosen.classList.add('fora');
        chosen.disabled = true;
        if (window.Efeitos) Efeitos.erro(chosen);
    }
    const feedbackEl = document.getElementById('feedback');
    feedbackEl.textContent = 'Quase! Tente de novo!';
    feedbackEl.className = 'feedback wrong';
    if (gameState.tries >= 2) {
        const rest = buttons.filter(b => b !== right && !b.classList.contains('fora'));
        if (rest.length) { rest[0].classList.add('fora'); rest[0].disabled = true; }
    }
    if (gameState.tries >= 3 && right) right.classList.add('dica');
    speak(`Quase! ${spoken}`);
}

// Animal pula da pergunta para dentro da casa certa
function jumpHome(animal, btn) {
    const src = document.querySelector('.highlight-animal .hl-fig');
    const done = () => {
        const home = document.createElement('span');
        home.className = 'habitat-resident';
        home.innerHTML = fig3d(animal.emoji);
        btn.appendChild(home);
        if (window.Efeitos) Efeitos.acerto(btn, { emoji: ['⭐', '💚', '✨'] });
    };
    if (!src || !btn.animate || (window.Efeitos && Efeitos.reduzir())) { done(); return; }
    const a = src.getBoundingClientRect();
    const b = btn.getBoundingClientRect();
    const size = Math.max(40, a.height * 1.2);
    const flyer = document.createElement('div');
    flyer.className = 'jump-flyer';
    flyer.innerHTML = fig3d(animal.emoji);
    flyer.style.cssText = `left:${a.left + a.width / 2 - size / 2}px;top:${a.top + a.height / 2 - size / 2}px;width:${size}px;height:${size}px;font-size:${size * 0.8}px`;
    document.body.appendChild(flyer);
    src.style.visibility = 'hidden';
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height * 0.62 - (a.top + a.height / 2);
    const peak = Math.min(-60, dy * 0.5 - 140);
    flyer.animate([
        { transform: 'translate(0,0) scale(1,1)' },
        { transform: 'translate(0,6px) scale(1.2,.8)', offset: .12 },
        { transform: `translate(${dx * .5}px,${peak}px) scale(1.5) rotate(-12deg)`, offset: .5 },
        { transform: `translate(${dx}px,${dy}px) scale(1.6,1.1)`, offset: .88 },
        { transform: `translate(${dx}px,${dy}px) scale(1.25)` }
    ], { duration: 750, easing: 'ease-in-out' }).onfinish = () => { flyer.remove(); done(); };
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
    gameState.score = 0;
    gameState.questionsAnswered = 0;
    gameState.usedAnimals = [];
    gameState.mistakes = 0;
    document.querySelector('.game-header h1').textContent = 'Jogo dos Animais';
    showScreen('start-screen');
}

// Iniciar jogo com modo selecionado
function startGame(mode) {
    gameState.gameMode = mode || 'sounds';
    gameState.score = 0;
    gameState.questionsAnswered = 0;
    gameState.usedAnimals = [];
    gameState.mistakes = 0;
    gameState.streak = 0;
    updateStats();
    updateProgress();
    playSound('start');

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
    gameState.locked = false;

    const soundText = document.getElementById('sound-text');
    const soundBtn = document.getElementById('sound-btn');
    const questionText = document.getElementById('question-text');

    // O botao Ouvir aparece nos dois modos (repete o som / a pergunta)
    soundText.textContent = '';
    soundBtn.style.display = 'inline-flex';
    if (gameState.gameMode === 'sounds') {
        questionText.textContent = 'Qual animal faz esse som?';
    }

    // Selecionar animal aleatorio nao usado
    const pool = getPool();
    let availableAnimals = pool.filter(a => !gameState.usedAnimals.includes(a.name));
    if (availableAnimals.length === 0) {
        gameState.usedAnimals = [];
        availableAnimals = pool;
    }

    gameState.currentAnimal = availableAnimals[Math.floor(Math.random() * availableAnimals.length)];
    gameState.usedAnimals.push(gameState.currentAnimal.name);
    gameState.tries = 0;

    if (gameState.gameMode === 'habitat') {
        setupHabitatQuestion();
    } else {
        setupSoundQuestion();
    }
}

// Configurar pergunta de som
function setupSoundQuestion() {
    // Criar opcoes (animal correto + 5 aleatorios)
    const otherAnimals = getPool().filter(a => a.name !== gameState.currentAnimal.name);
    const shuffledOthers = otherAnimals.sort(() => Math.random() - 0.5).slice(0, 5);
    const options = [gameState.currentAnimal, ...shuffledOthers].sort(() => Math.random() - 0.5);

    // Criar grid de animais
    const grid = document.getElementById('animals-grid');
    grid.innerHTML = '';
    grid.className = 'animals-grid';

    options.forEach((animal, i) => {
        const btn = document.createElement('button');
        btn.className = 'animal-btn';
        btn.dataset.name = animal.name;
        btn.style.setProperty('--i', i);
        btn.innerHTML = `
            <span class="animal-emoji">${fig3d(animal.emoji)}</span>
            <span class="animal-name">${animal.name}</span>
        `;
        btn.onclick = () => checkAnswer(animal);
        grid.appendChild(btn);
    });

    // Tocar som automaticamente apos um pequeno delay
    // (so se a pergunta ainda e a mesma e nao foi respondida: senao cortaria o elogio)
    const animal = gameState.currentAnimal;
    setTimeout(() => { if (gameState.currentAnimal === animal && !gameState.locked) playAnimalSound(); }, 500);
}

// Configurar pergunta de habitat
function setupHabitatQuestion() {
    const questionText = document.getElementById('question-text');
    const animal = gameState.currentAnimal;
    questionText.innerHTML = `Onde vive ${animal.article} <span class="highlight-animal"><span class="hl-fig">${fig3d(animal.emoji)}</span> ${animal.name}</span>?`;
    sayPrompt(`Onde vive ${withArticle(animal)}? Na fazenda, na floresta, no mar ou no jardim?`);

    // Criar grid de habitats
    const grid = document.getElementById('animals-grid');
    grid.innerHTML = '';
    grid.className = 'animals-grid habitat-grid';

    // Embaralhar habitats
    const shuffledHabitats = [...HABITATS].sort(() => Math.random() - 0.5);

    shuffledHabitats.forEach((habitat, i) => {
        const btn = document.createElement('button');
        btn.className = 'habitat-btn hab-' + habitat.id;
        btn.dataset.id = habitat.id;
        btn.style.setProperty('--i', i);
        btn.style.setProperty('--habitat-color', habitat.color);
        btn.innerHTML = `
            <span class="habitat-scene" aria-hidden="true"></span>
            <span class="habitat-emoji">${fig3d(habitat.emoji)}</span>
            <span class="habitat-name">${habitat.name}</span>
        `;
        btn.onclick = () => checkHabitatAnswer(habitat);
        grid.appendChild(btn);
    });
}

// Tocar som do animal (falado em portugues) ou repetir a pergunta do habitat
function playAnimalSound() {
    if (!gameState.currentAnimal) return;

    if (gameState.gameMode === 'habitat') {
        repeatPrompt();
        return;
    }

    const soundText = document.getElementById('sound-text');
    soundText.textContent = gameState.currentAnimal.sound;

    lastPrompt = `Qual animal faz assim? ${gameState.currentAnimal.say}`;
    speak(lastPrompt, { rate: 0.85 });
}

// Verificar resposta (modo som)
function checkAnswer(animal) {
    if (gameState.locked) return;
    const feedbackEl = document.getElementById('feedback');
    const buttons = [...document.querySelectorAll('.animal-btn')];
    const current = gameState.currentAnimal;
    const isCorrect = animal.name === current.name;
    const chosen = buttons.find(b => b.dataset.name === animal.name);
    const right = buttons.find(b => b.dataset.name === current.name);

    if (!isCorrect) {
        tryAgain(chosen, right, buttons, `Ouça de novo: ${current.say}`);
        return;
    }
    gameState.locked = true;
    buttons.forEach(btn => { btn.style.pointerEvents = 'none'; });
    right.classList.add('correct');
    buttons.forEach(b => { if (b !== right) b.classList.add('fora'); });
    if (window.Efeitos) Efeitos.acerto(right, { emoji: ['⭐', '💚'] });

    handleAnswerResult(true, feedbackEl, '', `É ${withArticle(current)}! ${current.say}`, '');
}

// Verificar resposta (modo habitat)
function checkHabitatAnswer(habitat) {
    if (gameState.locked) return;
    const feedbackEl = document.getElementById('feedback');
    const buttons = [...document.querySelectorAll('.habitat-btn')];
    const current = gameState.currentAnimal;
    const isCorrect = habitat.id === current.habitat;

    // Encontrar o habitat correto
    const correctHabitat = HABITATS.find(h => h.id === current.habitat);
    const chosen = buttons.find(b => b.dataset.id === habitat.id);
    const right = buttons.find(b => b.dataset.id === correctHabitat.id);

    if (!isCorrect) {
        tryAgain(chosen, right, buttons, `${withArticle(current, true)} não vive ${habitat.prep}. Onde vive ${withArticle(current)}?`);
        return;
    }
    gameState.locked = true;
    buttons.forEach(btn => { btn.style.pointerEvents = 'none'; });
    right.classList.add('correct');
    buttons.forEach(b => { if (b !== right) b.classList.add('fora'); });
    jumpHome(current, right);

    const sentence = `${withArticle(current, true)} vive ${correctHabitat.prep}!`;
    handleAnswerResult(true, feedbackEl, sentence, sentence, sentence);
}

// Processar resultado da resposta
function handleAnswerResult(isCorrect, feedbackEl, wrongMessage, spokenCorrect, spokenWrong) {
    if (isCorrect) {
        playSound('correct');
        gameState.streak++;
        if (window.KidsAudio && KidsAudio.note) setTimeout(() => KidsAudio.note(gameState.streak), 150);
        const praise = getRandomPraise();
        feedbackEl.textContent = praise;
        feedbackEl.className = 'feedback correct';
        speak(`${praise} ${spokenCorrect}`);
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
        feedbackEl.textContent = wrongMessage;
        feedbackEl.className = 'feedback wrong';
        speak(spokenWrong);

        setTimeout(nextQuestion, 3000);
    }
}

// Frases de elogio
function getRandomPraise() {
    const praises = [
        'Muito bem!',
        'Perfeito!',
        'Isso mesmo!',
        'Parabéns!',
        'Você conhece os animais!',
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

    // Atualizar mensagem baseado no modo
    const winMessage = document.querySelector('.win-content p');
    if (gameState.gameMode === 'habitat') {
        winMessage.textContent = 'Você sabe onde os animais moram!';
    } else {
        winMessage.textContent = 'Você conhece os sons dos animais!';
    }

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
    speak(`Parabéns! ${winMessage.textContent} Você ganhou ${stars} ${stars === 1 ? 'estrela' : 'estrelas'}!`);
    showScreen('win-screen');
}

// Jogar novamente com mesmo modo
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
