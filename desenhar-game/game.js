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
    lastY: 0
};

let canvas, ctx;

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
    window.addEventListener('resize', resizeCanvas);

    // Eventos de desenho - Mouse
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Eventos de desenho - Touch
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    // Fundo branco inicial
    fillBackground('#FFFFFF');
}

function resizeCanvas() {
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();

    // Salvar o conteudo atual
    const imageData = ctx ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null;

    canvas.width = rect.width;
    canvas.height = rect.height;

    // Restaurar o conteudo
    if (imageData) {
        ctx.putImageData(imageData, 0, 0);
    } else {
        fillBackground('#FFFFFF');
    }
}

function fillBackground(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function initControls() {
    // Cores
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            drawState.currentColor = btn.dataset.color;
            drawState.sticker = null;
            document.querySelectorAll('.sticker-btn').forEach(s => s.classList.remove('active'));
        });
    });

    // Tamanho do pincel
    document.querySelectorAll('.brush-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.brush-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            drawState.brushSize = parseInt(btn.dataset.size);
        });
    });

    // Ferramentas
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            drawState.tool = btn.dataset.tool;
            drawState.sticker = null;
            document.querySelectorAll('.sticker-btn').forEach(s => s.classList.remove('active'));
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
        });
    });
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
    };
}

function handleTouchStart(e) {
    e.preventDefault();
    const pos = getTouchPos(e);
    startDrawingAt(pos.x, pos.y);
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!drawState.isDrawing) return;
    const pos = getTouchPos(e);
    drawAt(pos.x, pos.y);
}

function startDrawing(e) {
    const pos = getMousePos(e);
    startDrawingAt(pos.x, pos.y);
}

function startDrawingAt(x, y) {
    drawState.isDrawing = true;
    drawState.lastX = x;
    drawState.lastY = y;

    if (drawState.tool === 'sticker' && drawState.sticker) {
        drawSticker(x, y);
    } else if (drawState.tool === 'fill') {
        floodFill(Math.floor(x), Math.floor(y), drawState.currentColor);
    } else {
        // Desenhar um ponto inicial
        ctx.beginPath();
        ctx.arc(x, y, drawState.brushSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = drawState.tool === 'eraser' ? '#FFFFFF' : drawState.currentColor;
        ctx.fill();
    }
}

function draw(e) {
    if (!drawState.isDrawing) return;
    const pos = getMousePos(e);
    drawAt(pos.x, pos.y);
}

function drawAt(x, y) {
    if (drawState.tool === 'sticker' || drawState.tool === 'fill') return;

    ctx.beginPath();
    ctx.moveTo(drawState.lastX, drawState.lastY);
    ctx.lineTo(x, y);

    if (drawState.tool === 'eraser') {
        ctx.strokeStyle = '#FFFFFF';
    } else if (drawState.tool === 'spray') {
        // Efeito spray
        for (let i = 0; i < 20; i++) {
            const offsetX = (Math.random() - 0.5) * drawState.brushSize * 2;
            const offsetY = (Math.random() - 0.5) * drawState.brushSize * 2;
            ctx.fillStyle = drawState.currentColor;
            ctx.fillRect(x + offsetX, y + offsetY, 2, 2);
        }
        drawState.lastX = x;
        drawState.lastY = y;
        return;
    } else {
        ctx.strokeStyle = drawState.currentColor;
    }

    ctx.lineWidth = drawState.brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    drawState.lastX = x;
    drawState.lastY = y;
}

function stopDrawing() {
    drawState.isDrawing = false;
}

function drawSticker(x, y) {
    ctx.font = `${drawState.brushSize * 3}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(drawState.sticker, x, y);
}

// Flood fill (balde de tinta) - simplificado
function floodFill(startX, startY, fillColor) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const startPos = (startY * canvas.width + startX) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];

    // Converter cor hex para RGB
    const fillR = parseInt(fillColor.slice(1, 3), 16);
    const fillG = parseInt(fillColor.slice(3, 5), 16);
    const fillB = parseInt(fillColor.slice(5, 7), 16);

    // Se a cor e a mesma, nao fazer nada
    if (startR === fillR && startG === fillG && startB === fillB) return;

    const stack = [[startX, startY]];
    const visited = new Set();

    while (stack.length > 0 && stack.length < 100000) {
        const [x, y] = stack.pop();
        const key = `${x},${y}`;

        if (visited.has(key)) continue;
        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;

        const pos = (y * canvas.width + x) * 4;
        const r = data[pos];
        const g = data[pos + 1];
        const b = data[pos + 2];

        // Verificar se a cor e similar (tolerancia de 30)
        if (Math.abs(r - startR) > 30 || Math.abs(g - startG) > 30 || Math.abs(b - startB) > 30) continue;

        visited.add(key);

        data[pos] = fillR;
        data[pos + 1] = fillG;
        data[pos + 2] = fillB;
        data[pos + 3] = 255;

        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
}

function clearCanvas() {
    if (confirm('Quer apagar todo o desenho?')) {
        fillBackground('#FFFFFF');
        playSound('clear');
    }
}

function saveDrawing() {
    const dataURL = canvas.toDataURL('image/png');

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
    playSound('save');
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

// Som simples
function playSound(type) {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;

        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0.1, now);

        if (type === 'clear') {
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.setValueAtTime(300, now + 0.1);
        } else if (type === 'save') {
            osc.frequency.setValueAtTime(523, now);
            osc.frequency.setValueAtTime(659, now + 0.1);
            osc.frequency.setValueAtTime(784, now + 0.2);
        }

        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);

        setTimeout(() => ctx.close(), 500);
    } catch(e) {}
}
