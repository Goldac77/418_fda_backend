import express, { query } from "express";
import cors from 'cors';
import dotenv from "dotenv";
import { logsRequest } from "./utils/logs.js";
import executeQuery from "./utils/db_queryExecute.js";
import hashFunction from "./utils/hash.js";

const app = express();
const port = 3000;

dotenv.config();

app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
    const httpLogData = {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
        timestamp: new Date().toISOString(),
    };
    logsRequest(httpLogData);
    next();
})

app.get("/", (req, res) => {
    res.status(200).send("Beep boop, server is active");
})

//This retrieves all user data
app.get("/users/:userID", async (req, res) => {
    const query = `
            SELECT Users.*, Roles.Role_Name
            FROM Users
            JOIN Roles ON Users.Role_ID = Roles.Role_ID
        `;

    try {
        const userData = await executeQuery(query, []);
        return res.status(200).json({ userData });
    } catch (error) {
        console.log("Failed to get user data", error)
        res.status(500).json({ error: error.message })
    }
})

//User authentication
app.post("/login", async(req, res) => {
    const {userID, password} = req.body;
    const query = `
        SELECT Users.User_ID, Users.User_Password, Roles.Role_Name
        FROM Users
        JOIN Roles ON Users.Role_ID = Roles.Role_ID
        WHERE Users.User_ID = ?
    `;

    const hashPassword = hashFunction(password);

    try {
        const results = await executeQuery(query, [userID]);
        if (results.length > 0) {
            const user = results[0];
            const isPasswordMatch = hashPassword == user.User_Password;
            if (isPasswordMatch) {
                delete user.User_Password;
                res.status(200).json({user});
            } else {
                res.status(401).json({message: "Incorrect password"})
            }
        } else {
            res.status(401).json({message: "Incorrect userID"})
        }
    } catch (error) {
        console.error('Failed to verify user credentials:', error);
        res.status(500).json({ error: error.message })
    }
})

app.listen(port, () => {
    console.log(`Server running on port ${port} \n@http://localhost:${port}`);
})