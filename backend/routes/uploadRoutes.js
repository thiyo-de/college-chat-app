const express = require("express");
const router = express.Router();
const upload = require("../middlewares/cloudUpload");

// 🆗 Mark as public before hitting upload middleware
router.post("/", (req, res, next) => {
  req.isPrivate = false;
  next();
}, upload.single("file"), (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: "❌ File upload failed" });
  }

  res.status(200).json({
    message: "✅ File uploaded to Cloudinary",
    fileUrl: req.file.path,
    fileType: req.file.mimetype,
    public_id: req.file.filename,
  });
});

module.exports = router;