import sendLogCopy from './sendLog.js';

const logsRequest = (logData) => {
    logArray.push(logData);
};

const logBeforeShutdown = async() => {
    console.log("Shutdown/Restart incoming....... \nSending last log");
    await sendLogCopy();
}

export {logsRequest, logBeforeShutdown};
