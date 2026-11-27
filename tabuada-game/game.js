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
        streak: 0,
        gen: 0,          // muda a cada novo jogo: invalida timeouts pendentes do jogo anterior
        finished: true,
        sessionTotal: 0
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

    const NIVEIS = ['easy','medium','hard'];
    const NOME_NIVEL = { easy:'Fácil', medium:'Médio', hard:'Difícil' };
    const playerId = ()=> (($('player-select')||{}).value || 'julia');
    function loadAdaptLevel(){ try{ const v = localStorage.getItem('tabuada_nivel_' + playerId()); return NIVEIS.includes(v) ? v : null; }catch(e){ return null; } }
    function saveAdaptLevel(v){ try{ localStorage.setItem('tabuada_nivel_' + playerId(), v); }catch(e){} }
    function clearAdaptLevel(){ try{ ['julia','livia'].forEach(p=>localStorage.removeItem('tabuada_nivel_' + p)); }catch(e){} }

    // Mostra nivel e sequencia (combo) na barra de status
    function renderLevelStreak(){
        const lv = $('level-badge'); if (lv) lv.textContent = 'Nível: ' + NOME_NIVEL[state.difficulty];
        const st = $('streak-badge');
        if (st){
            st.textContent = state.streak >= 2 ? '🔥 ' + state.streak : '';
            st.classList.toggle('on', state.streak >= 2);
        }
    }

    // Ajusta o nivel e refaz as perguntas que ainda nao apareceram
    function adapt(firstTryCorrect){
        if (firstTryCorrect){ state.adaptUp++; state.adaptDown = 0; }
        else { state.adaptDown++; state.adaptUp = 0; }
        const i = NIVEIS.indexOf(state.difficulty);
        let novo = null;
        if (state.adaptUp >= 3 && i < NIVEIS.length - 1) novo = NIVEIS[i + 1];
        if (state.adaptDown >= 2 && i > 0) novo = NIVEIS[i - 1];
        if (!novo) return;
        const subiu = NIVEIS.indexOf(novo) > i;
        state.difficulty = novo;
        state.adaptUp = 0; state.adaptDown = 0;
        saveAdaptLevel(novo);
        for (let k = state.current + 1; k < state.total; k++){
            const q = generateQuestionWithOps(state.base, state.opsUsed);
            applyKind(q, state.kindChoice);
            state.questions[k] = q;
        }
        renderLevelStreak();
        const lv = $('level-badge');
        if (lv && window.Efeitos){
            Efeitos.pulo(lv, 1);
            Efeitos.texto(lv, subiu ? 'Nível subiu! ⬆️' : 'Mais fácil 💛', { cor: subiu ? '#7c3aed' : '#e17000' });
        }
    }

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
            state.base = $('base-select') ? $('base-select').value : (s.base || 'random');
            state.total = parseInt(s.defaultCount,10) || 10;
            state.mode = s.defaultMode || 'mcq';
            state.difficulty = s.defaultLevel || 'medium';
            state.timePerQuestion = (s.perQuestion !== undefined && s.perQuestion !== null) ? (parseInt(s.perQuestion,10) || 0) : difficultyDefaultTime(state.difficulty);
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

        const salvo = loadAdaptLevel();
        if (salvo) state.difficulty = salvo;
        state.adaptUp = 0;
        state.adaptDown = 0;
        state.current = 0;
        state.correct = 0;
        state.questions = [];
        state.streak = 0;
        state.gen++;
        state.finished = false;
        state.memTest = null;
        clearTimer();

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
        // Tipo de pergunta (4º ano): conta, numero que falta, problemas ou misturado
        const kindSel = $('kind-select');
        const kindChoice = kindSel ? kindSel.value : 'conta';
        state.kindChoice = kindChoice;
        state.questions.forEach(q => applyKind(q, kindChoice));
        // evitar repetir exatamente a mesma sequência da última vez, se configurado
        const sig = state.questions.map(q=>`${q.a}${q.op}${q.b}`).join('|');
        if (state.avoidRepeat !== false) {
            if (state.prevSignature && state.prevSignature === sig) {
                // embaralhar as alternativas
                state.questions = shuffleArr(state.questions);
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
    state.sessionTotal = sessSec;
    startSessionTimer(sessSec);
        renderAchievements();
        renderLevelStreak();
        renderQuestion();
        playSfx('enter');
    }

    function renderQuestion(){
        clearTimer();
        const qidx = state.current;
        const total = state.total;
        if (qidx >= total){ return finishGame(); }

        const q = state.questions[qidx];
        state.question = q;
        const myGen = state.gen;
        $('next-btn').classList.add('hidden');
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
            if (myGen !== state.gen || state.finished || state.memTest) return;
            $('progress').textContent = `Pergunta ${qidx+1} / ${total}`;
            $('score').textContent = `Pontos: ${state.correct}`;
            // montar texto conforme operação
            $('question-text').innerHTML = q.text || `Quanto é ${q.a} ${q.op} ${q.b} ?`;
            $('question-text').classList.toggle('long-text', q.kind === 'problema');

            const container = $('choices');
            container.innerHTML = '';

            if (state.mode === 'mcq'){
                const choices = makeChoices(q.answer);
                choices.forEach(c => {
                    const btn = document.createElement('button');
                    btn.className = 'choice-btn';
                    btn.dataset.value = c;
                    btn.textContent = c;
                    btn.onclick = ()=> chooseAnswer(c, btn);
                    container.appendChild(btn);
                });
                // animate choices with a small stagger
                setTimeout(()=>{
                    const els = container.querySelectorAll('.choice-btn');
                    els.forEach((el,i)=>{
                        try{
                            el.classList.remove('choice-pop');
                            el.style.animationDelay = (i*70) + 'ms';
                            // force reflow to restart animation
                            void el.offsetWidth;
                            el.classList.add('choice-pop');
                            // cleanup after animation
                            setTimeout(()=>{ el.classList.remove('choice-pop'); el.style.animationDelay = ''; }, 900);
                        }catch(e){}
                    });
                }, 40);
            } else {
                const inputWrap = document.createElement('div');
                inputWrap.className = 'input-wrap';

                const input = document.createElement('input');
                input.type = 'number';
                input.className = 'choice-input';
                input.inputMode = 'numeric';   // teclado de numeros no tablet
                input.setAttribute('aria-label','Resposta numérica');

                const submit = document.createElement('button');
                submit.className = 'primary';
                submit.textContent = 'Enviar';
                submit.onclick = ()=> {
                    const val = parseInt(input.value,10);
                    // campo vazio: nao conta como erro (toque sem querer no Enviar)
                    if (isNaN(val)) { input.focus(); return; }
                    chooseAnswer(val, submit);
                };

                input.addEventListener('keydown', (e)=>{ if (e.key === 'Enter') submit.click(); });
                inputWrap.appendChild(input);
                inputWrap.appendChild(submit);
                container.appendChild(inputWrap);
                input.focus();
                // animate input wrap for pop effect
                setTimeout(()=>{ try{ inputWrap.classList.add('pop-in'); setTimeout(()=>{ inputWrap.classList.remove('pop-in'); }, 700); }catch(e){} }, 60);
            }

            $('hint-area').classList.add('hidden');
            $('next-btn').classList.add('hidden');
            $('hint-btn').disabled = false;
            q.wrongTries = 0;
            renderLevelStreak();

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
                // pop-in and fade-in for nicer entrance
                card.classList.add('fade-in');
                // also add pop-in for scale effect
                card.classList.add('pop-in');
                // remove classes after animations finish
                setTimeout(()=>{
                    card.classList.remove('fade-in');
                    card.classList.remove('pop-in');
                }, 560);
            }, 200);
        } else {
            doRender();
        }
    }

    // Tempo acabou: sem castigo. Para o relogio e mostra uma dica; ela continua respondendo.
    function timeUpGently(){
        const q = state.question;
        if (!q || q.answered || state.finished) return;
        const bar = document.getElementById('question-timer-bar'); if (bar) bar.style.width = '0%';
        if ($('hint-btn') && !$('hint-btn').disabled) showHint(q);
        const p = $('progress'); if (p) p.textContent = `Pergunta ${state.current+1} / ${state.total} — sem pressa 😊`;
    }

    function chooseAnswer(value, btn){
        if (!state.question || state.question.answered || state.finished) return;
        const qobj = state.question;
        const correct = qobj.answer;
        const isCorrect = (parseInt(value,10) === correct);

        // ---- Errou: a opcao apaga, a dica aparece; no 2º erro a certa brilha ----
        if (!isCorrect){
            qobj.wrongTries = (qobj.wrongTries || 0) + 1;
            if (qobj.wrongTries === 1) { state.streak = 0; adapt(false); }
            renderLevelStreak();
            playSfx('pop');
            if (state.mode === 'mcq'){
                if (btn){ btn.disabled = true; btn.classList.add('faded'); if (window.Efeitos) Efeitos.erro(btn); }
                if (qobj.wrongTries === 1){
                    showHint(qobj);
                    return;
                }
                const btns = [...document.querySelectorAll('#choices .choice-btn')];
                const rest = btns.filter(b2 => !b2.disabled && parseInt(b2.dataset.value,10) !== correct);
                if (rest.length > 1){ rest[0].disabled = true; rest[0].classList.add('faded'); }
                const right = btns.find(b2 => parseInt(b2.dataset.value,10) === correct);
                if (right) right.classList.add('hint-glow');
                showExplanation(qobj);
                clearTimer();
                return;
            }
            // modo digitar: 1º erro = dica e tenta de novo; 2º = mostra a conta e o botao Proxima
            const inp = document.querySelector('#choices .choice-input');
            if (inp && window.Efeitos) Efeitos.erro(inp.parentNode);
            if (qobj.wrongTries === 1){
                showHint(qobj);
                if (inp){ inp.value = ''; inp.focus(); }
                return;
            }
            qobj.answered = true;
            qobj.correct = false;
            clearTimer();
            document.querySelectorAll('#choices button, #choices input').forEach(b2=>b2.disabled=true);
            showExplanation(qobj);
            $('hint-btn').disabled = true;
            const nb = $('next-btn');
            nb.classList.remove('hidden');
            nb.disabled = false;
            checkAchievements();
            return;
        }

        // ---- Acertou ----
        qobj.answered = true;
        clearTimer();
        // So os controles da pergunta: '.primary' tambem pegava Começar, Jogar novamente, Teste de
        // Memorização, Progresso e Configurações, que ficavam desabilitados depois da ultima pergunta.
        document.querySelectorAll('#choices button, #choices input').forEach(b2=>b2.disabled=true);
        document.querySelectorAll('#choices .hint-glow').forEach(b2=>b2.classList.remove('hint-glow'));
        qobj.responseTime = qobj.startTime ? (Date.now() - qobj.startTime) : null;
        const first = !qobj.wrongTries;
        qobj.correct = first;
        if (first){
            state.correct++;
            state.streak++;
            adapt(true);
        }
        markElement(btn, 'correct');
        playSfx('correct');
        // nota que sobe a cada acerto seguido (combo)
        if (first && state.sound && window.KidsAudio) setTimeout(()=>KidsAudio.note(Math.min(state.streak - 1, 10)), 320);
        provideFeedback(true, btn, first);
        renderLevelStreak();

        $('score').textContent = `Pontos: ${state.correct}`;
        $('hint-btn').disabled = true;
        $('next-btn').classList.add('hidden');
        checkAchievements();

        // avanca sozinho: feedback, fade-out do cartao e a proxima entra
        const advGen = state.gen;
        const feedbackMs = first ? 900 : 1300;
        const fadeMs = 260; // deve combinar com .fade-out CSS timing
        setTimeout(()=>{
            if (advGen !== state.gen || state.finished) return;
            const card = document.getElementById('question-card');
            if (card) card.classList.add('fade-out');
            setTimeout(()=>{
                if (advGen !== state.gen || state.finished) return;   // jogo reiniciado/encerrado
                try{
                    if (sessionRemaining <= 0) return finishGame();
                    state.current++;
                    if (state.current >= state.total) return finishGame();
                    const card2 = document.getElementById('question-card'); if (card2) card2.classList.remove('fade-out');
                    renderQuestion();
                }catch(err){
                    console.error('Erro ao avançar para proxima pergunta:', err);
                    try{ state.current++; if (state.current < state.total) renderQuestion(); else finishGame(); }catch(e2){ finishGame(); }
                }
            }, fadeMs);
        }, feedbackMs);
    }

    function markElement(el, kind){
        if (!el) return;
        if (kind === 'correct') el.classList.add('correct');
        if (kind === 'wrong') el.classList.add('wrong');
    }

    // confetti implementation (small, lightweight) - moved to top-level so other helpers can use it
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

    // visual feedback (confetti, glow, vibration)
    function provideFeedback(isCorrect, btn, first){
        const card = document.getElementById('question-card');
        const scoreEl = $('score');
        if (isCorrect){
            if (scoreEl){ scoreEl.classList.add('pulse'); setTimeout(()=>scoreEl.classList.remove('pulse'),900); }
            if (card){ card.classList.add('correct-glow'); setTimeout(()=>card.classList.remove('correct-glow'),900); }
            if (window.Efeitos){
                const alvo = (btn && btn.isConnected) ? btn : card;
                const combo = first && state.streak >= 3;
                Efeitos.acerto(alvo, { texto: combo ? '🔥 ' + state.streak + ' seguidas!' : (first ? '+1' : '👍'), emoji: combo ? ['🔥','⭐','✨'] : ['⭐','✨'] });
            } else {
                createConfetti(12);
            }
        } else {
            if (card){ card.classList.add('shake','wrong-glow'); setTimeout(()=>card.classList.remove('shake','wrong-glow'),800); }
            try{ if (navigator.vibrate) navigator.vibrate([80,40,80]); }catch(e){}
        }
    }

    function nextQuestion(){
        const nb = $('next-btn');
        if (nb.classList.contains('hidden') || state.finished || state.memTest) return;
        nb.classList.add('hidden');
        playSfx('click');
        if (sessionRemaining <= 0) return finishGame();
        state.current++;
        if (state.current >= state.total) return finishGame();
        renderQuestion();
    }

    function showExplanation(q){
        if (!q) return;
        let explanation = '';
        const qa = Object.assign({}, q, { answer: q.res !== undefined ? q.res : q.answer });
        q = qa;

        if (q.op === '+') {
            explanation = `<strong>Soma:</strong> ${q.a} + ${q.b} = ${q.answer}`;
        } else if (q.op === '-') {
            explanation = `<strong>Subtração:</strong> ${q.a} - ${q.b} = ${q.answer}`;
        } else if (q.op === '×' || q.op === '*') {
            const plus = Array(q.b).fill(q.a).join(' + ');
            const grid = generateGrid(q.a,q.b);
            explanation = `<strong>Adição repetida:</strong> ${plus} = ${q.answer}<br><strong>Visual:</strong><br>${grid}`;
        } else if (q.op === '÷' || q.op === '/') {
            explanation = `<strong>Divisão:</strong> ${q.a} ÷ ${q.b} = ${q.answer}<br><strong>Verificação:</strong> ${q.answer} × ${q.b} = ${q.a}`;
        } else {
            explanation = `<strong>Resultado:</strong> ${q.a} ${q.op} ${q.b} = ${q.answer}`;
        }

        if (q.kind === 'falta') {
            explanation = `<strong>O número que falta é ${q.missing}</strong>, porque ${q.a} ${q.op} ${q.b} = ${q.answer}.<br>` +
                `💡 Use a operação inversa: ${inverseTip(q)}<br>` + explanation;
        } else if (q.kind === 'problema') {
            explanation = `<strong>A conta do problema:</strong> ${q.a} ${q.op} ${q.b} = ${q.answer}. ${q.why || ''}<br>` + explanation;
        }
        $('hint-area').innerHTML = explanation;
        $('hint-area').classList.remove('hidden');
    }

    // Dica de verdade (sem entregar a resposta)
    function showHint(q){
        if (!q) return;
        let tip = '';
        if (q.kind === 'falta') tip = 'Use a operação inversa: ' + inverseTip(q, true);
        else if (q.kind === 'problema') tip = 'Leia de novo: a história fala em juntar, tirar, grupos iguais ou repartir? ' + (q.why || '');
        else if (q.op === '×') {
            if (q.a === 9 || q.b === 9) { const o = q.a === 9 ? q.b : q.a; tip = `Truque do 9: faça ${o} × 10 e depois tire ${o}.`; }
            else if (q.a === 5 || q.b === 5) { const o = q.a === 5 ? q.b : q.a; tip = `Truque do 5: é a metade de ${o} × 10.`; }
            else if (q.a === 4 || q.b === 4) { const o = q.a === 4 ? q.b : q.a; tip = `Truque do 4: é o dobro do dobro de ${o}.`; }
            else tip = `Pense em ${q.a} grupos de ${q.b}. Se souber ${q.a} × ${Math.max(1, q.b - 1)}, é só somar mais ${q.a}.`;
        } else if (q.op === '÷') tip = `Pense: qual número vezes ${q.b} dá ${q.a}? Procure na tabuada do ${q.b}.`;
        else if (q.op === '+') tip = `Some primeiro as dezenas, depois as unidades. Ou complete até a próxima dezena.`;
        else tip = `Conte para frente a partir de ${q.b} até chegar em ${q.a}.`;
        $('hint-area').innerHTML = '💡 <strong>Dica:</strong> ' + tip;
        $('hint-area').classList.remove('hidden');
        $('hint-btn').disabled = true;
    }

    function inverseTip(q, hideAnswer){
        const r = q.res !== undefined ? q.res : q.answer;
        const show = v => hideAnswer ? '?' : v;
        if (q.op === '×') return q.unknown === 'a' ? `? × ${q.b} = ${r} → ${r} ÷ ${q.b} = ${show(q.a)}` : `${q.a} × ? = ${r} → ${r} ÷ ${q.a} = ${show(q.b)}`;
        if (q.op === '÷') return q.unknown === 'a' ? `? ÷ ${q.b} = ${r} → ${r} × ${q.b} = ${show(q.a)}` : `${q.a} ÷ ? = ${r} → ${q.a} ÷ ${r} = ${show(q.b)}`;
        if (q.op === '+') return `${q.a} + ? = ${r} → ${r} − ${q.a} = ${show(q.b)}`;
        return `${q.a} − ? = ${r} → ${q.a} − ${r} = ${show(q.b)}`;
    }

    // ---------- Tipos de pergunta ----------
    function pickOne(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

    const PROBLEMAS = {
        '×': [
            (a,b) => [`Uma caixa tem ${b} lápis. Quantos lápis há em ${a} caixas iguais?`, 'São grupos iguais: multiplicação.'],
            (a,b) => [`Julia cola ${a} figurinhas em cada página do álbum. Quantas figurinhas ela cola em ${b} páginas?`, '“Em cada página” + várias páginas = multiplicação.'],
            (a,b) => [`Um teatro tem ${a} fileiras com ${b} cadeiras em cada uma. Quantas cadeiras há ao todo?`, 'Fileiras × cadeiras de cada fileira.'],
            (a,b) => [`Cada pacote tem ${b} biscoitos. Livia comprou ${a} pacotes. Quantos biscoitos ela comprou?`, 'Pacotes iguais: multiplicação.']
        ],
        '÷': [
            (a,b) => [`${a} balas foram repartidas igualmente entre ${b} crianças. Quantas balas cada criança recebeu?`, '“Repartir igualmente” = divisão.'],
            (a,b) => [`A professora tem ${a} alunos e vai formar grupos de ${b} alunos. Quantos grupos ela vai formar?`, '“Quantos grupos de…” = divisão (quantas vezes cabe).'],
            (a,b) => [`Uma fita de ${a} metros foi cortada em ${b} pedaços iguais. Quantos metros tem cada pedaço?`, 'Pedaços iguais = divisão.']
        ],
        '+': [
            (a,b) => [`Livia tinha ${a} adesivos e ganhou ${b} da vovó. Com quantos adesivos ela ficou?`, '“Ganhou” = juntar: adição.'],
            (a,b) => [`Na festa havia ${a} meninas e ${b} meninos. Quantas crianças havia ao todo?`, '“Ao todo” = adição.']
        ],
        '-': [
            (a,b) => [`Havia ${a} pássaros na árvore. ${b} voaram. Quantos pássaros ficaram?`, '“Voaram / ficaram” = tirar: subtração.'],
            (a,b) => [`Julia tem ${a} reais e Livia tem ${b} reais. Quantos reais Julia tem a mais que Livia?`, '“A mais que” = diferença: subtração.']
        ]
    };

    function applyKind(q, choice){
        q.res = q.answer;
        let kind = choice === 'misto' ? pickOne(['conta','falta','problema']) : (choice || 'conta');
        if (kind === 'problema' && q.op === '-' && q.a === q.b) kind = 'conta';
        // Evita historinhas sem sentido como "em 1 páginas" ou "repartidas entre 1 crianças"
        if (kind === 'problema' && (q.op === '×' || q.op === '*' || q.op === '÷' || q.op === '/') && (q.a === 1 || q.b === 1)) kind = 'conta';
        q.kind = kind;
        if (kind === 'falta') {
            const unknownA = (q.op === '×' || q.op === '÷') ? Math.random() < 0.5 : false;
            q.unknown = unknownA ? 'a' : 'b';
            q.missing = unknownA ? q.a : q.b;
            const left = unknownA ? `<span class="missing">?</span> ${q.op} ${q.b}` : `${q.a} ${q.op} <span class="missing">?</span>`;
            q.text = `Qual número completa a conta?<br><span class="equation">${left} = ${q.res}</span>`;
            q.answer = q.missing;
        } else if (kind === 'problema') {
            const op = (q.op === '*') ? '×' : (q.op === '/') ? '÷' : q.op;
            const [text, why] = pickOne(PROBLEMAS[op] || PROBLEMAS['×'])(q.a, q.b);
            q.text = text;
            q.why = why;
        }
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
        if (state.finished) return;   // evita encerrar duas vezes (ex.: fim da sessao + avanco pendente)
        state.finished = true;
        clearTimer();
        clearSessionTimer();
        // visual + som feedback de final de sessão
        try{
            if (window.Efeitos) Efeitos.vitoria(); else createConfetti(18);
            const percent = Math.round((state.correct / state.total) * 100);
            playSfx(percent === 100 ? 'perfect' : 'win');
            try{ if (navigator.vibrate) navigator.vibrate(160); }catch(e){}
        }catch(e){}
        $('play-area').classList.add('hidden');
        $('next-btn').classList.add('hidden');
        $('hint-area').classList.add('hidden');
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
                // tempo acabou: nao conta como erro, so oferece uma dica
                timeUpGently();
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

    // Sons: prefere o audio compartilhado (KidsAudio, um unico AudioContext);
    // se nao estiver carregado, usa o playSound da pagina principal (iframe).
    const SFX_MAP = { enter: 'start', perfect: 'win' };
    function playSfx(type){
        if (!state.sound) return;
        try{
            if (window.KidsAudio) { window.KidsAudio.play(SFX_MAP[type] || type); return; }
        }catch(e){}
        postMessageToParent(type);
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
            perQuestion: 40,
            sound: 'on',
            avoidRepeat: '1',
            base: 'random'
        };
    }

    // default per-question time by difficulty (in seconds)
    function difficultyDefaultTime(level){
        if (level === 'easy') return 60;
        if (level === 'hard') return 15;
        return 40; // medium
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
            perQuestion: (function(){ const v = parseInt($('settings-per-question').value,10); return isNaN(v) ? 20 : Math.max(0, v); })(),
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

    // Fallback local (sem KidsAudio e fora do iframe): usa o mesmo KidsAudio se aparecer depois
    function playLocalSound(type){
        try{ if (window.KidsAudio) window.KidsAudio.play(SFX_MAP[type] || type); }catch(e){}
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
                sessionSeconds: (state.sessionTotal || SESSION_SECONDS_DEFAULT) - Math.max(0, sessionRemaining)
            };
            sessions.push(session);
            localStorage.setItem(key, JSON.stringify(sessions));
            // save last session questions for memorization
            localStorage.setItem(`tabuada_last_${player}`, JSON.stringify(state.questions.map(q=>({a:q.a,b:q.b,op:q.op,answer:(q.res !== undefined ? q.res : q.answer),correct:q.correct}))));
        }catch(e){ console.log('Erro salvando progresso', e); }
    }

    function showProgressPanel(){
        const player = ($('player-select')||{}).value || 'julia';
        const key = `tabuada_progress_${player}`;
        let list = [];
        try{ const raw = localStorage.getItem(key); list = raw ? JSON.parse(raw) : []; }catch(e){ list = []; }
        const el = $('progress-list');
        if (!el) return;
        if (list.length === 0) el.innerHTML = '<p>Nenhuma sessão registrada ainda.</p>';
        else {
            el.innerHTML = list.slice().reverse().map(s=>{
                const d = new Date(s.date).toLocaleString();
                const avg = s.avgResponseMs ? (s.avgResponseMs/1000).toFixed(2)+'s' : '-';
                return `<div class="progress-item"><strong>${d}</strong> — ${s.correct}/${s.total} (${s.percent}%) — tempo médio: ${avg} — ops: ${(s.opsUsed || []).join(', ')} — diff: ${s.difficulty}</div>`;
            }).join('');
        }
        // show panel
        $('result-area').classList.add('hidden');
        $('progress-panel').classList.remove('hidden');
    }

    function closeProgressPanel(){
        $('progress-panel').classList.add('hidden');
        // so volta ao resultado se ja houve um jogo (antes mostrava um "Resultado" vazio)
        if (state.finished && state.questions.length) $('result-area').classList.remove('hidden');
    }

    // Memorization test: uses last session questions saved for player
    function startMemTest(){
        const player = ($('player-select')||{}).value || 'julia';
        const raw = localStorage.getItem(`tabuada_last_${player}`);
        let pool = null;
        try{ pool = raw ? JSON.parse(raw) : null; }catch(e){ pool = null; }
        if (!pool || pool.length === 0) {
            // fallback to current state questions
            pool = state.questions.map(q=>({a:q.a,b:q.b,op:q.op,answer:(q.res !== undefined ? q.res : q.answer)}));
        }
        if (!pool || pool.length === 0) return alert('Nenhuma sessão anterior para testar. Jogue uma sessão primeiro.');

        // pick up to 8 questions randomly
        pool = shuffleArr(pool).slice(0, Math.min(8, pool.length));

        // prepare memtest state
        state.memTest = {
            queue: pool.map(q=>({...q})),
            index: 0,
            correct: 0,
            times: []
        };

        // show play area and hide result area
        clearSessionTimer();
        state.gen++;
        $('result-area').classList.add('hidden');
        $('play-area').classList.remove('hidden');
        $('next-btn').classList.add('hidden');
        $('hint-area').classList.add('hidden');
        const rbm = $('restart-btn'); if (rbm) rbm.classList.add('hidden');
        const gt = $('game-timer'); if (gt) gt.textContent = '';
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
        const input = document.createElement('input'); input.type='number'; input.className='choice-input'; input.inputMode='numeric'; input.style.padding='10px'; input.style.borderRadius='8px';
        const submit = document.createElement('button'); submit.className='primary'; submit.textContent='Enviar';
        submit.onclick = ()=>{
            if (submit.disabled || !state.memTest) return;
            const val = parseInt(input.value,10);
            if (isNaN(val)) { input.focus(); return; }   // campo vazio nao conta
            submit.disabled = true;
            const respMs = Date.now() - state.question.startTime;
            const correct = (val === state.question.answer);
            state.memTest.times.push(respMs);
            if (correct) state.memTest.correct++;
            playSfx(correct ? 'correct' : 'pop');
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
        // sem isso o resultado ficava invisivel: '.container.minimal .result-area{display:none}'
        const cont = document.querySelector('.container'); if (cont) cont.classList.remove('minimal');
        $('hint-btn').disabled = false;
        $('result-summary').innerHTML = `Teste de memorização: você acertou <strong>${mem.correct}</strong> de <strong>${mem.queue.length}</strong>. Tempo médio: <strong>${(avgMs/1000).toFixed(2)}s</strong>`;
        state.memTest = null;
    }

    function shuffleArr(arr){
        const a = arr.slice();
        for (let i = a.length-1; i > 0; i--){
            const j = Math.floor(Math.random()*(i+1));
            [a[i],a[j]] = [a[j],a[i]];
        }
        return a;
    }

    function retry(){
        startGame();
    }

    // eventos
    document.addEventListener('DOMContentLoaded', ()=>{
        $('start-btn').addEventListener('click', startGame);
        $('next-btn').addEventListener('click', nextQuestion);
        $('hint-btn').addEventListener('click', ()=>{ showHint(state.question); });
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
        // when difficulty changes, update per-question timer default to match difficulty
        const diffSel = document.getElementById('difficulty-select');
        if (diffSel) diffSel.addEventListener('change', clearAdaptLevel);
        const setLv = document.getElementById('settings-default-level');
        if (setLv) setLv.addEventListener('change', clearAdaptLevel);
        const timerSel = document.getElementById('timer-select');
        if (diffSel && timerSel){
            diffSel.addEventListener('change', (e)=>{
                const v = difficultyDefaultTime(e.target.value);
                // set timer-select to difficulty default (user can override)
                timerSel.value = String(v);
            });
        }
        // initialize quick controls from saved settings if use-settings is checked
        const ucb = document.getElementById('use-settings-checkbox');
        // Mexeu numa opcao rapida: passa a valer o que esta na tela
        // (com "Usar Configuracoes do Painel" marcado, essas escolhas eram ignoradas sem aviso)
        ['count-select','mode-select','difficulty-select','timer-select','sound-select'].forEach(id => {
            const el = $(id);
            if (el && ucb) el.addEventListener('change', ()=>{ ucb.checked = false; });
        });
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
