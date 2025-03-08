const fs = require('fs');
const mysql = require('mysql2/promise');

// Функція для завантаження даних з бази даних
const loadDataFromDB = async (connection, tableName, columnName) => {
    const [rows] = await connection.execute(`SELECT ${columnName} FROM ${tableName}`);
    return rows.map(row => row[columnName]);
};


// Визначення віку з вагами
const assignAgeWeighted = () => {
    const ageGroups = [
        { min: 18, max: 30, weight: 0.5 },
        { min: 31, max: 50, weight: 0.3 },
        { min: 51, max: 70, weight: 0.15 },
        { min: 71, max: 85, weight: 0.05 }
    ];

    const weights = ageGroups.map(group => group.weight);
    const randomIndex = weightedRandomIndex(weights);
    const chosenGroup = ageGroups[randomIndex];

    return getRandomInt(chosenGroup.min, chosenGroup.max);
};

// Вибір стАті
const assignGender = () => {
    return Math.random() < 0.5 ? "Чоловік" : "Жінка";
};

// Визначення здоров'я
const assignHealth = (healthConditions) => {
    return Math.random() < 0.25 ? "Здоровий" : getRandomElement(healthConditions);
};

// Вибір кількох предметів з рюкзака
const assignBackpackItems = (items, numItems = 2) => {
    return getRandomElements(items, numItems);
};

// Генерація картки з усіма характеристиками
const generateCardWithBackpack = (professions, skills, healthConditions, flaws, backpackItems) => {
    const age = assignAgeWeighted();
    const gender = assignGender();
    const profession = getRandomElement(professions);
    const skill = getRandomElement(skills);
    const health = assignHealth(healthConditions);
    const flaw = Math.random() < 0.3 ? getRandomElement(flaws) : 'Без вад';
    const backpack = assignBackpackItems(backpackItems, getRandomInt(2, 3));
    const childfreeStatus = Math.random() < 0.15 ? "Childfree" : "З дітьми";

    return {
        "Вік": age,
        "Стать": gender,
        "Професія": profession,
        "Навичка": skill,
        "Здоров’я": health,
        "Вада": flaw,
        "Предмети в рюкзаку": backpack,
        "Статус щодо дітей": childfreeStatus
    };
};

// Функція для збереження картки в файл
const saveCardToFile = (card, playerId) => {
    const content = Object.entries(card).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('\n');
    fs.writeFileSync(`card_${playerId}.txt`, content, 'utf-8');
};

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomElement = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

const getRandomElements = (array, count) => {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

const weightedRandomIndex = (weights) => {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const randomValue = Math.random() * totalWeight;
    let cumulativeWeight = 0;

    for (let i = 0; i < weights.length; i++) {
        cumulativeWeight += weights[i];
        if (randomValue < cumulativeWeight) {
            return i;
        }
    }

    return weights.length - 1; 
};

// Основна програма
const main = async () => {
    const connection = await mysql.createConnection({
        host: 'no-room-for-you-db.cfey08agccui.eu-north-1.rds.amazonaws.com',
        user: 'Whylek',
        password: 'honor129wer',
        database: 'no-room-for-you-db'
    });
    const professions = await loadDataFromDB(connection, 'job', 'job');
    const skills = await loadDataFromDB(connection, 'hobby', 'hobby');
    const healthConditions = await loadDataFromDB(connection, 'health', 'health');
    const flaws = await loadDataFromDB(connection, 'vada', 'vada');
    const backpackItems = await loadDataFromDB(connection, 'items', 'items');
    const story = await loadDataFromDB(connection, 'story', 'story');
    
    fs.writeFileSync('Astory.txt',  getRandomElement(story), 'utf-8');
    // Створення 6 карток і збереження їх у файли
    for (let playerId = 1; playerId <= 6; playerId++) {
        const card = generateCardWithBackpack(professions, skills, healthConditions, flaws, backpackItems);
        saveCardToFile(card, playerId);
        console.log(`Картка гравця ${playerId} збережена у файлі 'card_${playerId}.txt'`);
    }

    await connection.end();
};

main();