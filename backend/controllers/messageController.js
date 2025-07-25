const mongoose = require("mongoose");
const Message = require("../models/Message");
const ChatRoom = require("../models/ChatRoom");

// 📩 Create Message (Text or File)
exports.createMessage = async (req, res) => {
  try {
    const { chatRoomId, content, file, fileType } = req.body;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(chatRoomId)) {
      return res.status(400).json({ message: "Invalid ChatRoom ID" });
    }

    const room = await ChatRoom.findById(chatRoomId);
    if (!room) {
      return res.status(404).json({ message: "Chat room not found" });
    }

    const message = await Message.create({
      sender: req.user._id,
      content,
      file,
      fileType,
      isPublic: true,
    });

    res.status(201).json({ message: "Message sent", data: message });
  } catch (err) {
    console.error("Create Message Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 📜 Get Messages for a Room
exports.getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;

    const messages = await Message.find({ isPublic: true })
      .sort({ createdAt: 1 })
      .populate("sender", "name role")
      .populate("receiver", "name");

    res.json({ roomId, messages });
  } catch (error) {
    console.error("Get Messages Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


