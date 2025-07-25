const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

// ✅ Ensure upload folders exist
const ensureUploadFolders = () => {
  const base = path.join(__dirname, "../uploads");
  const folders = ["images", "pdfs", "others"];

  folders.forEach((folder) => {
    const dir = path.join(base, folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created folder: ${dir}`);
    }
  });
};

ensureUploadFolders();

// ✅ Storage config (dynamic folder based on type)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "others";
    if (file.mimetype.startsWith("image/")) {
      folder = "images";
    } else if (file.mimetype === "application/pdf") {
      folder = "pdfs";
    }
    cb(null, path.join(__dirname, `../uploads/${folder}`));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

// ✅ Accept all file types, just limit size
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => cb(null, true),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ✅ Upload route
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Determine where it was saved
  let folder = "others";
  if (req.file.mimetype.startsWith("image/")) folder = "images";
  else if (req.file.mimetype === "application/pdf") folder = "pdfs";

  res.status(200).json({
    message: "File uploaded successfully",
    fileUrl: `/uploads/${folder}/${req.file.filename}`,
    fileType: req.file.mimetype,
  });
});

module.exports = router;