"use client";
import { Order } from "@/app/types/order";
import { vnd } from "@/app/utils/currency";
import { Eye, CreditCard } from "lucide-react";


export default function OrderTable({
  orders, onPayMomo, onView,
}: {
  orders: Order[];
  onPayMomo: (orderId: string) => void;
  onView?: (order: Order) => void;
}) {
  if (!orders.length) return <p>Chưa có đơn hàng nào.</p>;
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Khách hàng</th>
            <th className="p-3 text-left">Xe</th>
            <th className="p-3 text-left">Ngày đặt</th>
            <th className="p-3 text-right">Tổng tiền</th>
            <th className="p-3 text-left">Trạng thái</th>
            <th className="p-3 text-right">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{o.customer?.full_name || "—"}</td>
              <td className="p-3">{o.variant?.vehicleModel?.name || o.variant?.version || "—"}</td>
              <td className="p-3">{new Date(o.order_date).toLocaleDateString("vi-VN")}</td>
              <td className="p-3 text-right">{vnd(o.total_amount)}</td>
              <td className="p-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full
                  ${o.status === "delivered" ? "bg-green-100 text-green-700" :
                    o.status === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                    o.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    o.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                  {o.status}
                </span>
              </td>
              <td className="p-3 text-right space-x-3">
                <button className="text-blue-600 hover:text-blue-800" onClick={() => onView?.(o)}>
                  <Eye size={18} />
                </button>
                {o.status === "pending" && (
                  <button className="text-pink-600 hover:text-pink-800" onClick={() => onPayMomo(o.id)}>
                    <CreditCard size={18} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
