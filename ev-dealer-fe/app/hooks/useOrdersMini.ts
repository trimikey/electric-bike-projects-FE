"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/swr";

type OrderMini = { id: string; status: string };
export function useOrdersMini() {
  // BE: trả mảng đơn; có thể tuỳ endpoint: /orders?select=id,status
  const { data } = useSWR<OrderMini[]>("/orders?select=id,status", fetcher);
  return { options: data ?? [] };
}
