import express from "express";
import cors from 'cors';
import dotenv from "dotenv";
import logHttpRequest from "./utils/http_logs.js";

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
    logHttpRequest(httpLogData);
    next();
})

app.get("/", (req, res) => {
    res.status(200).send("Beep boop, server is active");
})

app.listen(port, () => {
    console.log(`Server running on port ${port} \n@http://localhost:${port}`);
})