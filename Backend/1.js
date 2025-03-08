const mysql = require('mysql2/promise');
const fs = require('fs').promises;

async function main() {
    // З'єднання з базою даних
    const connection = await mysql.createConnection({
        host: 'no-room-for-you-db.cfey08agccui.eu-north-1.rds.amazonaws.com',
        user: 'Whylek',
        password: 'honor129wer',
        database: 'no-room-for-you-db'
    });

    // Зчитування файлу
    const data = await fs.readFile('./csv/vadaostap.csv', 'utf-8');
    
    // Обробка даних: розбиваємо файл на рядки і далі на колонки
    const rows = data.split('\n').map(line => line.trim().split('. '));

    // Вставка даних у базу
    for (const [id, value] of rows) {
        await connection.execute(`INSERT INTO vada VALUES (?, ?)`, [parseInt(id), value]);
    }

    console.log('Дані успішно вставлено!');
    await connection.end();
}

async function show() {
    const connection = await mysql.createConnection({
        host: 'no-room-for-you-db.cfey08agccui.eu-north-1.rds.amazonaws.com',
        user: 'Whylek',
        password: 'honor129wer',
        database: 'no-room-for-you-db'
    });

    // const x = await connection.execute('SELECT * FROM items');
    // console.log(x)

}

main().catch(console.error);

//show()
