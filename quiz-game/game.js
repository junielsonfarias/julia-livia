// Quiz Educativo - Para criancas de 9 anos
// Mundo de Julia & Livia

// Banco de perguntas por categoria
const QUESTIONS = {
    matematica: [
        {
            question: "Quanto e 25 + 37?",
            options: ["62", "52", "72", "58"],
            correct: 0
        },
        {
            question: "Qual e o resultado de 8 x 7?",
            options: ["54", "56", "48", "64"],
            correct: 1
        },
        {
            question: "Quanto e 100 - 43?",
            options: ["67", "57", "47", "63"],
            correct: 1
        },
        {
            question: "Qual e a metade de 84?",
            options: ["44", "40", "42", "48"],
            correct: 2
        },
        {
            question: "Quanto e 9 x 9?",
            options: ["72", "81", "89", "90"],
            correct: 1
        },
        {
            question: "Qual o dobro de 35?",
            options: ["60", "65", "70", "75"],
            correct: 2
        },
        {
            question: "Quanto e 144 dividido por 12?",
            options: ["10", "11", "12", "14"],
            correct: 2
        },
        {
            question: "Qual e o resultado de 15 x 4?",
            options: ["50", "55", "60", "65"],
            correct: 2
        },
        {
            question: "Quanto e 1000 - 456?",
            options: ["544", "554", "534", "564"],
            correct: 0
        },
        {
            question: "Qual numero e primo?",
            options: ["15", "21", "23", "25"],
            correct: 2
        },
        {
            question: "Quanto e 3 elevado ao cubo (3³)?",
            options: ["9", "18", "27", "36"],
            correct: 2
        },
        {
            question: "Qual e 1/4 de 100?",
            options: ["20", "25", "30", "40"],
            correct: 1
        }
    ],
    ciencias: [
        {
            question: "Qual e o maior planeta do Sistema Solar?",
            options: ["Terra", "Marte", "Jupiter", "Saturno"],
            correct: 2
        },
        {
            question: "O que as plantas produzem na fotossintese?",
            options: ["Gas carbonico", "Oxigenio", "Nitrogenio", "Hidrogenio"],
            correct: 1
        },
        {
            question: "Quantos ossos tem o corpo humano adulto?",
            options: ["106", "156", "206", "256"],
            correct: 2
        },
        {
            question: "Qual orgao bombeia sangue no corpo?",
            options: ["Pulmao", "Figado", "Coracao", "Rim"],
            correct: 2
        },
        {
            question: "O que e a camada de ozonio?",
            options: ["Uma nuvem", "Protecao contra raios UV", "Um tipo de gas", "Uma estrela"],
            correct: 1
        },
        {
            question: "Qual animal e um mamifero?",
            options: ["Tubarao", "Baleia", "Pinguim", "Crocodilo"],
            correct: 1
        },
        {
            question: "Qual e o estado fisico do gelo?",
            options: ["Liquido", "Gasoso", "Solido", "Plasma"],
            correct: 2
        },
        {
            question: "Qual planeta e conhecido como Planeta Vermelho?",
            options: ["Venus", "Marte", "Jupiter", "Mercurio"],
            correct: 1
        },
        {
            question: "O que significa H2O?",
            options: ["Oxigenio", "Hidrogenio", "Agua", "Sal"],
            correct: 2
        },
        {
            question: "Quantas patas tem uma aranha?",
            options: ["6", "8", "10", "12"],
            correct: 1
        },
        {
            question: "Qual e a estrela mais proxima da Terra?",
            options: ["Sirius", "Betelgeuse", "Sol", "Vega"],
            correct: 2
        },
        {
            question: "O que causa o arco-iris?",
            options: ["Vento", "Chuva e sol", "Neve", "Trovao"],
            correct: 1
        }
    ],
    geografia: [
        {
            question: "Qual e o maior pais do mundo em territorio?",
            options: ["China", "Estados Unidos", "Russia", "Brasil"],
            correct: 2
        },
        {
            question: "Quantos continentes existem?",
            options: ["5", "6", "7", "8"],
            correct: 2
        },
        {
            question: "Qual e o rio mais longo do mundo?",
            options: ["Amazonas", "Nilo", "Mississipi", "Yangtze"],
            correct: 1
        },
        {
            question: "Qual e a capital do Brasil?",
            options: ["Sao Paulo", "Rio de Janeiro", "Brasilia", "Salvador"],
            correct: 2
        },
        {
            question: "Em qual continente fica o Egito?",
            options: ["Asia", "Europa", "Africa", "Oceania"],
            correct: 2
        },
        {
            question: "Qual oceano banha o litoral brasileiro?",
            options: ["Pacifico", "Indico", "Artico", "Atlantico"],
            correct: 3
        },
        {
            question: "Qual e o maior deserto do mundo?",
            options: ["Gobi", "Kalahari", "Saara", "Atacama"],
            correct: 2
        },
        {
            question: "Qual pais tem formato de bota?",
            options: ["Franca", "Espanha", "Italia", "Portugal"],
            correct: 2
        },
        {
            question: "Onde fica a Torre Eiffel?",
            options: ["Londres", "Roma", "Paris", "Madrid"],
            correct: 2
        },
        {
            question: "Qual e o maior estado brasileiro?",
            options: ["Minas Gerais", "Amazonas", "Para", "Mato Grosso"],
            correct: 1
        },
        {
            question: "Qual pais e conhecido como Terra do Sol Nascente?",
            options: ["China", "Coreia", "Japao", "Tailandia"],
            correct: 2
        },
        {
            question: "Quantos estados tem o Brasil?",
            options: ["24", "25", "26", "27"],
            correct: 3
        }
    ],
    portugues: [
        {
            question: "Qual e o plural de 'cidadao'?",
            options: ["Cidadoes", "Cidadaos", "Cidadaes", "Cidadans"],
            correct: 1
        },
        {
            question: "Qual palavra e um substantivo?",
            options: ["Correr", "Rapido", "Casa", "Belo"],
            correct: 2
        },
        {
            question: "Qual e o antonimo de 'alegre'?",
            options: ["Feliz", "Triste", "Contente", "Animado"],
            correct: 1
        },
        {
            question: "Quantas letras tem o alfabeto portugues?",
            options: ["23", "24", "25", "26"],
            correct: 3
        },
        {
            question: "Qual palavra esta escrita corretamente?",
            options: ["Essessao", "Excessao", "Excecao", "Excesao"],
            correct: 2
        },
        {
            question: "Qual e o sinonimo de 'veloz'?",
            options: ["Lento", "Devagar", "Rapido", "Parado"],
            correct: 2
        },
        {
            question: "Qual frase tem sujeito oculto?",
            options: ["Ele correu.", "Corri muito.", "O cao latiu.", "Maria chegou."],
            correct: 1
        },
        {
            question: "Qual palavra e um adjetivo?",
            options: ["Livro", "Grande", "Estudar", "Hoje"],
            correct: 1
        },
        {
            question: "Qual e o feminino de 'poeta'?",
            options: ["Poetisa", "Poeta", "Poetriz", "Poetesa"],
            correct: 0
        },
        {
            question: "Quantas silabas tem 'paralelepipedo'?",
            options: ["5", "6", "7", "8"],
            correct: 2
        },
        {
            question: "Qual palavra e proparoxitona?",
            options: ["Cafe", "Musica", "Parede", "Animal"],
            correct: 1
        },
        {
            question: "Qual e o coletivo de lobos?",
            options: ["Bando", "Alcateia", "Manada", "Cardume"],
            correct: 1
        }
    ],
    historia: [
        {
            question: "Quem descobriu o Brasil?",
            options: ["Cristovao Colombo", "Pedro Alvares Cabral", "Vasco da Gama", "Americo Vespucio"],
            correct: 1
        },
        {
            question: "Em que ano o Brasil foi descoberto?",
            options: ["1492", "1500", "1530", "1600"],
            correct: 1
        },
        {
            question: "Quem proclamou a Independencia do Brasil?",
            options: ["Tiradentes", "Dom Pedro I", "Dom Pedro II", "Getulio Vargas"],
            correct: 1
        },
        {
            question: "Em que ano o Brasil se tornou independente?",
            options: ["1500", "1792", "1822", "1889"],
            correct: 2
        },
        {
            question: "Qual foi o grito de independencia do Brasil?",
            options: ["Liberdade ou Morte!", "Independencia ou Morte!", "Viva o Brasil!", "Patria Amada!"],
            correct: 1
        },
        {
            question: "Em que ano foi proclamada a Republica no Brasil?",
            options: ["1822", "1850", "1889", "1900"],
            correct: 2
        },
        {
            question: "Quem proclamou a Republica no Brasil?",
            options: ["Dom Pedro II", "Marechal Deodoro", "Getulio Vargas", "Tiradentes"],
            correct: 1
        },
        {
            question: "Quem foi Tiradentes?",
            options: ["Um imperador", "Um lider da Inconfidencia Mineira", "Um presidente", "Um bandeirante"],
            correct: 1
        },
        {
            question: "Em que dia comemoramos a Independencia do Brasil?",
            options: ["15 de Novembro", "7 de Setembro", "21 de Abril", "1 de Maio"],
            correct: 1
        },
        {
            question: "Qual era o nome do Brasil quando foi descoberto?",
            options: ["Brasil", "Terra de Santa Cruz", "Republica", "Imperio"],
            correct: 1
        },
        {
            question: "Quem foi o primeiro presidente do Brasil?",
            options: ["Getulio Vargas", "Marechal Deodoro", "Dom Pedro I", "Juscelino"],
            correct: 1
        },
        {
            question: "De qual pais o Brasil foi colonia?",
            options: ["Espanha", "Franca", "Portugal", "Inglaterra"],
            correct: 2
        }
    ]
};

// Estado do jogo
let gameState = {
    category: 'matematica',
    currentQuestion: 0,
    score: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    questions: [],
    totalQuestions: 10,
    timer: null,
    timeLeft: 20
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
    clearTimer();
    gameState.score = 0;
    gameState.currentQuestion = 0;
    showScreen('start-screen');
}

// Iniciar jogo
function startGame(category) {
    gameState.category = category;
    gameState.currentQuestion = 0;
    gameState.score = 0;
    gameState.correctAnswers = 0;
    gameState.wrongAnswers = 0;

    // Selecionar perguntas
    if (category === 'misturado') {
        // Misturar perguntas de todas as categorias
        let allQuestions = [];
        Object.keys(QUESTIONS).forEach(cat => {
            allQuestions = allQuestions.concat(QUESTIONS[cat].map(q => ({...q, category: cat})));
        });
        // Embaralhar e pegar 10
        gameState.questions = shuffleArray(allQuestions).slice(0, gameState.totalQuestions);
    } else {
        // Pegar perguntas da categoria escolhida
        gameState.questions = shuffleArray([...QUESTIONS[category]]).slice(0, gameState.totalQuestions);
        gameState.questions = gameState.questions.map(q => ({...q, category: category}));
    }

    updateStats();
    showQuestion();
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

// Mostrar pergunta
function showQuestion() {
    const question = gameState.questions[gameState.currentQuestion];
    const categoryNames = {
        matematica: 'Matematica',
        ciencias: 'Ciencias',
        geografia: 'Geografia',
        portugues: 'Portugues',
        historia: 'Historia'
    };

    document.getElementById('category-badge').textContent = categoryNames[question.category] || 'Quiz';
    document.getElementById('question-text').textContent = question.question;
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';

    // Criar opcoes
    const optionsArea = document.getElementById('options-area');
    optionsArea.innerHTML = '';

    const letters = ['A', 'B', 'C', 'D'];
    question.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = `
            <span class="option-letter">${letters[index]}</span>
            <span class="option-text">${option}</span>
        `;
        btn.onclick = () => selectAnswer(index);
        optionsArea.appendChild(btn);
    });

    // Iniciar timer
    startTimer();
    updateStats();
}

// Iniciar timer
function startTimer() {
    clearTimer();
    gameState.timeLeft = 20;
    updateTimerDisplay();

    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();

        if (gameState.timeLeft <= 0) {
            clearTimer();
            timeUp();
        }
    }, 1000);
}

// Atualizar display do timer
function updateTimerDisplay() {
    const timerFill = document.getElementById('timer-fill');
    const percentage = (gameState.timeLeft / 20) * 100;
    timerFill.style.width = percentage + '%';

    if (gameState.timeLeft <= 5) {
        timerFill.classList.add('warning');
    } else {
        timerFill.classList.remove('warning');
    }
}

// Limpar timer
function clearTimer() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
}

// Tempo esgotado
function timeUp() {
    const question = gameState.questions[gameState.currentQuestion];
    const feedbackEl = document.getElementById('feedback');

    // Marcar resposta correta
    const buttons = document.querySelectorAll('.option-btn');
    buttons[question.correct].classList.add('correct');
    buttons.forEach(btn => btn.classList.add('disabled'));

    feedbackEl.textContent = 'Tempo esgotado!';
    feedbackEl.className = 'feedback wrong';

    gameState.wrongAnswers++;
    playSound('wrong');

    setTimeout(nextQuestion, 2000);
}

// Selecionar resposta
function selectAnswer(index) {
    clearTimer();

    const question = gameState.questions[gameState.currentQuestion];
    const buttons = document.querySelectorAll('.option-btn');
    const feedbackEl = document.getElementById('feedback');

    // Desabilitar todos os botoes
    buttons.forEach(btn => btn.classList.add('disabled'));

    // Marcar resposta correta
    buttons[question.correct].classList.add('correct');

    if (index === question.correct) {
        // Resposta correta
        playSound('correct');
        feedbackEl.textContent = getRandomPraise();
        feedbackEl.className = 'feedback correct';
        gameState.score += 10 + Math.floor(gameState.timeLeft / 2);
        gameState.correctAnswers++;
    } else {
        // Resposta errada
        playSound('wrong');
        buttons[index].classList.add('wrong');
        feedbackEl.textContent = 'Nao foi dessa vez!';
        feedbackEl.className = 'feedback wrong';
        gameState.wrongAnswers++;
    }

    updateStats();
    setTimeout(nextQuestion, 2000);
}

// Proxima pergunta
function nextQuestion() {
    gameState.currentQuestion++;

    if (gameState.currentQuestion >= gameState.totalQuestions) {
        showResults();
    } else {
        showQuestion();
    }
}

// Mostrar resultados
function showResults() {
    clearTimer();

    const percentage = (gameState.correctAnswers / gameState.totalQuestions) * 100;

    // Definir icone e mensagem baseado no desempenho
    let icon, title, message;
    if (percentage >= 80) {
        icon = '🏆';
        title = 'Incrivel!';
        message = 'Voce e um genio!';
    } else if (percentage >= 60) {
        icon = '🎉';
        title = 'Muito Bem!';
        message = 'Otimo desempenho!';
    } else if (percentage >= 40) {
        icon = '👍';
        title = 'Bom Trabalho!';
        message = 'Continue praticando!';
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
    showScreen('result-screen');
}

// Jogar novamente
function playAgain() {
    startGame(gameState.category);
}

// Frases de elogio
function getRandomPraise() {
    const praises = [
        'Correto!',
        'Muito bem!',
        'Excelente!',
        'Perfeito!',
        'Incrivel!',
        'Genial!',
        'Isso mesmo!',
        'Fantastico!'
    ];
    return praises[Math.floor(Math.random() * praises.length)];
}

// Sons com Web Audio API
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
