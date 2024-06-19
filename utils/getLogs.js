import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
import logArray from './renderLogs.js';

const getLogs = async() => {
    try {
        const response = await axios.get("https://api.github.com/gists", {
            headers: {
                "Accept": "application/vnd.github.v3+json",
                "Authorization": `Bearer ${process.env.GITHUB_AUTH}`,
                "X-GitHub-Api-Version": "2022-11-28"
            }
        })

        return console.log({remoteLogs: getRemoteLogUrl(response.data)}, {localLogs: logArray});
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