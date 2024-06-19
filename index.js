import express, { query } from "express";
import cors from 'cors';
import dotenv from "dotenv";
import { logBeforeShutdown, logsRequest } from "./utils/logs.js";
import executeQuery from "./utils/db_queryExecute.js";
import hashFunction from "./utils/hash.js";
import accessCheck from "./utils/accessCheck.js";

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
    return res.status(200).send("Beep boop, server is active");
})

//This retrieves all user data
app.get("/users/:userID", async (req, res) => {
    const { userID } = req.params;
    const query = `
            SELECT Users.*, Roles.Role_Name
            FROM Users
            JOIN Roles ON Users.Role_ID = Roles.Role_ID
        `;

    try {
        const isNotAuthorized = await accessCheck(userID) == "Asset Manager";
        if (isNotAuthorized) {
            return res.status(403).json({ message: "You aren't authorized" });
        } else {
            const userData = await executeQuery(query, [], userID);
            return res.status(200).json({ userData }); 
        }
    } catch (error) {
        console.log("Failed to get user data", error)
        return res.status(500).json({ error: error.message })
    }
})

//Get all assets
app.get("/assets/userID", async (req, res) => {
    const {userID} = req.params;
    const query = `SELECT * FROM Assets`;
    try {
        const assets = await executeQuery(query, [], userID);
        return res.status(200).json({assets});
    } catch (error) {
        console.error('Failed to retrieve assets:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
})

//User authentication
app.post("/login", async (req, res) => {
    const { userID, password } = req.body;
    const query = `
        SELECT Users.User_ID, Users.User_Password, Roles.Role_Name
        FROM Users
        JOIN Roles ON Users.Role_ID = Roles.Role_ID
        WHERE Users.User_ID = ?
    `;

    const hashPassword = hashFunction(password);

    try {
        const results = await executeQuery(query, [userID], null);
        if (results.length > 0) {
            const user = results[0];
            const isPasswordMatch = hashPassword == user.User_Password;
            if (isPasswordMatch) {
                delete user.User_Password;
                return res.status(200).json({ user });
            } else {
                return res.status(401).json({ message: "Incorrect password" })
            }
        } else {
            return res.status(401).json({ message: "Incorrect userID" })
        }
    } catch (error) {
        console.error('Failed to verify user credentials:', error);
        return res.status(500).json({ error: error.message })
    }
})

//Add asset 
app.post("/assets/userID", async(req, res) => {
    const {userID} = req.params;
    const query = ``
})

//Endpoint to delete user
app.delete("/user/:userID/:targetUserID", async (req, res) => {
    const { userID, targetUserID } = req.params;
    query = `DELETE FROM Users WHERE User_ID = ?`;

    try {
        const isAuthorized = await accessCheck(userID) == "Admin" || await accessCheck(userID) == "Department Head";

        if (isAuthorized) {
            const userDeleted = await executeQuery(query, [targetUserID], userID);
            if (userDeleted) {
                return res.status(200).json({ message: 'User deleted successfully' });
            } else {
                return res.status(404).json({ error: 'User not found' });
            }
        } else {
            return res.status(403).json({ message: "You aren't authorized" });
        }
    } catch (error) {
        console.log('Failed to delete user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
})

//Endpoint to delete asset
app.delete("/user/:userID/:targetAssetID", async (req, res) => {
    const { userID, targetAssetID } = req.params;
    query = `DELETE FROM Assets WHERE Asset_ID = ?`;

    try {
        const isNotAuthorized = await accessCheck(userID) == "Department Head";

        if (isNotAuthorized) {
            return res.status(403).json({ message: "You aren't authorized" });
        } else {
            const userDeleted = await executeQuery(query, [targetAssetID], userID);
            if (userDeleted) {
                return res.status(200).json({ message: 'User deleted successfully' });
            } else {
                return res.status(404).json({ error: 'User not found' });
            }
        }
    } catch (error) {
        console.log('Failed to delete user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
})

app.listen(port, () => {
    console.log(`Server running on port ${port} \n@http://localhost:${port}`);
})

//backup copy of log before shutdown
process.on('SIGINT', async () => {
    await logBeforeShutdown();
});

process.on("SIGTERM", async() => {
    await logBeforeShutdown();
})