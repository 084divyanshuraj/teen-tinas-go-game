// ============================================================
//  TEEN TITANS GO! – Baby Hands Crisis
//  Multi-chapter 2D platformer game
// ============================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// ── State ──────────────────────────────────────────────────
let gameState = 'title';   // title | cutscene | playing | win | gameover
let chapter   = 0;         // 0=meeting, 1=blood-fight1, 2=tower-lies, 3=boss-fight
let score     = 0;
let lives     = 10;
let frameCount = 0;
let keys      = {};

// Chapter titles shown in HUD
const CHAPTER_NAMES = [
  'CH1: Assemble!',
  'CH2: Memory Ray!',
  'CH3: Cyborg Armor',
  'CH4: Beast Boy Rescue',
  'CH5: Raven Blanket',
  'CH6: Starfire Kiss',
  'CH7: Final Battle'
];

// ── Screens ────────────────────────────────────────────────
const screens = {
  title:     document.getElementById('title-screen'),
  cutscene:  document.getElementById('cutscene-screen'),
  game:      document.getElementById('game-screen'),
  win:       document.getElementById('win-screen'),
  gameover:  document.getElementById('gameover-screen'),
};
function showScreen(name) {
  Object.values(screens).forEach(s => { s.style.display = 'none'; });
  screens[name].style.display = 'flex';
}

// ── HUD helpers ────────────────────────────────────────────
const hudLives   = document.getElementById('hud-lives');
const hudChapter = document.getElementById('hud-chapter');
const hudScore   = document.getElementById('hud-score');
const timerDiv   = document.getElementById('timer-display');
const timerVal   = document.getElementById('timer-val');
const gameMsg    = document.getElementById('game-message');

function updateHUD() {
  hudLives.textContent   = '❤️'.repeat(Math.max(0, lives));
  hudChapter.textContent = CHAPTER_NAMES[chapter] || '';
  hudScore.textContent   = 'SCORE: ' + score;
}

// ── Message overlay ────────────────────────────────────────
let msgTimer = 0;
function showMsg(txt, duration = 120) {
  gameMsg.innerHTML  = txt;
  gameMsg.classList.remove('hidden');
  msgTimer = duration;
}

// ============================================================
//  CUTSCENE ENGINE
// ============================================================
const CUTSCENES = {
  intro: [
    { name: 'ROBIN', emoji: '🦸', bg: '#0a0a2e',
      text: '"TITANS! There is a MANDATORY meeting\nin exactly ONE minute! This is not a drill!"' },
    { name: 'BEAST BOY', emoji: '🐢', bg: '#0a1a0a',
      text: '"Dude, we\'re eating lunch. Step off.\nAlso… have you SEEN your baby hands??"' },
    { name: 'CYBORG', emoji: '🤖', bg: '#0a0a2e',
      text: '"Ha! Look at those tiny lil\' fingers!\nBOOM! Baby hands!!"' },
    { name: 'STARFIRE', emoji: '⭐', bg: '#1a0a1a',
      text: '"Robin, what does \'mandatory\' mean?\nAlso your little hands are… so small!"' },
    { name: 'RAVEN', emoji: '🔮', bg: '#1a001a',
      text: '* Slams door in Robin\'s face *\n"..."' },
    { name: 'ROBIN', emoji: '🦸', bg: '#0a0a2e',
      text: '"NOBODY showed up. Nobody.\nBut back in the 80s we were ALWAYS on time!"' },
  ],
  preBlood: [
    { name: 'ALERT SYSTEM', emoji: '🚨', bg: '#1a0000',
      text: '"EMERGENCY CRIME ALERT!\nBrother Blood is atop Jump City Tower!"' },
    { name: 'BROTHER BLOOD', emoji: '💀', bg: '#1a0000',
      text: '"HA! No villain could EVER stand\nagainst the Teen Titans!"' },
    { name: 'BEAST BOY', emoji: '🐢', bg: '#0a1a0a',
      text: '"Is he… complimenting us?\nI think he\'s making fun of us!"' },
    { name: 'BROTHER BLOOD', emoji: '💀', bg: '#1a0000',
      text: '"Behold my MEMORY CANNON!\nIt will wipe your minds clean of who you are!"' },
  ],
  postBlood: [
    { name: 'BROTHER BLOOD', emoji: '💀', bg: '#1a0000',
      text: '"Your team has forgotten everything!\nYou must be MISERABLE, Robin!"' },
    { name: 'ROBIN', emoji: '🦸', bg: '#0a1a00',
      text: '"Miserable?? THIS IS THE BEST DAY\nOF MY LIFE! I get a DO-OVER!"' },
    { name: 'ROBIN', emoji: '🦸', bg: '#0a0a2e',
      text: '"I can mold them into the PERFECT team!\nAnd they won\'t know about my baby hands!"' },
  ],
  towerIntro: [
    { name: 'ROBIN', emoji: '🦸', bg: '#0a0a2e',
      text: '"Hello, NEW friends. I am Robin.\nYour AMAZING, cool, handsome leader."' },
    { name: 'ROBIN', emoji: '🦸', bg: '#0a0a2e',
      text: '"Look at these hands. PERFECTLY NORMAL.\nNot small. Not baby-like. Perfect."' },
    { name: 'CYBORG', emoji: '🤖', bg: '#0a0a2e',
      text: '"Those… do look like regular hands?\nTell us more about our origins, glorious leader!"' },
  ],
  cyborgIntro: [
    { name: 'ROBIN', emoji: '🦸', bg: '#0a0a2e',
      text: '"I built Titans Tower with my bare hands,\nand lent my robotic suit to Cyborg\'s helpless head!"' }
  ],
  beastboyIntro: [
    { name: 'ROBIN', emoji: '🦸', bg: '#0a0a2e',
      text: '"I then rescued Beast Boy from Mt. Everest,\nraising him like a helpless baby bird!"' }
  ],
  ravenIntro: [
    { name: 'ROBIN', emoji: '🦸', bg: '#0a0a2e',
      text: '"And Raven was just a normal purple blanket,\nuntil I gave it life with my powers!"' }
  ],
  starfireIntro: [
    { name: 'ROBIN', emoji: '🦸', bg: '#0a0a2e',
      text: '"And of course, Starfire is my girlfriend.\nBy the way, Tamaranian greetings require a lip kiss!"' },
    { name: 'STARFIRE', emoji: '⭐', bg: '#1a0a1a',
      text: '"I do not think that is correct...\nBut I will punch you if you try!"' }
  ],
  preFinal: [
    { name: 'ALERT SYSTEM', emoji: '🚨', bg: '#1a0000',
      text: '"SECOND CRIME ALERT!\nBrother Blood robbing Jump City Weapons Depot!"' },
    { name: 'TITANS', emoji: '🦸', bg: '#0a0a2e',
      text: '"But Robin, YOU have superpowers!\nYou can handle this ALONE!"' },
    { name: 'ROBIN', emoji: '🦸', bg: '#0a0a2e',
      text: '"Okay okay… I lied. I made it ALL up.\nI just wanted your respect. I\'m sorry."' },
    { name: 'BEAST BOY', emoji: '🐢', bg: '#0a1a0a',
      text: '"Wait… those gloves… take \'em off…!"' },
    { name: 'CYBORG', emoji: '🤖', bg: '#0a0a2e',
      text: '"BABY. HANDS. 👐\nWe\'re back baby!! Let\'s GET HIM!"' },
  ],
  ending: [
    { name: 'ROBIN', emoji: '🦸', bg: '#0a0a2e',
      text: '"I know I lied. I just wanted respect.\nI\'m sorry, guys."' },
    { name: 'BEAST BOY', emoji: '🐢', bg: '#0a1a0a',
      text: '"Aw man, we don\'t respect you much…\nand we DO make fun of you… BUT—"' },
    { name: 'STARFIRE', emoji: '⭐', bg: '#1a0a1a',
      text: '"There is no \'but\', Robin.\nThat is it!"' },
    { name: 'ROBIN', emoji: '🦸', bg: '#0a0a2e',
      text: '"..."\n* stares into distance *' },
  ],
};

let currentCutscene = [];
let cutsceneIdx = 0;
let nextCallback = null;

function playCutscene(key, callback) {
  currentCutscene = CUTSCENES[key];
  cutsceneIdx = 0;
  nextCallback = callback;
  showScreen('cutscene');
  showCutsceneFrame();
}

function showCutsceneFrame() {
  const frame = currentCutscene[cutsceneIdx];
  document.getElementById('cutscene-portrait').textContent = frame.emoji;
  document.getElementById('cutscene-name').textContent    = frame.name;
  document.getElementById('cutscene-text').textContent    = frame.text;
  document.getElementById('cutscene-bg').style.background =
    `radial-gradient(circle at 30% 60%, ${frame.bg} 0%, #000 100%)`;
}

document.getElementById('cutscene-next').addEventListener('click', () => {
  cutsceneIdx++;
  if (cutsceneIdx < currentCutscene.length) {
    showCutsceneFrame();
  } else {
    if (nextCallback) nextCallback();
  }
});

// ============================================================
//  GAME LEVELS / CHAPTERS
// ============================================================

// Shared physics
const GRAVITY = 0.5;
const GROUND  = 360;

// Palettes per chapter
const BG_COLORS = [
  { sky: '#0a0a2e', ground: '#1a1a3a', accent: '#6a0dad' },  // ch0: assemble
  { sky: '#1a0000', ground: '#3a0a0a', accent: '#ff2222' },  // ch1: memory ray
  { sky: '#111122', ground: '#333344', accent: '#0099ff' },  // ch2: cyborg armor
  { sky: '#cceeff', ground: '#ffffff', accent: '#00ccff' },  // ch3: everest
  { sky: '#0a001a', ground: '#1a0033', accent: '#9900ff' },  // ch4: raven blanket
  { sky: '#1a0a1a', ground: '#3a0a2a', accent: '#ff00aa' },  // ch5: starfire kiss
  { sky: '#000000', ground: '#2a0000', accent: '#ff6600' },  // ch6: final battle
];

// ── Game Objects ───────────────────────────────────────────
let player, enemies, platforms, collectibles, projectiles, particles;

function resetLevel() {
  enemies      = [];
  platforms    = [];
  collectibles = [];
  projectiles  = [];
  particles    = [];
  player = createPlayer();
  updateHUD();
}

function createPlayer() {
  return {
    x: 80, y: GROUND, w: 28, h: 40,
    vx: 0, vy: 0,
    onGround: false,
    facing: 1,
    attacking: false,
    attackTimer: 0,
    invincible: 0,
    color: '#cc2222',
    hat: '#111',
    cape: '#ffdd00',
  };
}

// ── CHAPTER SETUP ──────────────────────────────────────────

// CH0: Run to collect all 4 Titans icons (meeting scene)
function setupChapter0() {
  chapter = 0;
  resetLevel();
  timerDiv.classList.remove('hidden');
  // Place titan tokens across the level
  const titans = ['🐢','🤖','🔮','⭐'];
  titans.forEach((t, i) => {
    collectibles.push({ x: 150 + i*160, y: GROUND - 60, w: 30, h: 30, emoji: t, collected: false });
  });
  // Simple platforms
  platforms = [
    { x: 0,   y: GROUND+40, w: 800, h: 20 },  // floor
    { x: 200, y: GROUND-60, w: 80,  h: 12 },
    { x: 380, y: GROUND-80, w: 80,  h: 12 },
    { x: 560, y: GROUND-60, w: 80,  h: 12 },
  ];
  // Obstacles (tiny fans blocking path)
  enemies = [
    makeBlocker(300, '#ffaa00', '👋'),
    makeBlocker(480, '#00aaff', '🖐️'),
  ];
  startTimer(60, () => {
    const allGot = collectibles.every(c => c.collected);
    if (!allGot) {
      loseLife();
    } else {
      finishChapter();
    }
  });
  showMsg('📣 Collect ALL Titans for the meeting!\nAvoid obstacles!', 100);
}

// CH1: Dodge the memory ray, destroy Brother Blood's cannon
function setupChapter1() {
  chapter = 1;
  resetLevel();
  timerDiv.classList.add('hidden');
  platforms = [
    { x: 0,   y: GROUND+40, w: 800, h: 20 },
    { x: 600, y: GROUND-100, w: 150, h: 16 },
  ];
  // Brother Blood on top platform
  enemies = [
    makeBoss(620, GROUND - 140),
  ];
  // Beams fired by boss
  showMsg('⚠️ Dodge the Memory Ray!\nHit Brother Blood 5 times!', 120);
}

// CH2: Cyborg Armor (Factory)
function setupChapter2() {
  chapter = 2;
  resetLevel();
  timerDiv.classList.remove('hidden');
  platforms = [
    { x: 0,   y: GROUND+40, w: 800, h: 20 },
    { x: 150, y: GROUND-70, w: 80, h: 12 },
    { x: 350, y: GROUND-120, w: 80, h: 12 },
    { x: 550, y: GROUND-80, w: 80, h: 12 },
  ];
  collectibles = [
    { x: 170, y: GROUND-110, w: 24, h: 24, emoji: '⚙️', collected: false },
    { x: 370, y: GROUND-160, w: 24, h: 24, emoji: '⚙️', collected: false },
    { x: 570, y: GROUND-120, w: 24, h: 24, emoji: '⚙️', collected: false },
  ];
  enemies = [
    makeBlocker(250, '#ffaa00', '⚠️'),
    makeBlocker(450, '#ffaa00', '⚠️'),
  ];
  startTimer(40, () => {
    const got = collectibles.filter(c => c.collected).length;
    if (got < 3) { loseLife(); } else { finishChapter(); }
  });
  showMsg('⚙️ Collect 3 Armor Parts for Cyborg!', 100);
}

// CH3: Beast Boy Everest (Ice)
function setupChapter3() {
  chapter = 3;
  resetLevel();
  timerDiv.classList.remove('hidden');
  platforms = [
    { x: 0,   y: GROUND+40, w: 800, h: 20 },
    { x: 100, y: GROUND-50, w: 100, h: 12 },
    { x: 250, y: GROUND-100, w: 80, h: 12 },
    { x: 400, y: GROUND-150, w: 80, h: 12 },
    { x: 600, y: GROUND-200, w: 120, h: 12 },
  ];
  collectibles = [
    { x: 650, y: GROUND-240, w: 30, h: 30, emoji: '🦅', collected: false },
  ];
  enemies = [
    makeBlocker(150, '#00ffff', '❄️'),
    makeBlocker(300, '#00ffff', '❄️'),
  ];
  startTimer(40, () => {
    if (!collectibles[0].collected) { loseLife(); } else { finishChapter(); }
  });
  showMsg('🦅 Climb Mt. Everest to save baby Beast Boy!\n(Watch out, ice is slippery!)', 120);
}

// CH4: Raven Blanket (Magic)
function setupChapter4() {
  chapter = 4;
  resetLevel();
  timerDiv.classList.remove('hidden');
  platforms = [
    { x: 0,   y: GROUND+40, w: 800, h: 20 },
    { x: 200, y: GROUND-80, w: 400, h: 12 },
  ];
  collectibles = [
    { x: 400, y: GROUND-120, w: 30, h: 30, emoji: '🟪', collected: false },
  ];
  // Magic orbs bouncing around
  enemies = [
    makeBlocker(250, '#aa00ff', '✨'),
    makeBlocker(400, '#ff00aa', '✨'),
    makeBlocker(550, '#00aaff', '✨'),
  ];
  startTimer(30, () => {
    if (!collectibles[0].collected) { loseLife(); } else { finishChapter(); }
  });
  showMsg('🟪 Collect the ordinary Purple Blanket!', 100);
}

// CH5: Starfire Kiss (Space)
function setupChapter5() {
  chapter = 5;
  resetLevel();
  timerDiv.classList.remove('hidden');
  platforms = [
    { x: 0,   y: GROUND+40, w: 800, h: 20 },
    { x: 650, y: GROUND-60, w: 100, h: 12 },
  ];
  collectibles = [
    { x: 680, y: GROUND-100, w: 30, h: 30, emoji: '💋', collected: false },
  ];
  enemies = [
    makeBoss(700, GROUND-110, false) // unkillable starfire dummy firing lasers
  ];
  enemies[0].hp = 999;
  enemies[0].label = 'STARFIRE';
  enemies[0].color = '#ff6600';
  startTimer(30, () => {
    if (!collectibles[0].collected) { loseLife(); } else { finishChapter(); }
  });
  showMsg('💋 Reach Starfire for a Tamaranian Greeting!\nDodge her accidental blasts!', 120);
}

// CH6: Final Boss Fight
function setupChapter6() {
  chapter = 6;
  resetLevel();
  timerDiv.classList.add('hidden');
  platforms = [
    { x: 0,   y: GROUND+40, w: 800, h: 20 },
    { x: 100, y: GROUND-80,  w: 100, h: 12 },
    { x: 350, y: GROUND-100, w: 100, h: 12 },
    { x: 580, y: GROUND-80,  w: 100, h: 12 },
  ];
  enemies = [ makeBoss(600, GROUND - 50, true) ];
  showMsg('🥊 FINAL BATTLE!\nDefeat Brother Blood with BABY HANDS!', 120);
}

// ── Enemy factories ────────────────────────────────────────
function makeBlocker(x, color, emoji) {
  return {
    type: 'blocker', x, y: GROUND, w: 28, h: 36,
    vx: -1.2, vy: 0, hp: 1, maxHp: 1,
    color, emoji, onGround: false, dir: -1,
    fireTimer: 0,
  };
}

function makeBoss(x, y, armed = false) {
  return {
    type: 'boss', x, y, w: 40, h: 52,
    vx: 0, vy: 0, hp: 5, maxHp: 5,
    color: '#8b0000', armed,
    fireTimer: 0, phase: 0,
    staggerTimer: 0,
    onGround: false,
    dir: -1,
    walkTimer: 0,
  };
}

// ── Timer helpers ──────────────────────────────────────────
let timerSeconds = 0;
let timerInterval = null;
let timerDoneCallback = null;

function startTimer(sec, done) {
  clearInterval(timerInterval);
  timerSeconds = sec;
  timerVal.textContent = timerSeconds;
  timerDoneCallback = done;
  timerInterval = setInterval(() => {
    timerSeconds--;
    timerVal.textContent = timerSeconds;
    if (timerSeconds <= 10) timerDiv.classList.add('urgent');
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerDiv.classList.remove('urgent');
      if (timerDoneCallback) timerDoneCallback();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerDiv.classList.add('hidden');
  timerDiv.classList.remove('urgent');
}

// ── Particle helpers ───────────────────────────────────────
function spawnParticles(x, y, color, n = 8) {
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 / n) * i;
    particles.push({
      x, y, vx: Math.cos(angle) * (2 + Math.random() * 3),
      vy: Math.sin(angle) * (2 + Math.random() * 3),
      life: 30 + Math.random() * 20, color,
      size: 4 + Math.random() * 4,
    });
  }
}

// ============================================================
//  CHAPTER FLOW
// ============================================================
function startChapter(ch) {
  gameState = 'playing';
  showScreen('game');
  chapter = ch;
  switch (ch) {
    case 0: setupChapter0(); break;
    case 1: setupChapter1(); break;
    case 2: setupChapter2(); break;
    case 3: setupChapter3(); break;
    case 4: setupChapter4(); break;
    case 5: setupChapter5(); break;
    case 6: setupChapter6(); break;
  }
  gameLoop();
}

function finishChapter() {
  stopTimer();
  score += 500;
  updateHUD();
  gameState = 'cutscene';
  const flows = [
    () => playCutscene('preBlood',  () => startChapter(1)),
    () => playCutscene('postBlood', () => playCutscene('towerIntro', () => playCutscene('cyborgIntro', () => startChapter(2)))),
    () => playCutscene('beastboyIntro', () => startChapter(3)),
    () => playCutscene('ravenIntro', () => startChapter(4)),
    () => playCutscene('starfireIntro', () => startChapter(5)),
    () => playCutscene('preFinal',  () => startChapter(6)),
    () => {
      playCutscene('ending', () => {
        document.getElementById('final-score').textContent = 'FINAL SCORE: ' + score;
        showScreen('win');
      });
    },
  ];
  flows[chapter]?.();
}

function loseLife() {
  lives--;
  updateHUD();
  spawnParticles(player.x, player.y, '#ff2222', 12);
  if (lives <= 0) {
    stopTimer();
    gameState = 'gameover';
    showScreen('gameover');
  } else {
    player.invincible = 120;
    player.x = 80;
    player.y = GROUND;
    player.vx = 0;
    player.vy = 0;
    showMsg('💀 Lost a life! Keep going!', 80);
  }
}

// ============================================================
//  INPUT
// ============================================================
document.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))
    e.preventDefault();
});
document.addEventListener('keyup', e => { keys[e.code] = false; });

function isLeft()   { return keys['ArrowLeft']  || keys['KeyA']; }
function isRight()  { return keys['ArrowRight'] || keys['KeyD']; }
function isJump()   { return keys['ArrowUp']    || keys['KeyW'] || keys['Space']; }
function isAttack() { return keys['KeyZ'] || keys['KeyX']; }

// --- Mobile Touch Controls ---
const touchMap = {
  'btn-left': 'ArrowLeft',
  'btn-right': 'ArrowRight',
  'btn-jump': 'ArrowUp',
  'btn-attack': 'KeyZ'
};

Object.keys(touchMap).forEach(id => {
  const btn = document.getElementById(id);
  if (!btn) return;
  
  const press = (e) => { e.preventDefault(); keys[touchMap[id]] = true; };
  const release = (e) => { e.preventDefault(); keys[touchMap[id]] = false; };

  btn.addEventListener('touchstart', press, {passive: false});
  btn.addEventListener('touchend', release, {passive: false});
  
  // Also bind mouse events so it's clickable on desktop for testing
  btn.addEventListener('mousedown', press);
  btn.addEventListener('mouseup', release);
  btn.addEventListener('mouseleave', release);
});

// ============================================================
//  PHYSICS & COLLISIONS
// ============================================================
function applyGravity(obj) {
  obj.vy += GRAVITY;
  obj.y += obj.vy;
  obj.x += obj.vx;
  obj.onGround = false;
  for (const p of platforms) {
    if (obj.x + obj.w > p.x && obj.x < p.x + p.w &&
        obj.y + obj.h > p.y && obj.y + obj.h < p.y + p.h + 12 &&
        obj.vy >= 0) {
      obj.y = p.y - obj.h;
      obj.vy = 0;
      obj.onGround = true;
    }
  }
  // World bounds
  if (obj.x < 0)          obj.x = 0;
  if (obj.x + obj.w > 800) obj.x = 800 - obj.w;
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

// ============================================================
//  UPDATE FUNCTIONS
// ============================================================
function updatePlayer() {
  // Move
  if (chapter === 3) { // Ice physics
    if (isLeft())  { player.vx -= 0.6; player.facing = -1; }
    else if (isRight()) { player.vx += 0.6; player.facing = 1; }
    player.vx *= 0.94; // Slide!
    if (player.vx < -6) player.vx = -6;
    if (player.vx > 6) player.vx = 6;
  } else {
    // Normal physics
    if (isLeft())  { player.vx = -4; player.facing = -1; }
    else if (isRight()) { player.vx = 4; player.facing = 1; }
    else           { player.vx *= 0.7; }
  }

  // Jump
  if (isJump() && player.onGround) player.vy = -10;

  // Attack
  if (isAttack() && player.attackTimer === 0) {
    player.attacking = true;
    player.attackTimer = 20;
    // Check hit on enemies
    const hitBox = {
      x: player.x + (player.facing > 0 ? player.w : -32),
      y: player.y + 8, w: 32, h: 24,
    };
    enemies.forEach(e => {
      if (!e._dead && rectsOverlap(hitBox, e)) {
        e.hp--;
        e.staggerTimer = 20;
        spawnParticles(e.x + e.w/2, e.y + e.h/2, '#ff4400', 6);
        score += 50;
        updateHUD();
        if (e.hp <= 0) {
          e._dead = true;
          spawnParticles(e.x + e.w/2, e.y + e.h/2, '#ffdd00', 16);
          score += 200;
          updateHUD();
          if (e.type === 'boss') {
            setTimeout(finishChapter, 800);
          }
        }
      }
    });
  }
  if (player.attackTimer > 0) { player.attackTimer--; }
  else { player.attacking = false; }

  applyGravity(player);

  if (player.invincible > 0) player.invincible--;
}

function updateEnemies() {
  enemies.forEach(e => {
    if (e._dead) return;
    if (e.staggerTimer > 0) { e.staggerTimer--; return; }

    if (e.type === 'blocker') {
      // Patrol
      e.x += e.vx;
      if (e.x < 30 || e.x > 760) e.vx *= -1;
      applyGravity(e);
      // Damage player on touch
      if (player.invincible === 0 && rectsOverlap(player, e)) {
        loseLife();
      }
    }

    if (e.type === 'boss') {
      // Walk toward player
      const dx = player.x - e.x;
      e.dir = dx > 0 ? 1 : -1;
      e.walkTimer++;

      if (Math.abs(dx) > 60) {
        e.x += e.dir * 1.8;
      }
      applyGravity(e);

      // Fire projectile
      e.fireTimer++;
      const fireRate = e.armed ? 80 : 140;
      if (e.fireTimer > fireRate) {
        e.fireTimer = 0;
        const speed = e.armed ? 5 : 4;
        projectiles.push({
          x: e.x + e.w/2, y: e.y + e.h/3,
          vx: e.dir * speed + (Math.random()-0.5),
          vy: -2 + Math.random()*1.5,
          color: e.armed ? '#ff6600' : '#aa00ff',
          radius: 8, life: 120, fromEnemy: true,
          label: e.armed ? '💥' : '🔮',
        });
      }
      // Touch damage
      if (player.invincible === 0 && rectsOverlap(player, e)) {
        loseLife();
      }
    }
  });
  enemies = enemies.filter(e => !e._dead);
}

function updateProjectiles() {
  projectiles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.12;
    p.life--;
    if (p.fromEnemy && player.invincible === 0) {
      const pb = { x: p.x - p.radius, y: p.y - p.radius, w: p.radius*2, h: p.radius*2 };
      if (rectsOverlap(player, pb)) {
        loseLife();
        p.life = 0;
      }
    }
  });
  projectiles = projectiles.filter(p => p.life > 0);
}

function updateCollectibles() {
  collectibles.forEach(c => {
    if (c.collected) return;
    if (rectsOverlap(player, c)) {
      c.collected = true;
      score += 100;
      updateHUD();
      spawnParticles(c.x + c.w/2, c.y + c.h/2, '#ffdd00', 8);
      // Check win for ch0
      if (chapter === 0 && collectibles.every(col => col.collected)) {
        stopTimer();
        showMsg('✅ All Titans assembled!\nHeading to the meeting!', 90);
        setTimeout(finishChapter, 2000);
      }
      // Check win for ch2
      if (chapter === 2) {
        const got = collectibles.filter(c => c.collected).length;
        if (got >= 6) {
          stopTimer();
          showMsg('⭐ Enough respect earned!\nTime to face Brother Blood!', 90);
          setTimeout(finishChapter, 2000);
        }
      }
    }
  });
}

function updateParticles() {
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1;
    p.life--;
  });
  particles = particles.filter(p => p.life > 0);
}

// ============================================================
//  DRAW FUNCTIONS
// ============================================================
const BG = BG_COLORS;

function drawBG() {
  const b = BG[chapter] || BG[0];
  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, GROUND);
  grad.addColorStop(0, b.sky);
  grad.addColorStop(1, b.ground);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 800, 420);

  // Stars / decorations
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  for (let i = 0; i < 30; i++) {
    const sx = ((i * 137 + chapter * 50) % 780) + 10;
    const sy = ((i * 73 + chapter * 30) % 200) + 10;
    ctx.fillRect(sx, sy, 2, 2);
  }

  // City skyline silhouette
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  const buildings = [60,120,90,150,80,110,70,140,100,80];
  let bx = 0;
  buildings.forEach(h => {
    ctx.fillRect(bx * 80, GROUND - h + 40, 75, h);
    bx++;
  });

  // Ground
  ctx.fillStyle = b.accent;
  ctx.fillRect(0, GROUND + 40, 800, 4);
  ctx.fillStyle = '#111';
  ctx.fillRect(0, GROUND + 44, 800, 40);
}

function drawPlatforms() {
  const b = BG[chapter] || BG[0];
  platforms.forEach(p => {
    if (p.y > GROUND + 30) return; // skip floor drawn above
    ctx.fillStyle = b.accent;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = '#fff';
    ctx.fillRect(p.x, p.y, p.w, 2);
  });
}

function drawPlayer() {
  const p = player;
  if (p.invincible > 0 && frameCount % 6 < 3) return;

  const px = Math.round(p.x);
  const py = Math.round(p.y);

  ctx.save();
  if (p.facing < 0) {
    ctx.translate(px + p.w, py);
    ctx.scale(-1, 1);
    ctx.translate(-p.w, 0);
  } else {
    ctx.translate(px, py);
  }

  // Body (red)
  ctx.fillStyle = '#cc2222';
  ctx.fillRect(6, 12, 16, 18);

  // Cape (yellow)
  ctx.fillStyle = '#ffdd00';
  ctx.fillRect(2, 14, 4, 12);

  // Head (skin)
  ctx.fillStyle = '#ffa07a';
  ctx.fillRect(6, 2, 16, 12);

  // Mask (black bar across eyes)
  ctx.fillStyle = '#111';
  ctx.fillRect(4, 2, 20, 6);

  // Hair (black)
  ctx.fillRect(6, 2, 16, 3);

  // Belt (yellow)
  ctx.fillStyle = '#ffdd00';
  ctx.fillRect(6, 28, 16, 3);

  // Legs
  ctx.fillStyle = '#222';
  ctx.fillRect(6, 30, 6, 12);
  ctx.fillRect(14, 30, 6, 12);

  // BABY HANDS (tiny!)
  ctx.fillStyle = '#ffa07a';
  ctx.fillRect(2, 20, 4, 4);  // left hand - teeny tiny!
  ctx.fillRect(22, 20, 4, 4); // right hand - teeny tiny!
  // Gloves (green)
  ctx.fillStyle = '#00aa44';
  ctx.fillRect(2, 20, 4, 4);
  ctx.fillRect(22, 20, 4, 4);

  // Attack effect
  if (p.attacking) {
    ctx.font = '18px serif';
    ctx.fillText('👊', p.facing > 0 ? p.w + 2 : -24, 16);
  }

  ctx.restore();

  // Name tag
  ctx.fillStyle = '#fff';
  ctx.font = '7px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('ROBIN', px + p.w/2, py - 6);
  ctx.textAlign = 'left';
}

function drawEnemies() {
  enemies.forEach(e => {
    if (e._dead) return;
    const flash = e.staggerTimer > 0 && frameCount % 4 < 2;

    if (e.type === 'blocker') {
      ctx.fillStyle = flash ? '#fff' : e.color;
      ctx.fillRect(e.x, e.y, e.w, e.h);
      ctx.font = '20px serif';
      ctx.fillText(e.emoji, e.x + 4, e.y + 22);
    }

    if (e.type === 'boss') {
      ctx.fillStyle = flash ? '#fff' : '#8b0000';
      // Body
      ctx.fillRect(e.x + 4, e.y + 16, 32, 28);
      // Head
      ctx.fillStyle = flash ? '#fff' : '#cc2200';
      ctx.fillRect(e.x + 6, e.y, 28, 18);
      // Eyes (glowing)
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(e.x + 10, e.y + 5, 8, 6);
      ctx.fillRect(e.x + 22, e.y + 5, 8, 6);
      // Legs
      ctx.fillStyle = '#500';
      ctx.fillRect(e.x + 4, e.y + 44, 12, 12);
      ctx.fillRect(e.x + 24, e.y + 44, 12, 12);

      // Cannon (ch1 and ch3)
      if (e.armed || chapter === 1) {
        ctx.fillStyle = '#555';
        ctx.fillRect(e.x + (e.dir > 0 ? e.w : -20), e.y + 10, 20, 10);
        ctx.fillStyle = '#888';
        ctx.fillRect(e.x + (e.dir > 0 ? e.w + 16 : -24), e.y + 12, 8, 6);
      }

      // HP bar
      const barW = 50;
      ctx.fillStyle = '#300';
      ctx.fillRect(e.x - 5, e.y - 14, barW, 6);
      ctx.fillStyle = '#f00';
      ctx.fillRect(e.x - 5, e.y - 14, barW * (e.hp / e.maxHp), 6);
      ctx.fillStyle = '#f55';
      ctx.fillRect(e.x - 5, e.y - 14, barW * (e.hp / e.maxHp), 2);

      // Label
      ctx.fillStyle = '#ff6666';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BROTHER BLOOD', e.x + e.w/2, e.y - 18);
      ctx.textAlign = 'left';
    }
  });
}

function drawProjectiles() {
  projectiles.forEach(p => {
    ctx.save();
    ctx.font = '16px serif';
    ctx.fillText(p.label || '⚡', p.x - 8, p.y + 8);
    ctx.restore();
  });
}

function drawCollectibles() {
  collectibles.forEach(c => {
    if (c.collected) return;
    const bob = Math.sin(frameCount * 0.08 + c.x) * 4;
    ctx.font = '22px serif';
    ctx.fillText(c.emoji, c.x, c.y + bob);
  });
}

function drawParticles() {
  particles.forEach(p => {
    ctx.globalAlpha = p.life / 50;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
  });
  ctx.globalAlpha = 1;
}

function drawHint() {
  // Chapter-specific hints
  const hints = [
    'COLLECT all 4 Titans! [← → WASD] Jump:[Space/W] Attack:[Z]',
    'DODGE purple beams! Attack Brother Blood! [Z to hit]',
    'COLLECT 6 stars! Avoid truth bubbles! [Z to attack]',
    'FINAL FIGHT! Attack Brother Blood with BABY HANDS! [Z]',
  ];
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.font = '6px "Press Start 2P", monospace';
  ctx.fillText(hints[chapter] || '', 10, 415);
}

function drawCountDisplay() {
  if (chapter === 0) {
    const got = collectibles.filter(c => c.collected).length;
    ctx.fillStyle = '#ffdd00';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText(`Titans: ${got}/4`, 10, 20);
  }
  if (chapter === 2) {
    const got = collectibles.filter(c => c.collected).length;
    ctx.fillStyle = '#00cc44';
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.fillText(`Respect: ${got}/6 ⭐`, 10, 20);
  }
}

// ============================================================
//  MAIN GAME LOOP
// ============================================================
let animId = null;

function gameLoop() {
  if (gameState !== 'playing') return;
  cancelAnimationFrame(animId);
  frameCount++;

  updatePlayer();
  updateEnemies();
  updateProjectiles();
  updateCollectibles();
  updateParticles();

  // Draw
  ctx.clearRect(0, 0, 800, 420);
  drawBG();
  drawPlatforms();
  drawCollectibles();
  drawParticles();
  drawProjectiles();
  drawEnemies();
  drawPlayer();
  drawCountDisplay();
  drawHint();

  // Message timer
  if (msgTimer > 0) {
    msgTimer--;
    if (msgTimer === 0) gameMsg.classList.add('hidden');
  }

  animId = requestAnimationFrame(gameLoop);
}

// ============================================================
//  BUTTON WIRING
// ============================================================
document.getElementById('start-btn').addEventListener('click', () => {
  showScreen('cutscene');
  playCutscene('intro', () => startChapter(0));
});

document.getElementById('restart-btn').addEventListener('click', () => {
  score = 0; lives = 10; chapter = 0;
  showScreen('cutscene');
  playCutscene('intro', () => startChapter(0));
});

document.getElementById('retry-btn').addEventListener('click', () => {
  lives = 10;
  showScreen('cutscene');
  playCutscene('intro', () => startChapter(0));
});

// ── Boot ───────────────────────────────────────────────────
showScreen('title');
