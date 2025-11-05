import apiClient from "@/lib/api";

export interface Dealer {
  id: string;
  name: string;
}

export async function listDealers() {
  const { data } = await apiClient.get<Dealer[]>("/dealers");
  return data;
}

