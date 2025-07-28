const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "college-chat", // Cloudinary folder name
    allowed_formats: ["jpg", "png", "jpeg", "pdf", "webp", "mp4", "txt", "docx"],
    transformation: [{ quality: "auto" }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = upload;