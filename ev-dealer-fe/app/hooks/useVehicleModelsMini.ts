"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/swr";

type ModelMini = { id: string; name: string };
export function useVehicleModelsMini() {
  const { data } = useSWR<ModelMini[]>("/vehicles/models?select=id,name", fetcher);
  return { options: data ?? [] };
}