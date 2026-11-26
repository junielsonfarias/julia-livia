// ==========================================
// Service Worker - Mundo de Julia & Livia (PWA)
// - Guarda todos os jogos no aparelho para funcionar SEM internet.
// - Paginas: tenta a internet primeiro (pega novidades) e usa a copia salva se estiver offline.
// - Arquivos (js/css/imagens): usa a copia salva na hora e atualiza em segundo plano.
// A lista abaixo e gerada por "npm run pwa" (scripts/gerar-sw.js).
// ==========================================

// <PRECACHE>
const CACHE_VERSION = '4402ebafb9';
const PRECACHE = [
    "/",
    "/animais-game/game.js?v=7c0533b9",
    "/animais-game/index.html",
    "/animais-game/styles.css?v=1c771496",
    "/big-hero-game/game.js?v=4c88095f",
    "/big-hero-game/index.html",
    "/big-hero-game/styles.css?v=0cb0a210",
    "/contar-game/game.js?v=9003e231",
    "/contar-game/index.html",
    "/contar-game/styles.css?v=243e7c64",
    "/cores-formas-game/game.js?v=974a5cfa",
    "/cores-formas-game/index.html",
    "/cores-formas-game/styles.css?v=ce06fdea",
    "/corpo-game/game.js?v=cec4eadb",
    "/corpo-game/index.html",
    "/corpo-game/styles.css?v=ad9ba138",
    "/desenhar-game/game.js?v=4653e20f",
    "/desenhar-game/index.html",
    "/desenhar-game/styles.css?v=d2f9bb3a",
    "/dinheiro-game/game.js?v=ff88ffb8",
    "/dinheiro-game/index.html",
    "/dinheiro-game/styles.css?v=c9f8c657",
    "/emocoes-game/game.js?v=7637ae0f",
    "/emocoes-game/index.html",
    "/emocoes-game/styles.css?v=68a7fe7f",
    "/fracoes-game/game.js?v=974ce0a4",
    "/fracoes-game/index.html",
    "/fracoes-game/styles.css?v=20577c32",
    "/graficos-game/game.js?v=4edd68a0",
    "/graficos-game/index.html",
    "/graficos-game/styles.css?v=3a8ffb1f",
    "/icons/apple-touch-icon.png",
    "/icons/favicon-32.png",
    "/icons/icon-192.png",
    "/icons/icon-512.png",
    "/icons/icon-maskable-192.png",
    "/icons/icon-maskable-512.png",
    "/index.html",
    "/interpretacao-game/data.js?v=a2880166",
    "/interpretacao-game/game.js?v=5a8206e7",
    "/interpretacao-game/index.html",
    "/interpretacao-game/styles.css?v=c45b93a7",
    "/leitura-game/game.js?v=a07eec64",
    "/leitura-game/index.html",
    "/leitura-game/styles.css?v=7813a59d",
    "/letras-game/game.js?v=10a46a61",
    "/letras-game/index.html",
    "/letras-game/styles.css?v=8040e68e",
    "/main-script.js?v=6de2d6ca",
    "/main-styles.css?v=50c1b99c",
    "/manifest.webmanifest",
    "/memoria-game/game.js?v=3be4c442",
    "/memoria-game/index.html",
    "/memoria-game/styles.css?v=6cd419a5",
    "/olimpiada-game/data.js?v=3e79a3b7",
    "/olimpiada-game/game.js?v=353dede7",
    "/olimpiada-game/index.html",
    "/olimpiada-game/styles.css?v=0b29ff88",
    "/ortografia-game/game.js?v=d09d690e",
    "/ortografia-game/index.html",
    "/ortografia-game/styles.css?v=91093882",
    "/puzzle-game/game.js?v=fd1604ca",
    "/puzzle-game/index.html",
    "/puzzle-game/styles.css?v=db9eba8d",
    "/quiz-game/game.js?v=7674e1f4",
    "/quiz-game/index.html",
    "/quiz-game/styles.css?v=52ba9615",
    "/relampago-game/game.js?v=734b7721",
    "/relampago-game/index.html",
    "/relampago-game/styles.css?v=f4ba5358",
    "/rimas-game/game.js?v=22ce9a18",
    "/rimas-game/index.html",
    "/rimas-game/styles.css?v=15cdd831",
    "/sequencia-game/game.js?v=a954e379",
    "/sequencia-game/index.html",
    "/sequencia-game/styles.css?v=906ef679",
    "/shared/duelo-perguntas.js?v=7072286c",
    "/shared/duelo.css?v=525e5f83",
    "/shared/duelo.js?v=26af0712",
    "/shared/kids-audio.js?v=884d58e9",
    "/shared/palavras.js?v=3791d1db",
    "/silabas-game/game.js?v=0e2fe37e",
    "/silabas-game/index.html",
    "/silabas-game/styles.css?v=c883ad73",
    "/tabuada-game/game.js?v=006baf85",
    "/tabuada-game/index.html",
    "/tabuada-game/styles.css?v=95936510",
    "/trilha-game/game.js?v=04c631bf",
    "/trilha-game/index.html",
    "/trilha-game/styles.css?v=f65a1d60",
    "/velha-game/game.js?v=c3ef65d3",
    "/velha-game/index.html",
    "/velha-game/styles.css?v=4281755c"
];
// </PRECACHE>

const CACHE = 'julia-livia-' + CACHE_VERSION;
const FONT_CACHE = 'julia-livia-fontes';

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
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys
            .filter(k => k.startsWith('julia-livia-') && k !== CACHE && k !== FONT_CACHE)
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

    if (url.origin !== self.location.origin) return;

    // Paginas (inclusive jogos abertos no iframe): internet primeiro, copia salva se offline
    if (req.mode === 'navigate' || req.destination === 'document' || url.pathname.endsWith('.html')) {
        event.respondWith((async () => {
            try {
                const res = await fetch(req);
                if (res.ok) {
                    const cache = await caches.open(CACHE);
                    cache.put(req, (await cleanResponse(res.clone())));
                }
                return await cleanResponse(res);
            } catch (e) {
                return (await matchCached(req)) || (await matchCached(new Request(new URL('/', url.origin)))) ||
                    new Response('<h1>Sem internet</h1><p>Abra o app uma vez com internet para baixar os jogos.</p>',
                        { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
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
            if (res.ok) await cache.put(req, res.clone());
            return res;
        } catch (e) {
            return (await matchCached(req)) || new Response('', { status: 504 });
        }
    })());
});
