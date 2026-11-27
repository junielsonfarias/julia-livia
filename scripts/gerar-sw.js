// Prepara o site para publicar. Rode sempre que mudar algum jogo:  npm run pwa
//
// 1) VERSAO NOS ARQUIVOS: cada <link href="x.css"> e <script src="x.js"> das paginas
//    ganha "?v=<resumo do conteudo>". Quando o arquivo muda, o endereco muda e o
//    navegador e obrigado a baixar a versao nova (sem isso, aparelhos que guardaram
//    a versao antiga podiam continuar com ela por muito tempo).
// 2) LISTA OFFLINE: gera no sw.js a lista de arquivos que o app guarda para
//    funcionar sem internet, e a versao do cache.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const IGNORE = new Set(['node_modules', '.git', '.claude', '.vercel', 'scripts']);
const EXT = new Set(['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.webmanifest', '.json', '.mp3', '.wav', '.ogg']);
const SKIP_FILES = new Set(['sw.js', 'package.json', 'package-lock.json', 'vercel.json']);

function walk(dir, out) {
    for (const name of fs.readdirSync(dir)) {
        if (IGNORE.has(name) || name.startsWith('tmpclaude') || name.startsWith('.')) continue;
        const full = path.join(dir, name);
        const st = fs.statSync(full);
        if (st.isDirectory()) walk(full, out);
        else if (EXT.has(path.extname(name).toLowerCase()) && !SKIP_FILES.has(name)) out.push(full);
    }
    return out;
}

const shortHash = buf => crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8);
// Texto com fim de linha CRLF (Windows com core.autocrlf) ou LF da o mesmo resumo:
// o hash muda so quando o conteudo muda, nao conforme o sistema de quem rodou o script.
const TEXT = /\.(html|css|js|svg|json|webmanifest)$/i;
const readForHash = f => TEXT.test(f) ? Buffer.from(fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n')) : fs.readFileSync(f);
const toUrl = full => '/' + path.relative(ROOT, full).split(path.sep).join('/');

const files = walk(ROOT, []).sort();
const fileHash = {};
for (const f of files) {
    if (/\.(css|js)$/.test(f)) fileHash[path.resolve(f)] = shortHash(readForHash(f));
}

// ---------- 1) Versao nas referencias das paginas ----------
let changedPages = 0;
const versioned = {};   // url -> url?v=hash (para a lista offline)
for (const page of files.filter(f => f.endsWith('.html'))) {
    let html = fs.readFileSync(page, 'utf8');
    // A pasta base da pagina: <base href="/x-game/"> ou a pasta do arquivo
    const baseMatch = html.match(/<base\s+href="\/([^"]*)"/i);
    const baseDir = baseMatch ? path.join(ROOT, baseMatch[1]) : path.dirname(page);
    const updated = html.replace(/(<(?:link|script)\b[^>]*?\s(?:href|src)=")([^"]+?\.(?:css|js))(?:\?v=[0-9a-f]+)?(")/gi, (m, pre, ref, post) => {
        if (/^(https?:)?\/\//i.test(ref)) return m;                 // arquivos externos ficam como estao
        const full = path.resolve(ref.startsWith('/') ? path.join(ROOT, ref) : path.join(baseDir, ref));
        const h = fileHash[full];
        if (!h) return m;
        versioned[toUrl(full)] = `${toUrl(full)}?v=${h}`;
        return `${pre}${ref}?v=${h}${post}`;
    });
    if (updated !== html) { fs.writeFileSync(page, updated); changedPages++; }
}

// ---------- 2) Lista offline no sw.js ----------
const hash = crypto.createHash('sha1');
const urls = ['/'];
for (const f of files) {
    hash.update(readForHash(f));
    const u = toUrl(f);
    urls.push(versioned[u] || u);
}
const version = hash.digest('hex').slice(0, 10);

const swPath = path.join(ROOT, 'sw.js');
const sw = fs.readFileSync(swPath, 'utf8');
const block = `// <PRECACHE>\nconst CACHE_VERSION = '${version}';\nconst PRECACHE = ${JSON.stringify(urls, null, 4)};\n// </PRECACHE>`;
fs.writeFileSync(swPath, sw.replace(/\/\/ <PRECACHE>[\s\S]*?\/\/ <\/PRECACHE>/, block));
console.log(`Páginas com versão atualizada: ${changedPages}. sw.js: ${urls.length} arquivos, versão ${version}`);
