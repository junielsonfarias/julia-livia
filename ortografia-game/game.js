// Jogo de Ortografia - Para criancas de 9 anos
// Mundo de Julia & Livia
// Habilidade BNCC: EF04LP01

// Banco de palavras por categoria
const WORDS = {
    ss_s: [
        { word: 'PÁSSARO', blank: 'PÁ__ARO', answer: 'SS', hint: 'Ave que voa' },
        { word: 'ASSADO', blank: 'A__ADO', answer: 'SS', hint: 'Carne no forno' },
        { word: 'PROFESSORA', blank: 'PROFE__ORA', answer: 'SS', hint: 'Quem ensina na escola' },
        { word: 'PASSEIO', blank: 'PA__EIO', answer: 'SS', hint: 'Caminhada' },
        { word: 'POSSÍVEL', blank: 'PO__ÍVEL', answer: 'SS', hint: 'Que pode acontecer' },
        { word: 'CASA', blank: 'CA_A', answer: 'S', hint: 'Onde moramos' },
        { word: 'MESA', blank: 'ME_A', answer: 'S', hint: 'Móvel para comer' },
        { word: 'ROSA', blank: 'RO_A', answer: 'S', hint: 'Flor bonita' },
        { word: 'VASO', blank: 'VA_O', answer: 'S', hint: 'Onde colocamos flores' },
        { word: 'PESO', blank: 'PE_O', answer: 'S', hint: 'Medida de massa' },
        { word: 'ÚSSARO', blank: 'A__UNTO', answer: 'SS', hint: 'Tema ou matéria' },
        { word: 'MISSÃO', blank: 'MI__ÃO', answer: 'SS', hint: 'Tarefa importante' }
    ],
    'c_ç': [
        { word: 'CRIANÇA', blank: 'CRIAN_A', answer: 'Ç', hint: 'Pessoa pequena' },
        { word: 'CORAÇÃO', blank: 'CORA_ÃO', answer: 'Ç', hint: 'Órgão que bombeia sangue' },
        { word: 'CABEÇA', blank: 'CABE_A', answer: 'Ç', hint: 'Parte do corpo onde fica o cérebro' },
        { word: 'PRAÇA', blank: 'PRA_A', answer: 'Ç', hint: 'Local público para passear' },
        { word: 'MAÇÃ', blank: 'MA_Ã', answer: 'Ç', hint: 'Fruta vermelha ou verde' },
        { word: 'CALÇA', blank: 'CAL_A', answer: 'Ç', hint: 'Roupa que cobre as pernas' },
        { word: 'CIDADE', blank: '_IDADE', answer: 'C', hint: 'Local com muitas casas' },
        { word: 'CINEMA', blank: '_INEMA', answer: 'C', hint: 'Lugar para ver filmes' },
        { word: 'CEBOLA', blank: '_EBOLA', answer: 'C', hint: 'Vegetal que faz chorar' },
        { word: 'CIRCO', blank: '_IRCO', answer: 'C', hint: 'Espetáculo com palhaços' },
        { word: 'PREÇO', blank: 'PRE_O', answer: 'Ç', hint: 'Quanto algo custa' },
        { word: 'AÇÚCAR', blank: 'A_ÚCAR', answer: 'Ç', hint: 'Deixa as coisas doces' }
    ],
    g_j: [
        { word: 'VIAGEM', blank: 'VIA_EM', answer: 'G', hint: 'Ir para outro lugar' },
        { word: 'GARAGEM', blank: 'GARA_EM', answer: 'G', hint: 'Onde guarda o carro' },
        { word: 'AGEM', blank: 'IMA_EM', answer: 'G', hint: 'Figura ou foto' },
        { word: 'CORAGEM', blank: 'CORA_EM', answer: 'G', hint: 'Não ter medo' },
        { word: 'GIRAFA', blank: '_IRAFA', answer: 'G', hint: 'Animal de pescoço longo' },
        { word: 'GELO', blank: '_ELO', answer: 'G', hint: 'Água congelada' },
        { word: 'JOGO', blank: '_OGO', answer: 'J', hint: 'Brincadeira com regras' },
        { word: 'JOIA', blank: '_OIA', answer: 'J', hint: 'Objeto precioso' },
        { word: 'JEJUM', blank: '_EJUM', answer: 'J', hint: 'Ficar sem comer' },
        { word: 'JEITO', blank: '_EITO', answer: 'J', hint: 'Maneira de fazer algo' },
        { word: 'HOJE', blank: 'HO_E', answer: 'J', hint: 'Este dia' },
        { word: 'LOJA', blank: 'LO_A', answer: 'J', hint: 'Lugar para comprar' }
    ],
    x_ch: [
        { word: 'XÍCARA', blank: '_ÍCARA', answer: 'X', hint: 'Onde bebemos café' },
        { word: 'XADREZ', blank: '_ADREZ', answer: 'X', hint: 'Jogo de tabuleiro' },
        { word: 'XERIFE', blank: '_ERIFE', answer: 'X', hint: 'Policial do velho oeste' },
        { word: 'ABACAXI', blank: 'ABACA_I', answer: 'X', hint: 'Fruta com coroa' },
        { word: 'BAIXO', blank: 'BAI_O', answer: 'X', hint: 'Oposto de alto' },
        { word: 'PEIXE', blank: 'PEI_E', answer: 'X', hint: 'Animal que nada' },
        { word: 'CHUVA', blank: '_UVA', answer: 'CH', hint: 'Água que cai do céu' },
        { word: 'CHAVE', blank: '_AVE', answer: 'CH', hint: 'Abre a porta' },
        { word: 'CHOCOLATE', blank: '_OCOLATE', answer: 'CH', hint: 'Doce marrom' },
        { word: 'CHEIRO', blank: '_EIRO', answer: 'CH', hint: 'O que o nariz sente' },
        { word: 'BICHO', blank: 'BI_O', answer: 'CH', hint: 'Animal pequeno' },
        { word: 'FECHO', blank: 'FE_O', answer: 'CH', hint: 'Fecha a bolsa ou roupa' }
    ]
};

// Estado do jogo
let gameState = {
    mode: 'ss_s',
    currentQuestion: 0,
    score: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    totalQuestions: 10,
    currentWord: null,
    questions: []
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

    // Selecionar perguntas
    if (mode === 'mixed') {
        let allWords = [];
        Object.keys(WORDS).forEach(cat => {
            allWords = allWords.concat(WORDS[cat]);
        });
        gameState.questions = shuffleArray(allWords).slice(0, gameState.totalQuestions);
    } else {
        gameState.questions = shuffleArray([...WORDS[mode]]).slice(0, gameState.totalQuestions);
    }

    updateStats();
    nextQuestion();
    showScreen('game-screen');
}

// Embaralhar array
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
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

    gameState.currentWord = gameState.questions[gameState.currentQuestion];

    // Mostrar palavra com lacuna
    const wordDisplay = document.getElementById('word-display');
    const blankWord = gameState.currentWord.blank;

    // Criar elementos para cada letra
    let html = '';
    for (let i = 0; i < blankWord.length; i++) {
        if (blankWord[i] === '_') {
            html += '<span class="letter-blank">_</span>';
        } else {
            html += `<span class="letter-char">${blankWord[i]}</span>`;
        }
    }
    wordDisplay.innerHTML = html;

    // Mostrar dica
    document.getElementById('hint-text').textContent = `Dica: ${gameState.currentWord.hint}`;

    // Criar opcoes
    createOptions();
}

// Criar opcoes de letras
function createOptions() {
    const optionsArea = document.getElementById('options-area');
    optionsArea.innerHTML = '';

    let options = [];
    const answer = gameState.currentWord.answer;

    // Determinar opcoes baseado no modo
    if (gameState.mode === 'ss_s' || (gameState.mode === 'mixed' && (answer === 'S' || answer === 'SS'))) {
        options = ['S', 'SS'];
    } else if (gameState.mode === 'c_ç' || (gameState.mode === 'mixed' && (answer === 'C' || answer === 'Ç'))) {
        options = ['C', 'Ç'];
    } else if (gameState.mode === 'g_j' || (gameState.mode === 'mixed' && (answer === 'G' || answer === 'J'))) {
        options = ['G', 'J'];
    } else if (gameState.mode === 'x_ch' || (gameState.mode === 'mixed' && (answer === 'X' || answer === 'CH'))) {
        options = ['X', 'CH'];
    }

    // Se modo misto, determinar opcoes pela resposta
    if (gameState.mode === 'mixed') {
        if (answer === 'S' || answer === 'SS') options = ['S', 'SS'];
        else if (answer === 'C' || answer === 'Ç') options = ['C', 'Ç'];
        else if (answer === 'G' || answer === 'J') options = ['G', 'J'];
        else if (answer === 'X' || answer === 'CH') options = ['X', 'CH'];
    }

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn letter-btn';
        btn.textContent = opt;
        btn.onclick = () => checkAnswer(opt);
        optionsArea.appendChild(btn);
    });
}

// Verificar resposta
function checkAnswer(answer) {
    const feedbackEl = document.getElementById('feedback');
    const buttons = document.querySelectorAll('.option-btn');
    const isCorrect = answer === gameState.currentWord.answer;

    // Desabilitar botoes
    buttons.forEach(btn => {
        btn.style.pointerEvents = 'none';
        if (btn.textContent === answer) {
            btn.classList.add(isCorrect ? 'correct' : 'wrong');
        }
        if (btn.textContent === gameState.currentWord.answer) {
            btn.classList.add('correct');
        }
    });

    // Atualizar palavra com resposta
    const wordDisplay = document.getElementById('word-display');
    wordDisplay.innerHTML = `<span class="complete-word ${isCorrect ? 'correct-word' : 'wrong-word'}">${gameState.currentWord.word}</span>`;

    if (isCorrect) {
        playSound('correct');
        feedbackEl.textContent = getRandomPraise();
        feedbackEl.className = 'feedback correct';
        gameState.score += 10;
        gameState.correctAnswers++;
    } else {
        playSound('wrong');
        feedbackEl.textContent = `A palavra correta e: ${gameState.currentWord.word}`;
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
        message = 'Voce escreve muito bem!';
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
    const praises = ['Correto!', 'Muito bem!', 'Excelente!', 'Perfeito!', 'Incrivel!', 'Voce sabe escrever!'];
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
