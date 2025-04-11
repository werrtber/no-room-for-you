require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');
const db = require('./db/db');

// 🔁 Ініціалізація Express + HTTP + Socket.IO
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

// 📦 Зберігаємо кімнати в пам'яті
 // { room_code: { players: [ { playerId, socketId } ] } }

io.on('connection', (socket) => {
  console.log('🟢 Socket підключено:', socket.id);

  socket.on('joinRoom', async ({ room_code, player_id }) => {
    if (!room_code || !player_id) return;
    const pool = db();
    //socket.id = player_id;
    // Логування отриманих даних
    console.log('Отримані дані:', { room_code, player_id });
    // Додавання гравця до кімнати

    let [rows] = await pool.execute('SELECT player_id, nickname FROM player JOIN room ON player.room_id = room.room_id WHERE room_code = ?', [room_code]);
    console.log(rows);
    const nicknames = rows.map(row => row.nickname);
    for(let i = 0; i < rows.length; i++){
      rows[i].position = i+1;
    }
    //const room = rooms[room_code];
    // const existingPlayer = room.players.find(p => p.playerId === player_id);

    // if (!existingPlayer) {
    //   room.players.push({ playerId: player_id, socketId: socket.id });
    // } else {
    //   existingPlayer.socketId = socket.id;
    // }

    socket.join(room_code);

    const position = nicknames.length;
    console.log(`📦 Гравець ${player_id} зайшов у кімнату ${room_code} як позиція ${position}`);

    // Відправлення відповіді клієнту
    socket.emit('roomJoined', {
      position,
      playersInRoom: nicknames
    });

    sendRoomUpdate(room_code, rows);

    socket.on('disconnect', async ()=>{
      await pool.execute('UPDATE player SET room_id = null WHERE player_id = ?', [player_id]);
      [rows] = await pool.execute('SELECT player_id, nickname FROM player JOIN room ON player.room_id = room.room_id WHERE room_code = ?', [room_code]);
      sendRoomUpdate(room_code, rows);
    })
  });
  
});

// Надсилання списку гравців
function sendRoomUpdate(room_code, rows) {

  //const players = room.players.map(p => ({ playerId: p.playerId }));
  console.log({rows});
  io.to(room_code).emit('roomUpdate', rows);
}

// ⛓️ Підключення БД
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
