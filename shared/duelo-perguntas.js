// ==========================================
// Gerador de perguntas para os duelos, por nivel:
//  facil   = 5 anos (contar, figura igual, qual tem mais, letra do comeco)
//  medio   = 1º/2º ano (somas e subtracoes ate 20, dobro, sequencias)
//  dificil = 4º ano (tabuada, divisao, contas de 2-3 algarismos, numero que falta,
//            fracao de quantidade, problemas curtos)
// Cada pergunta: { prompt (html), speak (texto falado), options:[{html, value}], answer, explain, big }
// visualOnly: true = sem precisar de voz/leitura (usado quando as duas jogam ao mesmo tempo)
// ==========================================
(function () {
    const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
        return a;
    }
    const EMOJIS = ['🍎', '⭐', '🐶', '🐱', '🌸', '🚗', '🎈', '🦋', '🍓', '🐟', '⚽', '🧁', '🐸', '🌙', '🍌', '🐥'];

    // Opcoes numericas: resposta + vizinhas diferentes e positivas
    function numOptions(answer, count, spread) {
        const set = new Set([answer]);
        const deltas = shuffle([1, -1, 2, -2, spread || 10, -(spread || 10), 3, -3, 5, -5]);
        for (const d of deltas) { if (set.size >= count) break; const v = answer + d; if (v >= 0) set.add(v); }
        let k = 4; while (set.size < count) set.add(answer + k++);
        return shuffle([...set]).map(v => ({ html: String(v), value: String(v) }));
    }

    function emojiGroup(e, n) {
        return `<span class="q-group">${Array.from({ length: n }, () => `<span>${e}</span>`).join('')}</span>`;
    }

    // ---------- FACIL (5 anos) ----------
    const FACIL = {
        contar() {
            const n = rnd(1, 9), e = pick(EMOJIS);
            return { prompt: `<div class="q-title">Quantos tem?</div>${emojiGroup(e, n)}`, speak: 'Quantos tem?',
                options: numOptions(n, 3, 2), answer: String(n), big: true, explain: `Tem ${n}!` };
        },
        igual() {
            const [t, ...rest] = shuffle(EMOJIS);
            const opts = shuffle([t, rest[0], rest[1]]);
            return { prompt: `<div class="q-title">Ache a figura igual:</div><div class="q-big">${t}</div>`, speak: 'Ache a figura igual!',
                options: opts.map(e => ({ html: e, value: e })), answer: t, big: true, explain: 'Achou!' };
        },
        mais() {
            const e = pick(EMOJIS);
            let a = rnd(1, 7), b = rnd(1, 7);
            while (a === b) b = rnd(1, 7);
            return { prompt: `<div class="q-title">Qual tem MAIS?</div>`, speak: 'Qual tem mais?',
                options: [{ html: emojiGroup(e, a), value: 'a' }, { html: emojiGroup(e, b), value: 'b' }],
                answer: a > b ? 'a' : 'b', big: true, wide: true, explain: `${Math.max(a, b)} é mais que ${Math.min(a, b)}.` };
        },
        letra() {
            if (!window.getPalavras) return FACIL.contar();
            const w = pick(getPalavras(2).concat(getPalavras(3)).filter(x => !/^[HXQKWY]/.test(semAcento(x.word))));
            const L = semAcento(w.word)[0];
            const others = shuffle('ABCDEFGJLMNOPRSTUV'.split('').filter(x => x !== L)).slice(0, 2);
            return { prompt: `<div class="q-title">Com que letra começa?</div><div class="q-big">${w.emoji}</div><div class="q-word"><b class="q-gap">?</b>${w.word.slice(1)}</div>`,
                speak: `Com que letra começa ${w.word.toLowerCase()}?`,
                options: shuffle([L, ...others]).map(x => ({ html: x, value: x })), answer: L, big: true,
                explain: `${w.word} começa com ${L}.` };
        }
    };

    // ---------- MEDIO (1º/2º ano) ----------
    const MEDIO = {
        soma() { const a = rnd(2, 12), b = rnd(1, 9); return calc(`${a} + ${b}`, a + b, `${a} + ${b} = ${a + b}`); },
        sub() { const a = rnd(6, 20), b = rnd(1, a - 1); return calc(`${a} − ${b}`, a - b, `${a} − ${b} = ${a - b}`); },
        dobro() { const a = rnd(2, 10); return calc(`O dobro de ${a}`, a * 2, `Dobro = ${a} + ${a} = ${a * 2}`); },
        seq() {
            const s = pick([2, 5, 10]), a = rnd(0, 5) * s;
            const seq = [a, a + s, a + 2 * s, a + 3 * s];
            return { prompt: `<div class="q-title">Qual vem depois?</div><div class="q-calc">${seq.join(', ')}, ?</div>`, speak: 'Qual número vem depois?',
                options: numOptions(a + 4 * s, 4, s), answer: String(a + 4 * s), explain: `Vai de ${s} em ${s}: ${a + 3 * s} + ${s} = ${a + 4 * s}.` };
        },
        contar() {
            const n = rnd(8, 15), e = pick(EMOJIS);
            return { prompt: `<div class="q-title">Quantos tem?</div>${emojiGroup(e, n)}`, speak: 'Quantos tem?',
                options: numOptions(n, 4, 2), answer: String(n), explain: `Tem ${n}. Dica: conte de 2 em 2!` };
        }
    };

    function calc(expr, ans, explain) {
        return { prompt: `<div class="q-calc">${expr} = ?</div>`, speak: expr.replace('−', 'menos').replace('×', 'vezes').replace('÷', 'dividido por') + ' é igual a quanto?',
            options: numOptions(ans, 4, 10), answer: String(ans), explain };
    }

    // ---------- DIFICIL (4º ano) ----------
    const NOMES = ['Ana', 'Pedro', 'Bia', 'Caio', 'Marina', 'Theo'];
    const DIFICIL = {
        tabuada() { const a = rnd(3, 10), b = rnd(3, 10); return calc(`${a} × ${b}`, a * b, `${a} × ${b} = ${a * b}`); },
        divisao() { const b = rnd(2, 9), q = rnd(3, 10); return calc(`${b * q} ÷ ${b}`, q, `${b * q} ÷ ${b} = ${q}, porque ${q} × ${b} = ${b * q}`); },
        soma() { const a = rnd(25, 89), b = rnd(15, 79); return calc(`${a} + ${b}`, a + b, `${a} + ${b} = ${a + b}`); },
        sub() { const a = rnd(100, 300), b = rnd(20, 99); return calc(`${a} − ${b}`, a - b, `${a} − ${b} = ${a - b}`); },
        falta() {
            const a = rnd(3, 9), b = rnd(3, 9);
            return { prompt: `<div class="q-title">Qual número falta?</div><div class="q-calc"><b class="q-gap">?</b> × ${b} = ${a * b}</div>`, speak: 'Qual número falta?',
                options: numOptions(a, 4, 2), answer: String(a), explain: `${a * b} ÷ ${b} = ${a}` };
        },
        metade() { const a = rnd(10, 90) * 2; return calc(`A metade de ${a}`, a / 2, `${a} ÷ 2 = ${a / 2}`); },
        fracao() {
            const d = pick([2, 3, 4, 5]), q = rnd(2, 9), t = d * q;
            return calc(`1/${d} de ${t}`, q, `1/${d} de ${t} = ${t} ÷ ${d} = ${q}`);
        },
        problema() {
            const n = pick(NOMES), cada = rnd(3, 9), grupos = rnd(3, 8);
            const t = pick([
                [`${n} tem ${grupos} caixas com ${cada} lápis em cada uma. Quantos lápis ao todo?`, grupos * cada, `${grupos} × ${cada} = ${grupos * cada}`],
                [`${grupos * cada} balas foram divididas igualmente entre ${grupos} crianças. Quantas para cada uma?`, cada, `${grupos * cada} ÷ ${grupos} = ${cada}`],
                [`${n} tinha ${grupos * 10 + cada} figurinhas e deu ${cada + 5}. Com quantas ficou?`, grupos * 10 + cada - cada - 5, `${grupos * 10 + cada} − ${cada + 5} = ${grupos * 10 - 5}`]
            ]);
            return { prompt: `<div class="q-text">${t[0]}</div>`, speak: t[0], options: numOptions(t[1], 4, 10), answer: String(t[1]), explain: t[2] };
        }
    };

    const BANKS = { facil: FACIL, medio: MEDIO, dificil: DIFICIL };

    function generate(level, opts) {
        opts = opts || {};
        const bank = BANKS[level] || FACIL;
        let types = Object.keys(bank);
        if (opts.visualOnly && level === 'facil') types = types.filter(t => t !== 'letra');
        if (opts.visualOnly && level === 'dificil') types = types.filter(t => t !== 'problema');
        const q = bank[pick(types)]();
        q.level = level;
        return q;
    }

    // Desenha a pergunta em "box" e chama onAnswer(acertou, botao) ao tocar numa opcao.
    // Com retry=true, um erro desativa so aquela opcao e deixa tentar de novo.
    function render(box, q, onAnswer, opts) {
        opts = opts || {};
        box.innerHTML = (opts.hearButton ? '<button class="hear" type="button">🔊 Ouvir</button>' : '') +
            `<div class="q-prompt">${q.prompt}</div>` +
            `<div class="q-options ${q.options.length === 3 ? 'three' : ''} ${q.wide ? 'wide' : ''}"></div>` +
            '<div class="q-feedback"></div>';
        const hear = box.querySelector('.hear');
        if (hear) hear.onclick = () => window.KidsAudio && KidsAudio.speak(q.speak, { rate: 0.85 });
        const list = box.querySelector('.q-options');
        let done = false;
        q.options.forEach(o => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'q-opt' + (q.big ? ' big' : '');
            b.innerHTML = o.html;
            b.onclick = () => {
                if (done || b.disabled) return;
                const ok = o.value === q.answer;
                if (ok || !opts.retry) {
                    done = true;
                    list.querySelectorAll('.q-opt').forEach(x => { x.disabled = true; });
                }
                b.classList.add(ok ? 'right' : 'wrong');
                if (!ok && opts.retry) b.disabled = true;
                if (!ok && !opts.retry) {
                    const right = [...list.children][q.options.findIndex(x => x.value === q.answer)];
                    if (right) right.classList.add('right');
                }
                onAnswer(ok, b);
            };
            list.appendChild(b);
        });
    }

    function feedback(box, text, kind) {
        const f = box.querySelector('.q-feedback');
        if (f) { f.textContent = text; f.className = 'q-feedback ' + (kind || ''); }
    }

    window.DueloPerguntas = { generate, render, feedback };
})();
