import axios from 'axios';
import dotenv from 'dotenv';
import logArray from './localLogs.js';
dotenv.config();


const sendLogCopy = async () => {
    try {
        const files = JSON.stringify(logArray, null, 2);

        const response = await axios.post('https://api.github.com/gists',
            {
                description: '418_FDA_Logs',
                public: false,
                files: files
            },
            {
                headers: {
                    "Accept": "application/vnd.github.v3+json",
                    "Authorization": `Bearer ${process.env.GITHUB_AUTH}`,
                    "X-GitHub-Api-Version": "2022-11-28"
                }
            }
        );

        console.log('Log file uploaded to Gist:');
    } catch (error) {
        console.error('Error uploading log file to Gist:', error);
    }
}

export default sendLogCopy;