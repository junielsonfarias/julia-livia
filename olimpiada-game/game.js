// ==========================================
// Treino Olimpico - Julia (4º ano)
// Treino: dica opcional + resolucao comentada apos cada questao.
// Simulado: 10 questoes em ordem de dificuldade, 20 minutos, correcao no final.
// ==========================================

const STATS_KEY = 'olimpiada_stats_v1';
const RECORD_KEY = 'olimpiada_simulado_recorde_v1';
const SIM_SECONDS = 20 * 60;
const LETTERS = ['A', 'B', 'C', 'D', 'E'];

const state = {
    mode: 'treino', topic: null,
    questions: [], index: 0, tries: 0, usedHint: false,
    answers: [],        // simulado: { q, chosenText }
    correct: 0, points: 0,
    clock: null, timeLeft: SIM_SECONDS
};

function goBack() {
    stopClock();
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
const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

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
    state.mode = mode;
    state.topic = topic || null;
    state.index = 0;
    state.correct = 0;
    state.points = 0;
    state.answers = [];
    const all = window.OLIMPIADA;
    const byLevel = n => shuffle(all.filter(q => q.nivel === n));

    if (mode === 'simulado') {
        state.questions = [...byLevel(1).slice(0, 3), ...byLevel(2).slice(0, 4), ...byLevel(3).slice(0, 3)];
        state.timeLeft = SIM_SECONDS;
        startClock();
    } else {
        const pool = topic ? all.filter(q => q.tema === topic) : all;
        state.questions = shuffle(pool).slice(0, 8).sort((a, b) => a.nivel - b.nivel);
        stopClock();
    }
    KidsAudio.play('start');
    showScreen('question-screen');
    showQuestion();
}

// ---------- Relogio do simulado ----------
function startClock() {
    stopClock();
    const el = document.getElementById('clock');
    el.hidden = false;
    renderClock();
    state.clock = setInterval(() => {
        state.timeLeft--;
        renderClock();
        if (state.timeLeft <= 0) { stopClock(); finishSimulado(true); }
    }, 1000);
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
    v.style.color = state.timeLeft <= 120 ? '#d63031' : '';
}

// ---------- Questao ----------
function showQuestion() {
    const q = state.questions[state.index];
    state.tries = 0;
    state.usedHint = false;
    document.getElementById('progress-label').innerHTML = `Questão <strong>${state.index + 1}</strong>/${state.questions.length}`;
    document.getElementById('q-topic').textContent = '🧩 ' + q.tema;
    document.getElementById('q-level').textContent = '⭐'.repeat(q.nivel) + '☆'.repeat(3 - q.nivel);
    document.getElementById('q-text').textContent = q.q;
    document.getElementById('q-figure').innerHTML = q.figura || '';
    document.getElementById('q-feedback').innerHTML = '';
    document.getElementById('q-feedback').className = 'feedback';
    document.getElementById('tools').hidden = state.mode === 'simulado';
    document.getElementById('hint-btn').disabled = false;

    const next = document.getElementById('q-next');
    next.hidden = state.mode !== 'simulado';
    next.disabled = state.mode === 'simulado';
    next.textContent = state.index + 1 >= state.questions.length
        ? (state.mode === 'simulado' ? 'Entregar a prova ✔' : 'Ver resultado 🏆') : 'Próxima ➜';

    const box = document.getElementById('q-options');
    box.innerHTML = '';
    shuffle(q.op.map((text, i) => ({ text, ok: i === 0 }))).forEach((o, i) => {
        const b = document.createElement('button');
        b.className = 'option';
        b.dataset.ok = o.ok ? '1' : '0';
        b.innerHTML = `<span class="letter">${LETTERS[i]}</span>${esc(o.text)}`;
        b.onclick = () => state.mode === 'simulado' ? chooseSimulado(b, o.text) : answerTreino(b, o.ok);
        box.appendChild(b);
    });
}

function showHint() {
    const q = state.questions[state.index];
    state.usedHint = true;
    document.getElementById('hint-btn').disabled = true;
    const fb = document.getElementById('q-feedback');
    fb.className = 'feedback bad';
    fb.innerHTML = `💡 <b>Dica (${esc(q.estrategia)}):</b> ${esc(q.dica)}`;
    KidsAudio.play('click');
}

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
        revealSolution(first ? '✅ Muito bem!' : '✅ Agora sim!');
    } else {
        btn.classList.add('wrong');
        btn.disabled = true;
        btn.classList.remove('shake'); void btn.offsetWidth; btn.classList.add('shake');
        KidsAudio.play('wrong');
        if (state.tries >= 2) {
            record(q.tema, false);
            document.querySelector('#q-options .option[data-ok="1"]').classList.add('correct', 'revealed');
            revealSolution('A resposta certa está em verde.');
        } else {
            fb.className = 'feedback bad';
            fb.innerHTML = `🤔 Não é essa. ${state.usedHint ? 'Releia a dica e tente de novo!' : 'Pense de novo — se quiser, peça uma dica.'}`;
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

function chooseSimulado(btn, text) {
    document.querySelectorAll('#q-options .option').forEach(b => b.classList.remove('chosen'));
    btn.classList.add('chosen');
    state.answers[state.index] = { q: state.questions[state.index], chosen: text };
    document.getElementById('q-next').disabled = false;
    KidsAudio.play('click');
}

function nextQuestion() {
    state.index++;
    if (state.index >= state.questions.length) {
        return state.mode === 'simulado' ? finishSimulado(false) : finishTreino();
    }
    showQuestion();
}

// ---------- Resultados ----------
function finishTreino() {
    const total = state.questions.length;
    document.getElementById('final-score').textContent = `${state.correct}/${total}`;
    document.getElementById('final-label').textContent = 'acertos de primeira';
    const pct = state.correct / total;
    document.getElementById('result-icon').textContent = pct >= .8 ? '🥇' : pct >= .5 ? '🥈' : '🥉';
    document.getElementById('result-title').textContent = pct >= .8 ? 'Medalha de ouro!' : pct >= .5 ? 'Muito bem!' : 'Continue treinando!';
    document.getElementById('result-msg').textContent =
        `Você fez ${state.points} pontos. Nas olimpíadas, quem treina estratégias vai cada vez melhor!`;
    document.getElementById('review').innerHTML = '';
    document.getElementById('progress-label').textContent = '';
    showScreen('result-screen');
    KidsAudio.play('win');
}

function finishSimulado(timeUp) {
    stopClock();
    let score = 0;
    const review = state.questions.map((q, i) => {
        const a = state.answers[i];
        const ok = !!a && a.chosen === q.op[0];
        if (ok) score++;
        record(q.tema, ok);
        return `<div class="review-item ${ok ? 'ok' : 'bad'}">
            <p><b>${i + 1}. ${esc(q.tema)}</b> ${'⭐'.repeat(q.nivel)} — ${ok ? '✅ Acertou' : a ? '❌ Você marcou: ' + esc(a.chosen) : '⚪ Em branco'}</p>
            ${ok ? '' : `<p>${esc(q.q)}</p><p><b>Resposta:</b> ${esc(q.op[0])}</p><p class="sol">📝 ${esc(q.sol)}</p>`}
        </div>`;
    }).join('');

    const rec = loadJSON(RECORD_KEY, null);
    const isRecord = !rec || score > rec.score;
    if (isRecord) saveJSON(RECORD_KEY, { score, date: new Date().toISOString() });

    document.getElementById('final-score').textContent = `${score}/10`;
    document.getElementById('final-label').textContent = 'acertos no simulado';
    document.getElementById('result-icon').textContent = score >= 8 ? '🥇' : score >= 6 ? '🥈' : score >= 4 ? '🥉' : '📚';
    document.getElementById('result-title').textContent = timeUp ? '⏰ Tempo esgotado!' : 'Prova entregue!';
    document.getElementById('result-msg').textContent =
        (isRecord && score > 0 ? '🏆 Novo recorde! ' : '') +
        'Leia a resolução das questões que você errou: é assim que se aprende para a olimpíada.';
    document.getElementById('review').innerHTML = review;
    document.getElementById('progress-label').textContent = '';
    showScreen('result-screen');
    KidsAudio.play(score >= 6 ? 'win' : 'star');
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
    const entries = Object.entries(stats).sort((a, b) => a[1].ok / a[1].total - b[1].ok / b[1].total);
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
