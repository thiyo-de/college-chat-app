// ✅ Cleaned up uploadRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/cloudUpload"); // ✅ Uses Cloudinary

// 🆗 POST /api/upload
router.post("/", upload.single("file"), (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: "❌ File upload failed" });
  }

  res.status(200).json({
    message: "✅ File uploaded to Cloudinary",
    fileUrl: req.file.path,        // Cloudinary URL
    fileType: req.file.mimetype,
    public_id: req.file.filename,  // Useful for deletion
  });
});

module.exports = router;
