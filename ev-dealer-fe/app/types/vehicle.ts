// Vehicle Model
export interface VehicleModel {
  id: string;
  name: string;
  description?: string;
  manufacturer_id?: string;
  created_at?: string;
  updated_at?: string;
  manufacturer?: {
    id: string;
    name: string;
  };
}

export interface VehicleModelDetail extends VehicleModel {
  variants?: VehicleVariantDetail[];
  modelSpecs?: VehicleModelSpecDetail[];
}

export type VehicleModelCreate = {
  name: string;
  description?: string;
  manufacturer_id?: string;
};

export type VehicleModelUpdate = {
  name?: string;
  description?: string;
  manufacturer_id?: string | null;
};

// Vehicle Variant
export interface VehicleVariant {
  id: string;
  model_id: string;
  version: string;
  color: string;
  base_price: number;
  thumbnail_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VehicleVariantDetail extends VehicleVariant {
  vehicleModel?: VehicleModel;
}

export type VehicleVariantCreate = {
  model_id: string;
  version: string;
  color: string;
  base_price: number;
  thumbnail_url?: string;
};

export type VehicleVariantUpdate = {
  model_id?: string;
  version?: string;
  color?: string;
  base_price?: number;
  thumbnail_url?: string;
};

// Vehicle Model Spec
export interface VehicleModelSpecDetail {
  id: string;
  model_id: string;
  spec_id: string;
  value: string;
  spec?: {
    id: string;
    name: string;
    category?: string;
    unit?: string;
  };
}

export type VehicleModelSpecAttach = {
  model_id: string;
  value: string;
  spec: {
    id?: string;
    name: string;
    category?: string;
    unit?: string;
  };
};

