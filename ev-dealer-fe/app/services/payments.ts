// app/services/payments.ts
import api from "@/lib/api";

type MomoResp = {
  paymentUrl?: string; // https trang thanh toán
  payUrl?: string;     // có hệ thống trả field khác tên
  qrCodeUrl?: string;  // chuỗi momo://... để hiển thị QR/deeplink
  deeplink?: string;   // nếu BE trả
};

export async function createMomoPayment(orderId: string, returnUrl: string): Promise<MomoResp> {
  const { data } = await api.post("/payments/momo", {
    order_id: orderId,
    method: "momo",
    returnUrl,                 // 👈 gửi cho BE để MoMo redirect về đây
  });
  return data;
}
