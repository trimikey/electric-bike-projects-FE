import { z } from "zod";

export const orderCreateSchema = z.object({
  customer_id: z.string().min(1, "Vui lòng chọn khách hàng"),
  dealer_id: z.string().min(1, "Vui lòng chọn đại lý"),
  variant_id: z.string().min(1, "Vui lòng chọn phiên bản xe"),
  total_amount: z.number().positive("Tổng tiền không hợp lệ"),
  payment_method: z.enum(["momo", "vnpay", "cash", "bank_transfer", "installment"]),
});

export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
