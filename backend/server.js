const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// ✅ Load environment variables
dotenv.config();

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Error:", err));

const app = express();
const server = http.createServer(app);

// ✅ Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // ✅ In production, restrict to your frontend domain
    methods: ["GET", "POST"],
  },
});

// ✅ Middlewares
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// ✅ API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/chatroom", require("./routes/chatRoomRoutes"));
app.use("/api/message", require("./routes/messageRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes")); // 🌩️ Cloudinary upload

// ❌ Remove local static folder if using Cloudinary only
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Socket.IO Chat Logic
io.on("connection", (socket) => {
  console.log("🔌 New user connected:", socket.id);

  // Join chat room
  socket.on("joinRoom", ({ roomId }) => {
    socket.join(roomId);
    console.log(`📥 User joined room: ${roomId}`);
  });

  // Handle message sending
  socket.on("sendMessage", (data) => {
    const { roomId, sender, message, file, fileType } = data;
    io.to(roomId).emit("receiveMessage", {
      sender,
      message,
      file,
      fileType,
      createdAt: new Date(),
    });
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
