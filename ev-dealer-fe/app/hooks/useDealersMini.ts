// ===================================
"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/swr";

type DealerMini = { id: string; name: string };
export function useDealersMini() {
  const { data } = useSWR<DealerMini[]>("/dealers?select=id,name", fetcher);
  return { options: data ?? [] };
}
