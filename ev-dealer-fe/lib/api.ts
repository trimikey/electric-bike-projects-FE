// lib/api.ts
import axios, { AxiosError } from "axios";
import { getSession } from "next-auth/react";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BE_URL || "http://localhost:3001",
});

apiClient.interceptors.request.use(async (config) => {
  let token: string | null = null;

  if (typeof window !== "undefined") {
    token = localStorage.getItem("accessToken");
    console.log("🔑 Token từ localStorage:", token);
  }

  if (!token) {
    const session = await getSession();
    token = (session as any)?.accessToken || (session as any)?.user?.accessToken || null;
    console.log("🔄 Token từ NextAuth:", token);
  }

  if (!token) {
    console.warn("⚠️ Không có token, hủy request");
    // Giữ nguyên hành vi cũ (reject ở request)
    return Promise.reject({ message: "No token provided" });
  }

  config.headers = config.headers || {};
  (config.headers as any).Authorization = `Bearer ${token}`;
  return config;
});

// ✅ NEW: Chuẩn hoá lỗi cho toàn app (kể cả lỗi reject ở request)
apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError<any> | any) => {
    // TH1: lỗi ở request interceptor (ví dụ { message: "No token provided" })
    if (!error.isAxiosError && !error.response) {
      const message = error?.message || "Client error";
      const status = message === "No token provided" ? 401 : 0;
      return Promise.reject({ status, message, errors: undefined, raw: error });
    }

    // TH2: lỗi từ server (axios error)
    const status = error.response?.status ?? 0;
    const data = error.response?.data ?? {};
    const message =
      data?.message || error.message || (status ? `HTTP ${status}` : "Network error");

    return Promise.reject({
      status,
      message,
      errors: data?.errors, // { field: "msg" } nếu BE trả chi tiết
      raw: error,
    });
  }
);

export default apiClient;
