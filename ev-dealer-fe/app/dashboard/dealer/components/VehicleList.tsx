"use client";
import apiClient from "@/lib/api";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function VehicleList() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchVehicles = async () => {
      try {
        const res = await apiClient.get("/vehicles/models");
        setVehicles(res.data);
      } catch (err: any) {
        console.error("❌ Lỗi khi lấy danh sách xe:", err.response?.data || err.message);
      }
    };

    fetchVehicles();
  }, [status]);

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

  return (
    <section className="p-6 relative">
      <h2 className="text-xl font-semibold mb-4">Danh mục xe & cấu hình</h2>

      {vehicles.length === 0 ? (
        <p>Hiện chưa có dòng xe nào.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vehicles.map((v) => (
              <div key={v.id} className="bg-white p-4 rounded-lg shadow relative">
                <input
                  type="checkbox"
                  checked={selected.includes(v.id)}
                  onChange={() => toggleSelect(v.id)}
                  className="absolute top-3 right-3 w-5 h-5 accent-blue-600 cursor-pointer"
                  title="Chọn để so sánh"
                />
                <img
                  src={v.variants?.[0]?.thumbnail_url || "/vehicles/default.jpg"}
                  alt={v.name}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <h3 className="mt-3 font-semibold">{v.name}</h3>
                <p className="text-gray-500 text-sm">
                  {v.variants?.[0]?.base_price
                    ? `Giá: ${Number(v.variants[0].base_price).toLocaleString()}đ`
                    : "Chưa có giá"}
                </p>
                <button
                  onClick={() => router.push(`/dashboard/dealer/vehicle/${v.id}`)}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  Xem chi tiết
                </button>
              </div>
            ))}
          </div>

          {/* 🔹 Nút So sánh nổi lên khi chọn ≥2 */}
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
