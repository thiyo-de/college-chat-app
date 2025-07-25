// routes/chatRoomRoutes.js
const express = require("express");
const router = express.Router();
const protect = require("../middlewares/protect");
const ChatRoom = require("../models/ChatRoom");

// ✅ Create a new chat room
router.post("/", protect, async (req, res) => {
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

// ✅ Get all chat rooms
router.get("/", protect, async (req, res) => {
  try {
    const rooms = await ChatRoom.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch rooms", error: err.message });
  }
});

// ✅ Join a room (optional if you're managing joins from socket.io)
router.post("/:id/join", protect, async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // In a real app, you might store joined users
    res.json({ message: `Joined room ${room.name}` });
  } catch (err) {
    res.status(500).json({ message: "Join failed", error: err.message });
  }
});

module.exports = router;
