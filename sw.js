// ==========================================
// Service Worker - Mundo de Julia & Livia (PWA)
// - Guarda todos os jogos no aparelho para funcionar SEM internet.
// - Paginas: tenta a internet primeiro (pega novidades) e usa a copia salva se estiver offline.
// - Arquivos (js/css/imagens): usa a copia salva na hora e atualiza em segundo plano.
// A lista abaixo e gerada por "npm run pwa" (scripts/gerar-sw.js).
// ==========================================

// <PRECACHE>
const CACHE_VERSION = '9211eff54d';
const PRECACHE = [
    "/",
    "/animais-game/game.js?v=f8fbd192",
    "/animais-game/index.html",
    "/animais-game/styles.css?v=ad204085",
    "/big-hero-game/game.js?v=6336f073",
    "/big-hero-game/index.html",
    "/big-hero-game/styles.css?v=69489a08",
    "/contar-game/game.js?v=02de8264",
    "/contar-game/index.html",
    "/contar-game/styles.css?v=a48afe82",
    "/cores-formas-game/game.js?v=d91602f8",
    "/cores-formas-game/index.html",
    "/cores-formas-game/styles.css?v=068adc4b",
    "/corpo-game/game.js?v=fec5b87d",
    "/corpo-game/index.html",
    "/corpo-game/styles.css?v=ff44447b",
    "/desenhar-game/game.js?v=89f434a6",
    "/desenhar-game/index.html",
    "/desenhar-game/styles.css?v=70b67b55",
    "/dinheiro-game/game.js?v=2b1822d6",
    "/dinheiro-game/index.html",
    "/dinheiro-game/styles.css?v=a37ef6c4",
    "/emocoes-game/game.js?v=ec147b5f",
    "/emocoes-game/index.html",
    "/emocoes-game/styles.css?v=247b5aec",
    "/fracoes-game/game.js?v=ec7ebd69",
    "/fracoes-game/index.html",
    "/fracoes-game/styles.css?v=04d123c6",
    "/graficos-game/game.js?v=cf152887",
    "/graficos-game/index.html",
    "/graficos-game/styles.css?v=a0b77282",
    "/icons/apple-touch-icon.png",
    "/icons/favicon-32.png",
    "/icons/icon-192.png",
    "/icons/icon-512.png",
    "/icons/icon-maskable-192.png",
    "/icons/icon-maskable-512.png",
    "/index.html",
    "/interpretacao-game/data.js?v=779d1533",
    "/interpretacao-game/game.js?v=1873ca19",
    "/interpretacao-game/index.html",
    "/interpretacao-game/styles.css?v=6fd0b4b7",
    "/leitura-game/game.js?v=a52ed24a",
    "/leitura-game/index.html",
    "/leitura-game/styles.css?v=2a8c5bce",
    "/letras-game/game.js?v=78772c06",
    "/letras-game/index.html",
    "/letras-game/styles.css?v=a8602086",
    "/main-script.js?v=8eb4420d",
    "/main-styles.css?v=549baece",
    "/manifest.webmanifest",
    "/memoria-game/game.js?v=04d53c40",
    "/memoria-game/index.html",
    "/memoria-game/styles.css?v=f8df7fcf",
    "/olimpiada-game/data.js?v=87763617",
    "/olimpiada-game/game.js?v=62098494",
    "/olimpiada-game/index.html",
    "/olimpiada-game/styles.css?v=2869081a",
    "/ortografia-game/game.js?v=62c81311",
    "/ortografia-game/index.html",
    "/ortografia-game/styles.css?v=ce88e2d5",
    "/puzzle-game/game.js?v=332b6afd",
    "/puzzle-game/index.html",
    "/puzzle-game/styles.css?v=d981b258",
    "/quiz-game/game.js?v=6ed53d6f",
    "/quiz-game/index.html",
    "/quiz-game/styles.css?v=de66e455",
    "/relampago-game/game.js?v=3c9e7025",
    "/relampago-game/index.html",
    "/relampago-game/styles.css?v=d4338b34",
    "/rimas-game/game.js?v=ca2e8c2a",
    "/rimas-game/index.html",
    "/rimas-game/styles.css?v=47047c71",
    "/selva-game/cartas.js?v=8c1f7c84",
    "/selva-game/game.js?v=e4f5aad4",
    "/selva-game/index.html",
    "/selva-game/styles.css?v=4bf942fd",
    "/sequencia-game/game.js?v=994277f6",
    "/sequencia-game/index.html",
    "/sequencia-game/styles.css?v=950b1055",
    "/shared/dado.css?v=3a3c9597",
    "/shared/dado.js?v=9d4b65b1",
    "/shared/duelo-perguntas.js?v=b997e24c",
    "/shared/duelo.css?v=1de99c64",
    "/shared/duelo.js?v=d613fbb0",
    "/shared/fala.js?v=609e07f8",
    "/shared/fit-screen.js?v=0f4dccb7",
    "/shared/kids-audio.js?v=da92b96a",
    "/shared/palavras.js?v=f9361c20",
    "/silabas-game/game.js?v=255b6463",
    "/silabas-game/index.html",
    "/silabas-game/styles.css?v=fe0b5e44",
    "/tabuada-game/game.js?v=a77345a4",
    "/tabuada-game/index.html",
    "/tabuada-game/styles.css?v=63e18fe5",
    "/trilha-game/game.js?v=fbcd0078",
    "/trilha-game/index.html",
    "/trilha-game/styles.css?v=d81be890",
    "/unicornio-arcoiris-game/game.js?v=f45963dc",
    "/unicornio-arcoiris-game/index.html",
    "/unicornio-arcoiris-game/styles.css?v=938c3a40",
    "/unicornio-corrida-game/game.js?v=beb91494",
    "/unicornio-corrida-game/index.html",
    "/unicornio-corrida-game/styles.css?v=aad11827",
    "/unicornio-pintura-game/game.js?v=1a7ec6a4",
    "/unicornio-pintura-game/index.html",
    "/unicornio-pintura-game/styles.css?v=59183941",
    "/velha-game/game.js?v=5ca03add",
    "/velha-game/index.html",
    "/velha-game/styles.css?v=ce3b50b4"
];
// </PRECACHE>

const CACHE = 'julia-livia-' + CACHE_VERSION;
const FONT_CACHE = 'julia-livia-fontes';
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
