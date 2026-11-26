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
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    }

    // Desbloqueia o audio no primeiro toque (exigencia do iOS/Android)
    function unlock() {
        const c = getCtx();
        if (c) {
            const b = c.createBuffer(1, 1, 22050);
            const s = c.createBufferSource();
            s.buffer = b; s.connect(c.destination); s.start(0);
        }
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
    }
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);

    function tone(freq, start, dur, type, peak) {
        const c = getCtx(); if (!c) return;
        const vol = getVolume(); if (vol <= 0) return;
        const t0 = c.currentTime + start;
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, t0);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime((peak || 0.25) * vol, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        osc.connect(g); g.connect(c.destination);
        osc.start(t0); osc.stop(t0 + dur + 0.05);
    }

    function slide(from, to, start, dur, type, peak) {
        const c = getCtx(); if (!c) return;
        const vol = getVolume(); if (vol <= 0) return;
        const t0 = c.currentTime + start;
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(from, t0);
        osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime((peak || 0.25) * vol, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        osc.connect(g); g.connect(c.destination);
        osc.start(t0); osc.stop(t0 + dur + 0.05);
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

    window.KidsAudio = { play, speak, getVolume, stop: stopSpeaking };
})();
