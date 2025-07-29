// src/services/socket.js
import { io } from "socket.io-client";

const URL = "http://localhost:5000"; // change to your backend URL if deployed
const socket = io(URL, {
  withCredentials: true,
});

export default socket;