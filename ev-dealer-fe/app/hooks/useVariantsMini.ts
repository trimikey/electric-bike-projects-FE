"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/swr";

export type VariantMini = { id: string; version: string; color: string; base_price: number };

export function useVariantsMini(modelId?: string) {
  // Không gọi nếu chưa chọn model
  const key = modelId
    ? `/vehicles/variants?model_id=${modelId}&select=id,version,color,base_price`
    : null;

  const { data } = useSWR<VariantMini[]>(key, fetcher);
  return { options: data ?? [] };
}
