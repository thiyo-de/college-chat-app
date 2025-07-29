// src/utils/messageApi.js
import API from "./api";

// Message endpoints
export const getMessagesByRoom = (roomId) => API.get(`/message/${roomId}`);
export const sendMessage = (data) => API.post("/message", data);