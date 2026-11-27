// ==========================================
// Comparacao de fala reconhecida x palavra esperada (alfabetizacao)
// O reconhecedor do navegador escreve o que ouviu do jeito dele:
//   "bola" pode virar "Bola", "bolas", "a bola", "bo la", "vou lá", "bóla"...
// Criancas de 5 anos leem silaba por silaba ("ca... sa"), trocam sons
// parecidos (B/V, T/D) e o reconhecedor separa as silabas em resultados
// diferentes. Este modulo compara pelo SOM (chave fonetica), aceita
// silabas faladas separadas e diz quando a leitura ainda esta no meio.
//
// FalaMatch.matches(alvo, falado, { lenient, isKnown }) -> true/false
// FalaMatch.isPartial(alvo, falado)  -> true se o falado e o comeco da palavra
// FalaMatch.tokens(texto)            -> palavras sem acento, em maiusculas
// FalaMatch.key(palavra)             -> chave fonetica ("CASA" -> "KAZA")
// ==========================================
(function (root) {
    function semAcento(s) {
        // Ç vira S antes de tirar os acentos (senao "maçã" viraria "maca", com som de K)
        return String(s).replace(/[çÇ]/g, 'SS').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
    }

    function tokens(text) {
        return semAcento(text).replace(/[^A-Z ]/g, ' ').split(/\s+/).filter(Boolean);
    }

    const V = 'AEIOU';
    const isV = c => c !== undefined && V.includes(c);

    // Chave fonetica do portugues brasileiro: grafias diferentes, mesmo som
    function key(word) {
        let w = semAcento(word).replace(/[^A-Z]/g, '');
        if (!w) return '';
        w = w.replace(/^H/, '')
             .replace(/PH/g, 'F').replace(/CH/g, 'X').replace(/SH/g, 'X')
             .replace(/LH/g, 'LI').replace(/NH/g, 'NI')
             .replace(/QU(?=[EI])/g, 'K').replace(/GU(?=[EI])/g, 'G').replace(/QU/g, 'KU')
             .replace(/C(?=[EI])/g, 'S').replace(/Ç/g, 'S').replace(/SC(?=[EI])/g, 'S')
             .replace(/G(?=[EI])/g, 'J')
             .replace(/C/g, 'K').replace(/Q/g, 'K')
             .replace(/Y/g, 'I').replace(/W/g, 'V')
             .replace(/H/g, '')
             .replace(/OU/g, 'O');               // "vou" soa "vo", "cenoura" ~ "cenora"
        // S entre vogais soa Z; SS soa S
        let out = '';
        for (let i = 0; i < w.length; i++) {
            const c = w[i];
            if (c === 'S' && w[i + 1] === 'S') { out += 'S'; i++; continue; }
            if (c === 'S' && isV(w[i - 1]) && isV(w[i + 1])) { out += 'Z'; continue; }
            out += c;
        }
        w = out
            .replace(/Z$/, 'S')
            .replace(/L(?=[^AEIOU]|$)/g, 'U')     // "sol" ~ "sou", "papel" ~ "papeu"
            .replace(/AM$/, 'AO').replace(/M$/, 'N').replace(/M(?=[^AEIOU])/g, 'N')
            .replace(/E(S?)$/, 'I$1')            // "leite" ~ "leiti"
            .replace(/O(S?)$/, 'U$1');           // "gato" ~ "gatu"
        // letras repetidas viram uma (RR, SS, OO...)
        return w.replace(/(.)\1+/g, '$1');
    }

    // Sons que criancas (e o reconhecedor) costumam trocar: custam meia troca
    const SIMILAR = ['PB', 'TD', 'KG', 'FV', 'SZ', 'XJ', 'BV', 'RL', 'MN', 'EI', 'OU', 'SX'];
    function subCost(a, b) {
        if (a === b) return 0;
        return SIMILAR.some(p => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a)) ? 0.5 : 1;
    }

    // Distancia de edicao com peso (troca de som parecido = 0,5)
    function distance(a, b) {
        const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
        for (let j = 1; j <= b.length; j++) dp[0][j] = j;
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1,
                    dp[i - 1][j - 1] + subCost(a[i - 1], b[j - 1])
                );
            }
        }
        return dp[a.length][b.length];
    }

    // Quanto de diferenca aceitar no modo tolerante, pelo tamanho da palavra
    function tolerance(len) {
        if (len <= 3) return 0.5;      // LUA, UVA: so um som parecido
        if (len <= 5) return 1;
        if (len <= 8) return 1.5;
        return 2;
    }

    const ARTICLES = ['A', 'O', 'UM', 'UMA', 'AS', 'OS', 'E', 'DA', 'DO'];

    // Pedacos de fala candidatos: cada palavra, e grupos de palavras seguidas
    // juntadas ("bo la" -> "BOLA", "ca mi nhao" -> "CAMINHAO")
    function candidates(toks) {
        const out = [];
        for (let i = 0; i < toks.length; i++) {
            let joined = '';
            for (let j = i; j < Math.min(toks.length, i + 5); j++) {
                joined += toks[j];
                out.push({ text: joined, parts: j - i + 1 });
            }
        }
        return out;
    }

    function matches(target, transcript, opts) {
        opts = opts || {};
        const isKnown = opts.isKnown || (() => false);
        const t = semAcento(target).replace(/[^A-Z]/g, '');
        const tk = key(t);
        const toks = tokens(transcript);
        if (!toks.length || !t) return false;
        // Outra palavra do jogo nunca vale (MENINO x MENINA, PATO x GATO...)
        const otherWord = c => c !== t && isKnown(c);

        for (const c of candidates(toks)) {
            if (c.text === t) return true;
            if (otherWord(c.text)) continue;
            const ck = key(c.text);
            // Mesmo som, grafia diferente: "kasa", "caza", "bolla", "leiti"
            if (ck === tk) return true;
            // Plural: "bolas", "gatos"
            if (c.text === t + 'S' || ck === tk + 'S') return true;
            // Artigo grudado pelo reconhecedor: "abola", "umgato" (SAPATO nao vale para PATO:
            // so artigos, e nunca se o resultado for outra palavra do jogo)
            if (c.parts === 1 && ARTICLES.some(p => c.text === p + t || ck === key(p) + tk)) return true;
            if (opts.lenient && tk.length >= 3) {
                // Comparacao pelo som com tolerancia proporcional ao tamanho.
                // O FIM tem que bater: palavra cortada antes do fim ("sai" para SAIA,
                // "tar ta ru" para TARTARUGA) e leitura ainda pela metade, nao acerto.
                const base = ck.length > tk.length && ck.endsWith('S') ? ck.slice(0, -1) : ck;
                const endOk = base.length >= tk.length - 1 && subCost(base[base.length - 1], tk[tk.length - 1]) < 1 && !tk.startsWith(base);
                if (endOk && distance(base, tk) <= tolerance(tk.length)) return true;
            }
        }
        return false;
    }

    // A fala e so o comeco da palavra? ("ca" ou "ca mi" para CAMINHAO)
    // Serve para nao dar "erro" enquanto a crianca ainda esta lendo silaba por silaba.
    function isPartial(target, transcript, syllables) {
        const toks = tokens(transcript);
        if (!toks.length) return false;
        const tk = key(target);
        const said = key(toks.join(''));
        if (!said || said.length >= tk.length) return false;
        if (tk.startsWith(said)) return true;
        // Comeca com a(s) primeira(s) silaba(s), com um som parecido
        if (syllables && syllables.length > 1) {
            let prefix = '';
            for (let i = 0; i < syllables.length - 1; i++) {
                prefix += syllables[i];
                const pk = key(prefix);
                if (Math.abs(pk.length - said.length) <= 1 && distance(said, pk) <= 0.5) return true;
            }
        }
        return false;
    }

    // Sons soltos que nao sao leitura ("ah", "hum", "é"): nao contam como erro
    const FILLERS = new Set(['A', 'E', 'O', 'AH', 'EH', 'OH', 'HUM', 'HM', 'UM', 'AN', 'EM', 'UH', 'HA', 'HE', 'AI', 'EI', 'OI', 'NE', 'TA']);
    function isFiller(transcript) {
        const toks = tokens(transcript);
        return toks.length > 0 && toks.every(t => FILLERS.has(t));
    }

    const api = { semAcento, tokens, key, distance, matches, isPartial, isFiller };
    root.FalaMatch = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
