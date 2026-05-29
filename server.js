const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const STATIC_ROOT = path.join(__dirname, 'public');
const IS_VERCEL = Boolean(process.env.VERCEL);

const PORT = process.env.PORT || 8000;
const WORLD_SIZE = 6000;
const MAX_COINS = 350;
const MAX_ITEMS = 35;

// CSP(Content Security Policy) 헤더 설정 — 폰트/스크립트/스타일 외부 허용
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com data:",
      "img-src 'self' data: blob:",
      "connect-src 'self' ws: wss:",
      "media-src 'self'",
      "worker-src 'self' blob:"
    ].join('; ')
  );
  next();
});

// 정적 파일 호스팅 (Vercel 배포와 동일한 public 루트 사용)
app.use(express.static(STATIC_ROOT, { index: false }));

// Express 로컬 서버에서도 루트와 SPA fallback을 index.html로 연결합니다.
app.get(['/', '/index.html'], (req, res) => {
  res.sendFile(path.join(STATIC_ROOT, 'index.html'));
});

app.get(/^\/(?!socket\.io\/).*/, (req, res, next) => {
  // 확장자가 있는 정적 파일은 express.static의 404로 남겨서 문제 파일을 숨기지 않습니다.
  if (path.extname(req.path)) return next();
  res.sendFile(path.join(STATIC_ROOT, 'index.html'));
});

// 방(Room) 목록 및 인게임 정보 관리 맵
// 구조: { [roomCode]: { host: socketId, players: { [socketId]: playerData }, buildings: [], coins: [], items: [], started: false } }
const rooms = {};

// 무작위 5자리 방 코드 생성기
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  do {
    code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (rooms[code]); // 중복 방지
  return code;
}

// 맵 내 공유 자원(금화) 생성기
function generateInitialCoins() {
  const coins = [];
  for (let i = 0; i < MAX_COINS; i++) {
    coins.push({
      x: Math.random() * (WORLD_SIZE - 40) + 20,
      y: Math.random() * (WORLD_SIZE - 40) + 20,
      value: Math.floor(Math.random() * 4) + 4 // 4~7G
    });
  }
  return coins;
}

// 맵 내 공유 아이템 생성기
function generateInitialItems() {
  const items = [];
  for (let i = 0; i < MAX_ITEMS; i++) {
    const rand = Math.random();
    let itemType, icon, color;
    if (rand < 0.4) {
      itemType = 'heal';
      icon = '❤️';
      color = '#ef4444';
    } else if (rand < 0.75) {
      itemType = 'speed';
      icon = '⚡';
      color = '#06b6d4';
    } else {
      itemType = 'magnet';
      icon = '🧲';
      color = '#a855f7';
    }
    items.push({
      x: Math.random() * (WORLD_SIZE - 200) + 100,
      y: Math.random() * (WORLD_SIZE - 200) + 100,
      itemType,
      icon,
      color
    });
  }
  return items;
}

// 플레이어 고유 색상 풀 (빨주노초파남보 등 정제된 현대적 색상)
const PLAYER_COLORS = [
  '#3b82f6', // 파랑 (기존 플레이어 기본 색상과 매칭)
  '#ef4444', // 빨강 (Red)
  '#22c55e', // 초록 (Green)
  '#f97316', // 주황 (Orange)
  '#a855f7', // 보라 (Purple)
  '#eab308', // 노랑 (Yellow)
  '#6366f1'  // 남색 (Indigo)
];

// 방 안의 플레이어 수를 기준으로 중복되지 않는 다음 사용 가능한 색상 할당
function getNextAvailableColor(room) {
  const usedColors = Object.values(room.players).map(p => p.color);
  for (const color of PLAYER_COLORS) {
    if (!usedColors.includes(color)) {
      return color;
    }
  }
  // 모두 사용 중이면 무작위 선택
  return PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)];
}

// 소켓 통신 연동
io.on('connection', (socket) => {
  console.log(`사용자 접속: ${socket.id}`);
  let currentRoom = null;

  // 1. 방 개설 (Host)
  socket.on('createRoom', (data) => {
    const roomCode = generateRoomCode();
    const nickname = data.nickname || 'Chisok';

    // 방 리소스 초기 빌드
    rooms[roomCode] = {
      host: socket.id,
      players: {},
      buildings: [],
      coins: generateInitialCoins(),
      items: generateInitialItems(),
      started: false
    };

    // 호스트 플레이어 데이터 초기화
    rooms[roomCode].players[socket.id] = {
      socketId: socket.id,
      nickname: nickname,
      color: PLAYER_COLORS[0], // 방장은 첫 번째 색상 (파랑)
      x: WORLD_SIZE / 2,
      y: WORLD_SIZE / 2,
      angle: 0,
      gold: 150,
      health: 400,
      maxHealth: 400,
      army: [],
      isDead: false
    };

    currentRoom = roomCode;
    socket.join(roomCode);

    socket.emit('roomCreated', {
      roomCode: roomCode,
      mapData: {
        coins: rooms[roomCode].coins,
        items: rooms[roomCode].items
      },
      players: rooms[roomCode].players
    });

    console.log(`방 개설 완료: ${roomCode} (개설자: ${nickname}, 색상: ${PLAYER_COLORS[0]})`);
  });

  // 2. 방 참가 (Guest)
  socket.on('joinRoom', (data) => {
    const roomCode = (data.roomCode || '').toUpperCase().trim();
    const nickname = data.nickname || 'Guest';

    if (!rooms[roomCode]) {
      socket.emit('joinError', { message: '존재하지 않는 방 코드입니다.' });
      return;
    }

    if (rooms[roomCode].started) {
      socket.emit('joinError', { message: '이미 게임이 진행 중인 방입니다.' });
      return;
    }

    const playerColor = getNextAvailableColor(rooms[roomCode]);

    // 신규 게스트 플레이어 데이터 추가
    rooms[roomCode].players[socket.id] = {
      socketId: socket.id,
      nickname: nickname,
      color: playerColor,
      x: Math.random() * (WORLD_SIZE - 600) + 300,
      y: Math.random() * (WORLD_SIZE - 600) + 300,
      angle: 0,
      gold: 150,
      health: 400,
      maxHealth: 400,
      army: [],
      isDead: false
    };

    currentRoom = roomCode;
    socket.join(roomCode);

    // 본인에게 참가 정보 전달
    socket.emit('roomJoined', {
      roomCode: roomCode,
      mapData: {
        coins: rooms[roomCode].coins,
        items: rooms[roomCode].items
      },
      players: rooms[roomCode].players
    });

    // 방 내부의 모든 참가자들에게 인원 업데이트 브로드캐스트
    io.to(roomCode).emit('playerListUpdate', {
      players: rooms[roomCode].players
    });

    console.log(`방 참가 완료: ${roomCode} (참가자: ${nickname}, 색상: ${playerColor})`);
  });

  // 3. 게임 시작 (방장만 전송 가능)
  socket.on('startGame', () => {
    if (!currentRoom || !rooms[currentRoom]) return;
    if (rooms[currentRoom].host !== socket.id) return; // 방장 검증

    rooms[currentRoom].started = true;
    
    // 게임 시작 시점의 방의 맵 자원과 모든 플레이어 데이터를 함께 뿌려줍니다.
    io.to(currentRoom).emit('gameStarted', {
      mapData: {
        coins: rooms[currentRoom].coins,
        items: rooms[currentRoom].items
      },
      players: rooms[currentRoom].players
    });
    console.log(`게임 시작됨: ${currentRoom}`);
  });

  // 4. 플레이어 정보 실시간 업데이트 동기화 (30Hz 주기로 클라이언트가 쏨)
  socket.on('updatePlayer', (data) => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const room = rooms[currentRoom];
    if (!room.players[socket.id]) return;

    // 데이터 갱신
    room.players[socket.id].x = data.x;
    room.players[socket.id].y = data.y;
    room.players[socket.id].angle = data.angle;
    room.players[socket.id].gold = data.gold;
    room.players[socket.id].health = data.health;
    room.players[socket.id].army = data.army || [];
    room.players[socket.id].isDead = data.isDead;

    // 자신을 제외한 같은 방 플레이어들에게 위치 갱신 동보
    socket.to(currentRoom).emit('playerUpdated', {
      socketId: socket.id,
      playerData: room.players[socket.id]
    });
  });

  // 5. 기지 건물 건설 동기화
  socket.on('placeBuilding', (data) => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const room = rooms[currentRoom];

    const building = {
      id: data.id,
      ownerId: socket.id,
      ownerName: room.players[socket.id] ? room.players[socket.id].nickname : 'Unknown',
      buildingType: data.buildingType,
      x: data.x,
      y: data.y,
      health: data.health,
      maxHealth: data.maxHealth,
      level: 1
    };

    room.buildings.push(building);
    // 방 안의 타인에게 건물 생성 전달
    socket.to(currentRoom).emit('buildingPlaced', building);
  });

  // 5-2. 기지 건물 업그레이드 동기화
  socket.on('upgradeBuilding', (data) => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const room = rooms[currentRoom];
    const bld = room.buildings.find(b => b.id === data.id);
    if (bld) {
      bld.level = data.level;
      bld.health = data.health;
      bld.maxHealth = data.maxHealth;
      // 방 안의 타인에게 건물 업그레이드 전파
      socket.to(currentRoom).emit('buildingUpgraded', {
        id: data.id,
        level: data.level,
        health: data.health,
        maxHealth: data.maxHealth
      });
    }
  });

  // 6. 건물 데미지 및 파괴 동기화
  socket.on('damageBuilding', (data) => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const room = rooms[currentRoom];
    const bIdx = room.buildings.findIndex(b => b.id === data.id);
    if (bIdx !== -1) {
      room.buildings[bIdx].health -= data.damage;
      if (room.buildings[bIdx].health <= 0) {
        room.buildings.splice(bIdx, 1);
        io.to(currentRoom).emit('buildingDestroyed', { id: data.id, sourceName: data.sourceName });
      } else {
        socket.to(currentRoom).emit('buildingDamaged', { id: data.id, health: room.buildings[bIdx].health, damage: data.damage });
      }
    }
  });

  // 7. 타 플레이어/유닛 타격 피해 동기화
  socket.on('damagePlayer', (data) => {
    if (!currentRoom) return;
    // 피해를 받은 플레이어 소켓에 직접 데미지 전송
    socket.to(data.targetSocketId).emit('applyPlayerDamage', {
      damage: data.damage,
      sourceName: data.sourceName
    });
  });

  socket.on('damageUnit', (data) => {
    if (!currentRoom) return;
    // 유닛 소유자에게 피해를 줬음을 전달하여 소유자 클라이언트가 체력 깎도록 유도
    socket.to(data.ownerSocketId).emit('applyUnitDamage', {
      unitId: data.unitId,
      damage: data.damage,
      sourceName: data.sourceName
    });
  });

  // 8. 투사체(화살, 마법구, 거석) 발사 연출 동기화
  socket.on('fireProjectile', (data) => {
    if (!currentRoom) return;
    socket.to(currentRoom).emit('projectileFired', {
      ownerSocketId: socket.id,
      startX: data.startX,
      startY: data.startY,
      targetId: data.targetId,
      targetType: data.targetType, // 'player' or 'unit' or 'building'
      targetOwnerId: data.targetOwnerId,
      damage: data.damage,
      pType: data.pType
    });
  });

  // 9. 공유 금화 수집 동기화 (레이스 컨디션 방지 선착순 판정)
  socket.on('collectCoin', (data) => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const room = rooms[currentRoom];
    const coinIdx = data.coinIndex;

    if (room.coins[coinIdx]) {
      const coin = room.coins[coinIdx];
      
      // 즉시 획득 판정 및 새로운 좌표 리스폰
      const newValue = Math.floor(Math.random() * 4) + 4;
      const newX = Math.random() * (WORLD_SIZE - 40) + 20;
      const newY = Math.random() * (WORLD_SIZE - 40) + 20;

      room.coins[coinIdx] = { x: newX, y: newY, value: newValue };

      // 방 전원에게 획득 처리 및 리스폰 전송
      io.to(currentRoom).emit('coinCollected', {
        coinIndex: coinIdx,
        collectorId: socket.id,
        coinValue: coin.value,
        x: coin.x, // 획득한 곳
        y: coin.y,
        newX: newX, // 새로 스폰된 곳
        newY: newY,
        newValue: newValue
      });
    }
  });

  // 10. 공유 버프 아이템 수집 동기화
  socket.on('collectItem', (data) => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const room = rooms[currentRoom];
    const itemIdx = data.itemIndex;

    if (room.items[itemIdx]) {
      const item = room.items[itemIdx];

      // 아이템 즉시 획득 및 리스폰
      const rand = Math.random();
      let itemType, icon, color;
      if (rand < 0.4) {
        itemType = 'heal';
        icon = '❤️';
        color = '#ef4444';
      } else if (rand < 0.75) {
        itemType = 'speed';
        icon = '⚡';
        color = '#06b6d4';
      } else {
        itemType = 'magnet';
        icon = '🧲';
        color = '#a855f7';
      }
      const newX = Math.random() * (WORLD_SIZE - 200) + 100;
      const newY = Math.random() * (WORLD_SIZE - 200) + 100;

      room.items[itemIdx] = { x: newX, y: newY, itemType, icon, color };

      // 방 전원에게 전송
      io.to(currentRoom).emit('itemCollected', {
        itemIndex: itemIdx,
        collectorId: socket.id,
        itemType: item.itemType,
        x: item.x,
        y: item.y,
        color: item.color,
        newX: newX,
        newY: newY,
        newItemType: itemType,
        newIcon: icon,
        newColor: color
      });
    }
  });

  // 11. 연결 종료 처리
  socket.on('disconnect', () => {
    console.log(`사용자 단선: ${socket.id}`);
    if (currentRoom && rooms[currentRoom]) {
      const room = rooms[currentRoom];
      const nickname = room.players[socket.id] ? room.players[socket.id].nickname : 'Unknown';

      // 방에서 플레이어 데이터 제거
      delete room.players[socket.id];

      // 이탈한 플레이어의 건물들 철거
      room.buildings = room.buildings.filter(b => b.ownerId !== socket.id);

      // 방 안의 잔류인원 전원에게 이탈 및 청소 처리 통보
      io.to(currentRoom).emit('playerDisconnected', {
        socketId: socket.id,
        nickname: nickname
      });

      // 만약 방장(Host)이 나가고 잔류 인원이 있으면, 방장 위임
      if (room.host === socket.id) {
        const remainingKeys = Object.keys(room.players);
        if (remainingKeys.length > 0) {
          room.host = remainingKeys[0];
          io.to(currentRoom).emit('hostChanged', { newHostId: room.host });
          console.log(`방장 권한 위임: ${currentRoom} -> ${room.host}`);
        } else {
          // 남은 사람이 없으면 방 삭제
          delete rooms[currentRoom];
          console.log(`방 인원 부재로 삭제: ${currentRoom}`);
        }
      }
    }
  });
});

// 서버 실행
if (!IS_VERCEL) {
  server.listen(PORT, () => {
    console.log(`-----------------------------------------------------`);
    console.log(` Legion.io Realtime Server is now running!`);
    console.log(` Local URL: http://localhost:${PORT}`);
    console.log(`-----------------------------------------------------`);
  });
}

module.exports = app;
