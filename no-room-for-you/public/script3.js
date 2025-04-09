const playerSelect = document.querySelector('.number-of-players');
const playersList = document.getElementById('players-list');
let selectedColors = [];
let players = [];

function updatePlayers() {
    playersList.innerHTML = '';
    const numPlayers = parseInt(playerSelect.value);
    if (isNaN(numPlayers) || numPlayers <= 0) return;

    for (let i = 0; i < numPlayers; i++) {
        if (players[i]) {
            playersList.appendChild(players[i].playerDiv);
        } else {
            const playerDiv = createPlayerElement(`Гравець ${i + 1}`, `player-${i + 1}`);
            players.push({ playerDiv, playerText: `Гравець ${i + 1}`, playerColorLink: playerDiv.querySelector('.players-color') });
            playersList.appendChild(playerDiv);
        }
    }
    if (players.length > numPlayers) {
        players = players.slice(0, numPlayers);
    }
}

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

function openModal(playerElement) {
    const playerClass = playerElement.closest('.players').classList;
    if (playerClass.contains('player-1')) {
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
    if (window.selectedPlayerElement && window.selectedPlayerElement.closest('.players').classList.contains('player-1')) {
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
playerSelect.addEventListener('change', () => {
    const numPlayers = parseInt(playerSelect.value);
    updatePlayers();
    room_code = sessionStorage.getItem('room_code') || null;
    createOrUpdateRoom(numPlayers, room_code);
});


document.addEventListener("DOMContentLoaded", function () {
    const defaultNumPlayers = 6;
    playerSelect.value = defaultNumPlayers;
    updatePlayers();
    createOrUpdateRoom(defaultNumPlayers, null);

    const player_id = sessionStorage.getItem('player_id');
    fetch(`http://localhost:3000/api/get-nickname/${player_id}`)
        .then(response => response.json())
        .then(data => {
            const savedNickname = data.nickname;
            const firstPlayer = playersList.querySelector('.players');
            const firstPlayerText = firstPlayer.querySelector('.players-text');
            firstPlayerText.textContent = `${savedNickname || 'Гравець'}`;
            const firstPlayerColor = firstPlayer.querySelector('.players-color').style.backgroundColor || '#FFFFFF';
            const numPlayers = parseInt(playerSelect.value);
            sendPlayerData(savedNickname, firstPlayerColor, numPlayers);
        })
        .catch(error => {
            console.error("Помилка при отриманні нікнейму:", error);
        });
});

document.querySelector('.button2').addEventListener('click', function () {
    const link = "https://example.com";
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
  // Приклад посилання для копіювання, можна замінити на потрібне
  const link = "https://example.com"; 

  // Створюємо тимчасовий елемент input для копіювання в буфер обміну
  const tempInput = document.createElement('input');
  document.body.appendChild(tempInput);
  tempInput.value = link;
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);

  // Показуємо повідомлення
  const message = document.getElementById('copyMessage');
  message.style.display = 'block';

  // Сховати повідомлення через 2 секунди
  setTimeout(function() {
    message.style.display = 'none';
  }, 2000);
});
// script3.js
// ...
async function createOrUpdateRoom(playerNumber, roomCode) {
    try {
        const response = await fetch('http://localhost:3000/api/create-room', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                player_number: playerNumber,// Приклад: story_id за замовчуванням
                room_code: roomCode // Передаємо room_code, якщо він існує
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! Status: ${response.status} - ${errorData.error}`);
        }

        const data = await response.json();
        console.log('Результат:', data);

        if (data.room_code) {
            sessionStorage.setItem('room_code', data.room_code); // Зберігаємо room_code
        }
    } catch (error) {
        console.error('Помилка:', error.message || error);
    }

}

const openBtn = document.getElementById("openModal");
const closeBtn = document.getElementById("closeModal");
const modal = document.getElementById("modal");

openBtn.addEventListener("click", () => {
    modal.classList.add("open");
});

closeBtn.addEventListener("click", () => {
    modal.classList.remove("open");
});