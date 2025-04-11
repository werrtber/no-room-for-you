// Socket.IO підключення
const socket = io('http://localhost:3000');

const room_code = sessionStorage.getItem('room_code');
const player_id = sessionStorage.getItem('player_id');
const isHost = sessionStorage.getItem('is_host') === 'true';
console.log(sessionStorage.getItem('room_code'));
console.log(sessionStorage.getItem('player_id'));
socket.on('connect', () => {
    console.log('🟢 Підключено до сервера. Socket ID:', socket.id);

    // Вхід у кімнату
    console.log( sessionStorage.getItem('room_code'), player_id);
    socket.emit('joinRoom', { room_code, player_id });
});

let playerPosition = null;

// Обробка відповіді на приєднання
socket.on('roomJoined', ({ position, playersInRoom }) => {
    console.log(`📦 Ви — Гравець ${position}`);
    playerPosition = position;

    if (playerPosition !== 1) {
        document.querySelector('.number-of-players').disabled = true;
        const startButton = document.querySelectorAll('.all-button button')[1];
        if (startButton) startButton.disabled = true;
    }
    console.log('Гравці в кімнаті: ' + playersInRoom)
});

// Обробка оновлення списку гравців кімнати
socket.on('roomUpdate', (players) => {
    // Очищуємо список гравців
    // const ids = players.map(player => player.player_id);
    // console.log('Players: ' + ids);
    playersList.innerHTML = "";
    console.log('smth' + players);
    // Для кожного гравця встановлюємо позицію (індекс + 1)
    for(let i = 0; i < players.length; i++){
        const player_id = players[i].player_id;
        const nickname = players[i].nickname;
        //const pos = players[i].position;
        const name = (sessionStorage.getItem('player_id') === player_id) ? `Ви (${nickname})` : nickname;
        const playerDiv = createPlayerElement(name, `player-${i+1}`);
        playersList.appendChild(playerDiv);
    }
    // players.forEach((player_id, nickname, pos) => {
    //      //const pos = idx + 1;
    //      // Якщо потрібно – можна витягнути нікнейми із додаткових даних, тут поки що базово:
    //      const name = (sessionStorage.getItem('player_id') === player_id) ? `Ви (${nickname})` : nickname;
    //      const playerDiv = createPlayerElement(name, `player-${pos}`);
    //      playersList.appendChild(playerDiv);
    // });
});

// Використовувані DOM-елементи
const playerSelect = document.querySelector('.number-of-players');
const playersList = document.getElementById('players-list');
let selectedColors = [];
let players = [];

// Функція, що створює елемент гравця
function createPlayerElement(playerName, playerClass) {
    const playerDiv = document.createElement('div');
    playerDiv.classList.add('players', playerClass);
    const playerText = document.createElement('span');
    playerText.classList.add('players-text');
    playerText.textContent = playerName;
    const playerColorButton = document.createElement('button');
    playerColorButton.classList.add('players-color');
    playerColorButton.setAttribute('title', '');
    playerColorButton.textContent = '';
    playerColorButton.onclick = function () {
        openModal(playerColorButton);
    };
    playerDiv.appendChild(playerText);
    playerDiv.appendChild(playerColorButton);
    return playerDiv;
}

// Функція відкриття модального вікна для вибору кольору
function openModal(playerElement) {
    // Тепер дозволяємо змінювати колір лише для свого елемента, тобто для гравця, що відповідає отриманій позиції
    const playerClasses = playerElement.closest('.players').classList;
    // Приклад: якщо ви – гравець 1, тоді тільки елементи з класом "player-1" можуть змінювати колір
    if (playerClasses.contains(`player-${playerPosition}`)) {
        window.selectedPlayerElement = playerElement;
        document.getElementById('colorModal').style.display = 'block';
    } else {
        alert('Ви не можете змінювати колір іншого гравця!');
    }
}

function closeModal() {
    document.getElementById('colorModal').style.display = 'none';
}

function selectColor(color) {
    if (window.selectedPlayerElement && window.selectedPlayerElement.closest('.players').classList.contains(`player-${playerPosition}`)) {
        if (!selectedColors.includes(color)) {
            window.selectedPlayerElement.style.backgroundColor = color;
            selectedColors.push(color);
            updateColorButtons();
            const numPlayers = parseInt(playerSelect.value);
            sendPlayerData(window.selectedPlayerElement.closest('.players').querySelector('.players-text').textContent, color, numPlayers);
            closeModal();
        } else {
            alert('Цей колір вже вибрали!');
        }
    }
}

function updateColorButtons() {
    const colorButtons = document.querySelectorAll('.color-button');
    colorButtons.forEach(button => {
        const buttonColor = button.style.backgroundColor;
        if (selectedColors.includes(buttonColor)) {
            button.disabled = true;
            button.style.backgroundColor = '#D9D9D9';
            button.style.borderColor = '#B0B0B0';
            button.style.cursor = 'not-allowed';
        } else {
            button.disabled = false;
            button.style.backgroundColor = buttonColor;
            button.style.borderColor = buttonColor;
            button.style.cursor = 'pointer';
        }
    });
    const playerElements = document.querySelectorAll('.players-color');
    playerElements.forEach(playerElement => {
        const playerColor = playerElement.style.backgroundColor;
        if (selectedColors.includes(playerColor)) {
            playerElement.style.backgroundColor = '#D9D9D9';
        }
    });
}

function sendPlayerData(playerName, playerColor, numPlayers) {
    fetch('http://localhost:3000/api/save-player-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            player_id: sessionStorage.getItem('player_id'),
            color: playerColor,
            numPlayers: numPlayers,
        }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Дані успішно відправлені на сервер:', data);
        })
        .catch(error => {
            console.error('Помилка при відправці даних:', error);
        });
}

// Якщо змінюється кількість гравців — лише хост оновлює кімнату
playerSelect.addEventListener('change', () => {
    const numPlayers = parseInt(playerSelect.value);
    if (isHost) {

            updateRoom(numPlayers, sessionStorage.getItem('room_code'));
          
          
    }
});

// При завантаженні сторінки запускається початкове формування списку (для хоста)
document.addEventListener("DOMContentLoaded", function () {
    
    const room_code = sessionStorage.getItem('room_code');
    console.log(room_code);
    // if (isHost) {
    //     if (!room_code) {
           
    //       } else {
    //         updateRoom(defaultNumPlayers, room_code);
    //       }
          
    // }

    const player_id = sessionStorage.getItem('player_id');
    console.log(player_id);
    fetch(`http://localhost:3000/api/get-nickname/${player_id}`)
        .then(response => response.json())
        .then(data => {
            const savedNickname = data.nickname;
            // Тут хост формує початковий елемент. Подальше оновлення буде через roomUpdate
            const firstPlayer = playersList.querySelector('.players');
            if(firstPlayer){
                const firstPlayerText = firstPlayer.querySelector('.players-text');
                firstPlayerText.textContent = `${savedNickname || 'Гравець'}`;
                const firstPlayerColor = firstPlayer.querySelector('.players-color').style.backgroundColor || '#FFFFFF';
                const numPlayers = parseInt(playerSelect.value);
                sendPlayerData(savedNickname, firstPlayerColor, numPlayers);
            }
        })
        .catch(error => {
            console.error("Помилка при отриманні нікнейму:", error);
        });
});

// Логіка копіювання запрошення
document.querySelector('.button2').addEventListener('click', function () {
    const link = "https://example.com"; // Замініть на реальне посилання
    const tempInput = document.createElement('input');
    document.body.appendChild(tempInput);
    tempInput.value = link;
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    const message = document.getElementById('copyMessage');
    message.style.display = 'block';
    setTimeout(function () {
        message.style.display = 'none';
    }, 2000);
});
document.querySelector('.button2').addEventListener('click', function() {
    const link = "https://example.com"; 
    const tempInput = document.createElement('input');
    document.body.appendChild(tempInput);
    tempInput.value = link;
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    const message = document.getElementById('copyMessage');
    message.style.display = 'block';

    setTimeout(function() {
        message.style.display = 'none';
    }, 2000);
});

// Функція createOrUpdateRoom викликається лише для хоста

  async function updateRoom(playerNumber, roomCode) {
    try {
      const response = await fetch('http://localhost:3000/api/update-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          player_number: playerNumber,
          room_code: roomCode
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! Status: ${response.status} - ${errorData.error}`);
      }
  
      const data = await response.json();
      console.log('🔄 Кімнату оновлено:', data);
  
    //   if (data.room_code) {
    //     sessionStorage.setItem('room_code', data.room_code);
    //   }
    } catch (error) {
      console.error('❌ Помилка оновлення кімнати:', error.message || error);
    }
  }
    

// Логіка модального вікна з правилами
const openBtn = document.getElementById("openModal");
const closeBtn = document.getElementById("closeModal");
const modal = document.getElementById("modal");

openBtn.addEventListener("click", () => {
    modal.classList.add("open");
});

closeBtn.addEventListener("click", () => {
    modal.classList.remove("open");
});
