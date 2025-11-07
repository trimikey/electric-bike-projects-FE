"use client";

import { useEffect, useMemo, useState } from "react";
import apiClient from "@/lib/api";
import { toast } from "sonner";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  mode?: "create" | "edit";
  initialData?: {
    id: string;
    customer_id?: string;
    dealer_id?: string;
    vehicle_model_id?: string;
    staff_id?: string;
    schedule_at?: string; // ISO
    notes?: string;
    status?: "scheduled" | "completed" | "cancelled";
    // Trường hợp API trả nested:
    customer?: { id: string };
    dealer?: { id: string };
    vehicleModel?: { id: string };
    staff?: { id: string };
  };
}

interface Customer {
  id: string;
  full_name: string;
  email: string;
}
interface Dealer {
  id: string;
  name: string;
}
interface Vehicle {
  id: string;
  name: string;
}
interface Staff {
  id: string;
  username: string;
  email: string;
  role?: { name?: string } | string;
}

export default function TestDriveForm({
  onClose,
  onSuccess,
  mode = "create",
  initialData,
}: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    customer_id: "",
    dealer_id: "",
    vehicle_model_id: "",
    staff_id: "",
    schedule_at: "", // datetime-local value
    notes: "",
  });

  // Prefill khi edit
  useEffect(() => {
    if (mode === "edit" && initialData) {
      const getId = (direct?: string, nested?: { id: string }) =>
        direct || nested?.id || "";

      setForm({
        customer_id: getId(initialData.customer_id, initialData.customer),
        dealer_id: getId(initialData.dealer_id, initialData.dealer),
        vehicle_model_id: getId(
          initialData.vehicle_model_id,
          initialData.vehicleModel
        ),
        staff_id: getId(initialData.staff_id, initialData.staff),
        schedule_at: initialData.schedule_at
          ? new Date(initialData.schedule_at).toISOString().slice(0, 16) // for input[type=datetime-local]
          : "",
        notes: initialData.notes || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initialData?.id]);

  // Lấy danh sách từ BE (giữ nguyên như code cũ)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCustomers, resDealers, resVehicles, resUsers] =
          await Promise.all([
            apiClient.get("/customers"),
            apiClient.get("/dealers"),
            apiClient.get("/vehicles/models"),
            apiClient.get("/users"),
          ]);

        setCustomers(resCustomers.data);
        setDealers(resDealers.data);
        setVehicles(resVehicles.data);

        // Lọc Dealer Staff / Dealer Manager (hỗ trợ cả role là string hoặc object)
        const filtered = (resUsers.data || []).filter((u: any) => {
          const roleName =
            typeof u.role === "string" ? u.role : u.role?.name || "";
          return roleName === "Dealer Staff" || roleName === "Dealer Manager";
        });
        setStaffList(filtered);
      } catch (err: any) {
        console.error("⚠️ Lỗi khi tải dữ liệu:", err?.response?.data || err?.message);
        toast.error("Không thể tải dữ liệu danh mục");
      }
    };
    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // min cho datetime-local: +24h (giữ nguyên behavior cũ)
  const minSchedule = useMemo(
    () => new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    []
  );

  const validateSchedule = (value: string) => {
    const selected = new Date(value);
    const nowPlus1Day = new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (isNaN(selected.getTime())) {
      toast.error("Thời gian không hợp lệ");
      return false;
    }

    // ❌ Không cho đặt trong vòng 24h (y như code cũ)
    if (selected < nowPlus1Day) {
      toast.error("Ngày lái thử phải cách ít nhất 1 ngày kể từ hôm nay!");
      return false;
    }

    // ✅ Giới hạn giờ hành chính: 8h–17h
    const hour = selected.getHours();
    if (hour < 8 || hour >= 17) {
      toast.error("Chỉ được đặt lịch trong giờ hành chính (8:00–17:00)");
      return false;
    }

    return true;
  };

  const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      setForm({ ...form, schedule_at: "" });
      return;
    }
    if (!validateSchedule(value)) return;
    setForm({ ...form, schedule_at: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Bảo vệ schedule_at (server cần ISO)
    const payload = {
      ...form,
      schedule_at:
        form.schedule_at && !form.schedule_at.endsWith("Z")
          ? new Date(form.schedule_at).toISOString()
          : form.schedule_at,
    };

    try {
      setLoading(true);

      if (mode === "edit") {
        if (!initialData?.id) {
          toast.error("Thiếu ID lịch lái thử để cập nhật");
          return;
        }
        await apiClient.patch(`/test-drives/${initialData.id}`, payload);
        toast.success("✅ Cập nhật lịch lái thử thành công!");
      } else {
        // create
        await apiClient.post("/test-drives/schedule", payload);
        toast.success("✅ Tạo lịch lái thử thành công!");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("❌ Lỗi khi lưu lịch:", err?.response?.data || err?.message);
      toast.error(err?.response?.data?.message || "Không thể lưu lịch lái thử");
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === "edit" ? "✏️ Chỉnh sửa lịch lái thử" : "🆕 Tạo lịch lái thử";
  const submitLabel = loading
    ? "Đang lưu..."
    : mode === "edit"
    ? "Lưu thay đổi"
    : "Lưu";

  return (
    <div className="fixed inset-0 bg-gray-800/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[420px]">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* 🔹 Chọn khách hàng */}
          <select
            name="customer_id"
            value={form.customer_id}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          >
            <option value="">Chọn khách hàng</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name} ({c.email})
              </option>
            ))}
          </select>

          {/* 🔹 Chọn đại lý */}
          <select
            name="dealer_id"
            value={form.dealer_id}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          >
            <option value="">Chọn đại lý</option>
            {dealers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* 🔹 Chọn xe */}
          <select
            name="vehicle_model_id"
            value={form.vehicle_model_id}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          >
            <option value="">Chọn xe</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>

          {/* 🔹 Chọn nhân viên phụ trách */}
          <select
            name="staff_id"
            value={form.staff_id}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Chọn nhân viên phụ trách</option>
            {staffList.map((s) => {
              const roleName =
                typeof s.role === "string" ? s.role : s.role?.name || "Không rõ vai trò";
              return (
                <option key={s.id} value={s.id}>
                  {s.username} ({roleName})
                </option>
              );
            })}
          </select>

          {/* 🔹 Chọn ngày */}
          <input
            type="datetime-local"
            name="schedule_at"
            value={form.schedule_at}
            min={minSchedule}
            onChange={handleScheduleChange}
            required
            className="w-full border rounded p-2"
          />

          {/* 🔹 Ghi chú */}
          <textarea
            name="notes"
            placeholder="Ghi chú..."
            value={form.notes}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          ></textarea>

          {/* 🔘 Buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
