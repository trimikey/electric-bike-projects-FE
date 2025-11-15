"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";


import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { customerCreateSchema, customerUpdateSchema } from "@/app/schemas/customer";
import { toInputDate } from "@/app/utils/date";
import { parseApiError } from "@/app/utils/http-error";


const CreateSchema = customerCreateSchema;
const UpdateSchema = customerUpdateSchema;

type CreateValues = z.infer<typeof CreateSchema>;
type UpdateValues = z.infer<typeof UpdateSchema>;

export default function CustomerForm(props: {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initial?: Partial<UpdateValues & { id: string }>;
  onCreate: (v: CreateValues) => Promise<void> | void;
  onUpdate: (id: string, v: UpdateValues) => Promise<void> | void;
}) {
  const { open, onClose, mode, initial, onCreate, onUpdate } = props;
  const isEdit = mode === "edit";
  const [formError, setFormError] = useState("");

  const form = useForm<CreateValues | UpdateValues>({
    resolver: zodResolver(isEdit ? UpdateSchema : CreateSchema),
    defaultValues: {
      full_name: initial?.full_name || "",
      email: initial?.email || "",
      phone: initial?.phone || "",
      address: initial?.address || "",
      dob: toInputDate(initial?.dob || undefined),
      ...(isEdit ? {} : { password: "" }),
    } as any,
  });

  useEffect(() => {
    setFormError("");
    form.reset({
      full_name: initial?.full_name || "",
      email: initial?.email || "",
      phone: initial?.phone || "",
      address: initial?.address || "",
      dob: toInputDate(initial?.dob || undefined),
      ...(isEdit ? {} : { password: "" }),
    } as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, isEdit, open]);

  const onSubmit = async (values: any) => {
    setFormError("");
    try {
      if (isEdit && initial?.id) {
        await onUpdate(initial.id, values as UpdateValues);
      } else {
        await onCreate(values as CreateValues);
      }
      onClose(); // chỉ đóng khi OK
    } catch (e: any) {
      const { message, errors } = parseApiError(e);

      if (errors && typeof errors === "object") {
        Object.entries(errors).forEach(([field, msg]) => {
          // set lỗi đúng field (email, full_name, ...)
          form.setError(field as any, { type: "server", message: String(msg) });
        });
      } else {
        setFormError(message || (isEdit ? "Lỗi cập nhật" : "Lỗi tạo mới"));
      }
      // KHÔNG onClose -> giữ form mở
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          {formError && (
            <div className="col-span-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div className="col-span-2 sm:col-span-1">
            <Input placeholder="Họ và tên" {...form.register("full_name")} />
            {form.formState.errors.full_name && (
              <p className="mt-1 text-xs text-red-600">{String(form.formState.errors.full_name.message)}</p>
            )}
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Input placeholder="Email" disabled={isEdit} {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="mt-1 text-xs text-red-600">{String(form.formState.errors.email.message)}</p>
            )}
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Input placeholder="Số điện thoại" {...form.register("phone")} />
            {form.formState.errors.phone && (
              <p className="mt-1 text-xs text-red-600">{String(form.formState.errors.phone.message)}</p>
            )}
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Input type="date" {...form.register("dob")} />
            {form.formState.errors.dob && (
              <p className="mt-1 text-xs text-red-600">{String(form.formState.errors.dob.message)}</p>
            )}
          </div>

          <div className="col-span-2">
            <Input placeholder="Địa chỉ" {...form.register("address")} />
            {form.formState.errors.address && (
              <p className="mt-1 text-xs text-red-600">{String(form.formState.errors.address.message)}</p>
            )}
          </div>

          {!isEdit && (
            <div className="col-span-2">
              <Input type="password" placeholder="Mật khẩu" {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="mt-1 text-xs text-red-600">{String(form.formState.errors.password.message)}</p>
              )}
            </div>
          )}

          <div className="col-span-2 flex justify-end gap-2 mt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">Lưu</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
