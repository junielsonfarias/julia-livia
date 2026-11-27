// ==========================================
// Letrinhas - ajudantes dos jogos de leitura e escrita
// (leitura, silabas, letras, rimas, ortografia, interpretacao)
//
//   Letrinhas.fig('🐱', 'classe')     -> HTML da figura 3D (ou o emoji em texto)
//   Letrinhas.trocar(els, fn)        -> rodada sai deslizando, fn() monta a nova, ela entra
//   Letrinhas.voar(de, para, html)   -> uma copia da peca voa de um lugar ao outro (Promise)
//   Letrinhas.serie.acerto(el)       -> efeitos de acerto + nota que sobe a cada acerto seguido
//   Letrinhas.serie.erro()           -> zera a serie
//   Letrinhas.ajuda(n, {tocado, erradas, certa}) -> erro sem frustracao:
//        1o erro balanca, 2o apaga uma opcao errada, 3o acende a certa
//   Letrinhas.estrelas(box, n)        -> 1 a 3 estrelas do resultado, uma a uma
// So usa transform/opacity (nada de mexer no layout durante a animacao).
// ==========================================
(function () {
    const reduz = () => !!(window.Efeitos && Efeitos.reduzir && Efeitos.reduzir());
    const EASE_BACK = 'cubic-bezier(.34,1.56,.64,1)';

    function fig(emoji, cls) {
        if (window.Emoji3D) return Emoji3D.html(emoji, cls || '');
        return `<span class="e3d-txt ${cls || ''}">${emoji}</span>`;
    }

    // Sai (desliza para a esquerda e some), troca o conteudo, entra crescendo.
    // Nada passa da borda direita/de baixo: o fit-screen mediria rolagem e mudaria o zoom.
    let trocando = 0;
    function trocar(els, fn) {
        els = [].concat(els).filter(Boolean);
        const id = ++trocando;
        if (reduz() || !els.length || !els[0].animate) { fn(); return; }
        const sai = els.map((el, i) => el.animate(
            [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(-40px) scale(.97)' }],
            { duration: 170, delay: i * 30, easing: 'ease-in', fill: 'forwards' }));
        Promise.all(sai.map(a => a.finished.catch(() => {}))).then(() => {
            if (id !== trocando) return;
            fn();
            els.forEach((el, i) => {
                const a = el.animate(
                    [{ opacity: 0, transform: 'scale(.92)' }, { opacity: 1, transform: 'none' }],
                    { duration: 300, delay: i * 50, easing: 'cubic-bezier(.2,.9,.3,1)', fill: 'backwards' });
                sai[i].cancel();
                a.onfinish = () => a.cancel();
            });
        });
    }

    // Copia da peca voa de "de" ate "para" (posicao fixa, so transform)
    function voar(de, para, html, ms) {
        return new Promise(res => {
            if (!de || !para || reduz()) return res();
            const a = de.getBoundingClientRect(), b = para.getBoundingClientRect();
            if (!a.width || !b.width) return res();
            const c = de.cloneNode(false);
            c.innerHTML = html != null ? html : de.innerHTML;
            c.removeAttribute('id');
            c.disabled = true;
            c.classList.add('voando');
            const z = parseFloat(getComputedStyle(de.closest('.screen') || de).zoom) || 1;
            c.style.cssText += `;position:fixed;left:${a.left}px;top:${a.top}px;width:${a.width / z}px;height:${a.height / z}px;` +
                `margin:0;z-index:50;pointer-events:none;transform-origin:0 0;zoom:${z};visibility:visible;opacity:1`;
            document.body.appendChild(c);
            // com zoom no clone, left/top tambem sao multiplicados: corrige
            c.style.left = (a.left / z) + 'px'; c.style.top = (a.top / z) + 'px';
            const dx = (b.left + b.width / 2 - (a.left + a.width / 2)) / z;
            const dy = (b.top + b.height / 2 - (a.top + a.height / 2)) / z;
            const s = Math.max(0.6, Math.min(1.3, b.height / a.height));
            const sx = (a.width / z) * (1 - s) / 2, sy = (a.height / z) * (1 - s) / 2;
            const an = c.animate([
                { transform: 'translate(0,0) scale(1)' },
                { transform: `translate(${dx * 0.5 + sx}px,${dy * 0.5 - 40 + sy}px) scale(${(1 + s) / 2 * 1.1})`, offset: 0.5 },
                { transform: `translate(${dx + sx}px,${dy + sy}px) scale(${s})` }
            ], { duration: ms || 300, easing: 'cubic-bezier(.4,0,.2,1)' });
            const fim = () => { c.remove(); res(); };
            an.onfinish = fim;
            setTimeout(fim, (ms || 300) + 150);
        });
    }

    // Serie de acertos seguidos: a nota sobe (pentatonica) e o efeito cresce
    const serie = {
        n: 0,
        acerto(el, opts) {
            this.n++;
            opts = opts || {};
            if (window.Efeitos && el) Efeitos.acerto(el, { quantidade: Math.min(24, 12 + this.n * 2), emoji: opts.emoji, texto: opts.texto });
            if (window.KidsAudio && KidsAudio.note && opts.nota !== false) {
                const i = Math.min(10, this.n - 1);
                setTimeout(() => KidsAudio.note(i), opts.atraso == null ? 160 : opts.atraso);
            }
            return this.n;
        },
        erro() { this.n = 0; },
        zerar() { this.n = 0; }
    };

    function apagar(el) {
        if (!el) return;
        el.classList.add('apagada');
        el.disabled = true;
        el.setAttribute('aria-disabled', 'true');
    }

    // Erro sem frustracao. n = quantos erros nesta pergunta (1, 2, 3...)
    function ajuda(n, o) {
        o = o || {};
        if (window.Efeitos) Efeitos.erro(o.tocado);
        const erradas = (o.erradas || []).filter(e => e && !e.classList.contains('apagada'));
        if (n === 2) {
            const alvo = erradas.includes(o.tocado) ? o.tocado : erradas[0];
            setTimeout(() => apagar(alvo), 380);
        } else if (n >= 3) {
            if (o.tocado && erradas.includes(o.tocado)) setTimeout(() => apagar(o.tocado), 380);
            if (o.certa) o.certa.classList.add('dica-certa');
        }
    }

    // Estrelas do resultado (1 a 3) aparecem uma a uma, com som
    function estrelas(box, n) {
        if (!box) return;
        box.classList.add('star-row');
        box.innerHTML = [0, 1, 2].map(i => `<span class="star-slot${i < n ? ' on' : ''}" style="animation-delay:${0.3 + i * 0.3}s">` +
            `${i < n ? fig('⭐') : '<span class="star-empty">☆</span>'}</span>`).join('');
        for (let i = 0; i < n; i++) setTimeout(() => { if (window.KidsAudio) KidsAudio.note(4 + i * 2); }, 300 + i * 300);
    }

    window.Letrinhas = { fig, trocar, voar, serie, ajuda, apagar, estrelas, EASE_BACK };
})();
