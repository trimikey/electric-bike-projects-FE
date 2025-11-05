import { z } from "zod";

export const quoteSchema = z.object({
  customer_id: z.string().min(1, "Chọn khách hàng"),
  dealer_id: z.string().min(1, "Chọn đại lý"),
  variant_id: z.string().min(1, "Chọn phiên bản"),
  price: z.coerce.number().positive("Giá phải > 0"),
});

export type QuotePayload = z.infer<typeof quoteSchema>;

// ===================================
// FILE: app/types/quote.ts
// ===================================
export type Quote = {
  id: string;
  customer_id: string;
  dealer_id: string;
  variant_id: string;
  price: number;
  customer?: { id: string; full_name: string; email: string; phone?: string };
  dealer?: { id: string; name: string; email: string; phone?: string };
  variant?: { id: string; version: string; color: string; model_id: string; base_price: number };
};
