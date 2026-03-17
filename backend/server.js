const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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

app.get("/listings/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM listings WHERE id = $1",
      [req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching listing");
  }
});

app.post("/update-profile", async (req, res) => {
  const { name, university, password } = req.body;

  try {
    let query = "UPDATE users SET name = $1, university = $2 WHERE id = 1";

    await pool.query(query, [name, university]);

    res.send("Updated");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating profile");
  }
});

app.post("/register", async (req, res) => {
  const { email, name, university, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (email, name, university, password) VALUES ($1,$2,$3,$4) RETURNING id,email",
      [email, name, university, hashedPassword]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).send("Registration error");
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {

    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(401).send("User not found");
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!validPassword) {
      return res.status(401).send("Invalid password");
    }

    const token = jwt.sign(
      { userId: user.rows[0].id },
      "secretkey",
      { expiresIn: "24h" }
    );

    res.json({
  token,
  user: {
    id: user.rows[0].id,
    name: user.rows[0].name,
    email: user.rows[0].email
  }
});

  } catch (err) {
    console.error(err);
    res.status(500).send("Login error");
  }
});

app.listen(5001, () => {
  console.log("Server running on port 5001");
});