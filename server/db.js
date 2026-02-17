require("dotenv").config();
const mysql = require("mysql2");

const connection = mysql.createConnection({
  socketPath: "/run/mysqld/mysqld.sock",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error("DB connection failed:", err);
  } else {
    console.log("Connected to MariaDB via socket");
  }
});

module.exports = connection;