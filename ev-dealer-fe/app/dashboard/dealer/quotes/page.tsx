// ==========================
// FILE: app/dashboard/dealer/quotes/page.tsx
// ==========================
"use client";

import { useState, useMemo, useCallback } from "react";
import { Plus, Loader2, Pencil, Trash2, Car, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { QuoteForm } from "@/app/dashboard/dealer/components/quotes/QuoteForm";
import { useQuotes } from "@/app/hooks/useQuotes";
import { Quote } from "@/app/schemas/quote";
import { vnd } from "@/app/utils/currency";
import { Column, DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";

export default function DealerQuotesPage() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Quote | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [creatingId, setCreatingId] = useState<string | null>(null); // ✅ trạng thái loading cho nút tạo đơn

  const { quotes, isLoading, createQuote, updateQuote, removeQuote, createOrderFromQuote } = useQuotes();

  const onEdit = useCallback((q: Quote) => {
    setEditing(q);
    setOpen(true);
  }, []);

  const onDelete = useCallback(
    async (id: string) => {
      try {
        await removeQuote(id);
        toast({ title: "Đã xoá báo giá" });
      } catch (e: any) {
        toast({ title: "Xoá thất bại", description: e?.message, variant: "destructive" });
      }
    },
    [removeQuote, toast]
  );

  const onCreateOrder = useCallback(
    async (id: string) => {
      setCreatingId(id);
      try {
        const order = await createOrderFromQuote(id);
        toast({
          title: "Tạo đơn thành công",
          description: order?.id ? `Đã tạo Order #${order.id}` : "Đơn hàng đã được tạo.",
        });
      } catch (e: any) {
        toast({ title: "Không tạo được đơn hàng", description: e?.message, variant: "destructive" });
      } finally {
        setCreatingId(null);
      }
    },
    [createOrderFromQuote, toast]
  );

  const columns: Column<Quote>[] = useMemo(
    () => [
      {
        header: "Customer",
        accessorKey: "customer.full_name",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.customer?.full_name}</span>
            <span className="text-xs text-muted-foreground">{row.original.customer?.email}</span>
          </div>
        ),
      },
      {
        header: "Dealer",
        accessorKey: "dealer.name",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.dealer?.name}</span>
            <span className="text-xs text-muted-foreground">{row.original.dealer?.email}</span>
          </div>
        ),
      },
      {
        header: "Variant",
        accessorKey: "variant.version",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.variant?.version}</span>
            <span className="text-xs text-muted-foreground">{row.original.variant?.color}</span>
          </div>
        ),
      },
      {
        header: "Price",
        accessorKey: "price",
        cell: ({ row }) => <span className="font-semibold">{vnd(row.original.price)}</span>,
      },
      {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => {
          const isCreating = creatingId === row.original.id;
          return (
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" onClick={() => onEdit(row.original)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="destructive" onClick={() => setDeleteId(row.original.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => onCreateOrder(row.original.id)}
                disabled={isCreating}
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <FileCheck2 className="h-4 w-4 mr-1" />
                )}
                {isCreating ? "Đang tạo..." : "Tạo đơn"}
              </Button>
            </div>
          );
        },
      },
    ],
    [onEdit, onCreateOrder, creatingId]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Car className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Báo giá</h1>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Thêm báo giá
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách báo giá</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Đang tải
            </div>
          ) : (
            <DataTable columns={columns} data={quotes} emptyLabel="Chưa có báo giá nào" />
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Cập nhật báo giá" : "Tạo báo giá"}</DialogTitle>
          </DialogHeader>
          <QuoteForm
            initialValues={editing ?? undefined}
            onCancel={() => setOpen(false)}
            onSubmit={async (values) => {
              try {
                if (editing) {
                  await updateQuote(editing.id, values);
                  toast({ title: "Đã cập nhật báo giá" });
                } else {
                  await createQuote(values);
                  toast({ title: "Đã tạo báo giá" });
                }
                setOpen(false);
              } catch (e: any) {
                toast({ title: "Lưu thất bại", description: e?.message, variant: "destructive" });
              }
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Confirm delete */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá báo giá</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xoá báo giá này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteId) {
                  await onDelete(deleteId);
                  setDeleteId(null);
                }
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
