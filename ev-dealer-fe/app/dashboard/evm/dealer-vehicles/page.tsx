"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";
import { listDealers } from "@/app/services/dealers";
import { listDealerVehicles, addVehicleToDealer, removeVehicleFromDealer } from "@/app/services/dealerVehicles";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function DealerVehiclesPage() {
    const dealersSWR = useSWR("dealers", listDealers);
    const [dealerId, setDealerId] = useState<string | undefined>(undefined);
    const [open, setOpen] = useState(false);
    const [modelId, setModelId] = useState("");
    const [variantId, setVariantId] = useState("");
    const [quantity, setQuantity] = useState(1);

    const vehiclesKey = useMemo(() => (dealerId ? ["dealer:vehicles", dealerId] : null), [dealerId]);
    const { data: vehicles, error, isLoading, mutate } = useSWR(vehiclesKey, () => dealerId ? listDealerVehicles(dealerId) : null);

    const onAdd = async () => {
        if (!dealerId || !modelId) {
            alert("Vui lòng chọn đại lý và nhập Model ID");
            return;
        }
        try {
            await addVehicleToDealer(dealerId, {
                modelId,
                ...(variantId ? { variantId } : {}),
                ...(quantity > 0 ? { quantity } : {}),
            });
            setOpen(false);
            setModelId("");
            setVariantId("");
            setQuantity(1);
            await mutate();
        } catch (e: any) {
            const errorMsg = e?.message || e?.raw?.response?.data?.message || "Thêm thất bại";
            alert(errorMsg);
        }
    };

    const onRemove = async (vehicleId: string) => {
        if (!dealerId) return;
        if (!confirm("Bạn có chắc chắn muốn gỡ xe này?")) return;
        try {
            await removeVehicleFromDealer(dealerId, vehicleId);
            await mutate();
        } catch (e: any) {
            const errorMsg = e?.message || e?.raw?.response?.data?.message || "Gỡ thất bại";
            alert(errorMsg);
        }
    };

    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold">Danh mục xe đại lý</h2>
                <p className="text-sm text-gray-500">Quản lý danh mục xe của từng đại lý</p>
            </div>

            <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Chọn đại lý:</label>
                <select
                    className="rounded-md border px-3 py-2 text-sm"
                    value={dealerId || ""}
                    onChange={(e) => setDealerId(e.target.value || undefined)}
                >
                    <option value="">-- Chọn đại lý --</option>
                    {dealersSWR.data?.map((d) => (
                        <option key={d.id} value={d.id}>
                            {typeof d.name === 'string' ? d.name : (d.name as any)?.name || String(d.id)}
                        </option>
                    ))}
                </select>
                {dealerId && (
                    <Button onClick={() => setOpen(true)}>Thêm xe vào đại lý</Button>
                )}
            </div>

            {isLoading && <div>Đang tải...</div>}
            {error && <div className="text-red-500">Lỗi: {(error as any)?.message || "Không tải được"}</div>}

            {vehicles && vehicles.length === 0 && (
                <div className="text-gray-500 text-center py-8">Chưa có xe nào trong danh mục</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles?.map((v) => (
                    <div key={v.id} className="rounded-xl border bg-white p-4">
                        <img
                            src={v.thumbnail_url || "/vehicles/default.jpg"}
                            alt={typeof v.name === 'string' ? v.name : String(v.id)}
                            className="h-40 w-full rounded-lg object-cover"
                        />
                        <div className="mt-2 font-semibold">
                            {typeof v.name === 'string' ? v.name : (v.name as any)?.name || String(v.id)}
                        </div>
                        <div className="text-sm text-gray-600">
                            {typeof v.description === 'string' ? v.description : ''}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                            <Link href={`/dashboard/dealer/vehicle/${v.id}`} className="text-sm text-blue-600 hover:underline">
                                Xem chi tiết
                            </Link>
                            <Button variant="outline" size="sm" onClick={() => onRemove(v.id)}>Gỡ</Button>
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Thêm xe vào đại lý</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Model ID <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder="Nhập Model ID"
                                value={modelId}
                                onChange={(e) => setModelId(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Variant ID <span className="text-xs text-gray-500">(tùy chọn)</span>
                            </label>
                            <Input
                                placeholder="Nhập Variant ID"
                                value={variantId}
                                onChange={(e) => setVariantId(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Số lượng <span className="text-xs text-gray-500">(tùy chọn)</span>
                            </label>
                            <Input
                                type="number"
                                min="1"
                                placeholder="Số lượng"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
                        <Button onClick={onAdd}>Thêm</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    );
}

