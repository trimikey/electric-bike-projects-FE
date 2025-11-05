"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/swr";

type CustomerMini = { id: string; full_name: string };
export function useCustomersMini() {
  const { data } = useSWR<CustomerMini[]>("/customers?select=id,full_name", fetcher);
  return { options: data ?? [] };
}