"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Dealer {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  manager?: { username?: string; email?: string };
}

export default function DealerManagement() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Dealer | null>(null);
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  // 🔹 Load danh sách đại lý
  const loadDealers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/dealers");
      setDealers(res.data);
    } catch (err: any) {
      console.error("❌ Lỗi khi lấy danh sách đại lý:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDealers();
  }, []);

  // 🔹 Xử lý input form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Tạo hoặc cập nhật đại lý
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await apiClient.put(`/dealers/${editing.id}`, form);
      } else {
        await apiClient.post("/dealers", form);
      }
      setForm({ name: "", address: "", phone: "", email: "" });
      setEditing(null);
      loadDealers();
    } catch (err: any) {
      console.error("❌ Lỗi khi lưu đại lý:", err.response?.data || err.message);
    }
  };

  // 🔹 Xóa đại lý
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đại lý này?")) return;
    try {
      await apiClient.delete(`/dealers/${id}`);
      loadDealers();
    } catch (err: any) {
      console.error("❌ Lỗi khi xóa:", err.response?.data || err.message);
    }
  };

  // 🔹 Bắt đầu chỉnh sửa
  const startEdit = (dealer: Dealer) => {
    setEditing(dealer);
    setForm({
      name: dealer.name,
      address: dealer.address || "",
      phone: dealer.phone || "",
      email: dealer.email || "",
    });
  };

  return (
    <section className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Quản lý đại lý</h2>
        
      </div>

      {/* Form thêm/sửa */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-4 mb-6 space-y-3"
      >
        <h3 className="font-medium mb-2">
          {editing ? "Cập nhật đại lý" : "Thêm đại lý mới"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            name="name"
            placeholder="Tên đại lý"
            value={form.name}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            name="address"
            placeholder="Địa chỉ"
            value={form.address}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            name="phone"
            placeholder="Số điện thoại"
            value={form.phone}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {editing ? "Lưu thay đổi" : "Thêm đại lý"}
        </button>
      </form>

      {/* Danh sách đại lý */}
      {loading ? (
        <p>Đang tải danh sách đại lý...</p>
      ) : dealers.length === 0 ? (
        <p>Chưa có đại lý nào.</p>
      ) : (
        <table className="w-full bg-white shadow rounded-lg border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Tên</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">SĐT</th>
              <th className="p-2 border">Địa chỉ</th>
              <th className="p-2 border">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {dealers.map((d) => (
              <tr key={d.id} className="border-t">
                <td className="p-2">{d.name}</td>
                <td className="p-2">{d.email}</td>
                <td className="p-2">{d.phone}</td>
                <td className="p-2">{d.address}</td>
                <td className="p-2 flex gap-2">
                  <button
                    onClick={() => startEdit(d)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
