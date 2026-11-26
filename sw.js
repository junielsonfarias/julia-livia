// ==========================================
// Service Worker - Mundo de Julia & Livia (PWA)
// - Guarda todos os jogos no aparelho para funcionar SEM internet.
// - Paginas: tenta a internet primeiro (pega novidades) e usa a copia salva se estiver offline.
// - Arquivos (js/css/imagens): usa a copia salva na hora e atualiza em segundo plano.
// A lista abaixo e gerada por "npm run pwa" (scripts/gerar-sw.js).
// ==========================================

// <PRECACHE>
const CACHE_VERSION = 'b826749e97';
const PRECACHE = [
    "/",
    "/animais-game/game.js",
    "/animais-game/index.html",
    "/animais-game/styles.css",
    "/big-hero-game/game.js",
    "/big-hero-game/index.html",
    "/big-hero-game/styles.css",
    "/contar-game/game.js",
    "/contar-game/index.html",
    "/contar-game/styles.css",
    "/cores-formas-game/game.js",
    "/cores-formas-game/index.html",
    "/cores-formas-game/styles.css",
    "/corpo-game/game.js",
    "/corpo-game/index.html",
    "/corpo-game/styles.css",
    "/desenhar-game/game.js",
    "/desenhar-game/index.html",
    "/desenhar-game/styles.css",
    "/dinheiro-game/game.js",
    "/dinheiro-game/index.html",
    "/dinheiro-game/styles.css",
    "/emocoes-game/game.js",
    "/emocoes-game/index.html",
    "/emocoes-game/styles.css",
    "/fracoes-game/game.js",
    "/fracoes-game/index.html",
    "/fracoes-game/styles.css",
    "/graficos-game/game.js",
    "/graficos-game/index.html",
    "/graficos-game/styles.css",
    "/icons/apple-touch-icon.png",
    "/icons/favicon-32.png",
    "/icons/icon-192.png",
    "/icons/icon-512.png",
    "/icons/icon-maskable-192.png",
    "/icons/icon-maskable-512.png",
    "/index.html",
    "/interpretacao-game/data.js",
    "/interpretacao-game/game.js",
    "/interpretacao-game/index.html",
    "/interpretacao-game/styles.css",
    "/leitura-game/game.js",
    "/leitura-game/index.html",
    "/leitura-game/styles.css",
    "/letras-game/game.js",
    "/letras-game/index.html",
    "/letras-game/styles.css",
    "/main-script.js",
    "/main-styles.css",
    "/manifest.webmanifest",
    "/memoria-game/game.js",
    "/memoria-game/index.html",
    "/memoria-game/styles.css",
    "/olimpiada-game/data.js",
    "/olimpiada-game/game.js",
    "/olimpiada-game/index.html",
    "/olimpiada-game/styles.css",
    "/ortografia-game/game.js",
    "/ortografia-game/index.html",
    "/ortografia-game/styles.css",
    "/puzzle-game/game.js",
    "/puzzle-game/index.html",
    "/puzzle-game/styles.css",
    "/quiz-game/game.js",
    "/quiz-game/index.html",
    "/quiz-game/styles.css",
    "/relampago-game/game.js",
    "/relampago-game/index.html",
    "/relampago-game/styles.css",
    "/rimas-game/game.js",
    "/rimas-game/index.html",
    "/rimas-game/styles.css",
    "/sequencia-game/game.js",
    "/sequencia-game/index.html",
    "/sequencia-game/styles.css",
    "/shared/duelo-perguntas.js",
    "/shared/duelo.css",
    "/shared/duelo.js",
    "/shared/kids-audio.js",
    "/shared/palavras.js",
    "/silabas-game/game.js",
    "/silabas-game/index.html",
    "/silabas-game/styles.css",
    "/tabuada-game/game.js",
    "/tabuada-game/index.html",
    "/tabuada-game/styles.css",
    "/trilha-game/game.js",
    "/trilha-game/index.html",
    "/trilha-game/styles.css",
    "/velha-game/game.js",
    "/velha-game/index.html",
    "/velha-game/styles.css"
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

    // Demais arquivos: copia salva na hora + atualiza em segundo plano
    event.respondWith((async () => {
        const cached = await matchCached(req);
        const network = fetch(req).then(async (res) => {
            if (res.ok) {
                const cache = await caches.open(CACHE);
                await cache.put(req, res.clone());
            }
            return res;
        }).catch(() => null);
        if (cached) { event.waitUntil(network); return cached; }
        return (await network) || new Response('', { status: 504 });
    })());
});
