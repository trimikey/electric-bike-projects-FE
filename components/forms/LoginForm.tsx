"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { data: session, status } = useSession();
  const router = useRouter();

  // ✅ Nếu đã đăng nhập rồi thì tự động redirect đúng dashboard
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role_name) {
      const role = session.user.role_name;
      console.log("🔄 Redirect from /login ->", role);
      switch (role) {
        case "Admin":
          router.push("/dashboard/admin");
          break;
        case "EVM Staff":
          router.push("/dashboard/evm");
          break;
        case "Dealer Manager":
        case "Dealer Staff":
          router.push("/dashboard/dealer");
          break;
        default:
          router.push("/customer");
      }
    }
  }, [status, session, router]);

  // 🔹 Đăng nhập nội bộ (Credentials)
  const handleInternalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Sai email hoặc mật khẩu!");
      } else {
        // ✅ Lấy session để lấy role
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        const role = session?.user?.role_name;

        console.log("🔍 Role:", role);

        switch (role) {
          case "Admin":
            router.push("/dashboard/admin");
            break;
          case "EVM Staff":
            router.push("/dashboard/evm");
            break;
          case "Dealer Manager":
          case "Dealer Staff":
            router.push("/dashboard/dealer");
            break;
          default:
            router.push("/dashboard/customer");
        }
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setError("Lỗi đăng nhập, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Đăng nhập bằng Google (Customer)
  // trong LoginForm.tsx
const handleGoogleLogin = async () => {
  try {
    // Cho phép redirect (mặc định) để hoàn tất OAuth handshake
    await signIn("google"); // có thể truyền callbackUrl nếu muốn

    // Sau khi auth xong, session đã có googleIdToken từ callback
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();

    const idToken = session?.googleIdToken;
    if (!idToken) {
      console.error("Không tìm thấy googleIdToken trong session");
      setError("Không thể lấy Google ID Token!");
      return;
    }

    // Gửi đúng idToken cho BE để verify
    const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      throw new Error(data?.message || data?.error || "BE verify failed");
    }

    router.push("/dashboard/customer");
  } catch (err) {
    console.error("Google login failed:", err);
    setError("Không thể đăng nhập bằng Google!");
  }
};


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 mt-10"
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
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
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
          <label className="block text-sm font-medium text-gray-700">
            Mật khẩu
          </label>
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
