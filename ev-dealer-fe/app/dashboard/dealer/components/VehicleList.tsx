"use client";
import apiClient from "@/lib/api";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function VehicleList() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    const fetchVehicles = async () => {
      try {
        if (!session?.user?.accessToken) {
          console.warn("[VehicleList] Session chưa có access token, bỏ qua fetch");
          return;
        }
        const res = await apiClient.get("/vehicles/models"); // 👈 tự gắn token ở đây
        setVehicles(res.data);
      } catch (err: any) {
        console.error("❌ Lỗi khi lấy danh sách xe:", err.response?.data || err.message);
      }
    };
    fetchVehicles();
  }, [status, session?.user?.accessToken]);

  return (
    <section className="p-6">
      <h2 className="text-xl font-semibold mb-4">Danh mục xe & cấu hình</h2>
      {vehicles.length === 0 ? (
        <p>Hiện chưa có dòng xe nào.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vehicles.map((v) => (
            <div key={v.id} className="bg-white p-4 rounded-lg shadow">
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
              <button className="mt-2 text-sm text-blue-600 hover:underline">
                Xem chi tiết
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
