"use client";
import useSWR from "swr";
import { fetcher, globalMutate } from "@/lib/swr";
import { Complaint } from "@/app/types/complaint";
import { createComplaint, updateComplaint, deleteComplaint, resolveComplaint } from "@/app/services/complaints";

export function useComplaints() {
  const { data, isLoading, mutate } = useSWR<Complaint[]>("/complaints", fetcher);

  return {
    complaints: data ?? [],
    isLoading,
    async create(payload: any) {
      const c = await createComplaint(payload);
      await mutate([...(data ?? []), c], { revalidate: true });
      return c;
    },
    async update(id: string, payload: any) {
      const updated = await updateComplaint(id, payload);
      await mutate((prev) => (prev ?? []).map((x) => (x.id === id ? updated : x)), { revalidate: true });
      return updated;
    },
    async remove(id: string) {
      await deleteComplaint(id);
      await mutate((prev) => (prev ?? []).filter((x) => x.id !== id), { revalidate: false });
      // đồng bộ các trang khác nếu có
      await globalMutate("/complaints");
    },
    async resolve(id: string, status: "resolved" | "rejected" = "resolved") {
      const r = await resolveComplaint(id, status);
      await mutate((prev) => (prev ?? []).map((x) => (x.id === id ? r : x)), { revalidate: false });
      return r;
    },
  };
}
