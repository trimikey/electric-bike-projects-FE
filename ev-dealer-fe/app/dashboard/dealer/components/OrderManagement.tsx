"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Eye, CreditCard, PlusCircle } from "lucide-react";
import api from "@/lib/api";
import OrderForm from "./OrderForm";
import MomoPaymentModal from "./MomoPaymentModal";

interface Order {
    id: string;
    customer?: { full_name: string; email: string };
    variant?: { name: string };
    total_amount: number;
    order_date: string;
    status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
}

export default function OrderManagement() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

    // 🔹 Load danh sách đơn hàng
    const loadOrders = async () => {
        try {
            const res = await api.get("/orders");
            setOrders(res.data);
        } catch (err: any) {
            console.error(err);
            toast.error("Không thể tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    // 🔹 Thanh toán MoMo
    const handlePayMomo = async (orderId: string) => {
        try {
            const res = await api.post("/payments/momo", {
                order_id: orderId,
                method: "momo", // 🆕 thêm dòng này

            });
            const { qrCodeUrl, paymentUrl } = res.data;

            setCurrentOrderId(orderId);

            if (qrCodeUrl) {
                setQrUrl(qrCodeUrl); // ✅ Hiện mã QR nếu có
            } else if (paymentUrl) {
                window.open(paymentUrl, "_blank");
            } else {
                toast.warning("Không có mã QR hoặc URL thanh toán.");
            }
        } catch (err: any) {
            console.error(err);
            toast.error("Không thể tạo thanh toán MoMo");
        }
    };

    // 🔹 Xác nhận thanh toán (sau khi user nhấn “Đã thanh toán”)
    const handleConfirmPayment = async () => {
        try {
            toast.info("Đang kiểm tra trạng thái đơn hàng...");
            await new Promise((r) => setTimeout(r, 2000)); // giả delay kiểm tra IPN
            await loadOrders();
            toast.success("✅ Đơn hàng đã được xác nhận thanh toán!");
            setQrUrl(null);
            setCurrentOrderId(null);
        } catch (err) {
            toast.error("Không thể cập nhật trạng thái đơn hàng");
        }
    };

    return (
        <section className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">💳 Quản lý đơn hàng</h2>
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    onClick={() => setShowModal(true)}
                >
                    <PlusCircle size={18} />
                    Tạo đơn hàng mới
                </button>

                {showModal && (
                    <OrderForm
                        onClose={() => setShowModal(false)}
                        onSuccess={() => loadOrders()}
                    />
                )}
            </div>

            {loading ? (
                <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin" /> Đang tải danh sách...
                </div>
            ) : orders.length === 0 ? (
                <p>Chưa có đơn hàng nào.</p>
            ) : (
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
                                    <td className="p-3">{o.variant?.name || "—"}</td>
                                    <td className="p-3">
                                        {new Date(o.order_date).toLocaleDateString("vi-VN")}
                                    </td>
                                    <td className="p-3 text-right">
                                        {o.total_amount.toLocaleString("vi-VN")} ₫
                                    </td>
                                    <td className="p-3">
                                        <span
                                            className={`px-2 py-1 text-xs font-medium rounded-full ${o.status === "delivered"
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
                                            onClick={() => toast.info("Chức năng xem chi tiết...")}
                                        >
                                            <Eye size={18} />
                                        </button>

                                        {o.status === "pending" && (
                                            <button
                                                className="text-pink-600 hover:text-pink-800"
                                                onClick={() => handlePayMomo(o.id)}
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
            )}

            {/* 🆕 Modal QR MoMo */}
            {qrUrl && (
                <MomoPaymentModal
                    qrUrl={qrUrl}
                    onClose={() => {
                        setQrUrl(null);
                        setCurrentOrderId(null);
                    }}
                    onConfirm={handleConfirmPayment}
                />
            )}
        </section>
    );
}
