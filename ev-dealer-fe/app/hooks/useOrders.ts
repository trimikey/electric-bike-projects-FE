import useSWR from "swr";
import { fetcher } from "@/lib/swr";
import { Order } from "../types/order";
import { createOrder } from "../services/orders";

const KEY = "/orders";

export function useOrders() {
  const { data, error, isLoading, mutate } = useSWR<Order[]>(KEY, fetcher);

  const add = async (payload: any) => {
    await mutate(async (current) => {
      const created = await createOrder(payload);
      return current ? [created, ...current] : [created];
    }, { revalidate: false });
    await mutate();
  };

  return { orders: data ?? [], isLoading, isError: !!error, add, mutate };
}
