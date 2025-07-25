const express = require("express");
const router = express.Router();
const protect = require("../middlewares/protect");
const upload = require("../middlewares/upload");

const {
  createMessage,
  getMessages,
} = require("../controllers/messageController");

// 🔒 Create a new message
router.post("/", protect, createMessage);

// 🔒 Get all messages for a specific room
router.get("/:roomId", protect, getMessages);

// 🔒 Upload file (image or PDF)
router.post("/upload", protect, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Fix: Determine actual subfolder
  const fileType = req.file.mimetype.includes("image")
    ? "images"
    : req.file.mimetype.includes("pdf")
    ? "pdfs"
    : "";

  res.json({
    message: "File uploaded successfully",
    fileUrl: `/uploads/${fileType}/${req.file.filename}`,
    fileType: req.file.mimetype,
  });
});

module.exports = router;