"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

export default function RegisterForm() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    role_name: "Dealer Staff", // default cho đăng ký
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BE_URL}/users`, form);
      setSuccess("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");
      setForm({ username: "", email: "", password: "", phone: "", role_name: "dealer_staff" });
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi đăng ký");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8"
    >
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Đăng ký tài khoản
      </h2>

      {error && (
        <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 text-green-600 bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
          <input
            type="text"
            name="username"
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={form.username}
            onChange={handleChange}
            placeholder="Nguyễn Văn A"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={form.email}
            onChange={handleChange}
            placeholder="example@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
          <input
            type="password"
            name="password"
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
          <input
            type="tel"
            name="phone"
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={form.phone}
            onChange={handleChange}
            placeholder="0901234567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Vai trò</label>
          <select
            name="role_name"
            value={form.role_name}
            onChange={handleChange}
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="Dealer Staff">Nhân viên đại lý</option>
            <option value="EVM Staff">Nhân viên EVM</option>
            <option value="admin">Quản trị viên</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all disabled:opacity-60"
        >
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>

      <p className="text-sm text-center text-gray-600 mt-4">
        Đã có tài khoản?{" "}
        <a
          href="/login"
          className="text-blue-600 hover:underline font-medium"
        >
          Đăng nhập ngay
        </a>
      </p>
    </motion.div>
  );
}
