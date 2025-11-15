"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import OrderTable from "../components/orders/OrderTable";
import { createMomoPayment } from "@/app/services/payments";
import OrderForm from "../components/orders/OrderForm";
import { OrderCreateInput } from "@/app/schemas/order";
import { useOrders } from "@/app/hooks/useOrders";
import MomoPaymentModal from "../components/orders/MomoPaymentModal";

export default function OrdersPage() {
  const { orders, isLoading, add, mutate } = useOrders();
  const [openForm, setOpenForm] = useState(false);

  // modal QR (fallback)
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  // returnUrl để MoMo redirect về sau khi thanh toán xong
  const returnUrl = useMemo(
    () => `${window.location.origin}/dashboard/dealer/momo/success`,
    []
  );

  const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const handlePayMomo = async (orderId: string) => {
    try {
      const { paymentUrl, payUrl, qrCodeUrl, deeplink } = await createMomoPayment(
        orderId,
        `${returnUrl}?orderId=${orderId}`
      );

      // 1) Desktop → mở trang https
      const webUrl = paymentUrl || payUrl;
      if (webUrl && webUrl.startsWith("http")) {
        // mở cùng tab để user quay lại site qua returnUrl
        window.location.href = webUrl;
        return;
      }

      // 2) Mobile → ưu tiên deeplink
      if (isMobile() && deeplink) {
        window.location.href = deeplink;
        return;
      }

      // 3) Fallback → hiển thị QR
      if (qrCodeUrl) {
        setQrUrl(qrCodeUrl);
        return;
      }

      toast.warning("Không có URL thanh toán hoặc QR từ MoMo.");
    } catch (e: any) {
      toast.error(e?.message || "Không thể tạo thanh toán MoMo");
    }
  };

  return (
    <section className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">💳 Quản lý đơn hàng</h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          onClick={() => setOpenForm(true)}
        >
          Tạo đơn hàng mới
        </button>
      </div>

      {isLoading ? (
        <div>Đang tải danh sách...</div>
      ) : (
        <OrderTable orders={orders} onPayMomo={handlePayMomo} />
      )}

      <OrderForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onCreate={async (v: OrderCreateInput) => {
          try {
            await add(v);
          } catch (e: any) {
            throw e; // để form giữ mở & hiển thị lỗi field
          }
        }}
      />

      {/* Modal QR fallback */}
      {qrUrl && (
        <MomoPaymentModal
          qrUrl={qrUrl}
          onClose={() => setQrUrl(null)}
          onConfirm={async () => {
            setQrUrl(null);
            await mutate(); // refresh danh sách
          }}
        />
      )}
    </section>
  );
}
