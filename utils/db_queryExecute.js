import createConnection from "./db_connection.js";
import dotenv from "dotenv";
import {logsRequest} from './logs.js'

dotenv.config();

const executeQuery = async (query, params, userID) => {
    const connection = createConnection();
    
    try {
        await new Promise((resolve, reject) => {
            connection.connect((err) => {
                if (err) {
                    console.log("Failed to connect to database");
                    reject(err);
                } else {
                    console.log(`Connected to ${process.env.DB_NAME} database`);
                    resolve();
                }
            });
        });

        const results = await new Promise((resolve, reject) => {
            connection.query(query, params, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    const logData = {
                        userID,
                        query,
                        params,
                        timestamp: new Date().toISOString()
                    };
                    logsRequest(logData);
                    resolve(results);
                }
            });
        });

        return results;
    } finally {
        await new Promise((resolve, reject) => {
            connection.end((err) => {
                if (err) {
                    console.error('Error closing connection:', err);
                    reject(err);
                } else {
                    console.log("Database connection closed")
                    resolve();
                }
            });
        });
    }
};

export default executeQuery;