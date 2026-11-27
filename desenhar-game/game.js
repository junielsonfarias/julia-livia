// Jogo de Desenhar e Pintar - Para criancas de 4 anos
// Mundo de Julia & Livia

// Estado do desenho
let drawState = {
    isDrawing: false,
    currentColor: '#FF0000',
    brushSize: 15,
    tool: 'brush',
    sticker: null,
    lastX: 0,
    lastY: 0,
    midX: 0,      // fim da ultima curva (ponto medio entre os dois ultimos toques)
    midY: 0,
    hue: 0        // cor atual do pincel arco-iris
};

// Nomes das cores (falados quando a crianca escolhe)
const COLOR_NAMES = {
    '#FF0000': 'Vermelho',
    '#FF9800': 'Laranja',
    '#FFEB3B': 'Amarelo',
    '#4CAF50': 'Verde',
    '#2196F3': 'Azul',
    '#9C27B0': 'Roxo',
    '#E91E63': 'Rosa',
    '#795548': 'Marrom',
    '#000000': 'Preto',
    '#FFFFFF': 'Branco'
};

const TOOL_NAMES = {
    brush: 'Pincel',
    eraser: 'Borracha',
    fill: 'Balde de tinta',
    spray: 'Spray',
    rainbow: 'Arco-íris',
    glitter: 'Purpurina'
};

const MAX_UNDO = 6; // poucas fotos para nao pesar a memoria do tablet
let undoStack = [];

let canvas, ctx;
let dpr = 1;          // densidade de pixels usada no canvas
let cssW = 0, cssH = 0; // tamanho do canvas em pixels CSS
let resizeTimer = null;
let activePointer = null; // dedo/caneta que esta desenhando (outros dedos e a palma sao ignorados)
// Desenho antes de encolher para caber (girar o tablet): se nada mudou desde entao,
// ao girar de volta ele volta ao tamanho original em vez de ir ficando menor a cada giro
let preShrink = null;

// Inicializacao
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    initControls();
});

function initCanvas() {
    canvas = document.getElementById('drawing-canvas');
    ctx = canvas.getContext('2d');

    // Ajustar tamanho do canvas
    resizeCanvas();
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resizeCanvas, 150);
    });

    // Eventos de desenho - Pointer (dedo, caneta e mouse num so)
    if (window.PointerEvent) {
        canvas.addEventListener('pointerdown', onPointerDown);
        canvas.addEventListener('pointermove', onPointerMove);
        canvas.addEventListener('pointerup', onPointerUp);
        canvas.addEventListener('pointercancel', onPointerUp);
        canvas.addEventListener('lostpointercapture', onPointerUp);
        return;
    }

    // Navegadores antigos: Mouse
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // Eventos de desenho - Touch
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);
}

// Redimensiona sem perder o desenho: copia para um canvas auxiliar,
// pinta o fundo branco e redesenha (encolhe para caber se a tela diminuiu)
function resizeCanvas() {
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    const newDpr = Math.min(window.devicePixelRatio || 1, 2);
    const newW = Math.max(1, Math.floor(rect.width));
    const newH = Math.max(1, Math.floor(rect.height));

    if (newW === cssW && newH === cssH && newDpr === dpr) return;

    // Copiar o conteudo atual (ou o desenho de antes de encolher, se nada mudou)
    let backup = null;
    let oldW = cssW, oldH = cssH;
    if (preShrink) {
        backup = preShrink.canvas;
        oldW = preShrink.w;
        oldH = preShrink.h;
    } else if (cssW > 0 && cssH > 0) {
        backup = document.createElement('canvas');
        backup.width = canvas.width;
        backup.height = canvas.height;
        backup.getContext('2d').drawImage(canvas, 0, 0);
    }
    preShrink = null;

    dpr = newDpr;
    cssW = newW;
    cssH = newH;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    fillBackground('#FFFFFF');

    if (backup) {
        // Se cabe, desenha no mesmo tamanho; se nao, encolhe mantendo a proporcao
        const scale = Math.min(1, cssW / oldW, cssH / oldH);
        ctx.drawImage(backup, 0, 0, oldW * scale, oldH * scale);
        if (scale < 1) preShrink = { canvas: backup, w: oldW, h: oldH };
    }

    // As fotos do "Desfazer" tem o tamanho antigo
    undoStack = [];
}

function fillBackground(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, cssW, cssH);
}

function setActiveTool(tool) {
    drawState.tool = tool;
    document.querySelectorAll('.tool-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tool === tool);
    });
    if (tool !== 'sticker') {
        drawState.sticker = null;
        document.querySelectorAll('.sticker-btn').forEach(s => s.classList.remove('active'));
    }
}

function initControls() {
    // Carimbos como figuras 3D (o botao guarda o emoji em data-sticker)
    if (window.Emoji3D) {
        const lista = [];
        document.querySelectorAll('.sticker-btn').forEach(b => {
            lista.push(b.dataset.sticker);
            b.innerHTML = Emoji3D.html(b.dataset.sticker);
            b.setAttribute('aria-label', 'carimbo ' + b.dataset.sticker);
        });
        Emoji3D.carregar(lista);
    }

    // Cores: escolher uma cor volta para o pincel (se estava no carimbo ou na borracha)
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            drawState.currentColor = btn.dataset.color;
            if (drawState.tool === 'sticker' || drawState.tool === 'eraser') {
                setActiveTool('brush');
            }
            playSound('click');
            const name = COLOR_NAMES[btn.dataset.color.toUpperCase()];
            if (name) speak(name);
        });
    });

    // Tamanho do pincel
    document.querySelectorAll('.brush-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.brush-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            drawState.brushSize = parseInt(btn.dataset.size);
            playSound('click');
        });
    });

    // Ferramentas
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setActiveTool(btn.dataset.tool);
            playSound('select');
            if (TOOL_NAMES[btn.dataset.tool]) speak(TOOL_NAMES[btn.dataset.tool]);
        });
    });

    // Carimbos/Stickers
    document.querySelectorAll('.sticker-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.sticker-btn').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.tool-btn').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            drawState.sticker = btn.dataset.sticker;
            drawState.tool = 'sticker';
            playSound('select');
        });
    });
}

// Converte a posicao na tela para as coordenadas do desenho (cssW x cssH).
// Divide pelo tamanho MOSTRADO do canvas: continua certo se ele estiver
// esticado/encolhido (arredondamento do tamanho, zoom da pagina...).
function toCanvasPos(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (clientX - rect.left) * (rect.width ? cssW / rect.width : 1),
        y: (clientY - rect.top) * (rect.height ? cssH / rect.height : 1)
    };
}

function getMousePos(e) {
    return toCanvasPos(e.clientX, e.clientY);
}

function getTouchPos(e) {
    const touch = e.touches[0];
    return toCanvasPos(touch.clientX, touch.clientY);
}

function onPointerDown(e) {
    if (activePointer !== null) return;               // segundo dedo/palma: ignora
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    activePointer = e.pointerId;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    const pos = toCanvasPos(e.clientX, e.clientY);
    startDrawingAt(pos.x, pos.y);
}

function onPointerMove(e) {
    if (e.pointerId !== activePointer || !drawState.isDrawing) return;
    e.preventDefault();
    // Pontos intermediarios do movimento: traco mais liso no tablet
    const list = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    (list.length ? list : [e]).forEach(ev => {
        const pos = toCanvasPos(ev.clientX, ev.clientY);
        drawAt(pos.x, pos.y);
    });
}

function onPointerUp(e) {
    if (e.pointerId !== activePointer) return;
    activePointer = null;
    stopDrawing();
}

function handleTouchStart(e) {
    e.preventDefault();
    if (!e.touches.length) return;
    const pos = getTouchPos(e);
    startDrawingAt(pos.x, pos.y);
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!drawState.isDrawing || !e.touches.length) return;
    const pos = getTouchPos(e);
    drawAt(pos.x, pos.y);
}

function startDrawing(e) {
    const pos = getMousePos(e);
    startDrawingAt(pos.x, pos.y);
}

function startDrawingAt(x, y) {
    saveUndoSnapshot();
    preShrink = null;   // o desenho mudou
    drawState.isDrawing = true;
    drawState.lastX = x;
    drawState.lastY = y;
    drawState.midX = x;
    drawState.midY = y;

    if (drawState.tool === 'sticker' && drawState.sticker) {
        drawSticker(x, y);
        playSound('flip');
    } else if (drawState.tool === 'fill') {
        floodFill(Math.floor(x * dpr), Math.floor(y * dpr), drawState.currentColor);
    } else if (drawState.tool === 'spray') {
        sprayAt(x, y);
    } else {
        // Desenhar um ponto inicial
        ctx.beginPath();
        ctx.arc(x, y, drawState.brushSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = strokeColor();
        ctx.fill();
        if (drawState.tool === 'glitter') glitterAt(x, y, x, y);
    }
}

// Cor do traco conforme a ferramenta
function strokeColor() {
    if (drawState.tool === 'eraser') return '#FFFFFF';
    if (drawState.tool === 'rainbow') return 'hsl(' + Math.round(drawState.hue) + ',95%,56%)';
    return drawState.currentColor;
}

// Purpurina: estrelinhas e pontinhos claros espalhados pelo traco
function glitterAt(x0, y0, x1, y1) {
    const r = drawState.brushSize / 2;
    const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / 7));
    const cores = ['#ffffff', '#fff6b0', '#ffd6f5', '#d8f3ff'];
    for (let i = 0; i < n; i++) {
        const t = Math.random();
        const px = x0 + (x1 - x0) * t + (Math.random() - 0.5) * r * 1.6;
        const py = y0 + (y1 - y0) * t + (Math.random() - 0.5) * r * 1.6;
        const s = 1 + Math.random() * Math.max(1.5, r * 0.28);
        ctx.fillStyle = cores[(Math.random() * cores.length) | 0];
        if (Math.random() < 0.35) {
            // estrelinha de 4 pontas
            ctx.beginPath();
            ctx.moveTo(px, py - s * 2.2); ctx.lineTo(px + s * 0.5, py - s * 0.5);
            ctx.lineTo(px + s * 2.2, py); ctx.lineTo(px + s * 0.5, py + s * 0.5);
            ctx.lineTo(px, py + s * 2.2); ctx.lineTo(px - s * 0.5, py + s * 0.5);
            ctx.lineTo(px - s * 2.2, py); ctx.lineTo(px - s * 0.5, py - s * 0.5);
            ctx.closePath(); ctx.fill();
        } else {
            ctx.fillRect(px - s / 2, py - s / 2, s, s);
        }
    }
}

function draw(e) {
    if (!drawState.isDrawing) return;
    const pos = getMousePos(e);
    drawAt(pos.x, pos.y);
}

function sprayAt(x, y) {
    ctx.fillStyle = drawState.currentColor;
    for (let i = 0; i < 20; i++) {
        const offsetX = (Math.random() - 0.5) * drawState.brushSize * 2;
        const offsetY = (Math.random() - 0.5) * drawState.brushSize * 2;
        ctx.fillRect(x + offsetX, y + offsetY, 2, 2);
    }
}

function drawAt(x, y) {
    if (drawState.tool === 'sticker' || drawState.tool === 'fill') return;

    if (drawState.tool === 'spray') {
        sprayAt(x, y);
        drawState.lastX = x;
        drawState.lastY = y;
        return;
    }

    // Traco liso: curva quadratica entre os pontos medios, usando o toque como ponto de controle
    const lx = drawState.lastX, ly = drawState.lastY;
    const d = Math.hypot(x - lx, y - ly);
    if (d < 1.2) return;   // tremidinha do dedo: espera andar mais
    const mx = (lx + x) / 2, my = (ly + y) / 2;
    if (drawState.tool === 'rainbow') drawState.hue = (drawState.hue + d * 0.7) % 360;
    ctx.beginPath();
    ctx.moveTo(drawState.midX, drawState.midY);
    ctx.quadraticCurveTo(lx, ly, mx, my);
    ctx.strokeStyle = strokeColor();
    ctx.lineWidth = drawState.brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    if (drawState.tool === 'glitter') glitterAt(drawState.midX, drawState.midY, mx, my);

    drawState.midX = mx;
    drawState.midY = my;
    drawState.lastX = x;
    drawState.lastY = y;
}

function stopDrawing() {
    // fecha o traco ate o ultimo ponto tocado
    if (drawState.isDrawing && ['brush', 'eraser', 'rainbow', 'glitter'].includes(drawState.tool) &&
        (drawState.midX !== drawState.lastX || drawState.midY !== drawState.lastY)) {
        ctx.beginPath();
        ctx.moveTo(drawState.midX, drawState.midY);
        ctx.lineTo(drawState.lastX, drawState.lastY);
        ctx.strokeStyle = strokeColor();
        ctx.lineWidth = drawState.brushSize;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
    drawState.isDrawing = false;
}

// Carimbo: figura 3D quando ja carregou (CORS liberado, nao "suja" o canvas); senao, emoji em texto
function drawSticker(x, y) {
    const size = drawState.brushSize * 3;
    const im = window.Emoji3D ? Emoji3D.imagem(drawState.sticker) : null;
    if (im && Emoji3D.pronta(im)) {
        const s = size * 1.15;
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,.22)';
        ctx.shadowBlur = size * 0.08;
        ctx.shadowOffsetY = size * 0.05;
        ctx.drawImage(im, x - s / 2, y - s / 2, s, s);
        ctx.restore();
    } else {
        ctx.font = `${size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000000';
        ctx.fillText(drawState.sticker, x, y);
    }
    if (window.Efeitos) {
        const r = canvas.getBoundingClientRect();
        Efeitos.estrelas({ x: r.left + x * r.width / cssW, y: r.top + y * r.height / cssH }, { quantidade: 8, forca: 0.5 });
    }
}

// Flood fill (balde de tinta) - trabalha em pixels reais do canvas
function floodFill(startX, startY, fillColor) {
    const w = canvas.width, h = canvas.height;
    if (startX < 0 || startY < 0 || startX >= w || startY >= h) return;

    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    const startPos = (startY * w + startX) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];

    // Converter cor hex para RGB
    const fillR = parseInt(fillColor.slice(1, 3), 16);
    const fillG = parseInt(fillColor.slice(3, 5), 16);
    const fillB = parseInt(fillColor.slice(5, 7), 16);

    // Se a cor e a mesma, nao fazer nada
    if (startR === fillR && startG === fillG && startB === fillB) return;

    // Marca como visitado ao EMPILHAR: cada pixel entra na pilha no maximo uma vez
    // (antes entrava ate 4 vezes: milhoes de itens num canvas grande de tablet)
    const visited = new Uint8Array(w * h);
    const first = startY * w + startX;
    const stack = [first];
    visited[first] = 1;
    const push = (i) => { if (!visited[i]) { visited[i] = 1; stack.push(i); } };

    while (stack.length > 0) {
        const idx = stack.pop();

        const pos = idx * 4;
        // Verificar se a cor e similar (tolerancia de 30)
        if (Math.abs(data[pos] - startR) > 30 ||
            Math.abs(data[pos + 1] - startG) > 30 ||
            Math.abs(data[pos + 2] - startB) > 30) continue;

        data[pos] = fillR;
        data[pos + 1] = fillG;
        data[pos + 2] = fillB;
        data[pos + 3] = 255;

        const x = idx % w;
        if (x + 1 < w) push(idx + 1);
        if (x > 0) push(idx - 1);
        if (idx + w < w * h) push(idx + w);
        if (idx - w >= 0) push(idx - w);
    }

    ctx.putImageData(imageData, 0, 0);
}

// ---------- Desfazer ----------
function saveUndoSnapshot() {
    try {
        const snap = document.createElement('canvas');
        snap.width = canvas.width;
        snap.height = canvas.height;
        snap.getContext('2d').drawImage(canvas, 0, 0);
        undoStack.push(snap);
        if (undoStack.length > MAX_UNDO) undoStack.shift();
    } catch (e) { /* sem memoria: ignora */ }
}

function undo() {
    if (undoStack.length === 0) {
        playSound('wrong');
        return;
    }
    const snapshot = undoStack.pop();
    if (snapshot.width === canvas.width && snapshot.height === canvas.height) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(snapshot, 0, 0);
        ctx.restore();
    }
    playSound('turn');
}

// ---------- Limpar (sem janelas do navegador) ----------
function clearCanvas() {
    if (document.querySelector('.confirm-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
        <div class="confirm-box">
            <div class="confirm-icon">🗑️</div>
            <h2>Apagar tudo?</h2>
            <div class="confirm-buttons">
                <button class="confirm-yes" aria-label="Sim, apagar">✔</button>
                <button class="confirm-no" aria-label="Não apagar">✖</button>
            </div>
        </div>
    `;
    overlay.querySelector('.confirm-yes').onclick = () => {
        saveUndoSnapshot();
        preShrink = null;
        fillBackground('#FFFFFF');
        playSound('flip');
        speak('Tudo limpinho!');
        overlay.remove();
    };
    overlay.querySelector('.confirm-no').onclick = () => {
        playSound('click');
        overlay.remove();
    };
    document.body.appendChild(overlay);
    playSound('select');
    speak('Apagar tudo? Verde é sim, vermelho é não.');
}

function saveDrawing() {
    let dataURL;
    try { dataURL = canvas.toDataURL('image/png'); }
    catch (e) { playSound('wrong'); return; }   // canvas "sujo" (nao deve acontecer: figuras com CORS)

    // Criar modal de preview
    const modal = document.createElement('div');
    modal.className = 'save-modal';
    modal.innerHTML = `
        <div class="save-modal-content">
            <h2>Seu Desenho!</h2>
            <img src="${dataURL}" alt="Seu desenho">
            <div class="save-modal-buttons">
                <a href="${dataURL}" download="meu-desenho.png" class="download-btn" onclick="this.parentElement.parentElement.parentElement.remove()">Baixar</a>
                <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">Fechar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    playSound('star');
    speak('Que desenho lindo!');
}

function goBack() {
    if (window.parent !== window) {
        try {
            if (window.parent.closeGameModal) {
                window.parent.closeGameModal();
                return;
            }
        } catch(e) {}
    }
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = '../index.html';
    }
}

// Sons (audio compartilhado: um unico AudioContext)
function playSound(type) {
    if (window.KidsAudio) KidsAudio.play(type);
}

// Voz em portugues
function speak(text, opts) {
    if (window.KidsAudio) KidsAudio.speak(text, opts);
}
