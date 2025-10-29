"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
}

interface Variant {
  id: string;
  version: string;
  color: string;
  base_price: number;
  vehicleModel?: {
    name: string;
  };
}

interface Dealer {
  id: string;
  name: string;
}

export default function OrderForm({ onClose, onSuccess }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    customer_id: "",
    dealer_id: "",
    variant_id: "",
    total_amount: 0,
    payment_method: "momo",
  });

  // 🔹 Fetch dữ liệu ban đầu (song song)
  useEffect(() => {
    (async () => {
      try {
        const [resCus, resVar, resDea] = await Promise.all([
          api.get("/customers"),
          api.get("/vehicles/variants?include=model"), // ✅ lấy cả model
          api.get("/dealers"),
        ]);
        setCustomers(resCus.data);
        setVariants(resVar.data);
        setDealers(resDea.data);
      } catch (err: any) {
        console.error(err);
        toast.error("Không thể tải dữ liệu biểu mẫu");
      }
    })();
  }, []);

  // 🧮 Cập nhật giá khi chọn variant
  const handleVariantChange = (id: string) => {
    const variant = variants.find((v) => v.id === id);
    setForm((prev) => ({
      ...prev,
      variant_id: id,
      total_amount: variant ? Number(variant.base_price) : 0,
    }));
  };

  // 📤 Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_id || !form.dealer_id || !form.variant_id) {
      toast.error("Vui lòng chọn đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      await api.post("/orders", form);
      toast.success("✅ Tạo đơn hàng thành công!");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Không thể tạo đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // 🧱 Giao diện form
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[420px]">
        <h2 className="text-lg font-semibold mb-4">🆕 Tạo đơn hàng mới</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 🔹 Chọn khách hàng */}
          <div>
            <label className="text-sm text-gray-600 block mb-1">Khách hàng</label>
            <select
              name="customer_id"
              value={form.customer_id}
              onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
              required
              className="w-full border rounded-md p-2"
            >
              <option value="">Chọn khách hàng</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} — {c.email}
                </option>
              ))}
            </select>
          </div>

          {/* 🔹 Đại lý */}
          <div>
            <label className="text-sm text-gray-600 block mb-1">Đại lý</label>
            <select
              name="dealer_id"
              value={form.dealer_id}
              onChange={(e) => setForm({ ...form, dealer_id: e.target.value })}
              required
              className="w-full border rounded-md p-2"
            >
              <option value="">Chọn đại lý</option>
              {dealers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* 🔹 Phiên bản xe */}
          <div>
            <label className="text-sm text-gray-600 block mb-1">Phiên bản xe</label>
            <select
              name="variant_id"
              value={form.variant_id}
              onChange={(e) => handleVariantChange(e.target.value)}
              required
              className="w-full border rounded-md p-2"
            >
              <option value="">Chọn xe</option>
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicleModel?.name || "Không rõ model"} – {v.version} ({v.color})
                </option>
              ))}
            </select>
          </div>

          {/* 🔹 Phương thức thanh toán */}
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Phương thức thanh toán
            </label>
            <select
              name="payment_method"
              value={form.payment_method}
              onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
              required
              className="w-full border rounded-md p-2"
            >
              <option value="momo">MoMo</option>
              <option value="vnpay">VNPay</option>
              <option value="cash">Tiền mặt</option>
              <option value="bank_transfer">Chuyển khoản</option>
              <option value="installment">Trả góp</option>
            </select>
          </div>

          {/* 💰 Tổng tiền */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Tổng tiền</label>
            <input
              type="text"
              readOnly
              value={
                form.total_amount
                  ? form.total_amount.toLocaleString("vi-VN") + " ₫"
                  : ""
              }
              className="w-full border rounded-md p-2 bg-gray-50"
            />
          </div>

          {/* 🔘 Buttons */}
          <div className="flex justify-end gap-2 pt-2">
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
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
