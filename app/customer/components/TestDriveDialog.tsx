// app/customer/components/TestDriveDialog.tsx
"use client";

import { useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

type Dealer = { id: string; name: string };
type VehicleModel = { id: string; name: string };

export default function TestDriveDialog({
  open,
  onClose,
  model,
  dealers,
}: {
  open: boolean;
  onClose: () => void;
  model: VehicleModel;
  dealers: Dealer[];
}) {
  const [dealerId, setDealerId] = useState<string>(dealers[0]?.id || "");
  const [scheduleAt, setScheduleAt] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!dealerId || !scheduleAt) {
      toast.error("Vui lòng chọn đại lý và thời gian");
      return;
    }
    try {
      setSubmitting(true);
      // BE: POST /test-drives/schedule
      await api.post("/test-drives/schedule", {
        dealer_id: dealerId,
        vehicle_model_id: model.id,
        schedule_at: new Date(scheduleAt).toISOString(),
        notes,
      });
      toast.success("Đã đặt lịch lái thử!");
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Đặt lịch thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Đặt lịch lái thử – {model.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="text-sm">Chọn đại lý</label>
            <select
              value={dealerId}
              onChange={(e) => setDealerId(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
            >
              {dealers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm">Thời gian</label>
            <input
              type="datetime-local"
              value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm">Ghi chú (không bắt buộc)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 min-h-[100px]"
              placeholder="Ví dụ: cần xe màu trắng, kiểm tra đường chạy…"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200" onClick={onClose}>
            Hủy
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {submitting ? "Đang gửi…" : "Xác nhận đặt lịch"}
          </button>
        </div>
      </div>
    </div>
  );
}
