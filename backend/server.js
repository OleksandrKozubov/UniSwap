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

app.post("/listings", async (req, res) => {
  const { title, description, price, userId } = req.body;

  if (!title || !price || !userId) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO listings (title, description, price, user_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, description, price, userId]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating listing" });
  }
});

app.put("/listings/:id", async (req, res) => {
  const { title, description, price, userId } = req.body;

  try {
    const result = await pool.query(
      `UPDATE listings
       SET title=$1, description=$2, price=$3
       WHERE id=$4 AND user_id=$5
       RETURNING *`,
      [title, description, price, req.params.id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: "Not allowed" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update error" });
  }
});

app.delete("/listings/:id", async (req, res) => {
  const { userId } = req.body;

  try {
    const result = await pool.query(
      `DELETE FROM listings
       WHERE id=$1 AND user_id=$2`,
      [req.params.id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({ error: "Not allowed" });
    }

    res.json({ message: "Deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete error" });
  }
});

app.post("/update-profile", async (req, res) => {
  const { userId, name, university } = req.body;

  try {
    let query = "UPDATE users SET name = $1, university = $2 WHERE id = $3";

    await pool.query(query, [name, university, userId]);

    res.send("Updated");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating profile");
  }
});

app.post("/change-password", async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({ error: "All password fields are required" });
  }

  try {
    const userResult = await pool.query(
      "SELECT password FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const validPassword = await bcrypt.compare(
      oldPassword,
      userResult.rows[0].password
    );

    if (!validPassword) {
      return res.status(401).json({ error: "Old password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashedPassword, userId]
    );

    res.json({ message: "Password updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error changing password" });
  }
});

app.post("/register", async (req, res) => {
  const { email, name, university, password } = req.body;

if (!email || !name || !university || !password) {
  return res.status(400).json({ error: "All fields are required" });
}

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

if (!email || !password) {
  return res.status(400).json({ error: "Email and password required" });
}

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
