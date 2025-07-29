const mongoose = require("mongoose");
const Message = require("../models/Message");
const ChatRoom = require("../models/ChatRoom");

// 📩 Create Message (Text or File) - Supports Public, Private, and Room Chats
exports.createMessage = async (req, res) => {
  try {
    const { content, file, fileType, chatRoomId, receiverId, isPublic } = req.body;

    // ✅ Check if user is attached by protect middleware
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: user not authenticated" });
    }

    // ✅ Validate required content or file
    if (!content && !file) {
      return res.status(400).json({ message: "Message content or file is required" });
    }

    const messageData = {
      sender: req.user._id,
      content,
      file,
      fileType: fileType || (file ? "file" : "text"),
    };

    // 🔓 Public Chat (General Feed)
    if (isPublic === true && !receiverId && !chatRoomId) {
      messageData.isPublic = true;
    }

    // 🔒 Private Chat (1-to-1)
    else if (receiverId) {
      if (!mongoose.Types.ObjectId.isValid(receiverId)) {
        return res.status(400).json({ message: "Invalid receiver ID" });
      }
      messageData.receiver = receiverId;
      messageData.isPublic = false;
    }

    // 📢 Room-based Chat
    else if (chatRoomId) {
      if (!mongoose.Types.ObjectId.isValid(chatRoomId)) {
        return res.status(400).json({ message: "Invalid Chat Room ID" });
      }

      const room = await ChatRoom.findById(chatRoomId);
      if (!room) {
        return res.status(404).json({ message: "Chat room not found" });
      }

      messageData.roomId = chatRoomId;
      messageData.isPublic = room.isPublic || false; // Optional: inherit room visibility
    }

    // 🚀 Save the message
    const message = await Message.create(messageData);

    res.status(201).json({
      success: true,
      message: "✅ Message sent successfully",
      data: message,
    });

  } catch (err) {
    console.error("❌ Create Message Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// 📜 Get Messages (Public / Private / Room)
exports.getMessages = async (req, res) => {
  try {
    const { roomId, receiverId } = req.query;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: user not authenticated" });
    }

    let filter = {};

    // 🔒 Private Chat
    if (receiverId) {
      if (!mongoose.Types.ObjectId.isValid(receiverId)) {
        return res.status(400).json({ message: "Invalid receiver ID" });
      }

      filter = {
        $or: [
          { sender: req.user._id, receiver: receiverId },
          { sender: receiverId, receiver: req.user._id },
        ],
        isPublic: false,
      };
    }

    // 📢 Room Chat
    else if (roomId) {
      if (!mongoose.Types.ObjectId.isValid(roomId)) {
        return res.status(400).json({ message: "Invalid room ID" });
      }

      filter = { roomId };
    }

    // 🔓 Public Chat
    else {
      filter = { isPublic: true };
    }

    const messages = await Message.find(filter)
      .sort({ createdAt: 1 })
      .populate("sender", "name avatar")
      .populate("receiver", "name avatar")
      .populate("roomId", "name");

    res.status(200).json({
      success: true,
      messages,
    });

  } catch (error) {
    console.error("❌ Get Messages Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};