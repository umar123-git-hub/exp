const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// GET all users
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users ORDER BY created_at DESC",
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new book
app.post("/users", async (req, res) => {
  try {
    const { title, author, category, stock } = req.body;

    const result = await pool.query(
      `INSERT INTO users (title, author, category, stock)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, author, category, stock],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Express server running");
});
