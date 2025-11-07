"use client";
import useSWR from "swr";
import api from "@/lib/api";
import { globalMutate } from "@/lib/swr";
import { Shipment } from "@/app/types/shipment";
import { createShipment, deleteShipment, markDelivered, markFailed, markShipped, updateShipment } from "../services/shipment";

function normalizer(d: any): Shipment[] {
  // Chuẩn hoá: nếu BE trả mảng -> dùng luôn; nếu trả {data, meta} -> lấy data; nếu null/undefined -> []
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  return [];
}

export function useShipments() {
  const { data, isLoading, mutate } = useSWR<Shipment[]>(
    "/shipments",
    async (url) => {
      const res = await api.get(url);
      return normalizer(res.data);
    }
  );

  const shipments = normalizer(data);

  return {
    shipments,
    isLoading,
    async create(payload: any) {
      const s = await createShipment(payload);
      await mutate([...(shipments ?? []), s], { revalidate: true });
      return s;
    },
    async update(id: string, payload: any) {
      const s = await updateShipment(id, payload);
      await mutate((prev) => normalizer(prev).map((x) => (x.id === id ? s : x)), { revalidate: false });
      return s;
    },
    async remove(id: string) {
      await deleteShipment(id);
      await mutate((prev) => normalizer(prev).filter((x) => x.id !== id), { revalidate: false });
      await globalMutate("/shipments");
    },
    async ship(id: string) {
      const s = await markShipped(id);
      await mutate((prev) => normalizer(prev).map((x) => (x.id === id ? s : x)), { revalidate: false });
      return s;
    },
    async deliver(id: string) {
      const s = await markDelivered(id);
      await mutate((prev) => normalizer(prev).map((x) => (x.id === id ? s : x)), { revalidate: false });
      return s;
    },
    async fail(id: string) {
      const s = await markFailed(id);
      await mutate((prev) => normalizer(prev).map((x) => (x.id === id ? s : x)), { revalidate: false });
      return s;
    },
  };
}
