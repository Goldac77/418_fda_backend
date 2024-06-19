import executeQuery from "./db_queryExecute.js"

const accessCheck = async(userID) => {
    const query = `
        SELECT Roles.Role_Name
        FROM Users
        JOIN Roles ON Users.Role_ID = Roles.Role_ID
        WHERE Users.User_ID = ?
    `;

    try {
        const results = await executeQuery(query, [userID], userID);
        if (results.length > 0) {
            return results[0].Role_Name;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Failed to get user role:', error);
        throw error;
    }
}

export default accessCheck;