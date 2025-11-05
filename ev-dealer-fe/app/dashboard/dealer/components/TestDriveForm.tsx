"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { toast } from "sonner";

interface Props {
    onClose: () => void;
    onSuccess: () => void;
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
    role?: string;
}

export default function TestDriveForm({ onClose, onSuccess }: Props) {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [dealers, setDealers] = useState<Dealer[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [staffList, setStaffList] = useState<Staff[]>([]); // 🆕 Nhân viên phụ trách
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        customer_id: "",
        dealer_id: "",
        vehicle_model_id: "",
        staff_id: "",
        schedule_at: "",
        notes: "",
    });

    // 🧠 Lấy danh sách từ BE
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resCustomers, resDealers, resVehicles, resUsers] = await Promise.all([
                    apiClient.get("/customers"),
                    apiClient.get("/dealers"),
                    apiClient.get("/vehicles/models"),
                    apiClient.get("/users"),
                ]);

                setCustomers(resCustomers.data);
                setDealers(resDealers.data);
                setVehicles(resVehicles.data);

                // 🧩 Lọc nhân viên Dealer Staff / Dealer Manager
                const filtered = resUsers.data.filter(
                    (u: any) =>
                        u.role?.name === "Dealer Staff" || u.role?.name === "Dealer Manager"
                );
                setStaffList(filtered);
            } catch (err: any) {
                // ✅ Lỗi đã qua interceptor: { status, message, errors, raw }
                console.error("⚠️ Lỗi khi tải dữ liệu:", {
                  status: err?.status,
                  message: err?.message,
                  errors: err?.errors,
                });
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient.post("/test-drives/schedule", form);
            toast.success("✅ Tạo lịch lái thử thành công!");
            onSuccess();
            onClose();
        } catch (err: any) {
            // ✅ Lỗi đã qua interceptor: { status, message, errors, raw }
            console.error("❌ Lỗi khi tạo lịch:", {
              status: err?.status,
              message: err?.message,
              errors: err?.errors,
            });
            toast.error(err?.message || "Không thể tạo lịch lái thử");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-800/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[420px]">
                <h2 className="text-lg font-semibold mb-4">🆕 Tạo lịch lái thử</h2>

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

                    {/* 🆕 Chọn nhân viên phụ trách */}
                    <select
                        name="staff_id"
                        value={form.staff_id}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        required
                    >
                        <option value="">Chọn nhân viên phụ trách</option>
                        {staffList.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.username} ({s.role?.name || "Không rõ vai trò"})
                            </option>

                        ))}
                    </select>

                    {/* 🔹 Chọn ngày */}
                    <input
                        type="datetime-local"
                        name="schedule_at"
                        value={form.schedule_at}
                        min={new Date(Date.now() + 24 * 60 * 60 * 1000)
                            .toISOString()
                            .slice(0, 16)}
                        onChange={(e) => {
                            const selected = new Date(e.target.value);
                            const nowPlus1Day = new Date(Date.now() + 24 * 60 * 60 * 1000);

                            // ❌ Không cho đặt trong vòng 24h
                            if (selected < nowPlus1Day) {
                                toast.error("Ngày lái thử phải cách ít nhất 1 ngày kể từ hôm nay!");
                                return;
                            }

                            // ✅ Giới hạn giờ hành chính: 8h–17h
                            const hour = selected.getHours();
                            if (hour < 8 || hour >= 17) {
                                toast.error("Chỉ được đặt lịch trong giờ hành chính (8:00–17:00)");
                                return;
                            }

                            setForm({ ...form, schedule_at: e.target.value });
                        }}
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
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            {loading ? "Đang lưu..." : "Lưu"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
