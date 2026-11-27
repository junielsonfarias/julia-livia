// ==========================================
// Service Worker - Mundo de Julia & Livia (PWA)
// - Guarda todos os jogos no aparelho para funcionar SEM internet.
// - Paginas: tenta a internet primeiro (pega novidades) e usa a copia salva se estiver offline.
// - Arquivos (js/css/imagens): usa a copia salva na hora e atualiza em segundo plano.
// A lista abaixo e gerada por "npm run pwa" (scripts/gerar-sw.js).
// ==========================================

// <PRECACHE>
const CACHE_VERSION = '1f76aa765d';
const PRECACHE = [
    "/",
    "/animais-game/game.js?v=08b708eb",
    "/animais-game/index.html",
    "/animais-game/styles.css?v=c602d3bd",
    "/big-hero-game/game.js?v=68b8932e",
    "/big-hero-game/index.html",
    "/big-hero-game/styles.css?v=69489a08",
    "/contar-game/game.js?v=e0f925a8",
    "/contar-game/index.html",
    "/contar-game/styles.css?v=ce5502eb",
    "/cores-formas-game/game.js?v=8fd58470",
    "/cores-formas-game/index.html",
    "/cores-formas-game/styles.css?v=2c83aaa9",
    "/corpo-game/game.js?v=245eac0e",
    "/corpo-game/index.html",
    "/corpo-game/styles.css?v=c81f4c7a",
    "/desenhar-game/game.js?v=346719e8",
    "/desenhar-game/index.html",
    "/desenhar-game/styles.css?v=df20165b",
    "/dinheiro-game/game.js?v=0adadf18",
    "/dinheiro-game/index.html",
    "/dinheiro-game/styles.css?v=4246c4be",
    "/emocoes-game/game.js?v=8d4011bf",
    "/emocoes-game/index.html",
    "/emocoes-game/styles.css?v=dce63540",
    "/fracoes-game/game.js?v=fb65cb09",
    "/fracoes-game/index.html",
    "/fracoes-game/styles.css?v=741d4fe8",
    "/graficos-game/game.js?v=47347f9c",
    "/graficos-game/index.html",
    "/graficos-game/styles.css?v=bfff9ffe",
    "/icons/apple-touch-icon.png",
    "/icons/favicon-32.png",
    "/icons/icon-192.png",
    "/icons/icon-512.png",
    "/icons/icon-maskable-192.png",
    "/icons/icon-maskable-512.png",
    "/index.html",
    "/interpretacao-game/data.js?v=779d1533",
    "/interpretacao-game/game.js?v=aceacb0f",
    "/interpretacao-game/index.html",
    "/interpretacao-game/styles.css?v=3a99807f",
    "/leitura-game/game.js?v=1839fdd0",
    "/leitura-game/index.html",
    "/leitura-game/letrinhas.js?v=3357e8ff",
    "/leitura-game/styles.css?v=35a6a8dd",
    "/letras-game/game.js?v=a5b648be",
    "/letras-game/index.html",
    "/letras-game/styles.css?v=fab8fe22",
    "/main-script.js?v=d69142b5",
    "/main-styles.css?v=d6e36fa5",
    "/manifest.webmanifest",
    "/memoria-game/game.js?v=6082455a",
    "/memoria-game/index.html",
    "/memoria-game/styles.css?v=9a62984d",
    "/olimpiada-game/data.js?v=87763617",
    "/olimpiada-game/game.js?v=b85438fc",
    "/olimpiada-game/index.html",
    "/olimpiada-game/styles.css?v=cfc8a101",
    "/ortografia-game/game.js?v=84bbfe0c",
    "/ortografia-game/index.html",
    "/ortografia-game/styles.css?v=987f2631",
    "/puzzle-game/game.js?v=5adc566a",
    "/puzzle-game/index.html",
    "/puzzle-game/styles.css?v=ca0c7b47",
    "/quiz-game/game.js?v=3f1f94c3",
    "/quiz-game/index.html",
    "/quiz-game/styles.css?v=786aaaff",
    "/relampago-game/game.js?v=d099498a",
    "/relampago-game/index.html",
    "/relampago-game/styles.css?v=aca24fe7",
    "/rimas-game/game.js?v=2b684c03",
    "/rimas-game/index.html",
    "/rimas-game/styles.css?v=83fa04f6",
    "/selva-game/cartas.js?v=556ec43a",
    "/selva-game/game.js?v=cf595427",
    "/selva-game/index.html",
    "/selva-game/styles.css?v=2d88fcae",
    "/sequencia-game/game.js?v=687e0935",
    "/sequencia-game/index.html",
    "/sequencia-game/styles.css?v=fc2357f3",
    "/shared/dado.css?v=3a3c9597",
    "/shared/dado.js?v=9d4b65b1",
    "/shared/duelo-perguntas.js?v=b997e24c",
    "/shared/duelo.css?v=1de99c64",
    "/shared/duelo.js?v=d613fbb0",
    "/shared/efeitos.js?v=e296ecbf",
    "/shared/emoji3d.js?v=fc9306e9",
    "/shared/fala.js?v=609e07f8",
    "/shared/fit-screen.js?v=0f4dccb7",
    "/shared/kids-audio.js?v=90618a14",
    "/shared/palavras.js?v=f9361c20",
    "/silabas-game/game.js?v=44650db1",
    "/silabas-game/index.html",
    "/silabas-game/styles.css?v=29ac31cc",
    "/tabuada-game/game.js?v=e69839b3",
    "/tabuada-game/index.html",
    "/tabuada-game/styles.css?v=9b8865c8",
    "/trilha-game/game.js?v=d366c845",
    "/trilha-game/index.html",
    "/trilha-game/styles.css?v=66ba4423",
    "/unicornio-arcoiris-game/game.js?v=dc7aab69",
    "/unicornio-arcoiris-game/index.html",
    "/unicornio-arcoiris-game/styles.css?v=88769bde",
    "/unicornio-corrida-game/game.js?v=aca1557e",
    "/unicornio-corrida-game/index.html",
    "/unicornio-corrida-game/styles.css?v=aad11827",
    "/unicornio-pintura-game/game.js?v=85e84d07",
    "/unicornio-pintura-game/index.html",
    "/unicornio-pintura-game/styles.css?v=06834862",
    "/velha-game/game.js?v=933331c0",
    "/velha-game/index.html",
    "/velha-game/styles.css?v=32075b05"
];
// </PRECACHE>

const CACHE = 'julia-livia-' + CACHE_VERSION;
const FONT_CACHE = 'julia-livia-fontes';
const EMOJI_CACHE = 'julia-livia-emoji3d';   // figuras 3D (Fluent Emoji) vindas do jsDelivr
// Fontes do Google usadas por todas as paginas: guardadas ja na instalacao,
// para o visual ficar igual mesmo abrindo o app pela primeira vez sem internet.
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap';

async function cacheFonts() {
    try {
        const cache = await caches.open(FONT_CACHE);
        if (await cache.match(FONT_CSS)) return;
        const cssRes = await fetch(FONT_CSS, { mode: 'cors' });
        if (!cssRes.ok) return;
        const css = await cssRes.clone().text();
        await cache.put(FONT_CSS, cssRes);
        const urls = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g)].map(m => m[1]);
        await Promise.all(urls.map(async u => {
            try { const r = await fetch(u, { mode: 'cors' }); if (r.ok) await cache.put(u, r); } catch (e) {}
        }));
    } catch (e) { /* sem internet agora: guarda depois, quando a pagina pedir */ }
}

// Respostas redirecionadas (cleanUrls da Vercel) nao podem ser usadas em navegacao: limpamos.
async function cleanResponse(res) {
    if (!res || !res.redirected) return res;
    const body = await res.blob();
    return new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers });
}

self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE);
        await Promise.all(PRECACHE.map(async (url) => {
            try {
                const res = await fetch(url, { cache: 'reload' });
                if (res.ok) await cache.put(url, await cleanResponse(res));
            } catch (e) { /* segue mesmo se um arquivo falhar */ }
        }));
        await cacheFonts();
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys
            .filter(k => k.startsWith('julia-livia-') && k !== CACHE && k !== FONT_CACHE && k !== EMOJI_CACHE)
            .map(k => caches.delete(k)));
        await self.clients.claim();
    })());
});

// Procura a copia salva considerando "/jogo", "/jogo/" e "/jogo/index.html"
async function matchCached(request) {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(request, { ignoreSearch: true });
    if (hit) return hit;
    const url = new URL(request.url);
    const path = url.pathname;
    const candidates = [];
    if (path.endsWith('/')) candidates.push(path + 'index.html');
    else if (path.endsWith('/index.html')) candidates.push(path.slice(0, -'index.html'.length));
    else if (!path.split('/').pop().includes('.')) candidates.push(path + '/index.html', path + '.html');
    for (const c of candidates) {
        const r = await cache.match(new URL(c, url.origin).href, { ignoreSearch: true });
        if (r) return r;
    }
    return null;
}

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);

    // Fontes do Google: guarda depois da primeira vez
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith((async () => {
            const cache = await caches.open(FONT_CACHE);
            const hit = await cache.match(req);
            if (hit) return hit;
            try {
                const res = await fetch(req);
                if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
                return res;
            } catch (e) {
                return new Response('', { status: 503 });
            }
        })());
        return;
    }

    // Figuras 3D: guardadas na primeira vez (versao fixa no endereco, nunca mudam)
    if (url.hostname === 'cdn.jsdelivr.net' && url.pathname.includes('/fluent-emoji-3d@')) {
        event.respondWith((async () => {
            const cache = await caches.open(EMOJI_CACHE);
            const hit = await cache.match(req);
            if (hit) return hit;
            try {
                const res = await fetch(req);
                if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
                return res;
            } catch (e) {
                return new Response('', { status: 503 });
            }
        })());
        return;
    }

    if (url.origin !== self.location.origin) return;

    // Paginas (inclusive jogos abertos no iframe): internet primeiro, copia salva se offline
    if (req.mode === 'navigate' || req.destination === 'document' || url.pathname.endsWith('.html')) {
        // Copia salva quando nao da para usar a internet. A pagina inicial so serve de reserva
        // para a janela principal: dentro do iframe do jogo ela abriria o app inteiro la dentro.
        const fallback = async () => (await matchCached(req)) ||
            (req.destination !== 'iframe' && (await matchCached(new Request(new URL('/', url.origin))))) ||
            new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
                '<body style="font-family:sans-serif;text-align:center;padding:40px 16px">' +
                '<h1>Sem internet</h1><p>Abra o app uma vez com internet para baixar os jogos.</p>' +
                '<button style="font-size:1.3rem;padding:12px 28px;border-radius:30px;border:0;background:#667eea;color:#fff" ' +
                'onclick="try{if(parent!==window&&parent.closeGameModal){parent.closeGameModal();return}}catch(e){}location.href=\'/\'">&#8592; Voltar</button></body>',
                { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        event.respondWith((async () => {
            const network = (async () => {
                const res = await fetch(req);
                if (res.ok) {
                    const cache = await caches.open(CACHE);
                    try { await cache.put(req, (await cleanResponse(res.clone()))); } catch (e) { /* sem espaco */ }
                }
                return await cleanResponse(res);
            })();
            // Internet "presa" (wi-fi fraco): depois de 4 s usa a copia salva, se houver,
            // e deixa a busca terminar em segundo plano para atualizar a copia.
            let timer;
            const slow = new Promise(r => { timer = setTimeout(() => r(null), 4000); });
            try {
                const first = await Promise.race([network, slow]);
                if (first) return first;
                const cached = await matchCached(req);
                if (cached) { event.waitUntil(network.catch(() => {})); return cached; }
                return await network;
            } catch (e) {
                return await fallback();
            } finally {
                clearTimeout(timer);
            }
        })());
        return;
    }

    // Demais arquivos (com ?v=versao no endereco): copia salva EXATA na hora;
    // se nao tiver, busca na internet; sem internet, usa qualquer copia salva.
    event.respondWith((async () => {
        const cache = await caches.open(CACHE);
        const exact = await cache.match(req);
        if (exact) return exact;
        try {
            const res = await fetch(req);
            // Falha ao guardar (sem espaco, resposta 206...) nao pode jogar fora a resposta da internet
            if (res.ok) { try { await cache.put(req, res.clone()); } catch (e) {} }
            return res;
        } catch (e) {
            return (await matchCached(req)) || new Response('', { status: 504 });
        }
    })());
});
