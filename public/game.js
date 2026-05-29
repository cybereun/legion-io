// 리전 아이오(Legion.io) 게임 엔진
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Web Audio API 사운드 합성 엔진
let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playSound(type) {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;
  
  switch (type) {
    case 'coin': // 동전 수집음 (맑고 높게 뾰롱~)
      {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
      break;
      
    case 'sword': // 칼 공격음 (슉!)
      {
        const bufferSize = audioCtx.sampleRate * 0.08;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 4;
        const gain = audioCtx.createGain();
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        filter.frequency.exponentialRampToValueAtTime(80, now + 0.08);
        noise.start(now);
        noise.stop(now + 0.08);
      }
      break;
      
    case 'arrow': // 화살 발사음 (피융~)
      {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      }
      break;
      
    case 'hit': // 일반 피격 타격음 (탁!)
      {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.linearRampToValueAtTime(30, now + 0.06);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      }
      break;

    case 'magic': // 마법 발사 (샤아아~)
      {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(950, now + 0.25);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
      break;

    case 'explosion': // 마법 폭발 (쾅!)
      {
        const bufferSize = audioCtx.sampleRate * 0.4;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.exponentialRampToValueAtTime(15, now + 0.4);
        const gain = audioCtx.createGain();
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        noise.start(now);
        noise.stop(now + 0.4);
      }
      break;

    case 'build': // 건물 건설 (뚝딱 칭!)
      {
        for (let delay of [0, 0.1]) {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(160, now + delay);
          osc.frequency.linearRampToValueAtTime(80, now + delay + 0.05);
          gain.gain.setValueAtTime(0.12, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.05);
          osc.start(now + delay);
          osc.stop(now + delay + 0.05);
        }
        const oscChime = audioCtx.createOscillator();
        const gainChime = audioCtx.createGain();
        oscChime.connect(gainChime);
        gainChime.connect(audioCtx.destination);
        oscChime.type = 'sine';
        oscChime.frequency.setValueAtTime(987.77, now + 0.2); // B5
        gainChime.gain.setValueAtTime(0.06, now + 0.2);
        gainChime.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        oscChime.start(now + 0.2);
        oscChime.stop(now + 0.45);
      }
      break;

    case 'destroy': // 건물 파괴 (쿠우웅)
      {
        const bufferSize = audioCtx.sampleRate * 0.35;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(15, now + 0.35);
        const gain = audioCtx.createGain();
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        noise.start(now);
        noise.stop(now + 0.35);
      }
      break;

    case 'death': // 캐릭터/유닛 사망 (스윽)
      {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 0.18);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      }
      break;

    case 'heal': // 포션 치유음 (라랄라~)
      {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(329.63, now); // E4
        osc.frequency.linearRampToValueAtTime(1046.50, now + 0.35); // C6
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
      break;

    case 'speed': // 스피드물약 가속음 (위잉~)
      {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.25);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
      break;

    case 'magnet': // 자석 소리 (위잉~)
      {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(659.25, now + 0.2); // E5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
      break;
  }
}

// 게임 상태 정의
const GAME_STATE = {
  START: "start",
  LOBBY: "lobby",
  PLAYING: "playing",
  GAMEOVER: "gameover"
};
let currentGameState = GAME_STATE.START;

// 세계(Map) 크기 정의
const WORLD_SIZE = 6000;

// 카메라 객체
const camera = {
  x: 0,
  y: 0,
  width: window.innerWidth,
  height: window.innerHeight,
  zoom: 1
};

// 엔티티 배열
let player = null;
let kings = []; // 플레이어와 봇 군주들
let coins = [];
let obstacles = [];
let buildings = []; // 건설된 모든 건물
let projectiles = [];
let particles = [];
let floatingTexts = [];
let items = []; // 필드에 스폰될 아이템들
let socket = null;
let isMultiplayer = false;
let roomCode = "";
let otherPlayers = {}; // 원격 플레이어들을 { socketId: King } 형태로 관리

// 화면 흔들림(Screen Shake) 효과 상태
let screenShake = { duration: 0, intensity: 0 };

// 미니맵 캔버스 레퍼런스
const miniMapCanvas = document.getElementById("miniMapCanvas");
const miniMapCtx = miniMapCanvas ? miniMapCanvas.getContext("2d") : null;

// 건설 모드 상태
let buildMode = {
  active: false,
  type: null, // 'mine', 'house', 'archerTower', 'mageTower'
  cost: 0,
  radius: 0
};

let selectedBuilding = null;
let isPaused = false;

// 게임 통계 및 밸런스 설정
const MAX_COINS = 350;
const MAX_OBSTACLES = 90;
const BOT_COUNT = 6;
const BOT_NAMES = ["Lord Arthur", "Baron Alex", "Duke Richard", "King Robert", "Sir Galahad", "Queen Sylvanas"];
const TEAM_COLORS = [
  { main: "#3b82f6", accent: "#60a5fa", name: "블루" },   // 플레이어 (Blue)
  { main: "#ef4444", accent: "#f87171", name: "레드" },   // 봇 1
  { main: "#eab308", accent: "#fde047", name: "골드" },   // 봇 2
  { main: "#a855f7", accent: "#c084fc", name: "퍼플" },   // 봇 3
  { main: "#10b981", accent: "#34d399", name: "그린" },   // 봇 4
  { main: "#f97316", accent: "#fb923c", name: "오렌지" }, // 봇 5
  { main: "#ec4899", accent: "#f472b6", name: "핑크" }    // 봇 6
];

// 단일 hex 색상 코드로부터 메인 및 액센트 색상 오브젝트를 매핑하는 헬퍼 함수
function createTeamColor(hexColor) {
  const colorMap = {
    '#3b82f6': { main: '#3b82f6', accent: '#60a5fa', name: '블루' },
    '#ef4444': { main: '#ef4444', accent: '#f87171', name: '레드' },
    '#22c55e': { main: '#22c55e', accent: '#4ade80', name: '그린' },
    '#f97316': { main: '#f97316', accent: '#fb923c', name: '오렌지' },
    '#a855f7': { main: '#a855f7', accent: '#c084fc', name: '퍼플' },
    '#eab308': { main: '#eab308', accent: '#fde047', name: '옐로우' },
    '#6366f1': { main: '#6366f1', accent: '#818cf8', name: '인디고' }
  };
  return colorMap[hexColor] || { main: hexColor, accent: hexColor, name: '커스텀' };
}

// 건물 스펙 정의
const BUILDING_SPECS = {
  mine: { name: "금광", cost: 250, radius: 25, maxHealth: 350, icon: "⛏️" },
  house: { name: "집", cost: 250, radius: 22, maxHealth: 250, icon: "🏠" },
  archerTower: { name: "아처타워", cost: 500, radius: 26, maxHealth: 500, icon: "🏰" },
  mageTower: { name: "메이지타워", cost: 1500, radius: 28, maxHealth: 800, icon: "🔮" },
  barracks: { name: "병영", cost: 400, radius: 27, maxHealth: 450, icon: "🛖" },
  stable: { name: "마구간", cost: 800, radius: 29, maxHealth: 650, icon: "🐴" },
  siegeWorkshop: { name: "공성소", cost: 1200, radius: 32, maxHealth: 900, icon: "🏗️" }
};

// 마우스 입력 위치
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// 모바일 핸드폰(스마트폰) 여부 판정 함수
function checkMobilePhone() {
  const ua = navigator.userAgent.toLowerCase();
  const isMobileUA = /android|webos|iphone|ipod|blackberry|iemobile|operamini/i.test(ua);
  const isTabletUA = /ipad|tablet/i.test(ua);
  
  // 가로 모드가 기본이므로 화면의 세로 높이(또는 짧은 축)가 500px 이하인 경우 스마트폰으로 판정
  const isSmallScreen = Math.min(window.innerWidth, window.innerHeight) <= 500;
  const isPhone = isMobileUA && !isTabletUA && isSmallScreen;

  if (isPhone) {
    document.body.classList.add("mobile-phone");
  } else {
    document.body.classList.remove("mobile-phone");
  }
  return isPhone;
}

function isMobilePhone() {
  return document.body.classList.contains("mobile-phone");
}

// 캔버스 크기 맞춤
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  camera.width = canvas.width;
  camera.height = canvas.height;
  checkMobilePhone();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// 마우스 움직임 추적
window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// 터치 움직임 추적
function handleTouch(e) {
  if (e.touches && e.touches.length > 0) {
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
  }
}
window.addEventListener("touchstart", handleTouch, { passive: true });
window.addEventListener("touchmove", handleTouch, { passive: true });

// 마우스 클릭 시 건설 실행 혹은 건물 선택(업그레이드)
window.addEventListener("mousedown", (e) => {
  if (currentGameState !== GAME_STATE.PLAYING) return;
  
  // HUD 클릭 시 예외 처리
  if (e.target.closest('.hud-card') || e.target.closest('.screen-overlay')) return;

  const worldClickX = (mouseX - camera.width / 2) / camera.zoom + camera.x + camera.width / 2;
  const worldClickY = (mouseY - camera.height / 2) / camera.zoom + camera.y + camera.height / 2;

  if (buildMode.active) {
    executeBuildingPlacement(player, worldClickX, worldClickY);
  } else {
    // 클릭한 좌표가 플레이어 소유의 건물인지 검사
    let clickedBuilding = null;
    buildings.forEach(b => {
      if (b.isDead || b.owner !== player) return;
      const dist = Math.hypot(b.x - worldClickX, b.y - worldClickY);
      if (dist < b.radius + 15) {
        clickedBuilding = b;
      }
    });

    if (clickedBuilding) {
      selectedBuilding = clickedBuilding;
      showBuildingUpgradeUI(selectedBuilding);
    } else {
      selectedBuilding = null;
      hideBuildingUpgradeUI();
    }
  }
});

// 키보드 입력 바인딩 (소환 및 건설)
window.addEventListener("keydown", (e) => {
  if (currentGameState !== GAME_STATE.PLAYING) return;
  
  const key = e.key.toLowerCase();
  
  if (e.key === "Escape") {
    cancelBuildingMode();
    selectedBuilding = null;
    hideBuildingUpgradeUI();
  } else if (e.key === "1") {
    spawnUnit("soldier");
  } else if (e.key === "2") {
    spawnUnit("archer");
  } else if (e.key === "3") {
    startBuilding("mine");
  } else if (e.key === "4") {
    startBuilding("house");
  } else if (e.key === "5") {
    startBuilding("archerTower");
  } else if (e.key === "6") {
    startBuilding("mageTower");
  } else if (key === "q") {
    startBuilding("barracks");
  } else if (key === "w") {
    startBuilding("stable");
  } else if (key === "e") {
    startBuilding("siegeWorkshop");
  } else if (e.key === "7") {
    spawnUnit("cavalry");
  } else if (e.key === "8") {
    spawnUnit("catapult");
  } else if (e.key === "9") {
    spawnUnit("knight");
  } else if (e.key === "0") {
    spawnUnit("mage");
  }
});

// --- 파티클 클래스 ---
class Particle {
  constructor(x, y, color, speed, angle, life) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = life;
    this.maxLife = life;
    this.size = Math.random() * 2 + 1.5;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.95;
    this.vy *= 0.95;
    this.life--;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.life / this.maxLife;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x - camera.x, this.y - camera.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// --- 데미지/골드 팝업 텍스트 ---
class FloatingText {
  constructor(x, y, text, color, isBold = false) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.isBold = isBold;
    this.vy = -Math.random() * 1.2 - 0.4;
    this.vx = (Math.random() - 0.5) * 0.8;
    this.life = 50;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.life / 50;
    ctx.fillStyle = this.color;
    ctx.font = `${this.isBold ? 'bold ' : ''}14px Outfit, Noto Sans KR`;
    ctx.textAlign = "center";
    ctx.fillText(this.text, this.x - camera.x, this.y - camera.y);
    ctx.restore();
  }
}

// --- 금화(자원) 클래스 ---
class Coin {
  constructor() {
    this.respawn();
  }
  respawn() {
    this.x = Math.random() * (WORLD_SIZE - 40) + 20;
    this.y = Math.random() * (WORLD_SIZE - 40) + 20;
    this.radius = 7; // 크기 축소 (12 -> 7)
    this.value = Math.floor(Math.random() * 4) + 4; // 4 ~ 7 골드
    this.pulseAngle = Math.random() * Math.PI * 2;
  }
  update() {
    this.pulseAngle += 0.05;
  }
  draw() {
    const scale = 1 + Math.sin(this.pulseAngle) * 0.08;
    const drawRadius = this.radius * scale;
    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;

    if (screenX < -50 || screenX > camera.width + 50 || screenY < -50 || screenY > camera.height + 50) return;

    ctx.save();
    ctx.shadowColor = "rgba(251, 191, 36, 0.4)";
    ctx.shadowBlur = 6;

    ctx.fillStyle = "#eab308";
    ctx.beginPath();
    ctx.arc(screenX, screenY, drawRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fde047";
    ctx.beginPath();
    ctx.arc(screenX, screenY, drawRadius * 0.75, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// --- 장애물 (바위, 덤불) 클래스 ---
class Obstacle {
  constructor() {
    this.x = Math.random() * (WORLD_SIZE - 150) + 75;
    this.y = Math.random() * (WORLD_SIZE - 150) + 75;
    this.obstacleType = Math.random() > 0.5 ? "rock" : "bush";
    // 장애물 크기 축소 (35-65 -> 20-35)
    this.radius = this.obstacleType === "rock" ? Math.random() * 15 + 20 : Math.random() * 10 + 25;
  }
  draw() {
    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;

    if (screenX < -this.radius || screenX > camera.width + this.radius || 
        screenY < -this.radius || screenY > camera.height + this.radius) return;

    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;

    if (this.obstacleType === "rock") {
      ctx.fillStyle = "#64748b";
      ctx.beginPath();
      ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#94a3b8";
      ctx.beginPath();
      ctx.arc(screenX - this.radius * 0.25, screenY - this.radius * 0.25, this.radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = "#15803d";
      ctx.beginPath();
      ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#166534";
      ctx.beginPath();
      ctx.arc(screenX + this.radius * 0.3, screenY - this.radius * 0.2, this.radius * 0.7, 0, Math.PI * 2);
      ctx.arc(screenX - this.radius * 0.3, screenY + this.radius * 0.2, this.radius * 0.7, 0, Math.PI * 2);
      ctx.fill();

      // 빨간 열매
      ctx.fillStyle = "#ef4444";
      const berries = [{x:-0.4,y:-0.3}, {x:0.3,y:-0.4}, {x:-0.2,y:0.4}, {x:0.4,y:0.3}];
      berries.forEach(pos => {
        ctx.beginPath();
        ctx.arc(screenX + this.radius * pos.x, screenY + this.radius * pos.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    ctx.restore();
  }
}

// --- 버프 아이템 클래스 ---
class Item {
  constructor() {
    this.respawn();
  }
  respawn() {
    this.x = Math.random() * (WORLD_SIZE - 200) + 100;
    this.y = Math.random() * (WORLD_SIZE - 200) + 100;
    this.radius = 12;
    // 아이템 종류: 'heal' (❤️), 'speed' (⚡), 'magnet' (🧲)
    const rand = Math.random();
    if (rand < 0.4) {
      this.itemType = 'heal';
      this.icon = '❤️';
      this.color = '#ef4444';
    } else if (rand < 0.75) {
      this.itemType = 'speed';
      this.icon = '⚡';
      this.color = '#06b6d4';
    } else {
      this.itemType = 'magnet';
      this.icon = '🧲';
      this.color = '#a855f7';
    }
    this.pulseAngle = Math.random() * Math.PI * 2;
  }
  update() {
    this.pulseAngle += 0.04;
  }
  draw() {
    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;

    if (screenX < -50 || screenX > camera.width + 50 || screenY < -50 || screenY > camera.height + 50) return;

    const scale = 1 + Math.sin(this.pulseAngle) * 0.1;
    const drawRadius = this.radius * scale;

    ctx.save();
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;

    // 기단 링
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(screenX, screenY, drawRadius, 0, Math.PI * 2);
    ctx.stroke();

    // 반투명 구체
    ctx.fillStyle = this.color + "22"; // 13% 불투명
    ctx.beginPath();
    ctx.arc(screenX, screenY, drawRadius * 0.9, 0, Math.PI * 2);
    ctx.fill();

    // 중앙 아이콘
    ctx.fillStyle = "#ffffff";
    ctx.font = "12px Outfit, Noto Sans KR";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.icon, screenX, screenY);

    ctx.restore();
  }
}

// --- 공통 엔티티 클래스 ---
class Entity {
  constructor(x, y, radius, speed, health, teamColor) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = speed;
    this.health = health;
    this.maxHealth = health;
    this.teamColor = teamColor;
    this.angle = 0;
    this.isDead = false;
  }
  takeDamage(amount, sourceName) {
    if (this.isDead) return;
    this.health -= amount;
    
    floatingTexts.push(new FloatingText(this.x, this.y - this.radius, `-${Math.round(amount)}`, "#ef4444", true));

    for (let i = 0; i < 3; i++) {
      particles.push(new Particle(this.x, this.y, "#ffffff", Math.random() * 3 + 1, Math.random() * Math.PI * 2, 15));
    }

    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
      this.onDeath(sourceName);
    }
  }
  onDeath(sourceName) {
    if (this.owner === player || this === player) {
      playSound("death");
    }
    for (let i = 0; i < 8; i++) {
      particles.push(new Particle(this.x, this.y, this.teamColor.main, Math.random() * 4 + 2, Math.random() * Math.PI * 2, 30));
    }
  }
  drawHealthBar() {
    if (this.health === this.maxHealth) return;
    const barWidth = this.radius * 2;
    const barHeight = 4;
    const screenX = this.x - camera.x - this.radius;
    const screenY = this.y - camera.y - this.radius - 8;

    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(screenX, screenY, barWidth, barHeight);

    const fillWidth = (this.health / this.maxHealth) * barWidth;
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(screenX, screenY, fillWidth, barHeight);
  }
}

// --- 군주 (King) 클래스 ---
class King extends Entity {
  constructor(x, y, name, teamColor, isBot = false) {
    super(x, y, 18, 2.5, 400, teamColor); // 군주 크기 축소 (32 -> 18), 속도 조정 (3.5 -> 2.5)
    this.name = name;
    this.gold = 150; 
    this.isBot = isBot;
    this.army = [];
    this.maxArmyLimit = 20; // 초기 인구수 제한
    
    this.baseSpeed = 2.5;
    this.speedBuffTimer = 0;
    this.magnetTimer = 0;
    
    this.botState = "wander";
    this.botTimer = 0;
    this.targetX = x;
    this.targetY = y;
  }
  
  update() {
    if (this.isDead) return;

    // ---------------- [원격 플레이어 동기화 처리] ----------------
    if (this.isRemotePlayer) {
      // 서버로부터 수신한 목표 좌표로 Lerp(선형 보간) 이동
      if (this.targetX !== undefined && this.targetY !== undefined) {
        this.x += (this.targetX - this.x) * 0.25;
        this.y += (this.targetY - this.y) * 0.25;
      }
      // 인구수 한도는 매 프레임 동적 갱신 (레벨별 인구 기여도 차등화: Lv1=+15, Lv2=+35, Lv3=+65)
      let housePopulation = 0;
      buildings.forEach(b => {
        if (!b.isDead && b.owner === this && b.buildingType === "house") {
          const lv = b.level || 1;
          if (lv === 1) housePopulation += 15;
          else if (lv === 2) housePopulation += 35;
          else if (lv === 3) housePopulation += 65;
        }
      });
      this.maxArmyLimit = 20 + housePopulation;
      return; // 원격 플레이어는 물리 충돌 및 자원 획득 연산을 직접 하지 않고 스킵
    }

    // ---------------- [로컬 플레이어 및 AI 봇 처리] ----------------
    // 버프 타이머 차감
    if (this.speedBuffTimer > 0) this.speedBuffTimer--;
    if (this.magnetTimer > 0) this.magnetTimer--;

    // 속도 버프 처리
    this.speed = this.speedBuffTimer > 0 ? this.baseSpeed * 1.5 : this.baseSpeed;

    // 자석 버프 처리 (금화 끌어당기기)
    if (this.magnetTimer > 0 && !this.isBot) {
      coins.forEach((coin, idx) => {
        const dx = this.x - coin.x;
        const dy = this.y - coin.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 300) { // 300px 반경
          // 멀티플레이 모드일 때는 서버 동기화를 깨지 않도록 자석 끌림을 조절하거나, 
          // 로컬에서만 끌어당기고 획득 요청을 보내는 방식으로 구현
          coin.x += (this.x - coin.x) * 0.15;
          coin.y += (this.y - coin.y) * 0.15;
        }
      });
    }

    let targetAngle = this.angle;

    if (!this.isBot) {
      const worldMouseX = (mouseX - camera.width / 2) / camera.zoom + camera.x + camera.width / 2;
      const worldMouseY = (mouseY - camera.height / 2) / camera.zoom + camera.y + camera.height / 2;
      const dx = worldMouseX - this.x;
      const dy = worldMouseY - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 15) {
        targetAngle = Math.atan2(dy, dx);
        this.angle = targetAngle;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
      }
    } else {
      this.updateBotAI();
    }

    // 맵 경계 제한
    this.x = Math.max(this.radius, Math.min(WORLD_SIZE - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(WORLD_SIZE - this.radius, this.y));

    // 장애물 충돌 처리
    obstacles.forEach(obs => {
      const dx = this.x - obs.x;
      const dy = this.y - obs.y;
      const dist = Math.hypot(dx, dy);
      const minDist = this.radius + obs.radius;
      if (dist < minDist) {
        const pushAngle = Math.atan2(dy, dx);
        this.x = obs.x + Math.cos(pushAngle) * minDist;
        this.y = obs.y + Math.sin(pushAngle) * minDist;
      }
    });

    // 건물 충돌 처리 (지나가지 못하게 슬라이딩 구현)
    buildings.forEach(b => {
      if (b.isDead) return;
      const dx = this.x - b.x;
      const dy = this.y - b.y;
      const dist = Math.hypot(dx, dy);
      const minDist = this.radius + b.radius;
      if (dist < minDist) {
        const pushAngle = Math.atan2(dy, dx);
        this.x = b.x + Math.cos(pushAngle) * minDist;
        this.y = b.y + Math.sin(pushAngle) * minDist;
      }
    });

    // 금화 수집 감지
    coins.forEach((coin, idx) => {
      const dx = this.x - coin.x;
      const dy = this.y - coin.y;
      const dist = Math.hypot(dx, dy);
      if (dist < this.radius + coin.radius) {
        if (isMultiplayer) {
          // 멀티플레이 모드: 서버에 수집 요청 전송 (선착순 판정)
          socket.emit('collectCoin', { coinIndex: idx });
        } else {
          // 싱글플레이 모드: 기존 로컬 즉시 획득
          this.gold += coin.value;
          floatingTexts.push(new FloatingText(coin.x, coin.y, `+${coin.value}G`, "#fbbf24"));
          
          if (this === player) {
            playSound("coin");
          }

          for (let i = 0; i < 4; i++) {
            particles.push(new Particle(coin.x, coin.y, "#fde047", Math.random() * 2 + 1, Math.random() * Math.PI * 2, 15));
          }
          coin.respawn();

          // 봇 소환/건설 처리
          if (this.isBot) {
            this.tryBotActions();
          }
        }
      }
    });

    // 동적 인구수 상한 연산 (레벨별 인구 기여도 차등화: Lv1=+15, Lv2=+35, Lv3=+65)
    let housePopulation = 0;
    buildings.forEach(b => {
      if (!b.isDead && b.owner === this && b.buildingType === "house") {
        const lv = b.level || 1;
        if (lv === 1) housePopulation += 15;
        else if (lv === 2) housePopulation += 35;
        else if (lv === 3) housePopulation += 65;
      }
    });
    this.maxArmyLimit = 20 + housePopulation;
  }

  updateBotAI() {
    this.botTimer--;

    // 1. 위협 회피
    let nearestThreat = null;
    let minThreatDist = 300;
    kings.forEach(other => {
      if (other === this || other.isDead) return;
      const dist = Math.hypot(other.x - this.x, other.y - this.y);
      if (dist < minThreatDist && other.army.length > this.army.length * 1.3) {
        nearestThreat = other;
        minThreatDist = dist;
      }
    });

    if (nearestThreat) {
      const escapeAngle = Math.atan2(this.y - nearestThreat.y, this.x - nearestThreat.x);
      this.targetX = this.x + Math.cos(escapeAngle) * 200;
      this.targetY = this.y + Math.sin(escapeAngle) * 200;
      this.botState = "flee";
      this.botTimer = 30;
    }

    // 2. 사냥
    if (this.botState !== "flee") {
      let targetEnemy = null;
      let minEnemyDist = 250;
      kings.forEach(other => {
        if (other === this || other.isDead) return;
        const dist = Math.hypot(other.x - this.x, other.y - this.y);
        if (dist < minEnemyDist && other.army.length < this.army.length * 0.8) {
          targetEnemy = other;
          minEnemyDist = dist;
        }
      });

      if (targetEnemy) {
        this.targetX = targetEnemy.x;
        this.targetY = targetEnemy.y;
        this.botState = "hunt";
        this.botTimer = 40;
      }
    }

    // 3. 자원 수집 또는 배회
    if (this.botState !== "flee" && this.botState !== "hunt" && this.botTimer <= 0) {
      let nearestCoin = null;
      let minCoinDist = 300;
      coins.forEach(coin => {
        const dist = Math.hypot(coin.x - this.x, coin.y - this.y);
        if (dist < minCoinDist) {
          nearestCoin = coin;
          minCoinDist = dist;
        }
      });

      if (nearestCoin) {
        this.targetX = nearestCoin.x;
        this.targetY = nearestCoin.y;
        this.botState = "collect";
        this.botTimer = 50;
      } else {
        this.targetX = this.x + (Math.random() - 0.5) * 300;
        this.targetY = this.y + (Math.random() - 0.5) * 300;
        this.botState = "wander";
        this.botTimer = Math.floor(Math.random() * 60) + 30;
      }
    }

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 10) {
      this.angle = Math.atan2(dy, dx);
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
    }
  }

  tryBotActions() {
    // 봇 병력 채우기 (인구수 제한 내에서)
    if (this.army.length < this.maxArmyLimit) {
      if (this.gold >= 35 && Math.random() > 0.6) {
        this.gold -= 35;
        this.army.push(new Unit(this.x, this.y, this, "archer"));
      } else if (this.gold >= 20 && Math.random() > 0.4) {
        this.gold -= 20;
        this.army.push(new Unit(this.x, this.y, this, "soldier"));
      }
    }

    // 봇 건물 건설 로직 (골드가 충분하고 10% 확률)
    if (this.gold >= 350 && Math.random() > 0.9) {
      // 건설할 타겟 종류 랜덤 선택 (RTS 생산 건물 포함)
      let typeToBuild = "mine";
      const rand = Math.random();
      if (rand > 0.85) typeToBuild = "siegeWorkshop";
      else if (rand > 0.7) typeToBuild = "stable";
      else if (rand > 0.55) typeToBuild = "barracks";
      else if (rand > 0.4) typeToBuild = "archerTower";
      else if (rand > 0.2) typeToBuild = "house";

      const cost = BUILDING_SPECS[typeToBuild].cost;
      if (this.gold >= cost) {
        // 군주 주변 80~150px 무작위 배치
        const dist = Math.random() * 70 + 80;
        const angle = Math.random() * Math.PI * 2;
        const bx = this.x + Math.cos(angle) * dist;
        const by = this.y + Math.sin(angle) * dist;
        
        executeBuildingPlacement(this, bx, by, typeToBuild);
      }
    }

    // 봇 건물 업그레이드 로직 (골드가 충분하고 15% 확률)
    if (this.gold >= 600 && Math.random() > 0.85) {
      const myBuildings = buildings.filter(b => !b.isDead && b.owner === this && b.level < 3);
      if (myBuildings.length > 0) {
        const targetB = myBuildings[Math.floor(Math.random() * myBuildings.length)];
        const cost = BUILDING_SPECS[targetB.buildingType].cost * (targetB.level === 1 ? 4 : 8);
        if (this.gold >= cost) {
          this.gold -= cost;
          executeBuildingUpgrade(targetB);
          
          if (isMultiplayer && socket) {
            socket.emit("upgradeBuilding", {
              id: targetB.id,
              level: targetB.level,
              health: targetB.health
            });
          }
        }
      }
    }
  }

  onDeath(sourceName) {
    super.onDeath(sourceName);
    this.army.forEach(u => u.takeDamage(9999, "Lord Defeated"));
    this.army = [];

    // 소유한 모든 건물의 소유권 파괴 (중립화 또는 철거)
    buildings.forEach(b => {
      if (b.owner === this) {
        b.takeDamage(9999, "Owner Dead");
      }
    });

    if (this === player) {
      currentGameState = GAME_STATE.GAMEOVER;
      document.getElementById("gameOverScreen").classList.remove("hidden");
      document.getElementById("gameOverMsg").innerText = `${sourceName}에게 왕관을 빼앗겼습니다.`;
      document.getElementById("gameHUD").classList.add("hidden");
    }
  }

  draw() {
    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;

    if (screenX < -50 || screenX > camera.width + 50 || screenY < -50 || screenY > camera.height + 50) return;

    ctx.save();
    ctx.shadowColor = this.teamColor.main;
    ctx.shadowBlur = 10;

    ctx.translate(screenX, screenY);
    ctx.rotate(this.angle);

    // 1. 망토 (Cape)
    ctx.fillStyle = "#b91c1c";
    ctx.beginPath();
    ctx.moveTo(-8, -6);
    ctx.lineTo(-22, -13);
    ctx.lineTo(-25, 0);
    ctx.lineTo(-22, 13);
    ctx.lineTo(-8, 6);
    ctx.closePath();
    ctx.fill();

    // 2. 갑옷 몸통 (Scale-down 반영)
    ctx.fillStyle = "#475569";
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // 3. 골드 어깨 가드
    ctx.fillStyle = "#eab308";
    ctx.beginPath();
    ctx.arc(0, -this.radius * 0.8, 6, 0, Math.PI * 2);
    ctx.arc(0, this.radius * 0.8, 6, 0, Math.PI * 2);
    ctx.fill();

    // 4. 투구
    ctx.fillStyle = "#64748b";
    ctx.beginPath();
    ctx.arc(2, 0, 11, 0, Math.PI * 2);
    ctx.fill();

    // 왕관 뾰족 부분
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.moveTo(8, -5);
    ctx.lineTo(14, -6);
    ctx.lineTo(11, 0);
    ctx.lineTo(14, 6);
    ctx.lineTo(8, 5);
    ctx.closePath();
    ctx.fill();

    // 깃털
    ctx.fillStyle = this.teamColor.main;
    ctx.beginPath();
    ctx.ellipse(-8, 0, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. 검
    ctx.save();
    ctx.translate(11, 11);
    ctx.rotate(0.5);
    ctx.fillStyle = "#ca8a04";
    ctx.fillRect(-2, -5, 4, 10);
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(2, -2, 18, 4);
    ctx.restore();

    ctx.restore();

    // 닉네임
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px Outfit, Noto Sans KR";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 4;
    ctx.fillText(this.name, screenX, screenY + this.radius + 15);
    ctx.restore();

    this.drawHealthBar();
  }
}

// --- 병사/궁수 유닛 (Unit) 클래스 ---
class Unit extends Entity {
  constructor(x, y, owner, unitType) {
    let health = 150;
    let radius = 10;
    let speedMult = 1.15;
    let range = 30;
    let damage = 25;
    let cooldown = 800;

    if (unitType === "archer") {
      health = 80;
      radius = 9;
      range = 180;
      damage = 18;
      cooldown = 1300;
    } else if (unitType === "knight") {
      health = 300;
      radius = 12;
      speedMult = 1.0;
      range = 32;
      damage = 38;
      cooldown = 1000;
    } else if (unitType === "mage") {
      health = 70;
      radius = 9;
      speedMult = 1.1;
      range = 200;
      damage = 35;
      cooldown = 1800;
    } else if (unitType === "cavalry") {
      health = 190;
      radius = 11;
      speedMult = 1.5;
      range = 35;
      damage = 30;
      cooldown = 900;
    } else if (unitType === "catapult") {
      health = 250;
      radius = 14;
      speedMult = 0.6;
      range = 350;
      damage = 70;
      cooldown = 3000;
    }

    const speed = owner.speed * speedMult;
    super(x, y, radius, speed, health, owner.teamColor);
    
    this.owner = owner;
    this.unitType = unitType;
    this.attackRange = range;
    this.attackDamage = damage;
    this.attackCooldown = cooldown;
    this.lastAttackTime = 0;
    this.swingProgress = 0;
    this.target = null;
    this.baseSpeed = speed;
    this.id = owner.socketId ? (owner.socketId + "_" + Date.now() + "_" + Math.floor(Math.random() * 10000)) : ("local_" + Date.now() + "_" + Math.floor(Math.random() * 10000));
  }

  update() {
    if (this.isDead) return;

    if (this.owner === player && player.speedBuffTimer > 0) {
      this.speed = this.baseSpeed * 1.4;
    } else {
      this.speed = this.baseSpeed;
    }

    // 1. 군집(Boids/Flocking) 이동 알고리즘
    let forceX = 0;
    let forceY = 0;

    // (A) 리더(군주) 추적
    const dx = this.owner.x - this.x;
    const dy = this.owner.y - this.y;
    const distToLeader = Math.hypot(dx, dy);

    if (distToLeader > 45) {
      forceX += (dx / distToLeader) * 2.0;
      forceY += (dy / distToLeader) * 2.0;
    }

    // (B) 유닛 간 분리 (Separation)
    let sepX = 0;
    let sepY = 0;
    let sepCount = 0;
    
    this.owner.army.forEach(other => {
      if (other === this) return;
      const d = Math.hypot(other.x - this.x, other.y - this.y);
      const minDistance = this.radius + other.radius + 6; // 스케일 비례 좁혀짐

      if (d < minDistance && d > 0) {
        sepX += (this.x - other.x) / d;
        sepY += (this.y - other.y) / d;
        sepCount++;
      }
    });

    if (sepCount > 0) {
      forceX += (sepX / sepCount) * 2.5;
      forceY += (sepY / sepCount) * 2.5;
    }

    // 2. 근처 적 타겟 모드
    this.findNearestTarget();
    
    if (this.target && !this.target.isDead) {
      const targetDist = Math.hypot(this.target.x - this.x, this.target.y - this.y);

      if (targetDist < this.attackRange) {
        this.angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
        this.attemptAttack();
        
        if (this.unitType === "archer") {
          forceX *= 0.1;
          forceY *= 0.1;
        } else {
          forceX += (this.target.x - this.x) / targetDist * 1.5;
          forceY += (this.target.y - this.y) / targetDist * 1.5;
        }
      } else {
        forceX += (this.target.x - this.x) / targetDist * 1.2;
        forceY += (this.target.y - this.y) / targetDist * 1.2;
      }
    }

    const totalForce = Math.hypot(forceX, forceY);
    if (totalForce > 0.1) {
      this.vx = (forceX / totalForce) * this.speed;
      this.vy = (forceY / totalForce) * this.speed;
      this.x += this.vx;
      this.y += this.vy;

      if (!this.target) {
        this.angle = Math.atan2(this.vy, this.vx);
      }
    }

    // 맵 경계 제한
    this.x = Math.max(this.radius, Math.min(WORLD_SIZE - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(WORLD_SIZE - this.radius, this.y));

    if (this.swingProgress > 0) this.swingProgress -= 0.1;

    // 장애물 충돌
    obstacles.forEach(obs => {
      const dx = this.x - obs.x;
      const dy = this.y - obs.y;
      const dist = Math.hypot(dx, dy);
      const minDist = this.radius + obs.radius;
      if (dist < minDist) {
        const pushAngle = Math.atan2(dy, dx);
        this.x = obs.x + Math.cos(pushAngle) * minDist;
        this.y = obs.y + Math.sin(pushAngle) * minDist;
      }
    });

    // 건물 충돌 (병사들도 못 뚫고 지나가게)
    buildings.forEach(b => {
      if (b.isDead) return;
      const dx = this.x - b.x;
      const dy = this.y - b.y;
      const dist = Math.hypot(dx, dy);
      const minDist = this.radius + b.radius;
      if (dist < minDist) {
        const pushAngle = Math.atan2(dy, dx);
        this.x = b.x + Math.cos(pushAngle) * minDist;
        this.y = b.y + Math.sin(pushAngle) * minDist;
      }
    });
  }

  findNearestTarget() {
    let nearest = null;
    let minDist = this.attackRange * 1.5;

    kings.forEach(k => {
      if (k === this.owner || k.isDead) return;

      // 1. 적 군주 타겟팅
      const distToKing = Math.hypot(k.x - this.x, k.y - this.y);
      if (distToKing < minDist) {
        nearest = k;
        minDist = distToKing;
      }

      // 2. 적 병사 타겟팅
      k.army.forEach(u => {
        if (u.isDead) return;
        const distToUnit = Math.hypot(u.x - this.x, u.y - this.y);
        if (distToUnit < minDist) {
          nearest = u;
          minDist = distToUnit;
        }
      });
    });

    // 3. 적 건물 타겟팅 (추가!)
    buildings.forEach(b => {
      if (b.isDead || b.owner === this.owner) return;
      const distToBld = Math.hypot(b.x - this.x, b.y - this.y);
      if (distToBld < minDist) {
        nearest = b;
        minDist = distToBld;
      }
    });

    this.target = nearest;
  }

  attemptAttack() {
    const now = Date.now();
    if (now - this.lastAttackTime < this.attackCooldown) return;
    this.lastAttackTime = now;

    if (this.owner === player) {
      if (this.unitType === "soldier" || this.unitType === "knight" || this.unitType === "cavalry") {
        playSound("sword");
      } else if (this.unitType === "archer") {
        playSound("arrow");
      } else if (this.unitType === "mage") {
        playSound("magic");
      } else if (this.unitType === "catapult") {
        playSound("magic");
      }
    }

    const sourceName = `${this.owner.name}의 ${this.unitType === "soldier" ? "보병" : this.unitType === "knight" ? "기사" : this.unitType === "cavalry" ? "경기병" : this.unitType === "archer" ? "궁수" : this.unitType === "mage" ? "마법사" : "투석기"}`;

    if (this.unitType === "soldier" || this.unitType === "knight" || this.unitType === "cavalry") {
      this.swingProgress = 1.0;
      
      // 데미지 직접 적용
      this.target.takeDamage(this.attackDamage, sourceName);

      // 멀티플레이어인 경우 대상 피해량 소켓 전송
      if (isMultiplayer && this.owner === player) {
        if (this.target.socketId) {
          // 적 군주 공격
          socket.emit('damagePlayer', { targetSocketId: this.target.socketId, damage: this.attackDamage, sourceName: sourceName });
        } else if (this.target.owner && this.target.owner.socketId) {
          // 적 유닛 공격
          socket.emit('damageUnit', { ownerSocketId: this.target.owner.socketId, unitId: this.target.id, damage: this.attackDamage, sourceName: sourceName });
        } else if (this.target.buildingType) {
          // 적 건물 공격
          socket.emit('damageBuilding', { id: this.target.id, damage: this.attackDamage, sourceName: sourceName });
        }
      }
    } else {
      let pType = "arrow";
      if (this.unitType === "mage") pType = "magicball";
      else if (this.unitType === "catapult") pType = "boulder";
      
      projectiles.push(new Projectile(this.x, this.y, this.target, this.attackDamage, this, pType));

      // 멀티플레이어이고 내가 발사 주체인 경우 투사체 생성 전파
      if (isMultiplayer && this.owner === player) {
        let targetId = this.target.id || "";
        let targetType = 'building';
        let targetOwnerId = this.target.ownerId || "";

        if (this.target.socketId) {
          targetId = this.target.socketId;
          targetType = 'player';
          targetOwnerId = this.target.socketId;
        } else if (this.target.owner && this.target.owner.socketId) {
          targetType = 'unit';
          targetOwnerId = this.target.owner.socketId;
        }

        socket.emit('fireProjectile', {
          startX: this.x,
          startY: this.y,
          targetId: targetId,
          targetType: targetType,
          targetOwnerId: targetOwnerId,
          damage: this.attackDamage,
          pType: pType
        });
      }
    }
  }

  draw() {
    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;

    if (screenX < -30 || screenX > camera.width + 30 || screenY < -30 || screenY > camera.height + 30) return;

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(this.angle);

    if (this.unitType === "soldier") {
      ctx.fillStyle = "#475569";
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = this.teamColor.main;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(-2, this.radius * 0.6, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = this.teamColor.accent;
      ctx.beginPath();
      ctx.arc(1.5, 0, 6.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      const swingAngle = this.swingProgress * Math.PI * 0.6;
      ctx.translate(4, -this.radius * 0.5);
      ctx.rotate(-0.2 + swingAngle);
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(0, -1.5, 11, 3);
      ctx.fillStyle = "#78350f";
      ctx.fillRect(-2, -3, 2, 6);
      ctx.restore();
    } else if (this.unitType === "knight") {
      // 기사 렌더링 (철갑 탱커)
      ctx.fillStyle = "#94a3b8"; // 은갑옷
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      // 금빛 방패
      ctx.fillStyle = "#eab308";
      ctx.beginPath();
      ctx.arc(-2, this.radius * 0.7, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fde047";
      ctx.beginPath();
      ctx.arc(-2, this.radius * 0.7, 3, 0, Math.PI * 2);
      ctx.fill();

      // 은색 대검
      ctx.save();
      const swingAngle = this.swingProgress * Math.PI * 0.7;
      ctx.translate(5, -this.radius * 0.6);
      ctx.rotate(-0.1 + swingAngle);
      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(0, -2, 14, 4);
      ctx.fillStyle = "#ca8a04";
      ctx.fillRect(-2, -4, 2, 8);
      ctx.restore();

      // 투구 깃털
      ctx.fillStyle = this.teamColor.main;
      ctx.beginPath();
      ctx.ellipse(-6, 0, 6, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.unitType === "mage") {
      // 마법사 렌더링
      ctx.fillStyle = "#4c1d95"; // 자주색 로브
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      // 마법 모자
      ctx.fillStyle = "#6d28d9";
      ctx.beginPath();
      ctx.moveTo(-this.radius, 0);
      ctx.lineTo(-this.radius - 8, 0);
      ctx.lineTo(0, -6);
      ctx.closePath();
      ctx.fill();

      // 팀 장식
      ctx.fillStyle = this.teamColor.main;
      ctx.beginPath();
      ctx.arc(2, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      // 마법 스태프
      ctx.fillStyle = "#78350f";
      ctx.fillRect(2, -this.radius * 0.9, 8, 2.5);
      const pulse = 1 + Math.sin(Date.now() * 0.015) * 0.2;
      ctx.fillStyle = "#a855f7";
      ctx.beginPath();
      ctx.arc(10, -this.radius * 0.9 + 1, 4.5 * pulse, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.unitType === "cavalry") {
      // 경기병 렌더링 (갈색 말 + 기병 탑승)
      ctx.fillStyle = "#78350f"; // 말 몸통
      ctx.beginPath();
      ctx.ellipse(0, 0, this.radius * 1.3, this.radius * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#475569"; // 탑승자
      ctx.beginPath();
      ctx.arc(2, 0, this.radius * 0.75, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = this.teamColor.main; // 마갑
      ctx.fillRect(-this.radius * 0.6, -this.radius * 0.5, this.radius * 0.9, this.radius * 1.0);

      // 기창 랜스
      ctx.save();
      const swingAngle = this.swingProgress * Math.PI * 0.3;
      ctx.translate(6, this.radius * 0.6);
      ctx.rotate(0.2 - swingAngle);
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(0, -1.5, 17, 3);
      ctx.fillStyle = this.teamColor.accent;
      ctx.beginPath();
      ctx.moveTo(11, -1.5);
      ctx.lineTo(16, 4);
      ctx.lineTo(11, 1.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (this.unitType === "catapult") {
      // 투석기 렌더링 (나무 차대)
      ctx.fillStyle = "#78350f";
      ctx.fillRect(-this.radius, -this.radius * 0.7, this.radius * 2, this.radius * 1.4);

      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-this.radius, -this.radius * 0.7, this.radius * 2, this.radius * 1.4);

      // 바퀴 4개
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.arc(-this.radius * 0.7, -this.radius * 0.8, 4, 0, Math.PI * 2);
      ctx.arc(this.radius * 0.7, -this.radius * 0.8, 4, 0, Math.PI * 2);
      ctx.arc(-this.radius * 0.7, this.radius * 0.8, 4, 0, Math.PI * 2);
      ctx.arc(this.radius * 0.7, this.radius * 0.8, 4, 0, Math.PI * 2);
      ctx.fill();

      // 발사대 대(Arm)
      ctx.save();
      ctx.translate(-this.radius * 0.2, 0);
      ctx.fillStyle = "#451a03";
      ctx.fillRect(0, -2, this.radius * 1.3, 4);
      
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1.5;
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.arc(this.radius * 1.3, 0, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#64748b";
      ctx.beginPath();
      ctx.arc(this.radius * 1.3, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else { // archer (궁수)
      ctx.fillStyle = "#15803d";
      ctx.beginPath();
      ctx.arc(-2, 0, this.radius * 0.9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#78350f";
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.75, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = this.teamColor.main;
      ctx.beginPath();
      ctx.arc(1.5, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(6, 0, 7, -Math.PI * 0.35, Math.PI * 0.35);
      ctx.stroke();
    }

    ctx.restore();
    this.drawHealthBar();
  }
}

// --- 건물 (Building) 클래스 ---
class Building extends Entity {
  constructor(x, y, owner, buildingType) {
    const spec = BUILDING_SPECS[buildingType];
    super(x, y, spec.radius, 0, spec.maxHealth, owner.teamColor);
    this.owner = owner;
    this.buildingType = buildingType;
    this.lastShotTime = 0;
    this.spawnTimer = 0; // 유닛 자동 생산용 타이머
    this.level = 1;

    this.updateSpecsByLevel();
  }

  updateSpecsByLevel() {
    const spec = BUILDING_SPECS[this.buildingType];
    const lv = this.level || 1;

    this.maxHealth = Math.round(spec.maxHealth * (lv === 1 ? 1.0 : lv === 2 ? 1.7 : 2.7));

    if (this.buildingType === "archerTower") {
      this.attackRange = lv === 1 ? 220 : lv === 2 ? 280 : 350;
      this.attackCooldown = lv === 1 ? 1000 : lv === 2 ? 800 : 600;
      this.damage = lv === 1 ? 22 : lv === 2 ? 45 : 80;
    } else if (this.buildingType === "mageTower") {
      this.attackRange = lv === 1 ? 180 : lv === 2 ? 240 : 300;
      this.attackCooldown = lv === 1 ? 1800 : lv === 2 ? 1400 : 1000;
      this.damage = lv === 1 ? 40 : lv === 2 ? 85 : 160;
    }
  }

  update() {
    if (this.isDead) return;

    // 1. 금광 자동 채굴
    if (this.buildingType === "mine") {
      if (!this.goldTimer) this.goldTimer = 60;
      this.goldTimer--;
      if (this.goldTimer <= 0) {
        let goldReward = 3;
        if (this.level === 2) goldReward = 8;
        else if (this.level === 3) goldReward = 18;

        this.owner.gold += goldReward;
        this.goldTimer = 60;
        
        if (this.owner === player) {
          floatingTexts.push(new FloatingText(this.x, this.y - this.radius, `+${goldReward}G`, "#fbbf24"));
          for (let i = 0; i < 3; i++) {
            particles.push(new Particle(this.x, this.y, "#fde047", Math.random() * 1.5 + 0.5, Math.random() * Math.PI * 2, 12));
          }
        }
      }
    }

    // 2. 아처 및 메이지 타워 사격
    if (this.buildingType === "archerTower" || this.buildingType === "mageTower") {
      this.shootTargetSearch();
    }

    // 3. 병영, 마구간, 공성소 자동 유닛 생산
    if (this.buildingType === "barracks" || this.buildingType === "stable" || this.buildingType === "siegeWorkshop") {
      this.spawnTimer++;
      
      let spawnInterval = 360; // 병영 6초 (60프레임 = 1초)
      if (this.buildingType === "stable") spawnInterval = 480; // 마구간 8초
      else if (this.buildingType === "siegeWorkshop") spawnInterval = 720; // 공성소 12초
      
      // 레벨에 따른 생산 시간 단축
      if (this.level === 2) {
        spawnInterval = Math.round(spawnInterval * 0.75); // 25% 단축
      } else if (this.level === 3) {
        spawnInterval = Math.round(spawnInterval * 0.5); // 50% 단축
      }
      
      if (this.spawnTimer >= spawnInterval) {
        this.spawnTimer = 0;
        
        // 인구 한도 체크 내에서 생산
        if (this.owner.army.length < this.owner.maxArmyLimit) {
          let spawnType = "soldier";
          if (this.buildingType === "barracks") {
            spawnType = Math.random() > 0.4 ? "soldier" : "archer";
          } else if (this.buildingType === "stable") {
            spawnType = Math.random() > 0.5 ? "cavalry" : "knight";
          } else if (this.buildingType === "siegeWorkshop") {
            spawnType = "catapult";
          }
          
          const offsetDist = this.radius + 15;
          const offsetAngle = Math.random() * Math.PI * 2;
          const sx = this.x + Math.cos(offsetAngle) * offsetDist;
          const sy = this.y + Math.sin(offsetAngle) * offsetDist;
          
          const newUnit = new Unit(sx, sy, this.owner, spawnType);
          this.owner.army.push(newUnit);
          
          for (let i = 0; i < 4; i++) {
            particles.push(new Particle(sx, sy, this.owner.teamColor.main, Math.random() * 2 + 1, Math.random() * Math.PI * 2, 15));
          }
          
          if (this.owner === player) {
            const unitKName = spawnType === "soldier" ? "보병" : spawnType === "archer" ? "궁수" : spawnType === "cavalry" ? "경기병" : spawnType === "knight" ? "기사" : "투석기";
            floatingTexts.push(new FloatingText(this.x, this.y - this.radius - 10, `+ 아군 ${unitKName} 생산!`, this.owner.teamColor.accent, true));
          }
        }
      }
    }
  }

  shootTargetSearch() {
    const now = Date.now();
    if (now - this.lastShotTime < this.attackCooldown) return;

    let nearest = null;
    let minDist = this.attackRange;

    // 사거리 내의 적 병사/군주 탐색
    kings.forEach(k => {
      if (k === this.owner || k.isDead) return;

      const distToKing = Math.hypot(k.x - this.x, k.y - this.y);
      if (distToKing < minDist) {
        nearest = k;
        minDist = distToKing;
      }

      k.army.forEach(u => {
        if (u.isDead) return;
        const distToUnit = Math.hypot(u.x - this.x, u.y - this.y);
        if (distToUnit < minDist) {
          nearest = u;
          minDist = distToUnit;
        }
      });
    });

    if (nearest) {
      this.lastShotTime = now;
      if (this.owner === player) {
        playSound(this.buildingType === "archerTower" ? "arrow" : "magic");
      }
      if (this.buildingType === "archerTower") {
        // 아처 타워 화살 발사
        projectiles.push(new Projectile(this.x, this.y - 10, nearest, this.damage, this, "arrow"));
      } else {
        // 메이지 타워 광역 에너지 볼 발사
        projectiles.push(new Projectile(this.x, this.y - 15, nearest, this.damage, this, "magicball"));
      }
    }
  }

  onDeath(sourceName) {
    super.onDeath(sourceName);
    
    if (this.owner === player) {
      playSound("destroy");
    }

    // 파괴 시 킬러(공격한 군주)에게 건설 골드의 50% 지급
    const returnGold = Math.floor(BUILDING_SPECS[this.buildingType].cost * 0.5);
    kings.forEach(k => {
      if (k.name === sourceName) {
        k.gold += returnGold;
        floatingTexts.push(new FloatingText(this.x, this.y, `+${returnGold}G (파괴)`, "#fbbf24", true));
      }
    });

    for (let i = 0; i < 15; i++) {
      particles.push(new Particle(this.x, this.y, "#475569", Math.random() * 5 + 2, Math.random() * Math.PI * 2, 40));
    }
  }

  draw() {
    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;

    if (screenX < -this.radius * 2 || screenX > camera.width + this.radius * 2 || 
        screenY < -this.radius * 2 || screenY > camera.height + this.radius * 2) return;

    ctx.save();
    
    // 아웃라인 효과
    ctx.shadowColor = this.teamColor.main;
    ctx.shadowBlur = 8;

    const lv = this.level || 1;

    // 레벨 텍스트 표시
    ctx.save();
    ctx.fillStyle = lv === 3 ? "#f59e0b" : lv === 2 ? "#38bdf8" : "#cbd5e1";
    ctx.font = "bold 10px Outfit, Noto Sans KR";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 3;
    ctx.fillText(`Lv.${lv}`, screenX, screenY - this.radius - 12);
    ctx.restore();

    // 건물 선택 표시
    if (typeof selectedBuilding !== 'undefined' && selectedBuilding === this) {
      ctx.save();
      ctx.strokeStyle = this.teamColor.accent;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(screenX, screenY, this.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (this.buildingType === "mine") {
      // --- 1. 금광 그리기 ---
      if (lv === 1) {
        // 나무 기초 프레임
        ctx.fillStyle = "#78350f";
        ctx.fillRect(screenX - this.radius, screenY - this.radius, this.radius * 2, this.radius * 2);
        ctx.fillStyle = "#a16207";
        ctx.fillRect(screenX - this.radius + 4, screenY - this.radius + 4, this.radius * 2 - 8, screenY - this.radius + 4 + this.radius * 2 - 8);

        // 가운데 돌 우물
        ctx.fillStyle = "#64748b";
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#334155";
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // 주변에 널려 있는 금더미
        ctx.fillStyle = "#fbbf24";
        const goldPiles = [{x:-12,y:-12}, {x:12,y:-10}, {x:-8,y:12}];
        goldPiles.forEach(p => {
          ctx.beginPath();
          ctx.arc(screenX + p.x, screenY + p.y, 4.5, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (lv === 2) {
        // 철제 2단계 광산
        ctx.fillStyle = "#334155";
        ctx.fillRect(screenX - this.radius, screenY - this.radius, this.radius * 2, this.radius * 2);
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 3;
        ctx.strokeRect(screenX - this.radius, screenY - this.radius, this.radius * 2, this.radius * 2);

        // 정교한 기계장치 우물
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius * 0.45, 0, Math.PI * 2);
        ctx.stroke();

        // 빛나는 금맥 데코
        ctx.fillStyle = "#fbbf24";
        const goldPiles = [{x:-14,y:-14}, {x:14,y:-12}, {x:-10,y:14}, {x:12,y:12}];
        goldPiles.forEach(p => {
          ctx.beginPath();
          ctx.arc(screenX + p.x, screenY + p.y, 5.5, 0, Math.PI * 2);
          ctx.fill();
        });
      } else {
        // 황금 크리스탈 차원문 (3단계)
        ctx.fillStyle = "#ca8a04";
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#eab308";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius * 0.9, 0, Math.PI * 2);
        ctx.stroke();

        // 중앙 회전 마법진
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(Date.now() * 0.003);
        ctx.fillStyle = "#fef08a";
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          ctx.rotate(Math.PI / 2);
          ctx.fillRect(-4, -this.radius * 0.7, 8, 8);
        }
        ctx.restore();

        // 3단계 황금 코어
        ctx.save();
        ctx.shadowColor = "#fde047";
        ctx.shadowBlur = 15;
        ctx.fillStyle = "#fde047";
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 3단계 입자 방출 (가끔)
        if (Math.random() > 0.92) {
          particles.push(new Particle(this.x + (Math.random() - 0.5) * 15, this.y + (Math.random() - 0.5) * 15, "#fde047", Math.random() * 1.2 + 0.3, Math.random() * Math.PI * 2, 18));
        }
      }

    } else if (this.buildingType === "house") {
      // --- 2. 집 그리기 ---
      if (lv === 1) {
        ctx.fillStyle = "#cbd5e1";
        ctx.fillRect(screenX - this.radius, screenY - this.radius * 0.8, this.radius * 2, this.radius * 1.6);
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.moveTo(screenX, screenY - this.radius * 1.4);
        ctx.lineTo(screenX + this.radius + 3, screenY - this.radius * 0.4);
        ctx.lineTo(screenX - this.radius - 3, screenY - this.radius * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#78350f";
        ctx.fillRect(screenX - 4, screenY + this.radius * 0.3, 8, this.radius * 0.5);
      } else if (lv === 2) {
        // 2단계 대저택
        ctx.fillStyle = "#e2e8f0"; // 돌 벽
        ctx.fillRect(screenX - this.radius, screenY - this.radius * 0.9, this.radius * 2, this.radius * 1.8);
        ctx.fillStyle = "#b91c1c"; // 더 진한 빨강
        // 이중 지붕
        ctx.beginPath();
        ctx.moveTo(screenX, screenY - this.radius * 1.6);
        ctx.lineTo(screenX + this.radius + 4, screenY - this.radius * 0.7);
        ctx.lineTo(screenX - this.radius - 4, screenY - this.radius * 0.7);
        ctx.closePath();
        ctx.fill();

        // 목재 장식 기둥
        ctx.fillStyle = "#78350f";
        ctx.fillRect(screenX - this.radius, screenY - this.radius * 0.7, 3, this.radius * 1.6);
        ctx.fillRect(screenX + this.radius - 3, screenY - this.radius * 0.7, 3, this.radius * 1.6);

        // 창문 (노란빛)
        ctx.fillStyle = "#fef08a";
        ctx.fillRect(screenX - 10, screenY - 5, 5, 5);
        ctx.fillRect(screenX + 5, screenY - 5, 5, 5);
        ctx.fillStyle = "#451a03"; // 어두운 문
        ctx.fillRect(screenX - 5, screenY + this.radius * 0.4, 10, this.radius * 0.5);
      } else {
        // 3단계 왕실 요새 성채 집
        ctx.fillStyle = "#94a3b8"; // 하얀 돌벽
        ctx.beginPath();
        ctx.arc(screenX, screenY + 4, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // 3단계 첨탑 지붕
        ctx.fillStyle = "#fbbf24"; // 황금 첨탑
        ctx.beginPath();
        ctx.moveTo(screenX, screenY - this.radius * 1.7);
        ctx.lineTo(screenX + this.radius - 2, screenY - this.radius * 0.3);
        ctx.lineTo(screenX - this.radius + 2, screenY - this.radius * 0.3);
        ctx.closePath();
        ctx.fill();

        // 첨탑 위 깃발
        ctx.strokeStyle = this.teamColor.main;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY - this.radius * 1.7);
        ctx.lineTo(screenX, screenY - this.radius * 2.1);
        ctx.lineTo(screenX + 8, screenY - this.radius * 1.95);
        ctx.lineTo(screenX, screenY - this.radius * 1.8);
        ctx.stroke();

        // 웅장한 아치형 문
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.arc(screenX, screenY + this.radius * 0.8, 8, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(screenX - 8, screenY + this.radius * 0.8, 16, 8);
      }

    } else if (this.buildingType === "archerTower") {
      // --- 3. 아처 타워 그리기 ---
      if (lv === 1) {
        ctx.fillStyle = "#475569";
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius * 0.85, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#a16207";
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      } else if (lv === 2) {
        // 2단계 강철 타워
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fbbf24"; // 황금 띠
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius * 0.88, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius * 0.68, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // 3단계 수정 요새 타워
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // 빛나는 수정 코어
        ctx.save();
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 10;
        ctx.fillStyle = "#06b6d4";
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 초대형 발리스타 대궁 렌더링
        ctx.save();
        ctx.translate(screenX, screenY);
        let rot = Date.now() * 0.001; 
        if (this.target && !this.target.isDead) {
          rot = Math.atan2(this.target.y - this.y, this.target.x - this.x);
        }
        ctx.rotate(rot);
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(6, 0, 14, -Math.PI * 0.4, Math.PI * 0.4);
        ctx.stroke();
        ctx.fillStyle = "#ca8a04";
        ctx.fillRect(-8, -2.5, 18, 5);
        ctx.restore();
      }

      // 보초 궁수 렌더링
      if (lv < 3) {
        ctx.fillStyle = "#15803d";
        const archerOffsets = [{x: 0, y: -0.55}, {x: 0.55, y: 0}, {x: 0, y: 0.55}, {x: -0.55, y: 0}];
        archerOffsets.forEach(pos => {
          ctx.beginPath();
          ctx.arc(screenX + this.radius * pos.x, screenY + this.radius * pos.y, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = this.teamColor.main;
          ctx.beginPath();
          ctx.arc(screenX + this.radius * pos.x, screenY + this.radius * pos.y, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#15803d";
        });
      }

    } else if (this.buildingType === "mageTower") {
      // --- 4. 메이지 타워 그리기 ---
      if (lv === 1) {
        ctx.fillStyle = "#1e1b4b";
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius * 0.85, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#312e81";
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.15;
        ctx.save();
        ctx.shadowColor = "#a855f7";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "#c084fc";
        ctx.beginPath();
        ctx.arc(screenX, screenY, 9 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (lv === 2) {
        // 2단계 공중부양 마법진 제단
        ctx.fillStyle = "#1e1b4b";
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // 3중 회전 마법 고리
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(Date.now() * 0.0015);
        ctx.strokeStyle = "#c084fc";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.rotate(-Date.now() * 0.003);
        ctx.strokeStyle = "#06b6d4";
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.65, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        const pulse = 1 + Math.sin(Date.now() * 0.012) * 0.2;
        ctx.save();
        ctx.shadowColor = "#a855f7";
        ctx.shadowBlur = 18;
        ctx.fillStyle = "#d8b4fe";
        ctx.beginPath();
        ctx.arc(screenX, screenY, 12 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        // 3단계 대마법사 우주 기단 첨탑
        ctx.fillStyle = "#030712";
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#818cf8";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius * 0.9, 0, Math.PI * 2);
        ctx.stroke();

        // 외부 공전 크리스탈 파편 3개
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(Date.now() * 0.002);
        ctx.fillStyle = "#a855f7";
        for (let i = 0; i < 3; i++) {
          ctx.rotate((Math.PI * 2) / 3);
          ctx.beginPath();
          ctx.moveTo(this.radius * 0.8, -4);
          ctx.lineTo(this.radius * 0.8 + 6, 0);
          ctx.lineTo(this.radius * 0.8, 4);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        // 폭발하는 우주 에너지 성핵
        const pulse = 1 + Math.sin(Date.now() * 0.02) * 0.25;
        ctx.save();
        ctx.shadowColor = "#ec4899";
        ctx.shadowBlur = 25;
        ctx.fillStyle = "#f472b6";
        ctx.beginPath();
        ctx.arc(screenX, screenY, 14 * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(screenX, screenY, 7 * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (Math.random() > 0.9) {
          particles.push(new Particle(this.x, this.y, "#a855f7", Math.random() * 2 + 1, Math.random() * Math.PI * 2, 20));
        }
      }

    } else if (this.buildingType === "barracks") {
      // --- 5. 병영 그리기 ---
      if (lv === 1) {
        ctx.fillStyle = "#854d0e";
        ctx.fillRect(screenX - this.radius, screenY - this.radius * 0.7, this.radius * 2, this.radius * 1.4);
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.moveTo(screenX, screenY - this.radius * 1.3);
        ctx.lineTo(screenX + this.radius + 4, screenY - this.radius * 0.3);
        ctx.lineTo(screenX - this.radius - 4, screenY - this.radius * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#451a03";
        ctx.fillRect(screenX - 5, screenY + this.radius * 0.2, 10, this.radius * 0.5);
        ctx.strokeStyle = this.teamColor.main;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(screenX - 7, screenY - this.radius * 0.6);
        ctx.lineTo(screenX + 7, screenY - this.radius * 0.2);
        ctx.moveTo(screenX + 7, screenY - this.radius * 0.6);
        ctx.lineTo(screenX - 7, screenY - this.radius * 0.2);
        ctx.stroke();
      } else if (lv === 2) {
        // 2단계 벽돌 요새 훈련소
        ctx.fillStyle = "#451a03";
        ctx.fillRect(screenX - this.radius, screenY - this.radius * 0.8, this.radius * 2, this.radius * 1.6);
        ctx.fillStyle = "#334155";
        ctx.fillRect(screenX - this.radius - 2, screenY - this.radius * 1.1, this.radius * 2 + 4, 10);

        // 방패 데코
        ctx.fillStyle = this.teamColor.main;
        ctx.beginPath();
        ctx.arc(screenX - this.radius * 0.5, screenY - this.radius * 0.2, 5, 0, Math.PI * 2);
        ctx.arc(screenX + this.radius * 0.5, screenY - this.radius * 0.2, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#1e293b";
        ctx.fillRect(screenX - 7, screenY + this.radius * 0.3, 14, this.radius * 0.5);
      } else {
        // 3단계 성채 사관학교
        ctx.fillStyle = "#334155";
        ctx.fillRect(screenX - this.radius, screenY - this.radius, this.radius * 2, this.radius * 2);
        
        // 돌 성곽 탑 2개
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(screenX - this.radius - 2, screenY - this.radius * 1.3, 10, this.radius * 0.6);
        ctx.fillRect(screenX + this.radius - 8, screenY - this.radius * 1.3, 10, this.radius * 0.6);

        // 타오르는 전쟁 깃발
        ctx.fillStyle = this.teamColor.main;
        ctx.fillRect(screenX - 3, screenY - this.radius * 0.5, 6, 20);
        ctx.fillStyle = this.teamColor.accent;
        ctx.beginPath();
        ctx.moveTo(screenX + 3, screenY - this.radius * 0.5);
        ctx.lineTo(screenX + 15, screenY - this.radius * 0.3);
        ctx.lineTo(screenX + 3, screenY - this.radius * 0.1);
        ctx.closePath();
        ctx.fill();

        // 강철 성문
        ctx.fillStyle = "#ca8a04";
        ctx.fillRect(screenX - 10, screenY + this.radius * 0.4, 20, this.radius * 0.6);
      }

    } else if (this.buildingType === "stable") {
      // --- 6. 마구간 그리기 ---
      if (lv === 1) {
        ctx.fillStyle = "#78350f";
        ctx.fillRect(screenX - this.radius, screenY - this.radius * 0.9, this.radius * 2, this.radius * 1.6);
        ctx.fillStyle = this.teamColor.main;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY - this.radius * 1.4);
        ctx.lineTo(screenX + this.radius + 2, screenY - this.radius * 0.7);
        ctx.lineTo(screenX - this.radius - 2, screenY - this.radius * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        for (let offset = -this.radius * 0.6; offset <= this.radius * 0.6; offset += 8) {
          ctx.moveTo(screenX + offset, screenY - this.radius * 0.2);
          ctx.lineTo(screenX + offset, screenY + this.radius * 0.6);
        }
        ctx.stroke();
      } else if (lv === 2) {
        // 2단계 철제 마구간
        ctx.fillStyle = "#451a03";
        ctx.fillRect(screenX - this.radius, screenY - this.radius * 0.9, this.radius * 2, this.radius * 1.7);
        ctx.fillStyle = "#475569";
        ctx.fillRect(screenX - this.radius - 3, screenY - this.radius * 1.1, this.radius * 2 + 6, 8);

        // 철창 울타리
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let offset = -this.radius * 0.7; offset <= this.radius * 0.7; offset += 10) {
          ctx.moveTo(screenX + offset, screenY - this.radius * 0.2);
          ctx.lineTo(screenX + offset, screenY + this.radius * 0.7);
        }
        ctx.stroke();
      } else {
        // 3단계 천상 페가수스 사원
        ctx.fillStyle = "#f1f5f9";
        ctx.beginPath();
        ctx.arc(screenX, screenY + 4, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = "#cbd5e1";
        ctx.fillRect(screenX - this.radius * 0.7, screenY - this.radius * 0.8, 5, this.radius * 1.5);
        ctx.fillRect(screenX - this.radius * 0.3, screenY - this.radius * 0.9, 5, this.radius * 1.5);
        ctx.fillRect(screenX + this.radius * 0.2, screenY - this.radius * 0.9, 5, this.radius * 1.5);
        ctx.fillRect(screenX + this.radius * 0.6, screenY - this.radius * 0.8, 5, this.radius * 1.5);

        ctx.fillStyle = this.teamColor.main;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY - this.radius * 1.5);
        ctx.lineTo(screenX + this.radius + 4, screenY - this.radius * 0.8);
        ctx.lineTo(screenX - this.radius - 4, screenY - this.radius * 0.8);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.ellipse(screenX - this.radius * 0.8, screenY - this.radius * 0.3, 8, 4, 0.5, 0, Math.PI * 2);
        ctx.ellipse(screenX + this.radius * 0.8, screenY - this.radius * 0.3, 8, 4, -0.5, 0, Math.PI * 2);
        ctx.fill();
      }

    } else if (this.buildingType === "siegeWorkshop") {
      // --- 7. 공성소 그리기 ---
      if (lv === 1) {
        ctx.fillStyle = "#334155";
        ctx.fillRect(screenX - this.radius, screenY - this.radius, this.radius * 2, this.radius * 2);
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(screenX - this.radius * 0.7, screenY - this.radius * 1.4, 8, this.radius * 0.7);
        ctx.fillRect(screenX + this.radius * 0.3, screenY - this.radius * 1.4, 8, this.radius * 0.7);
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(Date.now() * 0.0015);
        ctx.strokeStyle = "#f1f5f9";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.45, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#cbd5e1";
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          ctx.fillRect(Math.cos(a) * this.radius * 0.4 - 3, Math.sin(a) * this.radius * 0.4 - 3, 6, 6);
        }
        ctx.restore();
      } else if (lv === 2) {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(screenX - this.radius, screenY - this.radius, this.radius * 2, this.radius * 2);
        ctx.strokeStyle = "#64748b";
        ctx.lineWidth = 3;
        ctx.strokeRect(screenX - this.radius, screenY - this.radius, this.radius * 2, this.radius * 2);

        ctx.fillStyle = "#475569";
        ctx.fillRect(screenX - 5, screenY - this.radius * 1.5, 10, this.radius * 0.6);
        if (Math.random() > 0.85) {
          particles.push(new Particle(this.x, this.y - this.radius * 1.5, "#94a3b8", Math.random() * 0.5 + 0.2, -Math.PI / 2 + (Math.random() - 0.5) * 0.3, 25));
        }

        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(Date.now() * 0.002);
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(screenX - this.radius, screenY - this.radius, this.radius * 2, this.radius * 2);
        ctx.strokeStyle = this.teamColor.main;
        ctx.lineWidth = 4;
        ctx.strokeRect(screenX - this.radius, screenY - this.radius, this.radius * 2, this.radius * 2);

        ctx.fillStyle = "#334155";
        ctx.fillRect(screenX - 12, screenY - this.radius * 1.6, 7, this.radius * 0.7);
        ctx.fillRect(screenX + 5, screenY - this.radius * 1.6, 7, this.radius * 0.7);

        if (Math.random() > 0.8) {
          particles.push(new Particle(this.x - 8, this.y - this.radius * 1.6, "#64748b", Math.random() * 0.6 + 0.3, -Math.PI / 2 + (Math.random() - 0.5) * 0.2, 28));
          particles.push(new Particle(this.x + 8, this.y - this.radius * 1.6, "#64748b", Math.random() * 0.6 + 0.3, -Math.PI / 2 + (Math.random() - 0.5) * 0.2, 28));
        }

        ctx.save();
        ctx.translate(screenX, screenY);
        
        ctx.save();
        ctx.translate(-7, 2);
        ctx.rotate(Date.now() * 0.0035);
        ctx.strokeStyle = "#b45309";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.translate(7, -2);
        ctx.rotate(-Date.now() * 0.0035);
        ctx.strokeStyle = "#d97706";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.restore();

        if (Math.random() > 0.94) {
          particles.push(new Particle(this.x + (Math.random() - 0.5) * 20, this.y + (Math.random() - 0.5) * 20, "#fbbf24", Math.random() * 3 + 1, Math.random() * Math.PI * 2, 8));
        }
      }
    }

    ctx.restore();
    
    // 체력 바 표시
    this.drawHealthBar();
  }
}

// --- 투사체 (Projectile) 클래스 ---
class Projectile {
  constructor(startX, startY, target, damage, owner, pType = "arrow") {
    this.x = startX;
    this.y = startY;
    this.target = target;
    this.damage = damage;
    this.owner = owner;
    this.pType = pType; // 'arrow', 'magicball', 'boulder'
    this.speed = pType === "arrow" ? 9 : pType === "magicball" ? 6.5 : 5.8;
    this.isDead = false;
    this.distanceTraveled = 0;
    this.maxDistance = pType === "arrow" ? 350 : pType === "magicball" ? 280 : 420;

    const dx = target.x - startX;
    const dy = target.y - startY;
    this.angle = Math.atan2(dy, dx);
    this.vx = Math.cos(this.angle) * this.speed;
    this.vy = Math.sin(this.angle) * this.speed;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.distanceTraveled += this.speed;

    if (this.distanceTraveled >= this.maxDistance) {
      this.isDead = true;
      return;
    }

    if (this.target && !this.target.isDead) {
      const dx = this.x - this.target.x;
      const dy = this.y - this.target.y;
      const dist = Math.hypot(dx, dy);

      if (dist < this.target.radius + 6) {
        this.hitTarget();
      }
    }
  }
  hitTarget() {
    this.isDead = true;

    const isPlayerRelated = (this.owner.owner && this.owner.owner === player) || 
                            (this.owner && this.owner === player) || 
                            (this.target && (this.target === player || this.target.owner === player));
                            
    if (isPlayerRelated) {
      if (this.pType === "arrow") playSound("hit");
      else playSound("explosion");
    }

    // 화면 흔들림 효과 유발
    if (isPlayerRelated) {
      if (this.pType === "boulder") {
        screenShake.duration = 16;
        screenShake.intensity = 8;
      } else if (this.pType === "magicball") {
        screenShake.duration = 8;
        screenShake.intensity = 3.5;
      }
    }

    const sourceName = this.owner.owner ? this.owner.owner.name : this.owner.name;

    // 멀티플레이어이고 내가 발사한 주체가 아니면, 투사체 타격 시 데미지 연산 및 타격 전파는 스킵 (발사 소유자 클라이언트가 데미지를 직접 보냄)
    if (isMultiplayer && !(this.owner === player || (this.owner.owner && this.owner.owner === player))) {
      // 단, 스플래시 폭발 파티클 이펙트는 원격 화면에서도 렌더링합니다.
      if (this.pType !== "arrow") {
        const particleColor = this.pType === "boulder" ? "#64748b" : "#c084fc";
        const particleCount = this.pType === "boulder" ? 20 : 15;
        for (let i = 0; i < particleCount; i++) {
          particles.push(new Particle(this.x, this.y, particleColor, Math.random() * 4 + 1.5, Math.random() * Math.PI * 2, this.pType === "boulder" ? 35 : 25));
        }
      }
      return; 
    }

    // ---------------- [데미지 적용 및 소켓 통신 전송] ----------------
    if (this.pType === "arrow") {
      this.target.takeDamage(this.damage, sourceName);
      
      // 멀티플레이어인 경우 피해 통신 전파
      if (isMultiplayer) {
        if (this.target.socketId) {
          socket.emit('damagePlayer', { targetSocketId: this.target.socketId, damage: this.damage, sourceName: sourceName });
        } else if (this.target.owner && this.target.owner.socketId) {
          socket.emit('damageUnit', { ownerSocketId: this.target.owner.socketId, unitId: this.target.id, damage: this.damage, sourceName: sourceName });
        } else if (this.target.buildingType) {
          socket.emit('damageBuilding', { id: this.target.id, damage: this.damage, sourceName: sourceName });
        }
      }
    } else {
      const splashRadius = this.pType === "boulder" ? 110 : 75;
      const bldDmgMult = this.pType === "boulder" ? 3.5 : 0.6;
      const particleColor = this.pType === "boulder" ? "#64748b" : "#c084fc";
      const particleCount = this.pType === "boulder" ? 20 : 15;
      
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(this.x, this.y, particleColor, Math.random() * 4 + 1.5, Math.random() * Math.PI * 2, this.pType === "boulder" ? 35 : 25));
      }

      kings.forEach(k => {
        if (k === this.owner.owner || k.isDead) return;
        const d = Math.hypot(k.x - this.x, k.y - this.y);
        if (d < splashRadius) {
          k.takeDamage(this.damage, sourceName);
          
          if (isMultiplayer && k.socketId) {
            socket.emit('damagePlayer', { targetSocketId: k.socketId, damage: this.damage, sourceName: sourceName });
          }
        }

        k.army.forEach(u => {
          if (u.isDead) return;
          const du = Math.hypot(u.x - this.x, u.y - this.y);
          if (du < splashRadius) {
            u.takeDamage(this.damage, sourceName);
            
            if (isMultiplayer && k.socketId) {
              socket.emit('damageUnit', { ownerSocketId: k.socketId, unitId: u.id, damage: this.damage, sourceName: sourceName });
            }
          }
        });
      });

      buildings.forEach(b => {
        if (b.isDead || b.owner === this.owner.owner) return;
        const db = Math.hypot(b.x - this.x, b.y - this.y);
        if (db < splashRadius) {
          const finalDmg = this.damage * bldDmgMult;
          b.takeDamage(finalDmg, sourceName);
          
          if (isMultiplayer) {
            socket.emit('damageBuilding', { id: b.id, damage: finalDmg, sourceName: sourceName });
          }
        }
      });
    }
  }
  draw() {
    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;

    if (screenX < -15 || screenX > camera.width + 15 || screenY < -15 || screenY > camera.height + 15) return;

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(this.angle);

    if (this.pType === "arrow") {
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(6, 0);
      ctx.stroke();

      ctx.fillStyle = this.owner.teamColor.main;
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(-11, -2);
      ctx.lineTo(-9, 0);
      ctx.lineTo(-11, 2);
      ctx.closePath();
      ctx.fill();
    } else if (this.pType === "boulder") {
      ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
      ctx.shadowBlur = 6;
      ctx.fillStyle = "#64748b";
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#475569";
      ctx.beginPath();
      ctx.arc(-2, -2, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.shadowColor = "#a855f7";
      ctx.shadowBlur = 8;
      ctx.fillStyle = "#c084fc";
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

// --- 건설 로직 기능 구현 ---

window.startBuilding = function(type) {
  if (currentGameState !== GAME_STATE.PLAYING) return;
  const spec = BUILDING_SPECS[type];
  
  if (player.gold < spec.cost) {
    floatingTexts.push(new FloatingText(player.x, player.y - 45, "골드가 부족하여 건설할 수 없습니다!", "#ef4444"));
    return;
  }

  buildMode.active = true;
  buildMode.type = type;
  buildMode.cost = spec.cost;
  buildMode.radius = spec.radius;
  
  floatingTexts.push(new FloatingText(player.x, player.y - 40, `[건설] 배치할 마우스 위치를 클릭하세요`, "#3b82f6"));
};

function cancelBuildingMode() {
  if (buildMode.active) {
    buildMode.active = false;
    buildMode.type = null;
    floatingTexts.push(new FloatingText(player.x, player.y - 40, "건설이 취소되었습니다.", "#94a3b8"));
  }
}

function executeBuildingPlacement(owner, worldX, worldY, botType = null) {
  const type = botType || buildMode.type;
  const cost = BUILDING_SPECS[type].cost;
  const radius = BUILDING_SPECS[type].radius;

  if (owner.gold < cost) return;

  // 건설 범위 및 장애물 겹침 물리 체크
  let isBlocked = false;

  // 1. 맵 경계 체크
  if (worldX < radius + 15 || worldX > WORLD_SIZE - radius - 15 ||
      worldY < radius + 15 || worldY > WORLD_SIZE - radius - 15) {
    isBlocked = true;
  }

  // 2. 바위/덤불 충돌
  obstacles.forEach(obs => {
    const dist = Math.hypot(obs.x - worldX, obs.y - worldY);
    if (dist < radius + obs.radius + 8) {
      isBlocked = true;
    }
  });

  // 3. 다른 기 존재 건물들과 충돌
  buildings.forEach(b => {
    if (b.isDead) return;
    const dist = Math.hypot(b.x - worldX, b.y - worldY);
    if (dist < radius + b.radius + 15) {
      isBlocked = true;
    }
  });

  // 4. 모든 군주들(King) 본체와 충돌 방지
  kings.forEach(k => {
    if (k.isDead) return;
    const dist = Math.hypot(k.x - worldX, k.y - worldY);
    if (dist < radius + k.radius + 10) {
      isBlocked = true;
    }
  });

  if (isBlocked) {
    if (!owner.isBot) {
      floatingTexts.push(new FloatingText(worldX, worldY, "장애물이 있어 건설할 수 없습니다!", "#ef4444", true));
    }
    return;
  }

  // 최종 건설 완료
  owner.gold -= cost;
  const newBld = new Building(worldX, worldY, owner, type);
  
  // 고유 건물 ID 부여
  const bldId = owner.socketId ? (owner.socketId + "_bld_" + Date.now() + "_" + Math.floor(Math.random() * 10000)) : ("local_bld_" + Date.now() + "_" + Math.floor(Math.random() * 10000));
  newBld.id = bldId;
  
  buildings.push(newBld);

  if (owner === player) {
    playSound("build");
    
    // 멀티플레이어인 경우 서버 건설 전파
    if (isMultiplayer) {
      socket.emit('placeBuilding', {
        id: bldId,
        buildingType: type,
        x: worldX,
        y: worldY,
        health: newBld.health,
        maxHealth: newBld.maxHealth
      });
    }
  }

  // 소환 파티클
  for (let i = 0; i < 10; i++) {
    particles.push(new Particle(worldX, worldY, owner.teamColor.main, Math.random() * 3 + 1, Math.random() * Math.PI * 2, 25));
  }

  floatingTexts.push(new FloatingText(worldX, worldY, `+ ${BUILDING_SPECS[type].name} 완성!`, owner.teamColor.accent, true));

  if (!owner.isBot) {
    buildMode.active = false;
    buildMode.type = null;
  }
}

// --- 게임 생명 주기 및 루프 제어 ---

function initGame(isMulti = false, mapData = null, roomPlayers = null) {
  // 닉네임 설정 오버레이 및 대기방을 즉시 숨깁니다.
  document.getElementById("lobbyStartCard").classList.add("hidden");
  document.getElementById("lobbyWaitingRoom").classList.add("hidden");

  const customName = document.getElementById("nameInput").value.trim() || "Chisok";
  
  isMultiplayer = isMulti;

  // 엔티티 클리어
  kings = [];
  coins = [];
  obstacles = [];
  buildings = [];
  projectiles = [];
  particles = [];
  floatingTexts = [];
  items = []; // 아이템 배열 초기화
  otherPlayers = {}; // 원격 플레이어 맵 초기화
  cancelBuildingMode();

  if (!isMultiplayer) {
    // ---------------- [싱글플레이어 오프라인 모드] ----------------
    // 플레이어 군주 생성 (블루 팀)
    player = new King(WORLD_SIZE / 2, WORLD_SIZE / 2, customName, TEAM_COLORS[0], false);
    player.speedBuffTimer = 0;
    player.magnetTimer = 0;
    kings.push(player);

    player.gold = 150;
    // 초기 보병 3마리 지급
    for (let i = 0; i < 3; i++) {
      player.army.push(new Unit(player.x + (Math.random() - 0.5) * 40, player.y + (Math.random() - 0.5) * 40, player, "soldier"));
    }

    // AI 봇 생성
    for (let i = 0; i < BOT_COUNT; i++) {
      const rx = Math.random() * (WORLD_SIZE - 200) + 100;
      const ry = Math.random() * (WORLD_SIZE - 200) + 100;
      const bot = new King(rx, ry, BOT_NAMES[i], TEAM_COLORS[i + 1], true);
      
      bot.gold = 100;
      const startSize = Math.floor(Math.random() * 3) + 2;
      for (let u = 0; u < startSize; u++) {
        bot.army.push(new Unit(rx + (Math.random() - 0.5) * 40, ry + (Math.random() - 0.5) * 40, bot, Math.random() > 0.4 ? "soldier" : "archer"));
      }
      kings.push(bot);
    }

    // 자원 및 장애물 생성
    for (let i = 0; i < MAX_COINS; i++) coins.push(new Coin());
    for (let i = 0; i < MAX_OBSTACLES; i++) obstacles.push(new Obstacle());

    // 버프 아이템 35개 스폰
    const MAX_ITEMS = 35;
    for (let i = 0; i < MAX_ITEMS; i++) {
      items.push(new Item());
    }
  } else {
    // ---------------- [온라인 멀티플레이어 모드] ----------------
    // 1. 소켓 세션에서 내 정보 추출
    const myData = roomPlayers[socket.id];
    player = new King(myData.x, myData.y, myData.nickname, createTeamColor(myData.color), false);
    player.socketId = socket.id;
    player.speedBuffTimer = 0;
    player.magnetTimer = 0;
    player.gold = myData.gold;
    kings.push(player);

    // 초기 병력 3마리 지급
    for (let i = 0; i < 3; i++) {
      player.army.push(new Unit(player.x + (Math.random() - 0.5) * 40, player.y + (Math.random() - 0.5) * 40, player, "soldier"));
    }

    // 2. 다른 원격 플레이어들 생성 연동
    Object.keys(roomPlayers).forEach(sid => {
      if (sid === socket.id) return;
      const pData = roomPlayers[sid];
      
      // 원격 플레이어는 봇 플래그(isBot)는 false이지만, 입력 제어를 받지 않고 소켓으로만 움직임.
      // 서버에서 전달된 플레이어 고유 색상을 팀 색상으로 사용
      const remoteKing = new King(pData.x, pData.y, pData.nickname, createTeamColor(pData.color), false);
      remoteKing.socketId = sid;
      remoteKing.isRemotePlayer = true; // 원격 플레이어 식별 플래그
      remoteKing.gold = pData.gold;
      remoteKing.health = pData.health;
      remoteKing.maxHealth = pData.maxHealth;
      
      kings.push(remoteKing);
      otherPlayers[sid] = remoteKing;
    });

    // 3. 서버에서 제공한 단일화된 공유 맵 자원 동기화
    // 코인 세팅
    mapData.coins.forEach(cData => {
      const c = new Coin();
      c.x = cData.x;
      c.y = cData.y;
      c.value = cData.value;
      coins.push(c);
    });

    // 아이템 세팅
    mapData.items.forEach(iData => {
      const it = new Item();
      it.x = iData.x;
      it.y = iData.y;
      it.itemType = iData.itemType;
      it.icon = iData.icon;
      it.color = iData.color;
      items.push(it);
    });

    // 장애물은 시드(Seed) 고정을 위해 동일한 좌표로 90개 배치
    let seed = 42; // 임의의 시드 고정
    function seededRandom() {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    }
    for (let i = 0; i < MAX_OBSTACLES; i++) {
      const obs = new Obstacle();
      obs.x = seededRandom() * (WORLD_SIZE - 150) + 75;
      obs.y = seededRandom() * (WORLD_SIZE - 150) + 75;
      obs.obstacleType = seededRandom() > 0.5 ? "rock" : "bush";
      obs.radius = obs.obstacleType === "rock" ? seededRandom() * 15 + 20 : seededRandom() * 10 + 25;
      obstacles.push(obs);
    }
  }

  camera.x = player.x - camera.width / 2;
  camera.y = player.y - camera.height / 2;
  camera.zoom = 1; // 카메라 줌 초기화

  currentGameState = GAME_STATE.PLAYING;
  document.getElementById("gameOverScreen").classList.add("hidden");
  document.getElementById("gameHUD").classList.remove("hidden");
  document.getElementById("gameHUD").classList.remove("lobby-bg");
  document.querySelector(".shop-bar").classList.remove("shop-disabled");
}

// 유닛 스폰 동작
window.spawnUnit = function(type) {
  if (currentGameState !== GAME_STATE.PLAYING) return;
  
  // 인구 제한 체크
  if (player.army.length >= player.maxArmyLimit) {
    floatingTexts.push(new FloatingText(player.x, player.y - 45, "인구수 제한 도달! 집을 지으세요!", "#ef4444", true));
    return;
  }

  const cost = type === "soldier" ? 20 : 35;
  if (player.gold >= cost) {
    player.gold -= cost;
    const newUnit = new Unit(player.x + (Math.random() - 0.5) * 50, player.y + (Math.random() - 0.5) * 50, player, type);
    player.army.push(newUnit);
    
    for (let i = 0; i < 4; i++) {
      particles.push(new Particle(newUnit.x, newUnit.y, player.teamColor.main, Math.random() * 2 + 1, Math.random() * Math.PI * 2, 15));
    }
  } else {
    floatingTexts.push(new FloatingText(player.x, player.y - 40, "골드가 부족합니다!", "#ef4444"));
  }
};

// 메인 업데이트
function update() {
  if (currentGameState === GAME_STATE.LOBBY) {
    updateHUD();
    return;
  }
  if (currentGameState !== GAME_STATE.PLAYING) return;
  if (isPaused && !isMultiplayer) return;

  kings.forEach(king => {
    if (!king.isDead) king.update();
  });

  // 유닛 업데이트
  kings.forEach(king => {
    if (king.isDead) return;
    king.army.forEach(unit => unit.update());
    king.army = king.army.filter(u => !u.isDead);
  });

  // 건물 업데이트
  buildings.forEach(b => {
    if (!b.isDead) b.update();
  });
  buildings = buildings.filter(b => !b.isDead);

  // 투사체 업데이트
  projectiles.forEach(proj => proj.update());
  projectiles = projectiles.filter(p => !p.isDead);

  coins.forEach(coin => coin.update());

  // 아이템 업데이트 및 획득/버프 충돌 감지
  items.forEach((item, idx) => {
    item.update();
    
    // 각 군주와 아이템 충돌 체크
    kings.forEach(k => {
      if (k.isDead || k.isRemotePlayer) return;
      const dx = k.x - item.x;
      const dy = k.y - item.y;
      const dist = Math.hypot(dx, dy);
      if (dist < k.radius + item.radius) {
        if (isMultiplayer) {
          // 멀티플레이 모드: 서버에 획득 요청 (선착순 판정)
          if (k === player) {
            socket.emit('collectItem', { itemIndex: idx });
          }
        } else {
          // 싱글플레이 모드: 즉시 획득
          if (item.itemType === 'heal') {
            k.health = Math.min(k.maxHealth, k.health + 100);
            if (k === player) {
              playSound('heal');
              floatingTexts.push(new FloatingText(item.x, item.y, "+100 체력 회복!", "#22c55e", true));
            }
          } else if (item.itemType === 'speed') {
            k.speedBuffTimer = 600; // 10초
            if (k === player) {
              playSound('speed');
              floatingTexts.push(new FloatingText(item.x, item.y, "속도 강화 버프! (10초)", "#06b6d4", true));
            }
          } else if (item.itemType === 'magnet') {
            k.magnetTimer = 900; // 15초
            if (k === player) {
              playSound('magnet');
              floatingTexts.push(new FloatingText(item.x, item.y, "골드 자석 버프! (15초)", "#a855f7", true));
            }
          }
          
          for (let i = 0; i < 6; i++) {
            particles.push(new Particle(item.x, item.y, item.color, Math.random() * 3 + 1, Math.random() * Math.PI * 2, 20));
          }
          item.respawn();
        }
      }
    });
  });

  // 다이내믹 카메라 줌 연산 (부대 규모 비례)
  if (player && !player.isDead) {
    const baseZoom = isMobilePhone() ? 0.55 : 1.0;
    const minZoom = isMobilePhone() ? 0.45 : 0.78;
    const targetZoom = Math.max(minZoom, baseZoom - (player.army.length / 50) * (baseZoom - minZoom));
    camera.zoom += (targetZoom - camera.zoom) * 0.05;
  }

  // 화면 진동 지속 시간 차감
  if (screenShake.duration > 0) {
    screenShake.duration--;
  }

  particles.forEach(p => p.update());
  particles = particles.filter(p => p.life > 0);

  floatingTexts.forEach(t => t.update());
  floatingTexts = floatingTexts.filter(t => t.life > 0);

  // 카메라 플레이어 추적
  if (player && !player.isDead) {
    const targetCamX = player.x - camera.width / 2;
    const targetCamY = player.y - camera.height / 2;
    camera.x += (targetCamX - camera.x) * 0.1;
    camera.y += (targetCamY - camera.y) * 0.1;

    camera.x = Math.max(0, Math.min(WORLD_SIZE - camera.width, camera.x));
    camera.y = Math.max(0, Math.min(WORLD_SIZE - camera.height, camera.y));
  }

  // 봇 리스폰 (싱글플레이어 모드일 때만 실행)
  if (!isMultiplayer) {
    kings.forEach(k => {
      if (k.isDead && k.isBot) {
        if (!k.respawnTimer) k.respawnTimer = 250;
        k.respawnTimer--;
        if (k.respawnTimer <= 0) {
          k.isDead = false;
          k.health = k.maxHealth;
          k.x = Math.random() * (WORLD_SIZE - 200) + 100;
          k.y = Math.random() * (WORLD_SIZE - 200) + 100;
          k.gold = 100;
          k.respawnTimer = null;
          for (let u = 0; u < 3; u++) {
            k.army.push(new Unit(k.x, k.y, k, Math.random() > 0.4 ? "soldier" : "archer"));
          }
        }
      }
    });
  }

  // ---------------- [멀티플레이어 상태 전송 틱] ----------------
  if (isMultiplayer && player && socket && socket.connected) {
    if (!window.lastUpdateTick) window.lastUpdateTick = 0;
    window.lastUpdateTick++;
    
    // 매 2프레임마다 = 대략 30Hz 주기로 전송
    if (window.lastUpdateTick % 2 === 0) {
      const armyData = player.army.map(u => ({
        id: u.id,
        unitType: u.unitType,
        x: u.x,
        y: u.y,
        angle: u.angle,
        health: u.health,
        maxHealth: u.maxHealth
      }));
      
      socket.emit('updatePlayer', {
        x: player.x,
        y: player.y,
        angle: player.angle,
        gold: player.gold,
        health: player.health,
        isDead: player.isDead,
        army: armyData
      });
    }
  }

  updateHUD();
}

// HUD 데이터 및 리더보드 갱신
function updateHUD() {
  if (!player) return;
  document.getElementById("goldCount").innerText = player.gold;
  document.getElementById("playerHealth").style.width = `${(player.health / player.maxHealth) * 100}%`;
  document.getElementById("armyCount").innerText = `${player.army.length} / ${player.maxArmyLimit}`;

  // 점수 계산 (병력수*10 + 건물개수*30 + 골드/10)
  const rankingList = kings.map(k => {
    let bldCount = 0;
    buildings.forEach(b => { if (!b.isDead && b.owner === k) bldCount++; });
    const score = k.isDead ? 0 : k.army.length * 10 + bldCount * 30 + Math.floor(k.gold / 10);
    return { name: k.name, score: score, isPlayer: k === player, isDead: k.isDead };
  });

  rankingList.sort((a, b) => b.score - a.score);

  const leaderboardHtml = rankingList
    .slice(0, 5)
    .map((rank, index) => {
      const isPlayerClass = rank.isPlayer ? 'class="player-row"' : '';
      const nameTag = rank.isDead ? `[전사] ${rank.name}` : rank.name;
      return `<li ${isPlayerClass}>
        <span>${index + 1}. ${nameTag}</span>
        <span class="score">${rank.score}</span>
      </li>`;
    })
    .join("");

  document.getElementById("leaderboardList").innerHTML = leaderboardHtml;
}

// 메인 드로잉
function draw() {
  ctx.fillStyle = varColor("--bg-dark");
  ctx.fillRect(0, 0, camera.width, camera.height);

  ctx.save();

  // 화면 진동 적용
  if (screenShake.duration > 0) {
    const dx = (Math.random() - 0.5) * screenShake.intensity;
    const dy = (Math.random() - 0.5) * screenShake.intensity;
    ctx.translate(dx, dy);
  }

  // 카메라 줌 렌더링 적용 (화면 중심 기준)
  ctx.translate(camera.width / 2, camera.height / 2);
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.width / 2, -camera.height / 2);

  // 바둑판형 풀밭 그리기 (스케일 다운 대응하여 격자 간격 조정 160 -> 100)
  const tileSize = 100;
  const startX = Math.floor(camera.x / tileSize) * tileSize;
  const startY = Math.floor(camera.y / tileSize) * tileSize;

  for (let x = startX; x < camera.x + camera.width + tileSize; x += tileSize) {
    for (let y = startY; y < camera.y + camera.height + tileSize; y += tileSize) {
      if (x >= WORLD_SIZE || y >= WORLD_SIZE || x < 0 || y < 0) continue;
      
      const gridX = Math.floor(x / tileSize);
      const gridY = Math.floor(y / tileSize);
      
      ctx.fillStyle = (gridX + gridY) % 2 === 0 ? "#7ec850" : "#8cd75d";
      ctx.fillRect(x - camera.x, y - camera.y, tileSize, tileSize);
    }
  }

  // 맵 경계 외곽선
  ctx.strokeStyle = "rgba(185, 28, 28, 0.4)";
  ctx.lineWidth = 10;
  ctx.strokeRect(-camera.x, -camera.y, WORLD_SIZE, WORLD_SIZE);

  // 1. 장애물
  obstacles.forEach(obs => obs.draw());

  // 2. 동전
  coins.forEach(coin => coin.draw());

  // 2.5. 버프 아이템
  items.forEach(item => item.draw());

  // 3. 건물
  buildings.forEach(b => b.draw());

  // 4. 모든 유닛
  kings.forEach(king => {
    if (king.isDead) return;
    king.army.forEach(unit => unit.draw());
  });

  // 5. 군주
  kings.forEach(king => {
    if (!king.isDead) king.draw();
  });

  // 6. 화살 및 마법 에너지볼
  projectiles.forEach(proj => proj.draw());

  // 7. 이펙트 파티클
  particles.forEach(p => p.draw());

  // 8. 팝업 플로팅 텍스트
  floatingTexts.forEach(t => t.draw());

  // 9. 건설 모드 미리보기 가이드 (Ghost Outline)
  if (buildMode.active) {
    const spec = BUILDING_SPECS[buildMode.type];
    
    // 마우스의 월드 좌표 연산
    const wx = (mouseX - camera.width / 2) / camera.zoom + camera.x + camera.width / 2;
    const wy = (mouseY - camera.height / 2) / camera.zoom + camera.y + camera.height / 2;

    // 건설 적합 여부 판단 (충돌 검사)
    let isBlocked = false;
    if (wx < spec.radius + 15 || wx > WORLD_SIZE - spec.radius - 15 ||
        wy < spec.radius + 15 || wy > WORLD_SIZE - spec.radius - 15) {
      isBlocked = true;
    }
    obstacles.forEach(obs => {
      if (Math.hypot(obs.x - wx, obs.y - wy) < spec.radius + obs.radius + 8) isBlocked = true;
    });
    buildings.forEach(b => {
      if (!b.isDead && Math.hypot(b.x - wx, b.y - wy) < spec.radius + b.radius + 15) isBlocked = true;
    });
    kings.forEach(k => {
      if (!k.isDead && Math.hypot(k.x - wx, k.y - wy) < spec.radius + k.radius + 10) isBlocked = true;
    });

    // 캔버스 가이드 렌더링
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = isBlocked ? "rgba(239, 68, 72, 0.4)" : "rgba(34, 197, 94, 0.4)";
    ctx.strokeStyle = isBlocked ? "#ef4444" : "#22c55e";
    ctx.lineWidth = 3;

    // 가이드 원
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, spec.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 건설 가능 범위 가이드라인 (군주 근처 건설 여부, legion.io는 전역 건설 가능하지만 비주얼 보강)
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.beginPath();
    ctx.moveTo(player.x - camera.x, player.y - camera.y);
    ctx.lineTo(mouseX, mouseY);
    ctx.stroke();
    
    ctx.restore();
  }

  ctx.restore();

  // 실시간 전술 미니맵 렌더링
  drawMiniMap();
}

function drawMiniMap() {
  if (!miniMapCtx || !player) return;
  
  // 미니맵 클리어
  miniMapCtx.fillStyle = "rgba(15, 23, 42, 0.85)";
  miniMapCtx.fillRect(0, 0, miniMapCanvas.width, miniMapCanvas.height);
  
  // 테두리 선
  miniMapCtx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  miniMapCtx.lineWidth = 1;
  miniMapCtx.strokeRect(0, 0, miniMapCanvas.width, miniMapCanvas.height);
  
  const scale = miniMapCanvas.width / WORLD_SIZE; // 130 / 6000
  
  // 1. 건물들 그리기
  buildings.forEach(b => {
    if (b.isDead) return;
    miniMapCtx.fillStyle = b.owner === player ? "#3b82f6" : "#ef4444";
    const bx = b.x * scale;
    const by = b.y * scale;
    const bSize = 3;
    miniMapCtx.fillRect(bx - bSize/2, by - bSize/2, bSize, bSize);
  });
  
  // 2. 유닛들 그리기
  kings.forEach(k => {
    if (k.isDead) return;
    
    const isPlayer = (k === player);
    miniMapCtx.fillStyle = isPlayer ? "rgba(96, 165, 250, 0.7)" : "rgba(248, 113, 113, 0.7)";
    
    k.army.forEach(u => {
      if (u.isDead) return;
      const ux = u.x * scale;
      const uy = u.y * scale;
      miniMapCtx.beginPath();
      miniMapCtx.arc(ux, uy, 1, 0, Math.PI * 2);
      miniMapCtx.fill();
    });
    
    // 군주 그리기
    miniMapCtx.fillStyle = isPlayer ? "#3b82f6" : "#ef4444";
    const kx = k.x * scale;
    const ky = k.y * scale;
    
    miniMapCtx.beginPath();
    miniMapCtx.arc(kx, ky, isPlayer ? 3.5 : 2.5, 0, Math.PI * 2);
    miniMapCtx.fill();
    
    // 플레이어는 추가 외곽선으로 표시
    if (isPlayer) {
      miniMapCtx.strokeStyle = "#ffffff";
      miniMapCtx.lineWidth = 1;
      miniMapCtx.beginPath();
      miniMapCtx.arc(kx, ky, 5, 0, Math.PI * 2);
      miniMapCtx.stroke();
    }
  });
}

function varColor(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function triggerFullscreenAndLandscape() {
  const elem = document.documentElement;
  const requestFS = elem.requestFullscreen || 
                    elem.webkitRequestFullscreen || 
                    elem.mozRequestFullScreen || 
                    elem.msRequestFullscreen;

  if (requestFS) {
    requestFS.call(elem).then(() => {
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock("landscape").catch(err => {
          console.warn("화면 가로 고정이 제한되었습니다:", err);
        });
      }
    }).catch(err => {
      console.warn("전체 화면 진입이 차단되었습니다:", err);
    });
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// 대시보드 로비 진입 버튼 리스너
document.getElementById("enterLobbyBtn").addEventListener("click", () => {
  initAudio();
  triggerFullscreenAndLandscape();
  document.getElementById("landingScreen").classList.add("hidden");
  document.getElementById("gameHUD").classList.remove("hidden");
  document.getElementById("gameHUD").classList.add("lobby-bg");
  document.getElementById("lobbyStartCard").classList.remove("hidden");
  document.querySelector(".shop-bar").classList.add("shop-disabled");
  currentGameState = GAME_STATE.LOBBY;
});

// [가이드 팝업] 열기 / 닫기 로직
(function setupGuideModal() {
  const modal    = document.getElementById('guideModal');
  const openBtn  = document.getElementById('openGuideBtn');
  const closeBtn = document.getElementById('closeGuideBtn');
  const closeBtmBtn = document.getElementById('closeGuideBottomBtn');
  const tabs     = document.querySelectorAll('.guide-tab');
  const contents = document.querySelectorAll('.guide-tab-content');

  function openModal() {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // 버튼 이벤트
  if (openBtn)     openBtn.addEventListener('click', openModal);
  if (closeBtn)    closeBtn.addEventListener('click', closeModal);
  if (closeBtmBtn) closeBtmBtn.addEventListener('click', closeModal);

  // 오버레이 클릭(모달 바깥) → 닫기
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // ESC 키 → 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // 탭 전환 로직
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const targetContent = document.getElementById('tab-' + target);
      if (targetContent) targetContent.classList.add('active');
    });
  });
})();

// 1. 오프라인 싱글플레이 버튼 리스너
document.getElementById("startSingleBtn").addEventListener("click", () => {
  initGame(false);
});


// 2. 멀티플레이 방 개설 (Host) 버튼 리스너
document.getElementById("createRoomBtn").addEventListener("click", async () => {
  const nickname = document.getElementById("nameInput").value.trim() || "Chisok";
  const connected = await initSocket();
  if (!connected || !socket) return;
  socket.emit('createRoom', { nickname: nickname });
});

// 3. 멀티플레이 방 참가 (Guest) 버튼 리스너
document.getElementById("joinRoomBtn").addEventListener("click", async () => {
  const nickname = document.getElementById("nameInput").value.trim() || "Guest";
  const rCode = document.getElementById("roomCodeInput").value.trim();
  if (!rCode) {
    alert("방 코드를 입력해주세요!");
    return;
  }
  const connected = await initSocket();
  if (!connected || !socket) return;
  socket.emit('joinRoom', { nickname: nickname, roomCode: rCode });
});

// 4. 대기실 게임 시작 버튼 리스너 (Host 전용)
document.getElementById("startMultiGameBtn").addEventListener("click", () => {
  if (socket) {
    socket.emit('startGame');
  }
});

// 5. 방 나가기 버튼 리스너
document.getElementById("leaveRoomBtn").addEventListener("click", () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  document.getElementById("lobbyWaitingRoom").classList.add("hidden");
  document.getElementById("lobbyStartCard").classList.remove("hidden");
});

// 다시 시작 버튼 리스너 (사망 시 대시보드 로비로 전환)
document.getElementById("restartBtn").addEventListener("click", () => {
  initAudio();
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  document.getElementById("gameOverScreen").classList.add("hidden");
  document.getElementById("lobbyWaitingRoom").classList.add("hidden");
  document.getElementById("gameHUD").classList.remove("hidden");
  document.getElementById("gameHUD").classList.add("lobby-bg");
  document.getElementById("lobbyStartCard").classList.remove("hidden");
  document.querySelector(".shop-bar").classList.add("shop-disabled");
  currentGameState = GAME_STATE.LOBBY;
});

// Socket.IO 클라이언트를 필요할 때만 로드합니다.
// Vercel 정적 배포에서는 Node/Socket.IO 서버가 없으므로 싱글플레이 화면 로딩을 방해하지 않게 합니다.
function loadSocketIoClient() {
  if (typeof io === 'function') return Promise.resolve(true);
  if (window.__socketIoClientLoading) return window.__socketIoClientLoading;

  window.__socketIoClientLoading = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = '/socket.io/socket.io.js';
    script.async = true;
    script.onload = () => resolve(typeof io === 'function');
    script.onerror = () => {
      console.warn('Socket.IO client is not available in this deployment. Multiplayer is disabled.');
      resolve(false);
    };
    document.head.appendChild(script);
  });

  return window.__socketIoClientLoading;
}

// 소켓 연동 초기화
async function initSocket() {
  if (socket && socket.connected) return true;

  const socketIoAvailable = await loadSocketIoClient();
  if (!socketIoAvailable) {
    alert('현재 Vercel 정적 배포에서는 멀티플레이 서버가 연결되지 않았습니다. 오프라인 싱글플레이를 이용해주세요.');
    return false;
  }
  
  socket = io();

  // A. 방 개설 성공 수신
  socket.on('roomCreated', (data) => {
    roomCode = data.roomCode;
    
    document.getElementById("lobbyStartCard").classList.add("hidden");
    document.getElementById("lobbyWaitingRoom").classList.remove("hidden");
    document.getElementById("displayRoomCode").innerText = roomCode;
    document.getElementById("startMultiGameBtn").classList.remove("hidden"); // 방장은 시작 버튼 활성화
    document.getElementById("waitingMessage").classList.add("hidden");
    
    updateWaitingRoomList(data.players);
  });

  // B. 방 참가 성공 수신
  socket.on('roomJoined', (data) => {
    roomCode = data.roomCode;

    document.getElementById("lobbyStartCard").classList.add("hidden");
    document.getElementById("lobbyWaitingRoom").classList.remove("hidden");
    document.getElementById("displayRoomCode").innerText = roomCode;
    document.getElementById("startMultiGameBtn").classList.add("hidden"); // 게스트는 대기
    document.getElementById("waitingMessage").classList.remove("hidden");

    updateWaitingRoomList(data.players);
  });

  // C. 방 참가 오류 수신
  socket.on('joinError', (data) => {
    alert(data.message);
  });

  // D. 대기방 인원 변동 수신
  socket.on('playerListUpdate', (data) => {
    updateWaitingRoomList(data.players);
  });

  // E. 게임 시작 신호 수신
  socket.on('gameStarted', (data) => {
    // 모든 플레이어 정보를 들고 인게임 시작
    initGame(true, data.mapData, data.players);
  });

  // F. 원격 플레이어 정보 업데이트 수신
  socket.on('playerUpdated', (data) => {
    if (currentGameState !== GAME_STATE.PLAYING) return;
    const sid = data.socketId;
    const pData = data.playerData;

    // 만약 없는 플레이어라면 런타임에 동적으로 추가
    if (!otherPlayers[sid]) {
      let teamColorIndex = kings.length;
      const color = TEAM_COLORS[teamColorIndex % TEAM_COLORS.length];
      const remoteKing = new King(pData.x, pData.y, pData.nickname, color, false);
      remoteKing.socketId = sid;
      remoteKing.isRemotePlayer = true;
      kings.push(remoteKing);
      otherPlayers[sid] = remoteKing;
    }

    const rPlayer = otherPlayers[sid];
    
    // 타인 좌표 보간(Lerp) 적용을 위해 타겟 값을 저장
    rPlayer.targetX = pData.x;
    rPlayer.targetY = pData.y;
    rPlayer.angle = pData.angle;
    rPlayer.gold = pData.gold;
    rPlayer.health = pData.health;
    rPlayer.isDead = pData.isDead;

    // 원격 플레이어의 아군 병력 동기화
    rPlayer.army = [];
    (pData.army || []).forEach(uData => {
      const u = new Unit(uData.x, uData.y, rPlayer, uData.unitType);
      u.id = uData.id;
      u.health = uData.health;
      u.maxHealth = uData.maxHealth;
      u.angle = uData.angle;
      rPlayer.army.push(u);
    });
  });

  // G. 원격 플레이어 이탈 처리 수신
  socket.on('playerDisconnected', (data) => {
    if (currentGameState === GAME_STATE.PLAYING) {
      floatingTexts.push(new FloatingText(player.x, player.y - 60, `${data.nickname}님이 접속을 종료했습니다.`, "#94a3b8", true));
      
      const sid = data.socketId;
      if (otherPlayers[sid]) {
        otherPlayers[sid].isDead = true;
        otherPlayers[sid].army = [];
        kings = kings.filter(k => k.socketId !== sid);
        delete otherPlayers[sid];
      }
      // 해당 플레이어가 지은 건물 철거
      buildings = buildings.filter(b => b.ownerId !== sid);
    }
  });

  // H. 원격 플레이어가 건설한 건물 동기화
  socket.on('buildingPlaced', (data) => {
    if (currentGameState !== GAME_STATE.PLAYING) return;
    
    // 타인이 지은 건물 생성
    const owner = otherPlayers[data.ownerId] || player; 
    const b = new Building(data.x, data.y, owner, data.buildingType);
    b.id = data.id;
    b.ownerId = data.ownerId;
    b.health = data.health;
    b.maxHealth = data.maxHealth;
    buildings.push(b);
  });

  // H-2. 원격 플레이어 건물 업그레이드 동기화
  socket.on('buildingUpgraded', (data) => {
    if (currentGameState !== GAME_STATE.PLAYING) return;
    const b = buildings.find(x => x.id === data.id);
    if (b) {
      b.level = data.level;
      b.updateSpecsByLevel();
      b.health = data.health;
      
      // 이펙트 렌더링
      const color = b.owner === player ? "#38bdf8" : b.teamColor.main;
      for (let i = 0; i < 15; i++) {
        particles.push(new Particle(b.x, b.y, color, Math.random() * 3 + 1, Math.random() * Math.PI * 2, 25));
      }
      floatingTexts.push(new FloatingText(b.x, b.y - b.radius, `레벨 ${b.level} 업그레이드!`, "#fbbf24", true));
      
      if (selectedBuilding === b) {
        showBuildingUpgradeUI(b);
      }
    }
  });

  // I. 건물 데미지 및 파괴 연동 수신
  socket.on('buildingDamaged', (data) => {
    const b = buildings.find(x => x.id === data.id);
    if (b) {
      b.health = data.health;
      floatingTexts.push(new FloatingText(b.x, b.y - b.radius, `-${Math.round(data.damage)}`, "#ef4444", true));
    }
  });

  socket.on('buildingDestroyed', (data) => {
    const bIdx = buildings.findIndex(x => x.id === data.id);
    if (bIdx !== -1) {
      const b = buildings[bIdx];
      // 파괴 이펙트
      for (let i = 0; i < 15; i++) {
        particles.push(new Particle(b.x, b.y, "#475569", Math.random() * 5 + 2, Math.random() * Math.PI * 2, 40));
      }
      playSound("destroy");
      buildings.splice(bIdx, 1);
    }
  });

  // J. 원격 투사체(화살/마법구/거석) 발사 연동 수신
  socket.on('projectileFired', (data) => {
    if (currentGameState !== GAME_STATE.PLAYING) return;

    let targetEntity = null;
    if (data.targetType === 'player') {
      if (data.targetOwnerId === socket.id) targetEntity = player;
      else targetEntity = otherPlayers[data.targetOwnerId];
    } else if (data.targetType === 'unit') {
      const owner = (data.targetOwnerId === socket.id) ? player : otherPlayers[data.targetOwnerId];
      if (owner) {
        targetEntity = owner.army.find(u => u.id === data.targetId);
      }
    } else if (data.targetType === 'building') {
      targetEntity = buildings.find(b => b.id === data.targetId);
    }

    if (targetEntity) {
      const shooter = otherPlayers[data.ownerSocketId] || player;
      const proj = new Projectile(data.startX, data.startY, targetEntity, data.damage, shooter, data.pType);
      projectiles.push(proj);
    }
  });

  // K. 피해 판정 수신 (나 또는 내 유닛)
  socket.on('applyPlayerDamage', (data) => {
    if (player && !player.isDead) {
      player.takeDamage(data.damage, data.sourceName);
    }
  });

  socket.on('applyUnitDamage', (data) => {
    if (player && !player.isDead) {
      const u = player.army.find(x => x.id === data.unitId);
      if (u) {
        u.takeDamage(data.damage, data.sourceName);
      }
    }
  });

  // L. 공유 금화 수집 동기화 수신
  socket.on('coinCollected', (data) => {
    if (currentGameState !== GAME_STATE.PLAYING) return;
    
    const coin = coins[data.coinIndex];
    if (coin) {
      if (data.collectorId === socket.id) {
        player.gold += data.coinValue;
        playSound("coin");
        floatingTexts.push(new FloatingText(data.x, data.y, `+${data.coinValue}G`, "#fbbf24"));
      } else {
        const collectorName = otherPlayers[data.collectorId] ? otherPlayers[data.collectorId].nickname : "적";
        floatingTexts.push(new FloatingText(data.x, data.y, `${collectorName} 획득`, "#94a3b8"));
      }

      for (let i = 0; i < 4; i++) {
        particles.push(new Particle(data.x, data.y, "#fde047", Math.random() * 2 + 1, Math.random() * Math.PI * 2, 15));
      }

      coin.x = data.newX;
      coin.y = data.newY;
      coin.value = data.newValue;
    }
  });

  // M. 공유 버프 아이템 수집 동기화 수신
  socket.on('itemCollected', (data) => {
    if (currentGameState !== GAME_STATE.PLAYING) return;

    const item = items[data.itemIndex];
    if (item) {
      if (data.collectorId === socket.id) {
        if (data.itemType === 'heal') {
          player.health = Math.min(player.maxHealth, player.health + 100);
          playSound('heal');
          floatingTexts.push(new FloatingText(data.x, data.y, "+100 체력 회복!", "#22c55e", true));
        } else if (data.itemType === 'speed') {
          player.speedBuffTimer = 600;
          playSound('speed');
          floatingTexts.push(new FloatingText(data.x, data.y, "속도 강화 버프! (10초)", "#06b6d4", true));
        } else if (data.itemType === 'magnet') {
          player.magnetTimer = 900;
          playSound('magnet');
          floatingTexts.push(new FloatingText(data.x, data.y, "골드 자석 버프! (15초)", "#a855f7", true));
        }
      } else {
        const collectorName = otherPlayers[data.collectorId] ? otherPlayers[data.collectorId].nickname : "적";
        floatingTexts.push(new FloatingText(data.x, data.y, `${collectorName} 버프 획득!`, item.color));
      }

      for (let i = 0; i < 6; i++) {
        particles.push(new Particle(data.x, data.y, data.color, Math.random() * 3 + 1, Math.random() * Math.PI * 2, 20));
      }

      item.x = data.newX;
      item.y = data.newY;
      item.itemType = data.newItemType;
      item.icon = data.newIcon;
      item.color = data.newColor;
    }
  });

  return true;
}

// 대기실 참가자 명단 렌더링
function updateWaitingRoomList(roomPlayers) {
  const listEl = document.getElementById("waitingPlayerList");
  if (!listEl) return;
  
  const playersHtml = Object.keys(roomPlayers).map((sid, idx) => {
    const p = roomPlayers[sid];
    const isHost = (idx === 0);
    const hostClass = isHost ? 'class="host-player"' : '';
    return `<li ${hostClass}>${p.nickname}</li>`;
  }).join("");
  
  listEl.innerHTML = playersHtml;
  document.getElementById("waitingPlayerCount").innerText = Object.keys(roomPlayers).length;
}

// --- 건물 업그레이드 UI 및 제어 함수 ---
function getBuildingEffectText(type, lv) {
  if (type === "mine") {
    if (lv === 1) return "1초당 +3G 자동 채굴";
    if (lv === 2) return "1초당 +8G 자동 채굴";
    return "1초당 +18G 자동 채굴";
  } else if (type === "house") {
    if (lv === 1) return "인구수 한도 +15";
    if (lv === 2) return "인구수 한도 +35";
    return "인구수 한도 +65";
  } else if (type === "barracks") {
    if (lv === 1) return "보병/궁수 6.0초마다 생산";
    if (lv === 2) return "보병/궁수 4.5초마다 생산 (25% 단축)";
    return "보병/궁수 3.0초마다 생산 (50% 단축)";
  } else if (type === "stable") {
    if (lv === 1) return "경기병/기사 8.0초마다 생산";
    if (lv === 2) return "경기병/기사 6.0초마다 생산 (25% 단축)";
    return "경기병/기사 4.0초마다 생산 (50% 단축)";
  } else if (type === "siegeWorkshop") {
    if (lv === 1) return "투석기 12.0초마다 생산";
    if (lv === 2) return "투석기 9.0초마다 생산 (25% 단축)";
    return "투석기 6.0초마다 생산 (50% 단축)";
  } else if (type === "archerTower") {
    if (lv === 1) return "데미지: 22, 사거리: 220, 쿨타임: 1.0초";
    if (lv === 2) return "데미지: 45, 사거리: 280, 쿨타임: 0.8초";
    return "데미지: 80, 사거리: 350, 쿨타임: 0.6초";
  } else if (type === "mageTower") {
    if (lv === 1) return "데미지: 40(광역), 사거리: 180, 쿨타임: 1.8초";
    if (lv === 2) return "데미지: 85(광역), 사거리: 240, 쿨타임: 1.4초";
    return "데미지: 160(광역), 사거리: 300, 쿨타임: 1.0초";
  }
  return "";
}

function showBuildingUpgradeUI(b) {
  const ui = document.getElementById("buildingUpgradeUI");
  if (!ui) return;
  
  if (!b || b.isDead) {
    ui.classList.add("hidden");
    return;
  }
  
  ui.classList.remove("hidden");
  
  const icons = {
    mine: "⛏️",
    house: "🏠",
    archerTower: "🏹",
    mageTower: "🔮",
    barracks: "⚔️",
    stable: "🐴",
    siegeWorkshop: "⚙️"
  };
  
  const names = {
    mine: "금광",
    house: "집",
    archerTower: "아처 타워",
    mageTower: "메이지 타워",
    barracks: "병영",
    stable: "마구간",
    siegeWorkshop: "공성소"
  };
  
  const lv = b.level || 1;
  const type = b.buildingType;
  
  document.getElementById("upgradeBuildingIcon").innerText = icons[type] || "🏰";
  document.getElementById("upgradeBuildingName").innerText = `${names[type] || type} (Lv. ${lv})`;
  document.getElementById("upgradeBuildingHealth").innerText = `HP: ${b.health} / ${b.maxHealth}`;
  
  const currentEffect = getBuildingEffectText(type, lv);
  document.getElementById("upgradeBuildingEffect").innerHTML = `현재 효과: ${currentEffect}`;
  
  const upgradeBtn = document.getElementById("upgradeBtn");
  
  if (lv >= 3) {
    document.getElementById("upgradeNextEffect").innerHTML = `<span style="color: #f59e0b;">최대 레벨 도달</span>`;
    upgradeBtn.style.display = "none";
  } else {
    const nextEffect = getBuildingEffectText(type, lv + 1);
    document.getElementById("upgradeNextEffect").innerHTML = `다음 효과: ${nextEffect}`;
    upgradeBtn.style.display = "block";
    
    const baseCost = BUILDING_SPECS[type].cost;
    const upgradeCost = baseCost * (lv === 1 ? 4 : 8);
    document.getElementById("upgradeCostValue").innerText = upgradeCost;
    
    if (player.gold < upgradeCost) {
      upgradeBtn.disabled = true;
      upgradeBtn.classList.add("disabled");
    } else {
      upgradeBtn.disabled = false;
      upgradeBtn.classList.remove("disabled");
    }
  }
}

function hideBuildingUpgradeUI() {
  const ui = document.getElementById("buildingUpgradeUI");
  if (ui) ui.classList.add("hidden");
}

function executeBuildingUpgrade(b) {
  if (!b || b.isDead) return;
  
  const oldMaxHp = b.maxHealth;
  b.level = (b.level || 1) + 1;
  b.updateSpecsByLevel();
  
  const hpIncrease = b.maxHealth - oldMaxHp;
  b.health = Math.min(b.maxHealth, b.health + hpIncrease + Math.round(b.maxHealth * 0.2));
  
  if (b.owner === player) {
    playSound("heal");
  }
  
  const effectColor = b.owner === player ? "#38bdf8" : b.teamColor.main;
  for (let i = 0; i < 20; i++) {
    particles.push(new Particle(b.x, b.y, effectColor, Math.random() * 3.5 + 1.5, Math.random() * Math.PI * 2, 30));
  }
  
  floatingTexts.push(new FloatingText(b.x, b.y - b.radius, `레벨 ${b.level} 업그레이드!`, "#fbbf24", true));
}

function requestUpgradeSelectedBuilding() {
  if (!selectedBuilding || selectedBuilding.isDead) return;
  if (selectedBuilding.owner !== player) return;
  if (selectedBuilding.level >= 3) return;
  
  const lv = selectedBuilding.level;
  const baseCost = BUILDING_SPECS[selectedBuilding.buildingType].cost;
  const upgradeCost = baseCost * (lv === 1 ? 4 : 8);
  
  if (player.gold < upgradeCost) {
    floatingTexts.push(new FloatingText(player.x, player.y - player.radius, "골드가 부족합니다!", "#ef4444", true));
    return;
  }
  
  player.gold -= upgradeCost;
  
  executeBuildingUpgrade(selectedBuilding);
  
  if (isMultiplayer) {
    socket.emit("upgradeBuilding", {
      id: selectedBuilding.id,
      level: selectedBuilding.level,
      health: selectedBuilding.health
    });
  }
  
  showBuildingUpgradeUI(selectedBuilding);
}

// --- 일시정지 및 대시보드 나가기, 게임 종료 함수 ---
function pauseGame() {
  if (currentGameState !== GAME_STATE.PLAYING) return;
  
  isPaused = true;
  document.getElementById("pauseMenuModal").classList.remove("hidden");
  
  const desc = document.getElementById("pauseModalDesc");
  if (isMultiplayer) {
    desc.innerHTML = `<span style="color: #ef4444; font-weight: bold;">[멀티플레이 경고]</span><br>실시간 멀티플레이어 환경에서는 게임을 일시정지할 수 없습니다.<br>나갈 경우 방에서 즉시 퇴장 처리됩니다.`;
  } else {
    desc.innerText = "게임이 일시정지 되었습니다.";
  }
}

function resumeGame() {
  isPaused = false;
  document.getElementById("pauseMenuModal").classList.add("hidden");
}

function exitToDashboard() {
  // 모달 닫기
  document.getElementById("pauseMenuModal").classList.add("hidden");
  isPaused = false;
  
  // 멀티플레이 방 퇴장 처리
  if (isMultiplayer && socket) {
    socket.disconnect();
    socket = null;
  }
  isMultiplayer = false;
  
  // 게임 데이터 초기화 (Reset)
  kings = [];
  player = null;
  otherPlayers = {};
  buildings = [];
  coins = [];
  obstacles = [];
  projectiles = [];
  particles = [];
  floatingTexts = [];
  items = [];
  selectedBuilding = null;
  
  // UI 상태 복구
  document.getElementById("gameHUD").classList.add("hidden");
  document.getElementById("gameHUD").classList.add("lobby-bg");
  document.getElementById("lobbyStartCard").classList.remove("hidden");
  document.getElementById("lobbyWaitingRoom").classList.add("hidden");
  document.getElementById("buildingUpgradeUI").classList.add("hidden");
  
  // 샵 바 활성화 상태 해제
  document.querySelector(".shop-bar").classList.add("shop-disabled");
  
  currentGameState = GAME_STATE.LOBBY;
  
  // 대시보드로 돌아가므로 landingScreen은 hidden으로 두고 바로 lobbyStartCard를 보여줌
  document.getElementById("gameHUD").classList.remove("hidden");
}

function quitGame() {
  // 종료음 재생 시도
  if (typeof playSound === "function") {
    try { playSound("destroy"); } catch (e) {}
  }
  
  // 1. window.close() 시도
  window.close();
  
  // 2. 브라우저 정책상 창이 닫히지 않는 경우 대체 팝업 안내
  setTimeout(() => {
    alert("브라우저 탭이나 창을 닫아 게임을 종료해 주세요.");
  }, 100);
}

// 글로벌 등록
window.getBuildingEffectText = getBuildingEffectText;
window.showBuildingUpgradeUI = showBuildingUpgradeUI;
window.hideBuildingUpgradeUI = hideBuildingUpgradeUI;
window.executeBuildingUpgrade = executeBuildingUpgrade;
window.requestUpgradeSelectedBuilding = requestUpgradeSelectedBuilding;
window.pauseGame = pauseGame;
window.resumeGame = resumeGame;
window.exitToDashboard = exitToDashboard;
window.quitGame = quitGame;

resizeCanvas();
gameLoop();
