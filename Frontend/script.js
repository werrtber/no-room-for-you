function saveName(event) {
    const name = document.getElementById('name').value;
    localStorage.setItem('nickname', name); 
}
// document.getElementById('nameForm').addEventListener('submit', function(event) {
//     event.preventDefault(); // Запобігає перезавантаженню сторінки
//     const name = document.getElementById('name').value; // Отримуємо значення введеного імені
//     localStorage.setItem('nickname', name); // Зберігаємо ім'я в localStorage
//     window.location.href = "second-page.html";})

// if (window.location.pathname === '/second-page.html') {
//   // Отримуємо ім'я з localStorage
//   const nickname = localStorage.getItem('nickname');
  
//   // Якщо ім'я є, відображаємо його
//   if (nickname) {
//     document.getElementById('nickname').textContent = nickname;
//   } else {
//     document.getElementById('nickname').textContent = "Невідомий гравець"; // Якщо ім'я відсутнє
//   }
// }

let nickname = localStorage.getItem('nickname');
        
    if (nickname) {
            document.getElementById('nickname').textContent = nickname;
        }

const openBtn = document.getElementById("openModal")
const closeBtn = document.getElementById("closeModal")
const modal = document.getElementById("modal")

openBtn.addEventListener("click", () => {
    modal.classList.add("open");
});

closeBtn.addEventListener("click", () => {
    modal.classList.remove("open");
});
