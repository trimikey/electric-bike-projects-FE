import apiClient from "@/lib/api";
import type {
  VehicleModel,
  VehicleModelDetail,
  VehicleModelCreate,
  VehicleModelUpdate,
  VehicleVariant,
  VehicleVariantDetail,
  VehicleVariantCreate,
  VehicleVariantUpdate,
  VehicleModelSpecDetail,
  VehicleModelSpecAttach,
} from "@/app/types/vehicle";

// Models
export async function listModels() {
  const { data } = await apiClient.get<VehicleModelDetail[]>("/vehicles/models");
  return data;
}

export async function getModel(id: string) {
  const { data } = await apiClient.get<VehicleModelDetail>(`/vehicles/models/${id}`);
  return data;
}

export async function createModel(payload: VehicleModelCreate) {
  const { data } = await apiClient.post<{ message: string; model: VehicleModelDetail }>("/vehicles/models", payload);
  return data;
}

export async function updateModel(id: string, payload: VehicleModelUpdate) {
  const { data } = await apiClient.put<{ message: string; model: VehicleModelDetail }>(`/vehicles/models/${id}`, payload);
  return data;
}

export async function deleteModel(id: string) {
  await apiClient.delete(`/vehicles/models/${id}`);
}

// Variants
export async function listVariants() {
  const { data } = await apiClient.get<VehicleVariantDetail[]>("/vehicles/variants");
  return data;
}

export async function getVariant(id: string) {
  const { data } = await apiClient.get<VehicleVariantDetail>(`/vehicles/variants/${id}`);
  return data;
}

export async function createVariant(payload: VehicleVariantCreate) {
  const { data } = await apiClient.post<{ message: string; variant: VehicleVariantDetail }>("/vehicles/variants", payload);
  return data;
}

export async function updateVariant(id: string, payload: VehicleVariantUpdate) {
  const { data } = await apiClient.put<{ message: string; variant: VehicleVariantDetail }>(`/vehicles/variants/${id}`, payload);
  return data;
}

export async function deleteVariant(id: string) {
  await apiClient.delete(`/vehicles/variants/${id}`);
}

// Model Specs
export async function attachModelSpec(payload: VehicleModelSpecAttach) {
  const { data } = await apiClient.post<{ message: string; vehicleModelSpec: VehicleModelSpecDetail }>("/vehicles/model-specs", payload);
  return data;
}

