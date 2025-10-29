"use client";

import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function PayWithMomoButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    try {
      setLoading(true);
      const res = await api.post("/payments", { order_id: orderId, method: "momo" });
      const payUrl = res.data?.payUrl || res.data?.paymentUrl;
      if (payUrl) window.location.href = payUrl;
      else toast.error("Không nhận được đường dẫn thanh toán");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Tạo thanh toán thất bại";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="px-3 py-1.5 rounded-md bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-50"
    >
      {loading ? "Đang xử lý..." : "Thanh toán MoMo"}
    </button>
  );
}
