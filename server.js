const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Express server is running successfully!");
});
app.get("/check-config", (req, res) => {
  res.json({
    databaseUrlExists: !!process.env.DATABASE_URL,
    databaseUrlLength: process.env.DATABASE_URL?.length || 0,
    port: process.env.PORT,
  });
});
// Get all users
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("POSTGRES ERROR:", error);

    res.status(500).json({
      message: "Database error",
      error: error.message,
    });
  }
});
// Get all users

// Get all tasks
app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM tasks ORDER BY "createdAt" DESC`,
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("GET TASKS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
});
// Get all tasks

app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
  console.log("Express server running");
});
