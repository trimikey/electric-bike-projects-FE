// app/dashboard/dealer/components/TestDriveList.tsx
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
  StickyNote,
  Pencil,          // ✅ thêm
} from "lucide-react";
import TestDriveForm from "./TestDriveForm";

interface TestDrive {
  id: string;
  schedule_at: string;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  customer?: { id: string; full_name: string; email: string; phone: string };
  dealer?: { id: string; name: string; address: string; phone: string };
  vehicleModel?: { id: string; name: string };
  staff?: { id: string; username: string; email: string };
  // (tuỳ BE bạn có thêm các *_id hay không, nếu có thì giữ cả id)
  customer_id?: string;
  dealer_id?: string;
  vehicle_model_id?: string;
  staff_id?: string;
}

export default function TestDriveList() {
  const [testDrives, setTestDrives] = useState<TestDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Modal ghi chú
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteEditing, setNoteEditing] = useState("");
  const [noteTdId, setNoteTdId] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);

  // ✅ Modal chỉnh sửa
  const [editOpen, setEditOpen] = useState(false);
  const [editingTd, setEditingTd] = useState<TestDrive | null>(null);

  const loadTestDrives = async () => {
    try {
      setLoading(true);
      const res = await api.get("/test-drives");
      setTestDrives(res.data);
    } catch (err: any) {
      toast.error("Không thể tải danh sách lịch lái thử");
      console.error(err?.response?.data || err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestDrives();
  }, []);

  const handleStatusChange = async (id: string, status: TestDrive["status"]) => {
    try {
      await api.patch(`/test-drives/${id}`, { status });
      toast.success("Cập nhật trạng thái thành công");
      loadTestDrives();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá lịch lái thử này không?")) return;
    try {
      await api.delete(`/test-drives/${id}`);
      toast.success("Đã xoá lịch lái thử");
      loadTestDrives();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Xoá thất bại");
    }
  };

  // Ghi chú
  const openNote = (td: TestDrive) => {
    setNoteTdId(td.id);
    setNoteEditing(td.notes || "");
    setNoteOpen(true);
  };
  const saveNote = async () => {
    if (!noteTdId) return;
    try {
      setSavingNote(true);
      await api.patch(`/test-drives/${noteTdId}`, { notes: noteEditing });
      toast.success("Đã lưu ghi chú");
      setNoteOpen(false);
      loadTestDrives();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lưu ghi chú thất bại");
    } finally {
      setSavingNote(false);
    }
  };

  // ✅ Chỉnh sửa
  const openEdit = (td: TestDrive) => {
    setEditingTd(td);
    setEditOpen(true);
  };

  return (
    <section className="p-6">
      <div className="flex justify-end items-center mb-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          onClick={() => setShowCreateModal(true)}
        >
          <CalendarPlus size={18} />
          Tạo lịch mới
        </button>
      </div>

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
                <th className="p-3 text-left">Ghi chú</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-right">Hành động</th>
              </tr>
            </thead>

            <tbody>
              {testDrives.map((td) => {
                const hasNote = !!td.notes?.trim();
                return (
                  <tr key={td.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{td.customer?.full_name || "—"}</td>
                    <td className="p-3">{td.customer?.phone || "—"}</td>
                    <td className="p-3">{td.vehicleModel?.name || "—"}</td>
                    <td className="p-3">{td.dealer?.name || "—"}</td>
                    <td className="p-3">{td.staff?.username || "—"}</td>
                    <td className="p-3">
                      {new Date(td.schedule_at).toLocaleString("vi-VN")}
                    </td>

                    {/* Ghi chú */}
                    <td className="p-3">
                      {hasNote ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                            <StickyNote size={14} className="mr-1" />
                            note
                          </span>
                          <button
                            onClick={() => openNote(td)}
                            className="text-left underline decoration-dotted hover:decoration-solid max-w-[260px] line-clamp-1"
                            title={td.notes}
                          >
                            {td.notes}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => openNote(td)}
                          className="text-gray-500 hover:text-violet-700 inline-flex items-center gap-1"
                          title="Thêm ghi chú"
                        >
                          <StickyNote size={16} />
                          <span className="underline decoration-dotted">
                            Thêm note
                          </span>
                        </button>
                      )}
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

                    <td className="text-right space-x-3">
                      {/* ✅ Nút sửa */}
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => openEdit(td)}
                        title="Chỉnh sửa"
                      >
                        <Pencil size={18} />
                      </button>

                      {td.status === "scheduled" && (
                        <>
                          <button
                            className="text-green-600 hover:text-green-800"
                            onClick={() =>
                              handleStatusChange(td.id, "completed")
                            }
                            title="Đánh dấu hoàn thành"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() =>
                              handleStatusChange(td.id, "cancelled")
                            }
                            title="Huỷ lịch"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      <button
                        className="text-gray-500 hover:text-red-500"
                        onClick={() => handleDelete(td.id)}
                        title="Xoá lịch"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal tạo lịch */}
      {showCreateModal && (
        <TestDriveForm
          mode="create"               // ✅ thêm
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => loadTestDrives()}
        />
      )}

      {/* ✅ Modal chỉnh sửa */}
      {editOpen && editingTd && (
        <TestDriveForm
          mode="edit"
          initialData={editingTd}
          onClose={() => {
            setEditOpen(false);
            setEditingTd(null);
          }}
          onSuccess={() => {
            setEditOpen(false);
            setEditingTd(null);
            loadTestDrives();
          }}
        />
      )}

      {/* Modal xem/sửa ghi chú */}
      {noteOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <StickyNote size={18} /> Ghi chú lịch lái thử
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setNoteOpen(false)}
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            <textarea
              className="w-full border rounded-lg p-3 min-h-[140px] focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Nhập ghi chú cho lịch lái thử…"
              value={noteEditing}
              onChange={(e) => setNoteEditing(e.target.value)}
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                onClick={() => setNoteOpen(false)}
              >
                Đóng
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-60"
                onClick={saveNote}
                disabled={savingNote}
              >
                {savingNote ? "Đang lưu…" : "Lưu ghi chú"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
