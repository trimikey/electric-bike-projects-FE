import api from "@/lib/api";
import { Order } from "../types/order";
import { OrderCreateInput } from "../schemas/order";


export async function listOrders(): Promise<Order[]> {
  const { data } = await api.get("/orders");
  return data;
}

export async function createOrder(payload: OrderCreateInput): Promise<Order> {
  const { data } = await api.post("/orders", payload);
  return data;
}
