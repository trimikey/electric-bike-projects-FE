export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  customer?: {
    id?: string;
    full_name: string;
    email: string;
    phone?: string;
  };
  variant?: {
    id?: string;
    version?: string;
    color?: string;
    base_price?: number;
    vehicleModel?: {
      id?: string;
      name: string;          // 👈 tên xe thực tế
      description?: string;  // 👈 mô tả (nếu cần)
    };
  };
  total_amount: number;
  order_date: string; // ISO
  status: OrderStatus;
}
