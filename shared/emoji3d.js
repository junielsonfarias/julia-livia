// ==========================================
// Figuras 3D - Mundo de Julia & Livia
// Troca emojis por figuras 3D com luz e sombra (Fluent Emoji 3D da Microsoft,
// licenca MIT, via pacote @lobehub/fluent-emoji-3d no jsDelivr). Cada figura
// tem ~4 KB (webp) e fica guardada pelo sw.js para funcionar sem internet.
// Sem internet na primeira vez (ou figura inexistente): mostra o emoji normal.
//
//   Emoji3D.url('🦄')             -> endereco da figura
//   Emoji3D.img('🦄', 'classe')   -> <img> pronto (com reserva para o emoji em texto)
//   Emoji3D.html('🦄', 'classe')  -> mesmo <img> como texto HTML (para innerHTML)
//   Emoji3D.trocar(raiz)          -> troca todos os [data-e3d] dentro de raiz
//   <span data-e3d>🦄</span>       -> trocado sozinho ao carregar e quando aparece na tela
//   Emoji3D.carregar(['🦄','🌈'])  -> pre-carrega imagens (para canvas)
//   Emoji3D.imagem('🦄')           -> HTMLImageElement ja carregando (para drawImage)
// Desligar tudo: localStorage.emoji3d = 'off'
// ==========================================
(function () {
    const BASE = 'https://cdn.jsdelivr.net/npm/@lobehub/fluent-emoji-3d@1.1.0/assets/';
    // Simbolos antigos (abaixo de U+3000) que ja sao emoji sem o seletor FE0F
    const SEM_FE0F = new Set(('2b1b 2b1c 2b50 2b55 23e9 23ea 23eb 23ec 23f0 23f3 25fd 25fe 26a1 26a7 26aa 26ab 26bd ' +
        '26be 26c4 26c5 26ce 26d4 26ea 26f2 26f3 26f5 26fa 26fd 27b0 27bf 231a 231b 264a 264b 264c 264d 264e 264f ' +
        '267f 270a 270b 274c 274e 2614 2615 2648 2649 2650 2651 2652 2653 2693 2705 2728 2753 2754 2755 2757 2795 2796 2797').split(' '));

    const ligado = () => { try { return localStorage.getItem('emoji3d') !== 'off'; } catch (e) { return true; } };

    function codigo(ch) {
        const cps = [...String(ch).trim()].map(c => c.codePointAt(0).toString(16));
        if (!cps.length) return '';
        // emoji de um simbolo antigo escrito sem FE0F (ex.: "☀" em vez de "☀️")
        if (cps.length === 1 && parseInt(cps[0], 16) < 0x3000 && !SEM_FE0F.has(cps[0])) cps.push('fe0f');
        // tom de pele/sequencias: o pacote usa a forma completa; FE0F extra depois de outro emoji sai
        return cps.join('-');
    }
    function url(ch) { return BASE + codigo(ch) + '.webp'; }

    const falhou = new Set();
    function img(ch, cls) {
        const el = document.createElement('img');
        el.alt = ch;
        el.draggable = false;
        el.decoding = 'async';
        el.crossOrigin = 'anonymous';   // mesma copia guardada serve img e canvas
        el.className = 'e3d' + (cls ? ' ' + cls : '');
        el.src = url(ch);
        el.onerror = () => {
            falhou.add(ch);
            const s = document.createElement('span');
            s.className = el.className + ' e3d-txt';
            s.textContent = ch;
            el.replaceWith(s);
        };
        return el;
    }
    function html(ch, cls) {
        if (!ligado() || falhou.has(ch)) return `<span class="e3d e3d-txt ${cls || ''}">${ch}</span>`;
        const safe = String(ch).replace(/"/g, '&quot;');
        return `<img class="e3d ${cls || ''}" alt="${safe}" draggable="false" decoding="async" crossorigin="anonymous" src="${url(ch)}" ` +
               `onerror="this.outerHTML='<span class=&quot;'+this.className+' e3d-txt&quot;>'+this.alt+'</span>'">`;
    }

    function trocar(raiz) {
        if (!ligado()) return;
        (raiz || document).querySelectorAll('[data-e3d]:not([data-e3d-ok])').forEach(el => {
            const ch = (el.dataset.e3d || el.textContent).trim();
            if (!ch || falhou.has(ch)) return;
            el.dataset.e3dOk = '1';
            el.textContent = '';
            el.appendChild(img(ch));
        });
    }

    const cacheImg = new Map();
    function imagem(ch) {
        if (cacheImg.has(ch)) return cacheImg.get(ch);
        const im = new Image();
        im.crossOrigin = 'anonymous';   // canvas pode ser salvo (PNG) sem "sujar"
        im.decoding = 'async';
        if (ligado()) im.src = url(ch);
        cacheImg.set(ch, im);
        return im;
    }
    // Pronta para desenhar? (canvas: use o emoji em texto enquanto nao estiver)
    const pronta = im => im && im.complete && im.naturalWidth > 0;
    function carregar(lista) { return Promise.all([].concat(lista).map(ch => new Promise(r => {
        const im = imagem(ch); if (pronta(im) || !ligado()) return r(im);
        im.addEventListener('load', () => r(im), { once: true });
        im.addEventListener('error', () => r(im), { once: true });
    }))); }

    // Estilo base: figura do tamanho da letra, com sombra suave de "objeto"
    const css = document.createElement('style');
    css.textContent = `img.e3d{width:1.15em;height:1.15em;object-fit:contain;vertical-align:-0.2em;display:inline-block;
        filter:drop-shadow(0 .06em .05em rgba(0,0,0,.22));-webkit-user-drag:none;user-select:none;pointer-events:none}
        .e3d-txt{font-style:normal}`;
    (document.head || document.documentElement).appendChild(css);

    function start() {
        trocar(document);
        new MutationObserver(muts => {
            for (const m of muts) for (const n of m.addedNodes) {
                if (n.nodeType !== 1) continue;
                if (n.matches && n.matches('[data-e3d]')) trocar(n.parentNode || document);
                else if (n.querySelector && n.querySelector('[data-e3d]')) trocar(n);
            }
        }).observe(document.documentElement, { childList: true, subtree: true });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();

    window.Emoji3D = { url, img, html, trocar, imagem, carregar, pronta, codigo, ligado };
})();
