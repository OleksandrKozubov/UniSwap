const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

// This code was developed with assistance from ChatGPT (GPT-5.5, 2026).
// Prompt: "Show how to upload images to Cloudinary using Node.js and Express."
// The generated example was reviewed, modified, and integrated into the UniSwap project.
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uniswap",
    allowed_formats: ["jpg", "png", "jpeg"]
  }
});

const upload = multer({ storage });

module.exports = upload;
