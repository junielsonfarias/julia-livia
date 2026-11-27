// ==========================================
// MUNDO DE JULIA E LIVIA - SCRIPT PRINCIPAL
// ==========================================

// Estado da aplicacao
let appState = {
    currentScreen: 'welcome',
    audioVolume: (() => { try { return parseFloat(localStorage.getItem('audioVolume') || '1'); } catch (e) { return 1; } })()
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
        case 'progress':
            renderProgress();
            updateStorageInfo();
            showScreen('progress-section');
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
        'ortografia': 'ortografia-game/index.html',
        'corpo': 'corpo-game/index.html',
        'leitura': 'leitura-game/index.html',
        'silabas': 'silabas-game/index.html',
        'interpretacao': 'interpretacao-game/index.html',
        'olimpiada': 'olimpiada-game/index.html',
        'letras': 'letras-game/index.html',
        'rimas': 'rimas-game/index.html',
        'graficos': 'graficos-game/index.html',
        'dinheiro': 'dinheiro-game/index.html',
        'trilha': 'trilha-game/index.html',
        'relampago': 'relampago-game/index.html',
        'velha': 'velha-game/index.html',
        'selva': 'selva-game/index.html',
        'unicornio-corrida': 'unicornio-corrida-game/index.html',
        'unicornio-pintura': 'unicornio-pintura-game/index.html',
        'unicornio-arcoiris': 'unicornio-arcoiris-game/index.html'
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
// Troca a pagina do iframe SEM criar entradas no historico do navegador
function setGameFrame(iframe, url) {
    try { iframe.contentWindow.location.replace(url); }
    catch (e) { iframe.src = url; }
}

function openGameModal(src) {
    playSound('click');
    const modal = document.getElementById('game-modal');
    if (!modal) return window.location.href = src; // fallback
    const iframe = document.getElementById('game-iframe');
    const wasOpen = isGameModalOpen();
    setGameFrame(iframe, new URL(src, location.href).href);
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    // Botao/gesto "voltar" do celular fecha o jogo (e nao o app inteiro).
    // Uma entrada so: se ja existe (jogo aberto, pagina recarregada com o jogo aberto
    // ou um "voltar" ainda a caminho), reaproveita em vez de empilhar outra.
    if (!wasOpen && !(history.state && history.state.gameModal)) {
        try { history.pushState({ gameModal: true }, ''); } catch (e) {}
    }
    setTimeout(() => { try { iframe.focus(); } catch (e) {} }, 300);
}

function isGameModalOpen() {
    const modal = document.getElementById('game-modal');
    return modal && !modal.classList.contains('hidden');
}

// Fecha de verdade (sem mexer no historico)
function hideGameModal() {
    const modal = document.getElementById('game-modal');
    if (!modal || modal.classList.contains('hidden')) return;
    playSound('click');
    setTimeout(updateDuelTotal, 50);
    const iframe = document.getElementById('game-iframe');
    // Para a voz do jogo e descarrega o iframe (para audio, microfone e timers)
    try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) {}
    setGameFrame(iframe, 'about:blank');
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
}

// Chamado pelo botao "Voltar" de cada jogo, pelo X e pela tecla Esc
// Fecha na hora e depois tira a entrada do historico. (Antes esperava o popstate para
// fechar: um toque duplo no "Voltar" chamava history.back() duas vezes e saia do app.)
let modalBackPending = false;
let modalBackTimer = null;
function closeGameModal() {
    if (!isGameModalOpen()) return;
    hideGameModal();
    if (!modalBackPending && history.state && history.state.gameModal) {
        modalBackPending = true;
        clearTimeout(modalBackTimer);
        modalBackTimer = setTimeout(() => { modalBackPending = false; }, 1500);
        history.back();
    }
}

window.addEventListener('popstate', () => {
    if (modalBackPending) {
        // Este popstate e o do nosso history.back(): o jogo ja foi fechado
        modalBackPending = false;
        clearTimeout(modalBackTimer);
        // Um jogo foi aberto enquanto o "voltar" estava a caminho: recoloca a entrada
        if (isGameModalOpen()) { try { history.pushState({ gameModal: true }, ''); } catch (e) {} }
        return;
    }
    if (isGameModalOpen()) hideGameModal();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isGameModalOpen()) closeGameModal(); });

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

// ==========================================
// FOTOS, DESENHOS E MEMORIAS
// Fotos ficam no IndexedDB do aparelho (cabe muito mais que o localStorage)
// e sao reduzidas antes de salvar. Memorias ficam no localStorage.
// ==========================================
const MEDIA_DB = 'mundoJuliaLiviaFotos';
const MEDIA_STORE = 'imagens';
const GALLERIES = {
    photos: { el: 'photo-gallery', empty: 'Nenhuma foto ainda... Adicione momentos especiais!' },
    drawings: { el: 'drawings-gallery', empty: 'Os desenhos de Julia e Livia aparecerão aqui!' },
    julia: { el: 'julia-gallery', empty: 'Adicione fotos da Julia!' },
    livia: { el: 'livia-gallery', empty: 'Adicione fotos da Livia!' }
};

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function openMediaDB() {
    return new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) return reject(new Error('sem IndexedDB'));
        const req = indexedDB.open(MEDIA_DB, 1);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(MEDIA_STORE)) {
                const st = db.createObjectStore(MEDIA_STORE, { keyPath: 'id', autoIncrement: true });
                st.createIndex('kind', 'kind');
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function mediaTx(mode, fn) {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(MEDIA_STORE, mode);
        const store = tx.objectStore(MEDIA_STORE);
        let result;
        Promise.resolve(fn(store)).then(r => { result = r; });
        // Fecha a conexao ao terminar (antes cada operacao deixava uma conexao aberta)
        tx.oncomplete = () => { db.close(); resolve(result); };
        tx.onerror = () => { db.close(); reject(tx.error); };
        tx.onabort = () => { db.close(); reject(tx.error); };
    });
}

function mediaAdd(item) { return mediaTx('readwrite', st => new Promise(r => { st.add(item).onsuccess = e => r(e.target.result); })); }
function mediaDelete(id) { return mediaTx('readwrite', st => { st.delete(id); }); }
function mediaList(kind) {
    return mediaTx('readonly', st => new Promise(r => {
        const out = [];
        st.index('kind').openCursor(IDBKeyRange.only(kind)).onsuccess = e => {
            const c = e.target.result;
            if (c) { out.push(c.value); c.continue(); } else r(out);
        };
    }));
}

// Reduz a imagem (lado maior ate 1280px, JPEG) para economizar espaco
function shrinkImage(file, maxSide) {
    maxSide = maxSide || 1280;
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
            const c = document.createElement('canvas');
            c.width = Math.round(img.width * scale);
            c.height = Math.round(img.height * scale);
            const ctx = c.getContext('2d');
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, c.width, c.height);
            ctx.drawImage(img, 0, 0, c.width, c.height);
            URL.revokeObjectURL(url);
            c.toBlob(b => b ? resolve(b) : reject(new Error('falha ao converter')), 'image/jpeg', 0.82);
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('imagem inválida')); };
        img.src = url;
    });
}

function showToast(msg) {
    let t = document.getElementById('app-toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'app-toast';
        t.className = 'app-toast';
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => t.classList.remove('show'), 3200);
}

async function addImages(kind, files) {
    const list = Array.from(files || []).filter(f => f.type.startsWith('image/'));
    if (!list.length) return;
    let ok = 0;
    for (const file of list) {
        try {
            const blob = await shrinkImage(file);
            await mediaAdd({ kind, name: file.name, blob, date: new Date().toISOString() });
            ok++;
        } catch (e) {
            console.log('Erro ao salvar imagem', e);
        }
    }
    await renderGallery(kind);
    showToast(ok === list.length
        ? `✅ ${ok} ${ok === 1 ? 'imagem salva' : 'imagens salvas'}!`
        : `⚠️ ${ok} de ${list.length} imagens salvas. O aparelho pode estar sem espaço.`);
}

const objectUrls = {};
async function renderGallery(kind) {
    const cfg = GALLERIES[kind];
    const gallery = cfg && document.getElementById(cfg.el);
    if (!gallery) return;
    let items = [];
    try { items = await mediaList(kind); } catch (e) { /* sem IndexedDB */ }
    (objectUrls[kind] || []).forEach(u => URL.revokeObjectURL(u));
    objectUrls[kind] = [];
    gallery.innerHTML = '';
    if (!items.length) {
        gallery.innerHTML = `<p class="empty-message">${cfg.empty}</p>`;
        return;
    }
    items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    items.forEach(it => {
        const src = URL.createObjectURL(it.blob);
        objectUrls[kind].push(src);
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `<img src="${src}" alt="${escapeHtml(it.name || 'foto')}" loading="lazy">
            <button class="gallery-del" type="button" aria-label="Apagar imagem">🗑️</button>`;
        item.querySelector('img').addEventListener('click', () => openLightbox(src));
        item.querySelector('.gallery-del').addEventListener('click', (e) => {
            e.stopPropagation();
            confirmInPage('Apagar esta imagem?', async () => {
                await mediaDelete(it.id);
                renderGallery(kind);
            });
        });
        gallery.appendChild(item);
    });
}

// Confirmacao dentro da pagina (sem caixa do navegador)
function confirmInPage(text, onYes) {
    const wrap = document.createElement('div');
    wrap.className = 'confirm-overlay';
    wrap.innerHTML = `<div class="confirm-box"><p>${escapeHtml(text)}</p>
        <div class="confirm-buttons"><button class="confirm-no" type="button">✖ Não</button><button class="confirm-yes" type="button">✔ Sim</button></div></div>`;
    document.body.appendChild(wrap);
    wrap.querySelector('.confirm-no').onclick = () => wrap.remove();
    wrap.querySelector('.confirm-yes').onclick = () => { wrap.remove(); onYes(); };
    wrap.addEventListener('click', e => { if (e.target === wrap) wrap.remove(); });
}

// Fotos antigas que estavam no localStorage vao para o IndexedDB (uma vez so)
async function migrateOldImages() {
    try {
        const raw = localStorage.getItem('mundoJuliaLivia');
        if (!raw) return;
        const data = JSON.parse(raw);
        const moves = [['photos', data.photos], ['drawings', data.drawings]];
        let moved = 0;
        for (const [kind, arr] of moves) {
            for (const p of (arr || [])) {
                if (!p || !p.data) continue;
                const blob = await (await fetch(p.data)).blob();
                await mediaAdd({ kind, name: p.name || 'imagem', blob, date: new Date().toISOString() });
                moved++;
            }
        }
        if (moved) {
            delete data.photos; delete data.drawings; delete data.juliaPhotos; delete data.liviaPhotos;
            localStorage.setItem('mundoJuliaLivia', JSON.stringify(data));
        }
    } catch (e) { console.log('Migração de fotos não concluída', e); }
}

// Lightbox
function openLightbox(src) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `<img src="${src}" alt="Foto ampliada"><button type="button" aria-label="Fechar">✕</button>`;
    lightbox.addEventListener('click', () => lightbox.remove());
    document.body.appendChild(lightbox);
}

// ---------- Memorias ----------
function loadMemories() {
    try { return (JSON.parse(localStorage.getItem('mundoJuliaLivia') || '{}').memories) || []; } catch (e) { return []; }
}
function saveMemories(list) {
    try {
        const data = JSON.parse(localStorage.getItem('mundoJuliaLivia') || '{}');
        data.memories = list;
        localStorage.setItem('mundoJuliaLivia', JSON.stringify(data));
    } catch (e) { showToast('⚠️ Não foi possível salvar a memória.'); }
}

function renderMemories() {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;
    const list = loadMemories().slice().sort((a, b) => String(b.year).localeCompare(String(a.year)) || (b.date || '').localeCompare(a.date || ''));
    if (!list.length) {
        timeline.innerHTML = `<div class="timeline-item"><div class="timeline-date">✨</div>
            <div class="timeline-content"><h3>Começo de uma linda história!</h3><p>Toque em “+ Adicionar Memória” para guardar momentos especiais.</p></div></div>`;
        return;
    }
    timeline.innerHTML = list.map(m => `<div class="timeline-item">
        <div class="timeline-date">${escapeHtml(m.year)}</div>
        <div class="timeline-content">
            <button class="memory-del" type="button" data-date="${escapeHtml(m.date)}" aria-label="Apagar memória">🗑️</button>
            <h3>${escapeHtml(m.title)}</h3><p>${escapeHtml(m.description || '')}</p>
        </div></div>`).join('');
    timeline.querySelectorAll('.memory-del').forEach(b => b.addEventListener('click', () => {
        confirmInPage('Apagar esta memória?', () => {
            saveMemories(loadMemories().filter(m => m.date !== b.dataset.date));
            renderMemories();
        });
    }));
}

function openMemoryForm() {
    const form = document.getElementById('memory-form');
    if (!form) return;
    form.hidden = false;
    form.reset();
    form.querySelector('[name="year"]').value = new Date().getFullYear();
    form.querySelector('[name="title"]').focus();
}

function setupMemoryForm() {
    const form = document.getElementById('memory-form');
    const btn = document.querySelector('.add-memory-btn');
    if (btn) btn.addEventListener('click', openMemoryForm);
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        const fd = new FormData(form);
        const title = String(fd.get('title') || '').trim();
        if (!title) return;
        const list = loadMemories();
        list.push({ year: String(fd.get('year') || '').trim() || String(new Date().getFullYear()), title,
            description: String(fd.get('description') || '').trim(), date: new Date().toISOString() });
        saveMemories(list);
        form.hidden = true;
        renderMemories();
        showToast('💖 Memória guardada!');
    });
    form.querySelector('.memory-cancel').addEventListener('click', () => { form.hidden = true; });
}

function setupUploads() {
    document.querySelectorAll('[data-upload]').forEach(area => {
        const kind = area.dataset.upload;
        const input = area.querySelector('input[type="file"]');
        if (!input) return;
        area.addEventListener('click', e => { if (e.target !== input) input.click(); });
        input.addEventListener('change', () => { addImages(kind, input.files); input.value = ''; });
        area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('drag'); });
        area.addEventListener('dragleave', () => area.classList.remove('drag'));
        area.addEventListener('drop', e => { e.preventDefault(); area.classList.remove('drag'); addImages(kind, e.dataTransfer.files); });
    });
}

document.addEventListener('DOMContentLoaded', async function () {
    detectMobile();
    setupUploads();
    setupMemoryForm();
    renderMemories();
    await migrateOldImages();
    Object.keys(GALLERIES).forEach(renderGallery);
});

// Deteccao de dispositivo movel
function detectMobile() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        document.body.classList.add('is-mobile');
    }
}

// ==========================================
// PAINEL DE PROGRESSO (para os pais)
// Le o que cada jogo ja guarda no aparelho e mostra um resumo.
// ==========================================
function readJSON(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
}

// Numero seguro para mostrar (os dados podem vir de um backup importado)
const num = v => (typeof v === 'number' && isFinite(v)) ? v : (parseFloat(v) || 0);
const arr = v => Array.isArray(v) ? v : [];

function skillBars(stats) {
    const entries = Object.entries(stats || {}).filter(([, s]) => s && num(s.total) > 0)
        .map(([name, s]) => [name, { ok: num(s.ok), total: num(s.total) }]);
    if (!entries.length) return '<p class="pg-empty">Ainda não jogou.</p>';
    return entries.sort((a, b) => a[1].ok / a[1].total - b[1].ok / b[1].total).map(([name, s]) => {
        const pct = Math.round(100 * s.ok / s.total);
        const cls = pct >= 80 ? 'high' : pct >= 50 ? 'mid' : 'low';
        return `<div class="pg-skill"><div class="pg-skill-head"><span>${escapeHtml(name)}</span><b>${pct}% <small>(${s.ok}/${s.total})</small></b></div>
            <div class="pg-bar"><div class="pg-fill ${cls}" style="width:${pct}%"></div></div></div>`;
    }).join('');
}

function renderProgress() {
    const box = document.getElementById('progress-content');
    if (!box) return;
    const cards = [];

    // Livia - Leitura Relampago
    const rec = readJSON('leitura_recordes_v1', {});
    const modeNames = { 2: '2 sílabas', 3: '3 sílabas', 4: '4 sílabas', variadas: 'Variadas' };
    const rows = Object.keys(modeNames).map(m => {
        const list = arr(rec[m]);
        const best = name => list.filter(r => r && r.name === name).reduce((x, r) => Math.max(x, num(r.score)), 0);
        return `<tr><td>${modeNames[m]}</td><td>${best('Livia') || '—'}</td><td>${best('Julia') || '—'}</td></tr>`;
    }).join('');
    cards.push(`<div class="pg-card livia"><h3>⚡ Leitura Relâmpago</h3><p class="pg-sub">Recorde de palavras lidas em 60 s</p>
        <table class="pg-table"><tr><th>Modo</th><th>🧚 Livia</th><th>👸 Julia</th></tr>${rows}</table></div>`);

    // Julia - Detetive das Questoes
    cards.push(`<div class="pg-card julia"><h3>🕵️ Detetive das Questões</h3><p class="pg-sub">Acertos de primeira por habilidade (as mais difíceis primeiro)</p>
        ${skillBars(readJSON('detetive_stats_v1', {}))}</div>`);

    // Julia - Olimpiada
    const sim = readJSON('olimpiada_simulado_recorde_v1', null);
    cards.push(`<div class="pg-card julia"><h3>🥇 Treino Olímpico</h3>
        <p class="pg-sub">${sim ? `Melhor simulado: <b>${num(sim.score)}/10</b> em ${new Date(sim.date).toLocaleDateString('pt-BR')}` : 'Ainda não fez simulado.'}</p>
        ${skillBars(readJSON('olimpiada_stats_v1', {}))}</div>`);

    // Julia - Tabuada (ultimas sessoes)
    const tab = arr(readJSON('tabuada_progress_julia', []));
    const lastTab = tab.slice(-5).reverse();
    cards.push(`<div class="pg-card julia"><h3>✖️ Tabuada</h3><p class="pg-sub">Últimas partidas da Julia</p>
        ${lastTab.length ? '<table class="pg-table"><tr><th>Data</th><th>Acertos</th><th>Tempo médio</th></tr>' + lastTab.map(s =>
            `<tr><td>${new Date(s.date).toLocaleDateString('pt-BR')}</td><td>${num(s.correct)}/${num(s.total)} (${num(s.percent)}%)</td><td>${num(s.avgResponseMs) ? (num(s.avgResponseMs) / 1000).toFixed(1) + ' s' : '—'}</td></tr>`).join('') + '</table>'
            : '<p class="pg-empty">Ainda não jogou.</p>'}</div>`);

    // Duelos
    const d = readJSON('duelos_placar_v1', { total: { julia: 0, livia: 0, empates: 0 }, jogos: {} });
    const mem = readJSON('memoria_duelos_v1', { julia: 0, livia: 0, empates: 0 });
    const gameNames = { selva: '🌴 Aventura na Selva', trilha: '🎲 Trilha do Saber', relampago: '⚡ Duelo Relâmpago', velha: '⭕ Jogo da Velha' };
    const duelRows = Object.entries(gameNames).map(([k, n]) => {
        const g = ((d && d.jogos) || {})[k] || {};
        return `<tr><td>${n}</td><td>${num(g.julia)}</td><td>${num(g.livia)}</td><td>${num(g.empates)}</td></tr>`;
    }).join('') + `<tr><td>🧠 Memória</td><td>${num(mem && mem.julia)}</td><td>${num(mem && mem.livia)}</td><td>${num(mem && mem.empates)}</td></tr>`;
    cards.push(`<div class="pg-card duel"><h3>⚔️ Duelos</h3><table class="pg-table"><tr><th>Jogo</th><th>👸</th><th>🧚</th><th>🤝</th></tr>${duelRows}</table></div>`);

    box.innerHTML = cards.join('');
}

// ==========================================
// DADOS NO APARELHO + SEM INTERNET
// Tudo (recordes, progresso, memorias, fotos) fica SO neste aparelho.
// - Pede ao navegador armazenamento permanente (para nao apagar os dados)
// - Backup em arquivo para trocar de aparelho sem perder nada
// - Aviso quando estiver sem internet (os jogos continuam funcionando)
// ==========================================
async function requestPersistentStorage() {
    try {
        if (navigator.storage && navigator.storage.persist && !(await navigator.storage.persisted())) {
            await navigator.storage.persist();
        }
    } catch (e) { /* navegador sem suporte */ }
    updateStorageInfo();
}

async function updateStorageInfo() {
    const el = document.getElementById('storage-info');
    if (!el) return;
    try {
        const persisted = navigator.storage && navigator.storage.persisted ? await navigator.storage.persisted() : false;
        const est = navigator.storage && navigator.storage.estimate ? await navigator.storage.estimate() : null;
        const mb = est ? (est.usage / 1048576).toFixed(1) : '?';
        el.innerHTML = `💾 Tudo fica salvo <b>só neste aparelho</b> (${mb} MB usados). ` +
            (persisted ? '🔒 Armazenamento protegido: o navegador não apaga sozinho.'
                       : '⚠️ O navegador pode apagar os dados se faltar espaço. Instale o app e faça backups.');
    } catch (e) { el.textContent = '💾 Tudo fica salvo só neste aparelho.'; }
}

function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = () => reject(r.error);
        r.readAsDataURL(blob);
    });
}

async function exportBackup() {
    const includePhotos = document.getElementById('backup-photos') ? document.getElementById('backup-photos').checked : true;
    const data = { app: 'mundo-julia-livia', versao: 1, criadoEm: new Date().toISOString(), localStorage: {}, imagens: [] };
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        data.localStorage[k] = localStorage.getItem(k);
    }
    if (includePhotos) {
        for (const kind of Object.keys(GALLERIES)) {
            let items = [];
            try { items = await mediaList(kind); } catch (e) {}
            for (const it of items) {
                data.imagens.push({ kind, name: it.name, date: it.date, data: await blobToDataURL(it.blob) });
            }
        }
    }
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `backup-julia-livia-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    // Espera bem antes de liberar: arquivos grandes (com fotos) podem demorar a comecar a baixar
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 60000);
    showToast(`💾 Backup criado${includePhotos ? ` (com ${data.imagens.length} imagens)` : ''}! Guarde o arquivo em local seguro.`);
}

async function importBackup(file) {
    if (!file) return;
    let data;
    try { data = JSON.parse(await file.text()); } catch (e) { showToast('⚠️ Arquivo inválido.'); return; }
    if (!data || data.app !== 'mundo-julia-livia') { showToast('⚠️ Este arquivo não é um backup do Mundo de Julia & Livia.'); return; }
    const when = data.criadoEm ? new Date(data.criadoEm).toLocaleDateString('pt-BR') : '?';
    confirmInPage(`Restaurar o backup de ${when}? Os recordes e o progresso deste aparelho serão substituídos.`, async () => {
        try {
            Object.entries(data.localStorage || {}).forEach(([k, v]) => localStorage.setItem(k, v));
            // Imagens: adiciona as que ainda nao existem (mesmo nome e data)
            let added = 0;
            for (const img of (data.imagens || [])) {
                if (!GALLERIES[img.kind] || !img.data) continue;
                let existing = [];
                try { existing = await mediaList(img.kind); } catch (e) {}
                if (existing.some(x => x.name === img.name && x.date === img.date)) continue;
                const blob = await (await fetch(img.data)).blob();
                await mediaAdd({ kind: img.kind, name: img.name, blob, date: img.date || new Date().toISOString() });
                added++;
            }
            showToast(`✅ Backup restaurado${added ? ` (+${added} imagens)` : ''}!`);
            updateAges(); updateDuelTotal(); renderMemories(); renderProgress(); updateStorageInfo();
            Object.keys(GALLERIES).forEach(renderGallery);
        } catch (e) {
            showToast('⚠️ Não foi possível restaurar tudo. O aparelho pode estar sem espaço.');
        }
    });
}

function updateOnlineBanner() {
    let b = document.getElementById('offline-banner');
    if (navigator.onLine) { if (b) b.remove(); return; }
    if (!b) {
        b = document.createElement('div');
        b.id = 'offline-banner';
        b.className = 'offline-banner';
        b.textContent = '📴 Sem internet — os jogos continuam funcionando!';
        document.body.appendChild(b);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    requestPersistentStorage();
    updateOnlineBanner();
    window.addEventListener('online', updateOnlineBanner);
    window.addEventListener('offline', updateOnlineBanner);
    const exp = document.getElementById('backup-export');
    const imp = document.getElementById('backup-import');
    const file = document.getElementById('backup-file');
    if (exp) exp.addEventListener('click', exportBackup);
    if (imp && file) {
        imp.addEventListener('click', () => file.click());
        file.addEventListener('change', () => { importBackup(file.files[0]); file.value = ''; });
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

// ==========================================
// IDADES AUTOMATICAS + CONTAGEM PARA O ANIVERSARIO
// ==========================================
const BIRTHDAYS = {
    julia: { y: 2016, m: 9, d: 14 },
    livia: { y: 2021, m: 9, d: 23 }
};

function ageOn(b, now) {
    let age = now.getFullYear() - b.y;
    if (now.getMonth() + 1 < b.m || (now.getMonth() + 1 === b.m && now.getDate() < b.d)) age--;
    return age;
}

function daysToBirthday(b, now) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let next = new Date(now.getFullYear(), b.m - 1, b.d);
    if (next < today) next = new Date(now.getFullYear() + 1, b.m - 1, b.d);
    return Math.round((next - today) / 86400000);
}

function updateAges() {
    const now = new Date();
    document.querySelectorAll('[data-age]').forEach(el => {
        const b = BIRTHDAYS[el.dataset.age];
        if (b) el.textContent = ageOn(b, now);
    });
    document.querySelectorAll('[data-countdown]').forEach(el => {
        const b = BIRTHDAYS[el.dataset.countdown];
        if (!b) return;
        const days = daysToBirthday(b, now);
        const nextAge = ageOn(b, now) + (days === 0 ? 0 : 1);
        el.textContent = days === 0 ? `🎉 Hoje é o aniversário! ${nextAge} anos!`
            : days === 1 ? `Amanhã faz ${nextAge} anos!`
            : `Faltam ${days} dias para os ${nextAge} anos`;
    });
}

// ==========================================
// FILTRO DE JOGOS (Todos / Livia / Julia)
// ==========================================
function filterGames(who) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === who));
    document.querySelectorAll('.games-container .game-card').forEach(card => {
        const forWho = card.dataset.for || 'todas';
        const show = who === 'duelo' ? card.dataset.duel === '1'
            : (who === 'todos' || forWho === 'todas' || forWho === who);
        card.style.display = show ? '' : 'none';
    });
    try { localStorage.setItem('gamesFilter', who); } catch (e) {}
}

// Placar geral dos duelos (jogos de duelo + jogo da memoria)
function updateDuelTotal() {
    const el = document.getElementById('duel-total');
    if (!el) return;
    let j = 0, l = 0;
    try {
        const d = JSON.parse(localStorage.getItem('duelos_placar_v1') || '{}');
        if (d && d.total) { j += num(d.total.julia); l += num(d.total.livia); }
        const m = JSON.parse(localStorage.getItem('memoria_duelos_v1') || '{}');
        if (m) { j += num(m.julia); l += num(m.livia); }
    } catch (e) {}
    el.innerHTML = (j + l) ? `⚔️ Placar dos duelos: 👸 Julia <b>${j}</b> × <b>${l}</b> Livia 🧚` : '';
}

// App aberto de um dia para o outro (tablet): atualiza idades/contagem ao voltar
document.addEventListener('visibilitychange', () => { if (!document.hidden) updateAges(); });

document.addEventListener('DOMContentLoaded', function () {
    updateAges();
    updateDuelTotal();
    document.querySelectorAll('.filter-btn').forEach(b => b.addEventListener('click', () => {
        filterGames(b.dataset.filter);
        playSound('click');
    }));
    let saved = 'todos';
    try { saved = localStorage.getItem('gamesFilter') || 'todos'; } catch (e) {}
    filterGames(saved);
});

// ==========================================
// APP INSTALAVEL (PWA)
// ==========================================
let deferredInstallPrompt = null;

function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function isIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPad novo se apresenta como Mac
}

function showInstallButton(show) {
    const btn = document.getElementById('install-btn');
    if (btn) btn.hidden = !show;
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.log('Service worker não registrado:', err));
    });
}

// Android / Chrome / Edge: o navegador avisa que o app pode ser instalado
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    showInstallButton(true);
});

window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    showInstallButton(false);
    closeInstallHelp();
});

async function installApp() {
    if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        if (choice.outcome === 'accepted') showInstallButton(false);
        return;
    }
    openInstallHelp();
}

function openInstallHelp() {
    const steps = document.getElementById('install-steps');
    if (isIOS()) {
        steps.innerHTML = `<ol>
            <li>Abra este site no <b>Safari</b>.</li>
            <li>Toque no botão <b>Compartilhar</b> <span class="ios-share">⬆️</span> (embaixo no iPhone, em cima no iPad).</li>
            <li>Escolha <b>“Adicionar à Tela de Início”</b>.</li>
            <li>Toque em <b>Adicionar</b>. Pronto! 🎉</li>
        </ol>`;
    } else {
        steps.innerHTML = `<ol>
            <li>Abra este site no <b>Google Chrome</b>.</li>
            <li>Toque no menu <b>⋮</b> (canto de cima).</li>
            <li>Escolha <b>“Instalar app”</b> ou <b>“Adicionar à tela inicial”</b>.</li>
        </ol>`;
    }
    document.getElementById('install-help').classList.remove('hidden');
}

function closeInstallHelp() {
    const el = document.getElementById('install-help');
    if (el) el.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    if (isStandalone()) {
        document.body.classList.add('is-app');
        showInstallButton(false);
    } else if (isIOS()) {
        // iPhone/iPad nao tem botao automatico: mostramos o nosso com as instrucoes
        showInstallButton(true);
    }
});

console.log('Mundo de Julia e Livia carregado com sucesso!');
