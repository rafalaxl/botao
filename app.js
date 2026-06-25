// Elementos DOM
const btnAtacar = document.getElementById('btnAtacar');
const btnGitPush = document.getElementById('btnGitPush');
const muteBtn = document.getElementById('muteBtn');
const muteText = document.getElementById('muteText');

const bossHpBar = document.getElementById('bossHpBar');
const bossHpText = document.getElementById('bossHpText');
const enemyCard = document.getElementById('enemyCard');

const characterSprite = document.getElementById('characterSprite');
const comboCounter = document.getElementById('comboCounter');
const comboNumber = document.getElementById('comboNumber');
const battleMessageBox = document.getElementById('battleMessageBox');

const specialBar = document.getElementById('specialBar');
const specialPercent = document.getElementById('specialPercent');
const atbBar = document.getElementById('atbBar');

const flashOverlay = document.getElementById('flashOverlay');
const consoleLogs = document.getElementById('consoleLogs');
const gameContainer = document.getElementById('gameContainer');

// Elementos de estatísticas
const statHits = document.getElementById('statHits');
const statDmg = document.getElementById('statDmg');
const statCrits = document.getElementById('statCrits');

// Variáveis de Estado do Jogo
let bossMaxHp = 10000;
let bossHp = bossMaxHp;
let combo = 0;
let comboTimer = null;
let specialProgress = 0;
let totalHits = 0;
let totalDamage = 0;
let critHits = 0;

// Estado do ATB (Active Time Battle)
let atbProgress = 0;
let atbReady = false;
const ATB_AUTO_INCREMENT = 2; // Incremento automático a cada frame (~120ms)
const ATB_CLICK_BOOST = 25;   // Boost ao clicar na tela quando não está pronto

// Mapeamento dos Frames da Spritesheet (Coordenadas background-position em %)
const spriteFrames = {
    idle: [0, 0],
    normal: [
        [0, 0],    // Frame 1
        [50, 0],   // Frame 2
        [100, 0]   // Frame 3
    ],
    crit: [
        [0, 50],   // Frame 4
        [50, 50],  // Frame 5
        [100, 50]  // Frame 6
    ],
    special: [
        [0, 100],  // Frame 7
        [50, 100], // Frame 8
        [100, 100] // Frame 9
    ]
};

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
        this.speedY += 0.05;
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

// Controladores do Sprite
function setSpriteFrame(xPercent, yPercent) {
    characterSprite.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
}

let animTimeout = null;
function playSpriteAnimation(type) {
    if (animTimeout) clearTimeout(animTimeout);
    
    const frames = spriteFrames[type];
    if (!frames) return;
    
    // Roda a sequência de 3 quadros
    setSpriteFrame(frames[0][0], frames[0][1]);
    
    setTimeout(() => {
        setSpriteFrame(frames[1][0], frames[1][1]);
        
        setTimeout(() => {
            setSpriteFrame(frames[2][0], frames[2][1]);
            
            // Retorna ao frame idle
            animTimeout = setTimeout(() => {
                setSpriteFrame(spriteFrames.idle[0], spriteFrames.idle[1]);
            }, 180);
        }, 100);
    }, 100);
}

// Logs no Console e UI
function addLog(message, type = 'attack') {
    const now = new Date();
    const timeStr = `[${now.toTimeString().split(' ')[0]}]`;
    
    const logPrefix = `[Game Engine][${type.toUpperCase()}]`;
    console.log(`%c${logPrefix} ${message}`, 'font-family: monospace;');

    const logEntry = document.createElement('div');
    logEntry.className = `log-line ${type}`;
    logEntry.innerHTML = `<span class="log-time">${timeStr}</span> ${message}`;
    consoleLogs.appendChild(logEntry);
    
    consoleLogs.scrollTop = consoleLogs.scrollHeight;
}

// Mensagens JRPG na caixa de diálogo
function showBattleMessage(text, duration = 2000) {
    battleMessageBox.innerText = text;
}

// Números de Dano Retro
function spawnDamageNumber(x, y, damage, type) {
    const rect = gameContainer.getBoundingClientRect();
    const localX = x - rect.left;
    const localY = y - rect.top - 80; // Ajusta altura

    const dmgEl = document.createElement('div');
    dmgEl.className = `damage-number ${type}`;
    dmgEl.style.left = `${localX}px`;
    dmgEl.style.top = `${localY}px`;
    
    let text = `${damage}`;
    if (type === 'crit') text = `CRIT! ${damage}`;
    if (type === 'special') text = `GIT PUSH! ${damage}`;
    dmgEl.innerText = text;

    gameContainer.appendChild(dmgEl);

    setTimeout(() => {
        dmgEl.remove();
    }, 700);
}

function triggerScreenShake() {
    gameContainer.classList.add('shake');
    setTimeout(() => {
        gameContainer.classList.remove('shake');
    }, 150);
}

function triggerFlash() {
    flashOverlay.style.opacity = '0.6';
    setTimeout(() => {
        flashOverlay.style.opacity = '0';
    }, 100);
}

// Sistema de Combo
function incrementCombo() {
    combo++;
    comboNumber.innerText = combo;
    comboCounter.classList.add('active');
    
    clearTimeout(comboTimer);
    comboTimer = setTimeout(() => {
        combo = 0;
        comboCounter.classList.remove('active');
    }, 1800);
}

// Sistema ATB Automático
function updateATB() {
    if (!atbReady) {
        atbProgress += ATB_AUTO_INCREMENT;
        if (atbProgress >= 100) {
            atbProgress = 100;
            atbReady = true;
            atbBar.classList.add('ready');
            btnAtacar.classList.add('active');
            if (specialProgress === 100) {
                btnGitPush.classList.remove('locked');
                btnGitPush.classList.add('active');
            }
        }
        atbBar.style.width = `${atbProgress}%`;
    }
}
// Roda o loop do ATB
setInterval(updateATB, 60);

// Executa Ataque Físico
function executeAttack(e) {
    // Coordenadas de clique para partículas/números
    const clientX = e.clientX || window.innerWidth / 2;
    const clientY = e.clientY || window.innerHeight / 2 - 100;

    // Se o ATB não estiver pronto, dar boost de carregamento (Hack & Slash clicker!)
    if (!atbReady) {
        atbProgress += ATB_CLICK_BOOST;
        if (atbProgress >= 100) {
            atbProgress = 100;
            atbReady = true;
            atbBar.classList.add('ready');
            btnAtacar.classList.add('active');
            playAttackSound(); // feedback sonoro leve de carga
        }
        atbBar.style.width = `${atbProgress}%`;
        
        // Spawn faíscas rápidas azuis de carga
        spawnParticles(clientX, clientY, 'special');
        return;
    }

    // Se o ATB está pronto, consome e ataca!
    atbProgress = 0;
    atbReady = false;
    atbBar.classList.remove('ready');
    btnAtacar.classList.remove('active');

    totalHits++;

    const isCrit = Math.random() < 0.25;
    let damage = Math.floor(Math.random() * 80) + 120; // 120-200 base
    
    if (isCrit) {
        damage = Math.floor(damage * 2.2);
        critHits++;
    }

    if (combo > 1) {
        damage = Math.floor(damage * (1 + (combo * 0.05)));
    }

    // Deduz HP do Boss
    bossHp -= damage;
    if (bossHp <= 0) {
        bossHp = 0;
        addLog("⚔️ Conflict Dragon derrotado! Renascendo...", "git");
        showBattleMessage("Conflict Dragon foi derrotado!");
        triggerFlash();
        setTimeout(() => {
            bossHp = bossMaxHp;
            bossHpBar.style.width = '100%';
            bossHpText.innerText = `${bossMaxHp.toLocaleString()} / ${bossMaxHp.toLocaleString()}`;
            showBattleMessage("Conflict Dragon ressuscitou!");
            addLog("Um novo Dragão surgiu na arena!", "system");
        }, 1500);
    }

    // Atualiza barras
    const hpPercent = (bossHp / bossMaxHp) * 100;
    bossHpBar.style.width = `${hpPercent}%`;
    bossHpText.innerText = `${Math.ceil(bossHp).toLocaleString()} / ${bossMaxHp.toLocaleString()}`;

    incrementCombo();
    totalDamage += damage;
    
    // Atualiza estatísticas na tela
    statHits.innerText = totalHits;
    statDmg.innerText = totalDamage.toLocaleString();
    const critRate = totalHits > 0 ? Math.round((critHits / totalHits) * 100) : 0;
    statCrits.innerText = `${critRate}%`;

    const dmgType = isCrit ? 'crit' : 'normal';

    // Sons e animações correspondentes
    if (isCrit) {
        playCritSound();
        playSpriteAnimation('crit');
        showBattleMessage(`Rafael desfere ATAQUE CRÍTICO! -${damage} HP`);
        addLog(`💥 ATAQUE CRÍTICO! Causou ${damage} de dano ao Boss!`, "crit");
    } else {
        playAttackSound();
        playSpriteAnimation('normal');
        showBattleMessage(`Rafael ataca! -${damage} HP`);
        addLog(`⚔️ Ataque físico causou ${damage} de dano.`, "attack");
    }

    spawnParticles(clientX, clientY, dmgType);
    spawnDamageNumber(clientX, clientY, damage, dmgType);
    triggerScreenShake();

    // Simulação API
    const requestId = Math.random().toString(36).substring(2, 9);
    addLog(`Enviando POST /api/attack - ID: ${requestId} - Dmg: ${damage}`, "network");
    setTimeout(() => {
        addLog(`POST /api/attack [200 OK] - ID: ${requestId} registrado no banco de dados.`, "network");
    }, 450);

    // Carrega Barra Especial MP
    if (specialProgress < 100) {
        specialProgress += 10; // 10% por ataque
        if (specialProgress > 100) specialProgress = 100;
        
        specialBar.style.width = `${specialProgress}%`;
        specialPercent.innerText = `${specialProgress}%`;

        if (specialProgress === 100) {
            btnGitPush.classList.remove('locked');
            btnGitPush.classList.add('active');
            addLog("🔥 GIT PUSH PRONTO! Selecione o comando especial!", "git");
            showBattleMessage("ESPECIAL GIT PUSH DISPONÍVEL!");
        }
    }
}

// Executa Comando Especial Git Push
function executeSpecial(e) {
    if (specialProgress < 100 || !atbReady) return;

    const clientX = e.clientX || window.innerWidth / 2;
    const clientY = e.clientY || window.innerHeight / 2 - 100;

    // Reseta ATB e Status
    atbProgress = 0;
    atbReady = false;
    atbBar.classList.remove('ready');
    btnAtacar.classList.remove('active');
    btnGitPush.classList.add('locked');
    btnGitPush.classList.remove('active');

    const specialDmg = 3500;
    bossHp -= specialDmg;
    if (bossHp < 0) bossHp = 0;

    const hpPercent = (bossHp / bossMaxHp) * 100;
    bossHpBar.style.width = `${hpPercent}%`;
    bossHpText.innerText = `${Math.ceil(bossHp).toLocaleString()} / ${bossMaxHp.toLocaleString()}`;

    // Logs, Som e Sprite JRPG
    addLog("🚀 EXECUTANDO: git push -u origin main", "git");
    addLog(`✨ Dano massivo! Especial causou ${specialDmg} de dano de push!`, "git");
    showBattleMessage(`Rafael executa GIT PUSH! -${specialDmg} HP`);

    playSpecialSound();
    playSpriteAnimation('special');
    triggerFlash();
    spawnParticles(clientX, clientY, 'special');
    spawnDamageNumber(clientX, clientY, specialDmg, 'special');
    triggerScreenShake();

    // Reseta Especial MP
    specialProgress = 0;
    specialBar.style.width = '0%';
    specialPercent.innerText = '0%';

    totalHits++;
    totalDamage += specialDmg;
    statHits.innerText = totalHits;
    statDmg.innerText = totalDamage.toLocaleString();

    // Simulação de Rede
    const requestId = Math.random().toString(36).substring(2, 9);
    addLog(`Enviando POST /api/push - ID: ${requestId} - Push Payload: {branch: 'main'}`, "network");
    setTimeout(() => {
        addLog(`POST /api/push [200 OK] - Repositório GitHub atualizado com sucesso! (Simulado)`, "network");
    }, 700);
}

// --- SISTEMA DE ÁUDIO WEB (Sintetizador Web Audio API) ---
let audioCtx = null;
let isMuted = false;

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
        muteText.innerText = '🔇 SOM DESATIV.';
        addLog("Sons desativados.", "system");
    } else {
        muteBtn.classList.remove('muted');
        muteText.innerText = '🔊 SOM ATIVO';
        getAudioContext();
        addLog("Sons ativados.", "system");
    }
});

function playAttackSound() {
    if (isMuted) return;
    try {
        const ctx = getAudioContext();
        const time = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, time);
        osc.frequency.exponentialRampToValueAtTime(100, time + 0.15);
        
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(time);
        osc.stop(time + 0.16);
    } catch(e) {
        console.error(e);
    }
}

function playCritSound() {
    if (isMuted) return;
    try {
        const ctx = getAudioContext();
        const time = ctx.currentTime;
        
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(1200, time);
        osc1.frequency.exponentialRampToValueAtTime(80, time + 0.28);
        gain1.gain.setValueAtTime(0.2, time);
        gain1.gain.exponentialRampToValueAtTime(0.01, time + 0.28);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(110, time);
        osc2.frequency.exponentialRampToValueAtTime(30, time + 0.35);
        gain2.gain.setValueAtTime(0.3, time);
        gain2.gain.exponentialRampToValueAtTime(0.01, time + 0.35);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + 0.29);
        osc2.stop(time + 0.36);
    } catch(e) {
        console.error(e);
    }
}

function playSpecialSound() {
    if (isMuted) return;
    try {
        const ctx = getAudioContext();
        const time = ctx.currentTime;
        
        const oscCharge = ctx.createOscillator();
        const gainCharge = ctx.createGain();
        oscCharge.type = 'sawtooth';
        oscCharge.frequency.setValueAtTime(120, time);
        oscCharge.frequency.exponentialRampToValueAtTime(2000, time + 0.4);
        gainCharge.gain.setValueAtTime(0.01, time);
        gainCharge.gain.linearRampToValueAtTime(0.15, time + 0.3);
        gainCharge.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
        oscCharge.connect(gainCharge);
        gainCharge.connect(ctx.destination);
        oscCharge.start(time);
        oscCharge.stop(time + 0.41);
        
        setTimeout(() => {
            if (isMuted) return;
            try {
                const blastCtx = getAudioContext();
                const blastTime = blastCtx.currentTime;
                const oscBlast = blastCtx.createOscillator();
                const gainBlast = blastCtx.createGain();
                
                oscBlast.type = 'square';
                oscBlast.frequency.setValueAtTime(250, blastTime);
                oscBlast.frequency.exponentialRampToValueAtTime(20, blastTime + 0.7);
                
                gainBlast.gain.setValueAtTime(0.4, blastTime);
                gainBlast.gain.exponentialRampToValueAtTime(0.01, blastTime + 0.7);
                
                oscBlast.connect(gainBlast);
                gainBlast.connect(blastCtx.destination);
                
                oscBlast.start(blastTime);
                oscBlast.stop(blastTime + 0.71);
            } catch(err) {
                console.error(err);
            }
        }, 300);
    } catch(e) {
        console.error(e);
    }
}

// Event Listeners
btnAtacar.addEventListener('click', executeAttack);
btnGitPush.addEventListener('click', executeSpecial);

// Clicar na tela de batalha/boss também ataca ou ajuda a carregar ATB!
enemyCard.addEventListener('click', (e) => {
    if (atbReady) {
        executeAttack(e);
    } else {
        // Boost no ATB se clicar repetidamente!
        const clientX = e.clientX;
        const clientY = e.clientY;
        
        atbProgress += ATB_CLICK_BOOST;
        if (atbProgress >= 100) {
            atbProgress = 100;
            atbReady = true;
            atbBar.classList.add('ready');
            btnAtacar.classList.add('active');
            playAttackSound();
        }
        atbBar.style.width = `${atbProgress}%`;
        spawnParticles(clientX, clientY, 'special');
    }
});
