// Tabuada Divertida - lógica do jogo (com modo de entrada, temporizador, niveis, sons e conquistas)
(function(){
    const $ = (id)=>document.getElementById(id);

    let state = {
        base: 'random',
        total: 10,
        current: 0,
        correct: 0,
        question: null,
        questions: [],
        mode: 'mcq',
        difficulty: 'medium',
        timePerQuestion: 0,
        sound: true,
        timerId: null,
        remainingSec: 0,
        streak: 0
    };
    // sessão (tempo total de jogo) em segundos e id
    const SESSION_SECONDS_DEFAULT = 10 * 60; // 10 minutos
    let sessionTimerId = null;
    let sessionRemaining = SESSION_SECONDS_DEFAULT;

    function goBack(){
        // Verifica se esta em um iframe
        if (window.parent !== window) {
            try {
                if (window.parent.closeGameModal) {
                    window.parent.closeGameModal();
                    return;
                }
            } catch(e) {}
        }
        // Fallback para navegacao normal
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '../index.html';
        }
    }
    window.goBack = goBack;

    function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min }

    function difficultyRange(diff){
        if (diff === 'easy') return {min:1, max:5};
        if (diff === 'hard') return {min:2, max:12};
        return {min:1, max:10}; // medium
    }

    // compute result for operation
    function computeAnswer(a,b,op){
        if (op === '+') return a + b;
        if (op === '-') return a - b;
        if (op === '×' || op === '*') return a * b;
        if (op === '÷' || op === '/') return Math.round(a / b);
        return a * b;
    }

    // Generate a single question object considering operations and base selection
    function generateQuestionWithOps(base, ops){
        const range = difficultyRange(state.difficulty);
        // pick operation for this question
        const op = ops[randInt(0, ops.length-1)];
        let a, b, answer;

        if (op === '+'){
            if (base !== 'random'){
                a = parseInt(base,10);
                b = randInt(range.min, range.max);
            } else {
                a = randInt(range.min, range.max);
                b = randInt(range.min, range.max);
            }
            answer = computeAnswer(a,b,op);
        } else if (op === '-'){
            // ensure non-negative
            b = randInt(range.min, range.max);
            const extra = randInt(0, range.max);
            a = b + extra;
            if (base !== 'random') a = Math.max(a, parseInt(base,10));
            answer = computeAnswer(a,b,op);
        } else if (op === '×' || op === '*'){
            if (base !== 'random'){
                a = parseInt(base,10);
                b = randInt(range.min, range.max);
            } else {
                a = randInt(range.min, range.max);
                b = randInt(range.min, range.max);
            }
            answer = computeAnswer(a,b,'×');
        } else if (op === '÷' || op === '/'){
            // generate dividend so division is exact
            if (base !== 'random'){
                const divisor = parseInt(base,10);
                const quotient = randInt(range.min, range.max);
                a = divisor * quotient; // dividend
                b = divisor; // divisor
                answer = quotient;
            } else {
                b = randInt(range.min, range.max);
                const quotient = randInt(range.min, range.max);
                a = b * quotient;
                answer = quotient;
            }
        } else {
            // fallback multiplication
            a = randInt(range.min, range.max);
            b = randInt(range.min, range.max);
            answer = computeAnswer(a,b,'×');
        }

        return {a,b,op,answer, startTime: null, responseTime: null, correct: null};
    }

    function makeChoices(correct){
        const choices = new Set([correct]);
        const spread = state.difficulty === 'hard' ? 12 : 6;
        while(choices.size < 4){
            const delta = randInt(1, spread);
            const sign = Math.random() < 0.5 ? -1 : 1;
            let val = correct + sign*delta;
            if (val < 0) val = Math.abs(val)+1;
            choices.add(val);
        }
        const arr = Array.from(choices);
        // shuffle
        for (let i = arr.length-1;i>0;i--){
            const j = Math.floor(Math.random()*(i+1));
            [arr[i],arr[j]]=[arr[j],arr[i]];
        }
        return arr;
    }

    function startGame(){
        // se a checkbox usar configurações do painel estiver marcada, carregar de settings
        const useSettings = document.getElementById('use-settings-checkbox') ? document.getElementById('use-settings-checkbox').checked : true;
        if (useSettings) {
            const s = loadSettings();
            state.base = s.base || 'random';
            state.total = parseInt(s.defaultCount,10) || 10;
            state.mode = s.defaultMode || 'mcq';
            state.difficulty = s.defaultLevel || 'medium';
            state.timePerQuestion = parseInt(s.perQuestion,10) || 0;
            state.sound = (s.sound||'on') === 'on';
            // if operations explicitly defined in settings, use them
            state.opsFromSettings = s.ops || null;
            // session length override
            state.sessionMinutes = parseInt(s.sessionMin,10) || null;
            // avoid repeat
            state.avoidRepeat = s.avoidRepeat === '1';
        } else {
            state.base = $('base-select').value;
            state.total = parseInt($('count-select').value,10) || 10;
            state.mode = $('mode-select').value || 'mcq';
            state.difficulty = $('difficulty-select').value || 'medium';
            state.timePerQuestion = parseInt($('timer-select').value,10) || 0;
            state.sound = ($('sound-select').value || 'on') === 'on';
            state.opsFromSettings = null;
            state.sessionMinutes = null;
            state.avoidRepeat = true;
        }

        state.current = 0;
        state.correct = 0;
        state.questions = [];
        state.streak = 0;

        // decide operações com base na dificuldade ou nas configurações
        const allOps = ['+','-','×','÷'];
        let ops = [];
        if (state.opsFromSettings && Array.isArray(state.opsFromSettings) && state.opsFromSettings.length>0){
            ops = state.opsFromSettings.slice();
        } else {
            if (state.difficulty === 'easy'){
                // 1 operation (pick preferentially multiplication if difficulty default)
                ops = [ allOps[randInt(0, allOps.length-1)] ];
            } else if (state.difficulty === 'medium'){
                // duas operações únicas
                while (ops.length < 2) {
                    const c = allOps[randInt(0, allOps.length-1)];
                    if (!ops.includes(c)) ops.push(c);
                }
            } else {
                ops = allOps.slice();
            }
        }
        state.opsUsed = ops;

        // gerar questões garantindo variação entre sessões
        for (let i=0;i<state.total;i++){
            state.questions.push(generateQuestionWithOps(state.base, state.opsUsed));
        }
        // evitar repetir exatamente a mesma sequência da última vez, se configurado
        const sig = state.questions.map(q=>`${q.a}${q.op}${q.b}`).join('|');
        if (state.avoidRepeat !== false) {
            if (state.prevSignature && state.prevSignature === sig) {
                // embaralhar as alternativas
                state.questions = state.questions.sort(()=>Math.random()-0.5);
            }
            state.prevSignature = sig;
        }

        $('start-btn').classList.add('hidden');
        $('play-area').classList.remove('hidden');
        $('result-area').classList.add('hidden');
        // esconder painel de opções para focar apenas na pergunta
        const cont = document.querySelector('.container');
        if (cont) cont.classList.add('minimal');
        // mostrar botão de reiniciar
        const rb = $('restart-btn'); if (rb) { rb.classList.remove('hidden'); rb.disabled = false; }
    // iniciar timer de sessão (valor do settings ou padrão 10 minutos)
    const sessSec = state.sessionMinutes ? (parseInt(state.sessionMinutes,10)*60) : SESSION_SECONDS_DEFAULT;
    startSessionTimer(sessSec);
        renderAchievements();
        renderQuestion();
        if (state.sound) postMessageToParent('enter');
    }

    function renderQuestion(){
        clearTimer();
        const qidx = state.current;
        const total = state.total;
        if (qidx >= total){ return finishGame(); }

        const q = state.questions[qidx];
        state.question = q;
        // decor alternado para "decoração"
        const card = document.getElementById('question-card');
        if (card) {
            card.classList.remove('decor-1','decor-2');
            card.classList.add((qidx % 2 === 0) ? 'decor-1' : 'decor-2');
        }
        // registrar hora de inicio
        q.startTime = Date.now();

        // prepare renderer so we can animate fade-out / fade-in
        const doRender = ()=>{
            $('progress').textContent = `Pergunta ${qidx+1} / ${total}`;
            $('score').textContent = `Pontos: ${state.correct}`;
            // montar texto conforme operação
            $('question-text').textContent = `Quanto é ${q.a} ${q.op} ${q.b} ?`;

            const container = $('choices');
            container.innerHTML = '';

            if (state.mode === 'mcq'){
                const choices = makeChoices(q.answer);
                choices.forEach(c => {
                    const btn = document.createElement('button');
                    btn.className = 'choice-btn';
                    btn.textContent = c;
                    btn.onclick = ()=> chooseAnswer(c, btn);
                    container.appendChild(btn);
                });
            } else {
                const inputWrap = document.createElement('div');
                inputWrap.className = 'input-wrap';

                const input = document.createElement('input');
                input.type = 'number';
                input.className = 'choice-input';
                input.setAttribute('aria-label','Resposta numérica');

                const submit = document.createElement('button');
                submit.className = 'primary';
                submit.textContent = 'Enviar';
                submit.onclick = ()=> {
                    const val = parseInt(input.value,10);
                    chooseAnswer(val, submit);
                };

                input.addEventListener('keydown', (e)=>{ if (e.key === 'Enter') submit.click(); });
                inputWrap.appendChild(input);
                inputWrap.appendChild(submit);
                container.appendChild(inputWrap);
                input.focus();
            }

            $('hint-area').classList.add('hidden');
            $('next-btn').classList.add('hidden');
            $('hint-btn').disabled = false;

            // start timer if enabled
            if (state.timePerQuestion > 0){
                startTimer(state.timePerQuestion);
            }
        };

        // animate
        if (card){
            card.classList.add('fade-out');
            setTimeout(()=>{
                card.classList.remove('fade-out');
                doRender();
                card.classList.add('fade-in');
                setTimeout(()=>card.classList.remove('fade-in'), 360);
            }, 200);
        } else {
            doRender();
        }
    }

    function chooseAnswer(value, btn){
        clearTimer();
        const correct = state.question.answer;
        // disable all interactive elements
        document.querySelectorAll('.choice-btn, .choice-input, .primary').forEach(b=>b.disabled=true);
        // calcular tempo de resposta
        const qobj = state.question;
        const respMs = qobj.startTime ? (Date.now() - qobj.startTime) : null;
        qobj.responseTime = respMs;

        let isCorrect = (parseInt(value,10) === correct);
        if (isCorrect){
            state.correct++;
            state.streak++;
            markElement(btn, 'correct');
            if (state.sound){ const p = postMessageToParent('correct'); if (!p) playMelody('correct'); }
            provideFeedback(true);
        } else {
            state.streak = 0;
            markElement(btn, 'wrong');
            // highlight correct option if present
            document.querySelectorAll('.choice-btn').forEach(b=>{
                if (parseInt(b.textContent,10)===correct) b.classList.add('correct');
            });
            if (state.sound){ const pw = postMessageToParent('wrong'); if (!pw) playMelody('wrong'); }
            provideFeedback(false);
        }

        qobj.correct = !!isCorrect;

        // explanation always shown
        showExplanation(state.question);

        // update score
        $('score').textContent = `Pontos: ${state.correct}`;
        $('hint-btn').disabled = true;
        // hide manual next button (avanco automatico)
        $('next-btn').classList.add('hidden');

        // achievements check
        checkAchievements();

        // avançar automaticamente de forma mais suave:
        // - toca feedback (visual/som)
        // - aguarda a animação de feedback, aplica fade-out no cartão
        // - após fade, avança para próxima pergunta e renderiza com fade-in
        (function scheduleAdvance(correct){
            const feedbackMs = correct ? 600 : 1000; // tempo para feedback (pop/shake/confetti)
            const fadeMs = 260; // deve combinar com .fade-out CSS timing
            // agendar início do fade depois do feedback
            setTimeout(()=>{
                const card = document.getElementById('question-card');
                if (card){
                    card.classList.add('fade-out');
                }
                // depois do fade, avançar e renderizar (com tolerância a erros)
                setTimeout(()=>{
                    try{
                        if (sessionRemaining <= 0) return finishGame();
                        state.current++;
                        if (state.current >= state.total) return finishGame();
                        // garantir que o fade-out seja removido no render
                        const card2 = document.getElementById('question-card'); if (card2) card2.classList.remove('fade-out');
                        // reabilitar controles por precaucao antes de render
                        try{ document.querySelectorAll('.choice-btn, .choice-input, .primary').forEach(b=>b.disabled=false); }catch(e){}
                        renderQuestion();
                    }catch(err){
                        console.error('Erro ao avançar para proxima pergunta:', err);
                        // tentativa de recuperacao simples
                        try{ state.current++; if (state.current < state.total) renderQuestion(); else finishGame(); }catch(e2){ finishGame(); }
                    }
                }, fadeMs);
            }, feedbackMs);
        })(isCorrect);
    }

    function markElement(el, kind){
        if (!el) return;
        if (kind === 'correct') el.classList.add('correct');
        if (kind === 'wrong') el.classList.add('wrong');
    }

    // visual feedback (confetti, glow, vibration)
    function provideFeedback(isCorrect){
        const card = document.getElementById('question-card');
        const scoreEl = $('score');
        if (isCorrect){
            if (scoreEl){ scoreEl.classList.add('pulse'); setTimeout(()=>scoreEl.classList.remove('pulse'),900); }
            if (card){ card.classList.add('correct-glow'); setTimeout(()=>card.classList.remove('correct-glow'),900); }
            createConfetti(12);
            try{ if (navigator.vibrate) navigator.vibrate(120); }catch(e){}
        } else {
            if (card){ card.classList.add('shake','wrong-glow'); setTimeout(()=>card.classList.remove('shake','wrong-glow'),800); }
            try{ if (navigator.vibrate) navigator.vibrate([80,40,80]); }catch(e){}
        }
    }

    function nextQuestion(){
        state.current++;
        renderQuestion();
    }

    function showExplanation(q){
        if (!q) return;
        const plus = Array(q.b).fill(q.a).join(' + ');
        const grid = generateGrid(q.a,q.b);
        $('hint-area').innerHTML = `<strong>Adição repetida:</strong> ${plus} = ${q.answer}<br><strong>Visual:</strong><br>${grid}`;
        $('hint-area').classList.remove('hidden');
    }

    function generateGrid(a,b){
        const rows = Math.min(10, Math.max(1,a));
        const cols = Math.min(10, Math.max(1,b));
        let out = '<div style="display:inline-block;line-height:0.9;">';
        for (let r=0;r<rows;r++){
            for (let c=0;c<cols;c++){
                out += '<span style="display:inline-block;margin:2px">🔵</span>';

            }
            out += '<br>';
        }
        out += '</div>';
        return out;
    }

    function finishGame(){
        clearTimer();
        clearSessionTimer();

    // visual + som feedback
    function triggerCorrectFeedback(){
        // pulse score
        const scoreEl = $('score'); if (scoreEl){ scoreEl.classList.add('pulse'); setTimeout(()=>scoreEl.classList.remove('pulse'),900); }
        // glow card
        const card = document.getElementById('question-card'); if (card){ card.classList.add('correct-glow'); setTimeout(()=>card.classList.remove('correct-glow'),900); }
        // confetti
        createConfetti(18);
    // som: prefer parent audio, fallback to local melody
    const parentPlayed = postMessageToParent('correct');
    if (!parentPlayed && state.sound) playMelody('correct');
        // small vibration if supported
        try{ if (navigator.vibrate) navigator.vibrate(120); }catch(e){}
    }

    function triggerWrongFeedback(){
        // shake card
        const card = document.getElementById('question-card'); if (card){ card.classList.add('shake','wrong-glow'); setTimeout(()=>card.classList.remove('shake','wrong-glow'),800); }
    // sound: try parent then local melody
    const parentPlayedW = postMessageToParent('wrong');
    if (!parentPlayedW && state.sound) playMelody('wrong');
    try{ if (navigator.vibrate) navigator.vibrate([80,40,80]); }catch(e){}
    }

    // confetti implementation (small, lightweight)
    function createConfetti(count){
        const colors = ['#ff6b6b','#ffd166','#6ee7b7','#7dd3fc','#b39ddb','#ffb86b'];
        for (let i=0;i<count;i++){
            const el = document.createElement('div');
            el.className = 'confetti-piece';
            const size = Math.floor(Math.random()*10)+8;
            el.style.width = size + 'px'; el.style.height = Math.floor(size*1.2)+'px';
            el.style.left = (50 + (Math.random()*40-20)) + '%';
            el.style.top = '-10vh';
            el.style.background = colors[Math.floor(Math.random()*colors.length)];
            const delay = Math.random()*300;
            el.style.transform = `translate3d(0,0,0) rotate(${Math.random()*360}deg)`;
            el.style.animation = `confettiFall ${1200 + Math.random()*1400}ms linear ${delay}ms forwards`;
            document.body.appendChild(el);
            // remove after animation
            setTimeout(()=>{ try{ el.remove(); }catch(e){} }, 3000 + delay);
        }
    }
        $('play-area').classList.add('hidden');
        $('result-area').classList.remove('hidden');
        const percent = Math.round((state.correct / state.total) * 100);
        $('result-summary').innerHTML = `Você acertou <strong>${state.correct}</strong> de <strong>${state.total}</strong> perguntas. (${percent}%)`;
        // guardar melhor resultado simples
        try{
            const best = parseInt(localStorage.getItem('tabuada_best')||'0',10);
            if (state.correct > best) localStorage.setItem('tabuada_best', state.correct);
        }catch(e){ }
        // salvar progresso da jogadora
        saveSessionProgress();
        // mostrar conquistas obtidas nessa rodada
        renderAchievements(true);
        // special melody for perfect score
        try{
            const percentNow = Math.round((state.correct / state.total) * 100);
            if (percentNow === 100 && state.sound){ const p = postMessageToParent('perfect'); if (!p) playMelody('perfect'); }
        }catch(e){}
        $('start-btn').classList.remove('hidden');
        // restaurar UI completa
        const cont = document.querySelector('.container');
        if (cont) cont.classList.remove('minimal');
        // esconder restart
        const rb = $('restart-btn'); if (rb) { rb.classList.add('hidden'); }
    }

    // Timer helpers (smooth visual timer bar)
    function startTimer(seconds){
        // track milliseconds for smooth animation
        state.remainingMs = (seconds||0) * 1000;
        renderTimer();
        if (state.timerId) clearInterval(state.timerId);
        state.timerId = setInterval(()=>{
            state.remainingMs -= 100;
            if (state.remainingMs < 0) state.remainingMs = 0;
            renderTimer();
            if (state.remainingMs <= 0){
                clearTimer();
                // marcar como erro por tempo
                chooseAnswer(null, {classList: {add: ()=>{}}, textContent: 'Tempo'} );
            }
        }, 100);
    }

    function renderTimer(){
        const prog = $('progress');
        if (state.timePerQuestion > 0){
            const sec = Math.ceil((state.remainingMs||0)/1000);
            prog.textContent = `Pergunta ${state.current+1} / ${state.total} — Tempo: ${sec}s`;
            updateTimerBar();
        }
    }

    function clearTimer(){
        if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
        const bar = document.getElementById('question-timer-bar'); if (bar) { bar.style.width = '0%'; bar.classList.remove('timer-low'); }
        delete state.remainingMs;
    }

    function updateTimerBar(){
        const bar = document.getElementById('question-timer-bar');
        if (!bar) return;
        const totalMs = (state.timePerQuestion||0) * 1000;
        const rem = state.remainingMs || 0;
        const pct = totalMs > 0 ? Math.max(0, Math.min(100, Math.round((rem/totalMs)*100))) : 0;
        bar.style.width = pct + '%';
        if (pct <= 30) bar.classList.add('timer-low'); else bar.classList.remove('timer-low');
    }

    // Session (global) timer functions
    function startSessionTimer(seconds){
        clearSessionTimer();
        sessionRemaining = seconds || SESSION_SECONDS_DEFAULT;
        renderSessionTimer();
        sessionTimerId = setInterval(()=>{
            sessionRemaining -= 1;
            renderSessionTimer();
            if (sessionRemaining <= 0){
                clearSessionTimer();
                // tempo de sessão esgotado: encerra jogo
                finishGame();
            }
        }, 1000);
    }

    function renderSessionTimer(){
        const el = $('game-timer');
        if (!el) return;
        const min = Math.floor(sessionRemaining/60).toString().padStart(2,'0');
        const sec = (sessionRemaining%60).toString().padStart(2,'0');
        el.textContent = `Tempo: ${min}:${sec}`;
    }

    function clearSessionTimer(){
        if (sessionTimerId) { clearInterval(sessionTimerId); sessionTimerId = null; }
    }

    // Achievements
    const ACHIEVEMENTS = [
        {id:'first-game', title:'Primeiro Jogo', desc:'Jogar a primeira vez'},
        {id:'perfect', title:'Perfeito', desc:'Acertar todas as perguntas'},
        {id:'good', title:'Ótimo', desc:'Acertar >=80%'},
        {id:'streak-5', title:'Sequência', desc:'5 acertos seguidos'}
    ];

    function loadAchievements(){
        try{
            const raw = localStorage.getItem('tabuada_achievements');
            return raw ? JSON.parse(raw) : {};
        }catch(e){ return {}; }
    }

    function saveAchievement(id){
        try{
            const all = loadAchievements();
            if (!all[id]){
                all[id] = {earnedAt: new Date().toISOString()};
                localStorage.setItem('tabuada_achievements', JSON.stringify(all));
            }
        }catch(e){}
    }

    function renderAchievements(showNew){
        const el = $('achievements');
        const resultEl = $('result-achievements');
        if (!el && !resultEl) return;
        const all = loadAchievements();
        const html = ACHIEVEMENTS.map(a=>{
            const earned = all[a.id];
            return `<div class="badge ${earned? 'earned':''}" title="${a.desc}"><strong>${a.title}</strong>${earned?'<div class="earned-at">'+new Date(earned.earnedAt).toLocaleDateString()+'</div>':''}</div>`;
        }).join('');
        if (el) el.innerHTML = html;
        if (resultEl) resultEl.innerHTML = html;
    }

    function checkAchievements(){
        // first game
        try{ if (!localStorage.getItem('tabuada_played')){ saveAchievement('first-game'); localStorage.setItem('tabuada_played','1'); } }catch(e){}

        // streak
        if (state.streak >= 5) saveAchievement('streak-5');

        // final achievements (evaluated at end too)
        const percent = Math.round((state.correct / state.total) * 100);
        if (percent === 100) saveAchievement('perfect');
        if (percent >= 80) saveAchievement('good');

        renderAchievements();
    }

    // small helper to call parent for sound (if in iframe)
    function postMessageToParent(type){
        // try parent (host) first, otherwise play locally
        try{
            if (!state.sound) return;
            if (window.parent && window.parent.playSound) { window.parent.playSound(type); return true; }
        }catch(e){}
        // fallback local
        if (state.sound) playLocalSound(type);
        return false;
    }

    // Settings persistence and UI
    const SETTINGS_KEY = 'tabuada_settings';

    function loadSettings(){
        try{
            const raw = localStorage.getItem(SETTINGS_KEY);
            if (!raw) return defaultSettings();
            const s = JSON.parse(raw);
            // normalize ops
            if (s.ops && typeof s.ops === 'string') s.ops = s.ops.split(',');
            return Object.assign({}, defaultSettings(), s || {});
        }catch(e){ return defaultSettings(); }
    }

    function saveSettingsObj(obj){
        try{ localStorage.setItem(SETTINGS_KEY, JSON.stringify(obj)); return true; }catch(e){ return false; }
    }

    function defaultSettings(){
        return {
            ops: ['×'],
            defaultLevel: 'medium',
            defaultMode: 'mcq',
            defaultCount: 10,
            sessionMin: 10,
            perQuestion: 20,
            sound: 'on',
            avoidRepeat: '1',
            base: 'random'
        };
    }

    function openSettings(){
        const panel = $('settings-panel'); if (!panel) return;
        const s = loadSettings();
        // populate inputs
        $('op-add').checked = (s.ops||[]).includes('+');
        $('op-sub').checked = (s.ops||[]).includes('-');
        $('op-mul').checked = (s.ops||[]).includes('×');
        $('op-div').checked = (s.ops||[]).includes('÷');
        $('settings-default-level').value = s.defaultLevel;
        $('settings-default-mode').value = s.defaultMode;
        $('settings-default-count').value = s.defaultCount;
        $('settings-session-min').value = s.sessionMin;
        $('settings-per-question').value = s.perQuestion;
        $('settings-sound').value = s.sound;
        $('settings-avoid-repeat').value = s.avoidRepeat ? s.avoidRepeat : '1';
        panel.classList.remove('hidden');
    }

    function closeSettings(){
        const panel = $('settings-panel'); if (!panel) return; panel.classList.add('hidden');
    }

    function saveSettings(){
        const ops = [];
        if ($('op-add').checked) ops.push('+');
        if ($('op-sub').checked) ops.push('-');
        if ($('op-mul').checked) ops.push('×');
        if ($('op-div').checked) ops.push('÷');
        const obj = {
            ops,
            defaultLevel: $('settings-default-level').value,
            defaultMode: $('settings-default-mode').value,
            defaultCount: parseInt($('settings-default-count').value,10) || 10,
            sessionMin: parseInt($('settings-session-min').value,10) || 10,
            perQuestion: parseInt($('settings-per-question').value,10) || 20,
            sound: $('settings-sound').value || 'on',
            avoidRepeat: $('settings-avoid-repeat').value || '1'
        };
        saveSettingsObj(obj);
        closeSettings();
        // also reflect to quick controls
        const useSettings = document.getElementById('use-settings-checkbox');
        if (useSettings && useSettings.checked){
            // update visible selects to reflect saved defaults
            $('count-select').value = obj.defaultCount;
            $('mode-select').value = obj.defaultMode;
            $('difficulty-select').value = obj.defaultLevel;
            $('timer-select').value = obj.perQuestion;
            $('sound-select').value = obj.sound;
        }
    }

    // local simple sounds (WebAudio)
    function playLocalSound(type){
        try {
            if (!window.AudioContext && !window.webkitAudioContext) return;
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioCtx();
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination);
            const now = ctx.currentTime;
            if (type === 'correct') { o.frequency.setValueAtTime(880, now); g.gain.setValueAtTime(0.001, now); g.gain.exponentialRampToValueAtTime(0.16, now+0.001); g.gain.exponentialRampToValueAtTime(0.0001, now+0.3); }
            else if (type === 'wrong') { o.frequency.setValueAtTime(220, now); g.gain.setValueAtTime(0.001, now); g.gain.exponentialRampToValueAtTime(0.12, now+0.001); g.gain.exponentialRampToValueAtTime(0.0001, now+0.4); }
            else if (type === 'enter' || type === 'click') { o.frequency.setValueAtTime(660, now); g.gain.setValueAtTime(0.001, now); g.gain.exponentialRampToValueAtTime(0.12, now+0.001); g.gain.exponentialRampToValueAtTime(0.0001, now+0.18); }
            o.start(now); o.stop(now + 0.5);
            setTimeout(()=>{ try{ o.disconnect(); g.disconnect(); ctx.close(); }catch(e){} }, 700);
        } catch(e){}
    }

    // melodic sequences (small multi-note cues)
    function playMelody(kind){
        try{
            if (!state.sound) return;
            if (window.parent && window.parent.playSound && typeof window.parent.playSound === 'function'){
                // let parent try first - prefer centralized audio
                try{ window.parent.playSound(kind); return; }catch(e){}
            }
            if (!window.AudioContext && !window.webkitAudioContext) return;
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioCtx();
            const now = ctx.currentTime;
            const master = ctx.createGain(); master.connect(ctx.destination); master.gain.setValueAtTime(0.001, now);
            const osc = ctx.createOscillator(); osc.type = 'sine'; osc.connect(master);
            const seq = { correct: [660,880,1040], perfect: [740,880,1040,1320], wrong: [220,180] }[kind] || [440];
            let t = now;
            master.gain.exponentialRampToValueAtTime(0.12, t+0.01);
            osc.start(now);
            seq.forEach((freq, i)=>{
                const dur = (i===seq.length-1) ? 0.28 : 0.12;
                osc.frequency.setValueAtTime(freq, t);
                t += dur;
            });
            // fade out
            master.gain.exponentialRampToValueAtTime(0.0001, t+0.02);
            osc.stop(t+0.03);
            setTimeout(()=>{ try{ osc.disconnect(); master.disconnect(); ctx.close(); }catch(e){} }, Math.round((t-now+0.1)*1000));
        }catch(e){}
    }

    // Save session progress per player
    function saveSessionProgress(){
        try{
            const player = ($('player-select')||{}).value || 'julia';
            const key = `tabuada_progress_${player}`;
            const sessionsRaw = localStorage.getItem(key);
            const sessions = sessionsRaw ? JSON.parse(sessionsRaw) : [];
            const answered = state.questions.filter(q => q.responseTime !== null);
            const avgMs = answered.length ? Math.round(answered.reduce((s,q)=>s+ (q.responseTime||0),0)/answered.length) : 0;
            const percent = Math.round((state.correct / state.total) * 100);
            const now = new Date().toISOString();
            const session = {
                date: now,
                total: state.total,
                correct: state.correct,
                percent,
                avgResponseMs: avgMs,
                opsUsed: state.opsUsed || [],
                difficulty: state.difficulty,
                sessionSeconds: SESSION_SECONDS_DEFAULT - sessionRemaining
            };
            sessions.push(session);
            localStorage.setItem(key, JSON.stringify(sessions));
            // save last session questions for memorization
            localStorage.setItem(`tabuada_last_${player}`, JSON.stringify(state.questions.map(q=>({a:q.a,b:q.b,op:q.op,answer:q.answer,correct:q.correct}))));
        }catch(e){ console.log('Erro salvando progresso', e); }
    }

    function showProgressPanel(){
        const player = ($('player-select')||{}).value || 'julia';
        const key = `tabuada_progress_${player}`;
        const raw = localStorage.getItem(key);
        const list = raw ? JSON.parse(raw) : [];
        const el = $('progress-list');
        if (!el) return;
        if (list.length === 0) el.innerHTML = '<p>Nenhuma sessao registrada ainda.</p>';
        else {
            el.innerHTML = list.slice().reverse().map(s=>{
                const d = new Date(s.date).toLocaleString();
                const avg = s.avgResponseMs ? (s.avgResponseMs/1000).toFixed(2)+'s' : '-';
                return `<div class="progress-item"><strong>${d}</strong> — ${s.correct}/${s.total} (${s.percent}%) — tempo médio: ${avg} — ops: ${s.opsUsed.join(', ')} — diff: ${s.difficulty}</div>`;
            }).join('');
        }
        // show panel
        $('result-area').classList.add('hidden');
        $('progress-panel').classList.remove('hidden');
    }

    function closeProgressPanel(){
        $('progress-panel').classList.add('hidden');
        $('result-area').classList.remove('hidden');
    }

    // Memorization test: uses last session questions saved for player
    function startMemTest(){
        const player = ($('player-select')||{}).value || 'julia';
        const raw = localStorage.getItem(`tabuada_last_${player}`);
        let pool = raw ? JSON.parse(raw) : null;
        if (!pool || pool.length === 0) {
            // fallback to current state questions
            pool = state.questions.map(q=>({a:q.a,b:q.b,op:q.op,answer:q.answer}));
        }
        if (!pool || pool.length === 0) return alert('Nenhuma sessão anterior para testar. Jogue uma sessão primeiro.');

        // pick up to 8 questions randomly
        pool = pool.sort(()=>Math.random()-0.5).slice(0, Math.min(8, pool.length));

        // prepare memtest state
        state.memTest = {
            queue: pool.map(q=>({...q})),
            index: 0,
            correct: 0,
            times: []
        };

        // show play area and hide result area
        $('result-area').classList.add('hidden');
        $('play-area').classList.remove('hidden');
        const cont = document.querySelector('.container'); if (cont) cont.classList.add('minimal');
        renderMemQuestion();
    }

    function renderMemQuestion(){
        clearTimer();
        const mem = state.memTest;
        if (!mem) return;
        if (mem.index >= mem.queue.length) return finishMemTest();
        const q = mem.queue[mem.index];
        // map to state.question for reuse of rendering code
        state.question = {a:q.a,b:q.b,op:q.op,answer:q.answer, startTime: Date.now()};
        $('progress').textContent = `Memória ${mem.index+1} / ${mem.queue.length}`;
        $('score').textContent = `Acertos: ${mem.correct}`;
        $('question-text').textContent = `Quanto é ${q.a} ${q.op} ${q.b} ?`;
        const container = $('choices'); container.innerHTML = '';
        // use input mode for memtest for better memorization
        const input = document.createElement('input'); input.type='number'; input.className='choice-input'; input.style.padding='10px'; input.style.borderRadius='8px';
        const submit = document.createElement('button'); submit.className='primary'; submit.textContent='Enviar';
        submit.onclick = ()=>{
            const val = parseInt(input.value,10);
            const respMs = Date.now() - state.question.startTime;
            const correct = (val === state.question.answer);
            state.memTest.times.push(respMs);
            if (correct) state.memTest.correct++;
            state.memTest.index++;
            renderMemQuestion();
        };
        input.addEventListener('keydown',(e)=>{ if (e.key === 'Enter') submit.click(); });
        container.appendChild(input); container.appendChild(submit);
        input.focus();
    }

    function finishMemTest(){
        const mem = state.memTest; if (!mem) return;
        const avgMs = mem.times.length ? Math.round(mem.times.reduce((s,t)=>s+t,0)/mem.times.length) : 0;
        $('play-area').classList.add('hidden');
        $('result-area').classList.remove('hidden');
        $('result-summary').innerHTML = `Teste de memorização: você acertou <strong>${mem.correct}</strong> de <strong>${mem.queue.length}</strong>. Tempo médio: <strong>${(avgMs/1000).toFixed(2)}s</strong>`;
        state.memTest = null;
    }

    function retry(){
        startGame();
    }

    // eventos
    document.addEventListener('DOMContentLoaded', ()=>{
        $('start-btn').addEventListener('click', startGame);
        $('next-btn').addEventListener('click', nextQuestion);
        $('hint-btn').addEventListener('click', ()=>{ showExplanation(state.question); });
        $('retry-btn').addEventListener('click', retry);
        const rb = $('restart-btn'); if (rb) rb.addEventListener('click', ()=>{ startGame(); });
        const vp = $('view-progress-btn'); if (vp) vp.addEventListener('click', showProgressPanel);
        const cp = $('close-progress'); if (cp) cp.addEventListener('click', closeProgressPanel);
        const mt = $('memtest-btn'); if (mt) mt.addEventListener('click', startMemTest);
        renderAchievements();
        // settings handlers
        const os = $('open-settings-btn'); if (os) os.addEventListener('click', openSettings);
        const ss = $('save-settings'); if (ss) ss.addEventListener('click', saveSettings);
        const cs = $('cancel-settings'); if (cs) cs.addEventListener('click', closeSettings);
        // initialize quick controls from saved settings if use-settings is checked
        const ucb = document.getElementById('use-settings-checkbox');
        if (ucb && ucb.checked){
            const s = loadSettings();
            $('count-select').value = s.defaultCount;
            $('mode-select').value = s.defaultMode;
            $('difficulty-select').value = s.defaultLevel;
            $('timer-select').value = s.perQuestion;
            $('sound-select').value = s.sound;
        }

        // expor para console se necessário
        window.tabuadaState = state;
    });

})();
