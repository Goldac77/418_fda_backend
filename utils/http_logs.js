import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logHttpRequest = (logData) => {
    const logFilePath = path.join(__dirname, '../logs/logs.txt');
    const formattedLog = JSON.stringify(logData, null, 2);

    fs.appendFile(logFilePath, `${formattedLog}\n`, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
};

export default logHttpRequest;