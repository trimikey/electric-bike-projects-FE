import axios from "axios";
import { getSession } from "next-auth/react";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BE_URL || "http://localhost:3001",
});

apiClient.interceptors.request.use(async (config) => {
  // If running on the server, just return config (no browser storage/session)
  if (typeof window === "undefined") return config;

  // ✅ Prefer NextAuth session token (fresh), fallback to localStorage only if missing
  let token: string | null = null;
  try {
    const session = await getSession();
    const sessionToken = (session as any)?.accessToken || (session as any)?.user?.accessToken || null;
    console.log("� Token từ NextAuth:", sessionToken);
    token = sessionToken as string | null;
  } catch (e) {
    console.warn("⚠️ getSession() failed:", e);
  }

  // If session token not available, try localStorage (may be legacy/stale)
  if (!token) {
    try {
      const raw = localStorage.getItem("accessToken");
      console.log("🔑 Token raw từ localStorage:", raw);
      if (raw) {
        // If the app accidentally stored an object, try parse; otherwise use raw
        try {
          const parsed = JSON.parse(raw);
          // If parsed is an object with accessToken property, use it
          if (parsed && typeof parsed === "object") {
            token = (parsed.accessToken as string) || (parsed.token as string) || null;
          } else if (typeof parsed === "string") {
            token = parsed;
          }
        } catch (err) {
          // not JSON, use raw value
          token = raw;
        }
      }
    } catch (e) {
      console.warn("⚠️ Could not read localStorage:", e);
    }
  }

  // If still no token, cancel request (no credentials)
  if (!token) {
    console.warn("⚠️ Không có token, hủy request");
    return Promise.reject({ message: "No token provided" });
  }

  // Ensure we don't send 'Bearer Bearer ...' if a stored token already had the prefix
  const cleaned = (typeof token === "string" && token.startsWith("Bearer ")) ? token.slice(7) : token;

  config.headers = config.headers || {};
  (config.headers as any).Authorization = `Bearer ${cleaned}`;

  return config;
});

export default apiClient;
