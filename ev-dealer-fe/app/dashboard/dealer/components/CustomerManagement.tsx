"use client";

import { useEffect, useState } from "react";
import { UserPlus, Edit, Trash2, Loader2 } from "lucide-react";
import apiClient from "@/lib/api";
import { toast } from "sonner";

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  dob?: string;
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    dob: "",
    password: "",
  });

  // 🔹 Lấy danh sách khách hàng
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/customers");
      setCustomers(res.data);
    } catch (err: any) {
      toast.error("Không thể tải danh sách khách hàng");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // 🔹 Xử lý thêm hoặc cập nhật khách hàng
  const handleSave = async () => {
    try {
      if (editing) {
        await apiClient.put(`/customers/${editing.id}`, form);
        toast.success("Cập nhật khách hàng thành công");
      } else {
        await apiClient.post("/customers", form);
        toast.success("Thêm khách hàng thành công");
      }
      setModalOpen(false);
      setEditing(null);
      fetchCustomers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu khách hàng");
    }
  };

  // 🔹 Xóa khách hàng
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa khách hàng này?")) return;
    try {
      await apiClient.delete(`/customers/${id}`);
      toast.success("Xóa thành công");
      fetchCustomers();
    } catch (err) {
      toast.error("Lỗi khi xóa khách hàng");
    }
  };

  // 🔹 Reset form
  const resetForm = () => {
    setForm({
      full_name: "",
      email: "",
      phone: "",
      address: "",
      dob: "",
      password: "",
    });
    setEditing(null);
  };

  return (
    <section className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Quản lý khách hàng
        </h2>
        <button
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
        >
          <UserPlus size={18} /> Thêm khách hàng
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl overflow-hidden border border-gray-100">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-blue-600" size={28} />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Hiện chưa có khách hàng nào.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 font-medium">
              <tr>
                <th className="py-3 px-4 text-left">Họ và tên</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Số điện thoại</th>
                <th className="py-3 px-4 text-left">Ngày sinh</th>
                <th className="py-3 px-4 text-left">Địa chỉ</th>
                <th className="py-3 px-4 text-center w-[100px]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <tr
                  key={c.id}
                  className={`border-t hover:bg-gray-50 transition ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {c.full_name}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{c.email}</td>
                  <td className="py-3 px-4 text-gray-600">{c.phone || "—"}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {c.dob ? new Date(c.dob).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {c.address || "—"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => {
                          setEditing(c);
                          setForm(c);
                          setModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal thêm/sửa khách hàng */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editing ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Họ và tên"
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={!!editing}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                placeholder="Số điện thoại"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="date"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                type="text"
                placeholder="Địa chỉ"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="col-span-2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {!editing && (
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="col-span-2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditing(null);
                }}
                className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
