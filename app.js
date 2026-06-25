// Elementos DOM
const attackBtn = document.getElementById('attackBtn');
const bossHpBar = document.getElementById('bossHpBar');
const bossHpText = document.getElementById('bossHpText');
const comboCounter = document.getElementById('comboCounter');
const comboNumber = document.getElementById('comboNumber');
const specialBar = document.getElementById('specialBar');
const specialPercent = document.getElementById('specialPercent');
const interactiveArena = document.getElementById('interactiveArena');
const flashOverlay = document.getElementById('flashOverlay');
const consoleLogs = document.getElementById('consoleLogs');
const gameContainer = document.getElementById('gameContainer');

// Elementos de estatísticas
const statHits = document.getElementById('statHits');
const statDmg = document.getElementById('statDmg');
const statCrits = document.getElementById('statCrits');

// Variáveis de Estado
let bossMaxHp = 10000;
let bossHp = bossMaxHp;
let combo = 0;
let comboTimer = null;
let specialProgress = 0;
let totalHits = 0;
let totalDamage = 0;
let critHits = 0;

// Configuração do Canvas de Partículas
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = gameContainer.clientWidth;
    canvas.height = gameContainer.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Classe de Partícula
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 2;
        this.speedX = (Math.random() - 0.5) * 8;
        this.speedY = (Math.random() - 0.5) * 8;
        this.color = color;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.015;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += 0.05; // gravidade leve
        this.alpha -= this.decay;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
    }
}

let particlesArray = [];

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();

        if (particlesArray[i].alpha <= 0) {
            particlesArray.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();

// Função para criar faíscas no Canvas
function spawnParticles(x, y, type) {
    const rect = canvas.getBoundingClientRect();
    const canvasX = x - rect.left;
    const canvasY = y - rect.top;
    
    let colors = ['#ff2e93', '#ff8a00', '#ffffff'];
    if (type === 'crit') colors = ['#ffd700', '#ffae00', '#ffffff'];
    if (type === 'special') colors = ['#00ffff', '#00bcff', '#ffffff'];

    for (let i = 0; i < 20; i++) {
        particlesArray.push(new Particle(canvasX, canvasY, colors[Math.floor(Math.random() * colors.length)]));
    }
}

// Helper para Logar no Console UI & DevConsole
function addLog(message, type = 'attack') {
    const now = new Date();
    const timeStr = `[${now.toTimeString().split(' ')[0]}]`;
    
    // Log no console real do desenvolvedor
    const logPrefix = `[Game Engine][${type.toUpperCase()}]`;
    if (type === 'git') console.log(`%c${logPrefix} ${message}`, 'color: #ff8a00; font-weight: bold;');
    else if (type === 'network') console.log(`%c${logPrefix} ${message}`, 'color: #10b981;');
    else if (type === 'crit') console.log(`%c${logPrefix} ${message}`, 'color: #ffd700; font-weight: bold;');
    else console.log(`${logPrefix} ${message}`);

    // Log na UI do Jogo
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.innerHTML = `<span class="log-time">${timeStr}</span> <span class="log-text">${message}</span>`;
    consoleLogs.appendChild(logEntry);
    
    // Auto-scroll
    consoleLogs.scrollTop = consoleLogs.scrollHeight;
}

// Função para criar número de dano flutuante
function spawnDamageNumber(x, y, damage, type) {
    const rect = interactiveArena.getBoundingClientRect();
    const localX = x - rect.left;
    const localY = y - rect.top;

    const dmgEl = document.createElement('div');
    dmgEl.className = `damage-number ${type}`;
    dmgEl.style.left = `${localX}px`;
    dmgEl.style.top = `${localY}px`;
    
    let text = `${damage}`;
    if (type === 'crit') text = `CRIT! ${damage}`;
    if (type === 'special') text = `GIT PUSH! ${damage}`;
    dmgEl.innerText = text;

    interactiveArena.appendChild(dmgEl);

    // Remove após animação
    setTimeout(() => {
        dmgEl.remove();
    }, 800);
}

// Executa Efeito de Tremer (Screen Shake)
function triggerScreenShake() {
    gameContainer.classList.add('shake');
    setTimeout(() => {
        gameContainer.classList.remove('shake');
    }, 150);
}

// Flash na Tela
function triggerFlash() {
    flashOverlay.style.opacity = '0.7';
    setTimeout(() => {
        flashOverlay.style.opacity = '0';
    }, 100);
}

// Incrementa o Combo
function incrementCombo() {
    combo++;
    comboNumber.innerText = combo;
    comboCounter.classList.add('active');
    
    // Animação de pop no combo
    comboNumber.style.transform = 'scale(1.3)';
    setTimeout(() => {
        comboNumber.style.transform = 'scale(1)';
    }, 100);

    clearTimeout(comboTimer);
    comboTimer = setTimeout(() => {
        decayCombo();
    }, 1800);
}

// Reseta o Combo
function decayCombo() {
    combo = 0;
    comboCounter.classList.remove('active');
    addLog("Combo interrompido!", "system");
}

// Atualiza Estatísticas Gerais
function updateStats() {
    statHits.innerText = totalHits;
    statDmg.innerText = totalDamage.toLocaleString();
    const critRate = totalHits > 0 ? Math.round((critHits / totalHits) * 100) : 0;
    statCrits.innerText = `${critRate}%`;
}

// Disparar requisição de API (Simulada)
function simulateApiRequest(damage, isCrit, currentCombo) {
    const requestId = Math.random().toString(36).substring(2, 9);
    addLog(`Enviando POST /api/attack - ID: ${requestId} - Dmg: ${damage} - Combo: ${currentCombo}`, "network");
    
    // Simula resposta de rede
    setTimeout(() => {
        addLog(`POST /api/attack [200 OK] - ID: ${requestId} registrado no banco de dados.`, "network");
    }, 450);
}

// Lógica de Ataque Principal
function executeAttack(e) {
    // Pega as coordenadas exatas do clique
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;

    totalHits++;

    // Lógica de Dano e Crítico
    const isCrit = Math.random() < 0.25; // 25% de chance de crítico
    let damage = Math.floor(Math.random() * 80) + 100; // Dano base 100-180
    
    if (isCrit) {
        damage = Math.floor(damage * 2.2);
        critHits++;
    }

    // Bônus de Combo
    if (combo > 1) {
        damage = Math.floor(damage * (1 + (combo * 0.05))); // 5% a mais por hit
    }

    // Aplica o dano ao Boss
    bossHp -= damage;
    if (bossHp <= 0) {
        bossHp = 0;
        addLog("⚔️ O Dragão da Fragmentação foi derrotado! Renascendo...", "git");
        setTimeout(() => {
            bossHp = bossMaxHp;
            bossHpBar.style.width = '100%';
            bossHpText.innerText = `${bossMaxHp.toLocaleString()} / ${bossMaxHp.toLocaleString()} HP`;
            addLog("Um novo Dragão surgiu na arena!", "system");
        }, 1500);
    }

    // Atualiza HP na tela
    const hpPercent = (bossHp / bossMaxHp) * 100;
    bossHpBar.style.width = `${hpPercent}%`;
    bossHpText.innerText = `${Math.ceil(bossHp).toLocaleString()} / ${bossMaxHp.toLocaleString()} HP`;

    // Incrementa Combo e Estatísticas
    incrementCombo();
    totalDamage += damage;
    updateStats();

    // Tipo de Dano
    const dmgType = isCrit ? 'crit' : 'normal';
    
    // Tocar Som
    if (isCrit) {
        playCritSound();
    } else {
        playAttackSound();
    }
    
    // Logs de Combate
    if (isCrit) {
        addLog(`💥 ATAQUE CRÍTICO! Causou ${damage} de dano ao Boss!`, "crit");
    } else {
        addLog(`⚔️ Ataque físico causou ${damage} de dano.`, "attack");
    }

    // Spawn de Partículas e Animação de Dano
    spawnParticles(clientX, clientY, dmgType);
    spawnDamageNumber(clientX, clientY, damage, dmgType);
    triggerScreenShake();

    // Simulação da Requisição
    simulateApiRequest(damage, isCrit, combo);

    // Carrega o Especial (Mana / Git Push)
    if (specialProgress < 100) {
        specialProgress += 5; // 5% por hit
        if (specialProgress > 100) specialProgress = 100;
        
        specialBar.style.width = `${specialProgress}%`;
        specialPercent.innerText = `${specialProgress}%`;

        // Se atingiu o máximo
        if (specialProgress === 100) {
            specialBar.style.background = 'linear-gradient(90deg, #00ffff, #00ff66)';
            specialBar.style.boxShadow = '0 0 15px rgba(0, 255, 102, 0.8)';
            addLog("🔥 PODER ESPECIAL PRONTO! Dê um clique duplo rápido no Botão de Ataque para descarregar o GIT PUSH!", "git");
        }
    }
}

// Lógica do Especial (Double Click no Botão)
function executeSpecial(e) {
    if (specialProgress < 100) return;

    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;

    // Grande Dano Especial
    const specialDmg = 2500;
    bossHp -= specialDmg;
    if (bossHp < 0) bossHp = 0;

    // Atualiza HP na tela
    const hpPercent = (bossHp / bossMaxHp) * 100;
    bossHpBar.style.width = `${hpPercent}%`;
    bossHpText.innerText = `${Math.ceil(bossHp).toLocaleString()} / ${bossMaxHp.toLocaleString()} HP`;

    // Logs e Efeitos Visuais
    addLog("🚀 EXECUTANDO: git push -u origin main", "git");
    addLog(`✨ Dano massivo! Especial causou ${specialDmg} de dano de push!`, "git");
    
    playSpecialSound();
    triggerFlash();
    spawnParticles(clientX, clientY, 'special');
    spawnDamageNumber(clientX, clientY, specialDmg, 'special');
    triggerScreenShake();
    
    // Reseta barra especial
    specialProgress = 0;
    specialBar.style.width = '0%';
    specialBar.style.background = 'linear-gradient(90deg, var(--accent), #00bcff)';
    specialBar.style.boxShadow = '0 0 8px var(--accent-glow)';
    specialPercent.innerText = '0%';

    totalHits++;
    totalDamage += specialDmg;
    updateStats();

    // Simulação da Requisição do Push
    const requestId = Math.random().toString(36).substring(2, 9);
    addLog(`Enviando POST /api/push - ID: ${requestId} - Push Payload: {branch: 'main'}`, "network");
    setTimeout(() => {
        addLog(`POST /api/push [200 OK] - Repositório GitHub atualizado com sucesso! (Simulado)`, "network");
    }, 700);
}

// Event Listeners
attackBtn.addEventListener('click', (e) => {
    // Se o Especial estiver pronto, aguarda o duplo clique ou ativa com cliques adicionais
    executeAttack(e);
});

attackBtn.addEventListener('dblclick', (e) => {
    if (specialProgress === 100) {
        executeSpecial(e);
    }
});

// Suporte para Mobile/Touch
attackBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    executeAttack(e);
}, { passive: false });

// --- SISTEMA DE ÁUDIO WEB (Sintetizador Web Audio API) ---
let audioCtx = null;
let isMuted = false;

const muteBtn = document.getElementById('muteBtn');

// Inicializa ou recupera o contexto de áudio
function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

// Alternar mute
muteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    if (isMuted) {
        muteBtn.classList.add('muted');
        muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> Mudo';
        addLog("Sons desativados.", "system");
    } else {
        muteBtn.classList.remove('muted');
        muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> Som Ativo';
        getAudioContext();
        addLog("Sons ativados.", "system");
    }
});

// Som de Ataque Normal (Metal Slash)
function playAttackSound() {
    if (isMuted) return;
    try {
        const ctx = getAudioContext();
        const time = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, time);
        osc.frequency.exponentialRampToValueAtTime(150, time + 0.12);
        
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(time);
        osc.stop(time + 0.13);
    } catch(e) {
        console.error("Erro ao tocar som de ataque:", e);
    }
}

// Som de Ataque Crítico (Metal Hit + Laser Beam)
function playCritSound() {
    if (isMuted) return;
    try {
        const ctx = getAudioContext();
        const time = ctx.currentTime;
        
        // Canal 1: Frequência alta (impacto afiado)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(1500, time);
        osc1.frequency.exponentialRampToValueAtTime(100, time + 0.25);
        gain1.gain.setValueAtTime(0.2, time);
        gain1.gain.exponentialRampToValueAtTime(0.01, time + 0.25);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        
        // Canal 2: Sub-grave (explosão)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(90, time);
        osc2.frequency.exponentialRampToValueAtTime(40, time + 0.3);
        gain2.gain.setValueAtTime(0.3, time);
        gain2.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + 0.26);
        osc2.stop(time + 0.31);
    } catch(e) {
        console.error("Erro ao tocar som crítico:", e);
    }
}

// Som de Especial Git Push (Charging + Cyber Blast)
function playSpecialSound() {
    if (isMuted) return;
    try {
        const ctx = getAudioContext();
        const time = ctx.currentTime;
        
        // 1. Charge Sound (subida rápida de pitch)
        const oscCharge = ctx.createOscillator();
        const gainCharge = ctx.createGain();
        oscCharge.type = 'sawtooth';
        oscCharge.frequency.setValueAtTime(100, time);
        oscCharge.frequency.exponentialRampToValueAtTime(1800, time + 0.35);
        gainCharge.gain.setValueAtTime(0.01, time);
        gainCharge.gain.linearRampToValueAtTime(0.12, time + 0.25);
        gainCharge.gain.exponentialRampToValueAtTime(0.01, time + 0.35);
        oscCharge.connect(gainCharge);
        gainCharge.connect(ctx.destination);
        oscCharge.start(time);
        oscCharge.stop(time + 0.36);
        
        // 2. Blast Sound (explosão gigante posterior)
        setTimeout(() => {
            if (isMuted) return;
            try {
                const blastCtx = getAudioContext();
                const blastTime = blastCtx.currentTime;
                const oscBlast = blastCtx.createOscillator();
                const gainBlast = blastCtx.createGain();
                
                oscBlast.type = 'square';
                oscBlast.frequency.setValueAtTime(200, blastTime);
                oscBlast.frequency.exponentialRampToValueAtTime(30, blastTime + 0.6);
                
                gainBlast.gain.setValueAtTime(0.4, blastTime);
                gainBlast.gain.exponentialRampToValueAtTime(0.01, blastTime + 0.6);
                
                oscBlast.connect(gainBlast);
                gainBlast.connect(blastCtx.destination);
                
                oscBlast.start(blastTime);
                oscBlast.stop(blastTime + 0.61);
            } catch(err) {
                console.error(err);
            }
        }, 250);
    } catch(e) {
        console.error("Erro ao tocar som especial:", e);
    }
}

