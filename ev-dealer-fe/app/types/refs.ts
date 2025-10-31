export interface CustomerRef { id: string; full_name: string; email: string; phone?: string }
export interface VariantRef {
  id: string; version: string; color: string; base_price: number;
  vehicleModel?: { name: string };
}
export interface DealerRef { id: string; name: string }
