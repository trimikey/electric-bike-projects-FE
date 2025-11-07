export type Shipment = {
  id: string;
  type: "factory_to_dealer" | "dealer_to_customer";
  dealer_id: string;
  order_id: string;
  status: "pending" | "in_transit" | "delivered" | "failed";
  shipped_at?: string | null;
  delivered_at?: string | null;
  delivery_address?: string | null;
  created_at?: string;
  updated_at?: string;

  dealer?: { id: string; name: string; email?: string; phone?: string };
  order?: { id: string; status: string; total_amount?: number; customer_id?: string };
};
