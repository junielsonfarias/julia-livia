// ==========================================
// MUNDO DE JULIA E LIVIA - SCRIPT PRINCIPAL
// ==========================================

// Estado da aplicacao
let appState = {
    currentScreen: 'welcome',
    photos: [],
    drawings: [],
    juliaPhotos: [],
    liviaPhotos: [],
    memories: [],
    audioVolume: parseFloat(localStorage.getItem('audioVolume') || '1')
};

// Navegacao
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        appState.currentScreen = screenId;
    }
}

function enterWorld() {
    showScreen('main-menu');
    playSound('enter');
}

function goToWelcome() {
    showScreen('welcome-screen');
}

function backToMenu() {
    showScreen('main-menu');
}

function openSection(section) {
    switch(section) {
        case 'games':
            showScreen('games-section');
            break;
        case 'photos':
            showScreen('photos-section');
            break;
        case 'drawings':
            showScreen('drawings-section');
            break;
        case 'julia':
            showScreen('julia-section');
            break;
        case 'livia':
            showScreen('livia-section');
            break;
        case 'memories':
            showScreen('memories-section');
            break;
    }
    playSound('click');
}

// Funcao para jogar
function playGame(gameId) {
    const gameRoutes = {
        'big-hero': 'big-hero-game/index.html',
        'tabuada': 'tabuada-game/index.html',
        'memoria': 'memoria-game/index.html',
        'cores-formas': 'cores-formas-game/index.html',
        'sequencia': 'sequencia-game/index.html',
        'quiz': 'quiz-game/index.html',
        'desenhar': 'desenhar-game/index.html',
        'contar': 'contar-game/index.html',
        'animais': 'animais-game/index.html',
        'puzzle': 'puzzle-game/index.html',
        'emocoes': 'emocoes-game/index.html',
        'fracoes': 'fracoes-game/index.html',
        'ortografia': 'ortografia-game/index.html'
    };

    const route = gameRoutes[gameId];
    if (route) {
        // Big Hero abre em nova pagina, outros em modal
        if (gameId === 'big-hero') {
            window.location.href = route;
        } else {
            openGameModal(route);
        }
    }
}

// Modal de jogos inline (usa iframe)
function openGameModal(src) {
    // cria som de clique
    playSound('click');
    let modal = document.getElementById('game-modal');
    if (!modal) return window.location.href = src; // fallback
    const iframe = document.getElementById('game-iframe');
    iframe.src = src;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
}

function closeGameModal() {
    playSound('click');
    let modal = document.getElementById('game-modal');
    if (!modal) return;
    const iframe = document.getElementById('game-iframe');
    // stop and unload iframe to stop audio/timers inside
    iframe.src = '';
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
}

// Sistema de audio simples
function setAudioVolume(v){
    const vol = Math.max(0, Math.min(1, parseFloat(v)||0));
    appState.audioVolume = vol;
    try{ localStorage.setItem('audioVolume', String(vol)); }catch(e){}
    const el = document.getElementById('audio-volume'); if (el) el.value = vol;
}

function playMelody(kind){
    try{
        if (!window.AudioContext && !window.webkitAudioContext) return true;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        const master = ctx.createGain(); master.connect(ctx.destination);
        const vol = (appState.audioVolume !== undefined ? appState.audioVolume : 1);
        master.gain.setValueAtTime(0.0001, now);
        const osc = ctx.createOscillator(); osc.type = 'sine'; osc.connect(master);

        const sequences = {
            correct: [660,880,1040],
            perfect: [740,880,1040,1320],
            wrong: [220,180],
            click: [880],
            enter: [660]
        };
        const seq = sequences[kind] || [440];
        let t = now;
        master.gain.exponentialRampToValueAtTime(0.12 * vol, t + 0.01);
        osc.start(now);
        seq.forEach((f,i)=>{
            const d = (i===seq.length-1) ? 0.28 : 0.12;
            osc.frequency.setValueAtTime(f, t);
            t += d;
        });
        master.gain.exponentialRampToValueAtTime(0.0001, t+0.02);
        osc.stop(t+0.03);
        setTimeout(()=>{ try{ osc.disconnect(); master.disconnect(); ctx.close(); }catch(e){} }, Math.round((t-now+0.1)*1000));
        return true;
    }catch(e){ return false; }
}

// Sistema de audio simples
function playSound(type){
    // Try to play a short sound or melody and return true if played
    try{
        // prefer melodies for certain types
        if (type === 'correct' || type === 'wrong' || type === 'perfect' || type === 'enter' || type === 'click'){
            return playMelody(type);
        }
        if (!window.AudioContext && !window.webkitAudioContext) return false;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        const now = ctx.currentTime;
        const vol = (appState.audioVolume !== undefined ? appState.audioVolume : 1);
        let peak = 0.12 * vol;
        if (type === 'click') peak = 0.12 * vol, o.frequency.setValueAtTime(880, now);
        else if (type === 'enter') peak = 0.16 * vol, o.frequency.setValueAtTime(660, now);
        else if (type === 'correct') peak = 0.18 * vol, o.frequency.setValueAtTime(880, now);
        else if (type === 'wrong') peak = 0.14 * vol, o.frequency.setValueAtTime(220, now);
        else o.frequency.setValueAtTime(440, now);
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(peak, now+0.001);
        g.gain.exponentialRampToValueAtTime(0.0001, now+0.3);
        o.start(now); o.stop(now+0.5);
        setTimeout(()=>{ try{ o.disconnect(); g.disconnect(); ctx.close(); }catch(e){} }, 700);
        return true;
    }catch(e){ return false; }
}

// Upload de fotos
document.addEventListener('DOMContentLoaded', function() {
    // Photo upload
    const photoUpload = document.querySelector('.photo-upload-area');
    const photoInput = document.getElementById('photo-input');

    if (photoUpload && photoInput) {
        photoUpload.addEventListener('click', () => photoInput.click());
        photoInput.addEventListener('change', handlePhotoUpload);
    }

    // Drawing upload
    const drawingUpload = document.querySelector('.drawing-upload-area');
    const drawingInput = document.getElementById('drawing-input');

    if (drawingUpload && drawingInput) {
        drawingUpload.addEventListener('click', () => drawingInput.click());
        drawingInput.addEventListener('change', handleDrawingUpload);
    }

    // Carregar dados salvos
    loadSavedData();

    // Detectar dispositivo movel
    detectMobile();
});

function handlePhotoUpload(event) {
    const files = event.target.files;
    const gallery = document.getElementById('photo-gallery');

    if (!gallery) return;

    // Limpar mensagem vazia
    const emptyMsg = gallery.querySelector('.empty-message');
    if (emptyMsg) emptyMsg.remove();

    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const photoItem = createGalleryItem(e.target.result, file.name);
                gallery.appendChild(photoItem);
                appState.photos.push({ name: file.name, data: e.target.result });
                saveData();
            };
            reader.readAsDataURL(file);
        }
    });
}

function handleDrawingUpload(event) {
    const files = event.target.files;
    const gallery = document.getElementById('drawings-gallery');

    if (!gallery) return;

    const emptyMsg = gallery.querySelector('.empty-message');
    if (emptyMsg) emptyMsg.remove();

    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const drawingItem = createGalleryItem(e.target.result, file.name);
                gallery.appendChild(drawingItem);
                appState.drawings.push({ name: file.name, data: e.target.result });
                saveData();
            };
            reader.readAsDataURL(file);
        }
    });
}

function createGalleryItem(imageSrc, title) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `
        <img src="${imageSrc}" alt="${title}" onclick="openLightbox(this.src)">
        <div class="gallery-item-overlay">
            <span>${title}</span>
        </div>
    `;
    item.style.cssText = `
        position: relative;
        border-radius: 15px;
        overflow: hidden;
        aspect-ratio: 1;
        cursor: pointer;
        transition: transform 0.3s ease;
    `;

    const img = item.querySelector('img');
    img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
    `;

    const overlay = item.querySelector('.gallery-item-overlay');
    overlay.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 10px;
        background: linear-gradient(transparent, rgba(0,0,0,0.7));
        color: white;
        font-size: 0.9rem;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    item.addEventListener('mouseenter', () => {
        item.style.transform = 'scale(1.05)';
        overlay.style.opacity = '1';
    });

    item.addEventListener('mouseleave', () => {
        item.style.transform = 'scale(1)';
        overlay.style.opacity = '0';
    });

    return item;
}

// Lightbox
function openLightbox(src) {
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        cursor: pointer;
    `;

    lightbox.innerHTML = `
        <img src="${src}" style="max-width: 90%; max-height: 90%; border-radius: 10px; box-shadow: 0 10px 50px rgba(0,0,0,0.5);">
        <button style="position: absolute; top: 20px; right: 20px; background: white; border: none; width: 50px; height: 50px; border-radius: 50%; font-size: 24px; cursor: pointer;">X</button>
    `;

    lightbox.addEventListener('click', () => lightbox.remove());
    document.body.appendChild(lightbox);
}

// Persistencia de dados
function saveData() {
    try {
        localStorage.setItem('mundoJuliaLivia', JSON.stringify(appState));
    } catch (e) {
        console.log('Erro ao salvar dados:', e);
    }
}

function loadSavedData() {
    try {
        const saved = localStorage.getItem('mundoJuliaLivia');
        if (saved) {
            const data = JSON.parse(saved);
            appState = { ...appState, ...data };
            renderSavedPhotos();
            renderSavedDrawings();
        }
    } catch (e) {
        console.log('Erro ao carregar dados:', e);
    }
}

function renderSavedPhotos() {
    const gallery = document.getElementById('photo-gallery');
    if (!gallery || appState.photos.length === 0) return;

    const emptyMsg = gallery.querySelector('.empty-message');
    if (emptyMsg) emptyMsg.remove();

    appState.photos.forEach(photo => {
        const item = createGalleryItem(photo.data, photo.name);
        gallery.appendChild(item);
    });
}

function renderSavedDrawings() {
    const gallery = document.getElementById('drawings-gallery');
    if (!gallery || appState.drawings.length === 0) return;

    const emptyMsg = gallery.querySelector('.empty-message');
    if (emptyMsg) emptyMsg.remove();

    appState.drawings.forEach(drawing => {
        const item = createGalleryItem(drawing.data, drawing.name);
        gallery.appendChild(item);
    });
}

// Deteccao de dispositivo movel
function detectMobile() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        document.body.classList.add('is-mobile');
    }
}

// Drag and drop para fotos
document.addEventListener('DOMContentLoaded', function() {
    const dropAreas = document.querySelectorAll('.photo-upload-area, .drawing-upload-area');

    dropAreas.forEach(area => {
        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.style.borderColor = '#667eea';
            area.style.background = '#f0f0ff';
        });

        area.addEventListener('dragleave', () => {
            area.style.borderColor = '#ccc';
            area.style.background = 'white';
        });

        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.style.borderColor = '#ccc';
            area.style.background = 'white';

            const files = e.dataTransfer.files;
            const input = area.querySelector('input');

            if (input && files.length > 0) {
                // Criar um novo FileList-like object
                const dt = new DataTransfer();
                Array.from(files).forEach(file => dt.items.add(file));
                input.files = dt.files;
                input.dispatchEvent(new Event('change'));
            }
        });
    });
});

// Animacao de entrada
function animateOnScroll() {
    const elements = document.querySelectorAll('.menu-card, .game-card, .profile-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.5s ease';
        observer.observe(el);
    });
}

// Adicionar memoria
function addMemory() {
    const year = prompt('Ano da memoria:');
    const title = prompt('Titulo da memoria:');
    const description = prompt('Descricao:');

    if (year && title) {
        const memory = { year, title, description, date: new Date().toISOString() };
        appState.memories.push(memory);
        saveData();
        renderMemories();
    }
}

function renderMemories() {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;

    // Limpar e reconstruir
    timeline.innerHTML = '';

    appState.memories.forEach(memory => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
            <div class="timeline-date">${memory.year}</div>
            <div class="timeline-content">
                <h3>${memory.title}</h3>
                <p>${memory.description || ''}</p>
            </div>
        `;
        timeline.appendChild(item);
    });

    if (appState.memories.length === 0) {
        timeline.innerHTML = `
            <div class="timeline-item">
                <div class="timeline-date">2024</div>
                <div class="timeline-content">
                    <h3>Comeco de uma linda historia!</h3>
                    <p>Adicione memorias especiais...</p>
                </div>
            </div>
        `;
    }
}

// Conectar botao de adicionar memoria
document.addEventListener('DOMContentLoaded', function() {
    const addMemoryBtn = document.querySelector('.add-memory-btn');
    if (addMemoryBtn) {
        addMemoryBtn.addEventListener('click', addMemory);
    }
});

// inicializar controle de volume se presente
document.addEventListener('DOMContentLoaded', function(){
    const vol = document.getElementById('audio-volume');
    if (vol){
        // set value from saved state
        vol.value = (appState.audioVolume !== undefined ? appState.audioVolume : 1);
        vol.addEventListener('input', (e)=>{
            setAudioVolume(e.target.value);
        });
    }
});

console.log('Mundo de Julia e Livia carregado com sucesso!');
