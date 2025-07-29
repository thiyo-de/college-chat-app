// src/utils/chatApi.js
import API from "./api";

// ChatRoom endpoints
export const getAllChatRooms = () => API.get("/chatroom");
export const createChatRoom = (data) => API.post("/chatroom", data);
export const getChatRoomById = (roomId) => API.get(`/chatroom/${roomId}`);
export const deleteChatRoom = (roomId) => API.delete(`/chatroom/${roomId}`);