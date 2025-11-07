import api from "@/lib/api";
import { Shipment } from "@/app/types/shipment";
import { ShipmentPayload } from "@/app/schemas/shipment";

export async function fetchShipments(query?: Record<string, any>) {
  const res = await api.get("/shipments", { params: query });
  return Array.isArray(res.data) ? (res.data as Shipment[]) : (res.data.data as Shipment[]);
}

export async function createShipment(payload: ShipmentPayload) {
  const res = await api.post("/shipments", payload);
  return res.data as Shipment;
}

export async function updateShipment(id: string, payload: Partial<ShipmentPayload>) {
  const res = await api.put(`/shipments/${id}`, payload);
  return res.data as Shipment;
}

export async function deleteShipment(id: string) {
  await api.delete(`/shipments/${id}`);
}

export async function markShipped(id: string) {
  const res = await api.post(`/shipments/${id}/ship`);
  return res.data as Shipment;
}

export async function markDelivered(id: string) {
  const res = await api.post(`/shipments/${id}/deliver`);
  return res.data as Shipment;
}

export async function markFailed(id: string) {
  const res = await api.post(`/shipments/${id}/fail`);
  return res.data as Shipment;
}
