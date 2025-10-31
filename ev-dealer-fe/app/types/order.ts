export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface Order {
  id: string;
  customer?: { id?: string; full_name: string; email: string };
  variant?: { id?: string; name?: string; version?: string; color?: string };
  total_amount: number;
  order_date: string; // ISO
  status: OrderStatus;
}
