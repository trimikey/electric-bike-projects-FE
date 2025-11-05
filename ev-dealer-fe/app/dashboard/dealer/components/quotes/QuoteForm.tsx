"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { QuotePayload, quoteSchema } from "@/app/schemas/quote";
import { useCustomersMini } from "@/app/hooks/useCustomersMini";
import { useDealersMini } from "@/app/hooks/useDealersMini";
import { useVariantsMini, type VariantMini } from "@/app/hooks/useVariantsMini";
import { useVehicleModelsMini } from "@/app/hooks/useVehicleModelsMini";

export function QuoteForm({
  initialValues,
  onSubmit,
  onCancel,
}: {
  initialValues?: Partial<QuotePayload> & { id?: string };
  onSubmit: (values: QuotePayload) => Promise<void> | void;
  onCancel?: () => void;
}) {
  const form = useForm<QuotePayload>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      customer_id: initialValues?.customer_id ?? "",
      dealer_id: initialValues?.dealer_id ?? "",
      variant_id: initialValues?.variant_id ?? "",
      price: initialValues?.price ?? 0,
    },
  });

  useEffect(() => {
    if (!initialValues) return;
    form.reset({
      customer_id: initialValues.customer_id ?? "",
      dealer_id: initialValues.dealer_id ?? "",
      variant_id: initialValues.variant_id ?? "",
      price: initialValues.price ?? 0,
    });
  }, [initialValues]);

  const customers = useCustomersMini();
  const dealers = useDealersMini();

  // --- NEW: chọn model để lọc variants ---
  const models = useVehicleModelsMini();
  const [modelId, setModelId] = useState<string>("");

  // variants phụ thuộc modelId
  const variants = useVariantsMini(modelId);

  // đổi model -> reset variant + giá
  useEffect(() => {
    form.setValue("variant_id", "", { shouldValidate: true });
    form.setValue("price", 0, { shouldValidate: true });
  }, [modelId]);

  // chọn variant -> auto fill giá từ base_price
  const currentVariantId = form.watch("variant_id");
  useEffect(() => {
    if (!currentVariantId) return;
    const v = variants.options.find((x: VariantMini) => x.id === currentVariantId);
    if (v && v.base_price != null) {
      form.setValue("price", Number(v.base_price), { shouldValidate: true, shouldDirty: true });
    }
  }, [currentVariantId, variants.options]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(async (v) => onSubmit(v))} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="customer_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Khách hàng</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Chọn khách hàng" /></SelectTrigger>
                  <SelectContent>
                    {customers.options.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                    ))}
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

          {/* NEW: Chọn xe (Model) */}
         <div className="flex flex-col gap-1">
  <label className="text-sm font-medium text-gray-700">Xe (Model)</label>
  <Select value={modelId} onValueChange={setModelId}>
    <SelectTrigger><SelectValue placeholder="Chọn mẫu xe" /></SelectTrigger>
    <SelectContent>
      {models.options.map((m) => (
        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>


          {/* Phiên bản – lọc theo model đã chọn */}
          <FormField
            control={form.control}
            name="variant_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phiên bản xe</FormLabel>
                <Select value={field.value} onValueChange={field.onChange} disabled={!modelId}>
                  <SelectTrigger><SelectValue placeholder="Chọn phiên bản" /></SelectTrigger>
                  <SelectContent>
                    {variants.options.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.version} - {v.color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giá</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Huỷ
            </Button>
          )}
          <Button type="submit">Lưu</Button>
        </div>
      </form>
    </Form>
  );
}
