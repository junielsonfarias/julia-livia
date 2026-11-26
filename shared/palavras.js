// ==========================================
// Banco de palavras para alfabetizacao (5 anos)
// Cada palavra: silabas separadas + figura (dica opcional)
// Priorizamos silabas simples (consoante + vogal) e palavras do dia a dia.
// ==========================================
window.PALAVRAS = {
    2: [
        ['BO', 'LA', '⚽'], ['CA', 'SA', '🏠'], ['GA', 'TO', '🐱'], ['PA', 'TO', '🦆'],
        ['SA', 'PO', '🐸'], ['DA', 'DO', '🎲'], ['MA', 'LA', '🧳'], ['BO', 'CA', '👄'],
        ['FO', 'CA', '🦭'], ['VA', 'CA', '🐮'], ['PI', 'PA', '🪁'], ['BA', 'LA', '🍬'],
        ['LU', 'A', '🌙'], ['SO', 'PA', '🍲'], ['MO', 'TO', '🏍️'], ['DE', 'DO', '☝️'],
        ['MA', 'PA', '🗺️'], ['CA', 'MA', '🛏️'], ['LA', 'TA', '🥫'], ['PE', 'RA', '🍐'],
        ['RA', 'TO', '🐭'], ['SU', 'CO', '🧃'], ['U', 'VA', '🍇'], ['CO', 'CO', '🥥'],
        ['GA', 'LO', '🐓'], ['LO', 'BO', '🐺'], ['FI', 'TA', '🎀'], ['PE', 'NA', '🪶'],
        ['RO', 'DA', '🛞'], ['CA', 'FÉ', '☕'], ['VE', 'LA', '🕯️'], ['SAI', 'A', '👗'],
        ['BE', 'BÊ', '👶'], ['DO', 'CE', '🍭'], ['LU', 'PA', '🔍'], ['NA', 'VE', '🚀'],
        ['BO', 'TA', '👢'], ['SO', 'FÁ', '🛋️'], ['FA', 'DA', '🧚'], ['MA', 'GO', '🧙'],
        ['RU', 'A', '🛣️'], ['O', 'VO', '🥚'], ['MI', 'LHO', '🌽'], ['LE', 'ÃO', '🦁'],
        ['PEI', 'XE', '🐟'], ['LI', 'VRO', '📖'], ['NU', 'VEM', '☁️'], ['MA', 'ÇÃ', '🍎'],
        ['ME', 'SA', '🍽️'], ['TI', 'A', '👩'], ['VO', 'VÓ', '👵'], ['PA', 'PAI', '👨'],
        ['MA', 'MÃE', '👩'], ['DI', 'A', '🌞'], ['BI', 'CO', '🐦'], ['CO', 'LA', '🧴']
    ],
    3: [
        ['SA', 'PA', 'TO', '👞'], ['BO', 'NE', 'CA', '🪆'], ['CA', 'VA', 'LO', '🐴'],
        ['MA', 'CA', 'CO', '🐒'], ['JA', 'NE', 'LA', '🪟'], ['GI', 'RA', 'FA', '🦒'],
        ['BA', 'NA', 'NA', '🍌'], ['TO', 'MA', 'TE', '🍅'], ['PE', 'PI', 'NO', '🥒'],
        ['PA', 'NE', 'LA', '🍳'], ['CA', 'NE', 'CA', '☕'], ['ME', 'NI', 'NA', '👧'],
        ['ME', 'NI', 'NO', '👦'], ['GO', 'RI', 'LA', '🦍'], ['CA', 'ME', 'LO', '🐫'],
        ['BA', 'LEI', 'A', '🐳'], ['CO', 'E', 'LHO', '🐰'],
        ['JA', 'CA', 'RÉ', '🐊'], ['PI', 'PO', 'CA', '🍿'], ['FO', 'GUE', 'TE', '🚀'],
        ['MO', 'CHI', 'LA', '🎒'], ['CA', 'DEI', 'RA', '🪑'], ['SE', 'REI', 'A', '🧜'],
        ['PA', 'LHA', 'ÇO', '🤡'], ['ES', 'CO', 'LA', '🏫'], ['CO', 'RU', 'JA', '🦉'],
        ['TE', 'SOU', 'RA', '✂️'], ['CE', 'NOU', 'RA', '🥕'], ['CA', 'MI', 'SA', '👕'],
        ['MO', 'RAN', 'GO', '🍓'], ['TU', 'BA', 'RÃO', '🦈'], ['LA', 'RAN', 'JA', '🍊'],
        ['BA', 'TA', 'TA', '🥔'], ['CA', 'NE', 'TA', '🖊️'], ['A', 'BE', 'LHA', '🐝'],
        ['O', 'VE', 'LHA', '🐑'], ['PI', 'CO', 'LÉ', '🍦'], ['A', 'VI', 'ÃO', '✈️'],
        ['CA', 'MI', 'NHÃO', '🚚'], ['PA', 'LI', 'TO', '🥢'], ['GA', 'TI', 'NHO', '🐈'],
        ['BO', 'LI', 'NHA', '🔵'], ['CA', 'BE', 'ÇA', '🙂'], ['SA', 'LA', 'DA', '🥗'],
        ['PE', 'TE', 'CA', '🏸'], ['CA', 'VER', 'NA', '🕳️']
    ],
    4: [
        ['BOR', 'BO', 'LE', 'TA', '🦋'], ['PI', 'RU', 'LI', 'TO', '🍭'],
        ['TE', 'LE', 'FO', 'NE', '☎️'], ['CA', 'PA', 'CE', 'TE', '⛑️'],
        ['BI', 'CI', 'CLE', 'TA', '🚲'], ['PA', 'PA', 'GAI', 'O', '🦜'],
        ['TAR', 'TA', 'RU', 'GA', '🐢'], ['E', 'LE', 'FAN', 'TE', '🐘'],
        ['A', 'BA', 'CA', 'XI', '🍍'], ['CHO', 'CO', 'LA', 'TE', '🍫'],
        ['ME', 'LAN', 'CI', 'A', '🍉'], ['PA', 'TI', 'NE', 'TE', '🛴'],
        ['BO', 'NE', 'QUI', 'NHA', '🪆'], ['CA', 'VA', 'LI', 'NHO', '🐴'],
        ['CO', 'LO', 'RI', 'DO', '🌈'], ['MA', 'CA', 'QUI', 'NHO', '🐒'],
        ['SA', 'BO', 'NE', 'TE', '🧼'], ['DI', 'NOS', 'SAU', 'RO', '🦕'],
        ['CA', 'RA', 'ME', 'LO', '🍬'], ['MA', 'CAR', 'RO', 'NA', '🍝'],
        ['FO', 'GUEI', 'RI', 'NHA', '🔥'], ['CA', 'MI', 'SE', 'TA', '👕'],
        ['PI', 'PO', 'QUEI', 'RO', '🍿'], ['BA', 'NA', 'NEI', 'RA', '🌴'],
        ['PE', 'TE', 'QUI', 'NHA', '🏸'], ['SA', 'PA', 'TI', 'NHO', '👟'],
        ['JA', 'NE', 'LI', 'NHA', '🪟'], ['ES', 'CO', 'VI', 'NHA', '🪥'],
        ['GA', 'LI', 'NHEI', 'RO', '🐔'], ['CA', 'MA', 'LE', 'ÃO', '🦎'],
        ['TO', 'MA', 'TI', 'NHO', '🍅'], ['PA', 'NE', 'LI', 'NHA', '🍳']
    ]
};

// Converte para objetos { word, syllables, emoji, size }
window.getPalavras = function (size) {
    const toObj = (arr) => {
        const emoji = arr[arr.length - 1];
        const syllables = arr.slice(0, -1);
        return { word: syllables.join(''), syllables, emoji, size: syllables.length };
    };
    if (size === 'variadas') {
        return [2, 3, 4].flatMap(n => window.PALAVRAS[n].map(toObj));
    }
    return window.PALAVRAS[size].map(toObj);
};

window.shuffle = function (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

// Remove acentos para comparar fala reconhecida com a palavra
window.semAcento = function (s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
};
