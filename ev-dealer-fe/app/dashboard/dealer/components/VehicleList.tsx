"use client";

import apiClient from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// ---- helper format VND (an toàn với undefined / string DECIMAL) ----
const vnd = (n?: number | string | null) => {
  if (n === null || n === undefined) return "—";
  const num = typeof n === "string" ? Number(n) : n;
  if (Number.isNaN(num)) return "—";
  return num.toLocaleString("vi-VN") + " đ";
};

// ---- typess ----
type Manufacturer = { id: string; name: string };
type Variant = {
  id: string;
  version: string;
  color: string;
  base_price: number | string;
  thumbnail_url?: string | null;
};
type VehicleModel = {
  id: string;
  name: string;
  description?: string | null;
  manufacturer?: Manufacturer | null;
  variants?: Variant[];
};

export default function VehicleList() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // dữ liệu
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [loading, setLoading] = useState(false);

  // filter states
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [manufacturerId, setManufacturerId] = useState<string>("");
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");

  // danh sách hãng để đổ combobox
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);

  // chọn để so sánh
  const [selected, setSelected] = useState<string[]>([]);

  // debounce cho keyword
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  // fetch models theo filter
  const fetchModels = async (withForOptions = false) => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (qDebounced) params.name = qDebounced;
      if (manufacturerId) params.manufacturerId = manufacturerId;
      if (priceMin) params.priceMin = priceMin;
      if (priceMax) params.priceMax = priceMax;

      const res = await apiClient.get<VehicleModel[]>("/vehicles/models", {
        params,
      });
      const data = res.data || [];
      setModels(data);

      // nếu cần build danh sách hãng từ dữ liệu trả về
      if (withForOptions) {
        const uniq = new Map<string, Manufacturer>();
        for (const m of data) {
          if (m.manufacturer?.id) {
            uniq.set(m.manufacturer.id, {
              id: m.manufacturer.id,
              name: m.manufacturer.name,
            });
          }
        }
        setManufacturers(Array.from(uniq.values()).sort((a, b) => a.name.localeCompare(b.name, "vi")));
      }
    } catch (err: any) {
      console.error("❌ Lỗi khi gọi /vehicles/models:", err?.response?.data || err?.message);
    } finally {
      setLoading(false);
    }
  };

  // lần đầu: load không filter để có list hãng
  useEffect(() => {
    if (status !== "authenticated") return;
    fetchModels(true);
  }, [status]);

  // chạy lại khi filter thay đổi (debounced)
  useEffect(() => {
    if (status !== "authenticated") return;
    fetchModels(false);
  }, [qDebounced, manufacturerId, priceMin, priceMax, status]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCompare = () => {
    if (selected.length < 2) {
      alert("Vui lòng chọn ít nhất 2 xe để so sánh");
      return;
    }
    router.push(`/dashboard/dealer/vehicle/compare?ids=${selected.join(",")}`);
  };

  // lấy ảnh/giá “đẹp”: ưu tiên ảnh variant rẻ nhất (nếu có)
  const getPrimaryVariant = (v: VehicleModel) => {
    const list = v.variants || [];
    if (list.length === 0) return undefined;
    const sorted = [...list].sort(
      (a, b) => Number(a.base_price) - Number(b.base_price)
    );
    return sorted[0];
  };

  // active filters hiển thị chip
  const activeFilters = useMemo(() => {
    const items: { label: string; clear: () => void }[] = [];
    if (qDebounced)
      items.push({ label: `Tên: "${qDebounced}"`, clear: () => setQ("") });
    if (manufacturerId) {
      const name = manufacturers.find((m) => m.id === manufacturerId)?.name || "—";
      items.push({ label: `Hãng: ${name}`, clear: () => setManufacturerId("") });
    }
    if (priceMin) items.push({ label: `Giá từ ${vnd(priceMin)}`, clear: () => setPriceMin("") });
    if (priceMax) items.push({ label: `Giá đến ${vnd(priceMax)}`, clear: () => setPriceMax("") });
    return items;
  }, [qDebounced, manufacturerId, priceMin, priceMax, manufacturers]);

  return (
    <section className="p-6 relative">
      <h2 className="text-xl font-semibold mb-4">Danh mục xe & cấu hình</h2>

      {/* FILTER BAR */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-3 bg-white p-3 rounded-lg shadow">
        <div className="md:col-span-2">
          <label className="text-xs text-gray-500">Tìm theo tên</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nhập tên dòng xe…"
            className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">Hãng</label>
          <select
            value={manufacturerId}
            onChange={(e) => setManufacturerId(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Tất cả hãng</option>
            {manufacturers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500">Giá từ</label>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value.replace(/\D/g, ""))}
            placeholder="VND"
            className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">Giá đến</label>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value.replace(/\D/g, ""))}
            placeholder="VND"
            className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* hàng chip filter */}
        {activeFilters.length > 0 && (
          <div className="md:col-span-5 flex flex-wrap gap-2">
            {activeFilters.map((f, idx) => (
              <button
                key={idx}
                onClick={f.clear}
                className="inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100"
                title="Bỏ lọc"
              >
                {f.label} <span className="text-blue-500">×</span>
              </button>
            ))}
            <button
              onClick={() => {
                setQ("");
                setManufacturerId("");
                setPriceMin("");
                setPriceMax("");
              }}
              className="ml-auto text-xs px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              Xoá tất cả
            </button>
          </div>
        )}
      </div>

      {/* LIST */}
      {loading ? (
        <p>Đang tải dữ liệu…</p>
      ) : models.length === 0 ? (
        <p>Không tìm thấy dòng xe nào khớp bộ lọc.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {models.map((m) => {
              const pv = getPrimaryVariant(m);
              const thumb =
                pv?.thumbnail_url || "/vehicles/default.jpg";
              const price =
                pv?.base_price ??
                (m.variants && m.variants.length
                  ? m.variants[0].base_price
                  : null);

              return (
                <div key={m.id} className="bg-white p-4 rounded-lg shadow relative">
                  <input
                    type="checkbox"
                    checked={selected.includes(m.id)}
                    onChange={() => toggleSelect(m.id)}
                    className="absolute top-3 right-3 w-5 h-5 accent-blue-600 cursor-pointer"
                    title="Chọn để so sánh"
                  />
                  <img
                    src={thumb}
                    alt={m.name}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <h3 className="mt-3 font-semibold">{m.name}</h3>
                  <p className="text-gray-500 text-sm">
                    Hãng: {m.manufacturer?.name || "—"}
                  </p>
                  <p className="text-gray-700 text-sm">
                    {price ? `Giá từ: ${vnd(price)}` : "Chưa có giá"}
                  </p>
                  <button
                    onClick={() =>
                      router.push(`/dashboard/dealer/vehicle/${m.id}`)
                    }
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    Xem chi tiết
                  </button>
                </div>
              );
            })}
          </div>

          {/* Nút So sánh nổi */}
          {selected.length >= 2 && (
            <div className="fixed bottom-6 right-6">
              <button
                onClick={handleCompare}
                className="px-5 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-all"
              >
                So sánh {selected.length} xe
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
