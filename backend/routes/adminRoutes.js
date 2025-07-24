const express = require("express");
const router = express.Router();
const protect = require("../middlewares/protect");
const authorizeRoles = require("../middlewares/authorizeRoles");
const User = require("../models/User"); // ✅ ADD THIS LINE

// ✅ Admin-only dashboard
router.get("/dashboard", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin!", user: req.user });
});

// ✅ Accessible by both admin and student
router.get(
  "/general",
  protect,
  authorizeRoles("admin", "student"),
  (req, res) => {
    res.json({ message: "Accessible by all logged-in users" });
  }
);

// ✅ Admin: Get all users
router.get("/users", protect, authorizeRoles("admin"), async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// 👨‍🏫 Promote Student to Admin
router.patch(
  "/users/:id/promote",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.role === "admin") {
        return res.status(400).json({ message: "User is already an admin" });
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

// 👨‍🎓 Demote Admin to Student
router.patch(
  "/users/:id/demote",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.role === "student") {
        return res.status(400).json({ message: "User is already a student" });
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

// 🧹 Delete User
router.delete(
  "/users/:id",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        message: "User deleted successfully",
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (err) {
      console.error("Error deleting user:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// 🚫 Block a user
router.patch(
  "/users/:id/block",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = true;
    await user.save();

    res.json({
      message: "User blocked",
      user: { id: user._id, name: user.name, isBlocked: true },
    });
  }
);

// ✅ Unblock a user
router.patch(
  "/users/:id/unblock",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = false;
    await user.save();

    res.json({
      message: "User unblocked",
      user: { id: user._id, name: user.name, isBlocked: false },
    });
  }
);

// 🚫 Block a user (Admin only, cannot block another admin)
router.patch(
  "/users/:id/block",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // ❗ Prevent blocking another admin
      if (user.role === "admin") {
        return res.status(403).json({ message: "Cannot block another admin" });
      }

      // ❗ Already blocked
      if (user.isBlocked === true) {
        return res.status(400).json({ message: "User is already blocked" });
      }

      user.isBlocked = true;
      await user.save();

      res.json({
        message: "User blocked",
        user: {
          id: user._id,
          name: user.name,
          isBlocked: user.isBlocked,
        },
      });
    } catch (err) {
      console.error("🔴 Error blocking user:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

module.exports = router;
