// routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const protect = require("../middlewares/protect");
const upload = require("../middlewares/cloudUpload"); // ✅ Cloudinary Upload

const {
  createMessage,
  getMessages,
} = require("../controllers/messageController");

// 🔒 Create a new message
router.post("/", protect, createMessage);

// 🔒 Get all messages for a specific room
router.get("/:roomId", protect, getMessages);

// 🔒 Upload a file (image or PDF) to Cloudinary
router.post("/upload", protect, upload.single("file"), (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: "❌ No file uploaded" });
  }

  res.status(200).json({
    message: "✅ File uploaded to Cloudinary",
    fileUrl: req.file.path,
    fileType: req.file.mimetype,
    public_id: req.file.filename,
  });
});

module.exports = router;