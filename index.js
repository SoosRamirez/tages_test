const fs = require('fs');
const readline = require('readline');
const { promisify } = require('util');

const TEMP_DIR = './temp';

async function readBlock(file, blockSize) {
    const block = [];
    for (let i = 0; i < blockSize; i++) {
        const line = await file[Symbol.asyncIterator]().next();
        if (line.done) break;
        block.push(line.value);
    }
    return block;
}

async function writeBlock(block, file) {
    for (const line of block) {
        await file.write(line+'\n');
    }
}

async function externalSort(inputFilename, outputFilename, memoryLimit) {
    if (!fs.existsSync(TEMP_DIR)) {
        fs.mkdirSync(TEMP_DIR);
    }

    const tempFiles = [];
    const input = fs.createReadStream(inputFilename);
    const inputReader = readline.createInterface({ input });
    let block = await readBlock(inputReader, memoryLimit);
    while (block.length > 0) {
        block.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
        const tempFilename = `${TEMP_DIR}/temp_${tempFiles.length}.txt`;
        const tempOutput = fs.createWriteStream(tempFilename);
        await writeBlock(block, tempOutput);
        tempFiles.push(tempFilename);
        block = await readBlock(inputReader, memoryLimit);
    }

    const output = fs.createWriteStream(outputFilename);
    const heap = [];
    for (const tempFilename of tempFiles) {
        const tempInput = fs.createReadStream(tempFilename);
        const tempReader = readline.createInterface({ input: tempInput });
        const line = await tempReader[Symbol.asyncIterator]().next();
        if (!line.done) {
            heap.push({ line: line.value, reader: tempReader });
        } else {
            tempInput.close();
            fs.unlinkSync(tempFilename);
        }
    }
    heap.sort((a, b) => a.line.localeCompare(b.line, 'en', { sensitivity: 'base' }));
    while (heap.length > 0) {
        const { line, reader } = heap.shift();
        output.write(line + '\n');
        const nextLine = await reader[Symbol.asyncIterator]().next();
        if (!nextLine.done) {
            heap.push({ line: nextLine.value, reader });
            heap.sort((a, b) => a.line.localeCompare(b.line, 'en', { sensitivity: 'base' }));
        } else {
            reader.close();
        }
    }

    fs.rmdirSync(TEMP_DIR, { recursive: true });
}

const inputFilename = 'unsorted.txt';
const outputFilename = 'sorted.txt';
const memoryLimit = 500 * 1024 * 1024; // 500 МБ
externalSort(inputFilename, outputFilename, memoryLimit);
