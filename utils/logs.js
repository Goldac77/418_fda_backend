import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import sendLogCopy from './sendLog.js';
import logArray from './renderLogs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logsRequest = (logData) => {
    const logFilePath = path.join(__dirname, '../logs/logs.txt');
    const formattedLog = JSON.stringify(logData, null, 2);

    logArray.push(formattedLog);

    fs.appendFile(logFilePath, `${formattedLog}\n`, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
};

const logBeforeShutdown = async() => {
    console.log("Shutdown/Restart incoming....... \nSending last log");
    await sendLogCopy();
}

export {logsRequest, logBeforeShutdown};
