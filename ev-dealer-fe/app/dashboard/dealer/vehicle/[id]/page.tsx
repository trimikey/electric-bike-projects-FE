"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import apiClient from "@/lib/api";

export default function VehicleDetailPage() {
  const { id } = useParams();
  const [model, setModel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchModel = async () => {
      try {
        const res = await apiClient.get(`/vehicles/models/${id}`);
        setModel(res.data);
      } catch (err: any) {
        console.error("❌ Lỗi khi lấy chi tiết model:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Không thể tải chi tiết xe");
      } finally {
        setLoading(false);
      }
    };

    fetchModel();
  }, [id]);

  if (loading) return <div className="p-6">⏳ Đang tải chi tiết xe...</div>;
  if (error) return <div className="p-6 text-red-500">❌ {error}</div>;
  if (!model) return <div className="p-6">Không tìm thấy xe.</div>;

  return (
    <section className="p-6">
      <h2 className="text-2xl font-semibold mb-3">{model.name}</h2>
      <p className="text-gray-600 mb-6">{model.description}</p>

      <h3 className="text-xl font-semibold mb-3">Các phiên bản</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {model.variants?.map((v: any) => (
          <div key={v.id} className="bg-white rounded-xl shadow p-4">
            <img
              src={v.thumbnail_url || "/vehicles/default.jpg"}
              alt={v.version}
              className="w-full h-40 object-cover rounded-lg"
            />
            <h4 className="mt-2 font-semibold">{v.version}</h4>
            <p>Màu: {v.color}</p>
            <p>Giá: {Number(v.base_price).toLocaleString()}đ</p>
          </div>
        ))}
      </div>

      {model.modelSpecs?.length > 0 && (
        <>
          <h3 className="text-xl font-semibold mt-6 mb-2">Thông số kỹ thuật</h3>
          <ul className="list-disc pl-6">
            {model.modelSpecs.map((ms: any) => (
              <li key={ms.id}>
                <strong>{ms.spec?.category} - {ms.spec?.name}</strong>: {ms.value} {ms.spec?.unit}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
