const db = require('../db/db');

// Генератор унікального коду кімнати
function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}


async function getRoomByCode(room_code) {
    try {
        const pool = db();
        const [rows] = await pool.execute('SELECT * FROM room WHERE room_code = ?', [room_code]);
        return rows.length > 0 ? rows[0] : null; // Повертаємо кімнату або null
    } catch (error) {
        console.error('Помилка при отриманні кімнати:', error);
        throw error;
    }
}

exports.createRoom = async (req, res) => {
    const { player_number, room_code } = req.body;

    if (!player_number) {
        return res.status(400).json({ error: 'Кількість гравців є обов\'язковим полем!' });
    }

    try {
        const pool = db();

        // Перевіряємо, чи існує кімната за room_code
        let existingRoom = null;
        if (room_code) {
            existingRoom = await getRoomByCode(room_code);
        }

        if (existingRoom) {
            // Якщо кімната існує, оновлюємо її
            await pool.execute(
                'UPDATE room SET player_number = ? WHERE room_code = ?',
                [player_number, room_code]
            );

            return res.status(200).json({
                message: 'Кімната успішно оновлена!',
                room_code,
                room_id: existingRoom.id
            });
        } else {
            // Якщо кімнати немає, створюємо нову
            const newRoomCode = generateRoomCode();
            const [result] = await pool.execute(
                'INSERT INTO room (room_code, player_number) VALUES (?, ?)',
                [newRoomCode, player_number]
            );

            if (result.insertId) {
                return res.status(200).json({
                    message: 'Кімната успішно створена!',
                    room_code: newRoomCode,
                    room_id: result.insertId
                });
            } else {
                return res.status(500).json({ error: 'Не вдалося створити кімнату.' });
            }
        }
    } catch (error) {
        console.error('Помилка при створенні/оновленні кімнати:', error);
        return res.status(500).json({ error: 'Помилка сервера.' });
    }
};


// exports.updateRoom = async (req, res) => {
//     const { room_code, player_number, story_id } = req.body;

//     if (!room_code || !player_number || !story_id) {
//         return res.status(400).json({ error: 'Всі поля (room_code, player_number, story_id) є обов\'язковими!' });
//     }

//     try {
//         const pool = db();

//         // Оновлюємо дані кімнати
//         const [result] = await pool.execute(
//             'UPDATE room SET player_number = ?, story_id = ? WHERE room_code = ?',
//             [player_number, story_id, room_code]
//         );

//         if (result.affectedRows > 0) {
//             return res.status(200).json({ message: 'Кімната успішно оновлена!', room_code });
//         } else {
//             return res.status(404).json({ error: 'Кімната не знайдена.' });
//         }
//     } catch (error) {
//         console.error('Помилка при оновленні кімнати:', error);
//         return res.status(500).json({ error: 'Помилка сервера.' });
//     }
// };