// ==========================================
// Detetive das Questoes - Banco de conteudo (4º ano)
// BNCC: EF04MA03, EF04MA04, EF04MA06, EF04MA07, EF04MA08, EF04MA09, EF04MA22, EF04MA25
//       EF04LP01..EF04LP03, EF35LP03, EF35LP04, EF35LP05, EF15LP03, EF04LP15, EF04LP24
// ==========================================

// PROBLEMAS DE MATEMATICA
// No texto: {48} = numero IMPORTANTE para resolver; {~9} = informacao que NAO serve (pegadinha).
// Passos: 1) O que a pergunta quer saber?  2) Quais dados usar?  3) Qual conta?  4) Resposta.
window.PROBLEMAS = [
    {
        tema: 'Subtração',
        texto: 'Ana tinha {48} figurinhas. Ela tem {~9} anos. Ana deu {15} figurinhas para sua prima. Com quantas figurinhas Ana ficou?',
        pede: ['Quantas figurinhas Ana tem agora', 'Quantas figurinhas Ana deu', 'Quantos anos Ana tem', 'Quantas figurinhas a prima tinha'],
        conta: ['48 − 15', '48 + 15', '48 − 9'],
        resposta: ['33 figurinhas', '63 figurinhas', '39 figurinhas'],
        dica: '“Deu” e “ficou” mostram que a quantidade DIMINUIU → subtração. A idade de Ana é uma informação que não serve para nada!'
    },
    {
        tema: 'Multiplicação',
        texto: 'Uma escola tem {6} turmas de 4º ano. Cada turma tem {28} alunos. A escola fica a {~3} quarteirões da praça. Quantos alunos do 4º ano há na escola?',
        pede: ['O total de alunos do 4º ano', 'Quantas turmas existem', 'Quantos alunos há em uma turma', 'A distância até a praça'],
        conta: ['6 × 28', '28 + 6', '28 − 6'],
        resposta: ['168 alunos', '34 alunos', '22 alunos'],
        dica: '“Cada turma tem 28” e são 6 turmas: são 6 grupos iguais de 28 → multiplicação.'
    },
    {
        tema: 'Duas etapas',
        texto: 'Pedro comprou um caderno por {R$ 18} e uma caneta por {R$ 4}. Ele pagou com uma nota de {R$ 50}. Quanto Pedro recebeu de troco?',
        pede: ['Quanto Pedro recebeu de troco', 'Quanto custou o caderno', 'Quanto Pedro gastou ao todo', 'Quanto dinheiro Pedro tinha na carteira'],
        conta: ['Primeiro 18 + 4 = 22, depois 50 − 22', '50 − 18 + 4', '18 + 4 + 50'],
        resposta: ['R$ 28', 'R$ 36', 'R$ 72'],
        dica: 'Problema de DUAS etapas: primeiro descubra quanto ele gastou (soma). Depois calcule o troco (subtração). Atenção: a pergunta é o TROCO, não o gasto!'
    },
    {
        tema: 'Divisão',
        texto: 'A professora tem {72} lápis e quer dividir igualmente entre {8} grupos. Na sala há {~25} cadeiras. Quantos lápis cada grupo vai receber?',
        pede: ['Quantos lápis cada grupo vai receber', 'Quantos lápis a professora tem', 'Quantos grupos existem', 'Quantas cadeiras há na sala'],
        conta: ['72 ÷ 8', '72 − 8', '72 × 8'],
        resposta: ['9 lápis', '64 lápis', '576 lápis'],
        dica: '“Dividir igualmente” e “cada grupo” são palavras-pista da DIVISÃO.'
    },
    {
        tema: 'Leia até o fim!',
        texto: 'O livro de Julia tem {~150} páginas. Ela lê {12} páginas por dia. Quantas páginas ela terá lido depois de {7} dias?',
        pede: ['Quantas páginas ela terá lido em 7 dias', 'Quantas páginas tem o livro', 'Quantas páginas faltam para terminar o livro', 'Quantos dias ela leva para terminar o livro'],
        conta: ['12 × 7', '150 − 12', '150 ÷ 7'],
        resposta: ['84 páginas', '66 páginas', '138 páginas'],
        dica: 'A pergunta NÃO é quantas páginas faltam! Ela quer saber quanto foi LIDO em 7 dias → 12 × 7. O total do livro (150) não é usado.'
    },
    {
        tema: 'Comparação',
        texto: 'Livia tem {35} reais no cofrinho e Julia tem {52} reais. Quantos reais Julia tem a mais que Livia?',
        pede: ['A diferença entre o dinheiro das duas', 'Quanto as duas têm juntas', 'Quanto Julia tem', 'Quanto Livia tem'],
        conta: ['52 − 35', '52 + 35', '35 × 2'],
        resposta: ['17 reais', '87 reais', '70 reais'],
        dica: '“A mais que” pede a DIFERENÇA → subtração (maior − menor). Cuidado: não é para juntar!'
    },
    {
        tema: 'Metade',
        texto: 'Um pacote tem {40} balas. Carla tem {~3} irmãos. Ela comeu a metade das balas do pacote. Quantas balas sobraram?',
        pede: ['Quantas balas sobraram no pacote', 'Quantas balas tinha o pacote', 'Quantos irmãos Carla tem', 'Quantas balas cada irmão ganhou'],
        conta: ['40 ÷ 2', '40 × 2', '40 ÷ 3'],
        resposta: ['20 balas', '80 balas', '13 balas'],
        dica: '“Metade” = dividir por 2. Se ela comeu a metade, sobrou a outra metade. Os irmãos não entram na conta!'
    },
    {
        tema: 'Fração de quantidade',
        texto: 'Em uma caixa há {24} ovos. Mamãe usou {1/4} dos ovos para fazer um bolo que serviu {~10} pessoas. Quantos ovos ela usou?',
        pede: ['Quantos ovos foram usados no bolo', 'Quantos ovos sobraram na caixa', 'Quantas pessoas comeram bolo', 'Quantos ovos tinha a caixa'],
        conta: ['24 ÷ 4', '24 × 4', '24 − 4'],
        resposta: ['6 ovos', '18 ovos', '20 ovos'],
        dica: '1/4 de uma quantidade = dividir em 4 partes iguais e pegar 1 parte. Atenção: a pergunta é quantos foram USADOS (6), não quantos sobraram (18).'
    },
    {
        tema: 'Horas',
        texto: 'O filme começou às {14h30} e durou {1h45min}. A sala tinha {~120} lugares. A que horas o filme terminou?',
        pede: ['O horário em que o filme terminou', 'Quanto tempo o filme durou', 'Quantos lugares a sala tinha', 'O horário em que o filme começou'],
        conta: ['14h30 + 1h45min', '14h30 − 1h45min', '1h45min + 120'],
        resposta: ['16h15', '15h75', '12h45'],
        dica: '14h30 + 1h = 15h30. Mais 45 minutos: 15h30 + 30 min = 16h00, + 15 min = 16h15. Lembre: 60 minutos = 1 hora!'
    },
    {
        tema: 'Combinações',
        texto: 'Marina tem {3} blusas e {4} saias. Na cama dela há {~2} bonecas. Quantas combinações diferentes de uma blusa com uma saia ela pode fazer?',
        pede: ['Quantas combinações de blusa e saia são possíveis', 'Quantas roupas Marina tem', 'Quantas saias Marina tem', 'Quantas bonecas Marina tem'],
        conta: ['3 × 4', '3 + 4', '3 + 4 + 2'],
        resposta: ['12 combinações', '7 combinações', '9 combinações'],
        dica: 'Cada blusa combina com cada uma das 4 saias: 4 + 4 + 4 = 3 × 4 = 12. “Combinações” pede multiplicação!'
    },
    {
        tema: 'Disposição retangular',
        texto: 'Um teatro tem {15} fileiras com {12} cadeiras em cada uma. O ingresso custa {~R$ 20}. Quantas cadeiras há no teatro?',
        pede: ['O total de cadeiras do teatro', 'Quantas fileiras existem', 'Quanto custa o ingresso', 'Quanto o teatro arrecada'],
        conta: ['15 × 12', '15 + 12', '20 × 12'],
        resposta: ['180 cadeiras', '27 cadeiras', '240 cadeiras'],
        dica: 'Fileiras × cadeiras em cada fileira = total. O preço do ingresso é informação a mais!'
    },
    {
        tema: 'Divisão',
        texto: 'Uma costureira trabalha há {~20} anos. Ela tem {84} botões e coloca {6} botões em cada camisa. Quantas camisas ela consegue fazer?',
        pede: ['Quantas camisas ela consegue fazer', 'Quantos botões ela tem', 'Há quantos anos ela trabalha', 'Quantos botões vão em cada camisa'],
        conta: ['84 ÷ 6', '84 − 6', '84 × 6'],
        resposta: ['14 camisas', '78 camisas', '504 camisas'],
        dica: 'Pense: “quantas vezes o 6 cabe no 84?” → divisão. 6 × 14 = 84.'
    },
    {
        tema: 'Duas etapas',
        texto: 'Um ônibus da linha {~105} saiu com {32} passageiros. No primeiro ponto desceram {9} pessoas e subiram {5}. Quantos passageiros há agora no ônibus?',
        pede: ['Quantos passageiros estão no ônibus agora', 'Quantas pessoas desceram', 'Qual é a linha do ônibus', 'Quantas pessoas subiram'],
        conta: ['32 − 9 + 5', '32 + 9 − 5', '32 − 9 − 5'],
        resposta: ['28 passageiros', '36 passageiros', '18 passageiros'],
        dica: 'DESCERAM → tira (−). SUBIRAM → põe (+). O número da linha (105) não é quantidade de pessoas!'
    },
    {
        tema: 'Medidas',
        texto: 'Uma garrafa tem {2 litros} de suco. Cada copo tem {250 mL}. Na festa estão {~5} amigos. Quantos copos dá para encher com a garrafa?',
        pede: ['Quantos copos dá para encher', 'Quantos amigos estão na festa', 'Quanto suco cada amigo vai beber', 'Quantos litros tem a garrafa'],
        conta: ['2000 ÷ 250', '2 × 250', '250 − 2'],
        resposta: ['8 copos', '500 copos', '4 copos'],
        dica: 'Primeiro transforme: 1 litro = 1000 mL, então 2 litros = 2000 mL. Depois divida pelo tamanho do copo: 2000 ÷ 250 = 8.'
    },
    {
        tema: 'Dinheiro',
        texto: 'Cada pacote de figurinhas custa {R$ 3}. Bia comprou {9} pacotes e ainda guardou {~R$ 10} no cofrinho. Quanto Bia gastou com figurinhas?',
        pede: ['Quanto Bia gastou com figurinhas', 'Quanto Bia guardou no cofrinho', 'Quanto custa um pacote', 'Quanto dinheiro Bia tinha antes'],
        conta: ['9 × 3', '9 + 3', '9 × 3 + 10'],
        resposta: ['R$ 27', 'R$ 12', 'R$ 37'],
        dica: 'A pergunta é quanto GASTOU com figurinhas: 9 pacotes de R$ 3. O dinheiro do cofrinho não foi gasto!'
    },
    {
        tema: 'Resto da divisão',
        texto: 'O passeio da escola dura {~4} horas. Vão {50} alunos, e cada van leva {8} alunos. Quantas vans são necessárias para levar todos os alunos?',
        pede: ['Quantas vans são necessárias', 'Quantos alunos vão ao passeio', 'Quanto tempo dura o passeio', 'Quantos alunos cabem em uma van'],
        conta: ['50 ÷ 8 (e olhar o resto)', '50 − 8', '50 × 8'],
        resposta: ['7 vans', '6 vans', '42 vans'],
        dica: '50 ÷ 8 = 6 e sobra 2. Esses 2 alunos também precisam ir, então é preciso mais uma van: 7! Sempre confira se a resposta faz sentido.'
    },
    {
        tema: 'Dobro',
        texto: 'Tiago tem {14} anos. A irmã dele tem {~6} anos. O pai de Tiago tem o dobro da idade de Tiago. Qual é a idade do pai?',
        pede: ['A idade do pai de Tiago', 'A idade de Tiago', 'A idade da irmã', 'A soma das idades dos irmãos'],
        conta: ['14 × 2', '14 + 2', '14 + 6'],
        resposta: ['28 anos', '16 anos', '20 anos'],
        dica: '“Dobro” = multiplicar por 2. A idade da irmã não entra na conta: o dobro é da idade de TIAGO.'
    },
    {
        tema: 'Quanto falta',
        texto: 'Gabriel tem {~11} anos e quer comprar uma bicicleta de {R$ 350}. Ele já juntou {R$ 210}. Quanto ainda falta juntar?',
        pede: ['Quanto dinheiro ainda falta', 'Quanto custa a bicicleta', 'Quanto Gabriel já juntou', 'Quantos anos Gabriel tem'],
        conta: ['350 − 210', '350 + 210', '210 − 11'],
        resposta: ['R$ 140', 'R$ 560', 'R$ 199'],
        dica: '“Quanto falta” → subtração: o que ele quer (350) menos o que já tem (210).'
    },
    {
        tema: 'Duas etapas',
        texto: 'Uma padaria fez {120} pães pela manhã e {85} pães à tarde. Ao final do dia, vendeu {190} pães. Quantos pães sobraram?',
        pede: ['Quantos pães sobraram', 'Quantos pães foram feitos', 'Quantos pães foram vendidos', 'Quantos pães foram feitos à tarde'],
        conta: ['120 + 85 = 205, depois 205 − 190', '120 − 85 + 190', '190 − 120'],
        resposta: ['15 pães', '225 pães', '70 pães'],
        dica: 'Primeiro junte tudo o que foi feito (120 + 85 = 205). Depois tire o que foi vendido (205 − 190 = 15).'
    },
    {
        tema: 'Multiplicação',
        texto: 'Uma caixa tem {4} fileiras de {6} chocolates. Mamãe comprou {5} caixas na loja que fica na rua {~13}. Quantos chocolates ela comprou?',
        pede: ['O total de chocolates comprados', 'Quantos chocolates há em uma caixa', 'Quantas caixas ela comprou', 'O número da rua da loja'],
        conta: ['4 × 6 = 24, depois 24 × 5', '4 + 6 + 5', '4 × 6 + 5'],
        resposta: ['120 chocolates', '15 chocolates', '29 chocolates'],
        dica: 'Primeiro descubra quantos chocolates tem UMA caixa (4 × 6 = 24). Depois multiplique pelo número de caixas (24 × 5 = 120).'
    }
];

// TEXTOS PARA INTERPRETACAO
// Cada frase fica separada para a crianca tocar na "prova" (evidencia).
// prova: indice da frase que comprova a resposta (null = resposta precisa juntar pistas/inferir).
window.TEXTOS = [
    {
        titulo: 'A Cigarra e a Formiga',
        genero: 'Fábula',
        frases: [
            'Durante todo o verão, a formiga trabalhou sem parar, carregando folhas e grãos para o formigueiro.',
            'Enquanto isso, a cigarra passava os dias cantando debaixo de uma árvore.',
            '— Por que você não descansa um pouco? — perguntou a cigarra.',
            '— Estou guardando comida para o inverno — respondeu a formiga.',
            'Quando o inverno chegou, a cigarra estava com frio e com fome.',
            'Ela bateu na porta do formigueiro e pediu ajuda.',
            'A formiga a recebeu, mas lembrou: é preciso se preparar para os tempos difíceis.'
        ],
        perguntas: [
            { tipo: 'Localizar informação', q: 'O que a formiga fazia durante o verão?',
              op: ['Trabalhava carregando folhas e grãos', 'Cantava debaixo de uma árvore', 'Dormia no formigueiro', 'Brincava com a cigarra'],
              prova: 0, dica: 'A resposta está escrita logo na primeira frase do texto.' },
            { tipo: 'Inferência', q: 'Por que a cigarra ficou com fome no inverno?',
              op: ['Porque não guardou comida durante o verão', 'Porque a formiga pegou a comida dela', 'Porque estava doente', 'Porque o formigueiro estava fechado'],
              prova: null, dica: 'O texto não diz isso com essas palavras. Junte as pistas: a cigarra só cantou no verão, enquanto a formiga guardava comida.' },
            { tipo: 'Ensinamento (moral)', q: 'Qual é o ensinamento dessa fábula?',
              op: ['É importante se preparar para o futuro', 'Cantar é proibido', 'Formigas são mais fortes que cigarras', 'O inverno é a melhor estação'],
              prova: 6, dica: 'Fábulas terminam com um ensinamento. Veja a última frase.' },
            { tipo: 'Pontuação', q: 'No texto, para que serve o travessão (—)?',
              op: ['Para mostrar a fala dos personagens', 'Para separar as sílabas', 'Para terminar o texto', 'Para indicar uma pergunta'],
              prova: 2, dica: 'O travessão aparece antes de alguém falar: “— perguntou a cigarra”.' }
        ]
    },
    {
        titulo: 'Bilhete na geladeira',
        genero: 'Bilhete',
        frases: [
            'Julia,',
            'Fui ao mercado comprar ingredientes para o bolo do seu aniversário.',
            'Volto às 17h.',
            'Por favor, dê comida para o gato e não abra a geladeira, porque tem uma surpresa lá dentro!',
            'Beijos, Mamãe.'
        ],
        perguntas: [
            { tipo: 'Gênero textual', q: 'Que tipo de texto é esse?',
              op: ['Um bilhete', 'Uma receita', 'Uma notícia', 'Um poema'],
              prova: null, dica: 'Tem para quem é (Julia), uma mensagem curta e quem escreveu (Mamãe): são características do bilhete.' },
            { tipo: 'Localizar informação', q: 'A que horas a mamãe vai voltar?',
              op: ['Às 17h', 'Depois do mercado, sem horário', 'Às 7h', 'Ao meio-dia'],
              prova: 2, dica: 'Procure no texto um horário.' },
            { tipo: 'Atenção ao NÃO', q: 'Por que Julia NÃO deve abrir a geladeira?',
              op: ['Porque tem uma surpresa lá dentro', 'Porque a geladeira está quebrada', 'Porque o gato está lá dentro', 'Porque a comida acabou'],
              prova: 3, dica: 'A palavra “porque” mostra o motivo. Veja o que vem depois dela.' },
            { tipo: 'Finalidade do texto', q: 'Para que a mamãe escreveu esse texto?',
              op: ['Para avisar aonde foi e deixar pedidos', 'Para ensinar a fazer bolo', 'Para contar uma história de aventura', 'Para vender um gato'],
              prova: null, dica: 'Pense no motivo de alguém deixar um bilhete: avisar e pedir coisas para quem vai ler.' }
        ]
    },
    {
        titulo: 'Tartarugas marinhas nascem em praia da Bahia',
        genero: 'Notícia',
        frases: [
            'Mais de 100 filhotes de tartaruga-marinha nasceram na última sexta-feira, em uma praia do litoral norte da Bahia.',
            'Os ovos foram protegidos por voluntários de um projeto ambiental durante 50 dias.',
            'Assim que saíram dos ovos, os filhotes seguiram em direção ao mar.',
            'Segundo os biólogos, apenas 1 em cada 1.000 filhotes chega à fase adulta.',
            'Por isso, os moradores são orientados a não deixar lixo na areia e a manter as luzes apagadas à noite, pois a claridade confunde os animais.'
        ],
        perguntas: [
            { tipo: 'Localizar informação', q: 'Onde os filhotes nasceram?',
              op: ['Em uma praia do litoral norte da Bahia', 'Em um aquário', 'No fundo do mar', 'Em um rio'],
              prova: 0, dica: 'Notícias costumam dizer logo no começo O QUÊ, QUANDO e ONDE aconteceu.' },
            { tipo: 'Sentido da palavra', q: 'Na frase “a claridade confunde os animais”, a palavra CLARIDADE quer dizer:',
              op: ['Luz', 'Escuridão', 'Barulho', 'Água'],
              prova: 4, dica: 'Releia a frase inteira: ela fala em manter as LUZES apagadas. Claridade vem de “claro”.' },
            { tipo: 'Causa e consequência', q: 'Por que os moradores devem manter as luzes apagadas à noite?',
              op: ['Porque a luz confunde os filhotes', 'Para economizar energia', 'Porque os biólogos querem dormir', 'Para os turistas não verem as tartarugas'],
              prova: 4, dica: 'A palavra “pois” explica o motivo.' },
            { tipo: 'Localizar informação', q: 'Segundo o texto, de cada 1.000 filhotes, quantos chegam à fase adulta?',
              op: ['Apenas 1', '100', '50', '1.000'],
              prova: 3, dica: 'Cuidado com os outros números do texto (100 filhotes, 50 dias). Procure “fase adulta”.' },
            { tipo: 'Finalidade do texto', q: 'Qual é o principal objetivo desse texto?',
              op: ['Informar sobre um fato que aconteceu', 'Ensinar uma receita', 'Contar uma história inventada', 'Convidar para uma festa'],
              prova: null, dica: 'É uma notícia: conta um fato real, com data e lugar.' }
        ]
    },
    {
        titulo: 'Vitamina de banana',
        genero: 'Receita',
        frases: [
            'Ingredientes: 2 bananas maduras, 1 copo de leite e 1 colher de mel.',
            'Modo de preparo: descasque as bananas e corte em rodelas.',
            'Coloque as bananas, o leite e o mel no liquidificador.',
            'Bata por 1 minuto, até ficar cremoso.',
            'Sirva gelado. Rende 2 copos.'
        ],
        perguntas: [
            { tipo: 'Finalidade do texto', q: 'Qual é a finalidade desse texto?',
              op: ['Ensinar a preparar uma vitamina', 'Contar a história de uma banana', 'Vender um liquidificador', 'Informar uma notícia'],
              prova: null, dica: 'Receitas têm ingredientes e modo de preparo: elas ensinam a fazer algo.' },
            { tipo: 'Ordem dos fatos', q: 'O que deve ser feito ANTES de colocar as bananas no liquidificador?',
              op: ['Descascar e cortar em rodelas', 'Bater por 1 minuto', 'Servir gelado', 'Colocar o mel'],
              prova: 1, dica: 'Siga a ordem dos passos do modo de preparo.' },
            { tipo: 'Linguagem', q: 'As palavras “descasque”, “coloque”, “bata” e “sirva” indicam:',
              op: ['Instruções para quem vai fazer a receita', 'Ações que já aconteceram no passado', 'Sentimentos de quem escreveu', 'Nomes de alimentos'],
              prova: null, dica: 'São verbos que dão ORDENS/instruções (modo imperativo), comuns em receitas.' },
            { tipo: 'Matemática no texto', q: 'Para fazer 4 copos de vitamina, quantas bananas são necessárias?',
              op: ['4 bananas', '2 bananas', '8 bananas', '1 banana'],
              prova: 4, dica: 'A receita rende 2 copos com 2 bananas. Para o DOBRO de copos, é preciso o dobro de bananas.' }
        ]
    },
    {
        titulo: 'O Vento',
        genero: 'Poema',
        frases: [
            'O vento é um menino levado,',
            'que corre pela rua sem parar.',
            'Bagunça o cabelo da vovó',
            'e faz as roupas no varal dançar.',
            'À noite ele fica cansado',
            'e assobia baixinho para o mar.'
        ],
        perguntas: [
            { tipo: 'Comparação', q: 'No poema, o vento é comparado a:',
              op: ['Um menino levado', 'Uma vovó', 'Um varal', 'O mar'],
              prova: 0, dica: 'Veja o primeiro verso: “O vento é um...”.' },
            { tipo: 'Linguagem figurada', q: 'Quando o poema diz que o vento faz “as roupas no varal dançar”, quer dizer que:',
              op: ['O vento balança as roupas', 'As roupas aprenderam a dançar', 'Alguém está dançando no varal', 'As roupas caíram no chão'],
              prova: 3, dica: 'No poema, o poeta dá ações de gente para as coisas (personificação). Roupas não dançam de verdade!' },
            { tipo: 'Rimas', q: 'Quais palavras rimam no poema?',
              op: ['parar, dançar e mar', 'menino, vovó e noite', 'cabelo, rua e roupas', 'levado, vovó e baixinho'],
              prova: null, dica: 'Rimas são palavras com o final do som parecido. Compare os finais dos versos.' },
            { tipo: 'Localizar informação', q: 'Como o vento fica à noite, segundo o poema?',
              op: ['Cansado e assobiando baixinho', 'Bravo e fazendo barulho', 'Dormindo na casa da vovó', 'Correndo pela rua'],
              prova: 4, dica: 'Procure o verso que fala da noite.' }
        ]
    },
    {
        titulo: 'Convite',
        genero: 'Convite',
        frases: [
            'Você é nosso convidado!',
            'Venha comemorar os 6 anos da Livia.',
            'Dia: 23 de setembro, sábado.',
            'Horário: das 15h às 19h.',
            'Local: Salão de festas do Edifício Primavera.',
            'Tema: Fadas e Unicórnios. Venha fantasiado!',
            'Confirme presença até o dia 20.'
        ],
        perguntas: [
            { tipo: 'Finalidade do texto', q: 'Qual é o objetivo desse texto?',
              op: ['Convidar para uma festa de aniversário', 'Contar como foi uma festa', 'Ensinar a fazer uma fantasia', 'Vender unicórnios'],
              prova: 0, dica: 'Convites chamam alguém para um evento e informam dia, hora e local.' },
            { tipo: 'Localizar informação', q: 'Até quando os convidados devem confirmar presença?',
              op: ['Até o dia 20', 'No dia 23', 'Até as 19h', 'Não precisa confirmar'],
              prova: 6, dica: 'Cuidado para não confundir com a data da festa (23). Procure “confirme”.' },
            { tipo: 'Matemática no texto', q: 'Quanto tempo vai durar a festa?',
              op: ['4 horas', '3 horas', '19 horas', '15 horas'],
              prova: 3, dica: 'Das 15h às 19h: 19 − 15 = 4 horas. A resposta não está escrita pronta — é preciso calcular!' },
            { tipo: 'Inferência', q: 'Qual fantasia combina com o tema da festa?',
              op: ['Fada', 'Pirata', 'Super-herói', 'Astronauta'],
              prova: 5, dica: 'Veja qual é o tema da festa.' }
        ]
    },
    {
        titulo: 'Por que o camaleão muda de cor?',
        genero: 'Texto informativo',
        frases: [
            'Muita gente pensa que o camaleão muda de cor só para se esconder.',
            'Mas os cientistas descobriram que isso nem sempre é verdade.',
            'Na maioria das vezes, ele muda de cor para mostrar como está se sentindo ou para controlar a temperatura do corpo.',
            'Quando está calmo, costuma ficar verde ou marrom.',
            'Quando está bravo ou quer chamar a atenção, fica com cores mais fortes, como amarelo e vermelho.'
        ],
        perguntas: [
            { tipo: 'Ideia principal', q: 'Qual é o assunto principal do texto?',
              op: ['Os motivos pelos quais o camaleão muda de cor', 'Onde o camaleão vive', 'O que o camaleão come', 'Como os cientistas trabalham'],
              prova: null, dica: 'O título já dá uma grande pista do assunto principal.' },
            { tipo: 'Atenção ao comando', q: 'De acordo com o texto, qual afirmação é INCORRETA?',
              op: ['O camaleão muda de cor apenas para se esconder', 'O camaleão muda de cor para mostrar como se sente', 'Quando está calmo, fica verde ou marrom', 'Quando está bravo, fica com cores fortes'],
              prova: 1, dica: 'A pergunta pede a INCORRETA (a errada)! O texto diz que mudar de cor “só para se esconder” nem sempre é verdade.' },
            { tipo: 'Conectivos', q: 'A palavra “Mas”, no começo da segunda frase, indica:',
              op: ['Uma ideia contrária à anterior', 'Uma soma de ideias', 'Uma conclusão', 'Um exemplo'],
              prova: 1, dica: '“Mas” mostra oposição: primeiro “muita gente pensa...”, depois “isso nem sempre é verdade”.' },
            { tipo: 'Inferência', q: 'Se um camaleão está vermelho, provavelmente ele está:',
              op: ['Bravo ou querendo chamar atenção', 'Calmo', 'Dormindo', 'Com frio'],
              prova: 4, dica: 'Veja o que o texto diz sobre as cores fortes.' }
        ]
    },
    {
        titulo: 'O dia em que Bento se perdeu',
        genero: 'Narrativa',
        frases: [
            'Bento, o cachorro da família Souza, fugiu pelo portão aberto numa manhã de domingo.',
            'As crianças procuraram pelo bairro inteiro e colaram cartazes nos postes.',
            'À tarde, o telefone tocou.',
            'Era Dona Rosa, a vizinha da padaria, dizendo que Bento estava dormindo tranquilo em cima de um saco de farinha.',
            'Quando as crianças chegaram, o cachorro estava branquinho da cabeça ao rabo.',
            'Todos riram muito, e o pai prometeu consertar o portão no mesmo dia.'
        ],
        perguntas: [
            { tipo: 'Localizar informação', q: 'Como Bento conseguiu fugir?',
              op: ['Pelo portão, que estava aberto', 'Pulando o muro', 'Alguém o levou para passear', 'Cavando um buraco'],
              prova: 0, dica: 'Releia a primeira frase com atenção.' },
            { tipo: 'Inferência', q: 'Por que Bento estava “branquinho da cabeça ao rabo”?',
              op: ['Porque dormiu em cima de um saco de farinha', 'Porque tomou banho', 'Porque ficou com medo', 'Porque é um cachorro branco'],
              prova: 3, dica: 'O texto não diz diretamente. Que pista explica o cachorro branco? Onde ele estava dormindo?' },
            { tipo: 'Estrutura da narrativa', q: 'Qual fato resolveu o problema da história?',
              op: ['A ligação de Dona Rosa avisando onde Bento estava', 'As crianças colando cartazes', 'Bento fugindo pelo portão', 'O pai prometendo consertar o portão'],
              prova: 3, dica: 'O problema era: Bento sumiu. O que fez a família encontrá-lo?' },
            { tipo: 'Localizar informação', q: 'Quem é Dona Rosa?',
              op: ['A vizinha da padaria', 'A avó das crianças', 'A dona do cachorro', 'A professora'],
              prova: 3, dica: 'Depois do nome dela, o texto explica quem ela é.' }
        ]
    }
];

// Palavras-chave que mudam o sentido do comando (destacadas para treinar a atencao)
window.PALAVRAS_CHAVE = [
    'NÃO', 'nunca', 'INCORRETA', 'incorreta', 'EXCETO', 'exceto', 'CORRETA', 'principal', 'principalmente',
    'ANTES', 'antes', 'DEPOIS', 'depois', 'cada', 'metade', 'dobro', 'triplo', 'sobrou', 'sobraram', 'restou',
    'falta', 'faltam', 'a mais', 'a menos', 'ao todo', 'juntos', 'total', 'troco', 'diferença', 'igualmente',
    'gastou', 'usou', 'deu', 'ficou', 'desceram', 'subiram', 'combinações', 'necessárias', 'terminou', 'lido'
];
