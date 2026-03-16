const pool = require("./db");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());

app.use(cors({
  origin: "http://localhost:3000"
}));

app.get("/", (req, res) => {
  res.send("UniSwap backend running");
});

app.get("/listings", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM listings");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.listen(5001, () => {
  console.log("Server running on port 5001");
});