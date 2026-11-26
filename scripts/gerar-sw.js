// Gera a lista de arquivos do app offline dentro do sw.js.
// Rode sempre que adicionar ou mudar jogos:  npm run pwa
// A versao do cache e um "resumo" (hash) do conteudo: se algum arquivo mudar,
// os aparelhos baixam a versao nova automaticamente.
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

const files = walk(ROOT, []).sort();
const hash = crypto.createHash('sha1');
const urls = ['/'];
for (const f of files) {
    hash.update(fs.readFileSync(f));
    urls.push('/' + path.relative(ROOT, f).split(path.sep).join('/'));
}
const version = hash.digest('hex').slice(0, 10);

const swPath = path.join(ROOT, 'sw.js');
const sw = fs.readFileSync(swPath, 'utf8');
const block = `// <PRECACHE>\nconst CACHE_VERSION = '${version}';\nconst PRECACHE = ${JSON.stringify(urls, null, 4)};\n// </PRECACHE>`;
const updated = sw.replace(/\/\/ <PRECACHE>[\s\S]*?\/\/ <\/PRECACHE>/, block);
fs.writeFileSync(swPath, updated);
console.log(`sw.js atualizado: ${urls.length} arquivos, versao ${version}`);
