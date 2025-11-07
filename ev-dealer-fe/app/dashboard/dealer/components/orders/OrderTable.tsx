"use client";

import { useState } from "react";
import { Order } from "@/app/types/order";
import { vnd } from "@/app/utils/currency";
import { Eye, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

function shortId(id?: string) {
  return id ? `#${id.slice(0, 8)}` : "—";
}

export default function OrderTable({
  orders,
  onPayMomo,
  onView,
}: {
  orders: Order[];
  onPayMomo: (orderId: string) => void;
  onView?: (order: Order) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);

  const handleView = (o: Order) => {
    if (onView) {
      onView(o);
      return;
    }
    setSelected(o);
    setOpen(true);
  };

  if (!orders.length) return <p>Chưa có đơn hàng nào.</p>;

  return (
    <>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Mã đơn</th>
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
                <td className="p-3">
                  <span className="font-mono">{shortId(o.id)}</span>
                </td>
                <td className="p-3">{o.customer?.full_name || "—"}</td>
                <td className="p-3">
                  {o.variant?.vehicleModel?.name || o.variant?.version || "—"}
                </td>
                <td className="p-3">
                  {o.order_date
                    ? new Date(o.order_date).toLocaleDateString("vi-VN")
                    : "—"}
                </td>
                <td className="p-3 text-right">{vnd(o.total_amount)}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full
                  ${
                    o.status === "delivered"
                      ? "bg-green-100 text-green-700"
                      : o.status === "confirmed"
                      ? "bg-emerald-100 text-emerald-700"
                      : o.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : o.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="p-3 text-right space-x-3">
                  <button
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => handleView(o)}
                    title="Xem chi tiết"
                  >
                    <Eye size={18} />
                  </button>
                  {o.status === "pending" && (
                    <button
                      className="text-pink-600 hover:text-pink-800"
                      onClick={() => onPayMomo(o.id)}
                      title="Thanh toán MoMo"
                    >
                      <CreditCard size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal xem chi tiết (hoạt động khi không truyền onView) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Chi tiết đơn hàng{" "}
              {selected?.id && (
                <Badge className="ml-2" variant="secondary">
                  {shortId(selected.id)}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Khách hàng</span>
              <span className="font-medium">
                {selected?.customer?.full_name || "—"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{selected?.customer?.email || "—"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Đại lý</span>
              <span>{selected?.dealer?.name || "—"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Xe</span>
              <span>
                {selected?.variant?.vehicleModel?.name ||
                  selected?.variant?.version ||
                  "—"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Ngày đặt</span>
              <span>
                {selected?.order_date
                  ? new Date(selected.order_date).toLocaleString("vi-VN")
                  : "—"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Tổng tiền</span>
              <span className="font-semibold">
                {selected ? vnd(selected.total_amount) : "—"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Trạng thái</span>
              <span className="capitalize">{selected?.status || "—"}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
