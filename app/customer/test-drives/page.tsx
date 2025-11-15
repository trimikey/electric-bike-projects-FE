// app/customer/test-drives/book/page.tsx
"use client";

import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type Dealer = { id: string; name: string; address?: string; phone?: string };
type Variant = { id: string; version: string; color: string; base_price?: number | string };
type VehicleModel = {
  id: string;
  name: string;
  manufacturer?: { name?: string } | null;
  variants?: Variant[];
};

const vnd = (n?: number | string | null) =>
  n == null ? "—" : (typeof n === "string" ? Number(n) : n).toLocaleString("vi-VN") + " đ";

export default function TestDriveBookingPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // ⛽ data
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);

  // 🧾 form
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [modelId, setModelId] = useState<string>("");
  const [dealerId, setDealerId] = useState<string>("");
  const [when, setWhen] = useState<string>(""); // datetime-local
  const [notes, setNotes] = useState("");
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Prefill từ session (nếu có)
  useEffect(() => {
    if (session?.user) {
      setCustomerName(session.user.name || "");
      setCustomerEmail(session.user.email || "");
      // Nếu BE có endpoint /customers/me hãy load phone ở đây; tạm để trống
    }
  }, [session?.user]);

  // Load DS xe & đại lý
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [m, d] = await Promise.all([
          api.get<VehicleModel[]>("/vehicles/models"),
          api.get<Dealer[]>("/dealers"),
        ]);
        setModels(m.data || []);
        setDealers(d.data || []);
        // chọn mặc định
        if ((m.data || []).length) setModelId(m.data[0].id);
        if ((d.data || []).length) setDealerId(d.data[0].id);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ràng buộc: tối thiểu +2h
  const minDateTime = useMemo(() => {
    const dt = new Date();
    dt.setHours(dt.getHours() + 2);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(
      dt.getMinutes()
    )}`;
  }, []);

  const selectedModel = useMemo(
    () => models.find((m) => m.id === modelId),
    [models, modelId]
  );
  const pickedDealer = useMemo(
    () => dealers.find((d) => d.id === dealerId),
    [dealers, dealerId]
  );

  async function submit() {
    // kiểm tra tối thiểu
    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      alert("Vui lòng nhập đủ họ tên, số điện thoại và email.");
      return;
    }
    if (!modelId || !dealerId || !when) {
      alert("Vui lòng chọn mẫu xe, đại lý và thời gian lái thử.");
      return;
    }
    if (!agree) {
      alert("Vui lòng đồng ý điều khoản & chính sách.");
      return;
    }

    try {
      setSubmitting(true);

      // Ở BE bạn đã có /test-drives/schedule:
      // body cần: customer_id (lấy từ token ở middleware, hoặc gửi lên), dealer_id, vehicle_model_id, staff_id?(optional), schedule_at, notes
      // Ở đây FE gửi dealer_id, vehicle_model_id, schedule_at, notes — BE map customer từ session
      await api.post("/test-drives/schedule", {
        dealer_id: dealerId,
        vehicle_model_id: modelId,
        schedule_at: new Date(when).toISOString(),
        notes,
      });

      alert("Đăng ký lái thử thành công!");
      router.replace("/customer/test-drives"); // về danh sách lịch của tôi
    } catch (e: any) {
      console.error(e.response?.data || e.message);
      alert(e.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Đang tải dữ liệu…</p>;

  return (
    <section className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-1">Đăng ký lái thử</h1>
      <p className="text-gray-600 mb-6">
        Quý khách vui lòng điền thông tin bên dưới. EV Dealer sẽ liên hệ xác nhận lịch hẹn.
      </p>

      {/* Bước 1: Thông tin khách hàng */}
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4">1. Thông tin khách hàng</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Họ và tên *</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="VD: Nguyễn Văn A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Số điện thoại *</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="VD: 0901234567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="VD: ban@example.com"
              type="email"
            />
          </div>
        </div>
      </div>

      {/* Bước 2: Chọn xe & đại lý */}
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4">2. Chọn xe & đại lý</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mẫu xe *</label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.manufacturer?.name ? `– ${m.manufacturer?.name}` : ""}
                </option>
              ))}
            </select>
            {selectedModel?.variants?.[0] && (
              <p className="text-sm text-gray-600 mt-2">
                Giá tham khảo từ: {vnd(selectedModel.variants[0].base_price)}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Đại lý *</label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={dealerId}
              onChange={(e) => setDealerId(e.target.value)}
            >
              {dealers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {pickedDealer && (
              <p className="text-sm text-gray-600 mt-2">
                {pickedDealer.address || ""} {pickedDealer.phone ? `• ${pickedDealer.phone}` : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bước 3: Chọn thời gian */}
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4">3. Chọn thời gian</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Ngày & giờ lái thử *</label>
            <input
              type="datetime-local"
              className="w-full border rounded-lg px-3 py-2"
              min={minDateTime}
              value={when}
              onChange={(e) => setWhen(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Gợi ý: đặt lịch trước ít nhất 2 giờ để đại lý sắp xếp xe & nhân sự.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ghi chú</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 h-[90px]"
              placeholder="Ví dụ: Tôi muốn lái phiên bản màu trắng, đem theo 2 người bạn…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bước 4: Điều khoản */}
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4">4. Điều khoản</h2>
        <label className="inline-flex items-start gap-2">
          <input
            type="checkbox"
            className="mt-[3px]"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          <span className="text-sm text-gray-700">
            Tôi xác nhận thông tin cung cấp là chính xác, đồng ý để EV Dealer/đại lý liên hệ tư vấn,
            và chấp nhận các điều khoản về an toàn & lái thử.
          </span>
        </label>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          onClick={submit}
          disabled={submitting}
          className="px-5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {submitting ? "Đang gửi..." : "Đăng ký lái thử"}
        </button>
        <button
          onClick={() => router.push("/customer")}
          className="px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
        >
          Về trang xe
        </button>
      </div>
    </section>
  );
}
