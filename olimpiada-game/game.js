// ==========================================
// Treino Olimpico - Julia (4º ano)
// Treino: dica opcional + resolucao comentada apos cada questao.
// Simulado: 10 questoes em ordem de dificuldade, 20 minutos, correcao no final.
//           Como numa prova de verdade: pode pular, voltar, marcar "revisar depois" e entregar quando quiser.
// ==========================================

const STATS_KEY = 'olimpiada_stats_v1';
const RECORD_KEY = 'olimpiada_simulado_recorde_v1';
const SIM_SECONDS = 20 * 60;
const LETTERS = ['A', 'B', 'C', 'D', 'E'];

const state = {
    mode: 'treino', topic: null,
    questions: [], index: 0, tries: 0, usedHint: false,
    answers: [],        // simulado: { q, chosen } por indice
    orders: [],         // simulado: ordem embaralhada das alternativas de cada questao (fica igual ao voltar)
    flags: new Set(),   // simulado: questoes marcadas para revisar
    running: false,     // simulado em andamento (evita entregar duas vezes: relogio + botao)
    submitArmed: false, // 1º toque em "Entregar" com questoes em branco/marcadas pede confirmacao
    correct: 0, points: 0,
    clock: null, endAt: 0, timeLeft: SIM_SECONDS
};

function goBack() {
    stopClock();
    state.running = false;
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

function goHome() {
    stopClock();
    state.running = false;
    document.getElementById('progress-label').textContent = '';
    renderStart();
    showScreen('start-screen');
}

function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
const e3d = ch => window.Emoji3D ? Emoji3D.html(ch) : ch;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function loadJSON(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
function saveJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

function record(tema, ok) {
    const all = loadJSON(STATS_KEY, {});
    const s = all[tema] || (all[tema] = { ok: 0, total: 0 });
    s.total++; if (ok) s.ok++;
    saveJSON(STATS_KEY, all);
}

// ---------- Inicio ----------
function renderStart() {
    const temas = [...new Set(window.OLIMPIADA.map(q => q.tema))];
    const box = document.getElementById('topics');
    box.innerHTML = '';
    temas.forEach(t => {
        const b = document.createElement('button');
        b.className = 'topic-chip';
        b.textContent = t;
        b.onclick = () => startGame('treino', t);
        box.appendChild(b);
    });
    const rec = loadJSON(RECORD_KEY, null);
    document.getElementById('record').textContent = rec
        ? `🏅 Melhor simulado: ${rec.score}/10 (${new Date(rec.date).toLocaleDateString('pt-BR')})`
        : '';
}

function startGame(mode, topic) {
    document.getElementById('q-options').innerHTML = '';   // 1a questao entra direto (sem a troca suave)
    state.mode = mode;
    state.topic = topic || null;
    state.index = 0;
    state.correct = 0;
    state.points = 0;
    state.answers = [];
    state.flags = new Set();
    state.submitArmed = false;
    const all = window.OLIMPIADA;
    const byLevel = n => shuffle(all.filter(q => q.nivel === n));

    if (mode === 'simulado') {
        state.questions = [...byLevel(1).slice(0, 3), ...byLevel(2).slice(0, 4), ...byLevel(3).slice(0, 3)];
        state.orders = state.questions.map(q => shuffle(q.op.map((text, i) => ({ text, ok: i === 0 }))));
        state.running = true;
        startClock();
    } else {
        const pool = topic ? all.filter(q => q.tema === topic) : all;
        state.questions = shuffle(pool).slice(0, 8).sort((a, b) => a.nivel - b.nivel);
        state.running = false;
        stopClock();
    }
    KidsAudio.play('start');
    showScreen('question-screen');
    showQuestion();
}

// ---------- Relogio do simulado ----------
// Conta pelo horario final (Date.now), e nao por "ticks": continua certo mesmo se o navegador
// atrasar o setInterval com a aba em segundo plano.
function startClock() {
    stopClock();
    state.endAt = Date.now() + SIM_SECONDS * 1000;
    state.timeLeft = SIM_SECONDS;
    document.getElementById('clock').hidden = false;
    renderClock();
    state.clock = setInterval(() => {
        state.timeLeft = Math.max(0, Math.ceil((state.endAt - Date.now()) / 1000));
        renderClock();
        if (state.timeLeft <= 0) finishSimulado(true);
    }, 500);
}
function stopClock() {
    if (state.clock) clearInterval(state.clock);
    state.clock = null;
    document.getElementById('clock').hidden = true;
}
function renderClock() {
    const m = Math.floor(state.timeLeft / 60), s = state.timeLeft % 60;
    const v = document.getElementById('clock-value');
    v.textContent = `${m}:${String(s).padStart(2, '0')}`;
    v.style.color = state.timeLeft <= 120 ? '#e17000' : '';
}

// ---------- Questao ----------
let turnTimer = null;
function showQuestion() {
    const panel = document.querySelector('#question-screen .panel');
    clearTimeout(turnTimer);
    if (!panel || !document.getElementById('q-options').children.length) return renderQuestion();
    panel.classList.add('leaving');
    turnTimer = setTimeout(() => { renderQuestion(); panel.classList.remove('leaving'); }, 200);
}

function renderQuestion() {
    const q = state.questions[state.index];
    const sim = state.mode === 'simulado';
    state.tries = 0;
    state.usedHint = false;
    state.submitArmed = false;
    document.getElementById('progress-label').innerHTML = `Questão <strong>${state.index + 1}</strong>/${state.questions.length}`;
    document.getElementById('q-topic').textContent = '🧩 ' + q.tema;
    document.getElementById('q-level').textContent = '⭐'.repeat(q.nivel) + '☆'.repeat(3 - q.nivel);
    document.getElementById('q-text').textContent = q.q;
    document.getElementById('q-figure').innerHTML = q.figura || '';
    document.getElementById('q-feedback').innerHTML = '';
    document.getElementById('q-feedback').className = 'feedback';
    document.getElementById('tools').hidden = sim;
    document.getElementById('hint-btn').disabled = false;
    document.getElementById('sim-bar').hidden = !sim;

    const next = document.getElementById('q-next');
    next.hidden = true;          // treino: aparece depois da resolucao; simulado usa a barra propria
    next.disabled = false;
    next.textContent = state.index + 1 >= state.questions.length ? 'Ver resultado 🏆' : 'Próxima ➜';

    const box = document.getElementById('q-options');
    box.innerHTML = '';
    const opts = sim ? state.orders[state.index] : shuffle(q.op.map((text, i) => ({ text, ok: i === 0 })));
    const chosen = sim && state.answers[state.index] ? state.answers[state.index].chosen : null;
    opts.forEach((o, i) => {
        const b = document.createElement('button');
        b.className = 'option' + (o.text === chosen ? ' chosen' : '');
        b.dataset.ok = o.ok ? '1' : '0';
        b.style.animationDelay = (120 + i * 45) + 'ms';
        b.innerHTML = `<span class="letter">${LETTERS[i]}</span>${esc(o.text)}`;
        b.onclick = () => sim ? chooseSimulado(b, o.text) : answerTreino(b, o.ok);
        box.appendChild(b);
    });
    if (sim) renderSimBar();
}

function showHint() {
    const q = state.questions[state.index];
    state.usedHint = true;
    document.getElementById('hint-btn').disabled = true;
    const fb = document.getElementById('q-feedback');
    fb.className = 'feedback bad';
    fb.innerHTML = hintHTML(q);
    KidsAudio.play('click');
}
const hintHTML = q => `💡 <b>Dica (${esc(q.estrategia)}):</b> ${esc(q.dica)}`;

function answerTreino(btn, ok) {
    if (btn.disabled) return;
    const q = state.questions[state.index];
    state.tries++;
    const fb = document.getElementById('q-feedback');
    if (ok) {
        btn.classList.add('correct');
        const first = state.tries === 1;
        record(q.tema, first && !state.usedHint);
        if (first) state.correct++;
        state.points += first ? (state.usedHint ? 5 : 10) : 3;
        KidsAudio.play('correct');
        if (window.Efeitos) Efeitos.acerto(btn, { texto: first ? '+10' : '+3', emoji: ['🥇', '⭐', '✨'] });
        revealSolution(first ? '✅ Muito bem!' : '✅ Agora sim!');
    } else {
        btn.classList.add('wrong');
        btn.disabled = true;
        if (window.Efeitos) Efeitos.erro(btn);
        KidsAudio.play('pop');
        if (state.tries >= 2) {
            record(q.tema, false);
            const right = document.querySelector('#q-options .option[data-ok="1"]');
            if (right) right.classList.add('correct', 'revealed');
            revealSolution('A resposta certa é a que está brilhando. Leia a resolução:');
        } else {
            fb.className = 'feedback bad';
            // Se ela ja pediu a dica, a dica continua visivel (antes era apagada por esta mensagem)
            fb.innerHTML = state.usedHint
                ? `🤔 Não é essa. Releia a dica e tente de novo!<br>${hintHTML(q)}`
                : '🤔 Não é essa. Pense de novo — se quiser, peça uma dica.';
        }
    }
}

function revealSolution(head) {
    const q = state.questions[state.index];
    document.querySelectorAll('#q-options .option').forEach(b => { b.disabled = true; });
    document.getElementById('hint-btn').disabled = true;
    const fb = document.getElementById('q-feedback');
    fb.className = 'feedback explain';
    fb.innerHTML = `${head}<br>🧰 <b>Estratégia:</b> ${esc(q.estrategia)}<br>📝 <b>Resolução:</b> ${esc(q.sol)}`;
    const next = document.getElementById('q-next');
    next.hidden = false;
    next.disabled = false;
}

// Treino: proxima questao (botao q-next)
function nextQuestion() {
    if (state.mode === 'simulado') return;
    const next = document.getElementById('q-next');
    if (next.hidden) return;     // evita pular questao com toque duplo
    next.hidden = true;
    state.index++;
    if (state.index >= state.questions.length) return finishTreino();
    showQuestion();
}

// ---------- Simulado: navegacao como numa prova ----------
function chooseSimulado(btn, text) {
    if (!state.running) return;
    document.querySelectorAll('#q-options .option').forEach(b => b.classList.remove('chosen'));
    btn.classList.add('chosen');
    if (window.Efeitos) Efeitos.pulo(btn, 0.5);
    state.answers[state.index] = { q: state.questions[state.index], chosen: text };
    state.submitArmed = false;
    renderSimBar();
    KidsAudio.play('click');
}

function gotoQuestion(i) {
    if (!state.running || i < 0 || i >= state.questions.length) return;
    state.index = i;
    showQuestion();
    KidsAudio.play('click');
}

function toggleFlag() {
    if (!state.running) return;
    if (state.flags.has(state.index)) state.flags.delete(state.index); else state.flags.add(state.index);
    state.submitArmed = false;
    renderSimBar();
    KidsAudio.play('click');
}

function renderSimBar() {
    const n = state.questions.length;
    document.getElementById('sim-nav').innerHTML = state.questions.map((_, i) => {
        const cls = ['nav-q'];
        if (state.answers[i]) cls.push('answered');
        if (state.flags.has(i)) cls.push('flagged');
        if (i === state.index) cls.push('current');
        const label = `Questão ${i + 1}${state.answers[i] ? ', respondida' : ', em branco'}${state.flags.has(i) ? ', marcada para revisar' : ''}`;
        return `<button class="${cls.join(' ')}" onclick="gotoQuestion(${i})" aria-label="${label}">${i + 1}</button>`;
    }).join('');
    const flagged = state.flags.has(state.index);
    const flagBtn = document.getElementById('flag-btn');
    flagBtn.textContent = flagged ? '🚩 Marcada (tirar)' : '🏳️ Revisar depois';
    flagBtn.classList.toggle('on', flagged);
    document.getElementById('prev-btn').disabled = state.index === 0;
    document.getElementById('next-q-btn').disabled = state.index === n - 1;

    const blank = state.questions.filter((_, i) => !state.answers[i]).length;
    const submit = document.getElementById('submit-btn');
    const warn = document.getElementById('submit-warn');
    if (state.submitArmed) {
        submit.textContent = 'Sim, entregar agora ✔';
        warn.textContent = [blank ? `${blank} em branco` : '', state.flags.size ? `${state.flags.size} marcada(s) para revisar` : '']
            .filter(Boolean).join(' e ') + '. Tem certeza?';
    } else {
        submit.textContent = 'Entregar a prova ✔';
        warn.textContent = blank ? `Respondidas: ${n - blank} de ${n}` : 'Todas respondidas! Revise se quiser e entregue.';
    }
}

function submitSimulado() {
    if (!state.running) return;
    const blank = state.questions.some((_, i) => !state.answers[i]);
    if ((blank || state.flags.size) && !state.submitArmed) {
        state.submitArmed = true;
        renderSimBar();
        KidsAudio.play('click');
        return;
    }
    finishSimulado(false);
}

// ---------- Resultados ----------
function finishTreino() {
    const total = state.questions.length;
    document.getElementById('final-score').textContent = `${state.correct}/${total}`;
    document.getElementById('final-label').textContent = 'acertos de primeira';
    const pct = state.correct / total;
    document.getElementById('result-icon').innerHTML = e3d(pct >= .8 ? '🥇' : pct >= .5 ? '🥈' : '🥉');
    document.getElementById('result-title').textContent = pct >= .8 ? 'Medalha de ouro!' : pct >= .5 ? 'Muito bem!' : 'Continue treinando!';
    document.getElementById('result-msg').textContent =
        `Você fez ${state.points} pontos. Nas olimpíadas, quem treina estratégias vai cada vez melhor!`;
    document.getElementById('review').innerHTML = '';
    document.getElementById('progress-label').textContent = '';
    showScreen('result-screen');
    KidsAudio.play('win');
    if (window.Efeitos) setTimeout(() => Efeitos.vitoria(), 200);
}

function finishSimulado(timeUp) {
    if (!state.running) return;      // ja entregue (ex.: relogio zerou no mesmo instante do toque)
    state.running = false;
    stopClock();
    let score = 0;
    const review = state.questions.map((q, i) => {
        const a = state.answers[i];
        const ok = !!a && a.chosen === q.op[0];
        if (ok) score++;
        record(q.tema, ok);
        return `<div class="review-item ${ok ? 'ok' : 'bad'}">
            <p><b>${i + 1}. ${esc(q.tema)}</b> ${'⭐'.repeat(q.nivel)} — ${ok ? '✅ Acertou' : a ? '❌ Você marcou: ' + esc(a.chosen) : '⚪ Em branco'}</p>
            ${ok ? '' : `<p>${esc(q.q)}</p>${q.figura || ''}<p><b>Resposta:</b> ${esc(q.op[0])}</p><p class="sol">📝 ${esc(q.sol)}</p>`}
        </div>`;
    }).join('');

    const rec = loadJSON(RECORD_KEY, null);
    const isRecord = !rec || score > rec.score;
    if (isRecord) saveJSON(RECORD_KEY, { score, date: new Date().toISOString() });

    const used = SIM_SECONDS - state.timeLeft;
    document.getElementById('final-score').textContent = `${score}/10`;
    document.getElementById('final-label').textContent = 'acertos no simulado';
    document.getElementById('result-icon').innerHTML = e3d(score >= 8 ? '🥇' : score >= 6 ? '🥈' : score >= 4 ? '🥉' : '📚');
    document.getElementById('result-title').textContent = timeUp ? '⏰ Tempo esgotado!' : 'Prova entregue!';
    document.getElementById('result-msg').textContent =
        (isRecord && score > 0 ? '🏆 Novo recorde! ' : '') +
        (timeUp ? '' : `Tempo usado: ${Math.floor(used / 60)} min ${used % 60} s. `) +
        'Leia a resolução das questões que você errou: é assim que se aprende para a olimpíada.';
    document.getElementById('review').innerHTML = review;
    document.getElementById('progress-label').textContent = '';
    document.getElementById('sim-bar').hidden = true;
    showScreen('result-screen');
    KidsAudio.play(score >= 6 ? 'win' : 'star');
    if (window.Efeitos) setTimeout(() => score >= 6 ? Efeitos.vitoria() : Efeitos.estrelas(document.getElementById('result-icon'), { quantidade: 16 }), 200);
}

// ---------- Estrategias e progresso ----------
function showStrategies() {
    document.getElementById('strategies').innerHTML = window.ESTRATEGIAS.map(([icon, title, text]) =>
        `<div class="strategy"><b>${icon} ${esc(title)}</b>${esc(text)}</div>`).join('');
    showScreen('strategies-screen');
}

function showReport() {
    const stats = loadJSON(STATS_KEY, {});
    const box = document.getElementById('report');
    const entries = Object.entries(stats).filter(([, s]) => s.total > 0)
        .sort((a, b) => a[1].ok / a[1].total - b[1].ok / b[1].total);
    box.innerHTML = entries.length ? entries.map(([t, s]) => {
        const pct = Math.round(100 * s.ok / s.total);
        const cls = pct >= 80 ? 'high' : pct >= 50 ? 'mid' : 'low';
        return `<div class="skill"><div class="skill-head"><span>${esc(t)}</span><b>${s.ok}/${s.total}</b></div>
            <div class="bar"><div class="fill ${cls}" style="width:${pct}%"></div></div></div>`;
    }).join('') : '<p class="empty">Faça um treino para ver seu progresso.</p>';
    showScreen('report-screen');
}

function resetReport() {
    saveJSON(STATS_KEY, {});
    showReport();
}

document.addEventListener('DOMContentLoaded', renderStart);
