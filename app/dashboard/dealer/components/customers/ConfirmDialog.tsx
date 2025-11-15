"use client";
import { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";


export default function ConfirmDialog({
    open,
    title = "Xác nhận",
    description = "Bạn có chắc chắn?",
    onCancel,
    onConfirm,
}: {
    open: boolean;
    title?: string;
    description?: string;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">{description}</p>
                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="outline" onClick={onCancel}>Hủy</Button>
                    <Button onClick={onConfirm}>Xác nhận</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}