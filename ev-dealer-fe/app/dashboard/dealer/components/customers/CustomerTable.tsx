"use client";
import { Edit, Trash2, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { Customer } from "@/app/types/customer";

export default function CustomerTable({
  customers,
  isLoading,
  onAdd,
  onEdit,
  onDelete,
}: {
  customers: Customer[];
  isLoading: boolean;
  onAdd: () => void;
  onEdit: (c: Customer) => void;
  onDelete: (id: string) => void;
}) {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    if (!q) return customers;
    const s = q.toLowerCase();
    return customers.filter(
      (c) =>
        c.full_name?.toLowerCase().includes(s) ||
        c.email?.toLowerCase().includes(s) ||
        (c.phone || "").toLowerCase().includes(s)
    );
  }, [customers, q]);

  return (
    <div className="bg-white shadow rounded-xl overflow-hidden border border-gray-100">
      <div className="p-4 flex items-center gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="Tìm theo tên, email, SĐT"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button onClick={onAdd} className="gap-2">
          <UserPlus size={16} />
          Thêm
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="p-10 text-center text-gray-500">Không có dữ liệu.</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700 font-medium">
            <tr>
              <th className="py-3 px-4 text-left">Họ và tên</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Số điện thoại</th>
              <th className="py-3 px-4 text-left">Ngày sinh</th>
              <th className="py-3 px-4 text-left">Địa chỉ</th>
              <th className="py-3 px-4 text-center w-[100px]">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c, i) => {
              // ✅ key an toàn, tránh trùng/undefined
              const safeKey =
                (c as any).id ??
                c.email ??
                `${i}-${(c.full_name || "").trim()}`;

              return (
                <tr
                  key={safeKey}
                  className={`border-t ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                >
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {c.full_name}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{c.email}</td>
                  <td className="py-3 px-4 text-gray-600">{c.phone || "—"}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {c.dob ? new Date(c.dob).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{c.address || "—"}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => onEdit(c)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(String((c as any).id ?? ""))}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
