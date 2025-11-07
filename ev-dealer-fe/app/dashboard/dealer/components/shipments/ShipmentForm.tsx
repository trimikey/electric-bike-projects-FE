"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { shipmentSchema, type ShipmentPayload } from "@/app/schemas/shipment";
import { useDealersMini } from "@/app/hooks/useDealersMini";
import { useOrdersMini } from "@/app/hooks/useOrdersMini";

export function ShipmentForm({
  initialValues,
  onSubmit,
  onCancel,
  enableStatus = false,
}: {
  initialValues?: Partial<ShipmentPayload> & { id?: string; status?: any };
  onSubmit: (values: ShipmentPayload) => Promise<void> | void;
  onCancel?: () => void;
  enableStatus?: boolean;
}) {
  const form = useForm<ShipmentPayload>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      type: (initialValues?.type as any) ?? "factory_to_dealer",
      dealer_id: initialValues?.dealer_id ?? "",
      order_id: initialValues?.order_id ?? "",
      delivery_address: initialValues?.delivery_address ?? "",
      status: (initialValues?.status as any) ?? "pending",
    },
  });

  useEffect(() => {
    if (!initialValues) return;
    form.reset({
      type: (initialValues.type as any) ?? "factory_to_dealer",
      dealer_id: initialValues.dealer_id ?? "",
      order_id: initialValues.order_id ?? "",
      delivery_address: initialValues.delivery_address ?? "",
      status: (initialValues.status as any) ?? "pending",
    });
  }, [initialValues]);

  const dealers = useDealersMini();
  const orders = useOrdersMini();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(async (v) => onSubmit(v))} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại giao vận</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Chọn loại" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="factory_to_dealer">Từ hãng → đại lý</SelectItem>
                    <SelectItem value="dealer_to_customer">Đại lý → khách hàng</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dealer_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Đại lý</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Chọn đại lý" /></SelectTrigger>
                  <SelectContent>
                    {dealers.options.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="order_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Đơn hàng</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Chọn đơn hàng" /></SelectTrigger>
                  <SelectContent>
                    {orders.options.map((o) => (
                      <SelectItem key={o.id} value={o.id}>#{o.id.slice(0,6)} • {o.status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="delivery_address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Địa chỉ giao (tuỳ chọn)</FormLabel>
                <FormControl>
                  <Textarea rows={3} placeholder="Nhập địa chỉ giao hàng (nếu giao cho khách)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {enableStatus && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trạng thái</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_transit">In transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-2">
          {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Huỷ</Button>}
          <Button type="submit">Lưu</Button>
        </div>
      </form>
    </Form>
  );
}
