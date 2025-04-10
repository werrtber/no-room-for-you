function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
document.addEventListener("DOMContentLoaded", function () {
    const nicknameSpan = document.getElementById("nickname");

    const player_id = sessionStorage.getItem('player_id');
    fetch(`http://localhost:3000/api/get-nickname/${player_id}`)
        .then(response => {
            if (!response.ok) throw new Error('Помилка сервера');
            return response.json();
        })
        .then(data => {
            const savedNickname = data.nickname;
            nicknameSpan.textContent = savedNickname || "Гравець";
        })
        .catch(error => {
            console.error("❌ Помилка при отриманні нікнейму:", error);
            nicknameSpan.textContent = "Гравець";
        });
});

const openBtn = document.getElementById("openModal");
const closeBtn = document.getElementById("closeModal");
const modal = document.getElementById("modal");
const urlInput = document.querySelector(".url-input");
const modalMessage = document.createElement("p");

document.querySelector('.url-container').appendChild(modalMessage);

// ✅ Кнопка "СТВОРИТИ"
document.querySelector('.buttons-main button').addEventListener("click", () => {
    sessionStorage.setItem('is_host', 'true'); // <- головна зміна
    // Якщо у тебе буде генерація коду — збережи його тут
    sessionStorage.setItem('room_code', generatedRoomCode);
});

// ✅ Кнопка "ПРИЄДНАТИСЯ"
openBtn.addEventListener("click", () => {
    modal.classList.add("open");
});

closeBtn.addEventListener("click", () => {
    modal.classList.remove("open");
    modalMessage.textContent = '';
});

const submitBtn = document.querySelectorAll(".modal-button")[1];

submitBtn.addEventListener("click", () => {
    const inputValue = urlInput.value.trim();

    if (inputValue.length !== 6) {
        modalMessage.textContent = 'Код повинен складатися з 6 символів!';
        return;
    }

    modalMessage.textContent = '';

    fetch('http://localhost:3000/api/find-room', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            room_code: inputValue,
            player_id: sessionStorage.getItem('player_id')
        })
    })
        .then(response => {
            if (!response.ok) throw new Error('Помилка при перевірці коду');
            return response.json();
        })
        .then(data => {
            if (data.valid) {
                sessionStorage.setItem('room_code', inputValue);
                sessionStorage.setItem('is_host', 'false'); // <- додано

                window.location.href = 'third-page.html';
            } else {
                modalMessage.textContent = 'Невірний код. Спробуйте ще раз.';
            }
        })
        .catch(error => {
            console.error("❌ Помилка при перевірці коду:", error);
            modalMessage.textContent = 'Сталася помилка при перевірці коду.';
        });
});




