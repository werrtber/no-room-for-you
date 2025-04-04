document.addEventListener('DOMContentLoaded', () => {
    const prevButton = document.getElementById('prev-story');
    const nextButton = document.getElementById('next-story');
    const chooseButton = document.querySelector('.button'); // Кнопка "Обрати"
    let currentStoryId = 1; // Початкове значення історії

    const roomCode = sessionStorage.getItem('room_code'); // Отримуємо код кімнати з сесії

    if (!roomCode) {
        alert('Код кімнати не знайдено. Будь ласка, створіть кімнату спочатку.');
        return;
    }

    console.log('Отриманий room_code:', roomCode); // Логування

    // Функція для завантаження історії
    function loadStory(storyId) {
        fetch(`http://localhost:3000/api/stories/${storyId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Отримані дані про історію:', data); // Логування
                document.getElementById('history-title').innerHTML = data.historyTitle || 'Назва історії недоступна';
                document.getElementById('history-subtitle').innerHTML = data.historySubtitle || '';
                document.getElementById('story-name').innerHTML = `Історія №${data.id}`;
            })
            .catch(error => {
                console.error('Помилка при завантаженні історії:', error);
                document.getElementById('history-title').innerHTML = 'Помилка при завантаженні історії';
                document.getElementById('history-subtitle').style.display = 'none';
                document.getElementById('story-name').innerHTML = 'Номер історії недоступний';
            });
    }

    // Обробники подій для кнопок навігації
    prevButton.addEventListener('click', () => {
        if (currentStoryId > 1) {
            currentStoryId--;
            loadStory(currentStoryId);
        }
    });

    nextButton.addEventListener('click', () => {
        currentStoryId++;
        loadStory(currentStoryId);
    });

    // Обробник події для кнопки "Обрати"
    chooseButton.addEventListener('click', async (event) => {
        event.preventDefault(); // Зупиняємо стандартну поведінку форми

        try {
            const response = await fetch('http://localhost:3000/api/update-room-story', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    room_code: roomCode,
                    story_id: currentStoryId,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                
                window.location.href = 'fifth-page.html'; // Переходимо на п'яту сторінку
            } else {
                console.error('Помилка при виборі історії:', data.error);
                alert(`Помилка: ${data.error}`);
            }
        } catch (error) {
            console.error('Помилка при виборі історії:', error);
            alert('Сталася помилка. Будь ласка, спробуйте ще раз.');
        }
    });

    // Завантажуємо першу історію при завантаженні сторінки
    loadStory(currentStoryId);
});