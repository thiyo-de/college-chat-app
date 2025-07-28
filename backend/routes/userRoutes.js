const express = require("express");
const router = express.Router();
const protect = require("../middlewares/protect");
const {
  getUserProfile,
  getMe,
  // add other controllers like updateUser, deleteUser if needed
} = require("../controllers/userController");

// 🔐 Get current logged-in user's profile
router.get("/profile", protect, getMe);

// 👤 Get a user by their ID
router.get("/:id", protect, getUserProfile);

module.exports = router;
