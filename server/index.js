require("dotenv").config();

const express = require("express");

const app = express();
const port = 5000;

app.get("/", (req, res) => {
    res.send("GET request working");
});

app.listen(port, "127.0.0.1", () => {
    console.log(`listening to port: ${port}`);
});