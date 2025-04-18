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
const roomTimers = {}; // Об'єкт для зберігання часу кожної кімнати
io.on('connection', (socket) => {
  console.log('🟢 Socket підключено:', socket.id);
  // Коли хост перегортає історії
  socket.on('testConnection', function(data) {
    console.log('Отримано тестове повідомлення:', data);
    
    // Відправляємо відповідь назад до кімнати
    if (data.room_code) {
        io.to(data.room_code).emit('testResponse', { 
            success: true, 
            message: 'Сервер отримав ваше повідомлення', 
            originalData: data 
        });
    }
});

// Додаємо подію для явного приєднання до кімнати
socket.on('joinGameRoom', function(data) {
    if (data.room_code) {
        socket.join(data.room_code);
        console.log(`Гравець приєднався до кімнати: ${data.room_code}`);
        
        // Підтверджуємо приєднання
        socket.emit('roomJoined', { 
            success: true, 
            room_code: data.room_code 
        });
    }
});
// Обробник події "вигнати гравця"
// Обробник події "вигнати гравця"
socket.on('kickPlayer', async ({ room_code, playerId }) => {
  console.log(`❌ Хост вигнав гравця з ID ${playerId} з кімнати ${room_code}`);
  
  // Передаємо всім гравцям у кімнаті інформацію про вигнаного гравця
  io.to(room_code).emit('playerKicked', { playerId });

  // // Оновлюємо список гравців у кімнаті (якщо потрібно)
  // const pool = db();
  // const [rows] = await pool.execute(
  //   'SELECT player_id, nickname, color FROM player JOIN room ON player.room_id = room.room_id WHERE room_code = ?',
  //   [room_code]
  // );
  // sendRoomUpdate(room_code, rows);
});
// Оновлюємо обробник відкриття атрибутів
// Оновлений інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код.інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код.інший
socket.on('revealAttribute', async ({ playerId, attributeId, roomCode, playerNickname, attributeValue }) => {
  console.log(`👀 Гравець ${playerId} (${playerNickname}) відкрив характеристику: ${attributeId} у кімнаті ${roomCode}`);
  const pool = db();
  
  // Переведення атрибутів в назви колонок БД
  switch(attributeId){
      case 'profession': attributeId = 'job'; break;
      case 'skills': attributeId = 'hobby'; break;
      case 'flaws': attributeId = 'vada'; break;
      case 'backpack': attributeId = 'items'; break;
  }
  
  // Оновлення БД
  await pool.execute(`UPDATE player_to_show SET ${attributeId} = ? WHERE player_id = ?`, [attributeValue, playerId]);
  
  // Отримання ВСІХ гравців у кімнаті (включаючи того, хто відкрив атрибут)
  const [allPlayersCards] = await pool.execute(`
      SELECT 
          player.nickname, 
          p.player_id, 
          p.age, 
          p.gender, 
          p.color, 
          p.job, 
          p.hobby, 
          p.health, 
          p.vada, 
          p.items 
      FROM player_to_show AS p 
      JOIN player ON p.player_id = player.player_id 
      JOIN room ON player.room_id = room.room_id 
      WHERE room_code = ?
  `, [roomCode]);//ляємінший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код. Інший код.інший
  // Відправка ВСІХ даних гравців у кімнаті
  io.to(roomCode).emit('updateAttributeVisibility', { 
      players: allPlayersCards // Тепер передаємо всіх гравців
  });
});
  // Коли хост перегортає історії
  socket.on('changeStory', ({ room_code, story_id }) => {
    console.log(`📚 Хост змінив історію: ${story_id} в кімнаті ${room_code}`);
    // Важливо: транслюємо всім в кімнаті, включно з хостом
    socket.to(room_code).emit('updateStory', { story_id });
  });

  // Коли хост обирає історію
  socket.on('chooseStory', ({ room_code, story_id }) => {
    console.log(`✅ Хост обрав історію: ${story_id} в кімнаті ${room_code}`);
    // Важливо: транслюємо всім в кімнаті, включно з хостом
    socket.to(room_code).emit('storyChosen');
  });

  // Обробка події startGame
  socket.on('startGame', ({ room_code }) => {
  console.log(`🎮 Гра почалася в кімнаті: ${room_code}`);
  io.to(room_code).emit('redirectPlayers'); // Повідомляємо всіх гравців про перенаправлення
  });
  socket.on('joinRoom', async ({ room_code, player_id }) => {
    if (!room_code || !player_id) return;
    const pool = db();

    let [rows] = await pool.execute(
      'SELECT player_id, nickname, color FROM player JOIN room ON player.room_id = room.room_id WHERE room_code = ?',
      [room_code]
    );

    const position = rows.length;
    const isHost = position === 1;

    socket.join(room_code);

    console.log(`📦 Гравець ${player_id} зайшов у кімнату ${room_code} як позиція ${position}`);

    socket.emit('roomJoined', {
      position,
      isHost,
      playersInRoom: rows.map(p => ({ playerId: p.player_id, nickname: p.nickname, color: p.color }))
    });

    sendRoomUpdate(room_code, rows);

    // Обробка вибору кольору
    socket.on('colorChange', async ({ color, playerId }) => {
      await pool.execute('UPDATE player SET color = ? WHERE player_id = ?', [color, playerId]);
      [rows] = await pool.execute(
        'SELECT player_id, nickname, color FROM player JOIN room ON player.room_id = room.room_id WHERE room_code = ?',
        [room_code]
      );
      sendRoomUpdate(room_code, rows);
    });

    // Обробка перевірки кількості гравців
    socket.on('checkPlayerCount', async ({ room_code }) => {
      const [players] = await pool.execute(
        'SELECT COUNT(*) AS count FROM player JOIN room ON player.room_id = room.room_id WHERE room_code = ?',
        [room_code]
      );
      const playerCount = players[0].count;
      socket.emit('playerCountResponse', { playerCount });
    });
    // Обробка відключення
    socket.on('disconnect', async () => {
      //await pool.execute('UPDATE player SET room_id = null WHERE player_id = ?', [player_id]);
      [rows] = await pool.execute(
        'SELECT player_id, nickname, color FROM player JOIN room ON player.room_id = room.room_id WHERE room_code = ? EXCEPT (SELECT player_id, nickname, color FROM player WHERE player_id = ?)',
        [room_code, player_id]
      );
      sendRoomUpdate(room_code, rows);
    });
  });
    socket.on('startTimer', async ({ room_code }) => {
      if (!roomTimers[room_code]) {
          roomTimers[room_code] = 60; // Початковий час (60 секунд)
      }

      console.log(`⏳ Таймер запущено для кімнати: ${room_code}`);

      // Запускаємо інтервал для оновлення часу
      const intervalId = setInterval(async () => {
          if (roomTimers[room_code] > 0) {
              roomTimers[room_code]--;
              io.to(room_code).emit('updateTimer', { timeLeft: roomTimers[room_code] });
          } else {
              clearInterval(intervalId); // Зупиняємо таймер
              io.to(room_code).emit('timerFinished'); // Повідомляємо про завершення
          }
      }, 1000);

      // Відправляємо початковий час всім гравцям у кімнаті
      io.to(room_code).emit('updateTimer', { timeLeft: roomTimers[room_code] });
  

  // Обробник для зупинки таймера
  socket.on('stopTimer', ({ room_code }) => {
      if (roomTimers[room_code]) {
          clearInterval(roomTimers[room_code]); // Зупиняємо інтервал
          delete roomTimers[room_code]; // Видаляємо таймер для кімнати
          io.to(room_code).emit('timerStopped'); // Повідомляємо про зупинку
      }
  });
  });
});

// Надсилання списку гравців
function sendRoomUpdate(room_code, rows) {
  const usedColors = rows.filter(p => p.color).map(p => p.color);
  console.log(usedColors); // Отримуємо список зайнятих кольорів
  io.to(room_code).emit('roomUpdate', {
    players: rows.map(p => ({ playerId: p.player_id, nickname: p.nickname, color: p.color })),
    usedColors // Передаємо список зайнятих кольорів
  });
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

