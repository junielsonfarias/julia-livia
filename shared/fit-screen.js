// ==========================================
// Ajuste automatico de tela - Mundo de Julia & Livia
// Faz a tela ATIVA do jogo caber inteira na janela, sem rolagem
// vertical nem horizontal: se o conteudo passar do tamanho da tela,
// ele e encolhido (zoom) so o necessario. Abaixo de um limite (para
// nao ficar pequeno demais para ler/tocar), deixa rolar.
// Desligar numa pagina: <body data-fit="off">
// ==========================================
(function () {
    const MIN_SCALE = 0.6;
    let scheduled = false;
    let current = null;

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

    function setScale(el, s) {
        const v = s === 1 ? '' : String(Math.round(s * 1000) / 1000);
        if (el.style.zoom !== v) el.style.zoom = v;
    }

    function fit() {
        scheduled = false;
        if (document.body.dataset.fit === 'off') return;
        const el = target();
        if (!el) return;
        if (current && current !== el) setScale(current, 1);
        current = el;

        setScale(el, 1);
        let o = overflow();
        if (o.y <= 1 && o.x <= 1) return;

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
    }

    function schedule() {
        if (scheduled) return;
        scheduled = true;
        setTimeout(fit, 40);   // (setTimeout em vez de requestAnimationFrame: funciona tambem em janelas pausadas)
    }

    function start() {
        document.documentElement.classList.add('fit-screen');
        const style = document.createElement('style');
        style.textContent = 'html.fit-screen, html.fit-screen body { overflow-x: hidden; }';
        document.head.appendChild(style);
        schedule();
        window.addEventListener('resize', schedule);
        window.addEventListener('orientationchange', schedule);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
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
