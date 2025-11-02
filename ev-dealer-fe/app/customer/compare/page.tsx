// app/customer/(shop)/compare/page.tsx
"use client";

import api from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

/* ===== Types khớp BE ===== */
type Variant = { id: string; version: string; color: string; base_price: number | string; thumbnail_url?: string | null };
type Spec = { id: string; category?: string | null; name: string; unit?: string | null };
type ModelSpec = { id: string; value: string; spec: Spec };
type VehicleModel = {
  id: string;
  name: string;
  description?: string | null;
  manufacturer?: { name?: string } | null;
  variants?: Variant[];
  modelSpecs?: ModelSpec[];
};

const vnd = (n?: number | string | null) =>
  n == null ? "—" : (typeof n === "string" ? Number(n) : n).toLocaleString("vi-VN") + " đ";

const MAX_COLS = 3;

/* ====== helpers ====== */
function groupSpecs(items: VehicleModel[]) {
  const groups: Record<string, { name: string; values: (string | undefined)[] }[]> = {};
  const ensure = (cat: string, name: string, idx: number, value?: string) => {
    groups[cat] ??= [];
    let row = groups[cat].find((r) => r.name === name);
    if (!row) {
      row = { name, values: new Array(items.length).fill(undefined) };
      groups[cat].push(row);
    }
    row.values[idx] = value;
  };

  items.forEach((m, col) => {
    const first = m.variants?.[0];
    ensure("Tổng quan", "Hãng", col, m.manufacturer?.name || "—");
    ensure("Tổng quan", "Giá từ", col, vnd(first?.base_price));

    (m.modelSpecs || []).forEach((ms) => {
      const cat = (ms.spec?.category || "Thông số khác").trim();
      const name = (ms.spec?.name || "Thông số").trim();
      const val = ms.value + (ms.spec?.unit ? ` ${ms.spec.unit}` : "");
      ensure(cat, name, col, val);
    });
  });

  // sắp xếp cho dễ đọc
  const order = [
    "Kích thước",
    "Hệ thống truyền động",
    "Ngoại thất",
    "Nội thất",
    "An ninh & An toàn",
    "Hệ thống hỗ trợ lái xe ADAS",
    "Các tính năng thông minh và Ứng dụng điện thoại",
    "Tổng quan",
    "Thông số khác",
  ];
  return Object.fromEntries(
    Object.entries(groups).sort(
      ([a], [b]) => (order.indexOf(a) !== -1 ? order.indexOf(a) : 999) - (order.indexOf(b) !== -1 ? order.indexOf(b) : 999)
    )
  );
}

/* ====== UI ====== */
export default function ComparePage() {
  const router = useRouter();
  const sp = useSearchParams();
  const ids = useMemo(() => sp.get("ids")?.split(",").filter(Boolean) ?? [], [sp]);

  const [items, setItems] = useState<VehicleModel[]>([]);
  const [loading, setLoading] = useState(true);

  // modal chọn xe
  const [pickerOpen, setPickerOpen] = useState(false);
  const [catalog, setCatalog] = useState<VehicleModel[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const rs: VehicleModel[] = [];
        for (const id of ids) {
          const r = await api.get<VehicleModel>(`/vehicles/models/${id}`);
          rs.push(r.data);
        }
        setItems(rs);
      } finally {
        setLoading(false);
      }
    })();
  }, [ids.join(",")]);

  useEffect(() => {
    if (!pickerOpen) return;
    (async () => {
      const r = await api.get<VehicleModel[]>("/vehicles/models");
      setCatalog(r.data || []);
    })();
  }, [pickerOpen]);

  const updateIds = (newIds: string[]) => {
    const q = newIds.length ? `?ids=${newIds.join(",")}` : "";
    router.replace(`/customer/compare${q}`);
  };
  const addId = (id: string) => {
    if (ids.includes(id) || ids.length >= MAX_COLS) return;
    updateIds([...ids, id]);
    setPickerOpen(false);
  };
  const removeId = (id: string) => updateIds(ids.filter((x) => x !== id));

  const groups = useMemo(() => groupSpecs(items), [items]);
  const categories = Object.keys(groups);

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">So sánh xe</h1>
      <p className="text-sm text-gray-600">Để đánh giá xe tốt nhất, vui lòng lựa chọn từ 2 đến {MAX_COLS} xe.</p>

      {/* ===== Hàng chọn xe (luôn hiển thị như VinFast) ===== */}
      <div className="grid md:grid-cols-3 gap-4">
        {Array.from({ length: MAX_COLS }).map((_, idx) => {
          const m = items[idx];
          return (
            <div key={idx} className="rounded-xl border border-gray-200 h-44 flex items-center justify-center relative">
              {m ? (
                <div className="absolute inset-0 p-4 flex gap-3">
                  <img
                    src={m.variants?.[0]?.thumbnail_url || "/vehicles/default.jpg"}
                    className="w-28 h-20 object-cover rounded"
                    alt={m.name}
                  />
                  <div className="flex-1">
                    <div className="font-medium line-clamp-1" title={m.name}>
                      {m.name}
                    </div>
                    <div className="text-xs text-gray-500">{m.manufacturer?.name || "—"}</div>
                    <div className="text-sm font-semibold mt-1">{vnd(m.variants?.[0]?.base_price)}</div>
                    <div className="mt-3 flex gap-2">
                      <a
                        href={`/customer/vehicle/${m.id}`}
                        className="px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700"
                      >
                        Xem chi tiết
                      </a>
                      <button
                        className="px-3 py-1 rounded bg-gray-100 text-xs hover:bg-gray-200"
                        onClick={() => removeId(m.id)}
                      >
                        Xoá
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setPickerOpen(true)}
                  className="flex flex-col items-center gap-2 text-gray-600 hover:text-gray-800"
                >
                  <span className="text-3xl">＋</span>
                  <span>Lựa chọn xe</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ===== Thanh tabs danh mục ===== */}
      <div className="overflow-x-auto">
        <div className="inline-flex gap-6 border-b min-w-[640px]">
          {categories.length
            ? categories.map((c, i) => (
                <a key={c} href={`#cat-${i}`} className="py-3 text-sm text-gray-700 hover:text-blue-600">
                  {c}
                </a>
              ))
            : ["Kích thước", "Hệ thống truyền động", "Ngoại thất", "Nội thất", "An ninh & An toàn", "Hệ thống hỗ trợ lái xe ADAS"].map(
                (c, i) => (
                  <a key={c} href={`#dummy-${i}`} className="py-3 text-sm text-gray-400 cursor-default">
                    {c}
                  </a>
                )
              )}
        </div>
      </div>

      {/* ===== Accordions nhóm thông số (hiện cả khi chưa đủ xe, nội dung là “—”) ===== */}
      {(categories.length ? categories : ["Kích thước", "Hệ thống truyền động", "Ngoại thất", "Nội thất", "An ninh & An toàn"]).map(
        (cat, idx) => {
          const rows = groups[cat] ?? [{ name: "—", values: new Array(items.length).fill("—") }];
          return (
            <details key={cat} id={`cat-${idx}`} className="bg-white rounded-xl shadow">
              <summary className="list-none cursor-pointer select-none px-4 py-3 border-b flex items-center justify-between">
                <span className="font-medium">{cat}</span>
                <span className="text-xl leading-none">▾</span>
              </summary>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[720px]">
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.name} className="border-b">
                        <td className="w-56 p-3 text-gray-700">{r.name}</td>
                        {Array.from({ length: MAX_COLS }).map((_, col) => {
                          const val =
                            items[col] && r.values[col] !== undefined
                              ? (r.values[col] as string)
                              : "—";
                          return (
                            <td key={col} className="p-3">
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          );
        }
      )}

      {/* ===== Picker modal ===== */}
      {pickerOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Chọn xe để so sánh</h3>
              <button onClick={() => setPickerOpen(false)} className="text-gray-500">
                ✕
              </button>
            </div>
            <div className="p-4 grid sm:grid-cols-2 md:grid-cols-3 gap-3 overflow-auto">
              {catalog
                .filter((m) => !ids.includes(m.id))
                .slice(0, 30)
                .map((m) => {
                  const thumb = m.variants?.[0]?.thumbnail_url || "/vehicles/default.jpg";
                  return (
                    <button
                      key={m.id}
                      onClick={() => addId(m.id)}
                      className="text-left border rounded-lg p-3 hover:bg-gray-50"
                    >
                      <img src={thumb} className="w-full h-28 object-cover rounded" alt={m.name} />
                      <div className="mt-2 font-medium line-clamp-1">{m.name}</div>
                      <div className="text-xs text-gray-500">{m.manufacturer?.name || "—"}</div>
                      <div className="text-sm font-semibold">{vnd(m.variants?.[0]?.base_price)}</div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
