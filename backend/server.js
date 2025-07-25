const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// Create uploads/images and uploads/pdfs folders if not exist
const ensureUploadFolders = () => {
  const base = path.join(__dirname, "uploads");
  const folders = ["", "images", "pdfs", "others"];

  folders.forEach(folder => {
    const dir = path.join(base, folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created folder: ${dir}`);
    }
  });
};

ensureUploadFolders(); // Call before server starts

// Load env vars
dotenv.config();

// MongoDB connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Error:", err));

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Allow frontend origin here in production
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());


// ✅ Serve uploaded files (e.g., images, pdfs)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/chatroom", require("./routes/chatRoomRoutes"));
app.use("/api/message", require("./routes/messageRoutes"));
app.use("/uploads", express.static("uploads"));
app.use("/api/upload", require("./routes/uploadRoutes"));

// ✅ Socket.IO logic
io.on("connection", (socket) => {
  console.log("🔌 New user connected:", socket.id);

  // Join a chat room
  socket.on("joinRoom", ({ roomId }) => {
    socket.join(roomId);
    console.log(`📥 User joined room: ${roomId}`);
  });

  // Listen for message and broadcast
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

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});