// app/customer/(shop)/vehicles/page.tsx
"use client";

import api from "@/lib/api";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Manufacturer = { id: string; name: string };
type Variant = { id: string; base_price: number | string; thumbnail_url?: string | null };
type VehicleModel = { id: string; name: string; manufacturer?: Manufacturer | null; variants?: Variant[] };

const vnd = (n?: number | string | null) =>
  n == null ? "—" : (typeof n === "string" ? Number(n) : n).toLocaleString("vi-VN") + " đ";

export default function VehiclesPage() {
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [loading, setLoading] = useState(true);

  // filter state
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("all");
  const [price, setPrice] = useState<[number, number]>([0, 999999999]);

  // compare selection
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<VehicleModel[]>("/vehicles/models");
        setModels(res.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const brands = useMemo(() => {
    const set = new Set((models || []).map(m => m.manufacturer?.name).filter(Boolean) as string[]);
    return ["all", ...Array.from(set)];
  }, [models]);

  const filtered = useMemo(() => {
    return (models || []).filter(m => {
      const first = m.variants?.[0];
      const priceNum = first?.base_price ? Number(first.base_price) : 0;

      const okName = q ? m.name.toLowerCase().includes(q.toLowerCase()) : true;
      const okBrand = brand === "all" ? true : m.manufacturer?.name === brand;
      const okPrice = priceNum >= price[0] && priceNum <= price[1];

      return okName && okBrand && okPrice;
    });
  }, [models, q, brand, price]);

  const toggleSelect = (id: string) => {
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  if (loading) return <p>Đang tải...</p>;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 grid md:grid-cols-4 gap-3 items-end">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Tìm theo tên</label>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Ví dụ: Evo200, Theon…"
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hãng</label>
          <select
            value={brand}
            onChange={e => setBrand(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            {brands.map(b => (
              <option key={b} value={b}>
                {b === "all" ? "Tất cả" : b}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Giá (từ) – dựa trên phiên bản rẻ nhất
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              placeholder="0"
              className="w-full border rounded-lg px-3 py-2"
              onChange={e => setPrice([Number(e.target.value || 0), price[1]])}
            />
            <input
              type="number"
              min={0}
              placeholder="100000000"
              className="w-full border rounded-lg px-3 py-2"
              onChange={e => setPrice([price[0], Number(e.target.value || 0)])}
            />
          </div>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p>Không có mẫu phù hợp bộ lọc.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map(m => {
            const first = m.variants?.[0];
            return (
              <div key={m.id} className="bg-white rounded-xl shadow p-4 relative">
                <input
                  type="checkbox"
                  className="absolute top-3 right-3 w-5 h-5 accent-blue-600"
                  checked={selected.includes(m.id)}
                  onChange={() => toggleSelect(m.id)}
                  title="Chọn để so sánh"
                />
                <img
                  src={first?.thumbnail_url || "/vehicles/default.jpg"}
                  alt={m.name}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <h3 className="mt-3 font-semibold">{m.name}</h3>
                <p className="text-gray-500 text-sm">Hãng: {m.manufacturer?.name || "—"}</p>
                <p className="text-gray-700 text-sm">Giá từ: {vnd(first?.base_price)}</p>
                <Link
                  href={`/customer/vehicle/${m.id}`}
                  className="inline-block mt-2 text-sm text-blue-600 hover:underline"
                >
                  Xem chi tiết
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Compare floating button */}
      {selected.length >= 2 && (
        <div className="fixed bottom-6 right-6">
          <Link
            href={`/customer/compare?ids=${selected.join(",")}`}
            className="px-5 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700"
          >
            So sánh {selected.length} xe
          </Link>
        </div>
      )}
    </div>
  );
}
