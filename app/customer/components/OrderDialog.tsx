// app/customer/components/OrderDialog.tsx
"use client";

import { useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

type Variant = { id: string; version: string; color: string; base_price: number | string };

export default function OrderDialog({
  open,
  onClose,
  modelName,
  variants,
  defaultVariantId,
}: {
  open: boolean;
  onClose: () => void;
  modelName: string;
  variants: Variant[];
  defaultVariantId?: string;
}) {
  const [variantId, setVariantId] = useState(defaultVariantId || variants[0]?.id);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!variantId) {
      toast.error("Vui lòng chọn phiên bản");
      return;
    }
    try {
      setSubmitting(true);
      // BE của bạn: POST /orders
      await api.post("/orders", {
        // backend của bạn yêu cầu: customer_id lấy từ session phía server; nếu cần FE truyền thì thêm ở đây
        variant_id: variantId,
      });
      toast.success("Đã tạo đơn hàng!");
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Tạo đơn hàng thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Đặt mua – {modelName}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <label className="text-sm">Chọn phiên bản</label>
        <select
          value={variantId}
          onChange={(e) => setVariantId(e.target.value)}
          className="mt-1 w-full border rounded-lg px-3 py-2"
        >
          {variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.version} – {v.color}
            </option>
          ))}
        </select>

        <div className="mt-4 flex justify-end gap-2">
          <button className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200" onClick={onClose}>
            Hủy
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Đang tạo…" : "Tạo đơn hàng"}
          </button>
        </div>
      </div>
    </div>
  );
}
