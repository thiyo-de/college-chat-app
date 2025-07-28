const express = require("express");
const router = express.Router();
const protect = require("../middlewares/protect");
const ChatRoom = require("../models/ChatRoom");

// Middleware to allow only admin or superadmin
function adminOnly(req, res, next) {
  if (req.user && (req.user.role === "admin" || req.user.role === "superadmin")) {
    next();
  } else {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
}

// ✅ Create a new chat room — admin/superadmin only
router.post("/", protect, adminOnly, async (req, res) => {
  const { name, description } = req.body;

  try {
    const roomExists = await ChatRoom.findOne({ name });
    if (roomExists) {
      return res.status(400).json({ message: "Room already exists" });
    }

    const newRoom = await ChatRoom.create({
      name,
      description,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: "Room created", room: newRoom });
  } catch (err) {
    res.status(500).json({ message: "Failed to create room", error: err.message });
  }
});

// ✅ Get all chat rooms — accessible to any authenticated user
router.get("/", protect, async (req, res) => {
  try {
    const rooms = await ChatRoom.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch rooms", error: err.message });
  }
});

// ✅ Join a room (optional, accessible to authenticated users)
router.post("/:id/join", protect, async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Implement join logic if you store joined users somewhere
    res.json({ message: `Joined room ${room.name}` });
  } catch (err) {
    res.status(500).json({ message: "Join failed", error: err.message });
  }
});

// ✅ Update chat room (admin/superadmin only) — e.g. change name, description
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { name, description } = req.body;
    const room = await ChatRoom.findById(req.params.id);

    if (!room) return res.status(404).json({ message: "Room not found" });

    if (name) room.name = name;
    if (description) room.description = description;

    await room.save();

    res.json({ message: "Room updated", room });
  } catch (err) {
    res.status(500).json({ message: "Failed to update room", error: err.message });
  }
});

// ✅ Delete chat room (admin/superadmin only)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.id);

    if (!room) return res.status(404).json({ message: "Room not found" });

    await room.deleteOne();

    res.json({ message: "Room deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete room", error: err.message });
  }
});

module.exports = router;