"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { createMomoPayment } from "@/app/services/payments";

export default function PayWithMomoButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);

  // URL để MoMo redirect lại sau thanh toán
  const baseReturnUrl = useMemo(
    () => `${window.location.origin}/payment/momo/return`,
    []
  );

  const handlePay = async () => {
    try {
      setLoading(true);

      // 👇 truyền returnUrl đầy đủ
      const { qrCodeUrl, paymentUrl, payUrl, deeplink } = await createMomoPayment(
        orderId,
        `${baseReturnUrl}?orderId=${orderId}`
      );

      // Ưu tiên trang web thanh toán (https)
      const webUrl = paymentUrl || payUrl;
      if (webUrl?.startsWith("http")) {
        window.location.href = webUrl; // mở cùng tab để quay lại qua returnUrl
      } else if (deeplink) {
        window.location.href = deeplink; // mobile có app
      } else if (qrCodeUrl) {
        window.open(qrCodeUrl, "_blank"); // hoặc mở modal QR của bạn
      } else {
        toast.warning("Không nhận được đường dẫn thanh toán");
      }
    } catch (err: any) {
      toast.error(err?.message || "Tạo thanh toán thất bại");
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
