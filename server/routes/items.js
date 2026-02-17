const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all items
router.get("/", (req, res) => {
  db.query("SELECT * FROM items", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});

// GET item by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM items WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.json(results[0]);
  });
});

module.exports = router;