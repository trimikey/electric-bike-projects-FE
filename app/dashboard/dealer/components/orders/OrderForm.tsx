"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { OrderCreateInput, orderCreateSchema } from "@/app/schemas/order";
import { useRefs } from "@/app/hooks/useRefs";
import { vnd } from "@/app/utils/currency";


export default function OrderForm({
  open = true, onClose, onCreate,
}: {
  open?: boolean;
  onClose: () => void;
  onCreate: (v: OrderCreateInput) => Promise<void> | void;
}) {
  const { customers, variants, dealers, loading } = useRefs();
  const form = useForm<OrderCreateInput>({
    resolver: zodResolver(orderCreateSchema),
    defaultValues: { customer_id: "", dealer_id: "", variant_id: "", total_amount: 0, payment_method: "momo" },
  });

  useEffect(() => { if (loading) return; }, [loading]);

  const onSubmit = async (values: OrderCreateInput) => {
    try {
      await onCreate(values);
      toast.success("✅ Tạo đơn hàng thành công!");
      onClose();
    } catch (e: any) {
      const msg = e?.message || "Không thể tạo đơn hàng";
      if (e?.errors) {
        Object.entries(e.errors).forEach(([field, message]) =>
          form.setError(field as any, { type: "server", message: String(message) })
        );
      } else toast.error(msg);
    }
  };

  const updatePrice = (variantId: string) => {
    const v = variants.find((x) => x.id === variantId);
    form.setValue("variant_id", variantId);
    form.setValue("total_amount", v ? Number(v.base_price) : 0, { shouldValidate: true });
  };

  return !open ? null : (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[420px]">
        <h2 className="text-lg font-semibold mb-4">🆕 Tạo đơn hàng mới</h2>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Khách hàng</label>
            <select {...form.register("customer_id")} className="w-full border rounded-md p-2">
              <option value="">Chọn khách hàng</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>)}
            </select>
            <p className="text-xs text-red-600 mt-1">{form.formState.errors.customer_id?.message}</p>
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1">Đại lý</label>
            <select {...form.register("dealer_id")} className="w-full border rounded-md p-2">
              <option value="">Chọn đại lý</option>
              {dealers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <p className="text-xs text-red-600 mt-1">{form.formState.errors.dealer_id?.message}</p>
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1">Phiên bản xe</label>
            <select
              value={form.watch("variant_id")}
              onChange={(e) => updatePrice(e.target.value)}
              className="w-full border rounded-md p-2"
            >
              <option value="">Chọn xe</option>
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicleModel?.name || "Không rõ model"} – {v.version} ({v.color})
                </option>
              ))}
            </select>
            <p className="text-xs text-red-600 mt-1">{form.formState.errors.variant_id?.message}</p>
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1">Phương thức thanh toán</label>
            <select {...form.register("payment_method")} className="w-full border rounded-md p-2">
              <option value="momo">MoMo</option>
              <option value="vnpay">VNPay</option>
              <option value="cash">Tiền mặt</option>
              <option value="bank_transfer">Chuyển khoản</option>
              <option value="installment">Trả góp</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Tổng tiền</label>
            <input readOnly value={form.watch("total_amount") ? vnd(form.watch("total_amount")) : ""} className="w-full border rounded-md p-2 bg-gray-50" />
            <p className="text-xs text-red-600 mt-1">{form.formState.errors.total_amount?.message}</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
}
