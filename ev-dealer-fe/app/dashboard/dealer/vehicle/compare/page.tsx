"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import apiClient from "@/lib/api";

export default function CompareVehiclesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ids = searchParams.get("ids")?.split(",") || [];
  const [models, setModels] = useState<any[]>([]);
  const [allSpecs, setAllSpecs] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (ids.length < 2) return;
      try {
        const results = await Promise.all(
          ids.map((id) => apiClient.get(`/vehicles/models/${id}`))
        );
        const data = results.map((r) => r.data);
        setModels(data);

        // 🧮 Gom tất cả tên thông số của mọi xe
        const specNames = new Set<string>();
        data.forEach((m) =>
          m.modelSpecs?.forEach((ms: any) => specNames.add(ms.spec.name))
        );
        setAllSpecs(Array.from(specNames));
      } catch (err: any) {
        // ✅ Lỗi đã qua interceptor: { status, message, errors, raw }
        console.error("❌ Lỗi khi tải dữ liệu so sánh:", {
          status: err?.status,
          message: err?.message,
          errors: err?.errors,
        });
      }
    };
    fetchData();
  }, [ids]);

  if (ids.length < 2)
    return (
      <p className="p-10 text-center text-gray-600 text-lg">
        ⚠️ Vui lòng chọn ít nhất 2 xe để so sánh.
      </p>
    );

  if (models.length === 0)
    return (
      <p className="p-10 text-center text-gray-600 text-lg">
        ⏳ Đang tải dữ liệu...
      </p>
    );

  return (
    <section className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
        So sánh xe & thông số kỹ thuật
      </h2>

      {/* 1️⃣ PHẦN THÔNG TIN VARIANT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-10 max-w-6xl mx-auto">
        {models.map((m) => {
          const variant = m.variants?.[0];
          return (
            <div
              key={m.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5 border border-gray-100"
            >
              <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 mb-4">
                <img
                  src={variant?.thumbnail_url || "/vehicles/default.jpg"}
                  alt={m.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
              <h3 className="text-lg font-semibold text-center text-gray-800 mb-1">
                {m.name}
              </h3>
              <p className="text-gray-600 text-sm text-center">
                Phiên bản: <b>{variant?.version || "—"}</b>
              </p>
              <p className="text-gray-600 text-sm text-center mb-2">
                Màu sắc: {variant?.color || "—"}
              </p>
              <p className="text-blue-600 font-bold text-center text-lg">
                {variant?.base_price
                  ? `${Number(variant.base_price).toLocaleString()} đ`
                  : "Chưa có giá"}
              </p>
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => router.push(`/dashboard/dealer/vehicle/${m.id}`)}
                  className="text-sm text-blue-600 hover:underline hover:text-blue-700 transition-all"
                >
                  Xem chi tiết →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2️⃣ BẢNG THÔNG SỐ KỸ THUẬT */}
      <div className="max-w-6xl mx-auto overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg text-sm bg-white shadow-sm">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="p-3 border text-left text-gray-700 font-semibold">
                Thông số
              </th>
              {models.map((m) => (
                <th
                  key={m.id}
                  className="p-3 border text-center text-gray-700 font-semibold"
                >
                  {m.name}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {allSpecs.map((specName, i) => (
              <tr
                key={specName}
                className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="p-3 border font-medium text-gray-700">
                  {specName}
                </td>
                {models.map((m) => {
                  const ms = m.modelSpecs?.find(
                    (x: any) => x.spec.name === specName
                  );
                  return (
                    <td key={m.id} className="p-3 border text-center text-gray-600">
                      {ms ? `${ms.value} ${ms.spec.unit || ""}` : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3️⃣ NÚT QUAY LẠI */}
      <div className="text-center mt-10">
        <button
          onClick={() => router.push("/dashboard/dealer")}
          className="px-6 py-2 text-sm font-medium rounded-full border border-gray-300 hover:bg-gray-100 text-gray-700 transition-all"
        >
          ← Quay lại danh mục xe
        </button>
      </div>
    </section>
  );
}
