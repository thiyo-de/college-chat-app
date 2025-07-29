const express = require("express");
const router = express.Router();
const protect = require("../middlewares/protect");
const upload = require("../middlewares/cloudUpload");
const {
  createMessage,
  getMessages,
} = require("../controllers/messageController");

// ✅ Public chat messages (no token required)
router.get("/public/all", async (req, res) => {
  try {
    const messages = await require("../models/Message")
      .find({ isPublic: true })
      .populate("sender", "name")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ Failed to get public messages:", error);
    res.status(500).json({ message: "Failed to fetch public messages" });
  }
});

// 🔒 Create a new message (private or room-based)
router.post("/", protect, createMessage);

// 🔒 Get all messages for a specific room
router.get("/:roomId", protect, getMessages);

// 🔒 Upload a file (image, pdf, or raw)
router.post("/upload", protect, (req, res, next) => {
  req.isPrivate = true;
  next();
}, upload.single("file"), (req, res) => {
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