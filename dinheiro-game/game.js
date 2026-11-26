// ==========================================
// Mercadinho - Julia (4º ano) - Sistema monetario brasileiro
// BNCC EF04MA25 (situacoes de compra e venda, troco, formas de pagamento)
// Modos: pagar certinho (montar o valor com notas e moedas), troco, quanto falta.
// Valores guardados em CENTAVOS (inteiros) para nao errar contas com virgula.
// ==========================================

const NOTAS = [5000, 2000, 1000, 500, 200];
const MOEDAS = [100, 50, 25, 10, 5];
const DINHEIRO = [...NOTAS, ...MOEDAS];
const ROUNDS = 8;

// [emoji, nome, preco minimo, preco maximo (centavos), artigo]
const PRODUTOS = [
    ['🍎', 'Maçã', 75, 250, 'a'], ['🧃', 'Suco', 250, 600, 'o'], ['📒', 'Caderno', 800, 2200, 'o'], ['✏️', 'Lápis', 125, 400, 'o'],
    ['🧸', 'Ursinho', 1500, 4500, 'o'], ['⚽', 'Bola', 1800, 4800, 'a'], ['🍫', 'Chocolate', 350, 900, 'o'], ['🎨', 'Tinta guache', 600, 1600, 'a'],
    ['🍞', 'Pão', 50, 150, 'o'], ['🥛', 'Leite', 400, 750, 'o'], ['🍦', 'Sorvete', 500, 1200, 'o'], ['📚', 'Livro', 2000, 4500, 'o'],
    ['🪀', 'Ioiô', 600, 1500, 'o'], ['🖍️', 'Giz de cera', 450, 1100, 'o'], ['🍌', 'Banana', 100, 400, 'a'], ['🧁', 'Bolinho', 300, 800, 'o']
];

const state = { mode: 'misturado', round: 0, items: [], current: null, tray: [], hits: 0, score: 0, tries: 0, locked: false };

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
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const brl = c => 'R$ ' + (c / 100).toFixed(2).replace('.', ',');
const isNota = v => v >= 200;

// Preco aleatorio do produto, multiplo de 25 centavos
function price(p) { return Math.round(rnd(p[2], p[3]) / 25) * 25; }

// Menor quantidade de notas/moedas (no real, o metodo "guloso" sempre da o minimo)
function minPieces(value) {
    let n = 0;
    for (const d of DINHEIRO) { n += Math.floor(value / d); value %= d; }
    return n;
}

function moneyHTML(v, extra) {
    const cls = isNota(v) ? `money nota n${v}` : `money moeda m${v}`;
    // Moedas de centavos mostram o numero e "centavos" embaixo, como na moeda de verdade
    const label = isNota(v) ? brl(v).replace(',00', '') : (v === 100 ? 'R$ 1' : `${v}<small>centavos</small>`);
    return `<span class="${cls}" ${extra || ''}>${label}</span>`;
}

// Completa ate 4 alternativas diferentes (valores positivos proximos da resposta)
function fillOptions(opts) {
    const base = opts[0];
    for (let k = 1; opts.length < 4; k++) {
        for (const v of [base + 25 * k, base + 100 * k]) {
            if (opts.length < 4 && !opts.includes(v)) opts.push(v);
        }
    }
}

// ---------- Rodadas ----------
function makeItem(kind) {
    if (kind === 'pagar') {
        const p = pick(PRODUTOS);
        return { kind, prod: p, total: price(p) };
    }
    if (kind === 'troco') {
        const n = rnd(1, 3);
        const prods = shuffle(PRODUTOS).slice(0, n).map(p => ({ p, v: price(p) }));
        const total = prods.reduce((s, x) => s + x.v, 0);
        if (total >= 10000) return makeItem('troco');   // compra grande demais: sorteia outra
        const nota = [500, 1000, 2000, 5000, 10000].find(x => x > total);
        const troco = nota - total;
        const wrong = [troco + 100, troco - 50, nota - prods[0].v, troco + 50, troco - 100]
            .filter(v => v > 0 && v !== troco);
        const opts = [troco];
        for (const w of shuffle(wrong)) if (opts.length < 4 && !opts.includes(w)) opts.push(w);
    fillOptions(opts);
        return { kind, prods, total, nota, answer: troco, options: shuffle(opts),
            why: `Primeiro some as compras: ${prods.map(x => brl(x.v)).join(' + ')} = ${brl(total)}. Depois o troco: ${brl(nota)} − ${brl(total)} = ${brl(troco)}.` };
    }
    // falta
    const p = pick(PRODUTOS.filter(x => x[3] >= 800));
    const total = price(p);
    const carteira = [];
    let soma = 0;
    const alvo = total - rnd(1, Math.max(1, Math.floor(total / 200))) * 50;
    for (const d of DINHEIRO) { while (soma + d <= alvo && carteira.length < 8) { carteira.push(d); soma += d; } }
    if (soma <= 0 || soma >= total) return makeItem('falta');
    const falta = total - soma;
    const wrong = [falta + 50, falta - 25, soma, falta + 100, total + soma].filter(v => v > 0 && v !== falta);
    const opts = [falta];
    for (const w of shuffle(wrong)) if (opts.length < 4 && !opts.includes(w)) opts.push(w);
    fillOptions(opts);
    return { kind, prod: p, total, carteira, soma, answer: falta, options: shuffle(opts),
        why: `Conte o dinheiro da carteira: ${brl(soma)}. Quanto falta = preço − o que tem: ${brl(total)} − ${brl(soma)} = ${brl(falta)}.` };
}

function startGame(mode) {
    state.mode = mode;
    state.round = 0;
    state.hits = 0;
    state.score = 0;
    const kinds = mode === 'misturado' ? ['pagar', 'troco', 'falta'] : [mode];
    state.items = Array.from({ length: ROUNDS }, (_, i) => makeItem(kinds[i % kinds.length]));
    if (mode === 'misturado') state.items = shuffle(state.items);
    document.getElementById('score').textContent = '0';
    KidsAudio.play('start');
    showScreen('game-screen');
    showRound();
}

function showRound() {
    const it = state.items[state.round];
    state.current = it;
    state.tray = [];
    state.tries = 0;
    state.locked = false;
    document.getElementById('progress').innerHTML = `Rodada <strong>${state.round + 1}</strong>/${state.items.length}`;
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('feedback').innerHTML = '';
    document.getElementById('next-btn').hidden = true;
    const scene = document.getElementById('scene');
    const opts = document.getElementById('options');
    const pay = document.getElementById('pay-area');
    opts.innerHTML = '';

    if (it.kind === 'pagar') {
        pay.hidden = false;
        scene.innerHTML = `<div class="shop-item big"><span class="prod-emoji">${it.prod[0]}</span><span class="prod-name">${it.prod[1]}</span><span class="price-tag">${brl(it.total)}</span></div>
            <p class="task">Toque nas notas e moedas para pagar <b>exatamente ${brl(it.total)}</b>.</p>`;
        renderWallet();
        renderTray();
    } else if (it.kind === 'troco') {
        pay.hidden = true;
        scene.innerHTML = `<div class="shop-row">${it.prods.map(x =>
            `<div class="shop-item"><span class="prod-emoji">${x.p[0]}</span><span class="prod-name">${x.p[1]}</span><span class="price-tag">${brl(x.v)}</span></div>`).join('')}</div>
            <p class="task">Julia comprou ${it.prods.length === 1 ? 'este produto' : 'estes produtos'} e pagou com ${moneyHTML(it.nota)}.<br><b>Quanto ela vai receber de <mark class="kw">troco</mark>?</b></p>`;
        renderOptions(it);
    } else {
        pay.hidden = true;
        scene.innerHTML = `<div class="shop-item big"><span class="prod-emoji">${it.prod[0]}</span><span class="prod-name">${it.prod[1]}</span><span class="price-tag">${brl(it.total)}</span></div>
            <p class="task">Livia tem este dinheiro na carteira:</p>
            <div class="wallet-show">${it.carteira.map(v => moneyHTML(v)).join('')}</div>
            <p class="task"><b>Quanto <mark class="kw">falta</mark> para ela comprar ${it.prod[4]} ${it.prod[1].toLowerCase()}?</b></p>`;
        renderOptions(it);
    }
}

function renderOptions(it) {
    const box = document.getElementById('options');
    it.options.forEach((v, i) => {
        const b = document.createElement('button');
        b.className = 'option';
        b.dataset.value = v;
        b.innerHTML = `<span class="letter">${'ABCD'[i]}</span>${brl(v)}`;
        b.onclick = () => answer(b, v);
        box.appendChild(b);
    });
}

// ---------- Pagar certinho ----------
function renderWallet() {
    const w = document.getElementById('wallet');
    w.innerHTML = DINHEIRO.map(v => `<button class="money-btn" data-v="${v}" aria-label="${brl(v)}">${moneyHTML(v)}</button>`).join('');
    w.querySelectorAll('.money-btn').forEach(b => b.onclick = () => {
        if (state.locked) return;
        state.tray.push(Number(b.dataset.v));
        KidsAudio.play(isNota(Number(b.dataset.v)) ? 'flip' : 'click');
        renderTray();
    });
}

function renderTray() {
    const tray = document.getElementById('tray');
    const sum = state.tray.reduce((s, v) => s + v, 0);
    const sorted = state.tray.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v);
    tray.innerHTML = sorted.length
        ? sorted.map(({ v, i }) => `<button class="tray-piece" data-i="${i}" aria-label="Tirar ${brl(v)}">${moneyHTML(v)}</button>`).join('')
        : '<span class="empty">Toque no dinheiro abaixo para colocar aqui</span>';
    tray.querySelectorAll('.tray-piece').forEach(b => b.onclick = () => {
        if (state.locked) return;
        state.tray.splice(Number(b.dataset.i), 1);
        KidsAudio.play('click');
        renderTray();
    });
    const it = state.current;
    const sumEl = document.getElementById('tray-sum');
    sumEl.textContent = brl(sum);
    sumEl.className = 'tray-sum' + (sum === it.total ? ' exact' : sum > it.total ? ' over' : '');
}

function clearTray() {
    if (state.locked) return;
    state.tray = [];
    renderTray();
}

function payNow() {
    if (state.locked) return;
    const it = state.current;
    const sum = state.tray.reduce((s, v) => s + v, 0);
    const fb = document.getElementById('feedback');
    if (sum === 0) {   // balcao vazio: nao conta como tentativa
        fb.className = 'feedback bad';
        fb.innerHTML = '👆 Primeiro toque nas notas e moedas para colocar o dinheiro no balcão.';
        return;
    }
    state.tries++;
    if (sum === it.total) {
        state.locked = true;
        const min = minPieces(it.total);
        const used = state.tray.length;
        const first = state.tries === 1;
        if (first) state.hits++;
        state.score += (first ? 10 : 5) + (used === min ? 5 : 0);
        document.getElementById('score').textContent = state.score;
        KidsAudio.play('correct');
        fb.className = 'feedback explain';
        fb.innerHTML = `✅ Pagou certinho ${brl(it.total)}!` + (used === min
            ? ` ⭐ E usou o <b>menor número</b> de notas e moedas (${min})! +5`
            : `<br>💡 Desafio: dava para pagar com só <b>${min}</b> ${min === 1 ? 'peça' : 'peças'} (você usou ${used}). Comece pelas notas maiores!`);
        endRound();
    } else {
        KidsAudio.play('wrong');
        fb.className = 'feedback bad';
        fb.innerHTML = sum > it.total
            ? `🤔 Você colocou ${brl(sum)}: passou ${brl(sum - it.total)}. Tire alguma nota ou moeda (toque nela).`
            : `🤔 Você colocou ${brl(sum)}: ainda faltam ${brl(it.total - sum)}.`;
    }
}

// ---------- Troco / Quanto falta ----------
function answer(btn, v) {
    if (state.locked || btn.disabled) return;
    const it = state.current;
    state.tries++;
    const fb = document.getElementById('feedback');
    if (v === it.answer) {
        state.locked = true;
        btn.classList.add('correct');
        if (state.tries === 1) { state.hits++; state.score += 10; } else state.score += 4;
        document.getElementById('score').textContent = state.score;
        KidsAudio.play('correct');
        fb.className = 'feedback explain';
        fb.innerHTML = `✅ Isso mesmo!<br>💡 ${it.why}`;
        endRound();
    } else {
        btn.classList.add('wrong');
        btn.disabled = true;
        KidsAudio.play('wrong');
        if (state.tries >= 2) {
            state.locked = true;
            const right = document.querySelector(`#options .option[data-value="${it.answer}"]`);
            if (right) right.classList.add('correct', 'revealed');
            fb.className = 'feedback explain';
            fb.innerHTML = `A resposta certa está em verde.<br>💡 ${it.why}`;
            endRound();
        } else {
            fb.className = 'feedback bad';
            fb.innerHTML = it.kind === 'troco'
                ? '🤔 Ainda não. Primeiro descubra quanto custou TUDO, depois tire isso do valor pago.'
                : '🤔 Ainda não. Conte com calma o dinheiro da carteira, começando pelas notas.';
        }
    }
}

function endRound() {
    document.querySelectorAll('#options .option').forEach(b => { b.disabled = true; });
    const next = document.getElementById('next-btn');
    next.textContent = state.round + 1 >= state.items.length ? 'Ver resultado 🏆' : 'Próxima ➜';
    next.hidden = false;
}

function nextRound() {
    state.round++;
    if (state.round >= state.items.length) return finish();
    showRound();
}

function finish() {
    const n = state.items.length;
    document.getElementById('final-score').textContent = state.score;
    document.getElementById('final-hits').textContent = `${state.hits}/${n}`;
    document.getElementById('result-icon').textContent = state.hits >= n - 1 ? '🏆' : state.hits >= n / 2 ? '🎉' : '🪙';
    document.getElementById('progress').textContent = '';
    showScreen('result-screen');
    KidsAudio.play('win');
}
