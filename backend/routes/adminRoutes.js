const express = require("express");
const router = express.Router();
const protect = require("../middlewares/protect");
const authorizeRoles = require("../middlewares/authorizeRoles");
const User = require("../models/User");

// ✅ Admin-only dashboard
router.get(
  "/dashboard",
  protect,
  authorizeRoles("admin", "superadmin"),
  (req, res) => {
    res.json({ message: "Welcome Admin!", user: req.user });
  }
);

// ✅ Accessible by both admin and student
router.get(
  "/general",
  protect,
  authorizeRoles("admin", "student", "superadmin"),
  (req, res) => {
    res.json({ message: "Accessible by all logged-in users" });
  }
);

// ✅ Admin: Get all users
router.get(
  "/users",
  protect,
  authorizeRoles("admin", "superadmin"),
  async (req, res) => {
    const users = await User.find().select("-password");
    res.json(users);
  }
);

// 🧑‍🏫 Promote Student to Admin
router.patch(
  "/users/:id/promote",
  protect,
  authorizeRoles("admin", "superadmin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.role === "admin") {
        return res.status(400).json({ message: "User is already an admin" });
      }
      if (user.role === "superadmin") {
        return res.status(403).json({ message: "Cannot promote a superadmin" });
      }

      user.role = "admin";
      await user.save();

      res.json({
        message: "User promoted to admin",
        user: { id: user._id, name: user.name, role: user.role },
      });
    } catch (err) {
      console.error("Error promoting user:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// 🧑‍🎓 Demote Admin to Student
router.patch(
  "/users/:id/demote",
  protect,
  authorizeRoles("admin", "superadmin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.role === "student") {
        return res.status(400).json({ message: "User is already a student" });
      }
      if (user.role === "superadmin") {
        return res.status(403).json({ message: "Cannot demote a superadmin" });
      }

      user.role = "student";
      await user.save();

      res.json({
        message: "User demoted to student",
        user: { id: user._id, name: user.name, role: user.role },
      });
    } catch (err) {
      console.error("Error demoting user:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// 🗑️ Delete user (students only)
router.delete(
  "/users/:id",
  protect,
  authorizeRoles("superadmin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) return res.status(404).json({ message: "User not found" });

      // ❌ Superadmin can't delete another superadmin
      if (user.role === "superadmin") {
        return res
          .status(403)
          .json({ message: "You cannot delete another superadmin" });
      }

      await user.deleteOne();

      res.json({
        message: "User deleted by superadmin",
        user: { id: user._id, name: user.name, role: user.role },
      });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// 🚫 Block a student (cannot block admins/superadmins)
router.patch(
  "/users/:id/block",
  protect,
  authorizeRoles("admin", "superadmin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.role !== "student") {
        return res
          .status(403)
          .json({ message: "Only students can be blocked by admin" });
      }

      if (user.isBlocked) {
        return res.status(400).json({ message: "User is already blocked" });
      }

      user.isBlocked = true;
      await user.save();

      res.json({
        message: "User blocked successfully",
        user: {
          id: user._id,
          name: user.name,
          role: user.role,
          isBlocked: true,
        },
      });
    } catch (err) {
      console.error("Error blocking user:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ✅ Unblock a user
router.patch(
  "/users/:id/unblock",
  protect,
  authorizeRoles("admin", "superadmin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (!user.isBlocked) {
        return res.status(400).json({ message: "User is not blocked" });
      }

      user.isBlocked = false;
      await user.save();

      res.json({
        message: "User unblocked",
        user: { id: user._id, name: user.name, isBlocked: false },
      });
    } catch (err) {
      console.error("Error unblocking user:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
