"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { complaintSchema, type ComplaintPayload } from "@/app/schemas/complaint";
import { useCustomersMini } from "@/app/hooks/useCustomersMini";
import { useDealersMini } from "@/app/hooks/useDealersMini";

export function ComplaintForm({
    initialValues,
    onSubmit,
    onCancel,
    enableStatus = false,
}: {
    initialValues?: Partial<ComplaintPayload> & { id?: string; status?: any };
    onSubmit: (values: ComplaintPayload) => Promise<void> | void;
    onCancel?: () => void;
    enableStatus?: boolean; // khi edit cho phép đổi status
}) {
    const form = useForm<ComplaintPayload>({
        resolver: zodResolver(complaintSchema),
        defaultValues: {
            customer_id: initialValues?.customer_id ?? "",
            dealer_id: initialValues?.dealer_id ?? undefined,
            description: initialValues?.description ?? "",
            status: (initialValues?.status as any) ?? "pending",
        },
    });

    useEffect(() => {
        if (!initialValues) return;
        form.reset({
            customer_id: initialValues.customer_id ?? "",
            dealer_id: initialValues.dealer_id ?? undefined,
            description: initialValues.description ?? "",
            status: (initialValues.status as any) ?? "pending",
        });
    }, [initialValues]);

    const customers = useCustomersMini();
    const dealers = useDealersMini();

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
                                <FormLabel>Đại lý (tuỳ chọn)</FormLabel>
                                <Select
                                    // ❗ giá trị undefined sẽ hiển thị placeholder, không dùng chuỗi rỗng
                                    value={field.value ?? undefined}
                                    onValueChange={(v) => field.onChange(v === "__none__" ? undefined : v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn đại lý (nếu có)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* ❗ KHÔNG dùng value="" */}
                                        <SelectItem value="__none__">— Không gán —</SelectItem>
                                        {dealers.options.map((d) => (
                                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mô tả</FormLabel>
                            <FormControl><Textarea rows={4} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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
                                        <SelectItem value="pending">Đang chờ</SelectItem>
                                        <SelectItem value="in_progress">Đang xử lý</SelectItem>
                                        <SelectItem value="resolved">Đã giải quyết</SelectItem>
                                        <SelectItem value="rejected">Từ chối</SelectItem>
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
