"use client";

import { useMemo, useState, useCallback } from "react";
import { Loader2, Plus, Pencil, Trash2, CheckCircle2, XCircle, MessageSquareWarning } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Complaint } from "@/app/types/complaint";
import { useComplaints } from "@/app/hooks/useComplaints";
import { toast } from "sonner";
import { ComplaintForm } from "../components/complaints/ComplaintForm";

function StatusBadge({ s }: { s: Complaint["status"] }) {
  const map: Record<Complaint["status"], string> = {
    pending: "bg-amber-100 text-amber-700",
    in_progress: "bg-sky-100 text-sky-700",
    resolved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700",
  };
  const text: Record<Complaint["status"], string> = {
    pending: "Đang chờ",
    in_progress: "Đang xử lý",
    resolved: "Đã giải quyết",
    rejected: "Từ chối",
  };
  return <Badge className={map[s]} variant="secondary">{text[s]}</Badge>;
}

export default function DealerComplaintsPage() {
  const { complaints, isLoading, create, update, remove, resolve } = useComplaints();

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Complaint | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const onEdit = useCallback((c: Complaint) => { setEditing(c); setOpenForm(true); }, []);
  const onCreate = () => { setEditing(null); setOpenForm(true); };

  const columns: Column<Complaint>[] = useMemo(() => [
    {
      header: "Khách hàng",
      accessorKey: "customer.full_name",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.customer?.full_name}</span>
          <span className="text-xs text-muted-foreground">{row.original.customer?.email}</span>
        </div>
      ),
    },
    {
      header: "Đại lý",
      accessorKey: "dealer.name",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.dealer?.name ?? "—"}</span>
          <span className="text-xs text-muted-foreground">{row.original.dealer?.email}</span>
        </div>
      ),
    },
    {
      header: "Mô tả",
      accessorKey: "description",
      cell: ({ row }) => <span className="line-clamp-2 max-w-[360px]">{row.original.description}</span>,
    },
    {
      header: "Trạng thái",
      accessorKey: "status",
      cell: ({ row }) => <StatusBadge s={row.original.status} />,
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" onClick={() => onEdit(row.original)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="destructive" onClick={() => setDeleteId(row.original.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={() => setResolvingId(row.original.id)}
            disabled={row.original.status === "resolved" || row.original.status === "rejected"}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" /> Đánh dấu xử lý
          </Button>
        </div>
      ),
    },
  ], [onEdit]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquareWarning className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Khiếu nại</h1>
        </div>
        <Button onClick={onCreate}><Plus className="mr-2 h-4 w-4" /> Tạo khiếu nại</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Danh sách khiếu nại</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Đang tải
            </div>
          ) : (
            <DataTable data={complaints} columns={columns} emptyLabel="Chưa có khiếu nại" />
          )}
        </CardContent>
      </Card>

      {/* Form create/update */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Cập nhật khiếu nại" : "Tạo khiếu nại"}</DialogTitle>
          </DialogHeader>
          <ComplaintForm
            initialValues={editing ?? undefined}
            enableStatus={!!editing}
            onCancel={() => setOpenForm(false)}
            onSubmit={async (values) => {
              try {
                if (editing) {
                  await update(editing.id, values);
                  toast.success("Đã cập nhật khiếu nại");
                } else {
                  await create(values);
                  toast.success("Đã tạo khiếu nại");
                }
                setOpenForm(false);
              } catch (e: any) {
                toast.error(e?.message || "Lỗi lưu khiếu nại");
              }
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá khiếu nại</AlertDialogTitle>
            <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteId) {
                  try { await remove(deleteId); toast.success("Đã xoá"); }
                  catch (e: any) { toast.error(e?.message || "Xoá thất bại"); }
                  setDeleteId(null);
                }
              }}
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm resolve */}
      <AlertDialog open={!!resolvingId} onOpenChange={(o) => !o && setResolvingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Đánh dấu đã xử lý?</AlertDialogTitle>
            <AlertDialogDescription>Bạn có thể chọn “Từ chối” nếu không hợp lệ.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!resolvingId) return;
                try { await resolve(resolvingId, "rejected"); toast.success("Đã từ chối khiếu nại"); }
                catch (e: any) { toast.error(e?.message || "Lỗi cập nhật"); }
                setResolvingId(null);
              }}
            >
              <XCircle className="h-4 w-4 mr-1" /> Từ chối
            </AlertDialogAction>
            <AlertDialogAction
              onClick={async () => {
                if (!resolvingId) return;
                try { await resolve(resolvingId, "resolved"); toast.success("Đã đánh dấu đã xử lý"); }
                catch (e: any) { toast.error(e?.message || "Lỗi cập nhật"); }
                setResolvingId(null);
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" /> Đã xử lý
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
