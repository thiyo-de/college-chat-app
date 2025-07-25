const multer = require("multer");
const path = require("path");

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, "uploads/images");
    } else if (file.mimetype === "application/pdf") {
      cb(null, "uploads/pdfs");
    } else {
      cb(null, "uploads/others"); // Folder for other types
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + "-" + Math.round(Math.random() * 1e4);
    cb(null, `${name}${ext}`);
  },
});

// ✅ Allow all types
const fileFilter = (req, file, cb) => {
  cb(null, true); // accept all files
};

// ✅ Limit file size to 5MB
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;