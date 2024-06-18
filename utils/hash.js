import crypto from "node:crypto";

const hashFunction = (input) => {
    return crypto.createHash("sha256").update(input).digest("hex");
}

export default hashFunction;