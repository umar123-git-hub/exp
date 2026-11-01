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
// Get all books from PostgreSQL
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

app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
  console.log("Express server running");
});
