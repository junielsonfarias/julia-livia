// ==========================================
// Detetive das Questoes - Julia (4º ano)
// Treina a LER O ENUNCIADO e entender exatamente o que se pede.
// Matematica: 4 passos (o que pede -> dados -> conta -> resposta)
// Portugues: ler, entender a pergunta, responder e PROVAR no texto.
// ==========================================

const STATS_KEY = 'detetive_stats_v1';
const MATH_PER_ROUND = 6;
const TEXTS_PER_ROUND = 2;

const MATH_STEPS = [
    { skill: 'Entender o que a pergunta pede', title: '1. O que a pergunta quer saber?',
      help: 'Leia o problema até o fim. A pergunta normalmente está na última frase.',
      hint: 'Releia a ÚLTIMA frase (a que termina com “?”). É ela que diz o que você precisa descobrir.' },
    { skill: 'Separar os dados importantes', title: '2. Quais informações você vai usar?',
      help: 'Toque nos números que ajudam a responder. Cuidado: às vezes aparece um número “pegadinha” que não serve para nada!',
      hint: '' },
    { skill: 'Escolher a operação', title: '3. Qual conta resolve o problema?',
      help: 'Pense no que acontece na história: junta, tira, repete grupos iguais ou reparte?',
      hint: 'Palavras-pista: juntar/ganhar/ao todo → +   ·   tirar/sobrou/falta/a mais → −   ·   cada/grupos iguais/vezes → ×   ·   repartir igualmente/quantas vezes cabe → ÷' },
    { skill: 'Calcular e conferir a resposta', title: '4. Qual é a resposta?',
      help: 'Faça a conta com calma (pode usar papel!) e confira se a resposta faz sentido.',
      hint: 'Refaça a conta no papel e confira a unidade da resposta (figurinhas, reais, horas...).' }
];

const state = {
    mode: 'matematica',
    queue: [],
    index: 0,
    score: 0,
    session: {},          // { skill: {ok, total} } desta partida
    // matematica
    problem: null, step: 0, tries: 0, tokens: [], selected: new Set(),
    // portugues
    text: null, qi: 0, phase: 'answer', proveTries: 0, lastWrongProve: -1,
    gen: 0,               // muda a cada item: timeouts de um item antigo sao ignorados
    lastCheck: ''         // selecao da ultima conferencia errada (evita gastar 2 tentativas com toque duplo)
};

// ---------- Utilidades ----------
function goBack() {
    if (window.parent !== window) {
        try { if (window.parent.closeGameModal) { window.parent.closeGameModal(); return; } } catch (e) {}
    }
    if (window.history.length > 1) window.history.back();
    else window.location.href = '../index.html';
}

function showScreen(id) {
    if (id === 'start-screen' || id === 'report-screen') {
        state.gen++;   // cancela timeouts pendentes
        if (KidsAudio.stop) KidsAudio.stop();
    }
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// setTimeout que so executa se o jogador ainda estiver no mesmo item
function later(fn, ms) {
    const g = state.gen;
    setTimeout(() => { if (g === state.gen) fn(); }, ms);
}

function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function esc(s) {
    return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

const KW_RE = (() => {
    const words = [...new Set(window.PALAVRAS_CHAVE.map(w => w.toLowerCase()))]
        .sort((a, b) => b.length - a.length)
        .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp(`(^|[^\\p{L}])(${words.join('|')})(?=[^\\p{L}]|$)`, 'giu');
})();

function highlight(plain) {
    const html = esc(plain);
    if (!document.getElementById('opt-keywords').checked) return html;
    return html.replace(KW_RE, '$1<mark class="kw">$2</mark>');
}

function addPoints(n) {
    state.score += n;
    document.getElementById('score').textContent = state.score;
}

function record(skill, okFirstTry) {
    const s = state.session[skill] || (state.session[skill] = { ok: 0, total: 0 });
    s.total++; if (okFirstTry) s.ok++;
    const all = loadStats();
    const a = all[skill] || (all[skill] = { ok: 0, total: 0 });
    a.total++; if (okFirstTry) a.ok++;
    saveStats(all);
}

function loadStats() { try { return JSON.parse(localStorage.getItem(STATS_KEY)) || {}; } catch (e) { return {}; } }
function saveStats(s) { try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch (e) {} }

function setFeedback(id, html, kind) {
    const el = document.getElementById(id);
    el.innerHTML = html;
    el.className = 'feedback' + (kind ? ' ' + kind : '');
}

function shake(el) {
    el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
}

function updateProgress() {
    const item = state.queue[state.index];
    if (!item) return;
    const total = state.queue.length;
    document.getElementById('progress-label').innerHTML =
        `${item.kind === 'math' ? 'Problema' : 'Pergunta'}: <strong>${state.index + 1}</strong>/${total}`;
}

// ---------- Inicio ----------
function startGame(mode) {
    state.mode = mode;
    state.score = 0;
    state.session = {};
    state.index = 0;
    addPoints(0);

    const mathItems = (n) => shuffle(window.PROBLEMAS).slice(0, n).map(p => ({ kind: 'math', p }));
    const textItems = (n) => shuffle(window.TEXTOS).slice(0, n)
        .flatMap(t => t.perguntas.map((_, qi) => ({ kind: 'text', t, qi })));

    if (mode === 'matematica') state.queue = mathItems(MATH_PER_ROUND);
    else if (mode === 'portugues') state.queue = textItems(TEXTS_PER_ROUND);
    else {
        const m = mathItems(4);
        state.queue = [m[0], m[1], ...textItems(1), m[2], m[3]];
    }
    KidsAudio.play('start');
    if (window.Letrinhas) Letrinhas.serie.zerar();
    showItem();
}

function showItem() {
    const item = state.queue[state.index];
    if (!item) return finish();
    updateProgress();
    if (item.kind === 'math') startProblem(item.p);
    else startTextQuestion(item.t, item.qi);
}

function nextItem() {
    if (KidsAudio.stop) KidsAudio.stop();   // para a leitura em voz alta do item anterior
    document.getElementById('math-next').hidden = true;   // evita toque duplo durante a troca
    document.getElementById('text-next').hidden = true;
    state.index++;
    const panel = document.querySelector('.screen.active .panel');
    const item = state.queue[state.index];
    // Mesmo texto (proxima pergunta): so a caixa da pergunta desliza; item novo: o painel todo
    const sameText = item && item.kind === 'text' && item.t === state.text && document.getElementById('text-screen').classList.contains('active');
    const el = sameText ? document.querySelector('.question-box') : panel;
    if (window.Letrinhas && el && item) Letrinhas.trocar(el, showItem);
    else showItem();
}

// ==========================================
// MATEMATICA
// ==========================================
function parseProblem(texto) {
    // Divide em pedacos de texto e tokens {numero}
    const parts = [];
    const re = /\{(~?)([^}]+)\}/g;
    let last = 0, m, ti = 0;
    while ((m = re.exec(texto))) {
        if (m.index > last) parts.push({ type: 'text', value: texto.slice(last, m.index) });
        parts.push({ type: 'token', value: m[2], needed: m[1] !== '~', id: ti++ });
        last = re.lastIndex;
    }
    if (last < texto.length) parts.push({ type: 'text', value: texto.slice(last) });
    return parts;
}

function plainProblem(texto) {
    return texto.replace(/\{~?([^}]+)\}/g, '$1');
}

function startProblem(p) {
    state.gen++;
    state.problem = p;
    state.tokens = parseProblem(p.texto);
    state.selected = new Set();
    state.step = 0;
    state.lastCheck = '';
    document.getElementById('math-theme').textContent = '🔢 ' + p.tema;
    document.getElementById('math-next').hidden = true;
    showScreen('math-screen');
    renderProblemText();
    renderStep();
}

// Posicao (no texto puro, sem chaves) onde comeca a pergunta = ultima frase terminada em "?".
// Calculada sobre os pedacos de TEXTO (e nao sobre o innerHTML), para nunca cortar uma tag ao meio.
function questionStart(parts) {
    const plain = parts.map(p => p.value).join('');
    const t = plain.trimEnd();
    if (!t.endsWith('?')) return -1;
    const body = t.slice(0, -1);
    const cut = Math.max(body.lastIndexOf('. '), body.lastIndexOf('! '), body.lastIndexOf('? '));
    return cut >= 0 ? cut + 2 : 0;
}

function renderProblemText() {
    const box = document.getElementById('problem-text');
    const step = state.step;
    // Depois do passo 1, sublinha a pergunta (ultima frase com "?")
    const qs = step >= 1 ? questionStart(state.tokens) : -1;
    let offset = 0, opened = false;
    const open = () => { opened = true; return '<span class="the-question">'; };
    const html = state.tokens.map(part => {
        const start = offset;
        offset += part.value.length;
        if (part.type === 'text') {
            if (qs >= 0 && !opened && qs >= start && qs < offset) {
                const cut = qs - start;
                return highlight(part.value.slice(0, cut)) + open() + highlight(part.value.slice(cut));
            }
            return highlight(part.value);
        }
        let cls = 'num';
        if (step === 1) cls += ' pick' + (state.selected.has(part.id) ? ' selected' : '');
        if (step > 1) cls += part.needed ? ' needed' : ' trap';
        const attr = step === 1 ? ` role="button" tabindex="0" data-id="${part.id}"` : '';
        const pre = (qs >= 0 && !opened && qs <= start) ? open() : '';
        return `${pre}<span class="${cls}"${attr}>${esc(part.value)}</span>`;
    }).join('') + (opened ? '</span>' : '');
    box.innerHTML = html;

    if (step === 1) {
        box.querySelectorAll('.pick').forEach(el => {
            const toggle = () => {
                if (state.locked || state.step !== 1) return;
                const id = Number(el.dataset.id);
                if (state.selected.has(id)) state.selected.delete(id); else state.selected.add(id);
                el.classList.toggle('selected');
                KidsAudio.play('click');
            };
            el.addEventListener('click', toggle);
            el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
        });
    }
}

function renderStep() {
    const s = MATH_STEPS[state.step];
    state.tries = 0;
    state.locked = false;
    document.querySelectorAll('#stepper .step').forEach((el, i) => {
        el.classList.toggle('current', i === state.step);
        el.classList.toggle('done', i < state.step);
    });
    document.getElementById('step-title').textContent = s.title;
    document.getElementById('step-help').textContent = s.help;
    setFeedback('math-feedback', '');
    const opts = document.getElementById('math-options');
    opts.innerHTML = '';
    document.getElementById('check-data-btn').hidden = state.step !== 1;

    const p = state.problem;
    const lists = [p.pede, null, p.conta, p.resposta];
    const list = lists[state.step];
    if (!list) return;
    shuffle(list.map((text, i) => ({ text, ok: i === 0 }))).forEach(o => {
        const b = document.createElement('button');
        b.className = 'option';
        b.textContent = o.text;
        b.onclick = () => answerMath(b, o.ok);
        opts.appendChild(b);
    });
}

function answerMath(btn, ok) {
    if (btn.disabled) return;
    const s = MATH_STEPS[state.step];
    state.tries++;
    if (ok) {
        btn.classList.add('correct');
        lockOptions('math-options');
        record(s.skill, state.tries === 1);
        addPoints(state.tries === 1 ? 5 : 2);
        KidsAudio.play('correct');
        if (window.Letrinhas) Letrinhas.serie.acerto(btn, { texto: state.tries === 1 ? '+5' : '+2' });
        setFeedback('math-feedback', state.tries === 1 ? '✅ Isso mesmo!' : '✅ Agora sim!', 'good');
        later(advanceMathStep, 900);
    } else {
        btn.classList.add('wrong');
        btn.disabled = true;
        shake(btn);
        KidsAudio.play('wrong');
        if (window.Letrinhas) Letrinhas.serie.erro();
        if (window.Efeitos) Efeitos.vibrar('erro');
        if (state.tries >= 2) {
            record(s.skill, false);
            const correctBtn = [...document.querySelectorAll('#math-options .option')]
                .find(b => b.textContent === (state.step === 0 ? state.problem.pede[0] : state.step === 2 ? state.problem.conta[0] : state.problem.resposta[0]));
            if (correctBtn) correctBtn.classList.add('correct', 'revealed');
            lockOptions('math-options');
            setFeedback('math-feedback', `A resposta certa está em verde. 💡 ${esc(s.hint || state.problem.dica)}`, 'bad');
            later(advanceMathStep, 2600);
        } else {
            setFeedback('math-feedback', `🤔 Ainda não. ${esc(s.hint)}`, 'bad');
        }
    }
}

function checkData() {
    const s = MATH_STEPS[1];
    const tokens = state.tokens.filter(t => t.type === 'token');
    const needed = tokens.filter(t => t.needed).map(t => t.id);
    const traps = tokens.filter(t => !t.needed && state.selected.has(t.id));
    const missing = needed.filter(id => !state.selected.has(id));
    if (state.locked) return;
    // Nada marcado, ou a mesma selecao que ja foi conferida (toque duplo): nao gasta tentativa
    const sig = [...state.selected].sort((a, b) => a - b).join(',');
    if (!state.selected.size) {
        setFeedback('math-feedback', '👆 Toque primeiro nos números que você vai usar.', 'bad');
        return;
    }
    if (sig === state.lastCheck) {
        setFeedback('math-feedback', '✋ Mude sua escolha antes de conferir de novo.', 'bad');
        return;
    }
    state.tries++;

    if (traps.length === 0 && missing.length === 0) {
        state.locked = true;
        record(s.skill, state.tries === 1);
        addPoints(state.tries === 1 ? 5 : 2);
        KidsAudio.play('correct');
        if (window.Letrinhas) Letrinhas.serie.acerto(document.getElementById('problem-text'), { texto: state.tries === 1 ? '+5' : '+2' });
        setFeedback('math-feedback', '✅ Ótimo! Você separou só o que importa.', 'good');
        document.getElementById('check-data-btn').hidden = true;
        later(advanceMathStep, 1000);
        return;
    }

    KidsAudio.play('wrong');
    if (window.Letrinhas) Letrinhas.serie.erro();
    let msg = '';
    if (traps.length) msg += `🪤 Pegadinha! “${esc(traps[0].value)}” não ajuda a responder a pergunta. `;
    if (missing.length) msg += `🔍 Falta marcar ${missing.length === 1 ? 'um número importante' : missing.length + ' números importantes'}. `;

    state.lastCheck = sig;
    if (state.tries >= 2) {
        state.locked = true;
        record(s.skill, false);
        state.selected = new Set(needed);
        document.getElementById('check-data-btn').hidden = true;
        setFeedback('math-feedback', msg + '<br>Veja em verde os dados certos e riscados os que não servem.', 'bad');
        state.step = 2; // mostra o resultado no texto
        renderProblemText();
        state.step = 1;
        later(advanceMathStep, 2800);
    } else {
        setFeedback('math-feedback', msg + 'Tente de novo!', 'bad');
        shake(document.getElementById('problem-text'));
    }
}

function lockOptions(id) {
    document.querySelectorAll('#' + id + ' .option').forEach(b => { b.disabled = true; });
}

function advanceMathStep() {
    state.step++;
    renderProblemText();
    if (state.step < MATH_STEPS.length) {
        if (window.Letrinhas) Letrinhas.trocar(document.querySelector('.step-box'), renderStep);
        else renderStep();
        return;
    }
    // Problema resolvido
    document.querySelectorAll('#stepper .step').forEach(el => { el.classList.remove('current'); el.classList.add('done'); });
    document.getElementById('step-title').textContent = '🎉 Caso resolvido!';
    document.getElementById('step-help').textContent = '';
    document.getElementById('math-options').innerHTML = '';
    setFeedback('math-feedback', `💡 <b>Por que é assim?</b> ${esc(state.problem.dica)}`, 'explain');
    if (window.Efeitos) Efeitos.estrelas(document.getElementById('step-title'), { quantidade: 18, emoji: ['🔎', '⭐'] });
    document.getElementById('math-next').hidden = false;
    document.getElementById('math-next').textContent =
        state.index + 1 >= state.queue.length ? 'Ver resultado 🏆' : 'Próximo ➜';
}

function nextMathProblem() { nextItem(); }

// ==========================================
// PORTUGUES
// ==========================================
function startTextQuestion(t, qi) {
    const isNewText = state.text !== t || qi === 0;
    state.text = t;
    state.qi = qi;
    state.phase = 'answer';
    state.tries = 0;
    state.proveTries = 0;
    state.lastWrongProve = -1;
    state.gen++;
    const q = t.perguntas[qi];

    const redraw = isNewText || !document.getElementById('text-screen').classList.contains('active');
    if (redraw) {
        document.getElementById('text-genre').textContent = '📖 ' + t.genero;
        document.getElementById('text-title').textContent = t.titulo;
        const body = document.getElementById('text-body');
        const isVerse = t.genero === 'Poema';
        // Generos "em linhas" (bilhete, e-mail, regra, tirinha...) ficam uma frase por linha
        const byLine = isVerse || /Bilhete|E-mail|Regra|Tirinha|Convite|Receita/.test(t.genero);
        body.classList.toggle('verse', isVerse);
        body.innerHTML = t.frases.map((f, i) =>
            `<span class="sentence" data-i="${i}">${esc(f)}</span>`).join(byLine ? '<br>' : ' ');
        body.querySelectorAll('.sentence').forEach(el => el.addEventListener('click', () => proveSentence(el)));
        showScreen('text-screen');
    }
    document.querySelectorAll('#text-body .sentence').forEach(el => el.classList.remove('evidence', 'wrong-evidence', 'clickable'));

    document.getElementById('qtype').textContent = q.tipo;
    document.getElementById('question').innerHTML = highlight(q.q);
    document.getElementById('text-options').innerHTML = '';
    document.getElementById('show-options-btn').hidden = false;
    document.getElementById('text-next').hidden = true;
    setFeedback('text-feedback', '');
    // Texto novo: showScreen ja levou ao topo (para ler o texto primeiro). Mesma historia: vai para a pergunta.
    if (!redraw) document.querySelector('.question-box').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function revealOptions() {
    document.getElementById('show-options-btn').hidden = true;
    const q = state.text.perguntas[state.qi];
    const letters = ['A', 'B', 'C', 'D'];
    const box = document.getElementById('text-options');
    box.innerHTML = '';
    shuffle(q.op.map((text, i) => ({ text, ok: i === 0 }))).forEach((o, i) => {
        const b = document.createElement('button');
        b.className = 'option';
        b.dataset.ok = o.ok ? '1' : '0';
        b.innerHTML = `<span class="letter">${letters[i]}</span>${esc(o.text)}`;
        b.onclick = () => answerText(b, o.ok);
        box.appendChild(b);
    });
    KidsAudio.play('click');
}

function answerText(btn, ok) {
    if (btn.disabled || state.phase !== 'answer') return;
    const q = state.text.perguntas[state.qi];
    state.tries++;
    if (ok) {
        btn.classList.add('correct');
        lockOptions('text-options');
        record(q.tipo, state.tries === 1);
        addPoints(state.tries === 1 ? 10 : 5);
        KidsAudio.play('correct');
        if (window.Letrinhas) Letrinhas.serie.acerto(btn, { texto: state.tries === 1 ? '+10' : '+5' });
        if (q.prova !== null && q.prova !== undefined) {
            state.phase = 'prove';
            setFeedback('text-feedback', '✅ Correto! <b>🔎 Agora prove:</b> toque na frase do texto que mostra a resposta.', 'good');
            document.querySelectorAll('#text-body .sentence').forEach(el => el.classList.add('clickable'));
            document.getElementById('text-body').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            finishTextQuestion(true);
        }
    } else {
        btn.classList.add('wrong');
        btn.disabled = true;
        shake(btn);
        KidsAudio.play('wrong');
        if (window.Letrinhas) Letrinhas.serie.erro();
        if (window.Efeitos) Efeitos.vibrar('erro');
        if (state.tries >= 2) {
            record(q.tipo, false);
            const right = document.querySelector('#text-options .option[data-ok="1"]');
            if (right) right.classList.add('correct', 'revealed');
            lockOptions('text-options');
            if (q.prova !== null && q.prova !== undefined) {
                document.querySelector(`#text-body .sentence[data-i="${q.prova}"]`).classList.add('evidence');
            }
            finishTextQuestion(false);
        } else {
            setFeedback('text-feedback', `🤔 Releia com atenção. <b>Pista:</b> ${esc(q.dica)}`, 'bad');
        }
    }
}

function proveSentence(el) {
    if (state.phase !== 'prove') return;
    const q = state.text.perguntas[state.qi];
    const i = Number(el.dataset.i);
    if (i === state.lastWrongProve) return;   // toque duplo na mesma frase errada nao gasta a 2ª chance
    state.proveTries++;
    if (i === q.prova) {
        el.classList.add('evidence');
        record('Provar a resposta no texto', state.proveTries === 1);
        addPoints(state.proveTries === 1 ? 5 : 2);
        KidsAudio.play('star');
        if (window.Letrinhas) Letrinhas.serie.acerto(el, { emoji: ['🔎', '⭐'], texto: 'Prova!' });
        finishTextQuestion(true, true);
    } else {
        state.lastWrongProve = i;
        el.classList.add('wrong-evidence');
        shake(el);
        KidsAudio.play('wrong');
        setTimeout(() => el.classList.remove('wrong-evidence'), 700);
        if (state.proveTries >= 2) {
            record('Provar a resposta no texto', false);
            document.querySelector(`#text-body .sentence[data-i="${q.prova}"]`).classList.add('evidence');
            finishTextQuestion(true, false);
        } else {
            setFeedback('text-feedback', '🔍 Essa frase não comprova a resposta. Procure outra!', 'bad');
        }
    }
}

function finishTextQuestion(answeredRight, proved) {
    const q = state.text.perguntas[state.qi];
    state.phase = 'done';
    document.querySelectorAll('#text-body .sentence').forEach(el => el.classList.remove('clickable'));
    let head = answeredRight ? (proved ? '🕵️ Prova encontrada! ' : '✅ ') : 'A resposta certa está em verde. ';
    if (proved === false) head = '✅ Resposta certa! A prova está marcada em amarelo. ';
    setFeedback('text-feedback', `${head}<br>💡 <b>Por quê?</b> ${esc(q.dica)}`, 'explain');
    const next = document.getElementById('text-next');
    next.hidden = false;
    next.textContent = state.index + 1 >= state.queue.length ? 'Ver resultado 🏆' : 'Próxima ➜';
}

function nextTextQuestion() { nextItem(); }

// ---------- Leitura em voz alta ----------
function readAloud(kind) {
    if (kind === 'math' && state.problem) {
        KidsAudio.speak(plainProblem(state.problem.texto), { rate: 0.9, pitch: 1 });
    } else if (state.text) {
        const q = state.text.perguntas[state.qi];
        KidsAudio.speak(state.text.titulo + '. ' + state.text.frases.join(' ') + ' ... Pergunta: ' + q.q, { rate: 0.9, pitch: 1 });
    }
}

// ---------- Resultado ----------
function renderSkills(boxId, stats) {
    const box = document.getElementById(boxId);
    const entries = Object.entries(stats).sort((a, b) => (a[1].ok / a[1].total) - (b[1].ok / b[1].total));
    if (!entries.length) { box.innerHTML = '<p class="empty">Jogue uma partida para ver seu progresso.</p>'; return; }
    box.innerHTML = entries.map(([skill, s]) => {
        const pct = Math.round(100 * s.ok / s.total);
        const cls = pct >= 80 ? 'high' : pct >= 50 ? 'mid' : 'low';
        return `<div class="skill"><div class="skill-head"><span>${esc(skill)}</span><b>${s.ok}/${s.total}</b></div>
                <div class="bar"><div class="fill ${cls}" style="width:${pct}%"></div></div></div>`;
    }).join('');
}

function finish() {
    const total = Object.values(state.session).reduce((a, s) => a + s.total, 0);
    const ok = Object.values(state.session).reduce((a, s) => a + s.ok, 0);
    const pct = total ? ok / total : 0;
    document.getElementById('final-score').textContent = state.score;
    let icon = '🏆', title = 'Detetive mestre!', msg;
    if (pct < 0.5) { icon = '🔍'; title = 'Detetive em treinamento'; }
    else if (pct < 0.8) { icon = '🕵️‍♀️'; title = 'Ótimo trabalho, detetive!'; }

    const weakest = Object.entries(state.session)
        .filter(([, s]) => s.ok < s.total)
        .sort((a, b) => (a[1].ok / a[1].total) - (b[1].ok / b[1].total))[0];
    msg = weakest
        ? `Você acertou de primeira ${ok} de ${total} etapas. Para treinar mais: <b>${esc(weakest[0])}</b>.`
        : `Perfeito! Você acertou de primeira todas as ${total} etapas!`;

    document.getElementById('result-icon').textContent = icon;
    document.getElementById('result-title').textContent = title;
    document.getElementById('result-msg').innerHTML = msg;
    renderSkills('skills', state.session);
    document.getElementById('progress-label').textContent = '';
    showScreen('result-screen');
    KidsAudio.play('win');
    if (window.Efeitos && pct >= 0.5) setTimeout(() => Efeitos.vitoria(), 250);
}

function showReport() {
    renderSkills('report', loadStats());
    showScreen('report-screen');
}

function resetReport() {
    saveStats({});
    renderSkills('report', {});
}

document.addEventListener('DOMContentLoaded', () => {
    // Tela baixa (celular): o metodo comeca fechado para a tela caber sem rolar
    const mb = document.getElementById('method-box');
    if (mb && window.innerHeight < 760) mb.open = false;
    const kw = document.getElementById('opt-keywords');
    try { const v = localStorage.getItem('detetive_kw'); if (v !== null) kw.checked = v === '1'; } catch (e) {}
    kw.addEventListener('change', () => { try { localStorage.setItem('detetive_kw', kw.checked ? '1' : '0'); } catch (e) {} });
});
