import executeQuery from "./db_queryExecute.js";

const checkRole = async(userID) => {
    try {
        //I really hate that we need to make two DB queries for authorization
        // Fetch user to get the role ID
        const user = await executeQuery("find", "Users", { userID }, userID);
        if (user.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch role name using the role ID from the user
        const roleID = user[0].Role_ID;
        const role = await executeQuery("find", "Roles", { Role_ID: roleID }, userID);

        if (role.length === 0) {
            return res.status(404).json({ message: "Role not found" });
        }

        return role[0].Role_Name;
    } catch(error) {
        console.error("Error validating authorization", error);
    }
}

export default checkRole;