const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const express = require("express");
const cors = require("cors");
const upload = require("./multer");
const http = require("http");        
const { Server } = require("socket.io");  

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000"
  }
});

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  socket.on("join_chat", ({ listingId }) => {

    socket.join(`listing_${listingId}`);

  });

  socket.on("send_message", async (data) => {

    const { senderId, receiverId, listingId, text } = data;

    const result = await pool.query(

      `INSERT INTO messages (sender_id, receiver_id, listing_id, text)

       VALUES ($1, $2, $3, $4)

       RETURNING *`,

      [senderId, receiverId, listingId, text]

    );

    const message = result.rows[0];

    io.to(`listing_${listingId}`).emit("receive_message", message);

  });

  socket.on("disconnect", () => {

    console.log("User disconnected");

  });

});

app.use(express.json());

app.use(cors({
  origin: "http://localhost:3000"
}));

app.post("/upload", upload.single("image"), (req, res) => {
  res.json({ imageUrl: req.file.path });
});

app.get("/chats/:userId", async (req, res) => {
  const userId = Number(req.params.userId);

  try {
    const result = await pool.query(
      `
        WITH user_chats AS (
          SELECT
            listing_id,
            CASE
              WHEN sender_id = $1 THEN receiver_id
              ELSE sender_id
            END AS other_user_id,
            receiver_id,
            is_read,
            created_at
          FROM messages
          WHERE sender_id = $1 OR receiver_id = $1
        )
        SELECT
          user_chats.listing_id,
          user_chats.other_user_id,
          listings.title AS listing_title,
          other_users.name AS other_user_name,
          other_users.avatar_url AS other_user_avatar_url,
          MAX(user_chats.created_at) AS last_message_at,
          CAST(
            COUNT(*) FILTER (
              WHERE user_chats.receiver_id = $1 AND user_chats.is_read = FALSE
            ) AS INTEGER
          ) AS unread_count
        FROM user_chats
        LEFT JOIN listings ON listings.id = user_chats.listing_id
        LEFT JOIN users AS other_users ON other_users.id = user_chats.other_user_id
        GROUP BY
          user_chats.listing_id,
          user_chats.other_user_id,
          listings.title,
          other_users.name,
          other_users.avatar_url
        ORDER BY MAX(user_chats.created_at) DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching chats" });
  }
});

app.put("/messages/read", async (req, res) => {
  const { userId, listingId, otherUserId } = req.body;

  await pool.query(
    `UPDATE messages
     SET is_read = TRUE
     WHERE receiver_id = $1
     AND sender_id = $2
     AND listing_id = $3`,
    [userId, otherUserId, listingId]
  );

  res.sendStatus(200);
});

app.get("/messages/unread/:userId", async (req, res) => {
  const result = await pool.query(
    `SELECT COUNT(*) FROM messages
     WHERE receiver_id = $1 AND is_read = FALSE`,
    [req.params.userId]
  );

  res.json({ count: result.rows[0].count });
});

app.get("/messages/:listingId", async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM messages
     WHERE listing_id = $1
     ORDER BY created_at ASC`,
    [req.params.listingId]
  );

  res.json(result.rows);
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

function parseOptionalUserId(value) {
  const userId = Number(value);

  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

function isMissingSavedListingsTable(error) {
  return error?.code === "42P01";
}

async function getListingSaveData(listingId, userId) {
  try {
    const countResult = await pool.query(
      "SELECT COUNT(*)::int AS saved_count FROM saved_listings WHERE listing_id = $1",
      [listingId]
    );

    if (!userId) {
      return {
        saved_count: countResult.rows[0]?.saved_count || 0,
        is_saved: false
      };
    }

    const savedResult = await pool.query(
      `SELECT EXISTS (
         SELECT 1
         FROM saved_listings
         WHERE listing_id = $1 AND user_id = $2
       ) AS is_saved`,
      [listingId, userId]
    );

    return {
      saved_count: countResult.rows[0]?.saved_count || 0,
      is_saved: Boolean(savedResult.rows[0]?.is_saved)
    };
  } catch (err) {
    if (isMissingSavedListingsTable(err)) {
      return { saved_count: 0, is_saved: false };
    }

    throw err;
  }
}

async function hydrateListing(listing, userId) {
  const [images, saveData] = await Promise.all([
    getListingImages(listing),
    getListingSaveData(listing.id, userId)
  ]);

  return {
    ...listing,
    images,
    ...saveData
  };
}

app.get("/messages/:listingId", async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM messages
     WHERE listing_id = $1
     ORDER BY created_at ASC`,
    [req.params.listingId]
  );

  res.json(result.rows);
});

app.get("/categories", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY name ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching categories" });
  }
});

app.post("/listings/:id/save", async (req, res) => {
  const listingId = Number(req.params.id);
  const userId = parseOptionalUserId(req.body.userId);

  if (!Number.isInteger(listingId) || listingId <= 0 || !userId) {
    return res.status(400).json({ error: "Valid user and listing are required" });
  }

  try {
    await pool.query(
      `INSERT INTO saved_listings (user_id, listing_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, listing_id) DO NOTHING`,
      [userId, listingId]
    );

    res.json(await getListingSaveData(listingId, userId));
  } catch (err) {
    console.error(err);

    if (isMissingSavedListingsTable(err)) {
      return res.status(500).json({
        error: "Saved listings table is missing. Run backend/saved_listings.sql."
      });
    }

    if (err.code === "23503") {
      return res.status(404).json({ error: "Listing or user not found" });
    }

    res.status(500).json({ error: "Error saving listing" });
  }
});

app.delete("/listings/:id/save", async (req, res) => {
  const listingId = Number(req.params.id);
  const userId = parseOptionalUserId(req.body.userId);

  if (!Number.isInteger(listingId) || listingId <= 0 || !userId) {
    return res.status(400).json({ error: "Valid user and listing are required" });
  }

  try {
    await pool.query(
      "DELETE FROM saved_listings WHERE user_id = $1 AND listing_id = $2",
      [userId, listingId]
    );

    res.json(await getListingSaveData(listingId, userId));
  } catch (err) {
    console.error(err);

    if (isMissingSavedListingsTable(err)) {
      return res.status(500).json({
        error: "Saved listings table is missing. Run backend/saved_listings.sql."
      });
    }

    res.status(500).json({ error: "Error removing saved listing" });
  }
});

// Return every listing so the home page can render the marketplace feed.
app.get("/listings", async (req, res) => {
  const {
    search,
    category,
    location,
    minPrice,
    maxPrice,
    sort,
    userId,
    freeOnly
  } = req.query;
  const viewerId = parseOptionalUserId(userId);

  let query = `
    SELECT
      listings.*,
      categories.name AS category_name,
      users.name AS seller_name,
      users.avatar_url AS seller_avatar_url
    FROM listings
    LEFT JOIN categories ON categories.id = listings.category_id
    LEFT JOIN users ON users.id = listings.user_id
    WHERE 1=1
  `;
  let values = [];

  // SEARCH (title)
  if (search) {
    values.push(`%${search}%`);
    query += ` AND listings.title ILIKE $${values.length}`;
  }

  // CATEGORY
  if (category) {
    values.push(Number(category));
    query += ` AND listings.category_id = $${values.length}`;
  }

  // LOCATION
  if (location) {
    values.push(location);
    query += ` AND listings.location = $${values.length}`;
  }

  // PRICE RANGE
  if (minPrice) {
    values.push(minPrice);
    query += ` AND listings.price >= $${values.length}`;
  }

  if (maxPrice) {
    values.push(maxPrice);
    query += ` AND listings.price <= $${values.length}`;
  }

  if (freeOnly === "true") {
    query += " AND listings.price = 0";
  }

  if (sort === "priceAsc") {
    query += " ORDER BY listings.price ASC, listings.created_at DESC";
  } else if (sort === "priceDesc") {
    query += " ORDER BY listings.price DESC, listings.created_at DESC";
  } else {
    query += " ORDER BY listings.created_at DESC";
  }

  try {
    const listings = await pool.query(query, values);

    const result = await Promise.all(
      listings.rows.map(listing => hydrateListing(listing, viewerId))
    );

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

app.post("/upload-avatar", upload.single("image"), async (req, res) => {
  try {
    if (!req.file?.path) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    res.json({ imageUrl: req.file.path });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.get("/users/:id/saved-listings", async (req, res) => {
  const userId = parseOptionalUserId(req.params.id);

  if (!userId) {
    return res.status(400).json({ error: "Valid user is required" });
  }

  try {
    const result = await pool.query(
      `SELECT
         listings.*,
         categories.name AS category_name,
         users.name AS seller_name,
         users.avatar_url AS seller_avatar_url,
         saved_listings.created_at AS saved_at
       FROM saved_listings
       JOIN listings ON listings.id = saved_listings.listing_id
       LEFT JOIN categories ON listings.category_id = categories.id
       LEFT JOIN users ON users.id = listings.user_id
       WHERE saved_listings.user_id = $1
       ORDER BY saved_listings.created_at DESC`,
      [userId]
    );

    const listings = await Promise.all(
      result.rows.map(listing => hydrateListing(listing, userId))
    );

    res.json(listings);
  } catch (err) {
    console.error(err);

    if (isMissingSavedListingsTable(err)) {
      return res.status(500).json({
        error: "Saved listings table is missing. Run backend/saved_listings.sql."
      });
    }

    res.status(500).json({ error: "Error fetching saved listings" });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, name, university, avatar_url
       FROM users
       WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching user" });
  }
});

app.put("/users/:id", async (req, res) => {
  const { name, university, avatarUrl } = req.body;
  const normalizedAvatarUrl = avatarUrl || null;

  try {
    const result = await pool.query(
      `UPDATE users
       SET name=$1, university=$2, avatar_url=$3
       WHERE id=$4
       RETURNING *`,
      [name, university, normalizedAvatarUrl, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Profile update failed" });
  }
});

app.get("/users/:id/listings", async (req, res) => {
  const viewerId = parseOptionalUserId(req.query.userId);

  try {
    const result = await pool.query(
      `SELECT
         listings.*,
         categories.name AS category_name,
         users.name AS seller_name,
         users.avatar_url AS seller_avatar_url
       FROM listings
       LEFT JOIN categories ON listings.category_id = categories.id
       LEFT JOIN users ON users.id = listings.user_id
       WHERE listings.user_id = $1
       ORDER BY listings.created_at DESC`,
      [req.params.id]
    );

    const listingsWithImages = await Promise.all(
      result.rows.map(listing => hydrateListing(listing, viewerId))
    );

    res.json(listingsWithImages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching user listings" });
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
  const viewerId = parseOptionalUserId(req.query.userId);
  const listing = await pool.query(
    `SELECT
       listings.*,
       categories.name AS category_name,
       users.name AS seller_name,
       users.avatar_url AS seller_avatar_url
     FROM listings
     LEFT JOIN categories ON categories.id = listings.category_id
     LEFT JOIN users ON users.id = listings.user_id
     WHERE listings.id = $1`,
    [req.params.id]
  );
  const listingRow = listing.rows[0];

  if (!listingRow) {
    return res.status(404).json({ error: "Listing not found" });
  }

  res.json(await hydrateListing(listingRow, viewerId));
});

// Create a new listing owned by the user who submitted it.
app.post("/listings", async (req, res) => {
  const { title, description, price, userId, location, imageUrls, categoryId } = req.body;
  const normalizedCategoryId = categoryId ? Number(categoryId) : null;

  try {
    // Create listing
    const listingResult = await pool.query(
      `INSERT INTO listings (title, description, price, user_id, location, category_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description, price, userId, location, normalizedCategoryId]
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
  const { title, description, price, userId, location, imageUrls, categoryId } = req.body;
  const normalizedCategoryId = categoryId ? Number(categoryId) : null;

  try {
    const result = await pool.query(
      `UPDATE listings
       SET title=$1, description=$2, price=$3, location=$4, category_id=$5
       WHERE id=$6 AND user_id=$7
       RETURNING *`,
      [title, description, price, location, normalizedCategoryId, req.params.id, userId]
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
      return res.status(401).json({ error: "User not found" });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid password" });
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
    email: user.rows[0].email,
    university: user.rows[0].university,
    avatar_url: user.rows[0].avatar_url
  }
});

  } catch (err) {
    console.error(err);
    res.status(500).send("Login error");
  }
});

// Start the Express server on the port used by the frontend during local development.
server.listen(5001, () => {
  console.log("Server running on port 5001");
});
