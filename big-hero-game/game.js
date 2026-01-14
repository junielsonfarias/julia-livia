// ==========================================
// BIG HERO 6 - RUNNER GAME
// Versão Melhorada com Animações
// ==========================================

// Funcao para voltar ao portal principal
function goBackToPortal() {
    // Verifica se esta em um iframe
    if (window.parent !== window) {
        try {
            if (window.parent.closeGameModal) {
                window.parent.closeGameModal();
                return;
            }
        } catch(e) {}
    }
    // Fallback para navegacao normal
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = '../index.html';
    }
}

// Configurações do Jogo
const CONFIG = {
    CANVAS_WIDTH: 1200,
    CANVAS_HEIGHT: 600,
    GRAVITY: 0.8,
    GROUND_HEIGHT: 100,
    PHASE_DURATION: 180,
    POINTS_PER_PHASE: 1000,
    POINTS_PER_OBSTACLE: 50,
    POINTS_PER_POWERUP: 100
};

// Definição dos Personagens - Ultra Detalhados e Fiéis ao Filme
const CHARACTERS = {
    hiro: {
        name: 'Hiro Hamada',
        // Armadura roxa inspirada em Big Hero 6
        armorColor: '#7B2D9C',
        armorLight: '#A855C7',
        armorDark: '#5A1D7C',
        armorAccent: '#C084FC',
        skinColor: '#E8C4A0',
        skinShadow: '#D4A574',
        hairColor: '#1A1A1A',
        hairHighlight: '#3D3D3D',
        eyeColor: '#5D4037',
        helmetVisor: '#00D4FF',
        speed: 1,
        jumpPower: 1,
        flyDuration: 1,
        power: 'microbots',
        powerColor: '#1A1A1A',
        microbotsColor: '#2C2C2C'
    },
    baymax: {
        name: 'Baymax',
        // Corpo branco insuflável com armadura vermelha
        bodyColor: '#FFFFFF',
        bodyLight: '#FFFFFF',
        bodyDark: '#E8E8E8',
        bodyShadow: '#D0D0D0',
        armorColor: '#E53935',
        armorLight: '#EF5350',
        armorDark: '#C62828',
        armorAccent: '#FF8A80',
        eyeColor: '#2C3E50',
        eyeConnect: '#37474F',
        thrusterColor: '#FF6D00',
        thrusterCore: '#FFEB3B',
        speed: 0.8,
        jumpPower: 0.9,
        flyDuration: 2,
        power: 'rocket',
        powerColor: '#E53935'
    },
    gogo: {
        name: 'Go Go Tomago',
        // Armadura amarela com detalhes pretos e discos magnéticos
        armorColor: '#FDD835',
        armorLight: '#FFEE58',
        armorDark: '#F9A825',
        suitColor: '#263238',
        suitAccent: '#37474F',
        skinColor: '#E8C4A0',
        skinShadow: '#D4A574',
        hairColor: '#1A1A1A',
        hairHighlight: '#9C27B0',
        highlightColor: '#AB47BC',
        discColor: '#FDD835',
        discGlow: '#FFFF00',
        wheelColor: '#212121',
        eyeColor: '#5D4037',
        speed: 1.5,
        jumpPower: 1.1,
        flyDuration: 0.8,
        power: 'discs',
        powerColor: '#FDD835'
    },
    wasabi: {
        name: 'Wasabi',
        // Armadura verde robusta com lâminas de plasma
        armorColor: '#43A047',
        armorLight: '#66BB6A',
        armorDark: '#2E7D32',
        armorAccent: '#81C784',
        skinColor: '#8D6E63',
        skinShadow: '#6D4C41',
        dreadColor: '#3E2723',
        dreadHighlight: '#5D4037',
        bladeColor: '#00E676',
        bladeCore: '#B9F6CA',
        bladeGlow: '#00FF00',
        eyeColor: '#3E2723',
        speed: 0.9,
        jumpPower: 1,
        flyDuration: 1,
        power: 'blades',
        powerColor: '#00E676'
    },
    honey: {
        name: 'Honey Lemon',
        // Armadura rosa com bolsa de elementos químicos
        armorColor: '#EC407A',
        armorLight: '#F48FB1',
        armorDark: '#C2185B',
        armorAccent: '#FF80AB',
        skinColor: '#FFEBEE',
        skinShadow: '#FFCDD2',
        hairColor: '#FFF59D',
        hairHighlight: '#FFEE58',
        hairShadow: '#FFD54F',
        glassColor: '#EC407A',
        glassLens: '#FCE4EC',
        eyeColor: '#66BB6A',
        chemColors: ['#F44336', '#4CAF50', '#2196F3', '#FFEB3B', '#9C27B0', '#00BCD4'],
        purseColor: '#F8BBD9',
        speed: 1,
        jumpPower: 1.2,
        flyDuration: 1.2,
        power: 'chemballs',
        powerColor: '#EC407A'
    },
    fred: {
        name: 'Fred',
        // Traje Kaiju azul completo com detalhes de monstro
        monsterColor: '#1976D2',
        monsterLight: '#42A5F5',
        monsterDark: '#0D47A1',
        monsterAccent: '#64B5F6',
        bellyColor: '#90CAF9',
        bellyLines: '#64B5F6',
        eyeColor: '#FFCA28',
        eyeGlow: '#FFD54F',
        pupilColor: '#1A1A1A',
        teethColor: '#FAFAFA',
        tongueColor: '#E53935',
        clawColor: '#FFA000',
        hornColor: '#FFB300',
        fireCore: '#FFEB3B',
        fireMiddle: '#FF9800',
        fireOuter: '#F44336',
        speed: 0.85,
        jumpPower: 1.5,
        flyDuration: 0.7,
        power: 'fire',
        powerColor: '#FF5722'
    }
};

// Definição das Fases - Visual Aprimorado
const LEVELS = {
    1: {
        name: 'San Fransokyo - Cidade',
        skyColors: ['#0F0F23', '#1A1A3E', '#2D2D5A'],
        buildingColors: ['#1A1A2E', '#252547', '#2F2F5F'],
        groundColor: '#1A1A2E',
        groundTop: '#3D3D6B',
        neonColors: ['#FF00FF', '#00FFFF', '#FF6B6B', '#4ECDC4'],
        hasStars: true,
        hasClouds: false,
        speed: 2.5,
        obstacleFrequency: 2500,
        powerupFrequency: 5000,
        difficulty: 1
    },
    2: {
        name: 'SFIT - Laboratório',
        skyColors: ['#0A1628', '#152238', '#1F3A5F'],
        buildingColors: ['#0D1B2A', '#1B3A4B', '#2D5A6B'],
        groundColor: '#0D1B2A',
        groundTop: '#00D9FF',
        neonColors: ['#00D9FF', '#00FF88', '#FFFFFF'],
        hasStars: false,
        hasClouds: false,
        hasHolograms: true,
        speed: 3,
        obstacleFrequency: 2200,
        powerupFrequency: 4500,
        difficulty: 1.2
    },
    3: {
        name: 'Ilha Akuma',
        skyColors: ['#0D0D0D', '#1A1A1A', '#2D2D2D'],
        buildingColors: ['#1A1A1A', '#2D2D2D', '#3D3D3D'],
        groundColor: '#0D0D0D',
        groundTop: '#4A4A4A',
        neonColors: ['#FF0000', '#FF4444', '#FF8800'],
        hasStars: false,
        hasClouds: true,
        cloudColor: 'rgba(50, 50, 50, 0.5)',
        speed: 3.5,
        obstacleFrequency: 2000,
        powerupFrequency: 4000,
        difficulty: 1.5
    },
    4: {
        name: 'Portal Dimensional',
        skyColors: ['#2D0A4E', '#4A1080', '#6B20B0'],
        buildingColors: ['#3D1060', '#5A2080', '#7030A0'],
        groundColor: '#1A0530',
        groundTop: '#9B4DCA',
        neonColors: ['#FF00FF', '#00FFFF', '#FFFF00', '#FF00AA'],
        hasStars: true,
        hasPortalEffect: true,
        speed: 4,
        obstacleFrequency: 1800,
        powerupFrequency: 3500,
        difficulty: 1.8
    },
    5: {
        name: 'Confronto Final - Yokai',
        skyColors: ['#1A0000', '#2D0000', '#400000'],
        buildingColors: ['#2D0000', '#400000', '#550000'],
        groundColor: '#0D0000',
        groundTop: '#FF0000',
        neonColors: ['#FF0000', '#FF4400', '#FFAA00'],
        hasStars: false,
        hasFire: true,
        speed: 4.5,
        obstacleFrequency: 1500,
        powerupFrequency: 3000,
        difficulty: 2
    }
};

// Variações de cenário por personagem
const CHARACTER_THEMES = {
    hiro: {
        name: 'Tech Innovation',
        skyTint: [0, 20, 40],       // Azul tech
        neonBoost: '#00D9FF',
        particleColor: '#4FC3F7',
        specialEffect: 'microbots',
        groundAccent: '#0088CC'
    },
    baymax: {
        name: 'Medical District',
        skyTint: [40, 40, 40],      // Branco/cinza
        neonBoost: '#FFFFFF',
        particleColor: '#E3F2FD',
        specialEffect: 'healing',
        groundAccent: '#90CAF9'
    },
    gogo: {
        name: 'Speed Zone',
        skyTint: [60, 0, 60],       // Roxo vibrante
        neonBoost: '#FF00FF',
        particleColor: '#E040FB',
        specialEffect: 'speedlines',
        groundAccent: '#9C27B0'
    },
    wasabi: {
        name: 'Plasma Grid',
        skyTint: [0, 80, 0],        // Verde plasma
        neonBoost: '#00FF00',
        particleColor: '#76FF03',
        specialEffect: 'plasma',
        groundAccent: '#4CAF50'
    },
    honey: {
        name: 'Chemical Garden',
        skyTint: [80, 40, 80],      // Rosa químico
        neonBoost: '#FF69B4',
        particleColor: '#F48FB1',
        specialEffect: 'bubbles',
        groundAccent: '#E91E63'
    },
    fred: {
        name: 'Fire Domain',
        skyTint: [80, 30, 0],       // Laranja fogo
        neonBoost: '#FF6600',
        particleColor: '#FF9800',
        specialEffect: 'fire',
        groundAccent: '#FF5722'
    }
};

// Função para obter cenário modificado pelo personagem
function getModifiedLevel(levelId) {
    const baseLevel = { ...LEVELS[levelId] };
    const charId = gameState.selectedCharacter;

    if (!charId || !CHARACTER_THEMES[charId]) return baseLevel;

    const theme = CHARACTER_THEMES[charId];

    // Modificar cores do céu com tint do personagem
    baseLevel.skyColors = baseLevel.skyColors.map(color => {
        return blendColors(color, rgbToHex(theme.skyTint[0], theme.skyTint[1], theme.skyTint[2]), 0.2);
    });

    // Adicionar cor neon especial do personagem
    if (!baseLevel.neonColors.includes(theme.neonBoost)) {
        baseLevel.neonColors = [theme.neonBoost, ...baseLevel.neonColors.slice(0, 3)];
    }

    // Adicionar efeito especial
    baseLevel.characterEffect = theme.specialEffect;
    baseLevel.characterParticleColor = theme.particleColor;
    baseLevel.characterGroundAccent = theme.groundAccent;

    return baseLevel;
}

// Funções auxiliares para cores
function blendColors(color1, color2, ratio) {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');

    const r1 = parseInt(hex1.substring(0, 2), 16);
    const g1 = parseInt(hex1.substring(2, 4), 16);
    const b1 = parseInt(hex1.substring(4, 6), 16);

    const r2 = parseInt(hex2.substring(0, 2), 16);
    const g2 = parseInt(hex2.substring(2, 4), 16);
    const b2 = parseInt(hex2.substring(4, 6), 16);

    const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
    const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
    const b = Math.round(b1 * (1 - ratio) + b2 * ratio);

    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Estado do Jogo
let gameState = {
    currentScreen: 'menu',
    selectedCharacter: null,
    currentLevel: 1,
    unlockedLevels: [1],
    score: 0,
    highScores: {},
    timeRemaining: CONFIG.PHASE_DURATION,
    isPaused: false,
    isPlaying: false,
    obstaclesPassed: 0,
    powerupsCollected: 0,
    animationFrame: 0
};

// Jogador com animação
let player = {
    x: 150,
    y: 0,
    width: 70,
    height: 90,
    velocityY: 0,
    isJumping: false,
    isFlying: false,
    isCrouching: false,
    flyEnergy: 100,
    powerCharge: 0,
    isPowerActive: false,
    hasShield: false,
    hasSpeedBoost: false,
    speedBoostTimer: 0,
    shieldTimer: 0,
    // Animação
    runFrame: 0,
    runSpeed: 0.15,
    legAngle: 0,
    armAngle: 0,
    bobOffset: 0
};

// Arrays do Jogo
let obstacles = [];
let powerups = [];
let particles = [];
let civilians = [];  // Pessoas para salvar
let villains = [];   // Vilões para enfrentar
let backgroundElements = {
    stars: [],
    buildings: [],
    clouds: [],
    neonSigns: []
};

// Contadores de salvamentos
let civiliansRescued = 0;
let villainsDefeated = 0;

// Timers
let obstacleTimer = 0;
let powerupTimer = 0;
let civilianTimer = 0;
let villainTimer = 0;
let gameTimer = null;
let lastFrameTime = 0;

// Canvas e Contexto
let canvas = null;
let ctx = null;

// Controles
let keys = { up: false, down: false, shift: false, x: false };

// ==========================================
// INICIALIZAÇÃO
// ==========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function init() {
    console.log('Inicializando Big Hero 6 Runner...');
    try {
        initCanvas();
        initEventListeners();
        loadGameData();
        showScreen('menu');
        console.log('Jogo inicializado com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar:', error);
    }
}

function initCanvas() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    CONFIG.CANVAS_WIDTH = canvas.width;
    CONFIG.CANVAS_HEIGHT = canvas.height;
    CONFIG.GROUND_HEIGHT = canvas.height * 0.15;
}

function initEventListeners() {
    // Menu
    const startBtn = document.getElementById('start-btn');
    const instructionsBtn = document.getElementById('instructions-btn');
    const backMenuBtn = document.getElementById('back-menu-btn');
    const backFromCharBtn = document.getElementById('back-from-char-btn');
    const backFromLevelBtn = document.getElementById('back-from-level-btn');

    if (startBtn) startBtn.onclick = () => showScreen('character');
    if (instructionsBtn) instructionsBtn.onclick = () => showScreen('instructions');
    if (backMenuBtn) backMenuBtn.onclick = () => showScreen('menu');
    if (backFromCharBtn) backFromCharBtn.onclick = () => showScreen('menu');
    if (backFromLevelBtn) backFromLevelBtn.onclick = () => showScreen('character');

    // Seleção
    document.querySelectorAll('.character-card').forEach(card => {
        card.onclick = () => selectCharacter(card.dataset.character);
    });
    document.querySelectorAll('.level-card').forEach(card => {
        card.onclick = () => selectLevel(parseInt(card.dataset.level));
    });

    // Controles do jogo
    const resumeBtn = document.getElementById('resume-btn');
    const restartBtn = document.getElementById('restart-btn');
    const quitBtn = document.getElementById('quit-btn');
    const nextLevelBtn = document.getElementById('next-level-btn');
    const replayBtn = document.getElementById('replay-btn');
    const menuBtn = document.getElementById('menu-btn');
    const retryBtn = document.getElementById('retry-btn');
    const gameoverMenuBtn = document.getElementById('gameover-menu-btn');

    if (resumeBtn) resumeBtn.onclick = resumeGame;
    if (restartBtn) restartBtn.onclick = restartLevel;
    if (quitBtn) quitBtn.onclick = quitToMenu;
    if (nextLevelBtn) nextLevelBtn.onclick = nextLevel;
    if (replayBtn) replayBtn.onclick = restartLevel;
    if (menuBtn) menuBtn.onclick = quitToMenu;
    if (retryBtn) retryBtn.onclick = restartLevel;
    if (gameoverMenuBtn) gameoverMenuBtn.onclick = quitToMenu;

    // Teclado
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Controles Mobile Touch
    setupMobileControls();
}

// ==========================================
// CONTROLES MOBILE TOUCH
// ==========================================

function setupMobileControls() {
    const btnJump = document.getElementById('btn-jump');
    const btnCrouch = document.getElementById('btn-crouch');
    const btnFly = document.getElementById('btn-fly');
    const btnPower = document.getElementById('btn-power');
    const btnPauseMobile = document.getElementById('btn-pause-mobile');

    // Helper para eventos touch
    function addTouchEvents(btn, onStart, onEnd) {
        if (!btn) return;

        // Touch events
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            btn.classList.add('active');
            if (onStart) onStart();
        }, { passive: false });

        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            btn.classList.remove('active');
            if (onEnd) onEnd();
        }, { passive: false });

        btn.addEventListener('touchcancel', (e) => {
            btn.classList.remove('active');
            if (onEnd) onEnd();
        });

        // Mouse events para teste em desktop
        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            btn.classList.add('active');
            if (onStart) onStart();
        });

        btn.addEventListener('mouseup', (e) => {
            btn.classList.remove('active');
            if (onEnd) onEnd();
        });

        btn.addEventListener('mouseleave', (e) => {
            if (btn.classList.contains('active')) {
                btn.classList.remove('active');
                if (onEnd) onEnd();
            }
        });
    }

    // Botao de Pular
    addTouchEvents(btnJump,
        () => {
            if (gameState.currentScreen !== 'game' || gameState.isPaused) return;
            keys.up = true;
            if (!player.isJumping && !player.isFlying && !player.isCrouching) {
                jump();
            }
        },
        () => {
            keys.up = false;
        }
    );

    // Botao de Abaixar
    addTouchEvents(btnCrouch,
        () => {
            if (gameState.currentScreen !== 'game' || gameState.isPaused) return;
            keys.down = true;
            if (!player.isJumping && !player.isFlying) {
                crouch(true);
            }
        },
        () => {
            keys.down = false;
            crouch(false);
        }
    );

    // Botao de Voar (segure)
    addTouchEvents(btnFly,
        () => {
            if (gameState.currentScreen !== 'game' || gameState.isPaused) return;
            keys.shift = true;
            // Ativar voo imediatamente se no ar ou puler
            if (!player.isJumping && !player.isCrouching) {
                jump(); // Primeiro pula
            }
        },
        () => {
            keys.shift = false;
            player.isFlying = false;
        }
    );

    // Botao de Poder
    addTouchEvents(btnPower,
        () => {
            if (gameState.currentScreen !== 'game' || gameState.isPaused) return;
            if (!keys.x && player.powerCharge >= 100) {
                activatePower();
            }
            keys.x = true;
        },
        () => {
            keys.x = false;
        }
    );

    // Botao de Pausa Mobile
    if (btnPauseMobile) {
        btnPauseMobile.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (gameState.currentScreen === 'game') {
                togglePause();
            }
        }, { passive: false });

        btnPauseMobile.addEventListener('click', (e) => {
            e.preventDefault();
            if (gameState.currentScreen === 'game') {
                togglePause();
            }
        });
    }

    // Detectar se e dispositivo movel
    detectMobileDevice();
}

function detectMobileDevice() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isMobile || hasTouch) {
        document.body.classList.add('is-mobile');
    }
}

function handleKeyDown(e) {
    if (gameState.currentScreen !== 'game') return;
    switch(e.code) {
        case 'ArrowUp':
        case 'Space':
            e.preventDefault();
            keys.up = true;
            if (!player.isJumping && !player.isFlying && !player.isCrouching) jump();
            break;
        case 'ArrowDown':
            e.preventDefault();
            keys.down = true;
            if (!player.isJumping && !player.isFlying) crouch(true);
            break;
        case 'ShiftLeft':
        case 'ShiftRight':
            e.preventDefault();
            keys.shift = true;
            break;
        case 'KeyX':
            e.preventDefault();
            if (!keys.x && player.powerCharge >= 100) activatePower();
            keys.x = true;
            break;
        case 'Escape':
        case 'KeyP':
            e.preventDefault();
            togglePause();
            break;
    }
}

function handleKeyUp(e) {
    switch(e.code) {
        case 'ArrowUp':
        case 'Space':
            keys.up = false;
            break;
        case 'ArrowDown':
            keys.down = false;
            crouch(false);
            break;
        case 'ShiftLeft':
        case 'ShiftRight':
            keys.shift = false;
            player.isFlying = false;
            break;
        case 'KeyX':
            keys.x = false;
            break;
    }
}

// ==========================================
// NAVEGAÇÃO
// ==========================================

function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(`${screenName}-screen`);
    if (screen) {
        screen.classList.add('active');
        gameState.currentScreen = screenName;
    }
    if (screenName === 'level') updateLevelCards();
}

function selectCharacter(characterId) {
    gameState.selectedCharacter = characterId;
    document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
    const card = document.querySelector(`[data-character="${characterId}"]`);
    if (card) card.classList.add('selected');
    setTimeout(() => showScreen('level'), 300);
}

function selectLevel(level) {
    if (!gameState.unlockedLevels.includes(level)) return;
    gameState.currentLevel = level;
    startGame();
}

function updateLevelCards() {
    document.querySelectorAll('.level-card').forEach(card => {
        const level = parseInt(card.dataset.level);
        card.classList.toggle('locked', !gameState.unlockedLevels.includes(level));
    });
}

// ==========================================
// JOGO PRINCIPAL
// ==========================================

function startGame() {
    showScreen('game');

    // Ocultar botao de voltar durante o jogo
    const backBtn = document.getElementById('back-to-portal');
    if (backBtn) backBtn.style.display = 'none';

    gameState.score = 0;
    gameState.timeRemaining = CONFIG.PHASE_DURATION;
    gameState.isPaused = false;
    gameState.isPlaying = true;
    gameState.obstaclesPassed = 0;
    gameState.powerupsCollected = 0;
    gameState.animationFrame = 0;

    resetPlayer();
    initBackgroundElements();

    obstacles = [];
    powerups = [];
    particles = [];
    civilians = [];
    villains = [];
    obstacleTimer = 0;
    powerupTimer = 0;
    civilianTimer = 0;
    villainTimer = 0;
    civiliansRescued = 0;
    villainsDefeated = 0;

    if (gameTimer) clearInterval(gameTimer);
    gameTimer = setInterval(updateGameTimer, 1000);

    lastFrameTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function resetPlayer() {
    player.x = 150;
    player.y = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - player.height;
    player.velocityY = 0;
    player.isJumping = false;
    player.isFlying = false;
    player.isCrouching = false;
    player.flyEnergy = 100;
    player.powerCharge = 0;
    player.isPowerActive = false;
    player.hasShield = false;
    player.hasSpeedBoost = false;
    player.runFrame = 0;
    player.legAngle = 0;
    player.armAngle = 0;
    player.width = 70;
    player.height = 90;
}

function initBackgroundElements() {
    const level = LEVELS[gameState.currentLevel];

    // Estrelas
    backgroundElements.stars = [];
    if (level.hasStars) {
        for (let i = 0; i < 100; i++) {
            backgroundElements.stars.push({
                x: Math.random() * CONFIG.CANVAS_WIDTH,
                y: Math.random() * (CONFIG.CANVAS_HEIGHT * 0.6),
                size: Math.random() * 2 + 0.5,
                twinkle: Math.random() * Math.PI * 2
            });
        }
    }

    // Prédios
    backgroundElements.buildings = [];
    for (let layer = 0; layer < 3; layer++) {
        const buildingCount = 15 + layer * 5;
        for (let i = 0; i < buildingCount; i++) {
            backgroundElements.buildings.push({
                x: i * (CONFIG.CANVAS_WIDTH / buildingCount) * 2,
                width: 60 + Math.random() * 100 - layer * 20,
                height: 100 + Math.random() * 200 + layer * 50,
                layer: layer,
                windows: Math.floor(Math.random() * 3) + 2,
                hasAntenna: Math.random() > 0.7,
                neonColor: level.neonColors[Math.floor(Math.random() * level.neonColors.length)]
            });
        }
    }

    // Nuvens
    backgroundElements.clouds = [];
    if (level.hasClouds) {
        for (let i = 0; i < 8; i++) {
            backgroundElements.clouds.push({
                x: Math.random() * CONFIG.CANVAS_WIDTH * 2,
                y: 50 + Math.random() * 150,
                width: 100 + Math.random() * 150,
                speed: 0.2 + Math.random() * 0.3
            });
        }
    }
}

// ==========================================
// GAME LOOP
// ==========================================

function gameLoop(currentTime) {
    if (!gameState.isPlaying) return;

    const deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;

    if (!gameState.isPaused) {
        update(deltaTime);
        render();
    }

    requestAnimationFrame(gameLoop);
}

function update(deltaTime) {
    const level = LEVELS[gameState.currentLevel];
    const char = CHARACTERS[gameState.selectedCharacter];
    const baseSpeed = level.speed * (player.hasSpeedBoost ? 1.5 : 1);

    gameState.animationFrame++;

    // Atualizar animação de corrida
    updateRunAnimation(deltaTime);

    // Atualizar jogador
    updatePlayer(char);
    updateActiveEffects();

    // Atualizar background
    updateBackground(baseSpeed);

    // Spawn
    obstacleTimer += deltaTime || 16;
    if (obstacleTimer >= level.obstacleFrequency / level.difficulty) {
        spawnObstacle();
        obstacleTimer = 0;
    }

    powerupTimer += deltaTime || 16;
    if (powerupTimer >= level.powerupFrequency) {
        spawnPowerup();
        powerupTimer = 0;
    }

    // Spawn de civis (a cada ~4 segundos)
    civilianTimer += deltaTime || 16;
    if (civilianTimer >= 4000) {
        if (Math.random() > 0.3) spawnCivilian();
        civilianTimer = 0;
    }

    // Spawn de vilões (a cada ~6 segundos, aumenta com dificuldade)
    villainTimer += deltaTime || 16;
    if (villainTimer >= 6000 / level.difficulty) {
        if (Math.random() > 0.4) spawnVillain();
        villainTimer = 0;
    }

    // Atualizar elementos
    updateObstacles(baseSpeed);
    updatePowerups(baseSpeed);
    updateCivilians(baseSpeed);
    updateVillains(baseSpeed);
    updateParticles();
    checkCollisions();
    checkCivilianCollisions();
    updateHUD();
}

function updateRunAnimation(deltaTime) {
    if (!player.isJumping && !player.isFlying && !player.isCrouching) {
        // Animação de corrida
        player.runFrame += player.runSpeed;
        player.legAngle = Math.sin(player.runFrame * 2) * 0.8;
        player.armAngle = Math.sin(player.runFrame * 2 + Math.PI) * 0.6;
        player.bobOffset = Math.abs(Math.sin(player.runFrame * 2)) * 5;

        // Criar partículas de poeira
        if (Math.random() < 0.3) {
            createDustParticle();
        }
    } else if (player.isJumping) {
        player.legAngle *= 0.95;
        player.armAngle = -0.5;
        player.bobOffset = 0;
    } else if (player.isFlying) {
        player.legAngle = 0.3;
        player.armAngle = -0.8;
        player.bobOffset = Math.sin(gameState.animationFrame * 0.1) * 3;
    }
}

function createDustParticle() {
    particles.push({
        x: player.x + player.width / 2 + (Math.random() - 0.5) * 20,
        y: player.y + player.height,
        vx: -2 - Math.random() * 2,
        vy: -Math.random() * 2,
        size: 3 + Math.random() * 5,
        life: 1,
        color: 'rgba(150, 150, 150, 0.5)',
        type: 'dust'
    });
}

function updateBackground(speed) {
    // Mover prédios
    backgroundElements.buildings.forEach(b => {
        const layerSpeed = speed * (0.3 + b.layer * 0.2);
        b.x -= layerSpeed;
        if (b.x + b.width < 0) {
            b.x = CONFIG.CANVAS_WIDTH + Math.random() * 200;
        }
    });

    // Mover nuvens
    backgroundElements.clouds.forEach(c => {
        c.x -= c.speed;
        if (c.x + c.width < 0) {
            c.x = CONFIG.CANVAS_WIDTH + Math.random() * 200;
        }
    });

    // Twinkle estrelas
    backgroundElements.stars.forEach(s => {
        s.twinkle += 0.05;
    });
}

function updatePlayer(char) {
    const groundY = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - player.height;

    // Voar
    if (keys.shift && player.flyEnergy > 0 && (player.isJumping || player.isFlying)) {
        player.isFlying = true;
        player.velocityY = -5 * (char ? 1 : 1);
        player.flyEnergy -= 1;

        // Partículas de propulsão
        if (Math.random() < 0.5) {
            createThrusterParticle();
        }
    } else if (!keys.shift || player.flyEnergy <= 0) {
        player.isFlying = false;
    }

    // Gravidade
    if (!player.isFlying) {
        player.velocityY += CONFIG.GRAVITY;
    }

    player.y += player.velocityY;

    // Chão
    if (player.y >= groundY) {
        player.y = groundY;
        player.velocityY = 0;
        player.isJumping = false;
        player.isFlying = false;
        if (player.flyEnergy < 100) player.flyEnergy += 0.5;
    }

    // Limite superior
    if (player.y < 50) {
        player.y = 50;
        player.velocityY = 0;
    }

    // Agachar
    player.height = player.isCrouching ? 50 : 90;
}

function createThrusterParticle() {
    const colors = ['#00D9FF', '#0099FF', '#FFFFFF'];
    particles.push({
        x: player.x + player.width / 2 + (Math.random() - 0.5) * 20,
        y: player.y + player.height,
        vx: (Math.random() - 0.5) * 3,
        vy: 3 + Math.random() * 5,
        size: 5 + Math.random() * 10,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: 'thruster'
    });
}

function jump() {
    const char = CHARACTERS[gameState.selectedCharacter];
    player.isJumping = true;
    player.velocityY = -18 * (char ? char.jumpPower : 1);

    // Partículas de salto
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: player.x + player.width / 2 + (Math.random() - 0.5) * 30,
            y: player.y + player.height,
            vx: (Math.random() - 0.5) * 8,
            vy: -Math.random() * 5,
            size: 5 + Math.random() * 8,
            life: 1,
            color: '#FFFFFF',
            type: 'jump'
        });
    }
}

function crouch(active) {
    if (active && !player.isJumping && !player.isFlying) {
        player.isCrouching = true;
        player.y = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - 50;
    } else {
        player.isCrouching = false;
    }
}

function activatePower() {
    if (player.powerCharge < 100) return;

    player.isPowerActive = true;
    player.powerCharge = 0;

    // Efeito visual
    for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2;
        particles.push({
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            vx: Math.cos(angle) * (5 + Math.random() * 10),
            vy: Math.sin(angle) * (5 + Math.random() * 10),
            size: 5 + Math.random() * 15,
            life: 1,
            color: CHARACTERS[gameState.selectedCharacter]?.powerColor || '#F39C12',
            type: 'power'
        });
    }

    // Destruir obstáculos
    obstacles = obstacles.filter(obs => {
        if (obs.x < player.x + 400 && obs.x > player.x - 50) {
            gameState.score += CONFIG.POINTS_PER_OBSTACLE;
            gameState.obstaclesPassed++;
            createExplosion(obs.x + obs.width / 2, obs.y + obs.height / 2);
            return false;
        }
        return true;
    });

    setTimeout(() => { player.isPowerActive = false; }, 3000);
}

function updateActiveEffects() {
    if (player.hasSpeedBoost) {
        player.speedBoostTimer -= 16;
        if (player.speedBoostTimer <= 0) {
            player.hasSpeedBoost = false;
            document.getElementById('speed-indicator')?.classList.add('hidden');
        }
    }
    if (player.hasShield) {
        player.shieldTimer -= 16;
        if (player.shieldTimer <= 0) {
            player.hasShield = false;
            document.getElementById('shield-indicator')?.classList.add('hidden');
        }
    }
}

// ==========================================
// OBSTÁCULOS E POWER-UPS
// ==========================================

function spawnObstacle() {
    const level = LEVELS[gameState.currentLevel];
    const types = ['low', 'high', 'flying'];
    const type = types[Math.floor(Math.random() * types.length)];

    let obstacle = {
        x: CONFIG.CANVAS_WIDTH + 50,
        width: 60 + Math.random() * 30,
        color: level.neonColors[Math.floor(Math.random() * level.neonColors.length)],
        type: type,
        passed: false,
        animOffset: Math.random() * Math.PI * 2
    };

    switch(type) {
        case 'low':
            obstacle.height = 50 + Math.random() * 30;
            obstacle.y = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - obstacle.height;
            break;
        case 'high':
            obstacle.height = 80 + Math.random() * 40;
            obstacle.y = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - obstacle.height;
            break;
        case 'flying':
            obstacle.height = 50;
            obstacle.width = 70;
            obstacle.y = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - 180 - Math.random() * 80;
            break;
    }

    obstacles.push(obstacle);
}

function spawnPowerup() {
    const types = ['speed', 'shield', 'power', 'points'];
    powerups.push({
        x: CONFIG.CANVAS_WIDTH + 50,
        y: CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - 120 - Math.random() * 180,
        width: 45,
        height: 45,
        type: types[Math.floor(Math.random() * types.length)],
        collected: false,
        animOffset: Math.random() * Math.PI * 2
    });
}

// ==========================================
// SISTEMA DE CIVIS E VILÕES
// ==========================================

function spawnCivilian() {
    const civilTypes = ['child', 'adult', 'elderly', 'worker'];
    const type = civilTypes[Math.floor(Math.random() * civilTypes.length)];
    civilians.push({
        x: CONFIG.CANVAS_WIDTH + 50,
        y: CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - 70,
        width: 40,
        height: 65,
        type: type,
        rescued: false,
        animOffset: Math.random() * Math.PI * 2,
        waving: Math.random() > 0.5
    });
}

function spawnVillain() {
    const villainTypes = ['microbot', 'drone', 'yokai_minion'];
    const type = villainTypes[Math.floor(Math.random() * villainTypes.length)];
    const isFlying = type === 'drone' || Math.random() > 0.6;
    villains.push({
        x: CONFIG.CANVAS_WIDTH + 50,
        y: isFlying ? 100 + Math.random() * 150 : CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - 80,
        width: 50,
        height: 60,
        type: type,
        defeated: false,
        health: type === 'yokai_minion' ? 2 : 1,
        animOffset: Math.random() * Math.PI * 2,
        isFlying: isFlying
    });
}

function updateCivilians(speed) {
    civilians = civilians.filter(civ => {
        civ.x -= speed * 0.7;
        return civ.x > -60 && !civ.rescued;
    });
}

function updateVillains(speed) {
    villains = villains.filter(vil => {
        vil.x -= speed * 0.9;
        // Movimento vertical para vilões voadores
        if (vil.isFlying) {
            vil.y += Math.sin(gameState.animationFrame * 0.05 + vil.animOffset) * 0.5;
        }
        return vil.x > -80 && !vil.defeated;
    });
}

function checkCivilianCollisions() {
    const playerBox = {
        x: player.x + 10,
        y: player.y + 5,
        width: player.width - 20,
        height: player.height - 10
    };

    // Salvar civis
    civilians.forEach(civ => {
        if (!civ.rescued && isColliding(playerBox, civ)) {
            civ.rescued = true;
            civiliansRescued++;
            gameState.score += 150; // Pontos por salvar alguém
            createRescueEffect(civ.x, civ.y);
        }
    });

    // Derrotar vilões (precisa de poder ativo ou escudo)
    villains.forEach(vil => {
        if (!vil.defeated && isColliding(playerBox, vil)) {
            if (player.isPowerActive || player.hasShield) {
                vil.health--;
                if (vil.health <= 0) {
                    vil.defeated = true;
                    villainsDefeated++;
                    gameState.score += 200; // Pontos por derrotar vilão
                    createDefeatEffect(vil.x, vil.y);
                }
            } else {
                // Jogador sem poder é empurrado para trás
                player.velocityX = -5;
            }
        }
    });
}

function createRescueEffect(x, y) {
    // Partículas de coração/salvamento
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: x + 20,
            y: y + 30,
            vx: (Math.random() - 0.5) * 6,
            vy: -Math.random() * 8 - 2,
            life: 60,
            maxLife: 60,
            type: 'rescue',
            color: Math.random() > 0.5 ? '#FF69B4' : '#FFD700'
        });
    }
}

function createDefeatEffect(x, y) {
    // Partículas de explosão
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        particles.push({
            x: x + 25,
            y: y + 30,
            vx: Math.cos(angle) * (3 + Math.random() * 4),
            vy: Math.sin(angle) * (3 + Math.random() * 4),
            life: 45,
            maxLife: 45,
            type: 'defeat',
            color: Math.random() > 0.5 ? '#FF4444' : '#FF8800'
        });
    }
}

function drawCivilians() {
    const time = gameState.animationFrame * 0.1;

    civilians.forEach(civ => {
        if (civ.rescued) return;

        ctx.save();
        const bounce = Math.sin(time + civ.animOffset) * 3;

        // Desenhar civil baseado no tipo
        switch(civ.type) {
            case 'child':
                drawChildCivilian(civ, bounce, time);
                break;
            case 'adult':
                drawAdultCivilian(civ, bounce, time);
                break;
            case 'elderly':
                drawElderlyCivilian(civ, bounce, time);
                break;
            case 'worker':
                drawWorkerCivilian(civ, bounce, time);
                break;
        }

        // Indicador de "ajude-me!"
        if (civ.waving) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('SOCORRO!', civ.x + 20, civ.y - 15 + Math.sin(time * 2) * 3);
        }

        ctx.restore();
    });
}

function drawChildCivilian(civ, bounce, time) {
    const x = civ.x, y = civ.y + bounce;

    // Corpo pequeno
    ctx.fillStyle = '#4FC3F7';
    ctx.beginPath();
    roundRect(ctx, x + 10, y + 25, 20, 25, 5);
    ctx.fill();

    // Cabeça grande (proporção infantil)
    ctx.fillStyle = '#FFCC80';
    ctx.beginPath();
    ctx.arc(x + 20, y + 15, 14, 0, Math.PI * 2);
    ctx.fill();

    // Cabelo
    ctx.fillStyle = '#5D4037';
    ctx.beginPath();
    ctx.arc(x + 20, y + 8, 12, Math.PI, 0, false);
    ctx.fill();

    // Olhos grandes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x + 15, y + 14, 3, 0, Math.PI * 2);
    ctx.arc(x + 25, y + 14, 3, 0, Math.PI * 2);
    ctx.fill();

    // Brilho nos olhos
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(x + 14, y + 13, 1, 0, Math.PI * 2);
    ctx.arc(x + 24, y + 13, 1, 0, Math.PI * 2);
    ctx.fill();

    // Boca assustada
    ctx.fillStyle = '#E57373';
    ctx.beginPath();
    ctx.ellipse(x + 20, y + 22, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pernas
    ctx.fillStyle = '#1976D2';
    ctx.fillRect(x + 12, y + 48, 7, 15);
    ctx.fillRect(x + 21, y + 48, 7, 15);

    // Braços acenando
    ctx.fillStyle = '#FFCC80';
    ctx.save();
    ctx.translate(x + 8, y + 28);
    ctx.rotate(Math.sin(time * 3) * 0.5);
    ctx.fillRect(-3, 0, 6, 18);
    ctx.restore();
}

function drawAdultCivilian(civ, bounce, time) {
    const x = civ.x, y = civ.y + bounce;

    // Corpo
    ctx.fillStyle = '#78909C';
    ctx.beginPath();
    roundRect(ctx, x + 8, y + 22, 24, 28, 5);
    ctx.fill();

    // Cabeça
    ctx.fillStyle = '#FFCC80';
    ctx.beginPath();
    ctx.arc(x + 20, y + 12, 12, 0, Math.PI * 2);
    ctx.fill();

    // Cabelo
    ctx.fillStyle = '#3E2723';
    ctx.beginPath();
    ctx.arc(x + 20, y + 6, 10, Math.PI, 0, false);
    ctx.fill();

    // Olhos
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x + 16, y + 11, 2, 0, Math.PI * 2);
    ctx.arc(x + 24, y + 11, 2, 0, Math.PI * 2);
    ctx.fill();

    // Expressão preocupada
    ctx.strokeStyle = '#795548';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 20, y + 20, 4, 0.1, Math.PI - 0.1);
    ctx.stroke();

    // Pernas
    ctx.fillStyle = '#455A64';
    ctx.fillRect(x + 10, y + 48, 8, 16);
    ctx.fillRect(x + 22, y + 48, 8, 16);
}

function drawElderlyCivilian(civ, bounce, time) {
    const x = civ.x, y = civ.y + bounce;

    // Corpo com casaco
    ctx.fillStyle = '#8D6E63';
    ctx.beginPath();
    roundRect(ctx, x + 6, y + 22, 28, 30, 5);
    ctx.fill();

    // Cabeça
    ctx.fillStyle = '#FFCC80';
    ctx.beginPath();
    ctx.arc(x + 20, y + 12, 11, 0, Math.PI * 2);
    ctx.fill();

    // Cabelo branco
    ctx.fillStyle = '#ECEFF1';
    ctx.beginPath();
    ctx.arc(x + 20, y + 6, 9, Math.PI, 0, false);
    ctx.fill();

    // Óculos
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x + 15, y + 11, 5, 0, Math.PI * 2);
    ctx.arc(x + 25, y + 11, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 20, y + 11);
    ctx.lineTo(x + 20, y + 11);
    ctx.stroke();

    // Bengala
    ctx.strokeStyle = '#4E342E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 35, y + 30);
    ctx.lineTo(x + 38, y + 65);
    ctx.quadraticCurveTo(x + 40, y + 68, x + 35, y + 68);
    ctx.stroke();

    // Pernas
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(x + 10, y + 50, 8, 14);
    ctx.fillRect(x + 22, y + 50, 8, 14);
}

function drawWorkerCivilian(civ, bounce, time) {
    const x = civ.x, y = civ.y + bounce;

    // Corpo com uniforme
    ctx.fillStyle = '#FF8F00';
    ctx.beginPath();
    roundRect(ctx, x + 8, y + 22, 24, 28, 5);
    ctx.fill();

    // Faixas refletivas
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(x + 8, y + 32, 24, 4);
    ctx.fillRect(x + 8, y + 42, 24, 4);

    // Cabeça
    ctx.fillStyle = '#FFCC80';
    ctx.beginPath();
    ctx.arc(x + 20, y + 12, 11, 0, Math.PI * 2);
    ctx.fill();

    // Capacete
    ctx.fillStyle = '#FDD835';
    ctx.beginPath();
    ctx.arc(x + 20, y + 8, 13, Math.PI, 0, false);
    ctx.fill();
    ctx.fillRect(x + 7, y + 6, 26, 5);

    // Olhos
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x + 16, y + 12, 2, 0, Math.PI * 2);
    ctx.arc(x + 24, y + 12, 2, 0, Math.PI * 2);
    ctx.fill();

    // Expressão
    ctx.strokeStyle = '#795548';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 15, y + 18);
    ctx.lineTo(x + 25, y + 18);
    ctx.stroke();

    // Pernas
    ctx.fillStyle = '#1565C0';
    ctx.fillRect(x + 10, y + 48, 8, 16);
    ctx.fillRect(x + 22, y + 48, 8, 16);
}

function drawVillains() {
    const time = gameState.animationFrame * 0.08;

    villains.forEach(vil => {
        if (vil.defeated) return;

        ctx.save();

        switch(vil.type) {
            case 'microbot':
                drawMicrobotVillain(vil, time);
                break;
            case 'drone':
                drawDroneVillain(vil, time);
                break;
            case 'yokai_minion':
                drawYokaiMinion(vil, time);
                break;
        }

        ctx.restore();
    });
}

function drawMicrobotVillain(vil, time) {
    const x = vil.x, y = vil.y;
    const pulse = Math.sin(time * 3) * 3;

    // Aglomerado de microbots
    ctx.fillStyle = '#1A1A1A';
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + time;
        const r = 15 + Math.sin(time * 2 + i) * 5;
        const bx = x + 25 + Math.cos(angle) * r;
        const by = y + 30 + Math.sin(angle) * r;
        ctx.beginPath();
        ctx.arc(bx, by, 5 + Math.sin(time + i) * 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Centro brilhante vermelho
    ctx.shadowColor = '#FF0000';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(x + 25, y + 30, 8 + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Olho do mal
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(x + 25, y + 30, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawDroneVillain(vil, time) {
    const x = vil.x, y = vil.y;
    const hover = Math.sin(time * 5 + vil.animOffset) * 5;

    // Corpo do drone maligno
    const bodyGrad = ctx.createRadialGradient(x + 25, y + 30 + hover, 5, x + 25, y + 30 + hover, 25);
    bodyGrad.addColorStop(0, '#424242');
    bodyGrad.addColorStop(1, '#1A1A1A');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(x + 25, y + 30 + hover, 25, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hélices girando
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        const angle = time * 10 + (i * Math.PI / 2);
        ctx.save();
        ctx.translate(x + 25, y + 30 + hover);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(20, 0);
        ctx.stroke();
        ctx.restore();
    }

    // Olho vermelho
    ctx.shadowColor = '#FF0000';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(x + 25, y + 30 + hover, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Pupila
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x + 27, y + 30 + hover, 4, 0, Math.PI * 2);
    ctx.fill();

    // Laser de mira
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x + 25, y + 45 + hover);
    ctx.lineTo(x + 25, y + 120);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawYokaiMinion(vil, time) {
    const x = vil.x, y = vil.y;

    // Figura sombria (inspirada no Yokai)
    const cloakGrad = ctx.createLinearGradient(x, y, x, y + 60);
    cloakGrad.addColorStop(0, '#1A1A1A');
    cloakGrad.addColorStop(1, '#000000');
    ctx.fillStyle = cloakGrad;

    // Manto
    ctx.beginPath();
    ctx.moveTo(x + 25, y + 5);
    ctx.quadraticCurveTo(x + 50, y + 20, x + 45, y + 60);
    ctx.lineTo(x + 5, y + 60);
    ctx.quadraticCurveTo(x, y + 20, x + 25, y + 5);
    ctx.closePath();
    ctx.fill();

    // Máscara Kabuki
    ctx.fillStyle = '#ECEFF1';
    ctx.beginPath();
    ctx.ellipse(x + 25, y + 20, 12, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Detalhes vermelhos da máscara
    ctx.fillStyle = '#D32F2F';
    ctx.beginPath();
    ctx.moveTo(x + 18, y + 12);
    ctx.lineTo(x + 25, y + 8);
    ctx.lineTo(x + 32, y + 12);
    ctx.lineTo(x + 25, y + 16);
    ctx.closePath();
    ctx.fill();

    // Olhos ameaçadores
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(x + 20, y + 22, 4, 2, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 30, y + 22, 4, 2, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Brilho sinistro
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.arc(x + 20, y + 22, 1.5, 0, Math.PI * 2);
    ctx.arc(x + 30, y + 22, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Aura de microbots
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 8; i++) {
        const angle = time * 2 + (i / 8) * Math.PI * 2;
        const r = 30 + Math.sin(time * 3 + i) * 5;
        ctx.fillStyle = '#1A1A1A';
        ctx.beginPath();
        ctx.arc(x + 25 + Math.cos(angle) * r, y + 35 + Math.sin(angle) * r * 0.5, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

function updateObstacles(speed) {
    obstacles = obstacles.filter(obs => {
        obs.x -= speed;
        if (!obs.passed && obs.x + obs.width < player.x) {
            obs.passed = true;
            gameState.score += CONFIG.POINTS_PER_OBSTACLE;
            gameState.obstaclesPassed++;
        }
        return obs.x > -100;
    });
}

function updatePowerups(speed) {
    powerups = powerups.filter(pu => {
        pu.x -= speed * 0.8;
        return pu.x > -50 && !pu.collected;
    });
}

function checkCollisions() {
    const playerBox = {
        x: player.x + 15,
        y: player.y + 10,
        width: player.width - 30,
        height: player.height - 20
    };

    // Obstáculos
    for (const obs of obstacles) {
        if (isColliding(playerBox, obs)) {
            if (player.hasShield) {
                player.hasShield = false;
                document.getElementById('shield-indicator')?.classList.add('hidden');
                createExplosion(obs.x + obs.width / 2, obs.y + obs.height / 2);
                obstacles = obstacles.filter(o => o !== obs);
                gameState.obstaclesPassed++;
            } else if (player.isPowerActive) {
                createExplosion(obs.x + obs.width / 2, obs.y + obs.height / 2);
                obstacles = obstacles.filter(o => o !== obs);
                gameState.score += CONFIG.POINTS_PER_OBSTACLE;
                gameState.obstaclesPassed++;
            } else {
                gameOver('Você colidiu com um obstáculo!');
                return;
            }
        }
    }

    // Power-ups
    for (const pu of powerups) {
        if (isColliding(playerBox, pu) && !pu.collected) {
            collectPowerup(pu);
        }
    }
}

function isColliding(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x &&
           a.y < b.y + b.height && a.y + a.height > b.y;
}

function collectPowerup(powerup) {
    powerup.collected = true;
    gameState.powerupsCollected++;

    switch(powerup.type) {
        case 'speed':
            player.hasSpeedBoost = true;
            player.speedBoostTimer = 5000;
            document.getElementById('speed-indicator')?.classList.remove('hidden');
            break;
        case 'shield':
            player.hasShield = true;
            player.shieldTimer = 10000;
            document.getElementById('shield-indicator')?.classList.remove('hidden');
            break;
        case 'power':
            player.powerCharge = Math.min(100, player.powerCharge + 50);
            break;
        case 'points':
            gameState.score += CONFIG.POINTS_PER_POWERUP;
            break;
    }

    // Efeito
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: powerup.x + powerup.width / 2,
            y: powerup.y + powerup.height / 2,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            size: 5 + Math.random() * 10,
            life: 1,
            color: powerup.type === 'speed' ? '#F39C12' :
                   powerup.type === 'shield' ? '#3498DB' :
                   powerup.type === 'power' ? '#E74C3C' : '#9B59B6',
            type: 'collect'
        });
    }
}

function createExplosion(x, y) {
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            size: 5 + Math.random() * 20,
            life: 1,
            color: ['#FF0000', '#FF6600', '#FFAA00'][Math.floor(Math.random() * 3)],
            type: 'explosion'
        });
    }
}

function updateParticles() {
    particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.type === 'dust' || p.type === 'thruster') {
            p.vy += 0.1;
        }
        p.life -= 0.02;
        p.size *= 0.97;
        return p.life > 0 && p.size > 0.5;
    });
}

// ==========================================
// RENDERIZAÇÃO
// ==========================================

function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    drawBackground();
    drawBuildings();
    drawGround();
    drawCivilians();
    drawVillains();
    drawObstacles();
    drawPowerups();
    drawPlayer();
    drawParticles();
    drawEffects();
}

function drawBackground() {
    const level = getModifiedLevel(gameState.currentLevel);

    // Gradiente do céu
    const skyGrad = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
    level.skyColors.forEach((color, i) => {
        skyGrad.addColorStop(i / (level.skyColors.length - 1), color);
    });
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    // Estrelas
    if (level.hasStars) {
        backgroundElements.stars.forEach(star => {
            const brightness = 0.5 + Math.sin(star.twinkle) * 0.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // Nuvens
    backgroundElements.clouds.forEach(cloud => {
        ctx.fillStyle = level.cloudColor || 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.ellipse(cloud.x + i * 40, cloud.y, cloud.width / 3, 30, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Efeito de portal
    if (level.hasPortalEffect) {
        const time = gameState.animationFrame * 0.02;
        for (let i = 0; i < 5; i++) {
            ctx.strokeStyle = `rgba(${150 + i * 20}, 0, ${200 + i * 10}, ${0.3 - i * 0.05})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 3, 100 + i * 50 + Math.sin(time + i) * 20, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

function drawBuildings() {
    const level = getModifiedLevel(gameState.currentLevel);

    // Ordenar por camada
    const sortedBuildings = [...backgroundElements.buildings].sort((a, b) => a.layer - b.layer);

    sortedBuildings.forEach(building => {
        const baseY = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT;
        const alpha = 0.3 + building.layer * 0.2;

        // Corpo do prédio
        const buildingGrad = ctx.createLinearGradient(building.x, baseY - building.height, building.x, baseY);
        buildingGrad.addColorStop(0, level.buildingColors[building.layer] || '#1A1A2E');
        buildingGrad.addColorStop(1, '#0A0A15');
        ctx.fillStyle = buildingGrad;
        ctx.fillRect(building.x, baseY - building.height, building.width, building.height);

        // Janelas
        const windowRows = Math.floor(building.height / 25);
        const windowCols = building.windows;
        ctx.fillStyle = `rgba(255, 255, 200, ${0.1 + Math.random() * 0.2})`;

        for (let row = 0; row < windowRows; row++) {
            for (let col = 0; col < windowCols; col++) {
                if (Math.random() > 0.3) {
                    const wx = building.x + 10 + col * (building.width - 20) / windowCols;
                    const wy = baseY - building.height + 15 + row * 25;

                    // Janela acesa aleatoriamente
                    if (Math.random() > 0.5) {
                        ctx.fillStyle = `rgba(255, 255, 150, ${0.3 + Math.random() * 0.4})`;
                    } else {
                        ctx.fillStyle = 'rgba(50, 50, 80, 0.5)';
                    }
                    ctx.fillRect(wx, wy, 12, 15);
                }
            }
        }

        // Neon no topo
        if (building.layer === 2 && Math.random() > 0.7) {
            ctx.shadowColor = building.neonColor;
            ctx.shadowBlur = 15;
            ctx.fillStyle = building.neonColor;
            ctx.fillRect(building.x + 5, baseY - building.height - 5, building.width - 10, 3);
            ctx.shadowBlur = 0;
        }

        // Antena
        if (building.hasAntenna && building.layer === 2) {
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(building.x + building.width / 2, baseY - building.height);
            ctx.lineTo(building.x + building.width / 2, baseY - building.height - 30);
            ctx.stroke();

            // Luz piscando
            if (Math.sin(gameState.animationFrame * 0.1) > 0) {
                ctx.fillStyle = '#FF0000';
                ctx.shadowColor = '#FF0000';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(building.x + building.width / 2, baseY - building.height - 30, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    });
}

function drawGround() {
    const level = getModifiedLevel(gameState.currentLevel);
    const groundY = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT;

    // Chão principal
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, CONFIG.CANVAS_HEIGHT);
    groundGrad.addColorStop(0, level.groundTop);
    groundGrad.addColorStop(0.1, level.groundColor);
    groundGrad.addColorStop(1, '#000000');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, CONFIG.CANVAS_WIDTH, CONFIG.GROUND_HEIGHT);

    // Linha neon no topo
    ctx.strokeStyle = level.groundTop;
    ctx.shadowColor = level.groundTop;
    ctx.shadowBlur = 20;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(CONFIG.CANVAS_WIDTH, groundY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Linhas de grade
    ctx.strokeStyle = `${level.groundTop}33`;
    ctx.lineWidth = 1;
    for (let i = 0; i < CONFIG.CANVAS_WIDTH; i += 50) {
        const offset = (gameState.animationFrame * 3) % 50;
        ctx.beginPath();
        ctx.moveTo(i - offset, groundY);
        ctx.lineTo(i - offset - 30, CONFIG.CANVAS_HEIGHT);
        ctx.stroke();
    }
}

// ==========================================
// DESENHO DOS PERSONAGENS COM ANIMAÇÃO
// ==========================================

function drawPlayer() {
    const charId = gameState.selectedCharacter;
    const char = CHARACTERS[charId];
    if (!char) return;

    ctx.save();

    // Posição base com bob offset
    const px = player.x;
    const py = player.y - player.bobOffset;
    const pw = player.width;
    const ph = player.height;

    // Efeitos ativos
    if (player.hasShield) drawShieldEffect(px, py, pw, ph);
    if (player.hasSpeedBoost) drawSpeedTrail(charId, char, px, py, pw, ph);

    // Desenhar personagem específico
    switch(charId) {
        case 'hiro': drawHiroAnimated(char, px, py, pw, ph); break;
        case 'baymax': drawBaymaxAnimated(char, px, py, pw, ph); break;
        case 'gogo': drawGoGoAnimated(char, px, py, pw, ph); break;
        case 'wasabi': drawWasabiAnimated(char, px, py, pw, ph); break;
        case 'honey': drawHoneyAnimated(char, px, py, pw, ph); break;
        case 'fred': drawFredAnimated(char, px, py, pw, ph); break;
    }

    // Efeito de poder ativo
    if (player.isPowerActive) drawPowerAura(px, py, pw, ph, char);

    ctx.restore();
}

function drawShieldEffect(px, py, pw, ph) {
    const time = gameState.animationFrame * 0.05;
    ctx.beginPath();
    ctx.arc(px + pw/2, py + ph/2, pw * 0.8, 0, Math.PI * 2);
    const shieldGrad = ctx.createRadialGradient(px + pw/2, py + ph/2, pw * 0.3, px + pw/2, py + ph/2, pw * 0.8);
    shieldGrad.addColorStop(0, 'rgba(52, 152, 219, 0)');
    shieldGrad.addColorStop(0.7, `rgba(52, 152, 219, ${0.2 + Math.sin(time) * 0.1})`);
    shieldGrad.addColorStop(1, `rgba(100, 200, 255, ${0.5 + Math.sin(time * 2) * 0.2})`);
    ctx.fillStyle = shieldGrad;
    ctx.fill();
}

function drawSpeedTrail(charId, char, px, py, pw, ph) {
    ctx.globalAlpha = 0.2;
    for (let i = 3; i > 0; i--) {
        ctx.globalAlpha = 0.1 * (4 - i);
        switch(charId) {
            case 'hiro': drawHiroAnimated(char, px - i * 20, py, pw, ph); break;
            case 'baymax': drawBaymaxAnimated(char, px - i * 20, py, pw, ph); break;
            case 'gogo': drawGoGoAnimated(char, px - i * 20, py, pw, ph); break;
            case 'wasabi': drawWasabiAnimated(char, px - i * 20, py, pw, ph); break;
            case 'honey': drawHoneyAnimated(char, px - i * 20, py, pw, ph); break;
            case 'fred': drawFredAnimated(char, px - i * 20, py, pw, ph); break;
        }
    }
    ctx.globalAlpha = 1;
}

function drawPowerAura(px, py, pw, ph, char) {
    const time = gameState.animationFrame * 0.1;
    for (let i = 0; i < 12; i++) {
        const angle = time + (i / 12) * Math.PI * 2;
        const dist = pw * 0.6 + Math.sin(time * 2 + i) * 10;
        ctx.beginPath();
        ctx.arc(px + pw/2 + Math.cos(angle) * dist, py + ph/2 + Math.sin(angle) * dist, 6, 0, Math.PI * 2);
        ctx.fillStyle = char.powerColor || '#F39C12';
        ctx.shadowColor = char.powerColor || '#F39C12';
        ctx.shadowBlur = 15;
        ctx.fill();
    }
    ctx.shadowBlur = 0;
}

// HIRO HAMADA - Ultra Detalhado
function drawHiroAnimated(char, px, py, pw, ph) {
    const legAngle = player.legAngle;
    const armAngle = player.armAngle;
    const breathe = Math.sin(gameState.animationFrame * 0.08) * 1.5;
    const time = gameState.animationFrame * 0.05;

    // Sombra dinâmica
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(px + pw/2, py + ph + 5, pw/2.2 + Math.abs(legAngle) * 5, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // === PERNAS com animação detalhada ===
    // Perna esquerda
    ctx.save();
    ctx.translate(px + pw/2 - 14, py + ph - 38);
    ctx.rotate(legAngle);

    // Coxa
    const legGradL = ctx.createLinearGradient(-10, 0, 10, 0);
    legGradL.addColorStop(0, char.armorDark);
    legGradL.addColorStop(0.5, char.armorColor);
    legGradL.addColorStop(1, char.armorDark);
    ctx.fillStyle = legGradL;
    ctx.beginPath();
    roundRect(ctx, -9, 0, 18, 20, 4);
    ctx.fill();

    // Joelheira
    ctx.fillStyle = char.armorAccent || char.armorLight;
    ctx.beginPath();
    ctx.ellipse(0, 18, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Canela
    ctx.fillStyle = char.armorDark;
    ctx.beginPath();
    roundRect(ctx, -8, 20, 16, 18, 3);
    ctx.fill();

    // Bota tecnológica
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    roundRect(ctx, -10, 35, 20, 12, 4);
    ctx.fill();
    // Detalhe da bota
    ctx.fillStyle = char.armorColor;
    ctx.fillRect(-8, 37, 16, 3);
    // Sola com grip
    ctx.fillStyle = '#333';
    ctx.fillRect(-11, 44, 22, 4);
    ctx.restore();

    // Perna direita
    ctx.save();
    ctx.translate(px + pw/2 + 14, py + ph - 38);
    ctx.rotate(-legAngle);

    const legGradR = ctx.createLinearGradient(-10, 0, 10, 0);
    legGradR.addColorStop(0, char.armorDark);
    legGradR.addColorStop(0.5, char.armorColor);
    legGradR.addColorStop(1, char.armorDark);
    ctx.fillStyle = legGradR;
    ctx.beginPath();
    roundRect(ctx, -9, 0, 18, 20, 4);
    ctx.fill();

    ctx.fillStyle = char.armorAccent || char.armorLight;
    ctx.beginPath();
    ctx.ellipse(0, 18, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = char.armorDark;
    ctx.beginPath();
    roundRect(ctx, -8, 20, 16, 18, 3);
    ctx.fill();

    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    roundRect(ctx, -10, 35, 20, 12, 4);
    ctx.fill();
    ctx.fillStyle = char.armorColor;
    ctx.fillRect(-8, 37, 16, 3);
    ctx.fillStyle = '#333';
    ctx.fillRect(-11, 44, 22, 4);
    ctx.restore();

    // === CORPO/TORSO detalhado ===
    const bodyGrad = ctx.createLinearGradient(px + 8, py + 22 + breathe, px + pw - 8, py + ph - 38);
    bodyGrad.addColorStop(0, char.armorLight);
    bodyGrad.addColorStop(0.3, char.armorColor);
    bodyGrad.addColorStop(0.7, char.armorColor);
    bodyGrad.addColorStop(1, char.armorDark);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    roundRect(ctx, px + 8, py + 22 + breathe, pw - 16, ph - 60, 10);
    ctx.fill();

    // Placa peitoral central
    ctx.fillStyle = char.armorDark;
    ctx.beginPath();
    ctx.moveTo(px + pw/2, py + 28 + breathe);
    ctx.lineTo(px + pw/2 + 12, py + 35 + breathe);
    ctx.lineTo(px + pw/2 + 10, py + 55 + breathe);
    ctx.lineTo(px + pw/2, py + 60 + breathe);
    ctx.lineTo(px + pw/2 - 10, py + 55 + breathe);
    ctx.lineTo(px + pw/2 - 12, py + 35 + breathe);
    ctx.closePath();
    ctx.fill();

    // Linha de energia central
    ctx.strokeStyle = char.helmetVisor || '#00D4FF';
    ctx.shadowColor = char.helmetVisor || '#00D4FF';
    ctx.shadowBlur = 8;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px + pw/2, py + 30 + breathe);
    ctx.lineTo(px + pw/2, py + 58 + breathe);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Detalhes laterais da armadura
    ctx.fillStyle = char.armorAccent || char.armorLight;
    ctx.fillRect(px + 12, py + 35 + breathe, 6, 20);
    ctx.fillRect(px + pw - 18, py + 35 + breathe, 6, 20);

    // === BRAÇOS com animação ===
    // Braço esquerdo
    ctx.save();
    ctx.translate(px + 3, py + 30 + breathe);
    ctx.rotate(armAngle);

    // Ombro
    ctx.fillStyle = char.armorColor;
    ctx.beginPath();
    ctx.arc(0, 5, 10, 0, Math.PI * 2);
    ctx.fill();

    // Braço superior
    const armGradL = ctx.createLinearGradient(-8, 5, 8, 5);
    armGradL.addColorStop(0, char.armorDark);
    armGradL.addColorStop(0.5, char.armorColor);
    armGradL.addColorStop(1, char.armorDark);
    ctx.fillStyle = armGradL;
    ctx.fillRect(-6, 8, 12, 18);

    // Cotovelo
    ctx.fillStyle = char.armorAccent || char.armorLight;
    ctx.beginPath();
    ctx.arc(0, 26, 6, 0, Math.PI * 2);
    ctx.fill();

    // Antebraço
    ctx.fillStyle = char.armorDark;
    ctx.fillRect(-5, 28, 10, 15);

    // Luva/Mão
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.arc(0, 46, 9, 0, Math.PI * 2);
    ctx.fill();
    // Dedos
    ctx.fillStyle = '#2A2A2A';
    for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.ellipse(i * 5, 52, 3, 5, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // Braço direito
    ctx.save();
    ctx.translate(px + pw - 3, py + 30 + breathe);
    ctx.rotate(-armAngle);

    ctx.fillStyle = char.armorColor;
    ctx.beginPath();
    ctx.arc(0, 5, 10, 0, Math.PI * 2);
    ctx.fill();

    const armGradR = ctx.createLinearGradient(-8, 5, 8, 5);
    armGradR.addColorStop(0, char.armorDark);
    armGradR.addColorStop(0.5, char.armorColor);
    armGradR.addColorStop(1, char.armorDark);
    ctx.fillStyle = armGradR;
    ctx.fillRect(-6, 8, 12, 18);

    ctx.fillStyle = char.armorAccent || char.armorLight;
    ctx.beginPath();
    ctx.arc(0, 26, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = char.armorDark;
    ctx.fillRect(-5, 28, 10, 15);

    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.arc(0, 46, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2A2A2A';
    for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.ellipse(i * 5, 52, 3, 5, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // === PESCOÇO ===
    ctx.fillStyle = char.skinShadow || char.skinColor;
    ctx.fillRect(px + pw/2 - 8, py + 18, 16, 12);

    // === CABEÇA detalhada ===
    // Base da cabeça
    const headGrad = ctx.createRadialGradient(px + pw/2 - 5, py + 10, 5, px + pw/2, py + 14, 22);
    headGrad.addColorStop(0, char.skinColor);
    headGrad.addColorStop(1, char.skinShadow || '#D4A574');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(px + pw/2, py + 14, 22, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Orelhas
    ctx.fillStyle = char.skinShadow || '#D4A574';
    ctx.beginPath();
    ctx.ellipse(px + pw/2 - 21, py + 14, 5, 8, -0.2, 0, Math.PI * 2);
    ctx.ellipse(px + pw/2 + 21, py + 14, 5, 8, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Cabelo espetado estilo anime - muito mais detalhado
    ctx.fillStyle = char.hairColor;
    ctx.beginPath();
    // Base do cabelo
    ctx.moveTo(px + 5, py + 20);
    // Mechas espetadas
    ctx.lineTo(px + 12, py - 5);
    ctx.lineTo(px + 18, py + 10);
    ctx.lineTo(px + 22, py - 12);
    ctx.lineTo(px + 28, py + 5);
    ctx.lineTo(px + pw/2 - 5, py - 15);
    ctx.lineTo(px + pw/2 + 5, py - 18);
    ctx.lineTo(px + pw - 28, py + 5);
    ctx.lineTo(px + pw - 22, py - 10);
    ctx.lineTo(px + pw - 18, py + 8);
    ctx.lineTo(px + pw - 12, py - 3);
    ctx.lineTo(px + pw - 5, py + 20);
    ctx.arc(px + pw/2, py + 14, 22, 0, -Math.PI, true);
    ctx.fill();

    // Brilhos no cabelo
    ctx.fillStyle = char.hairHighlight || '#3D3D3D';
    ctx.beginPath();
    ctx.moveTo(px + 20, py);
    ctx.lineTo(px + 24, py - 8);
    ctx.lineTo(px + 28, py + 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(px + pw - 20, py + 2);
    ctx.lineTo(px + pw - 24, py - 6);
    ctx.lineTo(px + pw - 28, py + 4);
    ctx.fill();

    // Olhos expressivos
    // Branco dos olhos
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(px + pw/2 - 9, py + 12, 8, 9, -0.1, 0, Math.PI * 2);
    ctx.ellipse(px + pw/2 + 9, py + 12, 8, 9, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Íris
    ctx.fillStyle = char.eyeColor || '#5D4037';
    ctx.beginPath();
    ctx.arc(px + pw/2 - 7, py + 13, 5, 0, Math.PI * 2);
    ctx.arc(px + pw/2 + 11, py + 13, 5, 0, Math.PI * 2);
    ctx.fill();

    // Pupilas
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.arc(px + pw/2 - 6, py + 13, 2.5, 0, Math.PI * 2);
    ctx.arc(px + pw/2 + 12, py + 13, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Brilhos nos olhos (múltiplos)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(px + pw/2 - 8, py + 11, 2, 0, Math.PI * 2);
    ctx.arc(px + pw/2 + 10, py + 11, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px + pw/2 - 5, py + 15, 1, 0, Math.PI * 2);
    ctx.arc(px + pw/2 + 13, py + 15, 1, 0, Math.PI * 2);
    ctx.fill();

    // Sobrancelhas expressivas
    ctx.strokeStyle = char.hairColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(px + pw/2 - 16, py + 2);
    ctx.quadraticCurveTo(px + pw/2 - 10, py + 1, px + pw/2 - 4, py + 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px + pw/2 + 4, py + 4);
    ctx.quadraticCurveTo(px + pw/2 + 10, py + 1, px + pw/2 + 16, py + 2);
    ctx.stroke();

    // Nariz sutil
    ctx.strokeStyle = char.skinShadow || '#D4A574';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px + pw/2, py + 15);
    ctx.lineTo(px + pw/2 - 2, py + 22);
    ctx.stroke();

    // Boca/Sorriso confiante
    ctx.strokeStyle = '#B87070';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(px + pw/2, py + 26, 7, 0.15, Math.PI - 0.15);
    ctx.stroke();

    // Efeito de microbots quando poder ativo
    if (player.isPowerActive) {
        ctx.fillStyle = char.microbotsColor || '#2C2C2C';
        for (let i = 0; i < 20; i++) {
            const angle = time * 3 + i * 0.3;
            const dist = 30 + Math.sin(angle * 2) * 15;
            const bx = px + pw/2 + Math.cos(angle) * dist;
            const by = py + ph/2 + Math.sin(angle) * dist;
            ctx.beginPath();
            ctx.rect(bx - 2, by - 2, 4, 4);
            ctx.fill();
        }
    }
}

// BAYMAX - Ultra Detalhado com Armadura
function drawBaymaxAnimated(char, px, py, pw, ph) {
    const legAngle = player.legAngle * 0.4;
    const armAngle = player.armAngle * 0.4;
    const inflateEffect = 1 + Math.sin(gameState.animationFrame * 0.04) * 0.025;
    const breathe = Math.sin(gameState.animationFrame * 0.06) * 2;
    const time = gameState.animationFrame * 0.05;

    // Sombra grande
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(px + pw/2, py + ph + 8, pw/1.8, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // === PERNAS robustas ===
    // Perna esquerda
    ctx.save();
    ctx.translate(px + pw/2 - 22, py + ph - 25);
    ctx.rotate(legAngle * 0.4);

    // Coxa insuflada
    const legGradL = ctx.createRadialGradient(0, 8, 5, 0, 10, 20);
    legGradL.addColorStop(0, char.bodyLight);
    legGradL.addColorStop(0.7, char.bodyColor);
    legGradL.addColorStop(1, char.bodyShadow || char.bodyDark);
    ctx.fillStyle = legGradL;
    ctx.beginPath();
    ctx.ellipse(0, 12, 18 * inflateEffect, 22 * inflateEffect, 0, 0, Math.PI * 2);
    ctx.fill();

    // Proteção de joelho vermelha
    ctx.fillStyle = char.armorColor;
    ctx.beginPath();
    ctx.ellipse(0, 22, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = char.armorDark;
    ctx.beginPath();
    ctx.arc(0, 22, 5, 0, Math.PI * 2);
    ctx.fill();

    // Pé arredondado
    ctx.fillStyle = char.bodyDark;
    ctx.beginPath();
    ctx.ellipse(0, 38, 16 * inflateEffect, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Perna direita
    ctx.save();
    ctx.translate(px + pw/2 + 22, py + ph - 25);
    ctx.rotate(-legAngle * 0.4);

    const legGradR = ctx.createRadialGradient(0, 8, 5, 0, 10, 20);
    legGradR.addColorStop(0, char.bodyLight);
    legGradR.addColorStop(0.7, char.bodyColor);
    legGradR.addColorStop(1, char.bodyShadow || char.bodyDark);
    ctx.fillStyle = legGradR;
    ctx.beginPath();
    ctx.ellipse(0, 12, 18 * inflateEffect, 22 * inflateEffect, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = char.armorColor;
    ctx.beginPath();
    ctx.ellipse(0, 22, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = char.armorDark;
    ctx.beginPath();
    ctx.arc(0, 22, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = char.bodyDark;
    ctx.beginPath();
    ctx.ellipse(0, 38, 16 * inflateEffect, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // === CORPO oval grande insuflado ===
    const bodyGrad = ctx.createRadialGradient(px + pw/2 - 10, py + ph/2 - 10 + breathe, 15, px + pw/2, py + ph/2 + 5 + breathe, pw * 0.65);
    bodyGrad.addColorStop(0, '#FFFFFF');
    bodyGrad.addColorStop(0.5, char.bodyColor);
    bodyGrad.addColorStop(0.85, char.bodyDark);
    bodyGrad.addColorStop(1, char.bodyShadow || '#C8C8C8');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(px + pw/2, py + ph/2 + 5 + breathe, (pw/2 + 8) * inflateEffect, (ph/2 - 5) * inflateEffect, 0, 0, Math.PI * 2);
    ctx.fill();

    // Linha de costura/junção vertical
    ctx.strokeStyle = 'rgba(200,200,200,0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(px + pw/2, py + 35 + breathe);
    ctx.lineTo(px + pw/2, py + ph - 30 + breathe);
    ctx.stroke();
    ctx.setLineDash([]);

    // === ARMADURA PEITORAL VERMELHA ===
    // Placa principal
    const armorGrad = ctx.createLinearGradient(px + pw/2 - 25, py + ph/2 - 5 + breathe, px + pw/2 + 25, py + ph/2 + 25 + breathe);
    armorGrad.addColorStop(0, char.armorLight);
    armorGrad.addColorStop(0.5, char.armorColor);
    armorGrad.addColorStop(1, char.armorDark);
    ctx.fillStyle = armorGrad;
    ctx.beginPath();
    ctx.moveTo(px + pw/2, py + 38 + breathe);
    ctx.lineTo(px + pw/2 + 28, py + 50 + breathe);
    ctx.lineTo(px + pw/2 + 25, py + 75 + breathe);
    ctx.lineTo(px + pw/2, py + 85 + breathe);
    ctx.lineTo(px + pw/2 - 25, py + 75 + breathe);
    ctx.lineTo(px + pw/2 - 28, py + 50 + breathe);
    ctx.closePath();
    ctx.fill();

    // Borda da armadura
    ctx.strokeStyle = char.armorDark;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Círculo central de energia (reator)
    const reactorGrad = ctx.createRadialGradient(px + pw/2, py + ph/2 + 8 + breathe, 3, px + pw/2, py + ph/2 + 8 + breathe, 15);
    reactorGrad.addColorStop(0, '#FFFFFF');
    reactorGrad.addColorStop(0.3, char.armorAccent || '#FF8A80');
    reactorGrad.addColorStop(0.7, char.armorColor);
    reactorGrad.addColorStop(1, char.armorDark);
    ctx.fillStyle = reactorGrad;
    ctx.beginPath();
    ctx.arc(px + pw/2, py + ph/2 + 8 + breathe, 14, 0, Math.PI * 2);
    ctx.fill();

    // Brilho pulsante do reator
    const pulse = 0.5 + Math.sin(time * 2) * 0.3;
    ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
    ctx.beginPath();
    ctx.arc(px + pw/2, py + ph/2 + 8 + breathe, 8, 0, Math.PI * 2);
    ctx.fill();

    // Linhas de energia do reator
    ctx.strokeStyle = `rgba(255, 138, 128, ${pulse})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        const angle = time + i * Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(px + pw/2 + Math.cos(angle) * 8, py + ph/2 + 8 + breathe + Math.sin(angle) * 8);
        ctx.lineTo(px + pw/2 + Math.cos(angle) * 14, py + ph/2 + 8 + breathe + Math.sin(angle) * 14);
        ctx.stroke();
    }

    // === BRAÇOS insufláveis com armadura ===
    // Braço esquerdo
    ctx.save();
    ctx.translate(px - 8, py + ph/2 + breathe);
    ctx.rotate(armAngle * 0.5);

    // Ombro
    ctx.fillStyle = char.armorColor;
    ctx.beginPath();
    ctx.ellipse(5, -5, 14, 12, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Braço insuflado
    const armGradL = ctx.createRadialGradient(0, 15, 5, 0, 15, 25);
    armGradL.addColorStop(0, char.bodyLight);
    armGradL.addColorStop(0.8, char.bodyColor);
    armGradL.addColorStop(1, char.bodyShadow || char.bodyDark);
    ctx.fillStyle = armGradL;
    ctx.beginPath();
    ctx.ellipse(0, 15, 18 * inflateEffect, 28 * inflateEffect, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Mão arredondada
    ctx.fillStyle = char.bodyDark;
    ctx.beginPath();
    ctx.ellipse(-5, 42, 14 * inflateEffect, 12 * inflateEffect, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // Dedos
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse(-12 + i * 5, 50, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // Braço direito
    ctx.save();
    ctx.translate(px + pw + 8, py + ph/2 + breathe);
    ctx.rotate(-armAngle * 0.5);

    ctx.fillStyle = char.armorColor;
    ctx.beginPath();
    ctx.ellipse(-5, -5, 14, 12, 0.3, 0, Math.PI * 2);
    ctx.fill();

    const armGradR = ctx.createRadialGradient(0, 15, 5, 0, 15, 25);
    armGradR.addColorStop(0, char.bodyLight);
    armGradR.addColorStop(0.8, char.bodyColor);
    armGradR.addColorStop(1, char.bodyShadow || char.bodyDark);
    ctx.fillStyle = armGradR;
    ctx.beginPath();
    ctx.ellipse(0, 15, 18 * inflateEffect, 28 * inflateEffect, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = char.bodyDark;
    ctx.beginPath();
    ctx.ellipse(5, 42, 14 * inflateEffect, 12 * inflateEffect, 0.3, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse(12 - i * 5, 50, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // === CABEÇA característica do Baymax ===
    const headGrad = ctx.createRadialGradient(px + pw/2 - 5, py + 15, 8, px + pw/2, py + 20, 28);
    headGrad.addColorStop(0, '#FFFFFF');
    headGrad.addColorStop(0.7, char.bodyColor);
    headGrad.addColorStop(1, char.bodyDark);
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(px + pw/2, py + 20, 28 * inflateEffect, 22 * inflateEffect, 0, 0, Math.PI * 2);
    ctx.fill();

    // Linha conectora dos olhos (icônica)
    ctx.strokeStyle = char.eyeConnect || '#37474F';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(px + pw/2 - 20, py + 18);
    ctx.lineTo(px + pw/2 + 20, py + 18);
    ctx.stroke();

    // Olhos do Baymax (círculos conectados)
    ctx.fillStyle = char.eyeColor || '#2C3E50';
    ctx.beginPath();
    ctx.arc(px + pw/2 - 16, py + 18, 8, 0, Math.PI * 2);
    ctx.arc(px + pw/2 + 16, py + 18, 8, 0, Math.PI * 2);
    ctx.fill();

    // Brilho nos olhos
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(px + pw/2 - 18, py + 16, 3, 0, Math.PI * 2);
    ctx.arc(px + pw/2 + 14, py + 16, 3, 0, Math.PI * 2);
    ctx.fill();

    // === PROPULSORES quando voando ===
    if (player.isFlying) {
        // Propulsores nas costas e pés
        const thrusterPositions = [
            {x: px + pw/2 - 25, y: py + ph - 5},
            {x: px + pw/2, y: py + ph + 5},
            {x: px + pw/2 + 25, y: py + ph - 5}
        ];

        thrusterPositions.forEach((pos, idx) => {
            const flameHeight = 40 + Math.sin(time * 8 + idx * 2) * 20;
            const flameWidth = 12 + Math.sin(time * 6 + idx) * 5;

            // Chama externa
            const flameGrad = ctx.createLinearGradient(pos.x, pos.y, pos.x, pos.y + flameHeight);
            flameGrad.addColorStop(0, char.thrusterCore || '#FFEB3B');
            flameGrad.addColorStop(0.3, char.thrusterColor || '#FF6D00');
            flameGrad.addColorStop(0.7, char.armorColor);
            flameGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');

            ctx.fillStyle = flameGrad;
            ctx.beginPath();
            ctx.moveTo(pos.x - flameWidth, pos.y);
            ctx.quadraticCurveTo(pos.x - flameWidth/2, pos.y + flameHeight * 0.7, pos.x, pos.y + flameHeight);
            ctx.quadraticCurveTo(pos.x + flameWidth/2, pos.y + flameHeight * 0.7, pos.x + flameWidth, pos.y);
            ctx.closePath();
            ctx.fill();

            // Núcleo da chama
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.ellipse(pos.x, pos.y + 5, 6, 10, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        // Efeito de brilho
        ctx.shadowColor = char.thrusterColor || '#FF6D00';
        ctx.shadowBlur = 30;
        ctx.fillStyle = 'rgba(255, 150, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(px + pw/2, py + ph + 20, 50, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    // Mensagem "Ba-la-la-la-la" quando usando poder
    if (player.isPowerActive) {
        ctx.fillStyle = '#2C3E50';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        const textY = py - 15 + Math.sin(time * 5) * 3;
        ctx.fillText('Ba-la-la-la-la', px + pw/2, textY);
    }
}

// GO GO TOMAGO - Ultra Detalhada com Patins e Discos
function drawGoGoAnimated(char, px, py, pw, ph) {
    const legAngle = player.legAngle;
    const armAngle = player.armAngle;
    const wheelSpin = gameState.animationFrame * 0.8;
    const discSpin = gameState.animationFrame * 0.3;
    const time = gameState.animationFrame * 0.05;
    const speedLines = player.hasSpeedBoost;

    // Sombra dinâmica
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(px + pw/2, py + ph + 8, pw/2.2 + Math.abs(legAngle) * 8, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Linhas de velocidade (quando tem boost)
    if (speedLines) {
        ctx.strokeStyle = 'rgba(253, 216, 53, 0.5)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            const yOffset = py + 20 + i * 20;
            ctx.beginPath();
            ctx.moveTo(px - 30 - Math.random() * 20, yOffset);
            ctx.lineTo(px - 60 - Math.random() * 30, yOffset);
            ctx.stroke();
        }
    }

    // === PERNAS com patins magnéticos detalhados ===
    // Perna esquerda
    ctx.save();
    ctx.translate(px + pw/2 - 13, py + ph - 42);
    ctx.rotate(legAngle);

    // Coxa (suit preto)
    const legGradL = ctx.createLinearGradient(-8, 0, 8, 0);
    legGradL.addColorStop(0, char.suitAccent || '#37474F');
    legGradL.addColorStop(0.5, char.suitColor);
    legGradL.addColorStop(1, char.suitAccent || '#37474F');
    ctx.fillStyle = legGradL;
    ctx.beginPath();
    roundRect(ctx, -8, 0, 16, 18, 4);
    ctx.fill();

    // Joelheira amarela
    ctx.fillStyle = char.armorColor;
    ctx.beginPath();
    ctx.ellipse(0, 16, 9, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = char.armorDark;
    ctx.beginPath();
    ctx.arc(0, 16, 4, 0, Math.PI * 2);
    ctx.fill();

    // Canela
    ctx.fillStyle = char.suitColor;
    ctx.beginPath();
    roundRect(ctx, -7, 20, 14, 16, 3);
    ctx.fill();

    // Patim magnético detalhado
    ctx.fillStyle = char.armorColor;
    ctx.beginPath();
    roundRect(ctx, -12, 34, 24, 10, 5);
    ctx.fill();

    // Detalhe do patim
    ctx.fillStyle = char.armorDark;
    ctx.fillRect(-10, 36, 20, 3);

    // Roda magnética com efeito de giro
    ctx.fillStyle = char.wheelColor || '#212121';
    ctx.beginPath();
    ctx.arc(0, 48, 12, 0, Math.PI * 2);
    ctx.fill();

    // Aro da roda com brilho
    const wheelGrad = ctx.createRadialGradient(0, 48, 6, 0, 48, 12);
    wheelGrad.addColorStop(0, char.armorDark);
    wheelGrad.addColorStop(0.7, char.armorColor);
    wheelGrad.addColorStop(1, char.armorLight);
    ctx.strokeStyle = wheelGrad;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 48, 10, 0, Math.PI * 2);
    ctx.stroke();

    // Raios da roda girando
    ctx.strokeStyle = char.armorColor;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        const angle = wheelSpin + i * Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 4, 48 + Math.sin(angle) * 4);
        ctx.lineTo(Math.cos(angle) * 9, 48 + Math.sin(angle) * 9);
        ctx.stroke();
    }

    // Brilho magnético
    ctx.shadowColor = char.discGlow || '#FFFF00';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = char.discGlow || '#FFFF00';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 48, 13, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    // Perna direita (similar)
    ctx.save();
    ctx.translate(px + pw/2 + 13, py + ph - 42);
    ctx.rotate(-legAngle);

    const legGradR = ctx.createLinearGradient(-8, 0, 8, 0);
    legGradR.addColorStop(0, char.suitAccent || '#37474F');
    legGradR.addColorStop(0.5, char.suitColor);
    legGradR.addColorStop(1, char.suitAccent || '#37474F');
    ctx.fillStyle = legGradR;
    ctx.beginPath();
    roundRect(ctx, -8, 0, 16, 18, 4);
    ctx.fill();

    ctx.fillStyle = char.armorColor;
    ctx.beginPath();
    ctx.ellipse(0, 16, 9, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = char.armorDark;
    ctx.beginPath();
    ctx.arc(0, 16, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = char.suitColor;
    ctx.beginPath();
    roundRect(ctx, -7, 20, 14, 16, 3);
    ctx.fill();

    ctx.fillStyle = char.armorColor;
    ctx.beginPath();
    roundRect(ctx, -12, 34, 24, 10, 5);
    ctx.fill();
    ctx.fillStyle = char.armorDark;
    ctx.fillRect(-10, 36, 20, 3);

    ctx.fillStyle = char.wheelColor || '#212121';
    ctx.beginPath();
    ctx.arc(0, 48, 12, 0, Math.PI * 2);
    ctx.fill();

    const wheelGrad2 = ctx.createRadialGradient(0, 48, 6, 0, 48, 12);
    wheelGrad2.addColorStop(0, char.armorDark);
    wheelGrad2.addColorStop(0.7, char.armorColor);
    wheelGrad2.addColorStop(1, char.armorLight);
    ctx.strokeStyle = wheelGrad2;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 48, 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = char.armorColor;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        const angle = -wheelSpin + i * Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 4, 48 + Math.sin(angle) * 4);
        ctx.lineTo(Math.cos(angle) * 9, 48 + Math.sin(angle) * 9);
        ctx.stroke();
    }

    ctx.shadowColor = char.discGlow || '#FFFF00';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = char.discGlow || '#FFFF00';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 48, 13, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    // === CORPO com armadura amarela e detalhes pretos ===
    const bodyGrad = ctx.createLinearGradient(px + 10, py + 25, px + pw - 10, py + ph - 47);
    bodyGrad.addColorStop(0, char.armorLight);
    bodyGrad.addColorStop(0.3, char.armorColor);
    bodyGrad.addColorStop(0.7, char.armorColor);
    bodyGrad.addColorStop(1, char.armorDark);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    roundRect(ctx, px + 10, py + 25, pw - 20, ph - 72, 10);
    ctx.fill();

    // Faixas pretas horizontais (estilo Go Go)
    ctx.fillStyle = char.suitColor;
    ctx.fillRect(px + 13, py + 32, pw - 26, 5);
    ctx.fillRect(px + 13, py + 45, pw - 26, 5);
    ctx.fillRect(px + 13, py + 58, pw - 26, 5);

    // Detalhe central
    ctx.fillStyle = char.suitColor;
    ctx.fillRect(px + pw/2 - 3, py + 28, 6, 40);

    // === BRAÇOS com discos magnéticos ===
    // Braço esquerdo
    ctx.save();
    ctx.translate(px + 2, py + 35);
    ctx.rotate(armAngle);

    // Ombro
    ctx.fillStyle = char.armorColor;
    ctx.beginPath();
    ctx.arc(0, 3, 9, 0, Math.PI * 2);
    ctx.fill();

    // Braço
    ctx.fillStyle = char.suitColor;
    ctx.fillRect(-5, 6, 10, 28);

    // Antebraço amarelo
    ctx.fillStyle = char.armorColor;
    ctx.beginPath();
    roundRect(ctx, -6, 28, 12, 12, 4);
    ctx.fill();

    // Disco magnético detalhado
    ctx.shadowColor = char.discGlow || '#FFFF00';
    ctx.shadowBlur = 15;

    // Disco externo
    const discGradL = ctx.createRadialGradient(-12, 45, 5, -12, 45, 18);
    discGradL.addColorStop(0, char.armorLight);
    discGradL.addColorStop(0.5, char.armorColor);
    discGradL.addColorStop(1, char.armorDark);
    ctx.fillStyle = discGradL;
    ctx.beginPath();
    ctx.arc(-12, 45, 18, 0, Math.PI * 2);
    ctx.fill();

    // Anéis do disco
    ctx.strokeStyle = char.suitColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-12, 45, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-12, 45, 10, 0, Math.PI * 2);
    ctx.stroke();

    // Centro do disco
    ctx.fillStyle = char.suitColor;
    ctx.beginPath();
    ctx.arc(-12, 45, 6, 0, Math.PI * 2);
    ctx.fill();

    // Linhas de energia girando
    ctx.strokeStyle = char.discGlow || '#FFFF00';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
        const angle = discSpin + i * Math.PI / 3;
        ctx.beginPath();
        ctx.moveTo(-12 + Math.cos(angle) * 7, 45 + Math.sin(angle) * 7);
        ctx.lineTo(-12 + Math.cos(angle) * 16, 45 + Math.sin(angle) * 16);
        ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    // Braço direito
    ctx.save();
    ctx.translate(px + pw - 2, py + 35);
    ctx.rotate(-armAngle);

    ctx.fillStyle = char.armorColor;
    ctx.beginPath();
    ctx.arc(0, 3, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = char.suitColor;
    ctx.fillRect(-5, 6, 10, 28);

    ctx.fillStyle = char.armorColor;
    ctx.beginPath();
    roundRect(ctx, -6, 28, 12, 12, 4);
    ctx.fill();

    ctx.shadowColor = char.discGlow || '#FFFF00';
    ctx.shadowBlur = 15;

    const discGradR = ctx.createRadialGradient(12, 45, 5, 12, 45, 18);
    discGradR.addColorStop(0, char.armorLight);
    discGradR.addColorStop(0.5, char.armorColor);
    discGradR.addColorStop(1, char.armorDark);
    ctx.fillStyle = discGradR;
    ctx.beginPath();
    ctx.arc(12, 45, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = char.suitColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(12, 45, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(12, 45, 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = char.suitColor;
    ctx.beginPath();
    ctx.arc(12, 45, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = char.discGlow || '#FFFF00';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
        const angle = -discSpin + i * Math.PI / 3;
        ctx.beginPath();
        ctx.moveTo(12 + Math.cos(angle) * 7, 45 + Math.sin(angle) * 7);
        ctx.lineTo(12 + Math.cos(angle) * 16, 45 + Math.sin(angle) * 16);
        ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    // === PESCOÇO ===
    ctx.fillStyle = char.skinShadow || char.skinColor;
    ctx.fillRect(px + pw/2 - 6, py + 18, 12, 10);

    // === CABEÇA detalhada ===
    const headGrad = ctx.createRadialGradient(px + pw/2 - 3, py + 12, 5, px + pw/2, py + 15, 19);
    headGrad.addColorStop(0, char.skinColor);
    headGrad.addColorStop(1, char.skinShadow || '#D4A574');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(px + pw/2, py + 15, 19, 17, 0, 0, Math.PI * 2);
    ctx.fill();

    // Orelhas
    ctx.fillStyle = char.skinShadow || '#D4A574';
    ctx.beginPath();
    ctx.ellipse(px + pw/2 - 18, py + 15, 4, 6, -0.2, 0, Math.PI * 2);
    ctx.ellipse(px + pw/2 + 18, py + 15, 4, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Cabelo curto preto estilizado
    ctx.fillStyle = char.hairColor;
    ctx.beginPath();
    ctx.moveTo(px + 8, py + 18);
    ctx.lineTo(px + 5, py + 5);
    ctx.lineTo(px + 15, py + 10);
    ctx.lineTo(px + 20, py);
    ctx.lineTo(px + pw/2, py + 5);
    ctx.lineTo(px + pw - 20, py);
    ctx.lineTo(px + pw - 15, py + 10);
    ctx.lineTo(px + pw - 5, py + 5);
    ctx.lineTo(px + pw - 8, py + 18);
    ctx.arc(px + pw/2, py + 15, 19, 0, -Math.PI, true);
    ctx.fill();

    // Mecha roxa característica
    ctx.fillStyle = char.highlightColor || '#AB47BC';
    ctx.beginPath();
    ctx.moveTo(px + 8, py + 5);
    ctx.quadraticCurveTo(px, py + 15, px + 8, py + 28);
    ctx.lineTo(px + 18, py + 22);
    ctx.quadraticCurveTo(px + 12, py + 10, px + 16, py + 3);
    ctx.fill();

    // Segunda mecha menor
    ctx.beginPath();
    ctx.moveTo(px + 16, py + 2);
    ctx.quadraticCurveTo(px + 14, py + 8, px + 18, py + 12);
    ctx.lineTo(px + 22, py + 8);
    ctx.quadraticCurveTo(px + 20, py + 4, px + 22, py);
    ctx.fill();

    // Olhos determinados
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(px + pw/2 - 8, py + 14, 6, 7, -0.1, 0, Math.PI * 2);
    ctx.ellipse(px + pw/2 + 8, py + 14, 6, 7, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Íris
    ctx.fillStyle = char.eyeColor || '#5D4037';
    ctx.beginPath();
    ctx.arc(px + pw/2 - 6, py + 15, 4, 0, Math.PI * 2);
    ctx.arc(px + pw/2 + 10, py + 15, 4, 0, Math.PI * 2);
    ctx.fill();

    // Pupilas
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.arc(px + pw/2 - 5, py + 15, 2, 0, Math.PI * 2);
    ctx.arc(px + pw/2 + 11, py + 15, 2, 0, Math.PI * 2);
    ctx.fill();

    // Brilhos
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(px + pw/2 - 7, py + 13, 1.5, 0, Math.PI * 2);
    ctx.arc(px + pw/2 + 9, py + 13, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Sobrancelhas determinadas (expressão séria)
    ctx.strokeStyle = char.hairColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(px + pw/2 - 14, py + 5);
    ctx.lineTo(px + pw/2 - 4, py + 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px + pw/2 + 4, py + 8);
    ctx.lineTo(px + pw/2 + 14, py + 5);
    ctx.stroke();

    // Boca (expressão confiante)
    ctx.strokeStyle = '#B87070';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px + pw/2 - 5, py + 24);
    ctx.lineTo(px + pw/2 + 5, py + 24);
    ctx.stroke();

    // Chiclete (detalhe icônico)
    if (Math.sin(time * 2) > 0.7) {
        ctx.fillStyle = '#EC407A';
        ctx.beginPath();
        ctx.ellipse(px + pw/2 + 8, py + 26, 4, 3, 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Discos voando quando poder ativo
    if (player.isPowerActive) {
        for (let i = 0; i < 4; i++) {
            const angle = time * 4 + i * Math.PI / 2;
            const dist = 50 + Math.sin(time * 3 + i) * 10;
            const dx = px + pw/2 + Math.cos(angle) * dist;
            const dy = py + ph/2 + Math.sin(angle) * dist * 0.5;

            ctx.shadowColor = char.discGlow || '#FFFF00';
            ctx.shadowBlur = 10;
            ctx.fillStyle = char.armorColor;
            ctx.beginPath();
            ctx.ellipse(dx, dy, 12, 6, angle, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
}

// WASABI - Ultra Detalhado com Lâminas de Plasma
function drawWasabiAnimated(char, px, py, pw, ph) {
    const legAngle = player.legAngle * 0.7;
    const armAngle = player.armAngle * 0.7;
    const bladeGlow = 0.7 + Math.sin(gameState.animationFrame * 0.15) * 0.3;
    const time = gameState.animationFrame * 0.05;
    const breathe = Math.sin(time * 1.5) * 1.5;

    // Sombra grande (personagem musculoso)
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(px + pw/2, py + ph + 8, pw/1.7, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Brilho das lâminas no chão
    ctx.fillStyle = `rgba(0, 230, 118, ${bladeGlow * 0.3})`;
    ctx.beginPath();
    ctx.ellipse(px + pw/2, py + ph + 8, pw/1.5, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // === PERNAS musculosas ===
    // Perna esquerda
    ctx.save();
    ctx.translate(px + pw/2 - 16, py + ph - 38);
    ctx.rotate(legAngle);

    // Coxa musculosa
    const legGradL = ctx.createLinearGradient(-12, 0, 12, 0);
    legGradL.addColorStop(0, char.armorDark);
    legGradL.addColorStop(0.3, char.armorColor);
    legGradL.addColorStop(0.7, char.armorColor);
    legGradL.addColorStop(1, char.armorDark);
    ctx.fillStyle = legGradL;
    ctx.beginPath();
    ctx.ellipse(0, 10, 14, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Joelheira
    ctx.fillStyle = char.armorAccent || char.armorLight;
    ctx.beginPath();
    ctx.ellipse(0, 22, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = char.armorDark;
    ctx.beginPath();
    ctx.arc(0, 22, 5, 0, Math.PI * 2);
    ctx.fill();

    // Canela
    ctx.fillStyle = char.armorDark;
    ctx.beginPath();
    roundRect(ctx, -10, 26, 20, 16, 5);
    ctx.fill();

    // Bota robusta
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    roundRect(ctx, -13, 40, 26, 12, 5);
    ctx.fill();
    ctx.fillStyle = char.armorColor;
    ctx.fillRect(-11, 42, 22, 4);
    ctx.restore();

    // Perna direita
    ctx.save();
    ctx.translate(px + pw/2 + 16, py + ph - 38);
    ctx.rotate(-legAngle);

    const legGradR = ctx.createLinearGradient(-12, 0, 12, 0);
    legGradR.addColorStop(0, char.armorDark);
    legGradR.addColorStop(0.3, char.armorColor);
    legGradR.addColorStop(0.7, char.armorColor);
    legGradR.addColorStop(1, char.armorDark);
    ctx.fillStyle = legGradR;
    ctx.beginPath();
    ctx.ellipse(0, 10, 14, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = char.armorAccent || char.armorLight;
    ctx.beginPath();
    ctx.ellipse(0, 22, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = char.armorDark;
    ctx.beginPath();
    ctx.arc(0, 22, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = char.armorDark;
    ctx.beginPath();
    roundRect(ctx, -10, 26, 20, 16, 5);
    ctx.fill();

    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    roundRect(ctx, -13, 40, 26, 12, 5);
    ctx.fill();
    ctx.fillStyle = char.armorColor;
    ctx.fillRect(-11, 42, 22, 4);
    ctx.restore();

    // === CORPO musculoso ===
    const bodyGrad = ctx.createLinearGradient(px + 2, py + 20 + breathe, px + pw - 2, py + ph - 38);
    bodyGrad.addColorStop(0, char.armorLight);
    bodyGrad.addColorStop(0.3, char.armorColor);
    bodyGrad.addColorStop(0.7, char.armorColor);
    bodyGrad.addColorStop(1, char.armorDark);
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    roundRect(ctx, px + 2, py + 20 + breathe, pw - 4, ph - 58, 12);
    ctx.fill();

    // Músculos peitorais definidos
    ctx.fillStyle = char.armorDark;
    ctx.beginPath();
    ctx.ellipse(px + pw/3, py + 38 + breathe, 16, 14, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(px + pw*2/3, py + 38 + breathe, 16, 14, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Linha central do peito
    ctx.strokeStyle = char.armorDark;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px + pw/2, py + 28 + breathe);
    ctx.lineTo(px + pw/2, py + 60 + breathe);
    ctx.stroke();

    // Abdominais
    ctx.fillStyle = char.armorDark;
    for (let row = 0; row < 2; row++) {
        for (let col = -1; col <= 1; col += 2) {
            ctx.beginPath();
            ctx.ellipse(px + pw/2 + col * 12, py + 52 + row * 14 + breathe, 10, 6, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // === BRAÇOS com lâminas de plasma ===
    // Braço esquerdo
    ctx.save();
    ctx.translate(px - 5, py + 28 + breathe);
    ctx.rotate(armAngle);

    // Ombro musculoso
    ctx.fillStyle = char.armorColor;
    ctx.beginPath();
    ctx.ellipse(5, 5, 14, 12, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Bíceps
    const armGradL = ctx.createLinearGradient(-10, 10, 10, 10);
    armGradL.addColorStop(0, char.armorDark);
    armGradL.addColorStop(0.5, char.armorColor);
    armGradL.addColorStop(1, char.armorDark);
    ctx.fillStyle = armGradL;
    ctx.beginPath();
    ctx.ellipse(0, 18, 12, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Antebraço com dispositivo de lâmina
    ctx.fillStyle = char.armorDark;
    ctx.beginPath();
    roundRect(ctx, -10, 30, 20, 18, 5);
    ctx.fill();

    // Dispositivo emissor de lâmina
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    roundRect(ctx, -12, 38, 8, 25, 3);
    ctx.fill();

    // Lâmina de plasma esquerda - ultra detalhada
    ctx.shadowColor = char.bladeGlow || '#00FF00';
    ctx.shadowBlur = 25 * bladeGlow;

    // Núcleo da lâmina (mais brilhante)
    const bladeCoreGrad = ctx.createLinearGradient(-15, 35, -15, 75);
    bladeCoreGrad.addColorStop(0, char.bladeCore || '#B9F6CA');
    bladeCoreGrad.addColorStop(0.5, '#FFFFFF');
    bladeCoreGrad.addColorStop(1, char.bladeCore || '#B9F6CA');
    ctx.fillStyle = bladeCoreGrad;
    ctx.beginPath();
    ctx.moveTo(-10, 42);
    ctx.lineTo(-18, 38);
    ctx.lineTo(-18, 72);
    ctx.lineTo(-10, 68);
    ctx.fill();

    // Lâmina externa
    const bladeGradL = ctx.createLinearGradient(-25, 35, -25, 75);
    bladeGradL.addColorStop(0, `rgba(0, 230, 118, ${bladeGlow})`);
    bladeGradL.addColorStop(0.3, char.bladeColor);
    bladeGradL.addColorStop(0.7, char.bladeColor);
    bladeGradL.addColorStop(1, `rgba(0, 230, 118, ${bladeGlow * 0.5})`);
    ctx.fillStyle = bladeGradL;
    ctx.beginPath();
    ctx.moveTo(-10, 40);
    ctx.lineTo(-40, 32);
    ctx.lineTo(-42, 75);
    ctx.lineTo(-10, 70);
    ctx.fill();

    // Efeito de energia na lâmina
    ctx.strokeStyle = `rgba(255, 255, 255, ${bladeGlow * 0.8})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        const yPos = 40 + i * 10 + Math.sin(time * 5 + i) * 3;
        ctx.beginPath();
        ctx.moveTo(-12, yPos);
        ctx.lineTo(-38, yPos - 2);
        ctx.stroke();
    }

    ctx.shadowBlur = 0;
    ctx.restore();

    // Braço direito
    ctx.save();
    ctx.translate(px + pw + 5, py + 28 + breathe);
    ctx.rotate(-armAngle);

    ctx.fillStyle = char.armorColor;
    ctx.beginPath();
    ctx.ellipse(-5, 5, 14, 12, 0.3, 0, Math.PI * 2);
    ctx.fill();

    const armGradR = ctx.createLinearGradient(-10, 10, 10, 10);
    armGradR.addColorStop(0, char.armorDark);
    armGradR.addColorStop(0.5, char.armorColor);
    armGradR.addColorStop(1, char.armorDark);
    ctx.fillStyle = armGradR;
    ctx.beginPath();
    ctx.ellipse(0, 18, 12, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = char.armorDark;
    ctx.beginPath();
    roundRect(ctx, -10, 30, 20, 18, 5);
    ctx.fill();

    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    roundRect(ctx, 4, 38, 8, 25, 3);
    ctx.fill();

    // Lâmina direita
    ctx.shadowColor = char.bladeGlow || '#00FF00';
    ctx.shadowBlur = 25 * bladeGlow;

    const bladeCoreGradR = ctx.createLinearGradient(15, 35, 15, 75);
    bladeCoreGradR.addColorStop(0, char.bladeCore || '#B9F6CA');
    bladeCoreGradR.addColorStop(0.5, '#FFFFFF');
    bladeCoreGradR.addColorStop(1, char.bladeCore || '#B9F6CA');
    ctx.fillStyle = bladeCoreGradR;
    ctx.beginPath();
    ctx.moveTo(10, 42);
    ctx.lineTo(18, 38);
    ctx.lineTo(18, 72);
    ctx.lineTo(10, 68);
    ctx.fill();

    const bladeGradR = ctx.createLinearGradient(25, 35, 25, 75);
    bladeGradR.addColorStop(0, `rgba(0, 230, 118, ${bladeGlow})`);
    bladeGradR.addColorStop(0.3, char.bladeColor);
    bladeGradR.addColorStop(0.7, char.bladeColor);
    bladeGradR.addColorStop(1, `rgba(0, 230, 118, ${bladeGlow * 0.5})`);
    ctx.fillStyle = bladeGradR;
    ctx.beginPath();
    ctx.moveTo(10, 40);
    ctx.lineTo(40, 32);
    ctx.lineTo(42, 75);
    ctx.lineTo(10, 70);
    ctx.fill();

    ctx.strokeStyle = `rgba(255, 255, 255, ${bladeGlow * 0.8})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        const yPos = 40 + i * 10 + Math.sin(time * 5 + i) * 3;
        ctx.beginPath();
        ctx.moveTo(12, yPos);
        ctx.lineTo(38, yPos - 2);
        ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    // === PESCOÇO forte ===
    ctx.fillStyle = char.skinShadow || char.skinColor;
    ctx.fillRect(px + pw/2 - 10, py + 12, 20, 14);

    // === CABEÇA detalhada ===
    const headGrad = ctx.createRadialGradient(px + pw/2 - 5, py + 8, 5, px + pw/2, py + 12, 22);
    headGrad.addColorStop(0, char.skinColor);
    headGrad.addColorStop(1, char.skinShadow || '#6D4C41');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(px + pw/2, py + 12, 22, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Orelhas
    ctx.fillStyle = char.skinShadow || '#6D4C41';
    ctx.beginPath();
    ctx.ellipse(px + pw/2 - 21, py + 12, 5, 8, -0.2, 0, Math.PI * 2);
    ctx.ellipse(px + pw/2 + 21, py + 12, 5, 8, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Dreads animados - mais detalhados
    const dreadCount = 9;
    for (let i = 0; i < dreadCount; i++) {
        const baseX = px + 6 + i * 7;
        const dreadAngle = Math.sin(time * 2 + i * 0.5) * 0.15;
        const dreadLength = 22 + Math.sin(i * 1.5) * 5;

        // Dread principal
        ctx.strokeStyle = char.dreadColor;
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(baseX, py + 3);
        ctx.quadraticCurveTo(
            baseX + Math.sin(dreadAngle) * 10,
            py - 12,
            baseX + 3 + Math.sin(time * 3 + i) * 4,
            py - dreadLength
        );
        ctx.stroke();

        // Highlight do dread
        ctx.strokeStyle = char.dreadHighlight || '#5D4037';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(baseX + 2, py + 2);
        ctx.quadraticCurveTo(
            baseX + 2 + Math.sin(dreadAngle) * 8,
            py - 10,
            baseX + 5 + Math.sin(time * 3 + i) * 3,
            py - dreadLength + 5
        );
        ctx.stroke();
    }

    // Olhos
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(px + pw/2 - 9, py + 10, 7, 8, -0.1, 0, Math.PI * 2);
    ctx.ellipse(px + pw/2 + 9, py + 10, 7, 8, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Íris
    ctx.fillStyle = char.eyeColor || '#3E2723';
    ctx.beginPath();
    ctx.arc(px + pw/2 - 7, py + 11, 5, 0, Math.PI * 2);
    ctx.arc(px + pw/2 + 11, py + 11, 5, 0, Math.PI * 2);
    ctx.fill();

    // Pupilas
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.arc(px + pw/2 - 6, py + 11, 2.5, 0, Math.PI * 2);
    ctx.arc(px + pw/2 + 12, py + 11, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Brilhos
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(px + pw/2 - 8, py + 9, 2, 0, Math.PI * 2);
    ctx.arc(px + pw/2 + 10, py + 9, 2, 0, Math.PI * 2);
    ctx.fill();

    // Sobrancelhas
    ctx.strokeStyle = char.dreadColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(px + pw/2 - 16, py + 1);
    ctx.lineTo(px + pw/2 - 5, py + 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px + pw/2 + 5, py + 3);
    ctx.lineTo(px + pw/2 + 16, py + 1);
    ctx.stroke();

    // Nariz
    ctx.strokeStyle = char.skinShadow || '#6D4C41';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px + pw/2, py + 12);
    ctx.lineTo(px + pw/2 - 3, py + 20);
    ctx.stroke();

    // Barba/Cavanhaque
    ctx.fillStyle = char.dreadColor;
    ctx.beginPath();
    ctx.moveTo(px + pw/2 - 14, py + 24);
    ctx.quadraticCurveTo(px + pw/2 - 8, py + 30, px + pw/2, py + 38);
    ctx.quadraticCurveTo(px + pw/2 + 8, py + 30, px + pw/2 + 14, py + 24);
    ctx.quadraticCurveTo(px + pw/2, py + 28, px + pw/2 - 14, py + 24);
    ctx.fill();

    // Bigode
    ctx.fillStyle = char.dreadColor;
    ctx.beginPath();
    ctx.moveTo(px + pw/2 - 10, py + 22);
    ctx.quadraticCurveTo(px + pw/2, py + 26, px + pw/2 + 10, py + 22);
    ctx.quadraticCurveTo(px + pw/2, py + 24, px + pw/2 - 10, py + 22);
    ctx.fill();

    // Efeito de corte quando poder ativo
    if (player.isPowerActive) {
        ctx.strokeStyle = char.bladeGlow || '#00FF00';
        ctx.shadowColor = char.bladeGlow || '#00FF00';
        ctx.shadowBlur = 20;
        ctx.lineWidth = 3;

        for (let i = 0; i < 6; i++) {
            const sliceX = px + pw + 30 + i * 25;
            const sliceY = py + 20 + Math.sin(time * 8 + i * 2) * 30;
            ctx.beginPath();
            ctx.moveTo(sliceX, sliceY - 20);
            ctx.lineTo(sliceX + 20, sliceY + 20);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
    }
}

// HONEY LEMON - Animada
function drawHoneyAnimated(char, px, py, pw, ph) {
    const legAngle = player.legAngle;
    const armAngle = player.armAngle;
    const time = gameState.animationFrame * 0.08;
    const hairWave = Math.sin(time) * 3;
    const breathe = Math.sin(time * 0.5) * 2;

    // Sombra dinâmica
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(px + pw/2, py + ph + 5, pw/2.2 + Math.abs(legAngle) * 5, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // ========== PERNAS LONGAS E ELEGANTES ==========
    // Perna esquerda
    ctx.save();
    ctx.translate(px + pw/2 - 12, py + ph - 50);
    ctx.rotate(legAngle);

    // Coxa
    const thighGradL = ctx.createLinearGradient(-7, 0, 7, 0);
    thighGradL.addColorStop(0, '#E91E63');
    thighGradL.addColorStop(0.5, '#F06292');
    thighGradL.addColorStop(1, '#C2185B');
    ctx.fillStyle = thighGradL;
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.quadraticCurveTo(-8, 12, -5, 25);
    ctx.lineTo(5, 25);
    ctx.quadraticCurveTo(8, 12, 6, 0);
    ctx.closePath();
    ctx.fill();

    // Panturrilha
    ctx.fillStyle = '#F48FB1';
    ctx.beginPath();
    ctx.moveTo(-5, 25);
    ctx.quadraticCurveTo(-6, 35, -4, 45);
    ctx.lineTo(4, 45);
    ctx.quadraticCurveTo(6, 35, 5, 25);
    ctx.closePath();
    ctx.fill();

    // Bota estilizada
    const bootGradL = ctx.createLinearGradient(-8, 42, 10, 55);
    bootGradL.addColorStop(0, '#AD1457');
    bootGradL.addColorStop(1, '#880E4F');
    ctx.fillStyle = bootGradL;
    ctx.beginPath();
    ctx.moveTo(-6, 42);
    ctx.lineTo(-8, 50);
    ctx.lineTo(10, 50);
    ctx.lineTo(8, 42);
    ctx.closePath();
    ctx.fill();

    // Salto da bota
    ctx.fillStyle = '#6A1B9A';
    ctx.fillRect(-2, 50, 8, 5);
    ctx.restore();

    // Perna direita
    ctx.save();
    ctx.translate(px + pw/2 + 12, py + ph - 50);
    ctx.rotate(-legAngle);

    // Coxa
    const thighGradR = ctx.createLinearGradient(-7, 0, 7, 0);
    thighGradR.addColorStop(0, '#C2185B');
    thighGradR.addColorStop(0.5, '#F06292');
    thighGradR.addColorStop(1, '#E91E63');
    ctx.fillStyle = thighGradR;
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.quadraticCurveTo(-8, 12, -5, 25);
    ctx.lineTo(5, 25);
    ctx.quadraticCurveTo(8, 12, 6, 0);
    ctx.closePath();
    ctx.fill();

    // Panturrilha
    ctx.fillStyle = '#F48FB1';
    ctx.beginPath();
    ctx.moveTo(-5, 25);
    ctx.quadraticCurveTo(-6, 35, -4, 45);
    ctx.lineTo(4, 45);
    ctx.quadraticCurveTo(6, 35, 5, 25);
    ctx.closePath();
    ctx.fill();

    // Bota estilizada
    const bootGradR = ctx.createLinearGradient(-8, 42, 10, 55);
    bootGradR.addColorStop(0, '#AD1457');
    bootGradR.addColorStop(1, '#880E4F');
    ctx.fillStyle = bootGradR;
    ctx.beginPath();
    ctx.moveTo(-6, 42);
    ctx.lineTo(-8, 50);
    ctx.lineTo(10, 50);
    ctx.lineTo(8, 42);
    ctx.closePath();
    ctx.fill();

    // Salto
    ctx.fillStyle = '#6A1B9A';
    ctx.fillRect(-2, 50, 8, 5);
    ctx.restore();

    // ========== CORPO ESBELTO (ARMADURA ROSA) ==========
    // Corpo principal - formato de vestido/armadura
    const bodyGrad = ctx.createLinearGradient(px + 12, py + 28, px + pw - 12, py + ph - 55);
    bodyGrad.addColorStop(0, '#F8BBD9');
    bodyGrad.addColorStop(0.3, '#F06292');
    bodyGrad.addColorStop(0.7, '#E91E63');
    bodyGrad.addColorStop(1, '#C2185B');
    ctx.fillStyle = bodyGrad;

    // Torso curvilíneo
    ctx.beginPath();
    ctx.moveTo(px + pw/2, py + 28);
    ctx.quadraticCurveTo(px + pw - 8, py + 35, px + pw - 10, py + 50 + breathe);
    ctx.quadraticCurveTo(px + pw - 5, py + 65, px + pw - 12, py + ph - 50);
    ctx.lineTo(px + 12, py + ph - 50);
    ctx.quadraticCurveTo(px + 5, py + 65, px + 10, py + 50 + breathe);
    ctx.quadraticCurveTo(px + 8, py + 35, px + pw/2, py + 28);
    ctx.closePath();
    ctx.fill();

    // Detalhes da armadura - linhas hexagonais
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(px + 18, py + 40 + i * 12);
        ctx.lineTo(px + pw/2, py + 35 + i * 12);
        ctx.lineTo(px + pw - 18, py + 40 + i * 12);
        ctx.stroke();
    }

    // ========== CINTO DE QUÍMICA - BOLSA ESPECIAL ==========
    // Cinto principal
    const beltGrad = ctx.createLinearGradient(px + 5, py + 58, px + 5, py + 72);
    beltGrad.addColorStop(0, '#7B1FA2');
    beltGrad.addColorStop(0.5, '#9C27B0');
    beltGrad.addColorStop(1, '#6A1B9A');
    ctx.fillStyle = beltGrad;
    ctx.beginPath();
    roundRect(ctx, px + 8, py + 58, pw - 16, 14, 4);
    ctx.fill();

    // Fivela central
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    roundRect(ctx, px + pw/2 - 8, py + 60, 16, 10, 2);
    ctx.fill();
    ctx.fillStyle = '#FFA000';
    ctx.beginPath();
    ctx.arc(px + pw/2, py + 65, 3, 0, Math.PI * 2);
    ctx.fill();

    // BOLSINHA QUÍMICA (icônico da personagem)
    ctx.fillStyle = '#E1BEE7';
    ctx.beginPath();
    roundRect(ctx, px + pw - 25, py + 50, 18, 20, 5);
    ctx.fill();
    ctx.strokeStyle = '#9C27B0';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Esferas químicas coloridas com brilho (7 cores)
    const chemColors = [
        {main: '#FF1744', glow: '#FF8A80'},  // Vermelho
        {main: '#FF9100', glow: '#FFD180'},  // Laranja
        {main: '#FFEA00', glow: '#FFFF8D'},  // Amarelo
        {main: '#00E676', glow: '#B9F6CA'},  // Verde
        {main: '#00B0FF', glow: '#80D8FF'},  // Azul
        {main: '#D500F9', glow: '#EA80FC'},  // Roxo
        {main: '#F50057', glow: '#FF80AB'}   // Rosa
    ];

    // Esferas no cinto
    for (let i = 0; i < 5; i++) {
        const chemX = px + 15 + i * 9;
        const chemY = py + 65;
        const bounce = Math.sin(time + i * 0.5) * 1;

        // Brilho externo
        ctx.shadowColor = chemColors[i].glow;
        ctx.shadowBlur = 8;

        // Esfera principal
        const sphereGrad = ctx.createRadialGradient(chemX - 1, chemY - 1 + bounce, 0, chemX, chemY + bounce, 5);
        sphereGrad.addColorStop(0, '#FFFFFF');
        sphereGrad.addColorStop(0.3, chemColors[i].glow);
        sphereGrad.addColorStop(1, chemColors[i].main);
        ctx.fillStyle = sphereGrad;
        ctx.beginPath();
        ctx.arc(chemX, chemY + bounce, 5, 0, Math.PI * 2);
        ctx.fill();

        // Reflexo
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(chemX - 1.5, chemY - 1.5 + bounce, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Esfera especial na bolsinha (maior, pulsando)
    const specialPulse = Math.sin(time * 2) * 0.5 + 1;
    const specialX = px + pw - 16;
    const specialY = py + 60;
    ctx.shadowColor = '#FF4081';
    ctx.shadowBlur = 12 * specialPulse;
    const specialGrad = ctx.createRadialGradient(specialX - 2, specialY - 2, 0, specialX, specialY, 8);
    specialGrad.addColorStop(0, '#FFFFFF');
    specialGrad.addColorStop(0.4, '#FF80AB');
    specialGrad.addColorStop(1, '#F50057');
    ctx.fillStyle = specialGrad;
    ctx.beginPath();
    ctx.arc(specialX, specialY, 7 * specialPulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // ========== BRAÇOS ESBELTOS ==========
    // Braço esquerdo
    ctx.save();
    ctx.translate(px + 10, py + 32);
    ctx.rotate(armAngle);

    // Ombro
    ctx.fillStyle = '#F06292';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();

    // Braço superior
    const armGradL = ctx.createLinearGradient(-5, 0, 5, 0);
    armGradL.addColorStop(0, '#E91E63');
    armGradL.addColorStop(0.5, '#F48FB1');
    armGradL.addColorStop(1, '#C2185B');
    ctx.fillStyle = armGradL;
    ctx.beginPath();
    ctx.moveTo(-5, 2);
    ctx.quadraticCurveTo(-6, 15, -4, 28);
    ctx.lineTo(4, 28);
    ctx.quadraticCurveTo(6, 15, 5, 2);
    ctx.closePath();
    ctx.fill();

    // Luva rosa
    ctx.fillStyle = '#F8BBD9';
    ctx.beginPath();
    ctx.ellipse(0, 35, 7, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Detalhes dos dedos
    ctx.fillStyle = '#FCE4EC';
    for (let f = 0; f < 4; f++) {
        ctx.beginPath();
        ctx.ellipse(-4 + f * 2.5, 40, 2, 4, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // Braço direito (segurando bolsa química)
    ctx.save();
    ctx.translate(px + pw - 10, py + 32);
    ctx.rotate(-armAngle * 0.5); // Move menos pois segura a bolsa

    // Ombro
    ctx.fillStyle = '#F06292';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();

    // Braço
    const armGradR = ctx.createLinearGradient(-5, 0, 5, 0);
    armGradR.addColorStop(0, '#C2185B');
    armGradR.addColorStop(0.5, '#F48FB1');
    armGradR.addColorStop(1, '#E91E63');
    ctx.fillStyle = armGradR;
    ctx.beginPath();
    ctx.moveTo(-5, 2);
    ctx.quadraticCurveTo(-6, 15, -4, 28);
    ctx.lineTo(4, 28);
    ctx.quadraticCurveTo(6, 15, 5, 2);
    ctx.closePath();
    ctx.fill();

    // Luva
    ctx.fillStyle = '#F8BBD9';
    ctx.beginPath();
    ctx.ellipse(0, 35, 7, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ========== CABEÇA E ROSTO ==========
    // Base da cabeça
    const headGrad = ctx.createRadialGradient(px + pw/2, py + 18, 0, px + pw/2, py + 20, 20);
    headGrad.addColorStop(0, '#FFDBCC');
    headGrad.addColorStop(0.7, '#FFCCBC');
    headGrad.addColorStop(1, '#FFAB91');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(px + pw/2, py + 18, 16, 19, 0, 0, Math.PI * 2);
    ctx.fill();

    // Orelhas
    ctx.fillStyle = '#FFCCBC';
    ctx.beginPath();
    ctx.ellipse(px + pw/2 - 15, py + 18, 4, 6, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(px + pw/2 + 15, py + 18, 4, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // ========== CABELO LOIRO LONGO E VOLUMOSO ==========
    // Cabelo base - gradiente dourado
    const hairGrad = ctx.createLinearGradient(px, py - 5, px + pw, py + 70);
    hairGrad.addColorStop(0, '#FFF59D');
    hairGrad.addColorStop(0.3, '#FFD54F');
    hairGrad.addColorStop(0.6, '#FFCA28');
    hairGrad.addColorStop(1, '#FFB300');
    ctx.fillStyle = hairGrad;

    // Topo do cabelo (volume)
    ctx.beginPath();
    ctx.moveTo(px + pw/2 - 20, py + 15);
    ctx.quadraticCurveTo(px + pw/2 - 22, py - 8, px + pw/2, py - 10);
    ctx.quadraticCurveTo(px + pw/2 + 22, py - 8, px + pw/2 + 20, py + 15);
    ctx.closePath();
    ctx.fill();

    // Franja estilizada
    ctx.beginPath();
    ctx.moveTo(px + pw/2 - 18, py + 5);
    ctx.quadraticCurveTo(px + pw/2 - 12, py + 12, px + pw/2 - 5, py + 8);
    ctx.quadraticCurveTo(px + pw/2, py + 14, px + pw/2 + 5, py + 8);
    ctx.quadraticCurveTo(px + pw/2 + 12, py + 12, px + pw/2 + 18, py + 5);
    ctx.quadraticCurveTo(px + pw/2 + 15, py - 2, px + pw/2, py - 5);
    ctx.quadraticCurveTo(px + pw/2 - 15, py - 2, px + pw/2 - 18, py + 5);
    ctx.fill();

    // Cabelo lateral esquerdo (ondulado, longo)
    ctx.beginPath();
    ctx.moveTo(px + 5, py + 10);
    ctx.quadraticCurveTo(px - 5 + hairWave, py + 30, px + 2 + hairWave * 0.5, py + 55);
    ctx.quadraticCurveTo(px + hairWave, py + 75, px + 8 + hairWave * 0.3, py + 85);
    ctx.lineTo(px + 18, py + 80);
    ctx.quadraticCurveTo(px + 15, py + 60, px + 18, py + 40);
    ctx.quadraticCurveTo(px + 15, py + 25, px + 18, py + 12);
    ctx.closePath();
    ctx.fill();

    // Cabelo lateral direito
    ctx.beginPath();
    ctx.moveTo(px + pw - 5, py + 10);
    ctx.quadraticCurveTo(px + pw + 5 - hairWave, py + 30, px + pw - 2 - hairWave * 0.5, py + 55);
    ctx.quadraticCurveTo(px + pw - hairWave, py + 75, px + pw - 8 - hairWave * 0.3, py + 85);
    ctx.lineTo(px + pw - 18, py + 80);
    ctx.quadraticCurveTo(px + pw - 15, py + 60, px + pw - 18, py + 40);
    ctx.quadraticCurveTo(px + pw - 15, py + 25, px + pw - 18, py + 12);
    ctx.closePath();
    ctx.fill();

    // Mechas de destaque
    ctx.fillStyle = '#FFEE58';
    ctx.beginPath();
    ctx.moveTo(px + 10, py + 15);
    ctx.quadraticCurveTo(px + 5 + hairWave * 0.5, py + 40, px + 12 + hairWave * 0.3, py + 65);
    ctx.lineTo(px + 16, py + 60);
    ctx.quadraticCurveTo(px + 14, py + 40, px + 16, py + 18);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(px + pw - 10, py + 15);
    ctx.quadraticCurveTo(px + pw - 5 - hairWave * 0.5, py + 40, px + pw - 12 - hairWave * 0.3, py + 65);
    ctx.lineTo(px + pw - 16, py + 60);
    ctx.quadraticCurveTo(px + pw - 14, py + 40, px + pw - 16, py + 18);
    ctx.closePath();
    ctx.fill();

    // ========== ÓCULOS GRANDES ESTILIZADOS ==========
    // Armação roxa
    ctx.strokeStyle = '#7B1FA2';
    ctx.lineWidth = 3;

    // Lente esquerda
    ctx.beginPath();
    ctx.ellipse(px + pw/2 - 9, py + 17, 10, 11, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Lente direita
    ctx.beginPath();
    ctx.ellipse(px + pw/2 + 9, py + 17, 10, 11, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Ponte
    ctx.beginPath();
    ctx.moveTo(px + pw/2 - 1, py + 17);
    ctx.lineTo(px + pw/2 + 1, py + 17);
    ctx.stroke();

    // Hastes
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px + pw/2 - 18, py + 15);
    ctx.lineTo(px + pw/2 - 22, py + 18);
    ctx.moveTo(px + pw/2 + 18, py + 15);
    ctx.lineTo(px + pw/2 + 22, py + 18);
    ctx.stroke();

    // Reflexo nas lentes
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.ellipse(px + pw/2 - 11, py + 14, 4, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(px + pw/2 + 7, py + 14, 4, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // ========== OLHOS VERDES EXPRESSIVOS ==========
    // Esclera
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(px + pw/2 - 9, py + 17, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(px + pw/2 + 9, py + 17, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Íris verde
    const irisGrad = ctx.createRadialGradient(px + pw/2 - 8, py + 17, 0, px + pw/2 - 8, py + 17, 5);
    irisGrad.addColorStop(0, '#81C784');
    irisGrad.addColorStop(0.5, '#4CAF50');
    irisGrad.addColorStop(1, '#2E7D32');
    ctx.fillStyle = irisGrad;
    ctx.beginPath();
    ctx.arc(px + pw/2 - 8, py + 18, 4, 0, Math.PI * 2);
    ctx.fill();

    const irisGrad2 = ctx.createRadialGradient(px + pw/2 + 10, py + 17, 0, px + pw/2 + 10, py + 17, 5);
    irisGrad2.addColorStop(0, '#81C784');
    irisGrad2.addColorStop(0.5, '#4CAF50');
    irisGrad2.addColorStop(1, '#2E7D32');
    ctx.fillStyle = irisGrad2;
    ctx.beginPath();
    ctx.arc(px + pw/2 + 10, py + 18, 4, 0, Math.PI * 2);
    ctx.fill();

    // Pupilas
    ctx.fillStyle = '#1B5E20';
    ctx.beginPath();
    ctx.arc(px + pw/2 - 7, py + 18, 2, 0, Math.PI * 2);
    ctx.arc(px + pw/2 + 11, py + 18, 2, 0, Math.PI * 2);
    ctx.fill();

    // Brilho nos olhos
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(px + pw/2 - 9, py + 16, 1.5, 0, Math.PI * 2);
    ctx.arc(px + pw/2 + 9, py + 16, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Cílios
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(px + pw/2 - 12 + i * 3, py + 10);
        ctx.lineTo(px + pw/2 - 13 + i * 3, py + 7);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px + pw/2 + 6 + i * 3, py + 10);
        ctx.lineTo(px + pw/2 + 5 + i * 3, py + 7);
        ctx.stroke();
    }

    // ========== SOBRANCELHAS ==========
    ctx.strokeStyle = '#FFB300';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px + pw/2 - 15, py + 7);
    ctx.quadraticCurveTo(px + pw/2 - 9, py + 4, px + pw/2 - 3, py + 7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px + pw/2 + 15, py + 7);
    ctx.quadraticCurveTo(px + pw/2 + 9, py + 4, px + pw/2 + 3, py + 7);
    ctx.stroke();

    // ========== NARIZ DELICADO ==========
    ctx.strokeStyle = '#FFAB91';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(px + pw/2, py + 20);
    ctx.quadraticCurveTo(px + pw/2 + 2, py + 25, px + pw/2, py + 27);
    ctx.stroke();

    // ========== SORRISO RADIANTE ==========
    // Lábios
    ctx.fillStyle = '#E91E63';
    ctx.beginPath();
    ctx.moveTo(px + pw/2 - 8, py + 30);
    ctx.quadraticCurveTo(px + pw/2, py + 36, px + pw/2 + 8, py + 30);
    ctx.quadraticCurveTo(px + pw/2, py + 33, px + pw/2 - 8, py + 30);
    ctx.fill();

    // Brilho labial
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(px + pw/2, py + 31, 3, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bochechas rosadas
    ctx.fillStyle = 'rgba(255, 182, 193, 0.5)';
    ctx.beginPath();
    ctx.ellipse(px + pw/2 - 16, py + 25, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(px + pw/2 + 16, py + 25, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // ========== EFEITO QUÍMICO (quando voando/poder ativo) ==========
    if (player.isFlying || player.isPowerActive) {
        // Partículas químicas ao redor
        for (let i = 0; i < 8; i++) {
            const angle = time * 2 + (i / 8) * Math.PI * 2;
            const radius = 45 + Math.sin(time * 3 + i) * 10;
            const particleX = px + pw/2 + Math.cos(angle) * radius;
            const particleY = py + ph/2 + Math.sin(angle) * radius * 0.6;

            ctx.shadowColor = chemColors[i % 7].glow;
            ctx.shadowBlur = 10;

            const particleGrad = ctx.createRadialGradient(particleX, particleY, 0, particleX, particleY, 6);
            particleGrad.addColorStop(0, '#FFFFFF');
            particleGrad.addColorStop(0.5, chemColors[i % 7].glow);
            particleGrad.addColorStop(1, chemColors[i % 7].main);
            ctx.fillStyle = particleGrad;
            ctx.beginPath();
            ctx.arc(particleX, particleY, 4 + Math.sin(time + i) * 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    }
}

// FRED - Animado (Traje de Kaiju/Dragão) - Ultra-detalhado
function drawFredAnimated(char, px, py, pw, ph) {
    const legAngle = player.legAngle * 0.7;
    const armAngle = player.armAngle * 0.7;
    const time = gameState.animationFrame * 0.08;
    const breathe = Math.sin(time * 0.5) * 4;
    const tailWag = Math.sin(time) * 0.15;

    // Sombra grande e dinâmica
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(px + pw/2, py + ph + 8, pw/2 + 10 + Math.abs(legAngle) * 8, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // ========== CAUDA DE DRAGÃO ==========
    ctx.save();
    ctx.translate(px - 5, py + ph - 30);
    ctx.rotate(tailWag);

    const tailGrad = ctx.createLinearGradient(0, 0, -45, 20);
    tailGrad.addColorStop(0, '#1565C0');
    tailGrad.addColorStop(0.5, '#0D47A1');
    tailGrad.addColorStop(1, '#0A2472');
    ctx.fillStyle = tailGrad;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-20, 5 + Math.sin(time * 2) * 5, -35, 15);
    ctx.quadraticCurveTo(-45, 20, -50 + Math.sin(time * 3) * 5, 10);
    ctx.quadraticCurveTo(-45, 5, -35, 5);
    ctx.quadraticCurveTo(-20, -5 + Math.sin(time * 2) * 3, 0, -8);
    ctx.closePath();
    ctx.fill();

    // Espinhos na cauda
    ctx.fillStyle = '#FF6F00';
    for (let i = 0; i < 4; i++) {
        const sx = -10 - i * 10;
        const sy = 10 + Math.sin(time * 2 + i) * 3;
        ctx.beginPath();
        ctx.moveTo(sx, sy - 3);
        ctx.lineTo(sx - 3, sy - 12);
        ctx.lineTo(sx + 3, sy - 3);
        ctx.closePath();
        ctx.fill();
    }
    ctx.restore();

    // ========== PERNAS DE MONSTRO COM ESCAMAS ==========
    // Perna esquerda
    ctx.save();
    ctx.translate(px + pw/2 - 18, py + ph - 35);
    ctx.rotate(legAngle);

    // Coxa escamosa
    const legGradL = ctx.createLinearGradient(-14, 0, 14, 0);
    legGradL.addColorStop(0, '#0D47A1');
    legGradL.addColorStop(0.5, '#1976D2');
    legGradL.addColorStop(1, '#0D47A1');
    ctx.fillStyle = legGradL;

    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.quadraticCurveTo(-16, 15, -14, 35);
    ctx.lineTo(14, 35);
    ctx.quadraticCurveTo(16, 15, 12, 0);
    ctx.closePath();
    ctx.fill();

    // Detalhes de escamas na perna
    ctx.strokeStyle = 'rgba(13, 71, 161, 0.6)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(0, 8 + i * 8, 10, 0, Math.PI);
        ctx.stroke();
    }

    // Pé de monstro gigante
    const footGradL = ctx.createRadialGradient(0, 42, 0, 0, 42, 22);
    footGradL.addColorStop(0, '#1565C0');
    footGradL.addColorStop(1, '#0A2472');
    ctx.fillStyle = footGradL;
    ctx.beginPath();
    ctx.ellipse(0, 42, 20, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Garras afiadas com brilho
    ctx.shadowColor = '#FF6F00';
    ctx.shadowBlur = 5;
    for (let i = -1; i <= 1; i++) {
        const clawGrad = ctx.createLinearGradient(i * 10, 48, i * 10, 62);
        clawGrad.addColorStop(0, '#FFB300');
        clawGrad.addColorStop(0.5, '#FF6F00');
        clawGrad.addColorStop(1, '#E65100');
        ctx.fillStyle = clawGrad;
        ctx.beginPath();
        ctx.moveTo(i * 10 - 5, 48);
        ctx.lineTo(i * 10, 62);
        ctx.lineTo(i * 10 + 5, 48);
        ctx.closePath();
        ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    // Perna direita
    ctx.save();
    ctx.translate(px + pw/2 + 18, py + ph - 35);
    ctx.rotate(-legAngle);

    const legGradR = ctx.createLinearGradient(-14, 0, 14, 0);
    legGradR.addColorStop(0, '#0D47A1');
    legGradR.addColorStop(0.5, '#1976D2');
    legGradR.addColorStop(1, '#0D47A1');
    ctx.fillStyle = legGradR;

    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.quadraticCurveTo(-16, 15, -14, 35);
    ctx.lineTo(14, 35);
    ctx.quadraticCurveTo(16, 15, 12, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(13, 71, 161, 0.6)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(0, 8 + i * 8, 10, 0, Math.PI);
        ctx.stroke();
    }

    const footGradR = ctx.createRadialGradient(0, 42, 0, 0, 42, 22);
    footGradR.addColorStop(0, '#1565C0');
    footGradR.addColorStop(1, '#0A2472');
    ctx.fillStyle = footGradR;
    ctx.beginPath();
    ctx.ellipse(0, 42, 20, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = '#FF6F00';
    ctx.shadowBlur = 5;
    for (let i = -1; i <= 1; i++) {
        const clawGrad = ctx.createLinearGradient(i * 10, 48, i * 10, 62);
        clawGrad.addColorStop(0, '#FFB300');
        clawGrad.addColorStop(0.5, '#FF6F00');
        clawGrad.addColorStop(1, '#E65100');
        ctx.fillStyle = clawGrad;
        ctx.beginPath();
        ctx.moveTo(i * 10 - 5, 48);
        ctx.lineTo(i * 10, 62);
        ctx.lineTo(i * 10 + 5, 48);
        ctx.closePath();
        ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    // ========== CORPO DE KAIJU MASSIVO ==========
    // Corpo principal com textura escamosa
    const bodyGrad = ctx.createRadialGradient(px + pw/2, py + 50 + breathe, 10, px + pw/2, py + 50 + breathe, 50);
    bodyGrad.addColorStop(0, '#1976D2');
    bodyGrad.addColorStop(0.5, '#1565C0');
    bodyGrad.addColorStop(1, '#0D47A1');
    ctx.fillStyle = bodyGrad;

    ctx.beginPath();
    ctx.moveTo(px + pw/2, py + 15 + breathe);
    ctx.quadraticCurveTo(px + pw + 15, py + 30, px + pw + 10, py + 55 + breathe);
    ctx.quadraticCurveTo(px + pw + 5, py + ph - 35, px + pw/2, py + ph - 30);
    ctx.quadraticCurveTo(px - 5, py + ph - 35, px - 10, py + 55 + breathe);
    ctx.quadraticCurveTo(px - 15, py + 30, px + pw/2, py + 15 + breathe);
    ctx.closePath();
    ctx.fill();

    // Escamas detalhadas no corpo
    ctx.strokeStyle = 'rgba(13, 71, 161, 0.5)';
    ctx.lineWidth = 1.5;
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 4; col++) {
            const scaleX = px + 10 + col * 15 + (row % 2) * 7;
            const scaleY = py + 25 + row * 12 + breathe;
            ctx.beginPath();
            ctx.arc(scaleX, scaleY, 8, 0.3, Math.PI - 0.3);
            ctx.stroke();
        }
    }

    // ========== BARRIGA COM SEGMENTOS ==========
    const bellyGrad = ctx.createLinearGradient(px + pw/2 - 25, py + 35, px + pw/2 + 25, py + 85);
    bellyGrad.addColorStop(0, '#BBDEFB');
    bellyGrad.addColorStop(0.5, '#90CAF9');
    bellyGrad.addColorStop(1, '#64B5F6');
    ctx.fillStyle = bellyGrad;

    ctx.beginPath();
    ctx.ellipse(px + pw/2, py + 55 + breathe, 25, 35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Linhas de segmentos da barriga
    ctx.strokeStyle = '#42A5F5';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
        const segY = py + 30 + i * 10 + breathe;
        const segWidth = 20 - Math.abs(i - 2.5) * 3;
        ctx.beginPath();
        ctx.moveTo(px + pw/2 - segWidth, segY);
        ctx.lineTo(px + pw/2 + segWidth, segY);
        ctx.stroke();
    }

    // ========== ESPINHOS DORSAIS ==========
    ctx.fillStyle = '#FF6F00';
    for (let i = 0; i < 5; i++) {
        const spineX = px + pw/2;
        const spineY = py + 20 + i * 15 + breathe;
        const spineSize = 12 - Math.abs(i - 2) * 2;

        const spineGrad = ctx.createLinearGradient(spineX, spineY, spineX, spineY - spineSize - 10);
        spineGrad.addColorStop(0, '#FF6F00');
        spineGrad.addColorStop(0.5, '#FF8F00');
        spineGrad.addColorStop(1, '#FFA000');
        ctx.fillStyle = spineGrad;

        ctx.beginPath();
        ctx.moveTo(spineX - 6, spineY);
        ctx.lineTo(spineX, spineY - spineSize - 10);
        ctx.lineTo(spineX + 6, spineY);
        ctx.closePath();
        ctx.fill();
    }

    // ========== BRAÇOS MASSIVOS COM GARRAS ==========
    // Braço esquerdo
    ctx.save();
    ctx.translate(px - 8, py + 25 + breathe);
    ctx.rotate(armAngle);

    // Ombro grande
    const shoulderGradL = ctx.createRadialGradient(0, 5, 0, 0, 5, 18);
    shoulderGradL.addColorStop(0, '#1976D2');
    shoulderGradL.addColorStop(1, '#0D47A1');
    ctx.fillStyle = shoulderGradL;
    ctx.beginPath();
    ctx.arc(0, 5, 15, 0, Math.PI * 2);
    ctx.fill();

    // Braço
    const armBodyL = ctx.createLinearGradient(-12, 10, 12, 10);
    armBodyL.addColorStop(0, '#0D47A1');
    armBodyL.addColorStop(0.5, '#1565C0');
    armBodyL.addColorStop(1, '#0D47A1');
    ctx.fillStyle = armBodyL;
    ctx.beginPath();
    ctx.moveTo(-10, 12);
    ctx.quadraticCurveTo(-14, 28, -12, 45);
    ctx.lineTo(12, 45);
    ctx.quadraticCurveTo(14, 28, 10, 12);
    ctx.closePath();
    ctx.fill();

    // Mão com garras
    ctx.fillStyle = '#0D47A1';
    ctx.beginPath();
    ctx.ellipse(-2, 50, 14, 10, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Garras da mão
    ctx.shadowColor = '#FF6F00';
    ctx.shadowBlur = 8;
    for (let i = 0; i < 4; i++) {
        const clawAngle = -0.4 + i * 0.25;
        const clawX = -12 + i * 7;
        const clawGrad = ctx.createLinearGradient(clawX, 52, clawX - 8, 68);
        clawGrad.addColorStop(0, '#FFB300');
        clawGrad.addColorStop(1, '#E65100');
        ctx.fillStyle = clawGrad;
        ctx.beginPath();
        ctx.moveTo(clawX - 3, 52);
        ctx.lineTo(clawX - 10, 65);
        ctx.lineTo(clawX + 3, 52);
        ctx.closePath();
        ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    // Braço direito
    ctx.save();
    ctx.translate(px + pw + 8, py + 25 + breathe);
    ctx.rotate(-armAngle);

    const shoulderGradR = ctx.createRadialGradient(0, 5, 0, 0, 5, 18);
    shoulderGradR.addColorStop(0, '#1976D2');
    shoulderGradR.addColorStop(1, '#0D47A1');
    ctx.fillStyle = shoulderGradR;
    ctx.beginPath();
    ctx.arc(0, 5, 15, 0, Math.PI * 2);
    ctx.fill();

    const armBodyR = ctx.createLinearGradient(-12, 10, 12, 10);
    armBodyR.addColorStop(0, '#0D47A1');
    armBodyR.addColorStop(0.5, '#1565C0');
    armBodyR.addColorStop(1, '#0D47A1');
    ctx.fillStyle = armBodyR;
    ctx.beginPath();
    ctx.moveTo(-10, 12);
    ctx.quadraticCurveTo(-14, 28, -12, 45);
    ctx.lineTo(12, 45);
    ctx.quadraticCurveTo(14, 28, 10, 12);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#0D47A1';
    ctx.beginPath();
    ctx.ellipse(2, 50, 14, 10, -0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = '#FF6F00';
    ctx.shadowBlur = 8;
    for (let i = 0; i < 4; i++) {
        const clawX = -8 + i * 7;
        const clawGrad = ctx.createLinearGradient(clawX, 52, clawX + 8, 68);
        clawGrad.addColorStop(0, '#FFB300');
        clawGrad.addColorStop(1, '#E65100');
        ctx.fillStyle = clawGrad;
        ctx.beginPath();
        ctx.moveTo(clawX - 3, 52);
        ctx.lineTo(clawX + 10, 65);
        ctx.lineTo(clawX + 3, 52);
        ctx.closePath();
        ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();

    // ========== CABEÇA DE KAIJU/DRAGÃO ==========
    // Base da cabeça
    const headGrad = ctx.createRadialGradient(px + pw/2, py + 5, 5, px + pw/2, py + 10, 35);
    headGrad.addColorStop(0, '#1976D2');
    headGrad.addColorStop(0.7, '#1565C0');
    headGrad.addColorStop(1, '#0D47A1');
    ctx.fillStyle = headGrad;

    ctx.beginPath();
    ctx.ellipse(px + pw/2, py + 8, 32, 26, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mandíbula/Focinho
    const snoutGrad = ctx.createRadialGradient(px + pw/2 + 5, py + 22, 0, px + pw/2, py + 22, 25);
    snoutGrad.addColorStop(0, '#1565C0');
    snoutGrad.addColorStop(1, '#0A2472');
    ctx.fillStyle = snoutGrad;

    ctx.beginPath();
    ctx.ellipse(px + pw/2, py + 22, 22, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Narinas com fumaça
    ctx.fillStyle = '#0A2472';
    ctx.beginPath();
    ctx.ellipse(px + pw/2 - 8, py + 18, 5, 4, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(px + pw/2 + 8, py + 18, 5, 4, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Fumaça das narinas
    if (Math.random() < 0.3 || player.isPowerActive) {
        ctx.fillStyle = 'rgba(100, 100, 100, 0.4)';
        for (let i = 0; i < 3; i++) {
            const smokeY = py + 12 - i * 6 - Math.random() * 5;
            const smokeSize = 4 + Math.random() * 3;
            ctx.beginPath();
            ctx.arc(px + pw/2 - 8 + Math.sin(time + i) * 3, smokeY, smokeSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px + pw/2 + 8 + Math.sin(time + i + 1) * 3, smokeY, smokeSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ========== OLHOS BRILHANTES DE MONSTRO ==========
    // Olho esquerdo
    ctx.shadowColor = '#FFC107';
    ctx.shadowBlur = 15;

    const eyeGradL = ctx.createRadialGradient(px + pw/2 - 16, py + 2, 0, px + pw/2 - 16, py + 3, 14);
    eyeGradL.addColorStop(0, '#FFEB3B');
    eyeGradL.addColorStop(0.5, '#FFC107');
    eyeGradL.addColorStop(1, '#FF8F00');
    ctx.fillStyle = eyeGradL;
    ctx.beginPath();
    ctx.ellipse(px + pw/2 - 16, py + 3, 12, 14, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // Olho direito
    const eyeGradR = ctx.createRadialGradient(px + pw/2 + 16, py + 2, 0, px + pw/2 + 16, py + 3, 14);
    eyeGradR.addColorStop(0, '#FFEB3B');
    eyeGradR.addColorStop(0.5, '#FFC107');
    eyeGradR.addColorStop(1, '#FF8F00');
    ctx.fillStyle = eyeGradR;
    ctx.beginPath();
    ctx.ellipse(px + pw/2 + 16, py + 3, 12, 14, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Pupilas verticais (estilo réptil)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(px + pw/2 - 14, py + 4, 4, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(px + pw/2 + 18, py + 4, 4, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Brilho nos olhos
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(px + pw/2 - 18, py, 3, 0, Math.PI * 2);
    ctx.arc(px + pw/2 + 14, py, 3, 0, Math.PI * 2);
    ctx.fill();

    // ========== DENTES AFIADOS ==========
    ctx.fillStyle = '#FFFFFF';
    // Dentes superiores
    for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(px + pw/2 + i * 7 - 3, py + 30);
        ctx.lineTo(px + pw/2 + i * 7, py + 38);
        ctx.lineTo(px + pw/2 + i * 7 + 3, py + 30);
        ctx.closePath();
        ctx.fill();
    }
    // Dentes inferiores (menores)
    for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(px + pw/2 + i * 8 - 2, py + 32);
        ctx.lineTo(px + pw/2 + i * 8, py + 26);
        ctx.lineTo(px + pw/2 + i * 8 + 2, py + 32);
        ctx.closePath();
        ctx.fill();
    }

    // ========== CHIFRES ÉPICOS ==========
    // Chifre esquerdo
    const hornGradL = ctx.createLinearGradient(px + pw/2 - 25, py - 5, px + pw/2 - 35, py - 35);
    hornGradL.addColorStop(0, '#FF6F00');
    hornGradL.addColorStop(0.5, '#FF8F00');
    hornGradL.addColorStop(1, '#FFA000');
    ctx.fillStyle = hornGradL;

    ctx.beginPath();
    ctx.moveTo(px + pw/2 - 22, py - 5);
    ctx.quadraticCurveTo(px + pw/2 - 30, py - 18, px + pw/2 - 35, py - 35);
    ctx.lineTo(px + pw/2 - 28, py - 32);
    ctx.quadraticCurveTo(px + pw/2 - 24, py - 18, px + pw/2 - 15, py - 8);
    ctx.closePath();
    ctx.fill();

    // Chifre direito
    const hornGradR = ctx.createLinearGradient(px + pw/2 + 25, py - 5, px + pw/2 + 35, py - 35);
    hornGradR.addColorStop(0, '#FF6F00');
    hornGradR.addColorStop(0.5, '#FF8F00');
    hornGradR.addColorStop(1, '#FFA000');
    ctx.fillStyle = hornGradR;

    ctx.beginPath();
    ctx.moveTo(px + pw/2 + 22, py - 5);
    ctx.quadraticCurveTo(px + pw/2 + 30, py - 18, px + pw/2 + 35, py - 35);
    ctx.lineTo(px + pw/2 + 28, py - 32);
    ctx.quadraticCurveTo(px + pw/2 + 24, py - 18, px + pw/2 + 15, py - 8);
    ctx.closePath();
    ctx.fill();

    // Chifres menores nas sobrancelhas
    ctx.fillStyle = '#FF6F00';
    ctx.beginPath();
    ctx.moveTo(px + pw/2 - 28, py - 2);
    ctx.lineTo(px + pw/2 - 38, py - 8);
    ctx.lineTo(px + pw/2 - 30, py + 2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(px + pw/2 + 28, py - 2);
    ctx.lineTo(px + pw/2 + 38, py - 8);
    ctx.lineTo(px + pw/2 + 30, py + 2);
    ctx.closePath();
    ctx.fill();

    // ========== FOGO DE DRAGÃO ==========
    if (player.isPowerActive || player.isFlying || Math.random() < 0.12) {
        const fireIntensity = player.isPowerActive ? 1.5 : 1;
        const fireSize = (40 + Math.sin(time * 3) * 20) * fireIntensity;

        // Chama principal
        const fireGrad = ctx.createLinearGradient(px + pw/2 + 20, py + 25, px + pw/2 + 20 + fireSize, py + 25);
        fireGrad.addColorStop(0, '#FFEB3B');
        fireGrad.addColorStop(0.2, '#FF9800');
        fireGrad.addColorStop(0.5, '#F44336');
        fireGrad.addColorStop(1, 'rgba(244, 67, 54, 0)');

        ctx.shadowColor = '#FF5722';
        ctx.shadowBlur = 25;
        ctx.fillStyle = fireGrad;

        // Chama ondulante
        ctx.beginPath();
        ctx.moveTo(px + pw/2 + 18, py + 22);
        ctx.quadraticCurveTo(px + pw/2 + 30 + Math.sin(time * 5) * 5, py + 18, px + pw/2 + fireSize, py + 20 + Math.sin(time * 8) * 8);
        ctx.quadraticCurveTo(px + pw/2 + fireSize - 10, py + 28, px + pw/2 + fireSize * 0.8, py + 28 + Math.sin(time * 6) * 5);
        ctx.quadraticCurveTo(px + pw/2 + 30 + Math.sin(time * 4) * 5, py + 32, px + pw/2 + 18, py + 32);
        ctx.closePath();
        ctx.fill();

        // Chamas internas (mais claras)
        const innerFireGrad = ctx.createLinearGradient(px + pw/2 + 20, py + 26, px + pw/2 + fireSize * 0.6, py + 26);
        innerFireGrad.addColorStop(0, '#FFFFFF');
        innerFireGrad.addColorStop(0.3, '#FFEB3B');
        innerFireGrad.addColorStop(1, 'rgba(255, 235, 59, 0)');
        ctx.fillStyle = innerFireGrad;

        ctx.beginPath();
        ctx.moveTo(px + pw/2 + 20, py + 24);
        ctx.quadraticCurveTo(px + pw/2 + 35, py + 22 + Math.sin(time * 7) * 3, px + pw/2 + fireSize * 0.5, py + 26);
        ctx.quadraticCurveTo(px + pw/2 + 35, py + 30 + Math.sin(time * 6) * 3, px + pw/2 + 20, py + 30);
        ctx.closePath();
        ctx.fill();

        // Faíscas
        for (let i = 0; i < 6; i++) {
            const sparkX = px + pw/2 + 25 + Math.random() * fireSize * 0.8;
            const sparkY = py + 20 + Math.random() * 15;
            ctx.fillStyle = Math.random() > 0.5 ? '#FFEB3B' : '#FF9800';
            ctx.beginPath();
            ctx.arc(sparkX, sparkY, 2 + Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    }
}

// Função auxiliar para retângulo arredondado
function roundRect(ctx, x, y, width, height, radius) {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// ==========================================
// DESENHO DE OBSTÁCULOS
// ==========================================

function drawObstacles() {
    const time = gameState.animationFrame * 0.02;

    obstacles.forEach(obs => {
        ctx.save();

        if (obs.type === 'flying') {
            drawDroneEnemy(obs, time);
        } else if (obs.type === 'high') {
            drawEnergyBarrier(obs, time);
        } else {
            drawTechCrate(obs, time);
        }

        ctx.restore();
    });
}

function drawDroneEnemy(obs, time) {
    const hover = Math.sin(time * 5 + obs.animOffset) * 5;
    const ox = obs.x, oy = obs.y + hover, ow = obs.width, oh = obs.height;

    // Corpo do drone
    const bodyGrad = ctx.createRadialGradient(ox + ow/2, oy + oh/2, 5, ox + ow/2, oy + oh/2, ow/2);
    bodyGrad.addColorStop(0, '#666');
    bodyGrad.addColorStop(0.7, '#333');
    bodyGrad.addColorStop(1, '#111');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(ox + ow/2, oy + oh/2, ow/2, oh/3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Olho vermelho
    ctx.fillStyle = '#FF0000';
    ctx.shadowColor = '#FF0000';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(ox + ow/2, oy + oh/2, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Hélices
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    const spin = time * 20;
    ctx.beginPath();
    ctx.ellipse(ox + 8, oy + oh/2, 15, 5, spin, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(ox + ow - 8, oy + oh/2, 15, 5, -spin, 0, Math.PI * 2);
    ctx.stroke();

    // Raio
    if (Math.sin(time * 8) > 0.5) {
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(ox + ow/2, oy + oh);
        ctx.lineTo(ox + ow/2, oy + oh + 50);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

function drawEnergyBarrier(obs, time) {
    const ox = obs.x, oy = obs.y, ow = obs.width, oh = obs.height;
    const pulse = 0.8 + Math.sin(time * 5 + obs.animOffset) * 0.2;

    // Base metálica
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(ox, oy + oh - 20, ow, 20);
    ctx.fillRect(ox, oy, ow, 10);

    // Barreira de energia
    const barrierGrad = ctx.createLinearGradient(ox, oy, ox + ow, oy);
    barrierGrad.addColorStop(0, `rgba(255, 0, 100, ${0.3 * pulse})`);
    barrierGrad.addColorStop(0.5, `rgba(255, 0, 100, ${0.8 * pulse})`);
    barrierGrad.addColorStop(1, `rgba(255, 0, 100, ${0.3 * pulse})`);
    ctx.fillStyle = barrierGrad;
    ctx.fillRect(ox + 5, oy + 10, ow - 10, oh - 30);

    // Linhas de energia
    ctx.strokeStyle = `rgba(255, 100, 150, ${pulse})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
        const yOffset = (time * 50 + i * 20) % oh;
        ctx.beginPath();
        ctx.moveTo(ox + 5, oy + 10 + yOffset % (oh - 30));
        ctx.lineTo(ox + ow - 5, oy + 10 + yOffset % (oh - 30));
        ctx.stroke();
    }

    // Brilho
    ctx.shadowColor = obs.color;
    ctx.shadowBlur = 30 * pulse;
    ctx.strokeStyle = obs.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(ox + 3, oy + 8, ow - 6, oh - 26);
    ctx.shadowBlur = 0;
}

function drawTechCrate(obs, time) {
    const ox = obs.x, oy = obs.y, ow = obs.width, oh = obs.height;

    // Sombra
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(ox + 5, oy + 5, ow, oh);

    // Caixa principal
    const crateGrad = ctx.createLinearGradient(ox, oy, ox, oy + oh);
    crateGrad.addColorStop(0, '#4A4A4A');
    crateGrad.addColorStop(0.3, '#3A3A3A');
    crateGrad.addColorStop(1, '#2A2A2A');
    ctx.fillStyle = crateGrad;
    ctx.fillRect(ox, oy, ow, oh);

    // Efeito 3D - topo
    ctx.fillStyle = '#5A5A5A';
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + 8, oy - 8);
    ctx.lineTo(ox + ow + 8, oy - 8);
    ctx.lineTo(ox + ow, oy);
    ctx.fill();

    // Efeito 3D - lado
    ctx.fillStyle = '#2A2A2A';
    ctx.beginPath();
    ctx.moveTo(ox + ow, oy);
    ctx.lineTo(ox + ow + 8, oy - 8);
    ctx.lineTo(ox + ow + 8, oy + oh - 8);
    ctx.lineTo(ox + ow, oy + oh);
    ctx.fill();

    // Faixas de perigo
    ctx.fillStyle = '#F39C12';
    for (let i = 0; i < ow + oh; i += 20) {
        ctx.beginPath();
        ctx.moveTo(ox + Math.min(i, ow), oy + Math.max(0, i - ow));
        ctx.lineTo(ox + Math.min(i + 10, ow), oy + Math.max(0, i - ow + 10));
        ctx.lineTo(ox + Math.min(i + 10, ow), oy + Math.min(i + 10, oh));
        ctx.lineTo(ox + Math.min(i, ow), oy + Math.min(i, oh));
        ctx.fill();
    }

    // Cantos metálicos
    ctx.fillStyle = '#666';
    ctx.fillRect(ox, oy, 10, 10);
    ctx.fillRect(ox + ow - 10, oy, 10, 10);
    ctx.fillRect(ox, oy + oh - 10, 10, 10);
    ctx.fillRect(ox + ow - 10, oy + oh - 10, 10, 10);

    // Luz de status
    const lightOn = Math.sin(time * 5 + obs.animOffset) > 0;
    ctx.fillStyle = lightOn ? '#00FF00' : '#003300';
    ctx.shadowColor = lightOn ? '#00FF00' : 'transparent';
    ctx.shadowBlur = lightOn ? 10 : 0;
    ctx.beginPath();
    ctx.arc(ox + ow/2, oy + 12, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

// ==========================================
// DESENHO DE POWER-UPS
// ==========================================

function drawPowerups() {
    const time = gameState.animationFrame * 0.03;

    powerups.forEach(pu => {
        ctx.save();

        const floatY = Math.sin(time * 3 + pu.animOffset) * 8;
        const px = pu.x, py = pu.y + floatY;
        const size = pu.width;
        const pulse = 1 + Math.sin(time * 5) * 0.1;
        const rotation = time * 2;

        switch(pu.type) {
            case 'speed':
                drawSpeedPowerup(px, py, size, pulse, rotation);
                break;
            case 'shield':
                drawShieldPowerup(px, py, size, pulse, rotation);
                break;
            case 'power':
                drawPowerPowerup(px, py, size, pulse, rotation);
                break;
            case 'points':
                drawPointsPowerup(px, py, size, pulse, rotation);
                break;
        }

        ctx.restore();
    });
}

function drawSpeedPowerup(px, py, size, pulse, rotation) {
    const cx = px + size/2, cy = py + size/2;

    // Aura
    ctx.beginPath();
    ctx.arc(cx, cy, size/2 * pulse + 8, 0, Math.PI * 2);
    const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, size/2 + 10);
    aura.addColorStop(0, 'rgba(243, 156, 18, 0.5)');
    aura.addColorStop(1, 'rgba(243, 156, 18, 0)');
    ctx.fillStyle = aura;
    ctx.fill();

    // Círculo base
    ctx.beginPath();
    ctx.arc(cx, cy, size/2 * pulse, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size/2);
    grad.addColorStop(0, '#FFF3CD');
    grad.addColorStop(0.5, '#F39C12');
    grad.addColorStop(1, '#D68910');
    ctx.fillStyle = grad;
    ctx.shadowColor = '#F39C12';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Raio
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.moveTo(cx + 6, cy - 15);
    ctx.lineTo(cx - 4, cy - 2);
    ctx.lineTo(cx + 4, cy - 2);
    ctx.lineTo(cx - 6, cy + 15);
    ctx.lineTo(cx + 4, cy + 2);
    ctx.lineTo(cx - 4, cy + 2);
    ctx.closePath();
    ctx.fill();
}

function drawShieldPowerup(px, py, size, pulse, rotation) {
    const cx = px + size/2, cy = py + size/2;

    // Aura
    ctx.beginPath();
    ctx.arc(cx, cy, size/2 * pulse + 8, 0, Math.PI * 2);
    const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, size/2 + 10);
    aura.addColorStop(0, 'rgba(52, 152, 219, 0.5)');
    aura.addColorStop(1, 'rgba(52, 152, 219, 0)');
    ctx.fillStyle = aura;
    ctx.fill();

    // Escudo
    ctx.beginPath();
    ctx.moveTo(cx, cy - size/2 * pulse);
    ctx.quadraticCurveTo(cx + size/2 * pulse, cy - size/4 * pulse, cx + size/2 * pulse, cy + size/6 * pulse);
    ctx.quadraticCurveTo(cx, cy + size/2 * pulse + 5, cx, cy + size/2 * pulse + 5);
    ctx.quadraticCurveTo(cx, cy + size/2 * pulse + 5, cx - size/2 * pulse, cy + size/6 * pulse);
    ctx.quadraticCurveTo(cx - size/2 * pulse, cy - size/4 * pulse, cx, cy - size/2 * pulse);

    const grad = ctx.createLinearGradient(cx - size/2, cy, cx + size/2, cy);
    grad.addColorStop(0, '#85C1E9');
    grad.addColorStop(0.5, '#3498DB');
    grad.addColorStop(1, '#2874A6');
    ctx.fillStyle = grad;
    ctx.shadowColor = '#3498DB';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Cruz
    ctx.fillStyle = '#FFF';
    ctx.fillRect(cx - 2, cy - 8, 4, 16);
    ctx.fillRect(cx - 8, cy - 2, 16, 4);
}

function drawPowerPowerup(px, py, size, pulse, rotation) {
    const cx = px + size/2, cy = py + size/2;

    // Partículas de fogo
    for (let i = 0; i < 8; i++) {
        const angle = rotation + i * (Math.PI / 4);
        const dist = size/2 + Math.sin(rotation * 3 + i) * 5;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(angle) * dist * 0.6, cy + Math.sin(angle) * dist * 0.6, 4 + Math.sin(rotation * 2 + i) * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(231, 76, 60, ${0.5 + Math.sin(rotation + i) * 0.3})`;
        ctx.fill();
    }

    // Círculo base
    ctx.beginPath();
    ctx.arc(cx, cy, size/2 * pulse, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size/2);
    grad.addColorStop(0, '#F5B7B1');
    grad.addColorStop(0.5, '#E74C3C');
    grad.addColorStop(1, '#922B21');
    ctx.fillStyle = grad;
    ctx.shadowColor = '#E74C3C';
    ctx.shadowBlur = 25;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Chama
    ctx.fillStyle = '#F39C12';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 12);
    ctx.quadraticCurveTo(cx + 10, cy - 5, cx + 8, cy + 5);
    ctx.quadraticCurveTo(cx, cy + 12, cx - 8, cy + 5);
    ctx.quadraticCurveTo(cx - 10, cy - 5, cx, cy - 12);
    ctx.fill();

    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawPointsPowerup(px, py, size, pulse, rotation) {
    const cx = px + size/2, cy = py + size/2;

    // Partículas
    for (let i = 0; i < 5; i++) {
        const angle = rotation * 0.5 + i * (Math.PI * 2 / 5);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(angle) * (size/2 + 10), cy + Math.sin(angle) * (size/2 + 10), 3, 0, Math.PI * 2);
        ctx.fillStyle = '#F1C40F';
        ctx.shadowColor = '#F1C40F';
        ctx.shadowBlur = 10;
        ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Estrela
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size/2);
    grad.addColorStop(0, '#FFF');
    grad.addColorStop(0.3, '#F9E79F');
    grad.addColorStop(0.7, '#F1C40F');
    grad.addColorStop(1, '#D4AC0D');
    ctx.fillStyle = grad;
    ctx.shadowColor = '#F1C40F';
    ctx.shadowBlur = 20;

    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const outerAngle = rotation + (i * Math.PI * 2 / 5) - Math.PI / 2;
        const innerAngle = outerAngle + Math.PI / 5;
        const outerR = size/2 * pulse;
        const innerR = size/4 * pulse;

        if (i === 0) ctx.moveTo(cx + Math.cos(outerAngle) * outerR, cy + Math.sin(outerAngle) * outerR);
        else ctx.lineTo(cx + Math.cos(outerAngle) * outerR, cy + Math.sin(outerAngle) * outerR);
        ctx.lineTo(cx + Math.cos(innerAngle) * innerR, cy + Math.sin(innerAngle) * innerR);
    }
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Brilho
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(cx - 4, cy - 4, 4, 0, Math.PI * 2);
    ctx.fill();
}

// ==========================================
// PARTÍCULAS E EFEITOS
// ==========================================

function drawParticles() {
    particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life;

        if (p.type === 'thruster') {
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            grad.addColorStop(0, p.color);
            grad.addColorStop(1, 'rgba(0, 150, 255, 0)');
            ctx.fillStyle = grad;
        } else {
            ctx.fillStyle = p.color;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

function drawEffects() {
    // Efeito de borda quando poder está pronto
    if (player.powerCharge >= 100) {
        const pulse = 0.5 + Math.sin(gameState.animationFrame * 0.1) * 0.3;
        ctx.strokeStyle = `rgba(46, 204, 113, ${pulse})`;
        ctx.lineWidth = 5;
        ctx.shadowColor = '#2ECC71';
        ctx.shadowBlur = 20;
        ctx.strokeRect(5, 5, CONFIG.CANVAS_WIDTH - 10, CONFIG.CANVAS_HEIGHT - 10);
        ctx.shadowBlur = 0;
    }

    // Efeitos especiais por personagem
    drawCharacterEffects();
}

function drawCharacterEffects() {
    const level = getModifiedLevel(gameState.currentLevel);
    const time = gameState.animationFrame * 0.05;

    if (!level.characterEffect) return;

    ctx.save();

    switch(level.characterEffect) {
        case 'microbots':
            // Partículas de microbots flutuando
            ctx.globalAlpha = 0.3;
            for (let i = 0; i < 15; i++) {
                const x = (Math.sin(time + i * 0.7) * 50 + i * 60) % CONFIG.CANVAS_WIDTH;
                const y = 100 + Math.sin(time * 2 + i) * 30 + i * 15;
                ctx.fillStyle = '#1A1A1A';
                ctx.beginPath();
                ctx.arc(x, y, 3 + Math.sin(time + i) * 1, 0, Math.PI * 2);
                ctx.fill();
            }
            break;

        case 'healing':
            // Cruzes médicas flutuantes
            ctx.globalAlpha = 0.15;
            ctx.fillStyle = '#4CAF50';
            for (let i = 0; i < 8; i++) {
                const x = (i * 120 + time * 20) % CONFIG.CANVAS_WIDTH;
                const y = 80 + Math.sin(time + i) * 20;
                // Cruz
                ctx.fillRect(x - 2, y - 8, 4, 16);
                ctx.fillRect(x - 8, y - 2, 16, 4);
            }
            break;

        case 'speedlines':
            // Linhas de velocidade
            ctx.globalAlpha = 0.2;
            ctx.strokeStyle = level.characterParticleColor;
            ctx.lineWidth = 2;
            for (let i = 0; i < 20; i++) {
                const y = 50 + i * 25;
                const startX = Math.sin(time * 3 + i) * 100;
                ctx.beginPath();
                ctx.moveTo(startX, y);
                ctx.lineTo(startX + 100 + Math.random() * 50, y);
                ctx.stroke();
            }
            break;

        case 'plasma':
            // Raios de plasma
            ctx.globalAlpha = 0.2;
            ctx.strokeStyle = level.characterParticleColor;
            ctx.lineWidth = 2;
            for (let i = 0; i < 6; i++) {
                const x = (i * 150 + time * 30) % CONFIG.CANVAS_WIDTH;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                for (let j = 0; j < 10; j++) {
                    const py = j * 60;
                    const px = x + Math.sin(time * 5 + j + i) * 20;
                    ctx.lineTo(px, py);
                }
                ctx.stroke();
            }
            break;

        case 'bubbles':
            // Bolhas químicas coloridas
            const bubbleColors = ['#FF69B4', '#00FFFF', '#FFFF00', '#00FF00', '#FF00FF'];
            ctx.globalAlpha = 0.25;
            for (let i = 0; i < 12; i++) {
                const x = (i * 80 + Math.sin(time + i) * 20) % CONFIG.CANVAS_WIDTH;
                const y = CONFIG.CANVAS_HEIGHT - 100 - ((time * 30 + i * 50) % 400);
                const size = 10 + Math.sin(time + i) * 5;
                ctx.fillStyle = bubbleColors[i % bubbleColors.length];
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                // Brilho
                ctx.fillStyle = 'rgba(255,255,255,0.5)';
                ctx.beginPath();
                ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
            break;

        case 'fire':
            // Chamas no fundo
            ctx.globalAlpha = 0.15;
            for (let i = 0; i < 10; i++) {
                const x = i * 90;
                const flameHeight = 80 + Math.sin(time * 3 + i) * 30;

                const flameGrad = ctx.createLinearGradient(x, CONFIG.CANVAS_HEIGHT, x, CONFIG.CANVAS_HEIGHT - flameHeight);
                flameGrad.addColorStop(0, '#FF6600');
                flameGrad.addColorStop(0.5, '#FF3300');
                flameGrad.addColorStop(1, 'rgba(255, 0, 0, 0)');
                ctx.fillStyle = flameGrad;

                ctx.beginPath();
                ctx.moveTo(x - 30, CONFIG.CANVAS_HEIGHT);
                ctx.quadraticCurveTo(x - 10, CONFIG.CANVAS_HEIGHT - flameHeight * 0.6, x, CONFIG.CANVAS_HEIGHT - flameHeight);
                ctx.quadraticCurveTo(x + 10, CONFIG.CANVAS_HEIGHT - flameHeight * 0.6, x + 30, CONFIG.CANVAS_HEIGHT);
                ctx.closePath();
                ctx.fill();
            }
            break;
    }

    ctx.restore();
}

// ==========================================
// HUD E TIMER
// ==========================================

function updateHUD() {
    const el = id => document.getElementById(id);
    if (el('current-level')) el('current-level').textContent = gameState.currentLevel;
    if (el('score')) el('score').textContent = gameState.score;

    const progress = Math.min(100, (gameState.score / CONFIG.POINTS_PER_PHASE) * 100);
    if (el('progress-fill')) el('progress-fill').style.width = `${progress}%`;

    const powerFill = el('power-fill');
    if (powerFill) {
        powerFill.style.width = `${player.powerCharge}%`;
        powerFill.classList.toggle('ready', player.powerCharge >= 100);
    }
}

function updateGameTimer() {
    if (gameState.isPaused || !gameState.isPlaying) return;

    gameState.timeRemaining--;

    const minutes = Math.floor(gameState.timeRemaining / 60);
    const seconds = gameState.timeRemaining % 60;
    const timerEl = document.getElementById('timer');

    if (timerEl) {
        timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        timerEl.classList.toggle('danger', gameState.timeRemaining <= 30);
        timerEl.classList.toggle('warning', gameState.timeRemaining > 30 && gameState.timeRemaining <= 60);
    }

    if (player.powerCharge < 100) player.powerCharge += 0.5;
    if (gameState.timeRemaining <= 0) levelComplete();
}

// ==========================================
// CONTROLES DO JOGO
// ==========================================

function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    const pauseMenu = document.getElementById('pause-menu');
    if (pauseMenu) pauseMenu.classList.toggle('hidden', !gameState.isPaused);
}

function resumeGame() {
    gameState.isPaused = false;
    document.getElementById('pause-menu')?.classList.add('hidden');
}

function restartLevel() {
    gameState.isPlaying = false;
    if (gameTimer) clearInterval(gameTimer);
    startGame();
}

function quitToMenu() {
    gameState.isPlaying = false;
    if (gameTimer) clearInterval(gameTimer);
    // Mostrar botao de voltar
    const backBtn = document.getElementById('back-to-portal');
    if (backBtn) backBtn.style.display = 'flex';
    showScreen('menu');
}

function nextLevel() {
    if (gameState.currentLevel < 5) {
        gameState.currentLevel++;
        startGame();
    } else {
        quitToMenu();
    }
}

// ==========================================
// FIM DE JOGO
// ==========================================

function gameOver(reason) {
    gameState.isPlaying = false;
    if (gameTimer) clearInterval(gameTimer);

    // Mostrar botao de voltar
    const backBtn = document.getElementById('back-to-portal');
    if (backBtn) backBtn.style.display = 'flex';

    const el = id => document.getElementById(id);
    if (el('gameover-reason')) el('gameover-reason').textContent = reason;
    if (el('gameover-score')) el('gameover-score').textContent = gameState.score;

    showScreen('gameover');
}

function levelComplete() {
    gameState.isPlaying = false;
    if (gameTimer) clearInterval(gameTimer);

    // Mostrar botao de voltar
    const backBtn = document.getElementById('back-to-portal');
    if (backBtn) backBtn.style.display = 'flex';

    const timeUsed = CONFIG.PHASE_DURATION - gameState.timeRemaining;
    const minutes = Math.floor(timeUsed / 60);
    const seconds = timeUsed % 60;

    const el = id => document.getElementById(id);
    if (el('result-title')) el('result-title').textContent = 'FASE COMPLETA!';
    if (el('final-score')) el('final-score').textContent = gameState.score;
    if (el('final-time')) el('final-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    if (el('obstacles-passed')) el('obstacles-passed').textContent = gameState.obstaclesPassed;
    if (el('powerups-collected')) el('powerups-collected').textContent = gameState.powerupsCollected;

    const stars = calculateStars();
    document.querySelectorAll('#stars-earned .star').forEach((star, i) => {
        setTimeout(() => {
            star.classList.toggle('earned', i < stars);
            star.textContent = i < stars ? '★' : '☆';
        }, i * 300);
    });

    if (stars >= 1 && gameState.currentLevel < 5) {
        const next = gameState.currentLevel + 1;
        if (!gameState.unlockedLevels.includes(next)) {
            gameState.unlockedLevels.push(next);
            saveGameData();
        }
    }

    const nextBtn = document.getElementById('next-level-btn');
    if (nextBtn) {
        nextBtn.style.display = gameState.currentLevel < 5 && gameState.unlockedLevels.includes(gameState.currentLevel + 1) ? 'block' : 'none';
    }

    showScreen('result');
}

function calculateStars() {
    let stars = 1;
    if (gameState.score >= 500) stars++;
    if (gameState.score >= CONFIG.POINTS_PER_PHASE) stars++;
    return stars;
}

// ==========================================
// PERSISTÊNCIA
// ==========================================

function saveGameData() {
    try {
        localStorage.setItem('bigHeroGame', JSON.stringify({
            unlockedLevels: gameState.unlockedLevels,
            highScores: gameState.highScores
        }));
    } catch (e) {}
}

function loadGameData() {
    try {
        const data = localStorage.getItem('bigHeroGame');
        if (data) {
            const parsed = JSON.parse(data);
            gameState.unlockedLevels = parsed.unlockedLevels || [1];
            gameState.highScores = parsed.highScores || {};
        }
    } catch (e) {}
}

// Utilitário
function shadeColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}
