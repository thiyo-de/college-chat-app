// src/utils/authApi.js
import API from "./api";

export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const deleteUser = () => API.delete("/auth/me");