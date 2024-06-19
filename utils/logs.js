import sendLogCopy from './sendLog.js';
import logArray from './localLogs.js';

const logsRequest = (logData) => {
    logArray.push(logData);
};

const logBeforeShutdown = async() => {
    console.log("Shutdown/Restart incoming....... \nSending last log");
    await sendLogCopy();
}

export {logsRequest, logBeforeShutdown};
