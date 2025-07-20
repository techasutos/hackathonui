import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8080/api", // Adjust if needed (e.g., "http://localhost:8080/api")
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach token (if available) to every request
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;