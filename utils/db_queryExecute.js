import createConnection from "./db_connection.js";

const executeQuery = async (query, params) => {
    const connection = createConnection();
    
    try {
        await new Promise((resolve, reject) => {
            connection.connect((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        const results = await new Promise((resolve, reject) => {
            connection.query(query, params, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        return results;
    } finally {
        await new Promise((resolve, reject) => {
            connection.end((err) => {
                if (err) {
                    console.error('Error closing connection:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
};

export default executeQuery;