import logArray from './localLogs.js';
import executeQuery from './db_queryExecute.js';

const getLogs = async(userID) => {
    try {
        const remoteLogs = await getRemoteLog(userID);
        const localLogs = logArray;

        return { remoteLogs, localLogs };
    } catch(error) {
        console.log("Error getting logs", error)
    }
}

// get logs from database
const getRemoteLog = async(userID) => {
    const remoteLog = await executeQuery("find", "Logs", { }, userID);
    return remoteLog;
}

export default getLogs;