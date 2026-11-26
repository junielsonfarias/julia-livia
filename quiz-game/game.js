// Quiz Educativo - Julia (4º ano)
// Mundo de Julia & Livia

// Banco de perguntas por categoria
const QUESTIONS = {
    matematica: [
        { question: "Julia tinha 125 figurinhas e ganhou 48 da avó. Quantas figurinhas ela tem agora?",
          options: ["173", "77", "163", "183"], correct: 0,
          explain: "“Ganhou” → juntar: 125 + 48 = 173." },
        { question: "Um ônibus tem 42 lugares. Quantos lugares há em 5 ônibus iguais?",
          options: ["47", "210", "200", "220"], correct: 1,
          explain: "São 5 grupos iguais de 42 → 5 × 42 = 210." },
        { question: "Livia tem 36 adesivos e quer colar a mesma quantidade em cada uma de 4 páginas. Quantos adesivos ficam em cada página?",
          options: ["32", "40", "9", "8"], correct: 2,
          explain: "“A mesma quantidade em cada” → repartir igualmente: 36 ÷ 4 = 9." },
        { question: "Como se escreve o número 3.507 por extenso?",
          options: ["Três mil, quinhentos e sete", "Três mil e cinquenta e sete", "Trezentos e cinquenta e sete", "Três mil, quinhentos e setenta"], correct: 0,
          explain: "3.507 = 3 milhares + 5 centenas + 0 dezenas + 7 unidades." },
        { question: "No número 4.826, qual é o valor do algarismo 8?",
          options: ["8", "80", "800", "8.000"], correct: 2,
          explain: "O 8 está na casa das centenas, então vale 800." },
        { question: "Qual destes números NÃO é múltiplo de 6?",
          options: ["12", "18", "16", "24"], correct: 2,
          explain: "6 × 2 = 12, 6 × 3 = 18, 6 × 4 = 24. O 16 não aparece na tabuada do 6. Atenção ao NÃO!" },
        { question: "Uma pizza foi dividida em 8 pedaços iguais. Pedro comeu 3 pedaços. Que fração da pizza Pedro comeu?",
          options: ["5/8", "3/8", "8/3", "3/5"], correct: 1,
          explain: "Ele comeu 3 dos 8 pedaços: 3/8. Cuidado: 5/8 é o que SOBROU." },
        { question: "Uma aula começa às 7h15 e dura 50 minutos. A que horas ela termina?",
          options: ["7h65", "7h55", "8h15", "8h05"], correct: 3,
          explain: "7h15 + 45 min = 8h00. Faltam 5 minutos: 8h05. (Lembre: 60 minutos = 1 hora.)" },
        { question: "Quantos centímetros há em 3 metros?",
          options: ["300 cm", "30 cm", "3.000 cm", "3 cm"], correct: 0,
          explain: "1 metro = 100 centímetros, então 3 metros = 300 cm." },
        { question: "Mariana pagou uma conta de R$ 37,50 com uma nota de R$ 50,00. Quanto ela recebeu de troco?",
          options: ["R$ 13,50", "R$ 12,50", "R$ 87,50", "R$ 22,50"], correct: 1,
          explain: "Troco = valor pago − valor da conta: 50,00 − 37,50 = 12,50." },
        { question: "Qual é o resultado de 254 − 178?",
          options: ["86", "132", "76", "124"], correct: 2,
          explain: "254 − 178 = 76. Confira com a operação inversa: 178 + 76 = 254." },
        { question: "Uma figura tem 4 lados iguais e 4 ângulos retos. Que figura é essa?",
          options: ["Retângulo", "Quadrado", "Triângulo", "Losango"], correct: 1,
          explain: "O losango tem 4 lados iguais, mas nem sempre ângulos retos. O retângulo tem ângulos retos, mas os lados podem ser diferentes. Só o quadrado tem as duas coisas." },
        { question: "Na sequência 5, 12, 19, 26, ... cada número é o anterior mais 7. Qual é o próximo número?",
          options: ["33", "32", "34", "30"], correct: 0,
          explain: "26 + 7 = 33." },
        { question: "Na turma, 8 alunos preferem futebol, 12 preferem vôlei e 5 preferem natação. Quantos alunos a mais preferem vôlei do que futebol?",
          options: ["20", "25", "4", "7"], correct: 2,
          explain: "“A mais” pede a diferença entre vôlei e futebol: 12 − 8 = 4. A natação não entra na conta!" },
        { question: "Quantos minutos há em 2 horas e meia?",
          options: ["120 minutos", "150 minutos", "250 minutos", "130 minutos"], correct: 1,
          explain: "2 horas = 120 minutos; meia hora = 30 minutos; 120 + 30 = 150." },
        { question: "Qual é o dobro de 125?",
          options: ["225", "62", "250", "127"], correct: 2,
          explain: "Dobro = multiplicar por 2: 125 × 2 = 250." }
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
        { question: "Na frase “Os meninos correram até a praça”, qual palavra é o verbo?",
          options: ["meninos", "correram", "praça", "até"], correct: 1,
          explain: "Verbo é a palavra que indica ação: “correram” (verbo correr)." },
        { question: "Qual palavra está escrita CORRETAMENTE?",
          options: ["Cabesa", "Cabessa", "Cabeça", "Kabeça"], correct: 2,
          explain: "Usamos Ç antes de A, O e U para fazer o som de S: cabeça." },
        { question: "Qual é o plural de “pão”?",
          options: ["Pãos", "Pães", "Pões", "Pãoes"], correct: 1,
          explain: "Algumas palavras terminadas em ÃO fazem o plural em ÃES: pão → pães, cão → cães." },
        { question: "Na frase “A menina estava muito feliz”, a palavra FELIZ é um:",
          options: ["Adjetivo", "Verbo", "Substantivo", "Artigo"], correct: 0,
          explain: "Adjetivo é a palavra que dá uma característica ao substantivo (a menina → feliz)." },
        { question: "Qual palavra tem o mesmo sentido (sinônimo) de “enorme”?",
          options: ["Minúsculo", "Pequeno", "Gigante", "Baixo"], correct: 2,
          explain: "Sinônimo = sentido parecido. Enorme = gigante." },
        { question: "Qual palavra tem o sentido contrário (antônimo) de “antigo”?",
          options: ["Velho", "Novo", "Idoso", "Usado"], correct: 1,
          explain: "Antônimo = sentido oposto. O contrário de antigo é novo." },
        { question: "Em qual frase o ponto de interrogação foi usado corretamente?",
          options: ["Que dia lindo?", "Eu gosto de bolo?", "Você vai à festa?", "Pare agora?"], correct: 2,
          explain: "O ponto de interrogação (?) é usado em perguntas." },
        { question: "Qual destas palavras tem acento AGUDO (´)?",
          options: ["Avô", "Café", "Mãe", "Pão"], correct: 1,
          explain: "Café tem acento agudo (´). Avô tem circunflexo (^). Mãe e pão têm til (~)." },
        { question: "Qual palavra é um substantivo PRÓPRIO?",
          options: ["cidade", "menina", "Brasil", "cachorro"], correct: 2,
          explain: "Substantivo próprio é o nome específico de algo ou alguém e começa com letra maiúscula: Brasil." },
        { question: "Leia: “Meus avós chegaram cedo para o almoço.” Quem chegou cedo?",
          options: ["Eu", "Os avós", "Os pais", "Ninguém"], correct: 1,
          explain: "Quem faz a ação de chegar é “meus avós”. Pergunte ao verbo: QUEM chegou?" },
        { question: "Qual frase está no tempo PASSADO?",
          options: ["Amanhã eu brincarei no parque.", "Hoje eu brinco no parque.", "Ontem eu brinquei no parque.", "Eu vou brincar no parque."], correct: 2,
          explain: "“Ontem” e o verbo “brinquei” mostram que a ação já aconteceu." },
        { question: "Qual é o coletivo de abelhas?",
          options: ["Cardume", "Enxame", "Rebanho", "Matilha"], correct: 1,
          explain: "Enxame = abelhas. Cardume = peixes. Rebanho = ovelhas/bois. Matilha = cães/lobos." },
        { question: "Qual é a separação silábica correta de “pássaro”?",
          options: ["pá-ssa-ro", "pás-sa-ro", "pás-sar-o", "p-ás-sa-ro"], correct: 1,
          explain: "Na separação silábica, o SS se separa: pás-sa-ro." },
        { question: "Na frase “Julia e Livia foram ao cinema. Elas adoraram o filme.”, a palavra ELAS se refere a:",
          options: ["O cinema", "O filme", "Julia e Livia", "Todas as pessoas do cinema"], correct: 2,
          explain: "“Elas” é um pronome que substitui “Julia e Livia” para não repetir os nomes." },
        { question: "Qual palavra é OXÍTONA (a sílaba mais forte é a última)?",
          options: ["Mesa", "Lápis", "Música", "Sofá"], correct: 3,
          explain: "so-FÁ: a sílaba mais forte é a última. Me-sa e lá-pis são paroxítonas; mú-si-ca é proparoxítona." },
        { question: "Em qual frase a palavra “mas” foi usada corretamente?",
          options: ["Eu tenho mas dois lápis.", "Eu queria ir, mas estava chovendo.", "Quero mas suco, por favor.", "Ele correu mas rápido."], correct: 1,
          explain: "“Mas” indica oposição (= porém). “Mais” indica quantidade: mais lápis, mais suco." }
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
    timeLeft: 40
};

// Tempo maior para dar tempo de LER o enunciado com calma (4º ano)
const QUESTION_TIME = 40;

// Palavras que mudam o sentido da pergunta: destacadas para treinar a atencao
const KEYWORDS = ['NÃO', 'INCORRETA', 'CORRETAMENTE', 'EXCETO', 'PASSADO', 'PRÓPRIO', 'OXÍTONA', 'AGUDO',
    'a mais', 'cada', 'troco', 'dobro', 'metade', 'ganhou', 'iguais', 'mesma quantidade', 'Quem', 'sinônimo', 'antônimo'];

function escapeHtml(s) {
    return s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

function highlightKeywords(text) {
    let html = escapeHtml(text);
    const words = [...KEYWORDS].sort((a, b) => b.length - a.length);
    const re = new RegExp('(^|[^\\p{L}])(' + words.join('|') + ')(?=[^\\p{L}]|$)', 'gu');
    return html.replace(re, '$1<mark class="kw">$2</mark>');
}

function noTimer() {
    const el = document.getElementById('opt-no-timer');
    return el && el.checked;
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

    gameState.totalQuestions = Math.min(10, gameState.questions.length);
    updateStats();
    showQuestion();
    showScreen('game-screen');
}

// Embaralhar array (Fisher-Yates)
function shuffleArray(array) {
    const a = array.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
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
    document.getElementById('question-text').innerHTML = highlightKeywords(question.question);
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('explain').innerHTML = '';
    document.getElementById('next-btn').hidden = true;

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
    gameState.timeLeft = QUESTION_TIME;
    document.querySelector('.timer-bar').style.visibility = noTimer() ? 'hidden' : 'visible';
    updateTimerDisplay();
    if (noTimer()) return;

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
    const percentage = (gameState.timeLeft / QUESTION_TIME) * 100;
    timerFill.style.width = percentage + '%';

    if (gameState.timeLeft <= 8) {
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

    showExplanation(question);
}

// Mostra a explicacao e espera a crianca tocar em "Proxima"
function showExplanation(question) {
    const box = document.getElementById('explain');
    box.innerHTML = question.explain ? `💡 <b>Por quê?</b> ${escapeHtml(question.explain)}` : '';
    const btn = document.getElementById('next-btn');
    btn.textContent = gameState.currentQuestion + 1 >= gameState.totalQuestions ? 'Ver resultado 🏆' : 'Próxima ➜';
    btn.hidden = false;
}

// Selecionar resposta
function selectAnswer(index) {
    if (!document.getElementById('next-btn').hidden) return;
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
        gameState.score += noTimer() ? 10 : 10 + Math.floor(gameState.timeLeft / 4);
        gameState.correctAnswers++;
    } else {
        // Resposta errada
        playSound('wrong');
        buttons[index].classList.add('wrong');
        feedbackEl.textContent = 'Não foi dessa vez! Veja a resposta certa em verde.';
        feedbackEl.className = 'feedback wrong';
        gameState.wrongAnswers++;
    }

    updateStats();
    showExplanation(question);
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
