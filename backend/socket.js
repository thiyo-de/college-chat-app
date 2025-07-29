const mongoose = require("mongoose");
const Message = require("./models/Message");

module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log("✅ New client connected:", socket.id);

    socket.join("public-room");

    // ✅ Public Chat Message
    socket.on("sendPublicMessage", async (data) => {
      const { sender, content, file, fileType = "text" } = data;

      if (!mongoose.Types.ObjectId.isValid(sender)) {
        console.error("❌ Invalid sender ObjectId for public message");
        return;
      }

      try {
        const saved = await Message.create({
          sender,
          content,
          file,
          fileType,
          isPublic: true,
          roomId: null,
          receiver: null,
        });

        const populatedMessage = await saved.populate("sender", "name"); // ✅ populate
        io.to("public-room").emit("receivePublicMessage", populatedMessage);
      } catch (err) {
        console.error("❌ Error saving public message:", err);
      }
    });

    // ✅ Join Private or Group Room
    socket.on("joinRoom", ({ roomId }) => {
      socket.join(roomId);
      console.log(`📥 User joined room: ${roomId}`);
    });

    // ✅ Private or Group Message
    socket.on("sendMessage", async (data) => {
      const {
        sender,
        receiver = null,
        content,
        file,
        fileType = "text",
        roomId = null,
        isPublic = false,
      } = data;

      if (!mongoose.Types.ObjectId.isValid(sender)) {
        console.error("❌ Invalid sender ObjectId for private/group message");
        return;
      }

      if (roomId && !mongoose.Types.ObjectId.isValid(roomId)) {
        console.error("❌ Invalid roomId ObjectId");
        return;
      }

      try {
        const saved = await Message.create({
          sender,
          receiver,
          content,
          file,
          fileType,
          isPublic,
          roomId,
        });

        const populatedMessage = await saved.populate("sender", "name"); // ✅ populate here too
        const targetRoom = isPublic ? "public-room" : roomId?.toString();

        if (targetRoom) {
          io.to(targetRoom).emit("receiveMessage", populatedMessage);
        }
      } catch (err) {
        console.error("❌ Error saving message:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });
};