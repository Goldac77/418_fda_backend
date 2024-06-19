import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logFilePath = path.join(__dirname, '../logs/logs.txt');
const logContent = fs.readFileSync(logFilePath, 'utf8');

const sendLogCopy = async () => {
    try {
        const response = await axios.post(
            'https://api.github.com/gists',
            {
                description: '418_FDA_Logs',
                public: false,
                files: {
                    'logs.txt': {
                        content: logContent
                    }
                }
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