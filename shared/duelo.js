// ==========================================
// Base dos jogos de DUELO - Julia x Livia
// Jogadoras, niveis (para o duelo ser justo) e placar guardado no aparelho.
// ==========================================
(function () {
    const PLAYERS = {
        julia: { id: 'julia', name: 'Julia', emoji: '👸', color: '#9b59b6', level: 'dificil' },
        livia: { id: 'livia', name: 'Livia', emoji: '🧚', color: '#ff6b9d', level: 'facil' }
    };

    const LEVELS = {
        facil: 'Fácil (5 anos)',
        medio: 'Médio (1º e 2º ano)',
        dificil: 'Difícil (4º ano)'
    };

    const SCORE_KEY = 'duelos_placar_v1';
    const LEVEL_KEY = 'duelos_niveis_v1';

    function loadJSON(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }
    function saveJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

    // Nivel escolhido para cada jogadora (lembrado entre os jogos)
    function getLevel(pid) {
        const saved = loadJSON(LEVEL_KEY, {});
        return saved[pid] || PLAYERS[pid].level;
    }
    function setLevel(pid, level) {
        const saved = loadJSON(LEVEL_KEY, {});
        saved[pid] = level;
        saveJSON(LEVEL_KEY, saved);
    }

    // Placar: { total: {julia, livia, empates}, jogos: { trilha: {...}, ... } }
    function getScore(game) {
        const all = loadJSON(SCORE_KEY, { total: { julia: 0, livia: 0, empates: 0 }, jogos: {} });
        return game ? (all.jogos[game] || { julia: 0, livia: 0, empates: 0 }) : all.total;
    }
    function recordResult(game, winner) {
        const all = loadJSON(SCORE_KEY, { total: { julia: 0, livia: 0, empates: 0 }, jogos: {} });
        const g = all.jogos[game] || (all.jogos[game] = { julia: 0, livia: 0, empates: 0 });
        // julia / livia / 'empate' / qualquer outro nome = convidado
        const key = winner === 'julia' || winner === 'livia' ? winner : (winner === 'empate' || !winner ? 'empates' : 'convidados');
        g[key] = (g[key] || 0) + 1; all.total[key] = (all.total[key] || 0) + 1;
        saveJSON(SCORE_KEY, all);
    }
    function scoreText(game) {
        const s = getScore(game);
        return `🏆 Vitórias — 👸 Julia: <b>${s.julia}</b> · 🧚 Livia: <b>${s.livia}</b>` +
            (s.convidados ? ` · 🙂 Convidados: <b>${s.convidados}</b>` : '') +
            (s.empates ? ` · 🤝 Empates: <b>${s.empates}</b>` : '');
    }

    // Quem comeca alterna a cada partida
    function nextStarter(game) {
        const key = 'duelos_inicio_' + game;
        let last = 'livia';
        try { last = localStorage.getItem(key) || 'livia'; } catch (e) {}
        const next = last === 'julia' ? 'livia' : 'julia';
        try { localStorage.setItem(key, next); } catch (e) {}
        return next;
    }

    // Monta os seletores de nivel na tela inicial: <div data-level-for="julia"></div>
    function mountLevelPickers(root) {
        (root || document).querySelectorAll('[data-level-for]').forEach(box => {
            const pid = box.dataset.levelFor;
            const p = PLAYERS[pid];
            box.innerHTML = `<label class="level-pick" style="--pc:${p.color}">
                <span class="lp-name">${p.emoji} ${p.name}</span>
                <select aria-label="Nível de ${p.name}">
                    ${Object.entries(LEVELS).map(([k, v]) => `<option value="${k}" ${getLevel(pid) === k ? 'selected' : ''}>${v}</option>`).join('')}
                </select></label>`;
            box.querySelector('select').addEventListener('change', e => setLevel(pid, e.target.value));
        });
    }

    window.Duelo = { PLAYERS, LEVELS, getLevel, setLevel, getScore, recordResult, scoreText, nextStarter, mountLevelPickers };
})();
