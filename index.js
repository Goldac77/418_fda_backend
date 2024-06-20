import express, { query } from "express";
import cors from 'cors';
import dotenv from "dotenv";
import { logBeforeShutdown, logsRequest } from "./utils/logs.js";
import executeQuery from "./utils/db_queryExecute.js";
import hashFunction from "./utils/hash.js";
import getLogs from "./utils/getLogs.js";
import checkRole from "./utils/authorization.js";

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

/*WHY ARE WE HERE, JUST TO SUFFER?!?!*/
//These endpoints require no authentication. They are just to ease database population
app.post("/roles", async (req, res) => {
    const { roleName } = req.body;
    try {
        const result = await executeQuery('insertOne', 'Role', { Role_Name: roleName });
        if(result == 409) {
            return res.status(409).json({message: "Role already exists"});
        }
        res.status(201).json({ message: 'Role created successfully', result });
    } catch (error) {
        console.error('Error creating role:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.post("/users", async (req, res) => {
    const { Password, Email, Role } = req.body;
    try {
        const role = await executeQuery('find', 'Role', { Role_Name: Role });
        if (role.length === 0) {
            return res.status(400).json({ error: 'Role not found' });
        }
        const hashPassword = hashFunction(Password);
        const result = await executeQuery('insertOne', 'User', { Password: hashPassword, Email, Role_ID: role[0].Role_ID });
        if(result == 409) {
            return res.status(409).json({message: "User already exists"});
        }
        res.status(201).json({ message: 'User created successfully', result });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.get("/roles", async(req, res) => {
    const roleData = await executeQuery("find", "Role", {}, null);
    res.json({roleData});
})

//DO NOT TOUCH THE CODE ABOVE, ELSE I'LL COME FOR YOU!!

//This retrieves all user data
app.get("/users/:userID", async (req, res) => {
    const { userID } = req.params;
    try {
        const accessLevel = checkRole(userID);
        const isNotAuthorized = accessLevel == "Asset Manager";
        if (isNotAuthorized) {
            return res.status(403).json({ message: "You aren't authorized" });
        } else {
            const userData = await executeQuery("find", "User", {}, userID);
            return res.status(200).json({ userData });
        }
    } catch (error) {
        console.log("Failed to get user data", error)
        return res.status(500).json({ error: error.message })
    }
})

//Get all assets
app.get("/assets/userID", async (req, res) => {
    const { userID } = req.params;
    try {
        const assets = await executeQuery("find", "Asset", {}, userID);
        return res.status(200).json({ assets });
    } catch (error) {
        console.error('Failed to retrieve assets:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
})

//Get logs
app.get("/logs/:userID", async (req, res) => {
    const { userID } = req.params;

    try {
        const accessLevel = checkRole(userID);
        const isNotAuthorized = accessLevel == "Department Head";
        if (isNotAuthorized) {
            return res.status(403).json({ message: "You aren't authorized" });
        } else {
            const logData = await getLogs();
            return res.status(200).json({ logData });
        }
    } catch (error) {
        console.log("Failed to get log data", error)
        return res.status(500).json({ error: error.message })
    }
})

//User authentication
app.post("/login", async (req, res) => {
    const { userID, password } = req.body;
    const hashPassword = hashFunction(password);

    try {
        const user = await executeQuery('find', 'User', { User_ID: userID });

        if (user.length === 0) {
            return res.status(401).json({ message: "Incorrect userID" });
        }

        // Compare hashed password with provided password
        const isPasswordMatch = hashPassword == user[0].Password;

        if (isPasswordMatch) {
            // Fetch role name using the role ID from the user
            const roleID = user[0].Role_ID;
            const role = await executeQuery("find", "Role", { Role_ID: roleID }, userID);
            return res.status(200).json({ message: "Login successful" }, { userID, role });
        } else {
            return res.status(401).json({ message: "Incorrect password" });
        }
    } catch (error) {
        console.error('Failed to verify user credentials:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
})

//Add asset 
app.post("/assets/userID", async (req, res) => {
    const { userID } = req.params;
    const { assetName, serialNumber, tagID, procurementDate, assetStatus } = req.body;
    try {

        const accessLevel = checkRole(userID);
        const isAuthorized = accessLevel == "Asset Manager" || accessLevel == "Admin";

        if (isAuthorized) {
            // Insert asset data into the database
            const status = await executeQuery("find", "AssetStatus", {Status_Name: assetStatus}, userID);
            if(!status) {
                return res.status(404).json({message: "Invalid Status"});
            }
            const result = await executeQuery('insertOne', 'Asset', {
                Tag_ID: tagID,
                Serial_Number: serialNumber,
                Asset_Name: assetName,
                Procurement_Date: procurementDate,
                Status_ID: status[0].Status_ID
            });

            if(result == 409) {
                return res.status(409).json({message: "Asset already exists"});
            }
            return res.status(201).json({ message: 'Asset added successfully', asset: result });
        } else {
            return res.status(403).json({ message: "You aren't authorized" });
        }
    } catch (error) {
        console.error('Error adding asset:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
})

//Endpoint to delete user
app.delete("/user/:userID/:targetUserID", async (req, res) => {
    const { userID, targetUserID } = req.params;

    try {
        const accessLevel = checkRole(userID);
        const isAuthorized = accessLevel == "Admin" || accessLevel == "Department Head";

        if (isAuthorized) {
            const userDeleted = await executeQuery("deleteOne", "User", {targetUserID}, userID);
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
app.delete("/asset/:userID/:targetAssetID", async (req, res) => {
    const { userID, targetAssetID } = req.params;

    try {
        const accessLevel = checkRole(userID);
        const isNotAuthorized = accessLevel == "Department Head";

        if (isNotAuthorized) {
            return res.status(403).json({ message: "You aren't authorized" });
        } else {
            const assetDeleted = await executeQuery("deleteOne", "Asset", {Asset_ID: targetAssetID}, userID);
            if (assetDeleted) {
                return res.status(200).json({ message: 'Asset deleted successfully' });
            } else {
                return res.status(404).json({ error: 'Asset not found' });
            }
        }
    } catch (error) {
        console.log('Failed to delete user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
})

//update user record
app.put("/user/:userID", async (req, res) => {
    const { userID } = req.params;
    const { newEmail, newRoleName, targetUserID } = req.body;

    try {
        const accessLevel = checkRole(userID);
        const isNotAuthorized = accessLevel == "Asset Manager";

        if (isNotAuthorized) {
            return res.status(403).json({ message: "You are not authorized to update user details" });
        }

        // Prepare update object with new user details
        const update = {};
        if (newEmail) update.Email = newEmail;
        if (newRoleID) update.Role_Name = newRoleName;

        // Update user details in the database
        const result = await executeQuery("updateOne", "Users", { User_ID: targetUserID }, { $set: update }, userID);
        
        // Check if any user was updated
        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "User not found or details unchanged" });
        }

        return res.status(200).json({ message: "User details updated successfully" });
    } catch (error) {
        console.error("Error updating user details:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port} \n@http://localhost:${port}`);
})

//backup copy of log before shutdown
process.on('SIGINT', async () => {
    await logBeforeShutdown();
});

process.on("SIGTERM", async () => {
    await logBeforeShutdown();
})