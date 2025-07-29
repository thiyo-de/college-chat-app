import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import API from "../utils/api";

const socket = io("http://localhost:5000"); // Your backend WebSocket URL

const ChatRoom = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const messageEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    // Join public room
    socket.emit("joinRoom", { roomId: "public-room" });

    // Load old public messages on mount
    fetchPublicMessages();

    // Listen for incoming messages
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchPublicMessages = async () => {
    try {
      const res = await API.get("/message/public/all");
      setMessages(res.data);
    } catch (err) {
      console.error("❌ Failed to load messages", err);
    }
  };

  const handleSend = async () => {
    if (!message.trim() && !file) return;
    if (!user?._id) return alert("User not logged in.");

    let uploadedFile = null;

    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await API.post("/message/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedFile = res.data;
      } catch (err) {
        alert("❌ File upload failed");
        console.error(err);
        return;
      }
    }

    const msgData = {
      sender: user._id,
      content: message,
      file: uploadedFile?.fileUrl || null,
      fileType: uploadedFile?.fileType?.split("/")[0] || "text",
      isPublic: true,
      roomId: null,
    };

    socket.emit("sendMessage", msgData);
    setMessage("");
    setFile(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div>
      <h2>🟢 Public Chat Room</h2>

      <div
        style={{
          border: "1px solid #ccc",
          height: "300px",
          overflowY: "auto",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: "8px" }}>
            <strong>{msg.sender?.name || "Anonymous"}:</strong>{" "}
            {msg.file ? (
              msg.fileType === "image" ? (
                <>
                  <p>{msg.content}</p>
                  <img
                    src={msg.file}
                    alt="uploaded"
                    style={{
                      maxHeight: "120px",
                      display: "block",
                      marginTop: "5px",
                    }}
                  />
                </>
              ) : msg.fileType === "application/pdf" ? (
                <>
                  <p>{msg.content}</p>
                  <a
                    href={msg.file}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📄 Download PDF
                  </a>
                </>
              ) : (
                <>
                  <p>{msg.content}</p>
                  <a
                    href={msg.file}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📎 Download File
                  </a>
                </>
              )
            ) : (
              <p>{msg.content}</p>
            )}
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
        style={{ width: "50%", marginRight: "10px" }}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        style={{ marginRight: "10px" }}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default ChatRoom;
