import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
const client = new MongoClient(process.env.DB_URL);

const createConnection = async() => {
    try {
        await client.connect();
        console.log("Connected to Database");
        return client;
    } catch(error) {
        console.error("Error connecting to database", error);
        throw error;
    }
}

export default createConnection;