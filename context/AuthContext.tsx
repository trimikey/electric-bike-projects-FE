"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface User {
  id: string;
  username?: string;
  email: string;
  role_name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User, token: string, refreshToken?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // ✅ Load user từ localStorage khi app khởi động
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        // Chỉ setState sau khi parse thành công
        setUser(parsed);
      } catch (err) {
        console.error("⚠️ Parse user lỗi:", err);
        localStorage.removeItem("user");
      }
    }
  }, []);

  // ✅ Lưu user khi login
  const login = (userData: User, token: string, refreshToken?: string) => {
     console.log("🔑 Gọi login với token:", token);
    try {
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("accessToken", token);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      setUser(userData);
    } catch (err) {
      console.error("⚠️ Lỗi khi lưu user:", err);
    }
  };

  // ✅ Xóa user khi logout
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hook để dùng trong mọi component
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
