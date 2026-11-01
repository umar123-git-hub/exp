const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Express server is running successfully!");
});
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

app.listen(process.env.PORT || 3000, () => {
  console.log("Express server running");
});
