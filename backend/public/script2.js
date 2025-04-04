document.addEventListener("DOMContentLoaded", function () {
    const nicknameSpan = document.getElementById("nickname");
    const player_id = sessionStorage.getItem('player_id');
    fetch(`http://localhost:3000/api/get-nickname/${player_id}`) // Додано `/api` 
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
const openBtn = document.getElementById("openModal")
const closeBtn = document.getElementById("closeModal")
const modal = document.getElementById("modal")

openBtn.addEventListener("click", () => {
    modal.classList.add("open");
});

closeBtn.addEventListener("click", () => {
    modal.classList.remove("open");
});