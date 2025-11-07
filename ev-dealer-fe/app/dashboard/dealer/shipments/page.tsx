"use client";

import { useMemo, useState, useCallback } from "react";
import { Loader2, Plus, Pencil, Trash2, Truck, PackageCheck, PackageX, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Shipment } from "@/app/types/shipment";
import { useShipments } from "@/app/hooks/useShipments";
import { ShipmentForm } from "@/app/dashboard/dealer/components/shipments/ShipmentForm";
import { toast } from "sonner";

function StatusBadge({ s }: { s: Shipment["status"] }) {
  const map: Record<Shipment["status"], string> = {
    pending: "bg-amber-100 text-amber-700",
    in_transit: "bg-sky-100 text-sky-700",
    delivered: "bg-emerald-100 text-emerald-700",
    failed: "bg-rose-100 text-rose-700",
  };
  const text: Record<Shipment["status"], string> = {
    pending: "Pending",
    in_transit: "In transit",
    delivered: "Delivered",
    failed: "Failed",
  };
  return <Badge className={map[s]} variant="secondary">{text[s]}</Badge>;
}

export default function DealerShipmentsPage() {
  const { shipments, isLoading, create, update, remove, ship, deliver, fail } = useShipments();

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Shipment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const onEdit = useCallback((s: Shipment) => { setEditing(s); setOpenForm(true); }, []);
  const onCreate = () => { setEditing(null); setOpenForm(true); };

const columns: Column<Shipment>[] = useMemo(
  () => [
    {
      header: "Loại",
      accessorKey: "type",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.type === "factory_to_dealer" ? (
            <Truck className="h-4 w-4" />
          ) : (
            <Package className="h-4 w-4" />
          )}
          <span>
            {row.original.type === "factory_to_dealer" ? "Hãng → Đại lý" : "Đại lý → Khách"}
          </span>
        </div>
      ),
    },
    {
      header: "Đại lý",
      // ❗ Dùng accessorFn thay vì accessorKey "dealer.name"
          id: "dealer",                     // 👈 thêm id

      accessorFn: (r) => r.dealer?.name ?? "",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.dealer?.name}</span>
          <span className="text-xs text-muted-foreground">{row.original.dealer?.email}</span>
        </div>
      ),
    },
    {
      header: "Đơn hàng",
      // ❗ Dùng accessorFn cho nested "order.id"
          id: "order",                      // 👈 thêm id

      accessorFn: (r) => r.order?.id ?? r.order_id,
      cell: ({ row }) => (
        <span className="font-mono">
          #{(row.original.order?.id ?? row.original.order_id)?.slice(0, 8)}
        </span>
      ),
    },
    {
      header: "Trạng thái",
      accessorKey: "status",
      cell: ({ row }) => <StatusBadge s={row.original.status} />,
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex items-center gap-2">
            {/* <Button size="icon" variant="outline" onClick={() => onEdit(s)}>
              <Pencil className="h-4 w-4" />
            </Button> */}
            <Button size="icon" variant="destructive" onClick={() => setDeleteId(s.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                try {
                  await ship(s.id);
                  toast.success("Đã chuyển sang In transit");
                } catch (e: any) {
                  toast.error(e?.message || "Lỗi cập nhật");
                }
              }}
              disabled={s.status !== "pending"}
            >
              <Truck className="h-4 w-4 mr-1" /> Ship
            </Button>
            <Button
              size="sm"
              onClick={async () => {
                try {
                  await deliver(s.id);
                  toast.success("Đã đánh dấu Delivered");
                } catch (e: any) {
                  toast.error(e?.message || "Lỗi cập nhật");
                }
              }}
              disabled={s.status === "delivered" || s.status === "failed"}
            >
              <PackageCheck className="h-4 w-4 mr-1" /> Deliver
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={async () => {
                try {
                  await fail(s.id);
                  toast.success("Đã đánh dấu Failed");
                } catch (e: any) {
                  toast.error(e?.message || "Lỗi cập nhật");
                }
              }}
              disabled={s.status === "delivered"}
            >
              <PackageX className="h-4 w-4 mr-1" /> Fail
            </Button>
          </div>
        );
      },
    },
  ],
  // ✅ thêm đầy đủ deps để React Compiler không cảnh báo
  [onEdit, ship, deliver, fail, toast]
);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Vận chuyển</h1>
        </div>
        <Button onClick={onCreate}><Plus className="mr-2 h-4 w-4" /> Tạo shipment</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Danh sách shipment</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Đang tải
            </div>
          ) : (
            <DataTable data={shipments} columns={columns} emptyLabel="Chưa có shipment" />
          )}
        </CardContent>
      </Card>

      {/* Form create/update */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Cập nhật shipment" : "Tạo shipment"}</DialogTitle>
          </DialogHeader>
          <ShipmentForm
            initialValues={editing ?? undefined}
            enableStatus={!!editing}
            onCancel={() => setOpenForm(false)}
            onSubmit={async (values) => {
              try {
                if (editing) {
                  await update(editing.id, values);
                  toast.success("Đã cập nhật shipment");
                } else {
                  await create(values);
                  toast.success("Đã tạo shipment");
                }
                setOpenForm(false);
              } catch (e: any) {
                toast.error(e?.message || "Lỗi lưu shipment");
              }
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá shipment</AlertDialogTitle>
            <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteId) return;
                try { await remove(deleteId); toast.success("Đã xoá"); }
                catch (e:any){ toast.error(e?.message || "Xoá thất bại"); }
                setDeleteId(null);
              }}
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
