import createConnection from "./db_connection.js";
import dotenv from "dotenv";
import { logsRequest } from './logs.js'

dotenv.config();

const executeQuery = async (operation, collectionName, params, userID) => {
    const client = await createConnection();
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(collectionName); //Similar to mysql table

    try {
        let results;
        let exists;

        switch (operation) {
            case 'find':
                results = await collection.find(params).toArray();
                break;
            case 'insertOne':
                exists = await collection.find(params).toArray();
                if (exists.length > 0) {
                    console.log("Data already exists");
                    return 409
                }
                results = await collection.insertOne(params);
                break;
            case 'updateOne':
                results = await collection.updateOne(params.filter, params.update);
                break;
            case 'deleteOne':
                results = await collection.deleteOne(params);
                break;
            case 'aggregate':
                results = await collection.aggregate(params).toArray();
                break;
            default:
                throw new Error(`Unsupported operation: ${operation}`);
        }

        const logData = {
            userID,
            operation,
            collectionName,
            params,
            timestamp: new Date().toISOString()
        };
        logsRequest(logData);

        return results;
    } catch (error) {
        console.error('Error executing query:', error);
        throw error;
    } finally {
        console.log("Closing database connection");
        await client.close();
    }
};

export default executeQuery;