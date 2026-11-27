// ==========================================
// Ajuste automatico de tela - Mundo de Julia & Livia
// Faz a tela ATIVA do jogo caber inteira na janela, sem rolagem
// vertical nem horizontal: se o conteudo passar do tamanho da tela,
// ele e encolhido (zoom) so o necessario. Abaixo de um limite (para
// nao ficar pequeno demais para ler/tocar), deixa rolar.
// TABLET: se sobra muito espaco (tela grande, conteudo pequeno), o
// conteudo e AUMENTADO ate preencher a tela (sem passar dela).
// Desligar numa pagina: <body data-fit="off">
// So nao aumentar:      <body data-fit-grow="off">
// ==========================================
(function () {
    const MIN_SCALE = 0.6;
    const MAX_GROW = 1.5;          // no maximo 50% maior
    const GROW_MIN_WIDTH = 700;    // so em telas de tablet/computador
    let scheduled = false;
    let current = null;
    let sized = '';                // tamanho da janela da ultima medida
    let growCap = MAX_GROW;        // aumento "preso": nao cresce e encolhe a cada rodada
    let settleTimer = null;

    function target() {
        // Telas sem .screen.active: a primeira <section> realmente visivel
        const visibleSection = [...document.querySelectorAll('main section:not(.hidden):not([hidden])')]
            .find(el => el.offsetParent !== null);
        return document.querySelector('.screen.active') || visibleSection ||
               document.querySelector('main') ||
               document.querySelector('.container');
    }

    function overflow() {
        const doc = document.documentElement;
        return {
            y: doc.scrollHeight - window.innerHeight,
            x: doc.scrollWidth - window.innerWidth
        };
    }
    // Cabe? Pagina sem rolagem E a propria tela dentro da largura da janela
    // (o overflow-x escondido da pagina nao deixa a medida da pagina ver o que passou do lado)
    function fits(el) {
        const o = overflow();
        if (o.y > 1 || o.x > 1) return false;
        if (!el) return true;
        const r = el.getBoundingClientRect();
        if (r.right > window.innerWidth + 1 || r.left < -1) return false;
        return el.scrollWidth <= el.clientWidth + 1;
    }

    function setScale(el, s) {
        const v = s === 1 ? '' : String(Math.round(s * 1000) / 1000);
        if (el.style.zoom !== v) el.style.zoom = v;
    }

    // Telas em tela cheia (position fixed) ou com janela aberta por cima nao aumentam:
    // a medida da pagina nao mostra se elas passam da tela
    function canGrow(el) {
        if (document.body.dataset.fitGrow === 'off' || el.dataset.fitGrow === 'off') return false;
        if (window.innerWidth < GROW_MIN_WIDTH) return false;
        const pos = getComputedStyle(el).position;
        if (pos === 'fixed' || pos === 'absolute') return false;
        if (el.querySelector('canvas')) return false;
        // Janela (overlay) fixa aberta dentro da tela: o zoom aumentaria a janela junto
        // e ela passaria da tela sem a medida perceber
        for (const d of el.querySelectorAll('*')) {
            if (d.offsetWidth && getComputedStyle(d).position === 'fixed') return false;
        }
        const r = el.getBoundingClientRect();
        return r.height > 40;
    }

    function fit() {
        scheduled = false;
        if (document.body.dataset.fit === 'off') return;
        const el = target();
        if (!el) return;
        const size = window.innerWidth + 'x' + window.innerHeight;
        if (current !== el || sized !== size) {
            growCap = MAX_GROW;   // tela nova ou girou o tablet
            // mede de novo depois da animacao de entrada da tela (fadeIn com deslocamento)
            clearTimeout(settleTimer);
            settleTimer = setTimeout(schedule, 480);
        }
        if (current && current !== el) setScale(current, 1);
        current = el;
        sized = size;

        setScale(el, 1);
        let o = overflow();
        if (o.y <= 1 && o.x <= 1) {
            grow(el);
            return;
        }

        // Encolhe aos poucos, medindo de novo a cada passo (o cabecalho nao encolhe,
        // entao uma conta so nao basta). No maximo 6 passos.
        let s = 1;
        for (let i = 0; i < 6 && (o.y > 1 || o.x > 1) && s > MIN_SCALE; i++) {
            const doc = document.documentElement;
            const ry = o.y > 1 ? (doc.scrollHeight - o.y) / doc.scrollHeight : 1;
            const rx = o.x > 1 ? (doc.scrollWidth - o.x) / doc.scrollWidth : 1;
            // a parte que encolhe e menor que a pagina toda: exagera um pouco o passo
            const step = Math.min(ry, rx);
            s = Math.max(MIN_SCALE, s * (1 - (1 - step) * 1.35) - 0.005);
            setScale(el, s);
            o = overflow();
        }
        growCap = Math.min(growCap, 1);
    }

    // Aumenta enquanto couber (busca binaria, 6 medidas). O maior aumento usado
    // fica como limite ate a tela mudar: assim o jogo nao "pula" de tamanho a cada rodada.
    function grow(el) {
        if (growCap <= 1.02 || !canGrow(el)) return;
        let lo = 1, hi = growCap;
        setScale(el, hi);
        if (fits(el)) { growCap = hi; return; }
        for (let i = 0; i < 6; i++) {
            const mid = (lo + hi) / 2;
            setScale(el, mid);
            if (fits(el)) lo = mid; else hi = mid;
        }
        // um pouco de folga para nao encostar na borda
        const s = lo > 1.02 ? lo * 0.97 : 1;
        setScale(el, s);
        growCap = s;
    }

    function schedule() {
        if (scheduled) return;
        scheduled = true;
        setTimeout(fit, 40);   // (setTimeout em vez de requestAnimationFrame: funciona tambem em janelas pausadas)
    }

    // Estilos para toque (tablet/celular) valendo em todos os jogos
    const TOUCH_CSS = `
        html.fit-screen, html.fit-screen body { overflow-x: hidden; }
        html.fit-screen { -webkit-tap-highlight-color: transparent; -webkit-text-size-adjust: 100%; }
        html.fit-screen button, html.fit-screen [onclick], html.fit-screen select, html.fit-screen label {
            touch-action: manipulation; -webkit-user-select: none; user-select: none; }
        @media (pointer: coarse), (min-width: 700px) and (max-width: 1400px) and (hover: none) {
            html.fit-screen .back-btn, html.fit-screen .back { min-height: 48px; min-width: 56px; padding-left: 20px; padding-right: 20px; }
            html.fit-screen input[type="checkbox"], html.fit-screen input[type="radio"] { width: 28px; height: 28px; min-width: 28px; }
            html.fit-screen select { min-height: 48px; }
            html.fit-screen .link-btn { min-height: 44px; padding: 8px 12px; }
        }`;

    function start() {
        document.documentElement.classList.add('fit-screen');
        const style = document.createElement('style');
        style.textContent = TOUCH_CSS;
        document.head.appendChild(style);
        schedule();
        window.addEventListener('resize', schedule);
        window.addEventListener('orientationchange', schedule);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
        // pesos da fonte que chegam depois mudam o tamanho do texto: mede de novo
        if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', schedule);
        window.addEventListener('load', () => { schedule(); setTimeout(schedule, 1200); });
        // Reajusta quando a tela do jogo muda (nova pergunta, nova tela...).
        // NAO observa "style": o proprio zoom muda o style e criaria um ciclo.
        new MutationObserver(schedule).observe(document.body, {
            childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden']
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();

    window.FitScreen = { refresh: schedule };
})();
