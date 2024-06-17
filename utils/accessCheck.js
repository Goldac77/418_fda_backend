import executeQuery from "./db_queryExecute.js"

const accessCheck = async(userID) => {
    const query = `
        SELECT Users.User_ID, Users.Role_ID, Roles.Role_Name
        FROM Users
        JOIN Roles ON Users.Role_ID = Roles.Role_ID
        WHERE Users.User_ID = ?
    `;

    try {
        const results = await executeQuery(query, [userID]);
        if (results.length > 0) {
            const userRole = results[0];
            switch(userRole) {
                case "Admin":
                    return userRole
                    break;
                case "Asset Manager":
                    return userRole
                    break;
                case "IT Support":
                    return userRole
                    break;
                case "Department Head":
                    return userRole
                    break;
            }
        } else {
            return { message: 'User not found' };
        }
    } catch (error) {
        console.error('Failed to get user role:', error);
        throw error;
    }
}

export default accessCheck;