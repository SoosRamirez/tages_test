const fs = require('fs');

// Генерация случайной строки заданной длины
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Генерация файла с случайными строками
function generateFile(filename, numLines, lineLength) {
    const stream = fs.createWriteStream(filename);
    for (let i = 0; i < numLines; i++) {
        const randomString = generateRandomString(lineLength);
        stream.write(randomString + '\n');
    }
    stream.end();
}

// Пример использования
const filename = 'unsorted.txt';
const numLines = 1000000; // 1 миллион строк
const lineLength = 50; // Длина каждой строки
generateFile(filename, numLines, lineLength);
console.log(`Файл ${filename} сгенерирован успешно.`);