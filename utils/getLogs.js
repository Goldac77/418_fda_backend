import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
import logArray from './localLogs.js';

const getLogs = async() => {
    try {
        const response = await axios.get("https://api.github.com/gists", {
            headers: {
                "Accept": "application/vnd.github.v3+json",
                "Authorization": `Bearer ${process.env.GITHUB_AUTH}`,
                "X-GitHub-Api-Version": "2022-11-28"
            }
        })

        const remoteLogs = getRemoteLogUrl(response.data);
        const localLogs = logArray;

        return { remoteLogs, localLogs };
    } catch(error) {
        console.log("Error getting logs", error)
    }
}

function getRemoteLogUrl(data) {
    const result = []
    for(const i of data) {
        result.push(i.html_url);
    }

    return result;
    
}

export default getLogs;