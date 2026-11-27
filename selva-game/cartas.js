// ==========================================
// Cartas da Selva - a cada rodada o jogador tira uma carta animada:
// curiosidade, frase da selva, desafio, premio ou consequencia.
// (Conteudo original. Curiosidades conferidas: fatos simples e verdadeiros.)
// Usa funcoes do game.js: state, move, renderBoard, renderRanking, setMsg, esc, sleep.
// ==========================================

const CARD_TYPES = {
    curiosidade:  { label: 'Curiosidade da Selva', icon: '🦜', color: '#0984e3' },
    frase:        { label: 'Frase da Selva',       icon: '🥁', color: '#6c5ce7' },
    desafio:      { label: 'Desafio!',             icon: '🎭', color: '#e17055' },
    premio:       { label: 'Prêmio!',              icon: '🎁', color: '#00b894' },
    consequencia: { label: 'Que azar!',            icon: '⚠️', color: '#d63031' }
};

// Peso de cada tipo no sorteio
const CARD_WEIGHTS = { curiosidade: 22, frase: 10, desafio: 26, premio: 22, consequencia: 20 };

const DECK = {
    curiosidade: [
        { emoji: '🦥', text: 'O bicho-preguiça é tão lento que algas crescem no pelo dele e deixam o pelo meio verdinho!' },
        { emoji: '🐆', text: 'A onça-pintada é o maior felino das Américas, e ela adora nadar!' },
        { emoji: '🐦', text: 'O tucano usa o bico enorme para ajudar a esfriar o corpo nos dias quentes.' },
        { emoji: '🐜', text: 'As formigas-cortadeiras não comem as folhas: elas usam as folhas para cultivar um fungo, que é a comida delas!' },
        { emoji: '🌳', text: 'A Floresta Amazônica é a maior floresta tropical do mundo.' },
        { emoji: '🐦', text: 'O beija-flor bate as asas tão rápido que consegue ficar parado no ar e até voar para trás!' },
        { emoji: '🐬', text: 'O boto-cor-de-rosa vive nos rios da Amazônia.' },
        { emoji: '🐒', text: 'Os macacos-prego usam pedras como ferramenta para quebrar cocos e sementes!' },
        { emoji: '🪷', text: 'A vitória-régia tem folhas tão grandes que podem passar de dois metros de largura!' },
        { emoji: '🦎', text: 'O camaleão consegue mexer cada olho para um lado ao mesmo tempo!' },
        { emoji: '🐸', text: 'Muitos sapos e rãs bebem água pela pele, e não pela boca!' },
        { emoji: '🐍', text: 'A sucuri é uma das maiores cobras do mundo e vive perto da água.' },
        { emoji: '🦋', text: 'A borboleta sente o gosto das coisas com as patinhas!' },
        { emoji: '🐘', text: 'O elefante usa a tromba para cheirar, beber água, pegar comida e até para abraçar.' }
    ],
    frase: [
        { emoji: '🥁', text: 'Os tambores da selva estão tocando... alguém vai ter sorte nesta rodada!' },
        { emoji: '🍃', text: 'Cuidado onde pisa: nem toda folha esconde só terra.' },
        { emoji: '🌬️', text: 'O vento da floresta sopra a seu favor. Siga em frente com coragem!' },
        { emoji: '🌙', text: 'Quando a lua aparece na selva, até o mais medroso vira valente.' },
        { emoji: '🛕', text: 'O Templo Dourado está esperando... mas a selva não vai facilitar!' },
        { emoji: '👀', text: 'Mil olhinhos observam do meio das árvores. Será que são amigos?' }
    ],
    desafio: [
        { emoji: '🐒', text: 'Imite um macaco por 5 segundos! Todos olham e dizem se valeu.', reward: 1 },
        { emoji: '🦶', text: 'Pule num pé só 5 vezes!', reward: 1 },
        { emoji: '🐆', text: 'Faça o rugido da onça bem alto!', reward: 1 },
        { emoji: '🌴', text: 'Diga o nome de 3 animais que vivem na selva!', reward: 1 },
        { emoji: '🔤', text: 'Fale uma palavra que comece com a letra B!', reward: 1 },
        { emoji: '🔢', text: 'Conte de 10 até 0, sem errar!', reward: 1 },
        { emoji: '😜', text: 'Faça a careta mais engraçada que conseguir!', reward: 1 },
        { emoji: '🐍', text: 'Fale "sssss" como uma cobra até alguém rir!', reward: 1 },
        { emoji: '🧘', text: 'Fique parado como uma estátua enquanto todos contam até 5!', reward: 1 },
        // Desafios que duram algumas rodadas (aparecem como selo ao lado do nome)
        { emoji: '🤐', text: 'Silêncio da selva! Fique SEM FALAR até a sua vez chegar 2 vezes. No fim, todos dizem se você conseguiu.', status: { key: 'silencio', icon: '🤐', rounds: 2, ask: 'ficou sem falar', reward: 2, penalty: -1 } },
        { emoji: '🦩', text: 'Flamingo! Toda vez que for a sua vez, jogue em um pé só, por 2 rodadas.', status: { key: 'flamingo', icon: '🦩', rounds: 2, ask: 'jogou em um pé só', reward: 1, penalty: 0 } },
        { emoji: '🐵', text: 'Língua de macaco! Até a sua próxima vez, você só pode falar "u-u-a-a"!', status: { key: 'macaco', icon: '🐵', rounds: 1, ask: 'só falou "u-u-a-a"', reward: 1, penalty: -1 } }
    ],
    premio: [
        { emoji: '🍌', text: 'Você achou um cacho de bananas! Avance 1 casa.', move: 1 },
        { emoji: '🐆', text: 'Uma onça amiga te deu carona! Avance 2 casas.', move: 2 },
        { emoji: '🛡️', text: 'Escudo de folha! O próximo azar não vai te pegar.', shield: true },
        { emoji: '⭐', text: 'Estrela da sorte! Jogue o dado de novo.', again: true },
        { emoji: '🦜', text: 'Papagaio mensageiro! Escolha alguém para voltar 1 casa.', parrot: true }
    ],
    consequencia: [
        { emoji: '🐍', text: 'Uma cobra cruzou o caminho! Volte 1 casa.', move: -1 },
        { emoji: '🕸️', text: 'Teia de aranha! Na próxima vez, você anda só metade do dado.', web: true },
        { emoji: '🌧️', text: 'Chuva forte na selva! Todo mundo volta 1 casa.', allBack: 1 },
        { emoji: '🐜', text: 'Formigas no pé! Troque de lugar com quem está logo atrás de você.', swapBehind: true },
        { emoji: '🦨', text: 'Um gambá passou por perto! Volte 2 casas tapando o nariz.', move: -2 }
    ]
};

const recentCards = [];

function pickCard() {
    const total = Object.values(CARD_WEIGHTS).reduce((a, b) => a + b, 0);
    let r = Math.random() * total, type = 'curiosidade';
    for (const [t, w] of Object.entries(CARD_WEIGHTS)) { if ((r -= w) < 0) { type = t; break; } }
    const options = DECK[type].filter(c => !recentCards.includes(c));
    const card = (options.length ? options : DECK[type])[Math.floor(Math.random() * (options.length || DECK[type].length))];
    recentCards.push(card);
    if (recentCards.length > 8) recentCards.shift();
    return { type, card };
}

// Mostra a carta (verso -> vira -> frente) e espera os botoes
function showCard(p, type, card, buttons) {
    return new Promise(resolve => {
        const t = CARD_TYPES[type];
        const ov = document.createElement('div');
        ov.className = 'card-overlay';
        ov.innerHTML = `
            <div class="card-who">${p.emoji} ${esc(p.name)} tira uma carta da selva...</div>
            <div class="jcard">
                <div class="jcard-inner">
                    <div class="jcard-back"><span>🌴</span><b>SELVA</b></div>
                    <div class="jcard-front" style="--cc:${t.color}">
                        <div class="jcard-type">${t.icon} ${t.label}</div>
                        <div class="jcard-emoji">${card.emoji}</div>
                        <p class="jcard-text"></p>
                    </div>
                </div>
            </div>
            <div class="card-buttons"></div>`;
        ov.querySelector('.jcard-text').textContent = card.text;
        document.body.appendChild(ov);
        KidsAudio.play('flip');
        setTimeout(() => {
            ov.querySelector('.jcard').classList.add('flipped');
            KidsAudio.play(type === 'consequencia' ? 'wrong' : type === 'premio' ? 'star' : 'select');
            KidsAudio.speak(t.label + '. ' + card.text, { rate: 0.95 });
            const box = ov.querySelector('.card-buttons');
            buttons.forEach(b => {
                const el = document.createElement('button');
                el.type = 'button';
                el.className = 'card-btn ' + (b.cls || '');
                el.textContent = b.label;
                el.onclick = () => {
                    if (ov.dataset.done) return;
                    ov.dataset.done = '1';
                    ov.classList.add('closing');
                    setTimeout(() => { ov.remove(); resolve(b.value); }, 280);
                };
                box.appendChild(el);
            });
        }, 750);
    });
}

// Escudo protege do proximo azar
function useShield(p) {
    if (!p.shield) return false;
    p.shield = false;
    renderRanking();
    setMsg(`🛡️ O escudo de folha protegeu ${esc(p.name)}!`);
    KidsAudio.play('star');
    KidsAudio.speak(`O escudo protegeu ${p.name}!`, { interrupt: false });
    return true;
}

// Tira e resolve a carta da rodada. Devolve true se o jogador joga de novo.
async function drawCard(p) {
    if (state.over) return false;
    const { type, card } = pickCard();
    const name = esc(p.name);

    if (type === 'curiosidade' || type === 'frase') {
        await showCard(p, type, card, [{ label: 'Que legal! ➜', value: 'ok', cls: 'primary' }]);
        return false;
    }

    if (type === 'desafio') {
        if (card.status) {
            await showCard(p, type, card, [{ label: 'Combinado! 🤝', value: 'ok', cls: 'primary' }]);
            p.statuses = (p.statuses || []).filter(s => s.key !== card.status.key);
            p.statuses.push(Object.assign({}, card.status));
            renderRanking();
            setMsg(`${card.status.icon} ${name} aceitou o desafio!`);
            return false;
        }
        const done = await showCard(p, type, card, [
            { label: '✅ Conseguiu!', value: true, cls: 'yes' },
            { label: '❌ Não deu', value: false, cls: 'no' }
        ]);
        if (done) { setMsg(`🎭 ${name} cumpriu o desafio: +${card.reward} casa!`); KidsAudio.play('correct'); await move(p, card.reward); }
        else setMsg(`🎭 Fica para a próxima, ${name}!`);
        return false;
    }

    if (type === 'premio') {
        if (card.parrot) {
            const others = state.players.filter(o => o !== p && o.pos > 0);
            if (!others.length) {
                await showCard(p, type, card, [{ label: 'Ninguém para mandar voltar 😅', value: null, cls: 'primary' }]);
                return false;
            }
            const target = await showCard(p, type, card, others.map(o => ({ label: `${o.emoji} ${o.name}`, value: o.id, cls: 'pick' })));
            const o = state.players.find(x => x.id === target);
            if (o && !useShield(o)) { setMsg(`🦜 ${esc(o.name)} volta 1 casa!`); await move(o, -1); }
            return false;
        }
        await showCard(p, type, card, [{ label: 'Oba! ➜', value: 'ok', cls: 'primary' }]);
        if (card.move) { setMsg(`${card.emoji} ${name} avança ${card.move}!`); await move(p, card.move); }
        if (card.shield) { p.shield = true; renderRanking(); setMsg(`🛡️ ${name} ganhou um escudo!`); }
        if (card.again) return true;
        return false;
    }

    // consequencia
    await showCard(p, type, card, [{ label: 'Ah, não! ➜', value: 'ok', cls: 'primary' }]);
    if (card.allBack) {
        state.players.forEach(o => { if (!useShield(o)) o.pos = Math.max(0, o.pos - card.allBack); });
        renderBoard();
        setMsg('🌧️ A chuva fez todo mundo voltar 1 casa!');
        return false;
    }
    if (useShield(p)) return false;
    if (card.move) { setMsg(`${card.emoji} ${name} volta ${-card.move}.`); await move(p, card.move); }
    if (card.web) { p.web = true; renderRanking(); setMsg(`🕸️ ${name} ficou preso na teia: próximo dado vale metade.`); }
    if (card.swapBehind) {
        const behind = state.players.filter(o => o !== p && o.pos < p.pos).sort((a, b) => b.pos - a.pos)[0];
        if (!behind) setMsg(`🐜 Não tem ninguém atrás de ${name}. Ufa!`);
        else if (useShield(behind)) { /* escudo de quem esta atras impede a troca */ }
        else { const t = p.pos; p.pos = behind.pos; behind.pos = t; renderBoard(); setMsg(`🐜 ${name} trocou de lugar com ${esc(behind.name)}!`); }
    }
    return false;
}

// No comeco da vez: desafios de varias rodadas que terminam agora
async function resolveStatuses(p) {
    if (!p.statuses || !p.statuses.length) return;
    const keep = [];
    for (const s of p.statuses) {
        s.rounds--;
        if (s.rounds > 0) { keep.push(s); continue; }
        const ok = await showCard(p, 'desafio', { emoji: s.icon, text: `Fim do desafio! ${p.name} ${s.ask}? Todos respondem juntos!` }, [
            { label: '✅ Conseguiu!', value: true, cls: 'yes' },
            { label: '❌ Não conseguiu', value: false, cls: 'no' }
        ]);
        if (ok && s.reward) { setMsg(`${s.icon} Muito bem, ${esc(p.name)}! +${s.reward}`); KidsAudio.play('correct'); await move(p, s.reward); }
        else if (!ok && s.penalty) { setMsg(`${s.icon} Ops! ${esc(p.name)} volta ${-s.penalty}.`); await move(p, s.penalty); }
        if (state.over) return;
    }
    p.statuses = keep;
    renderRanking();
}
