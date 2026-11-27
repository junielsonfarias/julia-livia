// ==========================================
// Audio compartilhado - Mundo de Julia & Livia
// Um unico AudioContext reaproveitado (funciona melhor em celular/tablet)
// + voz em portugues (speechSynthesis) para feedback falado.
// ==========================================
(function () {
    let ctx = null;

    function getVolume() {
        try {
            const v = parseFloat(localStorage.getItem('audioVolume'));
            return isNaN(v) ? 1 : Math.max(0, Math.min(1, v));
        } catch (e) { return 1; }
    }

    function getCtx() {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return null;
        if (!ctx) ctx = new AudioCtx();
        // 'interrupted' = iOS/Safari depois de ir para segundo plano ou de uma ligacao
        if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
            try { const p = ctx.resume(); if (p && p.catch) p.catch(() => {}); } catch (e) {}
        }
        return ctx;
    }

    // Desbloqueia o audio no primeiro toque (exigencia do iOS/Android).
    // O iOS so libera no FIM do toque (touchend/click), nao no pointerdown:
    // por isso escuta os tres e so para quando o audio estiver rodando de fato.
    const UNLOCK_EVENTS = ['pointerdown', 'touchend', 'click', 'keydown'];
    function unlock() {
        const c = getCtx();
        if (c) {
            const b = c.createBuffer(1, 1, 22050);
            const s = c.createBufferSource();
            s.buffer = b; s.connect(c.destination); s.start(0);
        }
        if (!c || c.state === 'running') {
            UNLOCK_EVENTS.forEach(ev => window.removeEventListener(ev, unlock, true));
        }
    }
    UNLOCK_EVENTS.forEach(ev => window.addEventListener(ev, unlock, true));

    // Saida comum: compressor (evita estourar com varios sons juntos) + um eco curto
    // bem baixinho, que deixa os sons "redondos" (sensacao de sala, nao de bip seco)
    let bus = null;
    function out(c) {
        if (bus && bus.ctx === c) return bus.input;
        const input = c.createGain();
        const comp = c.createDynamicsCompressor();
        comp.threshold.value = -18; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.15;
        const delay = c.createDelay(0.5); delay.delayTime.value = 0.11;
        const fb = c.createGain(); fb.gain.value = 0.22;
        const wet = c.createGain(); wet.gain.value = 0.18;
        const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 3200;
        input.connect(comp);
        input.connect(delay); delay.connect(lp); lp.connect(fb); fb.connect(delay); lp.connect(wet); wet.connect(comp);
        comp.connect(c.destination);
        bus = { ctx: c, input };
        return input;
    }

    // Nota com envelope (ataque rapido, decaimento suave) e um harmonico leve:
    // soa mais "instrumento" (xilofone/sininho) e menos bip de computador
    function tone(freq, start, dur, type, peak) {
        const c = getCtx(); if (!c) return;
        const vol = getVolume(); if (vol <= 0) return;
        const t0 = c.currentTime + start;
        const p = (peak || 0.25) * vol;
        const g = c.createGain();
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(p, t0 + 0.012);
        g.gain.exponentialRampToValueAtTime(p * 0.45, t0 + Math.min(0.08, dur * 0.5));
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + 0.08);
        g.connect(out(c));
        const osc = c.createOscillator();
        osc.type = type || "sine";
        osc.frequency.setValueAtTime(freq, t0);
        osc.connect(g);
        osc.start(t0); osc.stop(t0 + dur + 0.12);
        if (!type || type === "sine" || type === "triangle") {
            const h = c.createOscillator(), hg = c.createGain();
            h.type = "sine"; h.frequency.setValueAtTime(freq * 2, t0);
            hg.gain.value = 0.18;
            h.connect(hg); hg.connect(g);
            h.start(t0); h.stop(t0 + dur * 0.6 + 0.05);
        }
    }

    function slide(from, to, start, dur, type, peak) {
        const c = getCtx(); if (!c) return;
        const vol = getVolume(); if (vol <= 0) return;
        const t0 = c.currentTime + start;
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = type || "sine";
        osc.frequency.setValueAtTime(from, t0);
        osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime((peak || 0.25) * vol, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        osc.connect(g); g.connect(out(c));
        osc.start(t0); osc.stop(t0 + dur + 0.05);
    }

    // Escala pentatonica (do-re-mi-sol-la): qualquer sequencia soa bonita.
    // KidsAudio.note(i) toca a i-esima nota (para acertos seguidos subirem de tom)
    const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760, 2093];
    function note(i, dur) {
        const n = PENTA[Math.max(0, Math.min(PENTA.length - 1, i | 0))];
        tone(n, 0, dur || 0.22, "triangle", 0.26);
    }

    const SOUNDS = {
        click:   () => tone(880, 0, 0.08, 'sine', 0.15),
        flip:    () => { tone(880, 0, 0.07, 'sine', 0.15); tone(1175, 0.03, 0.06, 'sine', 0.12); },
        select:  () => { tone(660, 0, 0.1); tone(880, 0.08, 0.1); },
        start:   () => { tone(523, 0, 0.15); tone(659, 0.12, 0.15); tone(784, 0.24, 0.25); },
        // Acerto: arpejo alegre + brilho
        correct: () => {
            tone(523, 0, 0.12, 'triangle', 0.3);
            tone(659, 0.09, 0.12, 'triangle', 0.3);
            tone(784, 0.18, 0.12, 'triangle', 0.3);
            tone(1047, 0.27, 0.3, 'triangle', 0.32);
            tone(2093, 0.3, 0.25, 'sine', 0.08);
        },
        // Erro: "uoon-uoon" descendente, gentil (sem assustar)
        wrong: () => {
            slide(392, 330, 0, 0.22, 'square', 0.09);
            slide(330, 247, 0.22, 0.35, 'square', 0.09);
        },
        star:    () => { tone(1047, 0, 0.1); tone(1319, 0.08, 0.15); tone(1568, 0.16, 0.2, 'triangle'); },
        tick:    () => tone(1200, 0, 0.05, 'square', 0.06),
        turn:    () => { tone(587, 0, 0.1, 'triangle'); tone(784, 0.1, 0.18, 'triangle'); },
        win: () => {
            [[523, 0, .15], [523, .15, .15], [523, .3, .15], [659, .45, .3], [784, .75, .15],
             [784, .9, .15], [659, 1.05, .15], [784, 1.2, .15], [1047, 1.35, .45]]
                .forEach(n => tone(n[0], n[1], n[2], 'triangle', 0.28));
        },
        pop:     () => slide(380, 900, 0, 0.09, "sine", 0.22),
        sparkle: () => { [2093, 2637, 3136, 2637, 3520].forEach((f, i) => tone(f, i * 0.045, 0.12, "sine", 0.07)); },
        whoosh:  () => slide(220, 880, 0, 0.18, "triangle", 0.08),
        timeup: () => { tone(784, 0, 0.2); tone(659, 0.2, 0.2); tone(523, 0.4, 0.45); }
    };

    function play(name) {
        try { (SOUNDS[name] || SOUNDS.click)(); } catch (e) { /* sem audio */ }
    }

    // ---------- Voz ----------
    let ptVoice = null;
    function pickVoice() {
        if (!('speechSynthesis' in window)) return;
        const voices = speechSynthesis.getVoices();
        ptVoice = voices.find(v => /pt[-_]BR/i.test(v.lang)) ||
                  voices.find(v => /^pt/i.test(v.lang)) || null;
    }
    if ('speechSynthesis' in window) {
        pickVoice();
        speechSynthesis.onvoiceschanged = pickVoice;
    }

    function speak(text, opts) {
        opts = opts || {};
        if (!('speechSynthesis' in window) || getVolume() <= 0) return;
        try {
            if (opts.interrupt !== false) speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            u.lang = 'pt-BR';
            if (ptVoice) u.voice = ptVoice;
            u.rate = opts.rate || 0.95;
            u.pitch = opts.pitch || 1.1;
            u.volume = getVolume();
            if (typeof opts.onend === 'function') u.onend = opts.onend;
            speechSynthesis.speak(u);
        } catch (e) { /* sem voz */ }
    }

    // Para a voz quando o jogo e fechado (o iframe sai da tela) ou a aba some
    function stopSpeaking() { try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) {} }
    window.addEventListener('pagehide', stopSpeaking);
    window.addEventListener('beforeunload', stopSpeaking);

    // Dentro da janela de jogo da pagina principal: Esc fecha o jogo
    window.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape' || window.parent === window) return;
        try { if (window.parent.closeGameModal) window.parent.closeGameModal(); } catch (err) {}
    });

    window.KidsAudio = { note, play, speak, getVolume, stop: stopSpeaking };
})();
