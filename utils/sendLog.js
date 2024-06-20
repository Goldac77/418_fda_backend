import logArray from './localLogs.js';
import executeQuery from './db_queryExecute.js';


const sendLogCopy = async () => {
    try {
        await executeQuery("insertOne", "Logs", {Content: JSON.stringify(logArray)}, null);
        console.log('Log file uploaded to database');
    } catch (error) {
        console.error('Error uploading log file to database', error);
    }
}

export default sendLogCopy;