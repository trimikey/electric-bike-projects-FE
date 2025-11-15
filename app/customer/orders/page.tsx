// app/customer/orders/page.tsx
"use client";

import api from "@/lib/api";
import { useEffect, useState } from "react";

type Order = {
  id: string;
  order_date: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  total_amount: number | string;
  variant?: { version?: string; color?: string; vehicleModel?: { name?: string } };
};

const vnd = (n?: number | string | null) =>
  n == null ? "—" : (typeof n === "string" ? Number(n) : n).toLocaleString("vi-VN") + " đ";

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // BE tạo endpoint trả orders theo customer hiện tại (dựa session); nếu chưa có, tạm dùng /orders?mine=1
        const res = await api.get<Order[]>("/orders?mine=1");
        setOrders(res.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Đang tải…</p>;

  return (
    <section>
      <h1 className="text-xl font-semibold mb-4">Đơn hàng của tôi</h1>

      {orders.length === 0 ? (
        <p>Chưa có đơn hàng nào.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Xe</th>
                <th className="p-3 text-left">Phiên bản</th>
                <th className="p-3 text-left">Ngày đặt</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-right">Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-3">{o.variant?.vehicleModel?.name || "—"}</td>
                  <td className="p-3">
                    {o.variant?.version} – {o.variant?.color}
                  </td>
                  <td className="p-3">
                    {o.order_date ? new Date(o.order_date).toLocaleDateString("vi-VN") : "—"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        o.status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : o.status === "confirmed"
                          ? "bg-emerald-100 text-emerald-700"
                          : o.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">{vnd(o.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
