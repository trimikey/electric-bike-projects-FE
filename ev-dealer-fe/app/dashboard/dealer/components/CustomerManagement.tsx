
"use client";
import { useCustomers } from "@/app/hooks/useCustomers";
import { Customer } from "@/app/types/customer";
import { useState } from "react";
import { toast } from "sonner";
import CustomerTable from "./customers/CustomerTable";
import CustomerForm from "./customers/CustomerForm";
import ConfirmDialog from "./customers/ConfirmDialog";
import { parseApiError } from "@/app/utils/http-error";



export default function CustomersPage() {
  const { customers, isLoading, add, update, remove } = useCustomers();
  const [openForm, setOpenForm] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [current, setCurrent] = useState<Customer | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);


  const handleAdd = () => {
    setMode("create");
    setCurrent(null);
    setOpenForm(true);
  };


  const handleEdit = (c: Customer) => {
    setMode("edit");
    setCurrent(c);
    setOpenForm(true);
  };


  return (
    <section className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Quản lý khách hàng</h2>
      </div>


      <CustomerTable
        customers={customers}
        isLoading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={(id) => setConfirmDelete(id)}
      />



      <CustomerForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        mode={mode}
        initial={current || undefined}
        onCreate={async (v) => {
          try {
            await add(v);
            toast.success("Thêm khách hàng thành công");
          } catch (e: any) {
            const { message } = parseApiError(e);
            toast.error(message);
            throw e; // ❗ Quan trọng: rethrow để Form KHÔNG tự đóng
          }
        }}
        onUpdate={async (id, v) => {
          try {
            await update(id, v);
            toast.success("Cập nhật khách hàng thành công");
          } catch (e: any) {
            const { message } = parseApiError(e);
            toast.error(message);
            throw e;
          }
        }}
      />


      <ConfirmDialog
        open={!!confirmDelete}
        title="Xóa khách hàng"
        description="Bạn có chắc muốn xóa khách hàng này?"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (!confirmDelete) return;
          try {
            await remove(confirmDelete);
            toast.success("Xóa thành công");
          } catch (e) {
            toast.error("Lỗi khi xóa khách hàng");
          } finally {
            setConfirmDelete(null);
          }
        }}
      />
    </section>
  );
}