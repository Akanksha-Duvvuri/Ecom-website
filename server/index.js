require("dotenv").config();

const express = require("express");
const cors = require("cors");
const itemsRoute = require("./routes/items");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/items", itemsRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});