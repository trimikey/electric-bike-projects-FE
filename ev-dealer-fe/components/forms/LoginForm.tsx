"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Đăng nhập nội bộ (qua Credentials Provider)
  const handleInternalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Gọi NextAuth → CredentialsProvider sẽ call BE /users/login
      const res = await signIn("credentials", {
        redirect: false, // không redirect ngay, tự điều hướng thủ công
        email,
        password,
      });

      if (res?.error) {
        setError("Sai email hoặc mật khẩu!");
      } else {
        // ✅ Lấy lại session để biết role
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        const role = session?.user?.role_name;

        console.log("🔍 Role name:", role);

        // ✅ Redirect đúng dashboard theo role
        switch (role) {
          case "Admin":
            window.location.href = "/dashboard/admin";
            break;
          case "EVM Staff":
            window.location.href = "/dashboard/evm";
            break;
          case "Dealer Manager":
          case "Dealer Staff":
            window.location.href = "/dashboard/dealer";
            break;
          default:
            window.location.href = "/dashboard/customer";
        }
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setError("Lỗi đăng nhập, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Google login cho Customer
  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/dashboard/customer" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8"
    >
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Đăng nhập
      </h2>

      {/* ⚠️ Hiển thị lỗi */}
      {error && (
        <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {/* 🧩 FORM ĐĂNG NHẬP */}
      <form onSubmit={handleInternalLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@evdealer.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
          <input
            type="password"
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-60"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      {/* 🧭 DIVIDER */}
      <div className="flex items-center my-6">
        <div className="flex-1 h-px bg-gray-300" />
        <span className="px-3 text-gray-500 text-sm">hoặc</span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>

      {/* 🌐 GOOGLE LOGIN */}
      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
      >
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google"
          className="w-5 h-5 mr-2"
        />
        <span>Đăng nhập với Google</span>
      </button>

      {/* 🧾 LINK ĐĂNG KÝ */}
      <p className="text-sm text-center text-gray-600 mt-3">
        Chưa có tài khoản?{" "}
        <a
          href="/register"
          className="text-blue-600 hover:underline font-medium"
        >
          Đăng ký ngay
        </a>
      </p>
    </motion.div>
  );
}
