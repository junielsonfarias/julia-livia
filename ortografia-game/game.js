// Jogo de Ortografia - Julia (4º ano)
// Mundo de Julia & Livia
// Habilidade BNCC: EF04LP01 / EF04LP02 (regularidades ortográficas)

// Banco de palavras por categoria.
// Em "blank", os "_" marcam a lacuna; "answer" é o que preenche a lacuna.
// Na tela a lacuna aparece sempre como UM só espaço, para não entregar
// a resposta pelo número de tracinhos (S × SS, R × RR, X × CH).
const WORDS = {
    ss_s: [
        { word: 'PÁSSARO', blank: 'PÁ__ARO', answer: 'SS', hint: 'Ave que voa' },
        { word: 'ASSADO', blank: 'A__ADO', answer: 'SS', hint: 'Carne feita no forno' },
        { word: 'PROFESSORA', blank: 'PROFE__ORA', answer: 'SS', hint: 'Quem ensina na escola' },
        { word: 'PASSEIO', blank: 'PA__EIO', answer: 'SS', hint: 'Volta para se divertir' },
        { word: 'POSSÍVEL', blank: 'PO__ÍVEL', answer: 'SS', hint: 'Que pode acontecer' },
        { word: 'ASSUNTO', blank: 'A__UNTO', answer: 'SS', hint: 'Tema de uma conversa' },
        { word: 'MISSÃO', blank: 'MI__ÃO', answer: 'SS', hint: 'Tarefa importante' },
        { word: 'OSSO', blank: 'O__O', answer: 'SS', hint: 'O cachorro adora roer' },
        { word: 'TOSSE', blank: 'TO__E', answer: 'SS', hint: 'Aparece junto com o resfriado' },
        { word: 'MASSA', blank: 'MA__A', answer: 'SS', hint: 'Macarrão, pão e pizza são feitos dela' },
        { word: 'PÊSSEGO', blank: 'PÊ__EGO', answer: 'SS', hint: 'Fruta de casca aveludada' },
        { word: 'CASA', blank: 'CA_A', answer: 'S', hint: 'Onde moramos' },
        { word: 'MESA', blank: 'ME_A', answer: 'S', hint: 'Móvel para comer' },
        { word: 'ROSA', blank: 'RO_A', answer: 'S', hint: 'Flor bonita' },
        { word: 'VASO', blank: 'VA_O', answer: 'S', hint: 'Onde colocamos flores' },
        { word: 'PESO', blank: 'PE_O', answer: 'S', hint: 'Medimos na balança' },
        { word: 'CASACO', blank: 'CA_ACO', answer: 'S', hint: 'Roupa para o frio' },
        { word: 'CAMISA', blank: 'CAMI_A', answer: 'S', hint: 'Roupa com botões' },
        { word: 'PRESENTE', blank: 'PRE_ENTE', answer: 'S', hint: 'Ganhamos no aniversário' },
        { word: 'VISITA', blank: 'VI_ITA', answer: 'S', hint: 'Quando alguém vem à nossa casa' }
    ],
    'c_ç': [
        { word: 'CRIANÇA', blank: 'CRIAN_A', answer: 'Ç', hint: 'Menino ou menina pequenos' },
        { word: 'CORAÇÃO', blank: 'CORA_ÃO', answer: 'Ç', hint: 'Órgão que bombeia o sangue' },
        { word: 'CABEÇA', blank: 'CABE_A', answer: 'Ç', hint: 'Parte do corpo onde fica o cérebro' },
        { word: 'PRAÇA', blank: 'PRA_A', answer: 'Ç', hint: 'Local público para passear' },
        { word: 'MAÇÃ', blank: 'MA_Ã', answer: 'Ç', hint: 'Fruta vermelha ou verde' },
        { word: 'CALÇA', blank: 'CAL_A', answer: 'Ç', hint: 'Roupa que cobre as pernas' },
        { word: 'PREÇO', blank: 'PRE_O', answer: 'Ç', hint: 'Quanto algo custa' },
        { word: 'AÇÚCAR', blank: 'A_ÚCAR', answer: 'Ç', hint: 'Deixa as coisas doces' },
        { word: 'PALHAÇO', blank: 'PALHA_O', answer: 'Ç', hint: 'Faz graça no circo' },
        { word: 'ABRAÇO', blank: 'ABRA_O', answer: 'Ç', hint: 'Damos em quem gostamos' },
        { word: 'CIDADE', blank: '_IDADE', answer: 'C', hint: 'Local com muitas casas e ruas' },
        { word: 'CINEMA', blank: '_INEMA', answer: 'C', hint: 'Lugar para ver filmes' },
        { word: 'CEBOLA', blank: '_EBOLA', answer: 'C', hint: 'Vegetal que faz chorar' },
        { word: 'CIRCO', blank: '_IRCO', answer: 'C', hint: 'Espetáculo com palhaços' },
        { word: 'CENOURA', blank: '_ENOURA', answer: 'C', hint: 'Legume laranja que o coelho adora' },
        { word: 'DOCE', blank: 'DO_E', answer: 'C', hint: 'Brigadeiro é um...' },
        { word: 'VACINA', blank: 'VA_INA', answer: 'C', hint: 'Protege contra doenças' },
        { word: 'CÉU', blank: '_ÉU', answer: 'C', hint: 'Fica azul em dia de sol' }
    ],
    g_j: [
        { word: 'VIAGEM', blank: 'VIA_EM', answer: 'G', hint: 'Ir para outro lugar' },
        { word: 'GARAGEM', blank: 'GARA_EM', answer: 'G', hint: 'Onde se guarda o carro' },
        { word: 'IMAGEM', blank: 'IMA_EM', answer: 'G', hint: 'Figura ou foto' },
        { word: 'CORAGEM', blank: 'CORA_EM', answer: 'G', hint: 'Não ter medo' },
        { word: 'GIRAFA', blank: '_IRAFA', answer: 'G', hint: 'Animal de pescoço longo' },
        { word: 'GELO', blank: '_ELO', answer: 'G', hint: 'Água congelada' },
        { word: 'GENTE', blank: '_ENTE', answer: 'G', hint: 'Pessoas' },
        { word: 'GELADEIRA', blank: '_ELADEIRA', answer: 'G', hint: 'Deixa a comida gelada' },
        { word: 'MÁGICO', blank: 'MÁ_ICO', answer: 'G', hint: 'Tira coelho da cartola' },
        { word: 'TIGELA', blank: 'TI_ELA', answer: 'G', hint: 'Pote para tomar sopa ou cereal' },
        { word: 'JOGO', blank: '_OGO', answer: 'J', hint: 'Brincadeira com regras' },
        { word: 'JOIA', blank: '_OIA', answer: 'J', hint: 'Objeto precioso' },
        { word: 'JEJUM', blank: '_EJUM', answer: 'J', hint: 'Ficar sem comer' },
        { word: 'JEITO', blank: '_EITO', answer: 'J', hint: 'Maneira de fazer algo' },
        { word: 'HOJE', blank: 'HO_E', answer: 'J', hint: 'Este dia' },
        { word: 'LOJA', blank: 'LO_A', answer: 'J', hint: 'Lugar para comprar' },
        { word: 'CANJICA', blank: 'CAN_ICA', answer: 'J', hint: 'Doce de milho da festa junina' },
        { word: 'JILÓ', blank: '_ILÓ', answer: 'J', hint: 'Legume verde e amargo' },
        { word: 'BERINJELA', blank: 'BERIN_ELA', answer: 'J', hint: 'Legume roxo' },
        { word: 'SUJEIRA', blank: 'SU_EIRA', answer: 'J', hint: 'O contrário de limpeza' }
    ],
    x_ch: [
        { word: 'XÍCARA', blank: '_ÍCARA', answer: 'X', hint: 'Onde bebemos café' },
        { word: 'XADREZ', blank: '_ADREZ', answer: 'X', hint: 'Jogo de tabuleiro com rei e rainha' },
        { word: 'XERIFE', blank: '_ERIFE', answer: 'X', hint: 'Policial do velho oeste' },
        { word: 'ABACAXI', blank: 'ABACA_I', answer: 'X', hint: 'Fruta com coroa' },
        { word: 'BAIXO', blank: 'BAI_O', answer: 'X', hint: 'Oposto de alto' },
        { word: 'PEIXE', blank: 'PEI_E', answer: 'X', hint: 'Animal que nada' },
        { word: 'CAIXA', blank: 'CAI_A', answer: 'X', hint: 'Guarda brinquedos ou presentes' },
        { word: 'ENXADA', blank: 'EN_ADA', answer: 'X', hint: 'Ferramenta para cavar a terra' },
        { word: 'LIXO', blank: 'LI_O', answer: 'X', hint: 'Vai para a lixeira' },
        { word: 'ROXO', blank: 'RO_O', answer: 'X', hint: 'Cor da uva e da berinjela' },
        { word: 'CHUVA', blank: '_UVA', answer: 'CH', hint: 'Água que cai do céu' },
        { word: 'CHAVE', blank: '_AVE', answer: 'CH', hint: 'Abre a porta' },
        { word: 'CHOCOLATE', blank: '_OCOLATE', answer: 'CH', hint: 'Doce marrom' },
        { word: 'CHEIRO', blank: '_EIRO', answer: 'CH', hint: 'O que o nariz sente' },
        { word: 'BICHO', blank: 'BI_O', answer: 'CH', hint: 'Animal' },
        { word: 'FECHO', blank: 'FE_O', answer: 'CH', hint: 'Fecha a bolsa ou a roupa' },
        { word: 'CHINELO', blank: '_INELO', answer: 'CH', hint: 'Calçado de dedo' },
        { word: 'MOCHILA', blank: 'MO_ILA', answer: 'CH', hint: 'Levamos nas costas para a escola' },
        { word: 'FLECHA', blank: 'FLE_A', answer: 'CH', hint: 'É lançada com um arco' },
        { word: 'CACHORRO', blank: 'CA_ORRO', answer: 'CH', hint: 'Melhor amigo do ser humano' }
    ],
    r_rr: [
        { word: 'CARRO', blank: 'CA__O', answer: 'RR', hint: 'Veículo de quatro rodas' },
        { word: 'TERRA', blank: 'TE__A', answer: 'RR', hint: 'Planeta onde vivemos' },
        { word: 'BARRIGA', blank: 'BA__IGA', answer: 'RR', hint: 'Parte do corpo onde fica o umbigo' },
        { word: 'GARRAFA', blank: 'GA__AFA', answer: 'RR', hint: 'Guarda água ou suco' },
        { word: 'FERRO', blank: 'FE__O', answer: 'RR', hint: 'Metal usado para fazer pregos' },
        { word: 'BURRO', blank: 'BU__O', answer: 'RR', hint: 'Animal parecido com o cavalo, de orelhas grandes' },
        { word: 'CORRIDA', blank: 'CO__IDA', answer: 'RR', hint: 'Competição para ver quem chega primeiro' },
        { word: 'MACARRÃO', blank: 'MACA__ÃO', answer: 'RR', hint: 'Massa comprida' },
        { word: 'ARROZ', blank: 'A__OZ', answer: 'RR', hint: 'Comemos com feijão' },
        { word: 'TORRE', blank: 'TO__E', answer: 'RR', hint: 'Construção alta e estreita' },
        { word: 'CARO', blank: 'CA_O', answer: 'R', hint: 'Que custa muito dinheiro' },
        { word: 'PERA', blank: 'PE_A', answer: 'R', hint: 'Fruta verde ou amarelada' },
        { word: 'CORUJA', blank: 'CO_UJA', answer: 'R', hint: 'Ave que fica acordada à noite' },
        { word: 'PIRULITO', blank: 'PI_ULITO', answer: 'R', hint: 'Doce com palito' },
        { word: 'AMARELO', blank: 'AMA_ELO', answer: 'R', hint: 'Cor da banana madura' },
        { word: 'PAREDE', blank: 'PA_EDE', answer: 'R', hint: 'Separa um cômodo do outro' },
        { word: 'MURO', blank: 'MU_O', answer: 'R', hint: 'Cerca o terreno da casa' },
        { word: 'CADEIRA', blank: 'CADEI_A', answer: 'R', hint: 'Usamos para sentar' }
    ],
    m_n: [
        { word: 'CAMPO', blank: 'CA_PO', answer: 'M', hint: 'Lugar com muito verde, fora da cidade' },
        { word: 'SOMBRA', blank: 'SO_BRA', answer: 'M', hint: 'Aparece quando tapamos a luz' },
        { word: 'TEMPO', blank: 'TE_PO', answer: 'M', hint: 'Medimos com o relógio' },
        { word: 'LÂMPADA', blank: 'LÂ_PADA', answer: 'M', hint: 'Ilumina a casa' },
        { word: 'POMBA', blank: 'PO_BA', answer: 'M', hint: 'Ave comum nas praças' },
        { word: 'BAMBU', blank: 'BA_BU', answer: 'M', hint: 'Planta que o panda come' },
        { word: 'EMPADA', blank: 'E_PADA', answer: 'M', hint: 'Salgado com recheio' },
        { word: 'COMPUTADOR', blank: 'CO_PUTADOR', answer: 'M', hint: 'Máquina com tela e teclado' },
        { word: 'TAMBOR', blank: 'TA_BOR', answer: 'M', hint: 'Instrumento em que se bate' },
        { word: 'CANTO', blank: 'CA_TO', answer: 'N', hint: 'O passarinho faz com a voz' },
        { word: 'PONTE', blank: 'PO_TE', answer: 'N', hint: 'Passa por cima do rio' },
        { word: 'DENTE', blank: 'DE_TE', answer: 'N', hint: 'Escovamos depois de comer' },
        { word: 'VENTO', blank: 'VE_TO', answer: 'N', hint: 'Faz a pipa voar' },
        { word: 'MUNDO', blank: 'MU_DO', answer: 'N', hint: 'O planeta inteiro' },
        { word: 'ONDA', blank: 'O_DA', answer: 'N', hint: 'Aparece no mar' },
        { word: 'ANJO', blank: 'A_JO', answer: 'N', hint: 'Ser com asas das histórias' },
        { word: 'BRINCO', blank: 'BRI_CO', answer: 'N', hint: 'Enfeite da orelha' },
        { word: 'LINDO', blank: 'LI_DO', answer: 'N', hint: 'Muito bonito' }
    ]
};

// Pares de opções (as duas grafias que competem)
const OPTION_PAIRS = [['S', 'SS'], ['C', 'Ç'], ['G', 'J'], ['X', 'CH'], ['R', 'RR'], ['M', 'N']];

// Regrinhas para explicar depois de cada resposta
const RULES = {
    'SS': 'Entre duas vogais, para ter som de S usamos SS (pás-sa-ro). SS nunca começa palavra.',
    'S': 'S sozinho entre duas vogais tem som de Z (ca-sa, ro-sa).',
    'Ç': 'Ç só aparece antes de A, O e U e nunca começa palavra (cri-an-ça, co-ra-ção).',
    'C': 'Antes de E e I, o C já tem som de S (cidade, cebola). Por isso não precisa de cedilha.',
    'G': 'Palavras terminadas em -GEM costumam ser com G (viagem, garagem). Muitas outras precisam ser memorizadas: girafa, gelo, gente.',
    'J': 'Antes de A, O e U o som de “j” é sempre J (jogo, loja). Usamos J também em palavras de origem tupi ou africana (canjica, jiló) e nas derivadas de palavras com J (loja → lojista).',
    'X': 'Depois de ditongo (ai, ei, ou) e depois de EN usamos X: baixo, peixe, enxada. Outras precisam ser memorizadas: xícara, lixo.',
    'CH': 'CH e X podem ter o mesmo som; muitas palavras precisam ser memorizadas: chuva, chave, mochila.',
    'RR': 'Entre duas vogais, para ter som FORTE de R usamos RR (car-ro, ter-ra). RR nunca começa palavra.',
    'R': 'R sozinho entre duas vogais tem som FRACO (ca-ro, pe-ra). Compare: caro × carro!',
    'M': 'Antes de P e B usamos M: campo, sombra, tempo, bambu.',
    'N': 'Antes das outras consoantes (T, D, C, J…) usamos N: canto, dente, anjo.'
};

const MODE_NAMES = {
    ss_s: 'S ou SS', 'c_ç': 'C ou Ç', g_j: 'G ou J', x_ch: 'X ou CH',
    r_rr: 'R ou RR', m_n: 'M ou N', mixed: 'Misturado'
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
    questions: [],
    answered: false,
    mistakes: []
};

let starTimers = [];

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

function clearStarTimers() {
    starTimers.forEach(clearTimeout);
    starTimers = [];
}

// Ir para menu inicial
function goToMenu() {
    clearStarTimers();
    gameState.score = 0;
    gameState.currentQuestion = 0;
    showScreen('start-screen');
}

// Iniciar jogo
function startGame(mode) {
    if (mode !== 'mixed' && !WORDS[mode]) mode = 'ss_s';
    clearStarTimers();
    gameState.mode = mode;
    gameState.currentQuestion = 0;
    gameState.score = 0;
    gameState.correctAnswers = 0;
    gameState.wrongAnswers = 0;
    gameState.mistakes = [];
    gameState.answered = false;

    // Selecionar perguntas
    let pool;
    if (mode === 'mixed') {
        pool = [];
        Object.keys(WORDS).forEach(cat => { pool = pool.concat(WORDS[cat]); });
    } else {
        pool = WORDS[mode];
    }
    gameState.questions = shuffleArray(pool).slice(0, gameState.totalQuestions);
    gameState.totalQuestions = Math.min(10, gameState.questions.length);

    playSound('start');
    updateStats();
    showScreen('game-screen');
    nextQuestion();
}

// Embaralhar array (Fisher-Yates, sem alterar o original)
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
    document.getElementById('question-num').textContent = Math.min(gameState.currentQuestion + 1, gameState.totalQuestions);
    document.getElementById('total-questions').textContent = gameState.totalQuestions;
}

// Atualizar barra de progresso
function updateProgress() {
    const progress = (gameState.currentQuestion / gameState.totalQuestions) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
}

// Proxima pergunta
function nextQuestion() {
    gameState.answered = false;
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('explain').textContent = '';
    document.getElementById('next-btn').hidden = true;
    updateProgress();
    updateStats();

    gameState.currentWord = gameState.questions[gameState.currentQuestion];

    // Mostrar palavra com lacuna (cada grupo de "_" vira UMA lacuna)
    const wordDisplay = document.getElementById('word-display');
    const parts = gameState.currentWord.blank.split(/_+/);
    let html = '';
    parts.forEach((part, i) => {
        for (const ch of part) html += `<span class="letter-char">${ch}</span>`;
        if (i < parts.length - 1) html += '<span class="letter-blank">?</span>';
    });
    wordDisplay.innerHTML = html;
    wordDisplay.classList.toggle('long-word', gameState.currentWord.word.length >= 9);

    // Mostrar dica
    document.getElementById('hint-text').textContent = `Dica: ${gameState.currentWord.hint}`;

    // Criar opcoes
    createOptions();
}

// Criar opcoes de letras: o par e decidido pela resposta (vale para todos os modos)
function createOptions() {
    const optionsArea = document.getElementById('options-area');
    optionsArea.innerHTML = '';

    const answer = gameState.currentWord.answer;
    const options = OPTION_PAIRS.find(pair => pair.includes(answer)) || [answer];

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn letter-btn';
        btn.textContent = opt;
        btn.dataset.value = opt;
        btn.onclick = () => checkAnswer(opt);
        optionsArea.appendChild(btn);
    });
}

// Verificar resposta
function checkAnswer(answer) {
    if (gameState.answered) return;   // evita toque duplo
    gameState.answered = true;

    const feedbackEl = document.getElementById('feedback');
    const buttons = document.querySelectorAll('.option-btn');
    const current = gameState.currentWord;
    const isCorrect = answer === current.answer;

    // Desabilitar botoes
    buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.dataset.value === answer) {
            btn.classList.add(isCorrect ? 'correct' : 'wrong');
        }
        if (btn.dataset.value === current.answer) {
            btn.classList.add('correct');
        }
    });

    // Atualizar palavra com resposta
    const wordDisplay = document.getElementById('word-display');
    wordDisplay.innerHTML = `<span class="complete-word ${isCorrect ? 'correct-word' : 'wrong-word'}">${current.word}</span>`;

    if (isCorrect) {
        playSound('correct');
        feedbackEl.textContent = getRandomPraise();
        feedbackEl.className = 'feedback correct';
        gameState.score += 10;
        gameState.correctAnswers++;
    } else {
        playSound('wrong');
        feedbackEl.textContent = `A palavra certa é: ${current.word}`;
        feedbackEl.className = 'feedback wrong';
        gameState.wrongAnswers++;
        gameState.mistakes.push({ word: current.word, blank: current.blank, chosen: answer, answer: current.answer });
    }

    document.getElementById('explain').textContent = '💡 ' + (RULES[current.answer] || '');

    gameState.currentQuestion++;
    document.getElementById('score').textContent = gameState.score;
    updateProgress();

    const nextBtn = document.getElementById('next-btn');
    nextBtn.textContent = gameState.currentQuestion >= gameState.totalQuestions ? 'Ver resultado 🏆' : 'Próxima ➜';
    nextBtn.hidden = false;
}

// Botao "Proxima"
function goNext() {
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn.hidden) return;
    nextBtn.hidden = true;
    playSound('click');
    if (gameState.currentQuestion >= gameState.totalQuestions) {
        showResults();
    } else {
        nextQuestion();
    }
}

// Mostrar resultados
function showResults() {
    const percentage = (gameState.correctAnswers / gameState.totalQuestions) * 100;

    let icon, title, message;
    if (percentage >= 80) {
        icon = '🏆';
        title = 'Excelente!';
        message = 'Você escreve muito bem!';
    } else if (percentage >= 60) {
        icon = '🎉';
        title = 'Muito bem!';
        message = 'Continue praticando!';
    } else if (percentage >= 40) {
        icon = '👍';
        title = 'Bom trabalho!';
        message = 'Tente novamente para melhorar!';
    } else {
        icon = '💪';
        title = 'Não desista!';
        message = 'A prática leva à perfeição!';
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

    clearStarTimers();
    const starsDisplay = document.getElementById('stars-display');
    starsDisplay.querySelectorAll('.star').forEach((star, i) => {
        star.classList.remove('earned');
        if (i < stars) {
            starTimers.push(setTimeout(() => {
                star.classList.add('earned');
                playSound('star');
            }, i * 300));
        }
    });

    renderReview();
    playSound('win');
    showScreen('result-screen');
}

// Lista de palavras erradas com a grafia certa e a regra
function renderReview() {
    const box = document.getElementById('review');
    if (!gameState.mistakes.length) {
        box.innerHTML = '<p class="review-title">🎯 Nenhum erro! Parabéns!</p>';
        return;
    }
    box.innerHTML = '<p class="review-title">📝 Revisar erros</p>' + gameState.mistakes.map(m => `
        <div class="review-item">
            <p><b>${m.word}</b> — você escolheu <s>${m.chosen}</s>, o certo é <b class="review-ok">${m.answer}</b></p>
            <p class="review-exp">💡 ${RULES[m.answer] || ''}</p>
        </div>`).join('');
}

// Jogar novamente
function playAgain() {
    startGame(gameState.mode);
}

// Frases de elogio
function getRandomPraise() {
    const praises = ['Correto!', 'Muito bem!', 'Excelente!', 'Perfeito!', 'Incrível!', 'Você sabe escrever!'];
    return praises[Math.floor(Math.random() * praises.length)];
}

// Sons: usa o audio compartilhado (um unico AudioContext)
function playSound(type) {
    try { if (window.KidsAudio) KidsAudio.play(type); } catch (e) {}
}

// Inicializacao
document.addEventListener('DOMContentLoaded', () => {
    showScreen('start-screen');
});
