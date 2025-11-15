import useSWR from "swr";
import { fetcher } from "@/lib/swr";
import { CustomerRef, DealerRef, VariantRef } from "../types/refs";

export function useRefs() {
  const cus = useSWR<CustomerRef[]>("/customers", fetcher);
  const varS = useSWR<VariantRef[]>("/vehicles/variants?include=model", fetcher);
  const dea = useSWR<DealerRef[]>("/dealers", fetcher);

  return {
    customers: cus.data ?? [],
    variants: varS.data ?? [],
    dealers: dea.data ?? [],
    loading: cus.isLoading || varS.isLoading || dea.isLoading,
    error: cus.error || varS.error || dea.error,
  };
}
