// lib/apiClient.ts
import axios from "axios";

// ✅ Tạo axios instance chung
const apiClient = axios.create({
  baseURL: "http://localhost:3001", // URL BE
  withCredentials: false, // bạn đang dùng JWT, không cần cookie
});

// ✅ Interceptor tự động gắn Authorization
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  console.log("🧩 Token trong localStorage:", token); // 👈 in ra
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("⚠️ Không tìm thấy token trong localStorage!");
  }
  return config;
});
export default apiClient;
