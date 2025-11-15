"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export type FiltersState = {
  q: string;
  manufacturerId: string;
  priceMin: string;
  priceMax: string;
  sort: "popular" | "price_asc" | "price_desc" | "name_asc" | "name_desc";
  page: number;
};

type Manufacturer = { id: string; name: string };

export default function VehicleFilters({
  value,
  onChange,
  onClear,
}: {
  value: FiltersState;
  onChange: (patch: Partial<FiltersState>) => void;
  onClear: () => void;
}) {
  const [mans, setMans] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/manufacturers");
        setMans(res.data?.items ?? res.data);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Bộ lọc</h3>
        <button onClick={onClear} className="text-sm text-blue-600 hover:underline">
          Xoá tất cả
        </button>
      </div>

      {/* Hãng */}
      <div>
        <div className="text-sm font-medium mb-2">Hãng sản xuất</div>
        <select
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={value.manufacturerId}
          onChange={(e) => onChange({ manufacturerId: e.target.value })}
          disabled={loading}
        >
          <option value="">Tất cả</option>
          {mans.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* Giá */}
      <div>
        <div className="text-sm font-medium mb-2">Khoảng giá (đ)</div>
        <div className="flex items-center gap-2">
          <input
            inputMode="numeric"
            placeholder="Từ"
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={value.priceMin}
            onChange={(e) => onChange({ priceMin: e.target.value })}
          />
          <span className="text-gray-400">—</span>
          <input
            inputMode="numeric"
            placeholder="Đến"
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={value.priceMax}
            onChange={(e) => onChange({ priceMax: e.target.value })}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">Ví dụ: 15000000 — 35000000</p>
      </div>

      {/* Sắp xếp hiển thị cho mobile (bạn đã có ngoài, nhưng để mobile tiện) */}
      <div className="lg:hidden">
        <div className="text-sm font-medium mb-2">Sắp xếp</div>
        <select
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={value.sort}
          onChange={(e) => onChange({ sort: e.target.value as FiltersState["sort"] })}
        >
          <option value="popular">Phổ biến</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
          <option value="name_asc">Tên A → Z</option>
          <option value="name_desc">Tên Z → A</option>
        </select>
      </div>
    </div>
  );
}
