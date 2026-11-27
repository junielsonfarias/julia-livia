// ==========================================
// Graficos e Tabelas - Julia (4º ano)
// BNCC EF04MA27 (analisar dados em tabelas e graficos), EF04MA28
// Ler grafico de barras, pictograma e tabela e responder perguntas
// (tipo de questao muito comum na OBMEP e no SAEB).
// ==========================================

// qual: como perguntar "qual item" | uq: unidade usada nas perguntas | v / vp: verbo no singular / plural
// (antes as perguntas saiam como "Quantos dias teve Janeiro?" — resposta 8, mas janeiro tem 31 dias!)
const TEMAS = [
    { titulo: 'Fruta preferida da turma do 4º ano', col: 'Fruta', unidade: 'votos',
      qual: 'Qual fruta', uq: 'votos', v: 'teve', vp: 'tiveram',
      itens: [['🍎', 'Maçã'], ['🍌', 'Banana'], ['🍇', 'Uva'], ['🍓', 'Morango'], ['🍉', 'Melancia']] },
    { titulo: 'Esporte preferido dos alunos', col: 'Esporte', unidade: 'votos',
      qual: 'Qual esporte', uq: 'votos', v: 'teve', vp: 'tiveram',
      itens: [['⚽', 'Futebol'], ['🏐', 'Vôlei'], ['🏊', 'Natação'], ['🏀', 'Basquete'], ['🤸', 'Ginástica']] },
    { titulo: 'Livros lidos no mês', col: 'Aluno(a)', unidade: 'livros',
      qual: 'Quem', uq: 'livros', v: 'leu', vp: 'leram',
      itens: [['👧', 'Julia'], ['👦', 'Pedro'], ['👩', 'Ana'], ['🧒', 'Caio'], ['👱‍♀️', 'Bia']] },
    { titulo: 'Animal de estimação preferido', col: 'Animal', unidade: 'votos',
      qual: 'Qual animal', uq: 'votos', v: 'teve', vp: 'tiveram',
      itens: [['🐶', 'Cachorro'], ['🐱', 'Gato'], ['🐟', 'Peixe'], ['🐦', 'Pássaro'], ['🐹', 'Hamster']] },
    { titulo: 'Dias de chuva em cada mês', col: 'Mês', unidade: 'dias de chuva',
      qual: 'Qual mês', uq: 'dias de chuva', v: 'teve', vp: 'tiveram',
      itens: [['🌧️', 'Janeiro'], ['🌧️', 'Fevereiro'], ['🌧️', 'Março'], ['🌧️', 'Abril'], ['🌧️', 'Maio']] },
    { titulo: 'Sabor de sorvete preferido da turma', col: 'Sabor', unidade: 'votos',
      qual: 'Qual sabor', uq: 'votos', v: 'teve', vp: 'tiveram',
      itens: [['🍫', 'Chocolate'], ['🍓', 'Morango'], ['🥥', 'Coco'], ['🍋', 'Limão'], ['🍦', 'Creme']] }
];

const COLORS = ['#0984e3', '#e84393', '#00b894', '#fdcb6e', '#6c5ce7'];
const PER_ROUND = 9;      // perguntas por partida
const PER_CHART = 3;      // perguntas por grafico

const state = { queue: [], index: 0, score: 0, hits: 0, tries: 0, chart: null, locked: false };

// ---------- Utilidades ----------
function goBack() {
    if (window.parent !== window) {
        try { if (window.parent.closeGameModal) { window.parent.closeGameModal(); return; } } catch (e) {}
    }
    if (window.history.length > 1) window.history.back();
    else window.location.href = '../index.html';
}
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
}
const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const e3d = ch => window.Emoji3D ? Emoji3D.html(ch) : ch;
const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

// ---------- Dados ----------
function makeChart(tipo) {
    const tema = pick(TEMAS);
    const n = 4;
    const itens = tema.titulo.startsWith('Dias') ? tema.itens.slice(0, n) : shuffle(tema.itens).slice(0, n);
    const step = tipo === 'pictograma' ? pick([2, 5]) : 2;
    const maxMult = tipo === 'pictograma' ? (step === 5 ? 6 : 8) : 10;
    // valores todos diferentes (maior e menor ficam unicos)
    const mults = shuffle(Array.from({ length: maxMult }, (_, i) => i + 1)).slice(0, n);
    const dados = itens.map(([emoji, nome], i) => ({ emoji, nome, valor: mults[i] * step, cor: COLORS[i] }));
    return { tema, tipo, step, dados };
}

// ---------- Perguntas ----------
function makeQuestion(chart, used) {
    const d = chart.dados, T = chart.tema, u = T.uq;
    const onde = { barras: 'no gráfico', pictograma: 'no pictograma', tabela: 'na tabela' }[chart.tipo];
    const byVal = d.slice().sort((a, b) => b.valor - a.valor);
    const total = d.reduce((s, x) => s + x.valor, 0);
    const tipos = shuffle(['maior', 'menor', 'valor', 'diferenca', 'total', 'juntos', 'dobro', 'falta']).filter(t => !used.has(t));
    for (const t of tipos) {
        let q;
        if (t === 'maior') {
            q = { q: `${T.qual} ${T.v} MAIS ${u}?`, ok: byVal[0].nome, wrong: d.filter(x => x !== byVal[0]).map(x => x.nome),
                  why: `O maior valor ${onde} é de ${byVal[0].nome}, com ${byVal[0].valor} ${u}.` };
        } else if (t === 'menor') {
            const m = byVal[byVal.length - 1];
            q = { q: `${T.qual} ${T.v} MENOS ${u}?`, ok: m.nome, wrong: d.filter(x => x !== m).map(x => x.nome),
                  why: `O menor valor ${onde} é de ${m.nome}: ${m.valor} ${u}.` };
        } else if (t === 'valor') {
            const x = pick(d);
            q = { q: `Quantos ${u} ${x.nome} ${T.v}?`, ok: x.valor, wrong: [x.valor + chart.step, x.valor - chart.step, x.valor + 1],
                  why: chart.tipo === 'pictograma'
                      ? `${x.nome} tem ${x.valor / chart.step} figuras, e cada figura vale ${chart.step}: ${x.valor / chart.step} × ${chart.step} = ${x.valor}.`
                      : `Siga o topo da barra de ${x.nome} até a escala: ${x.valor}.` };
        } else if (t === 'diferenca') {
            const [a, b] = shuffle(d).slice(0, 2).sort((p, r) => r.valor - p.valor);
            q = { q: `Quantos ${u} ${a.nome} ${T.v} A MAIS que ${b.nome}?`, ok: a.valor - b.valor, wrong: [a.valor + b.valor, a.valor, b.valor],
                  why: `“A mais que” pede a diferença: ${a.valor} − ${b.valor} = ${a.valor - b.valor}.` };
        } else if (t === 'total') {
            q = { q: `Qual é o TOTAL de ${u} ${onde}?`, ok: total, wrong: [total - byVal[0].valor, total + chart.step, total - chart.step],
                  why: `Some todos: ${d.map(x => x.valor).join(' + ')} = ${total}.` };
        } else if (t === 'juntos') {
            const [a, b] = shuffle(d).slice(0, 2);
            q = { q: `Quantos ${u} ${a.nome} e ${b.nome} ${T.vp} JUNTOS?`, ok: a.valor + b.valor, wrong: [Math.abs(a.valor - b.valor), a.valor + b.valor + chart.step, a.valor + b.valor - chart.step],
                  why: `“Juntos” = somar: ${a.valor} + ${b.valor} = ${a.valor + b.valor}.` };
        } else if (t === 'dobro') {
            const pair = [];
            d.forEach(a => d.forEach(b => { if (a !== b && a.valor === 2 * b.valor) pair.push([a, b]); }));
            if (!pair.length) continue;
            const [a, b] = pick(pair);
            q = { q: `${T.qual} ${T.v} o DOBRO de ${u} de ${b.nome}?`, ok: a.nome, wrong: d.filter(x => x !== a && x !== b).map(x => x.nome).concat([b.nome]),
                  why: `${b.nome} teve ${b.valor}. O dobro é ${b.valor} × 2 = ${a.valor}, que é o valor de ${a.nome}.` };
        } else if (t === 'falta') {
            const [a, b] = shuffle(d).slice(0, 2).sort((p, r) => p.valor - r.valor);
            q = { q: `Quantos ${u} FALTAM para ${a.nome} chegar ao mesmo número de ${b.nome}?`, ok: b.valor - a.valor, wrong: [a.valor + b.valor, b.valor, a.valor],
                  why: `“Quanto falta” = subtração: ${b.valor} − ${a.valor} = ${b.valor - a.valor}.` };
        }
        if (!q) continue;
        used.add(t);
        const opts = [String(q.ok)];
        for (const w of q.wrong) {
            const v = String(w);
            if (opts.length < 4 && !opts.includes(v) && !(typeof w === 'number' && w < 0)) opts.push(v);
        }
        let k = 1;
        while (opts.length < 4 && typeof q.ok === 'number') { const v = String(q.ok + chart.step * k++); if (!opts.includes(v)) opts.push(v); }
        return { text: q.q, answer: String(q.ok), options: shuffle(opts), why: q.why };
    }
    return null;
}

// ---------- Desenho ----------
function renderChart(chart) {
    document.getElementById('chart-title').textContent = chart.tema.titulo;
    const box = document.getElementById('chart');
    const d = chart.dados;
    if (chart.tipo === 'tabela') {
        box.innerHTML = `<table class="data-table"><thead><tr><th>${chart.tema.col}</th><th>Quantidade (${chart.tema.unidade})</th></tr></thead><tbody>` +
            d.map((x, i) => `<tr style="animation-delay:${120 + i * 90}ms"><td>${e3d(x.emoji)} ${esc(x.nome)}</td><td>${x.valor}</td></tr>`).join('') + '</tbody></table>';
        return;
    }
    if (chart.tipo === 'pictograma') {
        box.innerHTML = `<div class="picto">` + d.map((x, i) =>
            `<div class="picto-row"><span class="picto-label">${esc(x.nome)}</span><span class="picto-icons">${Array.from({ length: x.valor / chart.step }, (_, k) =>
                `<span class="picto-ic" style="animation-delay:${100 + (i * 2 + k) * 45}ms">${e3d(x.emoji)}</span>`).join('')}</span></div>`
        ).join('') + `</div><p class="legend">🔑 Legenda: cada figura vale <b>${chart.step} ${chart.tema.unidade}</b></p>`;
        return;
    }
    // Barras (SVG)
    const W = 420, H = 260, left = 40, bottom = 50, top = 14, right = 10;
    const maxV = Math.max(20, Math.ceil(Math.max(...d.map(x => x.valor)) / 2) * 2);
    const plotH = H - top - bottom, plotW = W - left - right;
    const y = v => top + plotH - (v / maxV) * plotH;
    let grid = '';
    for (let v = 0; v <= maxV; v += 2) {
        grid += `<line x1="${left}" y1="${y(v)}" x2="${W - right}" y2="${y(v)}" stroke="${v === 0 ? '#2d3436' : '#e3e8f0'}" stroke-width="${v === 0 ? 2 : 1}"/>`;
        grid += `<text x="${left - 6}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="#636e72">${v}</text>`;
    }
    const bw = plotW / d.length;
    const defs = d.map((x, i) => `<linearGradient id="bg${i}" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stop-color="${x.cor}"/><stop offset=".35" stop-color="${shade(x.cor, 40)}"/><stop offset="1" stop-color="${shade(x.cor, -35)}"/></linearGradient>`).join('');
    const bars = d.map((x, i) => {
        const cx = left + bw * i + bw / 2;
        const h = y(0) - y(x.valor);
        return `<g class="bar-grow" style="animation-delay:${150 + i * 130}ms">
            <rect x="${cx - bw * 0.3}" y="${y(x.valor)}" width="${bw * 0.6}" height="${h}" rx="5" fill="url(#bg${i})"/>
            <rect x="${cx - bw * 0.3 + 4}" y="${y(x.valor) + 3}" width="${bw * 0.1}" height="${Math.max(0, h - 6)}" rx="3" fill="rgba(255,255,255,.35)"/></g>
            ${window.Emoji3D && Emoji3D.ligado() ? `<image href="${Emoji3D.url(x.emoji)}" x="${cx - 11}" y="${H - bottom + 4}" width="22" height="22"/>` : `<text x="${cx}" y="${H - bottom + 20}" text-anchor="middle" font-size="18">${x.emoji}</text>`}
            <text x="${cx}" y="${H - bottom + 38}" text-anchor="middle" font-size="12" font-weight="700" fill="#2d3436">${esc(x.nome)}</text>`;
    }).join('');
    box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="bar-chart" role="img" aria-label="Gráfico de barras: ${esc(chart.tema.titulo)}">
        <defs>${defs}</defs><line x1="${left}" y1="${top}" x2="${left}" y2="${y(0)}" stroke="#2d3436" stroke-width="2"/>${grid}${bars}</svg>
        <p class="legend">Eixo da esquerda: quantidade de ${chart.tema.unidade}</p>`;
}

function shade(hex, p) {
    const n = parseInt(hex.slice(1), 16);
    const f = c => Math.max(0, Math.min(255, Math.round(c + (p > 0 ? (255 - c) : c) * p / 100)));
    return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(f).map(c => c.toString(16).padStart(2, '0')).join('');
}

// ---------- Fluxo ----------
function startGame() {
    state.queue = [];
    state.index = 0;
    state.score = 0;
    state.hits = 0;
    const tipos = shuffle(['barras', 'pictograma', 'tabela']);
    for (let c = 0; c < PER_ROUND / PER_CHART; c++) {
        const chart = makeChart(tipos[c % tipos.length]);
        const used = new Set();
        for (let k = 0; k < PER_CHART; k++) {
            const q = makeQuestion(chart, used);
            if (q) state.queue.push({ chart, ...q });
        }
    }
    document.getElementById('score').textContent = '0';
    KidsAudio.play('start');
    showScreen('game-screen');
    showQuestion();
}

let turnTimer = null;
function showQuestion() {
    const qb = document.querySelector('#game-screen .question-box');
    clearTimeout(turnTimer);
    if (!qb || state.index === 0) return renderQuestion();
    qb.classList.add('leaving');
    turnTimer = setTimeout(() => { renderQuestion(); qb.classList.remove('leaving'); }, 230);
}

function renderQuestion() {
    const item = state.queue[state.index];
    state.tries = 0;
    state.locked = false;
    if (state.chart !== item.chart) { state.chart = item.chart; renderChart(item.chart); }
    const kindNames = { barras: '📊 Gráfico de barras', pictograma: '🖼️ Pictograma', tabela: '📋 Tabela' };
    document.getElementById('chart-kind').textContent = kindNames[item.chart.tipo];
    document.getElementById('progress').innerHTML = `Pergunta <strong>${state.index + 1}</strong>/${state.queue.length}`;
    document.getElementById('question').innerHTML = esc(item.text).replace(/\b(MAIS|MENOS|A MAIS|TOTAL|JUNTOS|DOBRO|FALTAM)\b/g, '<mark class="kw">$1</mark>');
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('feedback').innerHTML = '';
    document.getElementById('next-btn').hidden = true;
    const box = document.getElementById('options');
    box.innerHTML = '';
    item.options.forEach((o, i) => {
        const b = document.createElement('button');
        b.className = 'option';
        b.dataset.value = o;
        b.style.animationDelay = (150 + i * 50) + 'ms';
        b.innerHTML = `<span class="letter">${'ABCD'[i]}</span>${esc(o)}`;
        b.onclick = () => answer(b, o);
        box.appendChild(b);
    });
}

function answer(btn, value) {
    if (state.locked || btn.disabled) return;
    const item = state.queue[state.index];
    state.tries++;
    const fb = document.getElementById('feedback');
    if (value === item.answer) {
        state.locked = true;
        document.querySelectorAll('#options .option').forEach(b => b.classList.remove('hint-glow'));
        btn.classList.add('correct');
        if (window.Efeitos) Efeitos.acerto(btn, { texto: state.tries === 1 ? '+10' : '+4', emoji: ['📊', '⭐', '✨'] });
        if (state.tries === 1) { state.hits++; state.score += 10; } else state.score += 4;
        document.getElementById('score').textContent = state.score;
        KidsAudio.play('correct');
        fb.className = 'feedback explain';
        fb.innerHTML = `${state.tries === 1 ? '✅ Isso mesmo!' : '✅ Agora sim!'}<br>💡 ${esc(item.why)}`;
        endQuestion();
    } else {
        btn.classList.add('wrong');
        btn.disabled = true;
        KidsAudio.play('pop');
        if (window.Efeitos) Efeitos.erro(btn);
        if (state.tries >= 2) {
            // 2º erro: a certa brilha e a explicacao aparece; ela toca na certa para seguir
            document.querySelectorAll('#options .option').forEach(b => {
                if (b.dataset.value === item.answer) b.classList.add('hint-glow');
            });
            fb.className = 'feedback explain';
            fb.innerHTML = `✨ Veja a explicação e toque na resposta que está brilhando.<br>💡 ${esc(item.why)}`;
        } else {
            fb.className = 'feedback bad';
            fb.innerHTML = '🤔 Ainda não. Olhe o gráfico de novo com calma e releia a pergunta.';
        }
    }
}

function endQuestion() {
    document.querySelectorAll('#options .option').forEach(b => { b.disabled = true; });
    const next = document.getElementById('next-btn');
    next.textContent = state.index + 1 >= state.queue.length ? 'Ver resultado 🏆' : 'Próxima ➜';
    next.hidden = false;
}

function nextQuestion() {
    state.index++;
    if (state.index >= state.queue.length) return finish();
    showQuestion();
}

function finish() {
    const n = state.queue.length;
    document.getElementById('final-score').textContent = state.score;
    document.getElementById('final-hits').textContent = `${state.hits}/${n}`;
    const pct = state.hits / n;
    document.getElementById('result-icon').innerHTML = e3d(pct >= 0.8 ? '🏆' : pct >= 0.5 ? '🎉' : '📊');
    document.getElementById('result-msg').textContent = pct >= 0.8
        ? 'Excelente! Você lê gráficos como uma cientista!'
        : 'Dica: antes de responder, leia o título, a legenda e a escala do gráfico.';
    state.chart = null;
    document.getElementById('progress').textContent = '';
    showScreen('result-screen');
    KidsAudio.play('win');
    if (window.Efeitos) setTimeout(() => Efeitos.vitoria(), 200);
}
