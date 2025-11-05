"use client";

import { useState } from "react";
import useSWR from "swr";
import { listModels, createModel, updateModel, deleteModel, getModel } from "@/app/services/vehicles";
import { listVariants, createVariant, updateVariant, deleteVariant } from "@/app/services/vehicles";
import type { VehicleModelDetail, VehicleModelCreate, VehicleVariantDetail, VehicleVariantCreate } from "@/app/types/vehicle";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ViewMode = "models" | "variants";

export default function VehicleCatalogPage() {
    const [viewMode, setViewMode] = useState<ViewMode>("models");
    const { data: models, error: modelsError, isLoading: modelsLoading, mutate: mutateModels } = useSWR("vehicles:models", listModels);
    const { data: variants, error: variantsError, isLoading: variantsLoading, mutate: mutateVariants } = useSWR("vehicles:variants", listVariants);
    
    // Model state
    const [modelOpen, setModelOpen] = useState(false);
    const [editingModel, setEditingModel] = useState<VehicleModelDetail | null>(null);
    const [modelForm, setModelForm] = useState<VehicleModelCreate>({ name: "", description: "", manufacturer_id: "" });
    const [modelSubmitting, setModelSubmitting] = useState(false);
    const [modelError, setModelError] = useState("");

    // Model detail view state
    const [detailModel, setDetailModel] = useState<VehicleModelDetail | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);

    // Variant state
    const [variantOpen, setVariantOpen] = useState(false);
    const [editingVariant, setEditingVariant] = useState<VehicleVariantDetail | null>(null);
    const [variantForm, setVariantForm] = useState<VehicleVariantCreate>({ model_id: "", version: "", color: "", base_price: 0, thumbnail_url: "" });
    const [variantSubmitting, setVariantSubmitting] = useState(false);
    const [variantError, setVariantError] = useState("");
    const [imagePreview, setImagePreview] = useState<string>("");
    const [uploadingImage, setUploadingImage] = useState(false);

    const onOpenCreateModel = () => {
        setEditingModel(null);
        setModelForm({ name: "", description: "", manufacturer_id: "" });
        setModelError("");
        setModelOpen(true);
    };

    const onOpenEditModel = (m: VehicleModelDetail) => {
        setEditingModel(m);
        setModelForm({ name: m.name, description: m.description || "", manufacturer_id: m.manufacturer_id || "" });
        setModelError("");
        setModelOpen(true);
    };

    const onSubmitModel = async () => {
        try {
            setModelSubmitting(true);
            setModelError("");

            if (!modelForm.name?.trim()) {
                setModelError("Tên model là bắt buộc");
                return;
            }

            const payload: VehicleModelCreate = {
                name: modelForm.name.trim(),
                description: modelForm.description?.trim() || undefined,
                manufacturer_id: modelForm.manufacturer_id?.trim() || undefined,
            };

            if (editingModel) {
                await updateModel(editingModel.id, payload);
            } else {
                await createModel(payload);
            }

            setModelOpen(false);
            setModelError("");
            await mutateModels();
        } catch (e: any) {
            const errorObj = e || {};
            const status = errorObj?.status;
            const errorMessage = errorObj?.message || errorObj?.raw?.response?.data?.message || "Lỗi không xác định";
            setModelError(errorMessage || `Lỗi: ${status || "Không xác định"}`);
        } finally {
            setModelSubmitting(false);
        }
    };

    const onDeleteModel = async (m: VehicleModelDetail) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa model "${m.name}"?`)) return;
        try {
            await deleteModel(m.id);
            await mutateModels();
        } catch (e: any) {
            const errorMsg = e?.message || e?.raw?.response?.data?.message || "Xóa thất bại";
            alert(errorMsg);
        }
    };

    const onOpenCreateVariant = () => {
        setEditingVariant(null);
        setVariantForm({ model_id: "", version: "", color: "", base_price: 0, thumbnail_url: "" });
        setImagePreview("");
        setVariantError("");
        setVariantOpen(true);
    };

    const onOpenEditVariant = (v: VehicleVariantDetail) => {
        setEditingVariant(v);
        setVariantForm({ 
            model_id: v.model_id, 
            version: v.version, 
            color: v.color, 
            base_price: v.base_price, 
            thumbnail_url: v.thumbnail_url || "" 
        });
        setImagePreview(v.thumbnail_url || "");
        setVariantError("");
        setVariantOpen(true);
    };

    const onOpenModelDetail = async (modelId: string) => {
        setDetailLoading(true);
        setDetailOpen(true);
        try {
            const model = await getModel(modelId);
            setDetailModel(model);
        } catch (e: any) {
            console.error("Error loading model detail:", e);
            setDetailModel(null);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setVariantError("Chỉ chấp nhận file ảnh (jpg, png, gif, webp)");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setVariantError("File quá lớn (tối đa 5MB)");
            return;
        }

        setUploadingImage(true);
        setVariantError("");

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Upload thất bại");
            }

            const data = await response.json();
            const url = typeof window !== "undefined" ? `${window.location.origin}${data.url}` : data.url;
            
            setVariantForm({ ...variantForm, thumbnail_url: url });
            setImagePreview(url);
        } catch (error: any) {
            console.error("Upload error:", error);
            setVariantError(error.message || "Upload ảnh thất bại");
        } finally {
            setUploadingImage(false);
        }
    };

    const onSubmitVariant = async () => {
        try {
            setVariantSubmitting(true);
            setVariantError("");

            if (!variantForm.model_id?.trim() || !variantForm.version?.trim() || !variantForm.color?.trim() || !variantForm.base_price) {
                setVariantError("Vui lòng nhập đủ Model ID, Version, Color và Base Price");
                return;
            }

            // Validate URL nếu có (có thể là URL từ upload hoặc URL bên ngoài)
            let thumbnailUrl = variantForm.thumbnail_url?.trim();
            if (thumbnailUrl) {
                // Nếu là URL relative (từ upload), chuyển thành absolute
                if (thumbnailUrl.startsWith("/")) {
                    thumbnailUrl = typeof window !== "undefined" ? `${window.location.origin}${thumbnailUrl}` : thumbnailUrl;
                } else {
                    // Validate URL bên ngoài
                    try {
                        new URL(thumbnailUrl);
                    } catch {
                        setVariantError("URL ảnh không hợp lệ. Vui lòng upload ảnh hoặc nhập URL hợp lệ");
                        return;
                    }
                }
            }

            const payload: VehicleVariantCreate = {
                model_id: variantForm.model_id.trim(),
                version: variantForm.version.trim(),
                color: variantForm.color.trim(),
                base_price: Number(variantForm.base_price),
                thumbnail_url: thumbnailUrl || undefined,
            };

            if (editingVariant) {
                await updateVariant(editingVariant.id, payload);
            } else {
                await createVariant(payload);
            }

            setVariantOpen(false);
            setVariantError("");
            await mutateVariants();
            await mutateModels();
        } catch (e: any) {
            const errorObj = e || {};
            const status = errorObj?.status;
            const errorMessage = errorObj?.message || errorObj?.raw?.response?.data?.message || "Lỗi không xác định";
            setVariantError(errorMessage || `Lỗi: ${status || "Không xác định"}`);
        } finally {
            setVariantSubmitting(false);
        }
    };

    const onDeleteVariant = async (v: VehicleVariantDetail) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa variant "${v.version} - ${v.color}"?`)) return;
        try {
            await deleteVariant(v.id);
            await mutateVariants();
            await mutateModels();
        } catch (e: any) {
            const errorMsg = e?.message || e?.raw?.response?.data?.message || "Xóa thất bại";
            alert(errorMsg);
        }
    };

    const isLoading = viewMode === "models" ? modelsLoading : variantsLoading;
    const error = viewMode === "models" ? modelsError : variantsError;

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Danh mục xe đại lý</h2>
                    <p className="text-sm text-gray-500">Quản lý danh mục xe, variants và specs</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={viewMode === "models" ? "default" : "outline"}
                        onClick={() => setViewMode("models")}
                    >
                        Models
                    </Button>
                    <Button
                        variant={viewMode === "variants" ? "default" : "outline"}
                        onClick={() => setViewMode("variants")}
                    >
                        Variants
                    </Button>
                    {viewMode === "models" ? (
                        <Button onClick={onOpenCreateModel}>Thêm Model</Button>
                    ) : (
                        <Button onClick={onOpenCreateVariant}>Thêm Variant</Button>
                    )}
                </div>
            </div>

            {isLoading && <div>Đang tải...</div>}
            {error && <div className="text-red-500">Lỗi: {(error as any)?.message || "Không tải được"}</div>}

            {viewMode === "models" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {models?.map((m) => (
                        <div key={m.id} className="rounded-xl border bg-white p-4">
                            <h3 className="font-semibold text-lg">{m.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{m.description || "Không có mô tả"}</p>
                            <div className="mt-3 text-sm text-gray-500">
                                {m.variants?.length || 0} variant(s)
                            </div>
                            <div className="mt-3 flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => onOpenModelDetail(m.id)}>Xem chi tiết</Button>
                                <Button variant="outline" size="sm" onClick={() => onOpenEditModel(m)}>Sửa</Button>
                                <Button variant="outline" size="sm" onClick={() => onDeleteModel(m)}>Xóa</Button>
                            </div>
                        </div>
                    ))}
                    {!models?.length && <div className="text-gray-500 col-span-full text-center py-8">Chưa có model nào</div>}
                </div>
            )}

            {viewMode === "variants" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {variants?.map((v) => (
                        <div key={v.id} className="rounded-xl border bg-white p-4">
                            <img
                                src={v.thumbnail_url || "/vehicles/default.jpg"}
                                alt={`${v.version} - ${v.color}`}
                                className="h-40 w-full rounded-lg object-cover mb-3"
                            />
                            <h3 className="font-semibold">{v.version}</h3>
                            <p className="text-sm text-gray-600">Màu: {v.color}</p>
                            <p className="text-sm font-medium">Giá: {Number(v.base_price).toLocaleString()}đ</p>
                            {v.vehicleModel && (
                                <p className="text-xs text-gray-500 mt-1">Model: {v.vehicleModel.name}</p>
                            )}
                            <div className="mt-3 flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => onOpenEditVariant(v)}>Sửa</Button>
                                <Button variant="outline" size="sm" onClick={() => onDeleteVariant(v)}>Xóa</Button>
                            </div>
                        </div>
                    ))}
                    {!variants?.length && <div className="text-gray-500 col-span-full text-center py-8">Chưa có variant nào</div>}
                </div>
            )}

            {/* Model Dialog */}
            <Dialog open={modelOpen} onOpenChange={setModelOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingModel ? "Cập nhật Model" : "Thêm Model"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {modelError && (
                            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                                {modelError}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên Model <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder="Nhập tên model"
                                value={modelForm.name}
                                onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                                disabled={modelSubmitting}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mô tả
                            </label>
                            <textarea
                                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder="Nhập mô tả"
                                value={modelForm.description || ""}
                                onChange={(e) => setModelForm({ ...modelForm, description: e.target.value })}
                                disabled={modelSubmitting}
                                rows={3}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Manufacturer ID <span className="text-xs text-gray-500">(tùy chọn)</span>
                            </label>
                            <Input
                                placeholder="Nhập manufacturer ID"
                                value={modelForm.manufacturer_id || ""}
                                onChange={(e) => setModelForm({ ...modelForm, manufacturer_id: e.target.value })}
                                disabled={modelSubmitting}
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setModelOpen(false)}>Hủy</Button>
                        <Button onClick={onSubmitModel} disabled={modelSubmitting}>
                            {modelSubmitting ? "Đang lưu..." : (editingModel ? "Lưu" : "Tạo")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Variant Dialog */}
            <Dialog open={variantOpen} onOpenChange={setVariantOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingVariant ? "Cập nhật Variant" : "Thêm Variant"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {variantError && (
                            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                                {variantError}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Model ID <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                value={variantForm.model_id}
                                onChange={(e) => setVariantForm({ ...variantForm, model_id: e.target.value })}
                                disabled={variantSubmitting}
                            >
                                <option value="">-- Chọn Model --</option>
                                {models?.map((m) => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Version <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder="Nhập version (VD: Premium)"
                                value={variantForm.version}
                                onChange={(e) => setVariantForm({ ...variantForm, version: e.target.value })}
                                disabled={variantSubmitting}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Màu sắc <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder="Nhập màu (VD: Moonlight Silver)"
                                value={variantForm.color}
                                onChange={(e) => setVariantForm({ ...variantForm, color: e.target.value })}
                                disabled={variantSubmitting}
                                className="transition-all hover:border-green-400 hover:ring-2 hover:ring-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giá cơ bản <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="number"
                                placeholder="Nhập giá (VD: 2599.99)"
                                value={variantForm.base_price || ""}
                                onChange={(e) => setVariantForm({ ...variantForm, base_price: Number(e.target.value) })}
                                disabled={variantSubmitting}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hình ảnh <span className="text-xs text-gray-500">(tùy chọn)</span>
                            </label>
                            <div className="space-y-2">
                                <div>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={variantSubmitting || uploadingImage}
                                        className="cursor-pointer"
                                    />
                                    {uploadingImage && (
                                        <p className="text-xs text-blue-600 mt-1">Đang upload ảnh...</p>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 text-center">hoặc</div>
                                <Input
                                    type="url"
                                    placeholder="Nhập URL ảnh (VD: https://example.com/image.jpg)"
                                    value={variantForm.thumbnail_url || ""}
                                    onChange={(e) => {
                                        const url = e.target.value;
                                        setVariantForm({ ...variantForm, thumbnail_url: url });
                                        setImagePreview(url);
                                    }}
                                    disabled={variantSubmitting || uploadingImage}
                                />
                                {imagePreview && (
                                    <div className="mt-2">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-32 w-full object-cover rounded-lg border"
                                            onError={() => {
                                                setImagePreview("");
                                                setVariantError("Không thể tải ảnh preview");
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setVariantOpen(false)}>Hủy</Button>
                        <Button onClick={onSubmitVariant} disabled={variantSubmitting}>
                            {variantSubmitting ? "Đang lưu..." : (editingVariant ? "Lưu" : "Tạo")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Model Detail Dialog */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Chi tiết Model</DialogTitle>
                    </DialogHeader>
                    {detailLoading ? (
                        <div className="py-8 text-center">Đang tải...</div>
                    ) : detailModel ? (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-semibold mb-2">{detailModel.name}</h3>
                                <p className="text-gray-600">{detailModel.description || "Không có mô tả"}</p>
                            </div>

                            {detailModel.variants && detailModel.variants.length > 0 && (
                                <div>
                                    <h4 className="text-xl font-semibold mb-3">Các phiên bản</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {detailModel.variants.map((v: any) => (
                                            <div key={v.id} className="bg-white rounded-xl shadow p-4">
                                                <img
                                                    src={v.thumbnail_url || "/vehicles/default.jpg"}
                                                    alt={v.version}
                                                    className="w-full h-40 object-cover rounded-lg mb-2"
                                                />
                                                <h5 className="mt-2 font-semibold">{v.version}</h5>
                                                <p className="text-sm text-gray-600">Màu: {v.color}</p>
                                                <p className="text-sm font-medium">Giá: {Number(v.base_price).toLocaleString()}đ</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {detailModel.modelSpecs && detailModel.modelSpecs.length > 0 && (
                                <div>
                                    <h4 className="text-xl font-semibold mb-2">Thông số kỹ thuật</h4>
                                    <ul className="list-disc pl-6 space-y-1">
                                        {detailModel.modelSpecs.map((ms: any) => (
                                            <li key={ms.id}>
                                                <strong>{ms.spec?.category} - {ms.spec?.name}</strong>: {ms.value} {ms.spec?.unit || ""}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="py-8 text-center text-gray-500">Không tìm thấy thông tin model</div>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
}

