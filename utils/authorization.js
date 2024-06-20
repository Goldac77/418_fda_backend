import { ObjectId } from "mongodb";
import executeQuery from "./db_queryExecute.js";

const checkRole = async(userID) => {
    try {
        //I really hate that we need to make two DB queries for authorization
        // Fetch user to get the role ID
        const user = await executeQuery("find", "User", {_id: ObjectId.createFromHexString(userID) }, userID);
        if (user.length === 0) {
            return 404;
        }

        // Fetch role name using the role ID from the user
        const roleID = user[0].Role_ID;
        const role = await executeQuery("find", "Role", { _id: roleID }, userID);

        if (role.length === 0) {
            return 404;
        }

        return role[0].Role_Name;
    } catch(error) {
        console.error("Error validating authorization", error);
    }
}

export default checkRole;