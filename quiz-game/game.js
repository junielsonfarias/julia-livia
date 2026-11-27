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
        { question: "Qual é o maior planeta do Sistema Solar?",
          options: ["Terra", "Marte", "Júpiter", "Saturno"], correct: 2,
          explain: "Júpiter é um gigante de gás: caberiam mais de 1.000 Terras dentro dele." },
        { question: "Além do alimento (açúcar), que gás as plantas liberam na fotossíntese?",
          options: ["Gás carbônico", "Oxigênio", "Nitrogênio", "Hidrogênio"], correct: 1,
          explain: "Com luz, água e gás carbônico, a planta produz seu alimento e libera oxigênio." },
        { question: "Quantos ossos tem, aproximadamente, o corpo humano adulto?",
          options: ["106", "156", "206", "256"], correct: 2,
          explain: "Um adulto tem cerca de 206 ossos. O bebê nasce com mais, e alguns se juntam com o tempo." },
        { question: "Qual órgão bombeia o sangue para todo o corpo?",
          options: ["Pulmão", "Fígado", "Coração", "Rim"], correct: 2,
          explain: "O coração é um músculo que bate sem parar e empurra o sangue pelos vasos." },
        { question: "Para que serve a camada de ozônio?",
          options: ["Para fazer chover", "Para proteger a Terra dos raios ultravioleta (UV) do Sol", "Para produzir oxigênio", "Para iluminar a noite"], correct: 1,
          explain: "A camada de ozônio fica no alto da atmosfera e filtra boa parte dos raios UV, que fazem mal à pele." },
        { question: "Qual destes animais é um mamífero?",
          options: ["Tubarão", "Baleia", "Pinguim", "Crocodilo"], correct: 1,
          explain: "A baleia vive na água, mas respira com pulmões e amamenta os filhotes: é mamífero. Tubarão é peixe, pinguim é ave e crocodilo é réptil." },
        { question: "Em qual estado físico está a água no gelo?",
          options: ["Líquido", "Gasoso", "Sólido", "Nenhum"], correct: 2,
          explain: "Gelo é água no estado sólido: tem forma própria. Ao derreter, vira líquido." },
        { question: "Qual planeta é conhecido como Planeta Vermelho?",
          options: ["Vênus", "Marte", "Júpiter", "Mercúrio"], correct: 1,
          explain: "O solo de Marte tem muito óxido de ferro (parecido com ferrugem), por isso parece vermelho." },
        { question: "A fórmula H₂O representa qual substância?",
          options: ["Oxigênio", "Hidrogênio", "Água", "Sal"], correct: 2,
          explain: "H₂O = 2 átomos de hidrogênio (H) + 1 de oxigênio (O): é a água." },
        { question: "Quantas patas tem uma aranha?",
          options: ["6", "8", "10", "12"], correct: 1,
          explain: "Aranhas têm 8 patas, por isso não são insetos (insetos têm 6)." },
        { question: "Qual é a estrela mais próxima da Terra?",
          options: ["Sirius", "Betelgeuse", "Sol", "Vega"], correct: 2,
          explain: "O Sol é uma estrela! É a mais próxima de nós, por isso parece tão grande e brilhante." },
        { question: "O que forma o arco-íris?",
          options: ["O vento soprando as nuvens", "A luz do Sol atravessando gotinhas de água", "A neve derretendo", "O trovão"], correct: 1,
          explain: "Quando a luz do Sol passa pelas gotinhas de chuva, ela se separa em várias cores." },
        { question: "Qual destes animais NÃO é um inseto?",
          options: ["Formiga", "Borboleta", "Aranha", "Abelha"], correct: 2,
          explain: "Insetos têm 6 patas e corpo em 3 partes. A aranha tem 8 patas: é um aracnídeo. Atenção ao NÃO!" },
        { question: "Quanto tempo a Terra leva para dar uma volta completa em torno de si mesma (rotação)?",
          options: ["Cerca de 1 dia (24 horas)", "1 semana", "1 mês", "1 ano"], correct: 0,
          explain: "A rotação dura cerca de 24 horas e forma o dia e a noite. A volta ao redor do Sol (translação) dura cerca de 1 ano." },
        { question: "Quando a água da roupa no varal vira vapor, isso se chama:",
          options: ["Solidificação", "Evaporação", "Condensação", "Fusão"], correct: 1,
          explain: "Evaporação é a passagem do estado líquido para o gasoso. Por isso a roupa seca ao sol." },
        { question: "Qual destes objetos é atraído por um ímã?",
          options: ["Prego de ferro", "Borracha", "Papel", "Madeira"], correct: 0,
          explain: "Ímãs atraem objetos que têm ferro, como pregos e clipes de aço." }
    ],
    geografia: [
        { question: "Qual é o maior país do mundo em território?",
          options: ["China", "Estados Unidos", "Rússia", "Brasil"], correct: 2,
          explain: "A Rússia é o maior país em área. O Brasil é o 5º maior." },
        { question: "Qual continente fica no Polo Sul e é quase todo coberto de gelo?",
          options: ["África", "Antártida", "Oceania", "Europa"], correct: 1,
          explain: "A Antártida é o continente gelado do Polo Sul. Lá não há cidades, só bases de cientistas." },
        { question: "Qual rio tem o MAIOR volume de água do mundo?",
          options: ["Amazonas", "Nilo", "Mississípi", "São Francisco"], correct: 0,
          explain: "O Rio Amazonas leva mais água para o mar do que qualquer outro rio do planeta." },
        { question: "Qual é a capital do Brasil?",
          options: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador"], correct: 2,
          explain: "Brasília é a capital desde 1960. Antes dela, a capital era o Rio de Janeiro." },
        { question: "Em qual continente fica o Egito?",
          options: ["Ásia", "Europa", "África", "Oceania"], correct: 2,
          explain: "O Egito fica no norte da África, onde passa o Rio Nilo." },
        { question: "Qual oceano banha o litoral brasileiro?",
          options: ["Pacífico", "Índico", "Ártico", "Atlântico"], correct: 3,
          explain: "Todo o litoral do Brasil é banhado pelo Oceano Atlântico." },
        { question: "Qual é o maior deserto QUENTE do mundo?",
          options: ["Gobi", "Kalahari", "Saara", "Atacama"], correct: 2,
          explain: "O Saara, no norte da África, é o maior deserto quente. Os desertos gelados, como a Antártida, são ainda maiores!" },
        { question: "Qual país tem o formato parecido com uma bota?",
          options: ["França", "Espanha", "Itália", "Portugal"], correct: 2,
          explain: "No mapa, a Itália parece uma bota chutando uma bola (a ilha da Sicília)." },
        { question: "Em qual cidade fica a Torre Eiffel?",
          options: ["Londres", "Roma", "Paris", "Madri"], correct: 2,
          explain: "A Torre Eiffel fica em Paris, capital da França." },
        { question: "Qual é o maior estado brasileiro em território?",
          options: ["Minas Gerais", "Amazonas", "Pará", "Mato Grosso"], correct: 1,
          explain: "O Amazonas é o maior estado. O Pará vem em 2º e o Mato Grosso em 3º." },
        { question: "Qual país é conhecido como “Terra do Sol Nascente”?",
          options: ["China", "Coreia do Sul", "Japão", "Tailândia"], correct: 2,
          explain: "O Japão fica no extremo leste da Ásia. O nome do país em japonês quer dizer “origem do Sol”." },
        { question: "Quantos estados tem o Brasil, SEM contar o Distrito Federal?",
          options: ["24", "25", "26", "27"], correct: 2,
          explain: "São 26 estados + o Distrito Federal (onde fica Brasília) = 27 unidades federativas." },
        { question: "Em qual região do Brasil fica a maior parte da Floresta Amazônica?",
          options: ["Norte", "Sul", "Sudeste", "Nordeste"], correct: 0,
          explain: "A Floresta Amazônica cobre grande parte da Região Norte (Amazonas, Pará, Acre…)." },
        { question: "Em um mapa, a rosa dos ventos serve para mostrar:",
          options: ["A temperatura", "As direções (Norte, Sul, Leste, Oeste)", "A quantidade de chuva", "A altura das montanhas"], correct: 1,
          explain: "A rosa dos ventos indica os pontos cardeais: Norte, Sul, Leste e Oeste." },
        { question: "De qual lado (ponto cardeal) o Sol nasce?",
          options: ["Norte", "Sul", "Leste", "Oeste"], correct: 2,
          explain: "O Sol nasce do lado Leste e se põe do lado Oeste." },
        { question: "Quantas regiões tem o Brasil?",
          options: ["3", "4", "5", "6"], correct: 2,
          explain: "Norte, Nordeste, Centro-Oeste, Sudeste e Sul: 5 regiões." }
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
        { question: "Quem comandava a frota portuguesa que chegou ao Brasil em 1500?",
          options: ["Cristóvão Colombo", "Pedro Álvares Cabral", "Vasco da Gama", "Américo Vespúcio"], correct: 1,
          explain: "Pedro Álvares Cabral chegou com a frota portuguesa em abril de 1500. Os povos indígenas já viviam aqui havia milhares de anos." },
        { question: "Em que ano os portugueses chegaram ao Brasil?",
          options: ["1492", "1500", "1530", "1600"], correct: 1,
          explain: "Foi em 1500. Em 1492 foi a chegada de Colombo à América." },
        { question: "Quem já vivia nas terras do Brasil quando os portugueses chegaram?",
          options: ["Ninguém", "Os povos indígenas", "Os espanhóis", "Os holandeses"], correct: 1,
          explain: "Muitos povos indígenas, com línguas e costumes diferentes, já viviam aqui. Por isso falamos em “chegada” dos portugueses." },
        { question: "Quem proclamou a Independência do Brasil?",
          options: ["Tiradentes", "Dom Pedro I", "Dom Pedro II", "Getúlio Vargas"], correct: 1,
          explain: "Dom Pedro I proclamou a Independência em 7 de setembro de 1822, às margens do riacho Ipiranga." },
        { question: "Em que ano o Brasil se tornou independente de Portugal?",
          options: ["1500", "1792", "1822", "1889"], correct: 2,
          explain: "A Independência foi em 1822. Em 1889 foi a Proclamação da República." },
        { question: "Qual frase ficou famosa no momento da Independência do Brasil?",
          options: ["Liberdade ou Morte!", "Independência ou Morte!", "Viva o Brasil!", "Pátria Amada!"], correct: 1,
          explain: "“Independência ou Morte!” ficou conhecido como o Grito do Ipiranga." },
        { question: "Em que ano foi proclamada a República no Brasil?",
          options: ["1822", "1850", "1889", "1900"], correct: 2,
          explain: "A República foi proclamada em 15 de novembro de 1889. Antes disso, o Brasil era um império." },
        { question: "Quem proclamou a República no Brasil?",
          options: ["Dom Pedro II", "Marechal Deodoro da Fonseca", "Getúlio Vargas", "Tiradentes"], correct: 1,
          explain: "O Marechal Deodoro da Fonseca proclamou a República e se tornou o primeiro presidente." },
        { question: "Quem foi Tiradentes?",
          options: ["Um imperador", "Um líder da Inconfidência Mineira", "Um presidente", "Um bandeirante"], correct: 1,
          explain: "Tiradentes participou da Inconfidência Mineira, movimento contra o domínio de Portugal. Lembramos dele em 21 de abril." },
        { question: "Em que dia comemoramos a Independência do Brasil?",
          options: ["15 de novembro", "7 de setembro", "21 de abril", "1º de maio"], correct: 1,
          explain: "7 de setembro = Independência. 15 de novembro = República. 21 de abril = Tiradentes." },
        { question: "Qual destes foi um dos primeiros nomes dados ao Brasil pelos portugueses?",
          options: ["Terra de Santa Cruz", "Nova Lisboa", "República Federativa", "Império do Sul"], correct: 0,
          explain: "Os portugueses chamaram a terra de Ilha de Vera Cruz e depois de Terra de Santa Cruz. O nome Brasil veio do pau-brasil." },
        { question: "Quem foi o primeiro presidente do Brasil?",
          options: ["Getúlio Vargas", "Marechal Deodoro da Fonseca", "Dom Pedro I", "Juscelino Kubitschek"], correct: 1,
          explain: "Deodoro da Fonseca, que proclamou a República em 1889, foi o primeiro presidente. Dom Pedro I foi imperador, não presidente." },
        { question: "De qual país o Brasil foi colônia?",
          options: ["Espanha", "França", "Portugal", "Inglaterra"], correct: 2,
          explain: "O Brasil foi colônia de Portugal por mais de 300 anos. Por isso falamos português." },
        { question: "De qual árvore veio o nome “Brasil”?",
          options: ["Pau-brasil", "Ipê", "Seringueira", "Jatobá"], correct: 0,
          explain: "O pau-brasil tem madeira avermelhada, cor de brasa. Ele foi muito explorado pelos portugueses." },
        { question: "Qual lei, assinada em 1888 pela Princesa Isabel, acabou com a escravidão no Brasil?",
          options: ["Lei do Ventre Livre", "Lei Áurea", "Lei dos Sexagenários", "Lei de Terras"], correct: 1,
          explain: "A Lei Áurea (13 de maio de 1888) aboliu a escravidão. O Brasil foi o último país das Américas a fazer isso." },
        { question: "Em que ano Brasília foi inaugurada como nova capital?",
          options: ["1822", "1889", "1960", "2000"], correct: 2,
          explain: "Brasília foi inaugurada em 1960, no governo de Juscelino Kubitschek." }
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
    timeLeft: 40,
    mistakes: [],
    streak: 0,      // acertos seguidos (notas sobem)
    tries: 0        // erros na pergunta atual
};

// Tempo maior para dar tempo de LER o enunciado com calma (4º ano)
const QUESTION_TIME = 40;

// Palavras que mudam o sentido da pergunta: destacadas para treinar a atencao
const KEYWORDS = ['NÃO', 'QUENTE', 'MAIOR', 'SEM', 'INCORRETA', 'CORRETAMENTE', 'EXCETO', 'PASSADO', 'PRÓPRIO', 'OXÍTONA', 'AGUDO',
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

// Estrelas do resultado: timeouts cancelados ao sair/jogar de novo
let starTimers = [];
function clearStarTimers() {
    starTimers.forEach(clearTimeout);
    starTimers = [];
}

// Ir para menu inicial
function goToMenu() {
    clearTimer();
    clearStarTimers();
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
    gameState.mistakes = [];
    gameState.totalQuestions = 10;
    clearStarTimers();

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

    // Embaralha as alternativas de cada pergunta, guardando qual e a certa
    gameState.questions = gameState.questions.map(shuffleOptions);
    gameState.totalQuestions = Math.min(10, gameState.questions.length);
    playSound('start');
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

// Embaralha as alternativas e recalcula o indice da correta
function shuffleOptions(q) {
    const order = shuffleArray(q.options.map((_, i) => i));
    return { ...q, options: order.map(i => q.options[i]), correct: order.indexOf(q.correct) };
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
        matematica: 'Matemática',
        ciencias: 'Ciências',
        geografia: 'Geografia',
        portugues: 'Português',
        historia: 'História'
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
    gameState.tries = 0;
    question.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.style.setProperty('--i', index);
        btn.innerHTML = `
            <span class="option-letter">${letters[index]}</span>
            <span class="option-text">${escapeHtml(option)}</span>
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
    buttons[question.correct].classList.remove('dica');
    buttons.forEach(btn => btn.classList.add('disabled'));

    feedbackEl.textContent = 'Tempo esgotado! Veja a resposta certa em verde.';
    feedbackEl.className = 'feedback wrong';
    gameState.streak = 0;

    // Se ja tinha errado esta pergunta, o erro ja foi contado
    if (!gameState.tries) {
        recordMistake(question, null);
        gameState.wrongAnswers++;
    }
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
// Aprendizagem sem erro: errar nao revela a resposta. A opcao errada sai de cena,
// no 2o erro sai mais uma e no 3o a certa brilha. A pergunta errada de primeira
// conta como erro (placar e revisao no final), mas a crianca termina acertando.
function selectAnswer(index) {
    if (!document.getElementById('next-btn').hidden) return;

    const question = gameState.questions[gameState.currentQuestion];
    const buttons = [...document.querySelectorAll('.option-btn')];
    const feedbackEl = document.getElementById('feedback');
    const right = buttons[question.correct];
    if (buttons[index].classList.contains('fora')) return;

    if (index === question.correct) {
        clearTimer();
        buttons.forEach(btn => {
            btn.classList.add('disabled');
            if (btn !== right) btn.classList.add('fora');
        });
        right.classList.add('correct');
        right.classList.remove('dica');
        if (window.Efeitos) Efeitos.acerto(right, { emoji: ['⭐', '✨'] });
        playSound('correct');
        gameState.streak++;
        if (window.KidsAudio && KidsAudio.note) setTimeout(() => KidsAudio.note(gameState.streak), 150);
        if (gameState.tries === 0) {
            feedbackEl.textContent = getRandomPraise();
            gameState.score += noTimer() ? 10 : 10 + Math.floor(gameState.timeLeft / 4);
            gameState.correctAnswers++;
        } else {
            feedbackEl.textContent = 'Isso! Agora você encontrou!';
        }
        feedbackEl.className = 'feedback correct';
        updateStats();
        showExplanation(question);
        return;
    }

    // Errou: o tempo continua, a opcao sai e ela tenta de novo
    playSound('wrong');
    gameState.tries++;
    gameState.streak = 0;
    const chosen = buttons[index];
    chosen.classList.add('fora');
    if (window.Efeitos) Efeitos.erro(chosen);
    if (gameState.tries === 1) {
        recordMistake(question, index);
        gameState.wrongAnswers++;
    }
    if (gameState.tries >= 2) {
        const rest = buttons.filter(b => b !== right && !b.classList.contains('fora'));
        if (rest.length) rest[0].classList.add('fora');
    }
    if (gameState.tries >= 3) right.classList.add('dica');
    feedbackEl.textContent = gameState.tries >= 2 ? 'Quase! Leia a pergunta de novo com calma.' : 'Quase! Tente de novo.';
    feedbackEl.className = 'feedback wrong';
    updateStats();
}

// Guarda a pergunta errada para a revisao no final
function recordMistake(question, chosenIndex) {
    gameState.mistakes.push({
        question: question.question,
        chosen: chosenIndex === null ? '(o tempo acabou)' : question.options[chosenIndex],
        right: question.options[question.correct],
        explain: question.explain || ''
    });
}

// Proxima pergunta
function nextQuestion() {
    if (document.getElementById('next-btn').hidden) return;
    document.getElementById('next-btn').hidden = true;
    playSound('click');
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
        title = 'Incrível!';
        message = 'Você mandou muito bem!';
    } else if (percentage >= 60) {
        icon = '🎉';
        title = 'Muito Bem!';
        message = 'Ótimo desempenho!';
    } else if (percentage >= 40) {
        icon = '👍';
        title = 'Bom Trabalho!';
        message = 'Continue praticando!';
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

    // Mostrar estrelas
    const starsDisplay = document.getElementById('stars-display');
    clearStarTimers();
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
    if (window.Efeitos) setTimeout(() => Efeitos.vitoria(), 200);
}

// Lista das perguntas erradas, com a resposta certa e a explicacao
function renderReview() {
    const box = document.getElementById('review');
    if (!box) return;
    if (!gameState.mistakes.length) {
        box.innerHTML = '<p class="review-title">🎯 Nenhum erro! Parabéns!</p>';
        return;
    }
    box.innerHTML = '<p class="review-title">📝 Revisar erros</p>' + gameState.mistakes.map(m => `
        <div class="review-item">
            <p class="review-q">${highlightKeywords(m.question)}</p>
            <p>Você respondeu: <s>${escapeHtml(m.chosen)}</s></p>
            <p class="review-ok">Resposta certa: <b>${escapeHtml(m.right)}</b></p>
            ${m.explain ? `<p class="review-exp">💡 ${escapeHtml(m.explain)}</p>` : ''}
        </div>`).join('');
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
        'Incrível!',
        'Genial!',
        'Isso mesmo!',
        'Fantástico!'
    ];
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
