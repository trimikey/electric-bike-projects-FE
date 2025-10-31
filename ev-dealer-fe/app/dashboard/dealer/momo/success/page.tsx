"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api"; // 👈 axios instance có token và baseURL

export default function MomoSuccessPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    (async () => {
      try {
        const resultCode = params.get("resultCode");
        const momoOrderId = params.get("orderId"); // id do MoMo tự sinh
        const requestId = params.get("requestId");
        const realOrderId = params.get("extraData"); // order_id thật bạn gửi trong extraData

        if (resultCode === "0") {
          // ✅ Gọi BE verify (Cách 2)
          await api.post("/payments/momo/verify", {
            orderId: momoOrderId,
            requestId,
            realOrderId,
          });

          toast.success("✅ Thanh toán MoMo thành công!");
          router.replace("/dashboard/dealer/orders?paid=1"); // quay về trang Order
        } else {
          toast.warning("⚠️ Thanh toán chưa thành công hoặc bị hủy.");
          router.replace("/dashboard/dealer/orders");
        }
      } catch (e: any) {
        console.error("❌ Verify MoMo thất bại:", e);
        toast.error(e?.response?.data?.message || "Không xác nhận được thanh toán.");
        router.replace("/dashboard/dealer/orders");
      }
    })();
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-700 text-lg">
      Đang xác nhận thanh toán MoMo, vui lòng chờ...
    </div>
  );
}
