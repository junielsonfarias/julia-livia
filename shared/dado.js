// ==========================================
// Dado 3D animado em tela cheia (compartilhado)
// Uso:  const n = await Dado.roll({ name: 'Livia', emoji: '🧚', theme: 'selva' });
// Mostra quem joga, gira o dado com tambores, para no numero e devolve o valor.
// ==========================================
(function () {
    // Posicao das bolinhas (indices 0..8 de uma grade 3x3) em cada face
    const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
    // Rotacao do cubo que deixa cada face de frente para quem olha
    const FACE_ROT = { 1: [0, 0], 6: [0, 180], 3: [0, -90], 4: [0, 90], 5: [-90, 0], 2: [90, 0] };
    const LEAVES = { selva: ['🍃', '🌿', '🍂', '🌺', '🦋'], trilha: ['⭐', '✨', '🌟', '💫', '🎈'] };
    const NOMES = ['', 'Um', 'Dois', 'Três', 'Quatro', 'Cinco', 'Seis'];

    function faceHTML(n) {
        let cells = '';
        for (let i = 0; i < 9; i++) cells += PIPS[n].includes(i) ? '<i></i>' : '<span></span>';
        return `<div class="dado-face f${n}">${cells}</div>`;
    }

    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const audio = name => { try { if (window.KidsAudio) KidsAudio.play(name); } catch (e) {} };

    function rainLeaves(el, theme) {
        const list = LEAVES[theme] || LEAVES.selva;
        for (let i = 0; i < 14; i++) {
            const leaf = document.createElement('span');
            leaf.className = 'dado-leaf';
            leaf.textContent = list[i % list.length];
            leaf.style.left = Math.random() * 100 + 'vw';
            leaf.style.animationDuration = (2.2 + Math.random() * 1.8) + 's';
            leaf.style.animationDelay = (Math.random() * 0.8) + 's';
            el.appendChild(leaf);
        }
    }

    async function roll(opts) {
        opts = opts || {};
        // Valor invalido (fora de 1..6) travaria o dado na tela com o tambor tocando para sempre
        const value = FACE_ROT[opts.value] ? opts.value : (Math.floor(Math.random() * 6) + 1);
        const theme = opts.theme || 'selva';
        const ov = document.createElement('div');
        ov.className = 'dado-overlay theme-' + theme;
        ov.setAttribute('role', 'dialog');
        ov.setAttribute('aria-label', 'Dado sendo jogado');
        ov.innerHTML = `
            <div class="dado-who"><span class="dado-emoji"></span><span class="dado-name"></span></div>
            <div class="dado-stage"><div class="dado-cube">${[1, 2, 3, 4, 5, 6].map(faceHTML).join('')}</div></div>
            <div class="dado-shadow"></div>
            <div class="dado-result" aria-live="polite"></div>
            <div class="dado-hint"></div>`;
        // Nome e emoji como texto (nunca como HTML): quem chama passa o nome sem escapar
        ov.querySelector('.dado-emoji').textContent = opts.emoji || '🎲';
        ov.querySelector('.dado-name').textContent = opts.name ? opts.name + ' joga o dado!' : 'Jogando o dado!';
        document.body.appendChild(ov);
        rainLeaves(ov, theme);
        const cube = ov.querySelector('.dado-cube');

        // Tambores enquanto gira
        let drumming = true;
        (async () => { while (drumming) { audio('tick'); await sleep(120); } })();

        await sleep(60);
        const [rx, ry] = FACE_ROT[value];
        const spinsX = 360 * (2 + Math.floor(Math.random() * 2));
        const spinsY = 360 * (2 + Math.floor(Math.random() * 2));
        cube.classList.add('rolling');
        cube.style.transform = `rotateX(${rx + spinsX}deg) rotateY(${ry + spinsY}deg)`;
        await sleep(1650);
        drumming = false;

        const res = ov.querySelector('.dado-result');
        res.textContent = value;
        res.classList.add('show');
        audio('star');
        try { if (window.KidsAudio && opts.speak !== false) KidsAudio.speak(NOMES[value] + '!', { rate: 1 }); } catch (e) {}
        await sleep(opts.hold || 1100);
        ov.classList.add('hide');
        await sleep(300);
        ov.remove();
        return value;
    }

    window.Dado = { roll };
})();
