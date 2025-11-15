import api from "@/lib/api";
import { CustomerRef, DealerRef, VariantRef } from "../types/refs";

export async function listCustomers(): Promise<CustomerRef[]> {
  const { data } = await api.get("/customers"); return data;
}
export async function listDealers(): Promise<DealerRef[]> {
  const { data } = await api.get("/dealers"); return data;
}
export async function listVariants(): Promise<VariantRef[]> {
  const { data } = await api.get("/vehicles/variants?include=model"); return data;
}
