"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import {
  CalendarPlus,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import TestDriveForm from "./TestDriveForm";

// 🧩 Interface khớp với backend mới (có include các model liên quan)
interface TestDrive {
  id: string;
  schedule_at: string;
  status: string;
  notes?: string;
  customer?: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
  };
  dealer?: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
  vehicleModel?: {
    id: string;
    name: string;
  };
  staff?: {
    id: string;
    username: string;
    email: string;
  };
}

export default function TestDriveList() {
  const [testDrives, setTestDrives] = useState<TestDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // 🧩 Load danh sách test drive
  const loadTestDrives = async () => {
    try {
      setLoading(true);
      const res = await api.get("/test-drives");
      setTestDrives(res.data);
    } catch (err: any) {
      toast.error("Không thể tải danh sách lịch lái thử");
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };
//
  useEffect(() => {
    loadTestDrives();
  }, []);

  // ✅ Cập nhật trạng thái
  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.put(`/test-drives/${id}/status`, { status });
      toast.success("Cập nhật trạng thái thành công");
      loadTestDrives();
    } catch (err: any) {
      toast.error("Cập nhật thất bại");
    }
  };

  // ❌ Xóa lịch lái thử
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá lịch lái thử này không?")) return;
    try {
      await api.delete(`/test-drives/${id}`);
      toast.success("Đã xoá lịch lái thử");
      loadTestDrives();
    } catch (err: any) {
      toast.error("Xoá thất bại");
    }
  };

  return (
    <section className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">📅 Quản lý lịch lái thử</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <CalendarPlus size={18} />
          Tạo lịch mới
        </button>
      </div>

      {/* Danh sách */}
      {loading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin" /> Đang tải danh sách...
        </div>
      ) : testDrives.length === 0 ? (
        <p>Chưa có lịch lái thử nào.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Khách hàng</th>
                <th className="p-3 text-left">Số điện thoại</th>
                <th className="p-3 text-left">Xe</th>
                <th className="p-3 text-left">Đại lý</th>
                <th className="p-3 text-left">Nhân viên</th>
                <th className="p-3 text-left">Thời gian</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-right">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {testDrives.map((td) => (
                <tr key={td.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{td.customer?.full_name || "—"}</td>
                  <td className="p-3">{td.customer?.phone || "—"}</td>
                  <td className="p-3">{td.vehicleModel?.name || "—"}</td>
                  <td className="p-3">{td.dealer?.name || "—"}</td>
                  <td className="p-3">{td.staff?.username || "—"}</td>
                  <td className="p-3">
                    {new Date(td.schedule_at).toLocaleString("vi-VN")}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        td.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : td.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {td.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-3">
                    {td.status === "scheduled" && (
                      <>
                        <button
                          className="text-green-600 hover:text-green-800"
                          onClick={() =>
                            handleStatusChange(td.id, "completed")
                          }
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={() =>
                            handleStatusChange(td.id, "cancelled")
                          }
                        >
                          <XCircle size={18} />
                        </button>
                      </>
                    )}
                    <button
                      className="text-gray-500 hover:text-red-500"
                      onClick={() => handleDelete(td.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal tạo lịch */}
      {showModal && (
        <TestDriveForm
          onClose={() => setShowModal(false)}
          onSuccess={() => loadTestDrives()}
        />
      )}
    </section>
  );
}
