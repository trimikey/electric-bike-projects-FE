import axios from "axios";
import { getSession } from "next-auth/react";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BE_URL || "http://localhost:3001",
});

apiClient.interceptors.request.use(async (config) => {
  let token = null;

  // ✅ Ưu tiên localStorage
  if (typeof window !== "undefined") {
    token = localStorage.getItem("accessToken");
    console.log("🔑 Token từ localStorage:", token);
  }

  // ✅ Nếu localStorage trống, lấy từ NextAuth
  if (!token) {
    const session = await getSession();
    token =
      session?.accessToken ||
      session?.user?.accessToken ||
      null;
    console.log("🔄 Token từ NextAuth:", token);
  }

  // ✅ Nếu vẫn chưa có token, cancel request
  if (!token) {
    console.warn("⚠️ Không có token, hủy request");
    return Promise.reject({ message: "No token provided" });
  }

  // ✅ Gắn vào header Authorization
  config.headers = config.headers || {};
  (config.headers as any).Authorization = `Bearer ${token}`;

  return config;
});

export default apiClient;
