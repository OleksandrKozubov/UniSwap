const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const express = require("express");
const cors = require("cors");
const upload = require("./multer");


const app = express();

app.use(express.json());

app.use(cors({
  origin: "http://localhost:3000"
}));

app.post("/upload", upload.single("image"), (req, res) => {
  res.json({ imageUrl: req.file.path });
});

// Simple health check so the frontend or a browser can confirm the API is up.
app.get("/", (req, res) => {
  res.send("UniSwap backend running");
});

async function getListingImages(listing) {
  const imageRows = await pool.query(
    "SELECT id, image_url FROM listing_images WHERE listing_id = $1 ORDER BY id ASC",
    [listing.id]
  );

  const images = [...imageRows.rows];

  if (
    listing.image_url &&
    !images.some(image => image.image_url === listing.image_url)
  ) {
    images.unshift({
      id: `legacy-${listing.id}`,
      image_url: listing.image_url,
      is_legacy: true
    });
  }

  return images;
}

// Return every listing so the home page can render the marketplace feed.
app.get("/listings", async (req, res) => {
  const { search, category, location, minPrice, maxPrice, sort } = req.query;

  let query = "SELECT * FROM listings WHERE 1=1";
  let values = [];

  // SEARCH (title)
  if (search) {
    values.push(`%${search}%`);
    query += ` AND title ILIKE $${values.length}`;
  }

  // CATEGORY
  if (category) {
    values.push(category);
    query += ` AND category = $${values.length}`;
  }

  // LOCATION
  if (location) {
    values.push(location);
    query += ` AND location = $${values.length}`;
  }

  // PRICE RANGE
  if (minPrice) {
    values.push(minPrice);
    query += ` AND price >= $${values.length}`;
  }

  if (maxPrice) {
    values.push(maxPrice);
    query += ` AND price <= $${values.length}`;
  }

  if (sort === "priceAsc") {
    query += " ORDER BY price ASC, created_at DESC";
  } else if (sort === "priceDesc") {
    query += " ORDER BY price DESC, created_at DESC";
  } else {
    query += " ORDER BY created_at DESC";
  }

  try {
    const listings = await pool.query(query, values);

    const result = [];

    for (let listing of listings.rows) {
      result.push({
        ...listing,
        images: await getListingImages(listing)
      });
    }

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching listings" });
  }
});

app.delete("/listings/:listingId/images", async (req, res) => {
  const { userId, imageId, imageUrl } = req.body;

  try {
    const ownerCheck = await pool.query(
      "SELECT image_url FROM listings WHERE id = $1 AND user_id = $2",
      [req.params.listingId, userId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: "Not allowed" });
    }

    let removed = false;

    if (imageId && !String(imageId).startsWith("legacy-")) {
      const deletedImage = await pool.query(
        "DELETE FROM listing_images WHERE id = $1 AND listing_id = $2 RETURNING id",
        [imageId, req.params.listingId]
      );

      removed = deletedImage.rowCount > 0;
    }

    if (imageUrl) {
      const deletedLegacyImage = await pool.query(
        `UPDATE listings
         SET image_url = NULL
         WHERE id = $1 AND user_id = $2 AND image_url = $3
         RETURNING id`,
        [req.params.listingId, userId, imageUrl]
      );

      removed = deletedLegacyImage.rowCount > 0 || removed;

      if (!imageId || String(imageId).startsWith("legacy-")) {
        const deletedMatchingRows = await pool.query(
          "DELETE FROM listing_images WHERE listing_id = $1 AND image_url = $2 RETURNING id",
          [req.params.listingId, imageUrl]
        );

        removed = deletedMatchingRows.rowCount > 0 || removed;
      }
    }

    if (!removed) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.json({ message: "Image deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting image" });
  }
});

app.delete("/listing-images/:id", async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM listing_images WHERE id = $1",
      [req.params.id]
    );

    res.json({ message: "Image deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting image" });
  }
});

// Return one listing by id for the details and edit pages.
app.get("/listings/:id", async (req, res) => {
  const listing = await pool.query(
    "SELECT * FROM listings WHERE id = $1",
    [req.params.id]
  );
  const listingRow = listing.rows[0];

  if (!listingRow) {
    return res.status(404).json({ error: "Listing not found" });
  }

  res.json({
    ...listingRow,
    images: await getListingImages(listingRow)
  });
});

// Create a new listing owned by the user who submitted it.
app.post("/listings", async (req, res) => {
  const { title, description, price, userId, location, imageUrls } = req.body;

  try {
    // Create listing
    const listingResult = await pool.query(
      `INSERT INTO listings (title, description, price, user_id, location)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description, price, userId, location]
    );

    const listing = listingResult.rows[0];

    // Insert images
    if (imageUrls && imageUrls.length > 0) {
      for (let url of imageUrls) {
        await pool.query(
          `INSERT INTO listing_images (listing_id, image_url)
           VALUES ($1, $2)`,
          [listing.id, url]
        );
      }
    }

    res.json(listing);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating listing" });
  }
});

// Update an existing listing, but only if the requesting user owns it.
app.put("/listings/:id", async (req, res) => {
  const { title, description, price, userId, location, imageUrls } = req.body;

  try {
    const result = await pool.query(
      `UPDATE listings
       SET title=$1, description=$2, price=$3, location=$4
       WHERE id=$5 AND user_id=$6
       RETURNING *`,
      [title, description, price, location, req.params.id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: "Not allowed" });
    }

    // ADD NEW IMAGES
    if (imageUrls && imageUrls.length > 0) {
      for (let url of imageUrls) {
        await pool.query(
          "INSERT INTO listing_images (listing_id, image_url) VALUES ($1, $2)",
          [req.params.id, url]
        );
      }
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update error" });
  }
});

// Delete a listing when the matching owner sends the request.
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

// Update the signed-in user's profile fields shown on the profile page.
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

// Verify the old password before saving a newly hashed password.
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

// Register a new user account and store the password securely as a hash.
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

// Log a user in by checking the password and returning a signed JWT.
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

// Start the Express server on the port used by the frontend during local development.
app.listen(5001, () => {
  console.log("Server running on port 5001");
});
