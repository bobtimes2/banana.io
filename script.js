const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Core State
let game = {
    wave: 1,
    wallHp: 1000,
    maxWallHp: 1000,
    cash: 150,
    currentWeapon: 'pistol',
    currentSkin: 'default',
    waveInProgress: false,
    admin10Gun: false,
    adminAutoClick: false,
    wallX: 120
};

// Arrays for tracking entities
let Projectiles = [];
let Enemies = [];
let Particles = [];
let Traps = [];

// Weapon Configuration Profile Tables
const weapons = {
    pistol: { name: 'Pistol', damage: 35, speed: 12, size: 8, color: '#ffd700' },
    shotgun: { name: 'Shotgun', damage: 20, speed: 10, size: 5, color: '#ff4500' },
    rocket: { name: 'Rocket Launcher', damage: 150, speed: 7, size: 15, color: '#4da6ff' }
};

// Scale canvas dynamically
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    game.wallX = 120; 
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Base Updates
function updateUI() {
    document.getElementById('wave-val').innerText = game.wave;
    document.getElementById('hp-val').innerText = Math.max(0, game.wallHp);
    document.getElementById('cash-val').innerText = game.cash;
    document.getElementById('gun-val').innerText = weapons[game.currentWeapon].name;
}

// Toggle Secret Admin UI Overlay Panel
window.addEventListener('keydown', (e) => {
    if(e.key.toLowerCase() === 'a') {
        const admin = document.getElementById('admin-panel');
        admin.style.display = admin.style.display === 'block' ? 'none' : 'block';
    }
});

// Weapon Selection Locker Switcher Handler
function changeWeapon(val) {
    if (val === 'shotgun' && game.wave < 3) {
        alert("Unlocks at Wave 3!");
        document.getElementById('weapon-select').value = game.currentWeapon;
        return;
    }
    if (val === 'rocket' && game.wave < 5) {
        alert("Unlocks at Wave 5!");
        document.getElementById('weapon-select').value = game.currentWeapon;
        return;
    }
    game.currentWeapon = val;
    updateUI();
}

// Visual Skin Dynamic Theme Processor
function changeSkin(skin, btn) {
    game.currentSkin = skin;
    document.querySelectorAll('.panel-section button').forEach(b => b.classList.remove('active-skin'));
    btn.classList.add('active-skin');
}

// Purchase Trap Implementor Engine
function selectTrap(type) {
    if(type === 'spike' && game.cash >= 50) {
        game.cash -= 50;
        Traps.push({x: game.wallX + 40 + Math.random()*80, type: 'spike', color: '#888'});
    } else if(type === 'mine' && game.cash >= 100) {
        game.cash -= 100;
        Traps.push({x: game.wallX + 150 + Math.random()*100, type: 'mine', color: '#ff3333'});
    } else {
        alert("Not enough Banana Coins!");
    }
    updateUI();
}

// Structural Integrity Reinforcement Core Logic
function upgradeWall() {
    if(game.cash >= 200) {
        game.cash -= 200;
        game.maxWallHp += 500;
        game.wallHp = game.maxWallHp;
    } else {
        alert("Not enough Banana Coins!");
    }
    updateUI();
}

// Admin Panel Mutation Handlers
function toggle10Gun() {
    game.admin10Gun = !game.admin10Gun;
    document.getElementById('toggle-10gun').classList.toggle('active');
    document.getElementById('toggle-10gun').innerText = game.admin10Gun ? 'ENABLED' : 'DISABLED';
}

function toggleAutoClicker() {
    game.adminAutoClick = !game.adminAutoClick;
    document.getElementById('toggle-autoclick').classList.toggle('active');
    document.getElementById('toggle-autoclick').innerText = game.adminAutoClick ? 'ENABLED' : 'DISABLED';
}

function addAdminCash() {
    game.cash += 10000;
    updateUI();
}

// Fire Projectile Math Matrix Handler Engine
function fireWeapon(targetX, targetY) {
    const weapon = weapons[game.currentWeapon];
    const startX = game.wallX;
    const startY = canvas.height / 2;
    const angle = Math.atan2(targetY - startY, targetX - startX);

    let count = game.admin10Gun ? 10 : (game.currentWeapon === 'shotgun' ? 5 : 1);

    for(let i=0; i<count; i++) {
        let variance = (game.currentWeapon === 'shotgun' || game.admin10Gun) ? (Math.random() - 0.5) * 0.25 : 0;
        Projectiles.push({
            x: startX,
            y: startY,
            vx: Math.cos(angle + variance) * weapon.speed,
            vy: Math.sin(angle + variance) * weapon.speed,
            damage: weapon.damage,
            size: weapon.size,
            color: weapon.color,
            isRocket: game.currentWeapon === 'rocket'
        });
    }
}

// Player Interactions Hook Setup
window.addEventListener('pointerdown', (e) => {
    if(e.clientY < canvas.height - 120 && e.clientY > 80) {
        fireWeapon(e.clientX, e.clientY);
    }
});

// Enemy Wave Instantiation Engine
function startNextWave() {
    if(game.waveInProgress) return;
    game.waveInProgress = true;
    document.getElementById('wave-btn').disabled = true;

    let spawnCount = 5 + game.wave * 3;
    let spawned = 0;

    let spawnInterval = setInterval(() => {
        if(spawned >= spawnCount) {
            clearInterval(spawnInterval);
            return;
        }
        let isFlier = Math.random() > 0.6 && game.wave >= 2;
        Enemies.push({
            x: canvas.width + 20,
            y: isFlier ? 150 + Math.random() * 200 : canvas.height - 130,
            hp: 40 + game.wave * 15,
            maxHp: 40 + game.wave * 15,
            speed: 1.5 + Math.random() * 1.5 + (game.wave * 0.1),
            isFlying: isFlier,
            size: isFlier ? 15 : 22
        });
        spawned++;
    }, 800 - Math.min(game.wave * 40, 400));
}

// Burst Particle Generator Matrix
function createExplosion(x, y, color, qty=10) {
    for(let i=0; i<qty; i++) {
        Particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            alpha: 1,
            color: color
        });
    }
}

// Realtime Render Engine Frame Execution Loop
function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Environment Background Draw Pipeline
    let wallColor = game.currentSkin === 'fire' ? '#993300' : '#224466';
    let groundColor = game.currentSkin === 'fire' ? '#221105' : '#0c1424';

    // Draw Sky Ground Junction
    ctx.fillStyle = groundColor;
    ctx.fillRect(0, canvas.height - 110, canvas.width, 110);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(0, canvas.height - 110, canvas.width, 2);

    // Shield Wall Draw Vector
    ctx.fillStyle = wallColor;
    ctx.shadowColor = game.currentSkin === 'fire' ? '#ff4500' : '#4da6ff';
    ctx.shadowBlur = 10;
    ctx.fillRect(game.wallX - 30, canvas.height - 450, 30, 340);
    ctx.shadowBlur = 0;

    // Auto Clicker Core Loop Processing Override
    if(game.adminAutoClick && Math.random() < 0.2) {
        fireWeapon(canvas.width - Math.random()*200, 150 + Math.random()*400);
    }

    // Render Defensive Traps Array
    Traps.forEach((trap, tIdx) => {
        ctx.fillStyle = trap.color;
        if(trap.type === 'spike') {
            ctx.beginPath();
            ctx.moveTo(trap.x, canvas.height - 110);
            ctx.lineTo(trap.x+10, canvas.height - 130);
            ctx.lineTo(trap.x+20, canvas.height - 110);
            ctx.fill();
        } else if(trap.type === 'mine') {
            ctx.beginPath();
            ctx.arc(trap.x, canvas.height - 115, 8, 0, Math.PI*2);
            ctx.fill();
        }
    });

    // Run Projectile Updates Array Loop 
    Projectiles.forEach((p, pIdx) => {
        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Screen boundaries escape cleanup
        if(p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
            Projectiles.splice(pIdx, 1);
        }
    });

    // Run Enemies Updates Engine Execution Array Loop
    Enemies.forEach((e, eIdx) => {
        if(!e.isFlying) {
            // Trap collision checks
            Traps.forEach((t, tIdx) => {
                if(Math.abs(e.x - t.x) < 20) {
                    if(t.type === 'spike') {
                        e.hp -= 2; // Continuous damage
                    } else if(t.type === 'mine') {
                        e.hp -= 120;
                        createExplosion(t.x, canvas.height-115, '#ff4500', 25);
                        Traps.splice(tIdx, 1);
                    }
                }
            });
        }

        // Path translation towards base wall
        if(e.x > game.wallX) {
            e.x -= e.speed;
        } else {
            // Wall Impact Logic Block
            game.wallHp -= e.isFlying ? 1 : 2;
            e.hp -= 1; // Dies slowly dealing impact damage
            updateUI();
        }

        // Bullet Hitbox Analysis Engine Intersect Matrix
        Projectiles.forEach((p, pIdx) => {
            let hitDist = e.isFlying ? 35 : 25; // Ultra-wide hitboxes
            if(Math.abs(p.x - e.x) < hitDist && Math.abs(p.y - e.y) < hitDist) {
                e.hp -= p.damage;
                if(p.isRocket) {
                    createExplosion(p.x, p.y, '#ff4500', 30);
                    // AoE Damage
                    Enemies.forEach(other => {
                        if(Math.abs(other.x - p.x) < 120) other.hp -= 100;
                    });
                } else {
                    createExplosion(p.x, p.y, p.color, 6);
                }
                Projectiles.splice(pIdx, 1);
            }
        });

        // Handle death criteria profiles
        if(e.hp <= 0) {
            createExplosion(e.x, e.y, e.isFlying ? '#4da6ff' : '#ff4d4d', 15);
            game.cash += e.isFlying ? 25 : 15;
            Enemies.splice(eIdx, 1);
            updateUI();
        } else {
            // Render Enemy Unit Graphics Vector Canvas Elements
            ctx.fillStyle = e.isFlying ? '#4da6ff' : '#ff4d4d';
