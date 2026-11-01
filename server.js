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
app.get("/users", (req, res) => {
  res.json({ message: "Users endpoint working!" });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Express server running");
});
