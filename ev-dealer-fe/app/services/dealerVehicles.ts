import apiClient from "@/lib/api";

export interface DealerVehicle {
  id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
}

export async function listDealerVehicles(dealerId: string) {
  const { data } = await apiClient.get<DealerVehicle[]>(`/dealers/${dealerId}/vehicles`);
  return data;
}

export async function addVehicleToDealer(dealerId: string, payload: { modelId: string; variantId?: string; quantity?: number }) {
  const { data } = await apiClient.post(`/dealers/${dealerId}/vehicles`, payload);
  return data;
}

export async function removeVehicleFromDealer(dealerId: string, vehicleMapIdOrModelId: string) {
  await apiClient.delete(`/dealers/${dealerId}/vehicles/${vehicleMapIdOrModelId}`);
}

