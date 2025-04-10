require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');

// 🔁 Ініціалізація Express + HTTP + Socket.IO
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

// 📦 Зберігаємо кімнати в пам'яті
const rooms = {}; // { room_code: { players: [ { playerId, socketId } ] } }

io.on('connection', (socket) => {
  console.log('🟢 Socket підключено:', socket.id);

  socket.on('joinRoom', ({ room_code, player_id }) => {
    if (!room_code || !player_id) return;

    if (!rooms[room_code]) {
      rooms[room_code] = {
        players: []
      };
    }

    const room = rooms[room_code];

    // Уникаємо повторів
    if (!room.players.find(p => p.playerId === player_id)) {
      room.players.push({ playerId: player_id, socketId: socket.id });
    } else {
      const p = room.players.find(p => p.playerId === player_id);
      p.socketId = socket.id;
    }

    socket.join(room_code);

    const position = room.players.findIndex(p => p.playerId === player_id) + 1;

    console.log(`📦 Гравець ${player_id} зайшов у кімнату ${room_code} як позиція ${position}`);

    socket.emit('roomJoined', {
      position,
      playersInRoom: room.players.length
    });

    sendRoomUpdate(room_code);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket відключився:', socket.id);

    for (const room_code in rooms) {
      const room = rooms[room_code];
      const index = room.players.findIndex(p => p.socketId === socket.id);
      if (index !== -1) {
        const player = room.players[index];
        console.log(`❌ Гравець ${player.playerId} вийшов з кімнати ${room_code}`);
        room.players.splice(index, 1);

        if (room.players.length === 0) {
          delete rooms[room_code];
          console.log(`🗑️ Кімната ${room_code} очищена`);
        } else {
          sendRoomUpdate(room_code);
        }
        break;
      }
    }
  });
});

// Надсилання списку гравців
function sendRoomUpdate(room_code) {
  const room = rooms[room_code];
  if (!room) return;

  const players = room.players.map(p => ({ playerId: p.playerId }));
  io.to(room_code).emit('roomUpdate', { players });
}

// ⛓️ Підключення БД
const db = require('./db/db')();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 📁 Роути
const nicknameRoutes = require('./routes/nicknameRoutes');
const playerRoutes = require('./routes/playerRoutes');
const storyRoutes = require('./routes/storyRoutes');
const playerListRoutes = require('./routes/playerListRoutes');
const roomRoutes = require('./routes/roomRoutes');

app.use('/api', nicknameRoutes);
app.use('/api', playerRoutes);
app.use('/api', storyRoutes);
app.use('/api', playerListRoutes);
app.use('/api', roomRoutes);

// 📄 Сторінки
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/second-page', (req, res) => res.sendFile(path.join(__dirname, 'public', 'second-page.html')));
app.get('/players', (req, res) => res.sendFile(path.join(__dirname, 'public', 'third-page.html')));
app.get('/story', (req, res) => res.sendFile(path.join(__dirname, 'public', 'fourth-page.html')));
app.get('/fifth-page', (req, res) => res.sendFile(path.join(__dirname, 'public', 'fifth-page.html')));

// 🧯 Обробка помилок
app.use((err, req, res, next) => {
  console.error('❌ Помилка сервера:', err.stack);
  res.status(500).json({ error: 'Помилка сервера' });
});

// ▶️ Запуск
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Сервер запущено на порту ${PORT}`);
});
