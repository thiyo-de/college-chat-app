const User = require("../models/User");

// 📌 For /api/user/profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ message: "Logged-in user fetched", data: user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 📌 For /api/user/:id
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "❌ User not found" });
    }
    res.json({ message: "✅ User fetched", data: user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
