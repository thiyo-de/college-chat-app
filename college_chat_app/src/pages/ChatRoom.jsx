import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:5000"); // Your backend URL

const ChatRoom = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messageEndRef = useRef(null);

  // ✅ Load user from localStorage
  const user = JSON.parse(localStorage.getItem("user")) || null;

  useEffect(() => {
    // ✅ Fetch existing public messages
    const fetchMessages = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/message/public/all");
        setMessages(res.data);
      } catch (err) {
        console.error("❌ Failed to load public messages:", err);
      }
    };

    fetchMessages();

    // ✅ Join public socket room
    socket.emit("joinRoom", { roomId: "public-room" });

    // ✅ Listen for real-time messages
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // ❌ Cleanup only listener
    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  // ✅ Scroll to bottom on new message
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    if (!user?._id) return alert("User not logged in.");

    const msgData = {
      sender: user._id,         // ⬅️ Must be ObjectId
      content: message,
      file: null,
      fileType: "text",
      isPublic: true,
      roomId: null,
    };

    socket.emit("sendMessage", msgData);
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🌐 Public Chat Room</h2>

      <div
        style={{
          border: "1px solid #ccc",
          height: "300px",
          overflowY: "auto",
          padding: "10px",
          marginBottom: "10px",
          background: "#f9f9f9",
          borderRadius: "8px",
        }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: "8px" }}>
            <strong>{msg.sender?.name || "Anonymous"}:</strong> {msg.content}
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        style={{
          width: "80%",
          padding: "8px",
          marginRight: "10px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />
      <button onClick={handleSend} style={{ padding: "8px 16px" }}>
        Send
      </button>
    </div>
  );
};

export default ChatRoom;