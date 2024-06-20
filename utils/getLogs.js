import logArray from './localLogs.js';
import executeQuery from './db_queryExecute.js';

const getLogs = async() => {
    try {
        const remoteLogs = await getRemoteLog();
        const localLogs = logArray;

        return { remoteLogs, localLogs };
    } catch(error) {
        console.log("Error getting logs", error)
    }
}

// get logs from database
const getRemoteLog = async() => {
    const remoteLog = await executeQuery("find", "Logs", { }, userID);
    return remoteLog;
}

export default getLogs;