import { z } from "zod";

export const shipmentSchema = z.object({
  type: z.enum(["factory_to_dealer", "dealer_to_customer"], {
    required_error: "Chọn loại giao vận",
  }),
  dealer_id: z.string().min(1, "Chọn đại lý"),
  order_id: z.string().min(1, "Chọn đơn hàng"),
  delivery_address: z.string().optional().nullable(),
  status: z.enum(["pending", "in_transit", "delivered", "failed"]).optional(),
});

export type ShipmentPayload = z.infer<typeof shipmentSchema>;
