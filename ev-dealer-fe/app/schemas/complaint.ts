import { z } from "zod";

export const complaintSchema = z.object({
  customer_id: z.string().min(1, "Chọn khách hàng"),
  dealer_id: z.string().optional().nullable(),
  description: z.string().min(5, "Mô tả tối thiểu 5 ký tự"),
  status: z.enum(["pending", "in_progress", "resolved", "rejected"]).optional(),
});

export type ComplaintPayload = z.infer<typeof complaintSchema>;
