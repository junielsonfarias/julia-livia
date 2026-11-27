// ==========================================
// Pintura de Unicornio - pintar por regioes (Livia 5 anos / Julia)
// Toque numa cor e depois numa parte do desenho para pintar.
// Desenhos sao SVG feitos aqui mesmo, cada parte pintavel e uma regiao.
// ==========================================

const STORE_PREFIX = 'unicornio_pintura_';
const OUTLINE = '#3d2b56';

function goBack() {
    if (window.parent !== window) {
        try { if (window.parent.closeGameModal) { window.parent.closeGameModal(); return; } } catch (e) {}
    }
    if (window.history.length > 1) window.history.back();
    else window.location.href = '../index.html';
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function speakIntro() {
    KidsAudio.speak('Pintura de Unicórnio! Primeiro, toque num desenho. Depois toque numa bolinha de cor, ' +
        'e toque numa parte do desenho para pintar. A varinha mágica pinta tudo sozinha. ' +
        'A estrela tem adesivos para enfeitar. Quando você pintar tudo, tem festa!', { rate: 0.9 });
}

// ---------- Cores ----------
const COLORS = [
    { k: 'rosa',     v: '#ffb6d9', n: 'rosa' },
    { k: 'pink',     v: '#ff5fa8', n: 'rosa forte' },
    { k: 'lilas',    v: '#d4b3ff', n: 'lilás' },
    { k: 'roxo',     v: '#9b5de5', n: 'roxo' },
    { k: 'azulceu',  v: '#9ad9ff', n: 'azul clarinho' },
    { k: 'azul',     v: '#4d8dff', n: 'azul' },
    { k: 'turquesa', v: '#3ed6c8', n: 'turquesa' },
    { k: 'menta',    v: '#a6f5cf', n: 'verde menta' },
    { k: 'verde',    v: '#5ccf5c', n: 'verde' },
    { k: 'amarelo',  v: '#fff27a', n: 'amarelo' },
    { k: 'dourado',  v: '#f5c242', n: 'dourado' },
    { k: 'laranja',  v: '#ffa94d', n: 'laranja' },
    { k: 'vermelho', v: '#ff5c5c', n: 'vermelho' },
    { k: 'pessego',  v: '#ffd3b5', n: 'pêssego' },
    { k: 'marrom',   v: '#b9825a', n: 'marrom' },
    { k: 'branco',   v: '#ffffff', n: 'branco' },
    { k: 'arcoiris', v: 'url(#ug-rainbow)', n: 'arco-íris', special: '🌈' },
    { k: 'brilho',   v: 'url(#ug-sparkle)', n: 'brilho', special: '✨' }
];
const COLOR_BY_KEY = {};
COLORS.forEach(c => { COLOR_BY_KEY[c.k] = c; });

const STICKERS = ['⭐', '💖', '🌸', '🦋', '✨', '🌈', '👑', '🎀', '🍭', '☁️', '🌙', '🦄'];

// Gradiente arco-iris e padrao com brilho (usados como fill="url(#...)")
const DEFS_MARKUP =
    '<defs id="ug-defs">' +
    '<linearGradient id="ug-rainbow" x1="0" y1="0" x2="1" y2="0">' +
    '<stop offset="0" stop-color="#ff6b6b"/><stop offset=".2" stop-color="#ffa94d"/>' +
    '<stop offset=".4" stop-color="#ffe66d"/><stop offset=".6" stop-color="#69db7c"/>' +
    '<stop offset=".8" stop-color="#4dabf7"/><stop offset="1" stop-color="#b197fc"/></linearGradient>' +
    '<linearGradient id="ug-sparkle-bg" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#ffe9a8"/><stop offset=".5" stop-color="#ffc2e2"/><stop offset="1" stop-color="#d8c4ff"/></linearGradient>' +
    '<pattern id="ug-sparkle" patternUnits="userSpaceOnUse" width="44" height="44">' +
    '<rect width="44" height="44" fill="url(#ug-sparkle-bg)" stroke="none"/>' +
    '<path d="M11 4 L13 10 L19 12 L13 14 L11 20 L9 14 L3 12 L9 10 Z" fill="#ffffff" stroke="none"/>' +
    '<path d="M32 24 L33.5 29 L38 30.5 L33.5 32 L32 37 L30.5 32 L26 30.5 L30.5 29 Z" fill="#fff8d6" stroke="none"/>' +
    '<circle cx="34" cy="9" r="2" fill="#ffffff" stroke="none"/><circle cx="8" cy="34" r="1.6" fill="#ffffff" stroke="none"/>' +
    '<circle cx="22" cy="22" r="1.2" fill="#ffd36e" stroke="none"/>' +
    '</pattern></defs>';

// ---------- Ajudantes para montar os desenhos ----------
// r(): regiao pintavel. small=true: parte pequena, nao precisa pintar para terminar.
function r(id, shape, small) {
    const sp = shape.indexOf(' ');
    const tag = sp < 0 ? shape : shape.slice(0, sp);
    const rest = sp < 0 ? '' : shape.slice(sp);
    return '<' + tag + ' class="r" data-id="' + id + '"' + (small ? ' data-small="1"' : '') + rest + '/>';
}
// rg(): regiao feita de varias formas (ex.: petalas)
function rg(id, inner, small, extra) {
    return '<g class="r" data-id="' + id + '"' + (small ? ' data-small="1"' : '') + (extra || '') + '>' + inner + '</g>';
}
// d(): detalhe fixo (olhos, boca...) - nao recebe toque
function d(shape) {
    const sp = shape.indexOf(' ');
    return '<' + shape.slice(0, sp) + ' class="d" pointer-events="none"' + shape.slice(sp) + '/>';
}
function line(path, w) {
    return '<path class="d" pointer-events="none" fill="none" stroke-width="' + (w || 4) + '" d="' + path + '"/>';
}
function starPath(cx, cy, n, ro, ri, rot) {
    let s = '';
    const a0 = (rot || -90) * Math.PI / 180;
    for (let i = 0; i < n * 2; i++) {
        const rr = i % 2 ? ri : ro;
        const a = a0 + i * Math.PI / n;
        s += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a)).toFixed(1) + ' ';
    }
    return s + 'Z';
}
function heartPath(cx, cy, s) {
    const f = v => v.toFixed(1);
    return 'M' + f(cx) + ' ' + f(cy + s * 0.9) +
        ' C' + f(cx - s * 1.5) + ' ' + f(cy + s * 0.05) + ' ' + f(cx - s * 0.9) + ' ' + f(cy - s * 1.05) + ' ' + f(cx) + ' ' + f(cy - s * 0.35) +
        ' C' + f(cx + s * 0.9) + ' ' + f(cy - s * 1.05) + ' ' + f(cx + s * 1.5) + ' ' + f(cy + s * 0.05) + ' ' + f(cx) + ' ' + f(cy + s * 0.9) + ' Z';
}
// Faixa de arco-iris (meio anel) com centro (cx, cy), raio externo R e interno ri
function bandPath(cx, cy, R, ri) {
    return 'M' + (cx - R) + ' ' + cy + ' A' + R + ' ' + R + ' 0 0 1 ' + (cx + R) + ' ' + cy +
        ' L' + (cx + ri) + ' ' + cy + ' A' + ri + ' ' + ri + ' 0 0 0 ' + (cx - ri) + ' ' + cy + ' Z';
}
function flower(id, cx, cy, pr, dist, cr, small) {
    let petals = '';
    for (let i = 0; i < 5; i++) {
        const a = (-90 + i * 72) * Math.PI / 180;
        petals += '<circle cx="' + (cx + dist * Math.cos(a)).toFixed(1) + '" cy="' + (cy + dist * Math.sin(a)).toFixed(1) + '" r="' + pr + '"/>';
    }
    return rg(id, petals) + r(id + '-miolo', 'circle cx="' + cx + '" cy="' + cy + '" r="' + cr + '"', small);
}
function eye(cx, cy, rad) {
    return d('circle cx="' + cx + '" cy="' + cy + '" r="' + rad + '" fill="' + OUTLINE + '" stroke="none"') +
        d('circle cx="' + (cx + rad * 0.35) + '" cy="' + (cy - rad * 0.38) + '" r="' + (rad * 0.36) + '" fill="#fff" stroke="none"') +
        d('circle cx="' + (cx - rad * 0.35) + '" cy="' + (cy + rad * 0.35) + '" r="' + (rad * 0.16) + '" fill="#fff" stroke="none"');
}
function cheek(cx, cy, rx, ry) {
    return d('ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#ff8fc1" opacity=".6" stroke="none"');
}
function cloudPath(x, y, w) {
    // nuvem fofinha com base reta: (x,y) = canto inferior esquerdo, largura w
    const s = w / 130;
    const p = (dx, dy) => (x + dx * s).toFixed(1) + ' ' + (y + dy * s).toFixed(1);
    return 'M' + p(8, 0) + ' C' + p(-10, -4) + ' ' + p(-6, -34) + ' ' + p(18, -32) +
        ' C' + p(20, -62) + ' ' + p(60, -70) + ' ' + p(72, -44) +
        ' C' + p(84, -66) + ' ' + p(124, -58) + ' ' + p(118, -28) +
        ' C' + p(140, -24) + ' ' + p(138, 2) + ' ' + p(118, 0) + ' Z';
}

// ---------- Desenhos (viewBox 0 0 400 400) ----------
function picUnicornio() {
    const leg = (id, x) =>
        r(id, 'path d="M' + x + ' 236 L' + x + ' 312 L' + (x + 28) + ' 312 L' + (x + 28) + ' 236 Z"') +
        r(id + '-casco', 'rect x="' + (x - 3) + '" y="308" width="34" height="22" rx="7"', true);
    return [
        r('ceu', 'rect x="0" y="0" width="400" height="400"'),
        r('sol', 'circle cx="62" cy="64" r="36"'),
        r('nuvem', 'path d="' + cloudPath(118, 92, 112) + '"'),
        r('grama', 'path d="M0 318 Q110 292 210 310 Q310 326 400 300 L400 400 L0 400 Z"'),
        r('cauda1', 'path d="M112 198 C72 166 28 196 40 246 C56 228 78 226 104 234 Z"'),
        r('cauda2', 'path d="M104 228 C70 232 42 262 58 304 C74 282 96 270 116 252 Z"'),
        leg('perna1', 120), leg('perna2', 145), leg('perna3', 222), leg('perna4', 246),
        r('pescoco', 'path d="M232 200 C236 160 250 122 266 104 L322 126 C304 148 292 180 288 222 Z"'),
        r('corpo', 'ellipse cx="190" cy="225" rx="95" ry="55"'),
        r('orelha', 'path d="M270 96 Q258 62 266 44 Q292 60 302 86 Z"'),
        r('chifre', 'path d="M300 90 L324 26 Q328 20 331 28 L334 94 Q316 100 300 90 Z"'),
        r('cabeca', 'ellipse cx="300" cy="118" rx="46" ry="38"'),
        r('focinho', 'ellipse cx="340" cy="140" rx="30" ry="24"'),
        line('M307 74 L330 66 M312 58 L329 52 M318 42 L328 38', 3.5),
        eye(302, 108, 10),
        line('M293 99 L287 92 M299 97 L297 89', 3),
        cheek(294, 132, 10, 6),
        d('circle cx="356" cy="134" r="3.5" fill="' + OUTLINE + '" stroke="none"'),
        line('M334 152 Q345 160 358 150', 3.5),
        r('crina1', 'ellipse cx="270" cy="94" rx="28" ry="19" transform="rotate(-30 270 94)"'),
        r('crina2', 'ellipse cx="250" cy="136" rx="28" ry="19" transform="rotate(-55 250 136)"'),
        r('crina3', 'ellipse cx="238" cy="178" rx="26" ry="18" transform="rotate(-70 238 178)"')
    ].join('');
}

function picFlores() {
    const L = 'transform="translate(400 0) scale(-1 1)"';
    const mane = 'M182 110 C120 88 70 124 80 174 C56 196 58 236 82 256 C64 282 82 316 114 320 L150 250 L170 120 Z';
    const ear = 'M140 152 C120 116 118 80 128 50 C152 68 172 94 184 120 Z';
    const earIn = 'M142 134 C132 110 132 88 136 70 C150 86 160 102 166 116 Z';
    return [
        r('ceu', 'rect x="0" y="0" width="400" height="400"'),
        r('pescoco', 'path d="M152 296 C150 340 140 370 128 404 L272 404 C260 370 250 340 248 296 Z"'),
        r('crina-e', 'path d="' + mane + '"'),
        r('crina-d', 'path d="' + mane + '" ' + L),
        r('orelha-e', 'path d="' + ear + '"'),
        r('orelha-d', 'path d="' + ear + '" ' + L),
        r('orelha-in-e', 'path d="' + earIn + '"', true),
        r('orelha-in-d', 'path d="' + earIn + '" ' + L, true),
        r('chifre', 'path d="M182 122 L197 30 Q200 22 203 30 L218 122 Q200 130 182 122 Z"'),
        line('M187 92 L212 84 M191 66 L208 60 M195 44 L205 40', 3.5),
        r('cabeca', 'path d="M200 104 C268 104 290 168 280 228 C272 290 250 330 200 330 C150 330 128 290 120 228 C110 168 132 104 200 104 Z"'),
        r('focinho', 'ellipse cx="200" cy="284" rx="60" ry="40"'),
        r('franja', 'path d="M166 114 C148 140 160 170 186 160 C194 180 222 178 226 156 C250 160 254 130 234 114 C214 102 186 102 166 114 Z"'),
        eye(160, 210, 15), eye(240, 210, 15),
        line('M148 198 L140 190 M156 194 L152 185 M252 198 L260 190 M244 194 L248 185', 3),
        cheek(138, 242, 13, 8), cheek(262, 242, 13, 8),
        d('ellipse cx="180" cy="278" rx="5" ry="7" fill="' + OUTLINE + '" stroke="none"'),
        d('ellipse cx="220" cy="278" rx="5" ry="7" fill="' + OUTLINE + '" stroke="none"'),
        line('M178 300 Q200 316 222 300', 4),
        flower('flor1', 146, 120, 13, 14, 10, true),
        flower('flor2', 254, 120, 13, 14, 10, true),
        r('folha1', 'ellipse cx="100" cy="372" rx="24" ry="12" transform="rotate(-30 100 372)"'),
        r('folha2', 'ellipse cx="300" cy="372" rx="24" ry="12" transform="rotate(30 300 372)"'),
        flower('flor3', 60, 346, 18, 20, 14),
        flower('flor4', 340, 346, 18, 20, 14)
    ].join('');
}

function picArcoIris() {
    const cx = 200, cy = 300;
    const radii = [180, 158, 136, 114, 92, 70, 48];
    const bands = [];
    for (let i = 0; i < 6; i++) bands.push(r('arco' + (i + 1), 'path d="' + bandPath(cx, cy, radii[i], radii[i + 1]) + '"'));
    const cloudL = 'M10 334 C-12 314 4 282 34 286 C38 254 82 244 102 268 C116 244 158 250 160 282 C184 284 188 320 166 334 Z';
    return [
        r('ceu', 'rect x="0" y="0" width="400" height="400"'),
        r('raios', 'path d="' + starPath(335, 65, 12, 56, 42) + '"'),
        r('sol', 'circle cx="335" cy="65" r="34"'),
        line('M322 58 Q326 52 330 58 M340 58 Q344 52 348 58', 3.5),
        line('M324 74 Q335 84 346 74', 3.5),
        cheek(318, 72, 6, 4), cheek(352, 72, 6, 4),
        r('estrela', 'path d="' + starPath(170, 64, 5, 26, 12) + '"'),
        r('nuvem-c', 'path d="' + cloudPath(26, 104, 100) + '"'),
        bands.join(''),
        r('coracao1', 'path d="' + heartPath(200, 282, 26) + '"'),
        r('coracao2', 'path d="' + heartPath(56, 190, 20) + '"'),
        r('colina1', 'path d="M0 330 Q100 300 200 318 Q300 336 400 310 L400 400 L0 400 Z"'),
        r('nuvem-e', 'path d="' + cloudL + '"'),
        r('nuvem-d', 'path d="' + cloudL + '" transform="translate(400 0) scale(-1 1)"'),
        r('colina2', 'path d="M0 362 Q120 338 220 364 Q320 386 400 350 L400 400 L0 400 Z"')
    ].join('');
}

function picVoador() {
    const wing = 'M190 152 C185 100 150 55 92 44 C104 62 100 72 86 78 C104 90 100 102 84 108 C104 118 104 130 92 138 C120 145 140 150 150 165 Z';
    const bands = [];
    const radii = [150, 124, 98, 72];
    for (let i = 0; i < 3; i++) bands.push(r('arco' + (i + 1), 'path d="' + bandPath(110, 400, radii[i], radii[i + 1]) + '"'));
    return [
        r('ceu', 'rect x="0" y="0" width="400" height="400"'),
        r('estrela1', 'path d="' + starPath(42, 42, 5, 22, 10) + '"'),
        r('estrela2', 'path d="' + starPath(360, 56, 5, 26, 12) + '"'),
        r('nuvem', 'path d="' + cloudPath(296, 178, 100) + '"'),
        bands.join(''),
        // castelo
        r('muro', 'path d="M268 372 L268 286 L282 286 L282 274 L298 274 L298 286 L312 286 L312 274 L328 274 L328 286 L342 286 L342 274 L352 274 L352 372 Z"'),
        r('torre-e', 'rect x="238" y="250" width="42" height="122"'),
        r('torre-d', 'rect x="340" y="250" width="42" height="122"'),
        r('telhado-e', 'path d="M230 254 L259 188 L288 254 Z"'),
        r('telhado-d', 'path d="M332 254 L361 188 L390 254 Z"'),
        r('porta', 'path d="M292 372 L292 336 Q310 310 328 336 L328 372 Z"'),
        d('path d="M252 300 L252 286 Q259 276 266 286 L266 300 Z" fill="' + OUTLINE + '" stroke="none"'),
        d('path d="M354 300 L354 286 Q361 276 368 286 L368 300 Z" fill="' + OUTLINE + '" stroke="none"'),
        r('grama', 'path d="M0 364 Q100 344 200 360 Q300 372 400 354 L400 400 L0 400 Z"'),
        // unicornio voando
        r('asa2', 'path d="' + wing + '" transform="translate(28 -14)"'),
        r('cauda1', 'path d="M104 160 C76 140 46 152 20 128 C26 168 62 184 102 178 Z"'),
        r('cauda2', 'path d="M102 178 C72 184 48 204 22 198 C38 226 82 218 110 192 Z"'),
        r('perna1', 'rect x="112" y="182" width="24" height="60" rx="12" transform="rotate(35 124 190)"'),
        r('perna2', 'rect x="200" y="184" width="24" height="60" rx="12" transform="rotate(-30 212 192)"'),
        r('pescoco', 'path d="M205 165 C208 132 222 106 236 94 L276 110 C262 128 252 150 246 182 Z"'),
        r('corpo', 'ellipse cx="170" cy="170" rx="72" ry="40"'),
        r('orelha', 'path d="M246 80 Q234 52 240 40 Q260 54 268 74 Z"'),
        r('chifre', 'path d="M262 76 L283 22 Q287 17 289 24 L292 80 Q276 84 262 76 Z"'),
        r('cabeca', 'ellipse cx="264" cy="100" rx="38" ry="31"'),
        r('focinho', 'ellipse cx="294" cy="116" rx="24" ry="19"'),
        line('M268 62 L288 56 M273 46 L287 42', 3),
        eye(266, 94, 8),
        cheek(256, 114, 7, 5),
        d('circle cx="306" cy="111" r="2.8" fill="' + OUTLINE + '" stroke="none"'),
        line('M288 126 Q297 132 307 124', 3),
        r('crina1', 'ellipse cx="234" cy="86" rx="23" ry="16" transform="rotate(-35 234 86)"'),
        r('crina2', 'ellipse cx="220" cy="120" rx="23" ry="16" transform="rotate(-55 220 120)"'),
        r('crina3', 'ellipse cx="210" cy="152" rx="19" ry="14" transform="rotate(-65 210 152)"'),
        r('asa1', 'path d="' + wing + '"'),
        line('M150 120 Q128 100 104 92 M146 140 Q124 126 100 122', 3)
    ].join('');
}

const PICTURES = [
    {
        id: 1, name: 'Unicórnio', build: picUnicornio,
        magic: {
            ceu: 'azulceu', sol: 'amarelo', nuvem: 'branco', grama: 'menta',
            cauda1: 'pink', cauda2: 'lilas', perna1: 'branco', perna2: 'branco', perna3: 'branco', perna4: 'branco',
            'perna1-casco': 'dourado', 'perna2-casco': 'dourado', 'perna3-casco': 'dourado', 'perna4-casco': 'dourado',
            pescoco: 'branco', corpo: 'branco', orelha: 'rosa', chifre: 'brilho', cabeca: 'branco', focinho: 'pessego',
            crina1: 'pink', crina2: 'lilas', crina3: 'azulceu'
        }
    },
    {
        id: 2, name: 'Unicórnio com flores', build: picFlores,
        magic: {
            ceu: 'lilas', pescoco: 'branco', 'crina-e': 'arcoiris', 'crina-d': 'arcoiris',
            'orelha-e': 'branco', 'orelha-d': 'branco', 'orelha-in-e': 'rosa', 'orelha-in-d': 'rosa',
            chifre: 'dourado', cabeca: 'branco', focinho: 'rosa', franja: 'pink',
            flor1: 'pink', 'flor1-miolo': 'amarelo', flor2: 'azulceu', 'flor2-miolo': 'amarelo',
            folha1: 'verde', folha2: 'verde', flor3: 'roxo', 'flor3-miolo': 'dourado', flor4: 'laranja', 'flor4-miolo': 'amarelo'
        }
    },
    {
        id: 3, name: 'Arco-íris', build: picArcoIris,
        magic: {
            ceu: 'azulceu', raios: 'laranja', sol: 'amarelo', estrela: 'dourado', 'nuvem-c': 'branco',
            arco1: 'vermelho', arco2: 'laranja', arco3: 'amarelo', arco4: 'verde', arco5: 'azul', arco6: 'roxo',
            coracao1: 'pink', coracao2: 'rosa', colina1: 'menta', 'nuvem-e': 'branco', 'nuvem-d': 'branco', colina2: 'verde'
        }
    },
    {
        id: 4, name: 'Unicórnio voador', build: picVoador,
        magic: {
            ceu: 'azulceu', estrela1: 'dourado', estrela2: 'amarelo', nuvem: 'branco',
            arco1: 'pink', arco2: 'amarelo', arco3: 'turquesa',
            muro: 'lilas', 'torre-e': 'rosa', 'torre-d': 'rosa', 'telhado-e': 'roxo', 'telhado-d': 'roxo', porta: 'marrom',
            grama: 'menta', asa2: 'lilas', cauda1: 'pink', cauda2: 'azulceu', perna1: 'branco', perna2: 'branco',
            pescoco: 'branco', corpo: 'branco', orelha: 'rosa', chifre: 'brilho', cabeca: 'branco', focinho: 'pessego',
            crina1: 'pink', crina2: 'lilas', crina3: 'azulceu', asa1: 'arcoiris'
        }
    }
];

function svgMarkup(pic, extraAttrs) {
    return '<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" ' + (extraAttrs || '') + '>' +
        '<g class="art" fill="#ffffff" stroke="' + OUTLINE + '" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">' +
        pic.build() + '</g><g class="stickers-layer"></g></svg>';
}

// ---------- Estado ----------
const state = {
    pic: null,
    fills: {},          // id da regiao -> chave da cor
    stickers: [],       // { e, x, y }
    color: 'rosa',
    sticker: null,      // emoji escolhido (modo adesivo)
    showingStickers: false,
    undo: [],
    busy: false,
    celebrated: false,
    clearArmed: false,
    clearTimer: null,
    drag: null,
    justDragged: false
};

function storeKey(id) { return STORE_PREFIX + id; }
function loadSaved(id) {
    try {
        const raw = localStorage.getItem(storeKey(id));
        if (!raw) return { fills: {}, stickers: [] };
        const o = JSON.parse(raw);
        return { fills: o.fills || {}, stickers: Array.isArray(o.stickers) ? o.stickers : [] };
    } catch (e) { return { fills: {}, stickers: [] }; }
}
function persist() {
    if (!state.pic) return;
    try { localStorage.setItem(storeKey(state.pic.id), JSON.stringify({ fills: state.fills, stickers: state.stickers })); } catch (e) {}
}

function fillValue(key) {
    const c = COLOR_BY_KEY[key];
    return c ? c.v : '#ffffff';
}

// Regioes que contam para "terminar"
function requiredIds(svg) {
    return [...svg.querySelectorAll('.r:not([data-small])')].map(el => el.dataset.id);
}

// ---------- Tela de escolha ----------
function renderChooser() {
    const grid = document.getElementById('pic-grid');
    grid.innerHTML = '';
    PICTURES.forEach(pic => {
        const saved = loadSaved(pic.id);
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'pic-card';
        b.innerHTML = '<div class="thumb">' + svgMarkup(pic, 'aria-hidden="true"') + '</div><span class="pic-name">' + pic.name + '</span>';
        const svg = b.querySelector('svg');
        applyFills(svg, saved.fills);
        drawStickers(svg, saved.stickers);
        const req = requiredIds(svg);
        const done = req.length && req.every(id => saved.fills[id]);
        const some = Object.keys(saved.fills).length > 0;
        if (done) b.insertAdjacentHTML('beforeend', '<span class="badge">⭐</span>');
        else if (some) b.insertAdjacentHTML('beforeend', '<span class="badge small">🖌️</span>');
        b.onclick = () => openPicture(pic);
        grid.appendChild(b);
    });
}

function applyFills(svg, fills) {
    svg.querySelectorAll('.r').forEach(el => {
        el.setAttribute('fill', fills[el.dataset.id] ? fillValue(fills[el.dataset.id]) : '#ffffff');
    });
}

function drawStickers(svg, stickers) {
    const layer = svg.querySelector('.stickers-layer');
    layer.innerHTML = '';
    stickers.forEach((s, i) => {
        const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        t.setAttribute('x', s.x);
        t.setAttribute('y', s.y);
        t.setAttribute('font-size', '44');
        t.setAttribute('text-anchor', 'middle');
        t.setAttribute('dominant-baseline', 'central');
        t.setAttribute('class', 'sticker');
        t.dataset.i = i;
        t.textContent = s.e;
        layer.appendChild(t);
    });
}

function backToChooser() {
    KidsAudio.play('click');
    cancelClearArm();
    state.pic = null;
    renderChooser();
    showScreen('start-screen');
}

// ---------- Tela de pintura ----------
function openPicture(pic) {
    KidsAudio.play('start');
    state.pic = pic;
    const saved = loadSaved(pic.id);
    state.fills = saved.fills;
    state.stickers = saved.stickers;
    state.undo = [];
    state.busy = false;
    state.drag = null;
    // a pintura magica pode ter sido interrompida (voltou aos desenhos no meio)
    document.getElementById('btn-magic').classList.remove('working');
    cancelClearArm();
    setStickerMode(false);

    const paper = document.getElementById('paper');
    paper.innerHTML = svgMarkup(pic, 'id="paper-svg" role="img" aria-label="' + pic.name + '"');
    const svg = document.getElementById('paper-svg');
    applyFills(svg, state.fills);
    drawStickers(svg, state.stickers);
    state.celebrated = isComplete();
    bindPaper(svg);
    updateUndoBtn();
    showScreen('color-screen');
    KidsAudio.speak(pic.name + '! Escolha uma cor e toque no desenho para pintar.', { rate: 0.95 });
}

function renderPalette() {
    const pal = document.getElementById('palette');
    pal.innerHTML = '';
    COLORS.forEach(c => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'swatch' + (c.special ? ' special ' + c.k : '') + (c.k === 'branco' ? ' white' : '');
        if (!c.special) b.style.background = c.v;
        b.dataset.k = c.k;
        b.setAttribute('aria-label', c.n);
        if (c.special) b.innerHTML = '<span>' + c.special + '</span>';
        b.onclick = () => chooseColor(c.k);
        pal.appendChild(b);
    });
    const st = document.getElementById('stickers');
    st.innerHTML = '';
    STICKERS.forEach(e => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'swatch sticker-btn';
        b.textContent = e;
        b.dataset.e = e;
        b.onclick = () => chooseSticker(e);
        st.appendChild(b);
    });
    markSelected();
}

function markSelected() {
    document.querySelectorAll('#palette .swatch').forEach(b => b.classList.toggle('selected', !state.sticker && b.dataset.k === state.color));
    document.querySelectorAll('#stickers .swatch').forEach(b => b.classList.toggle('selected', b.dataset.e === state.sticker));
}

function chooseColor(k) {
    state.color = k;
    state.sticker = null;
    markSelected();
    KidsAudio.play('click');
    KidsAudio.speak(COLOR_BY_KEY[k].n + '!', { rate: 1 });
}

function chooseSticker(e) {
    state.sticker = e;
    markSelected();
    KidsAudio.play('click');
}

function setStickerMode(on) {
    state.showingStickers = on;
    document.getElementById('palette').classList.toggle('hidden', on);
    document.getElementById('stickers').classList.toggle('hidden', !on);
    const btn = document.getElementById('btn-stickers');
    btn.querySelector('.ti').textContent = on ? '🎨' : '⭐';
    btn.querySelector('.tl').textContent = on ? 'Cores' : 'Adesivos';
    if (on && !state.sticker) state.sticker = STICKERS[0];
    if (!on) state.sticker = null;
    markSelected();
}

function toggleStickers() {
    cancelClearArm();
    const on = !state.showingStickers;
    setStickerMode(on);
    KidsAudio.play('flip');
    if (on) KidsAudio.speak('Adesivos! Escolha um e toque no desenho. Para tirar, arraste para fora.', { rate: 0.95 });
    else KidsAudio.speak('Cores!', { rate: 1 });
}

// ---------- Desfazer ----------
function snapshot() {
    state.undo.push(JSON.stringify({ fills: state.fills, stickers: state.stickers }));
    if (state.undo.length > 60) state.undo.shift();
    updateUndoBtn();
}
function updateUndoBtn() {
    document.getElementById('btn-undo').classList.toggle('dim', state.undo.length === 0);
}
function undo() {
    cancelClearArm();
    if (state.busy || !state.undo.length) { KidsAudio.play('tick'); return; }
    const o = JSON.parse(state.undo.pop());
    state.fills = o.fills;
    state.stickers = o.stickers;
    const svg = document.getElementById('paper-svg');
    applyFills(svg, state.fills);
    drawStickers(svg, state.stickers);
    if (!isComplete()) state.celebrated = false;
    persist();
    updateUndoBtn();
    KidsAudio.play('turn');
}

// ---------- Pintar ----------
function isComplete() {
    const svg = document.getElementById('paper-svg');
    if (!svg) return false;
    return requiredIds(svg).every(id => state.fills[id]);
}

function paintRegion(el, key, silent) {
    const id = el.dataset.id;
    state.fills[id] = key;
    el.setAttribute('fill', fillValue(key));
    if (id !== 'ceu') {
        el.classList.remove('pop');
        void el.getBBox(); // reinicia a animacao
        el.classList.add('pop');
        setTimeout(() => el.classList.remove('pop'), 400);
    }
    if (!silent) KidsAudio.play('flip');
}

function svgPoint(svg, e) {
    const rect = svg.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) / rect.width * 400,
        y: (e.clientY - rect.top) / rect.height * 400
    };
}

function burst(e, text) {
    const paper = document.getElementById('paper');
    const rect = paper.getBoundingClientRect();
    const s = document.createElement('span');
    s.className = 'burst';
    s.textContent = text || '✨';
    // posicao relativa ao papel (em % para funcionar com o zoom do fit-screen)
    s.style.left = ((e.clientX - rect.left) / rect.width * 100) + '%';
    s.style.top = ((e.clientY - rect.top) / rect.height * 100) + '%';
    paper.appendChild(s);
    setTimeout(() => s.remove(), 700);
}

function bindPaper(svg) {
    svg.addEventListener('click', (e) => {
        if (state.justDragged) { state.justDragged = false; return; }
        if (state.busy) return;
        cancelClearArm();
        if (state.sticker) {
            if (e.target.closest('.sticker')) return;
            const p = svgPoint(svg, e);
            snapshot();
            state.stickers.push({ e: state.sticker, x: Math.round(p.x), y: Math.round(p.y) });
            drawStickers(svg, state.stickers);
            const last = svg.querySelector('.stickers-layer .sticker:last-child');
            if (last) last.classList.add('new');
            persist();
            KidsAudio.play('star');
            return;
        }
        const region = e.target.closest('.r');
        if (!region) return;
        if (state.fills[region.dataset.id] === state.color) { KidsAudio.play('tick'); return; }
        snapshot();
        paintRegion(region, state.color);
        burst(e, COLOR_BY_KEY[state.color].special || '✨');
        persist();
        checkComplete();
    });

    // Arrastar adesivos (em qualquer modo). Soltar fora do desenho = tirar.
    svg.addEventListener('pointerdown', (e) => {
        const st = e.target.closest('.sticker');
        if (!st || state.busy) return;
        e.preventDefault();
        const p = svgPoint(svg, e);
        const s = state.stickers[+st.dataset.i];
        state.drag = { i: +st.dataset.i, el: st, dx: s.x - p.x, dy: s.y - p.y, moved: false, sx: p.x, sy: p.y, before: JSON.stringify({ fills: state.fills, stickers: state.stickers }) };
        try { svg.setPointerCapture(e.pointerId); } catch (err) {}
        st.classList.add('dragging');
    });
    svg.addEventListener('pointermove', (e) => {
        const dr = state.drag;
        if (!dr) return;
        const p = svgPoint(svg, e);
        if (!dr.moved && Math.hypot(p.x - dr.sx, p.y - dr.sy) < 6) return;
        dr.moved = true;
        const s = state.stickers[dr.i];
        s.x = Math.round(p.x + dr.dx);
        s.y = Math.round(p.y + dr.dy);
        dr.el.setAttribute('x', s.x);
        dr.el.setAttribute('y', s.y);
        const out = s.x < -10 || s.x > 410 || s.y < -10 || s.y > 410;
        dr.el.classList.toggle('leaving', out);
    });
    const endDrag = () => {
        const dr = state.drag;
        if (!dr) return;
        state.drag = null;
        dr.el.classList.remove('dragging');
        if (!dr.moved) return;
        state.justDragged = true;
        setTimeout(() => { state.justDragged = false; }, 350);
        state.undo.push(dr.before);
        updateUndoBtn();
        const s = state.stickers[dr.i];
        if (s.x < -10 || s.x > 410 || s.y < -10 || s.y > 410) {
            state.stickers.splice(dr.i, 1);
            KidsAudio.play('turn');
        } else {
            s.x = Math.max(10, Math.min(390, s.x));
            s.y = Math.max(10, Math.min(390, s.y));
            KidsAudio.play('click');
        }
        drawStickers(svg, state.stickers);
        persist();
    };
    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', endDrag);
}

function checkComplete() {
    if (state.celebrated || !isComplete()) return;
    state.celebrated = true;
    setTimeout(celebrate, 350);
}

function celebrate() {
    KidsAudio.play('win');
    setTimeout(() => KidsAudio.speak('Que lindo! Você terminou o desenho!', { rate: 0.95 }), 900);
    const box = document.getElementById('confetti');
    const items = ['⭐', '💖', '🌟', '💗', '✨', '🌸', '🦄', '🌈'];
    for (let i = 0; i < 46; i++) {
        const s = document.createElement('span');
        s.textContent = items[i % items.length];
        s.style.left = (Math.random() * 100) + 'vw';
        s.style.fontSize = (18 + Math.random() * 26) + 'px';
        s.style.animationDuration = (2.2 + Math.random() * 1.8) + 's';
        s.style.animationDelay = (Math.random() * 0.8) + 's';
        s.style.setProperty('--drift', (Math.random() * 120 - 60) + 'px');
        box.appendChild(s);
        setTimeout(() => s.remove(), 5000);
    }
}

// ---------- Apagar tudo (toque duas vezes) ----------
function cancelClearArm() {
    clearTimeout(state.clearTimer);
    if (!state.clearArmed) return;
    state.clearArmed = false;
    const b = document.getElementById('btn-clear');
    b.classList.remove('armed');
    b.querySelector('.tl').textContent = 'Apagar tudo';
}
function clearAll() {
    if (state.busy) return;
    const b = document.getElementById('btn-clear');
    if (!state.clearArmed) {
        state.clearArmed = true;
        b.classList.add('armed');
        b.querySelector('.tl').textContent = 'Toque de novo!';
        KidsAudio.play('tick');
        KidsAudio.speak('Toque de novo para apagar tudo.', { rate: 1 });
        state.clearTimer = setTimeout(cancelClearArm, 3500);
        return;
    }
    cancelClearArm();
    if (!Object.keys(state.fills).length && !state.stickers.length) return;
    snapshot();
    state.fills = {};
    state.stickers = [];
    const svg = document.getElementById('paper-svg');
    applyFills(svg, state.fills);
    drawStickers(svg, state.stickers);
    state.celebrated = false;
    persist();
    KidsAudio.play('turn');
    KidsAudio.speak('Tudo branquinho de novo!', { rate: 1 });
}

// ---------- Pintura magica ----------
function magicPaint() {
    if (state.busy) return;
    cancelClearArm();
    const svg = document.getElementById('paper-svg');
    const regions = [...svg.querySelectorAll('.r')];
    snapshot();
    state.busy = true;
    document.getElementById('btn-magic').classList.add('working');
    KidsAudio.speak('Pintura mágica!', { rate: 1 });
    const preset = state.pic.magic;
    let i = 0;
    const step = () => {
        if (!state.pic || document.getElementById('paper-svg') !== svg) { state.busy = false; return; }
        if (i >= regions.length) {
            state.busy = false;
            document.getElementById('btn-magic').classList.remove('working');
            persist();
            checkComplete();
            return;
        }
        const el = regions[i++];
        const key = preset[el.dataset.id] || 'rosa';
        paintRegion(el, key, true);
        if (i % 2) KidsAudio.play('tick');
        setTimeout(step, 110);
    };
    step();
}

// ---------- Salvar PNG ----------
function savePNG() {
    cancelClearArm();
    persist();
    const svg = document.getElementById('paper-svg');
    if (!svg) return;
    const SIZE = 1200;
    const clone = svg.cloneNode(true);
    clone.removeAttribute('id');
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', SIZE);
    clone.setAttribute('height', SIZE);
    clone.querySelectorAll('.pop, .new').forEach(el => el.classList.remove('pop', 'new'));
    clone.insertAdjacentHTML('afterbegin', DEFS_MARKUP);
    const xml = new XMLSerializer().serializeToString(clone);
    const img = new Image();
    img.onload = () => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = SIZE;
            canvas.height = SIZE;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, SIZE, SIZE);
            ctx.drawImage(img, 0, 0, SIZE, SIZE);
            const name = 'unicornio-' + state.pic.id + '.png';
            const done = (url, revoke) => {
                const a = document.createElement('a');
                a.href = url;
                a.download = name;
                document.body.appendChild(a);
                a.click();
                a.remove();
                if (revoke) setTimeout(() => URL.revokeObjectURL(url), 4000);
            };
            if (canvas.toBlob) canvas.toBlob(b => { if (b) done(URL.createObjectURL(b), true); else done(canvas.toDataURL('image/png')); }, 'image/png');
            else done(canvas.toDataURL('image/png'));
            KidsAudio.play('star');
            KidsAudio.speak('Pronto! Desenho salvo.', { rate: 1 });
        } catch (err) {
            KidsAudio.play('wrong');
        }
    };
    img.onerror = () => KidsAudio.play('wrong');
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
}

// ---------- Inicio ----------
function init() {
    // Definicoes de gradiente/padrao compartilhadas por todos os SVGs da pagina
    const holder = document.createElement('div');
    holder.innerHTML = '<svg width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false">' + DEFS_MARKUP + '</svg>';
    document.body.appendChild(holder.firstChild);
    renderPalette();
    renderChooser();
}
init();
