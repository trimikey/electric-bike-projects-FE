"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import TestDriveList from "../components/TestDriveList";

export default function TestDrivePage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.get("/test-drives");
      setList(res.data);
    } catch (err: any) {
      // ✅ Lỗi đã qua interceptor: { status, message, errors, raw }
      const errorMsg = err?.message || "Không thể tải danh sách lịch lái thử";
      toast.error(errorMsg);
      console.error("❌ Lỗi lấy test drives:", {
        status: err?.status,
        message: err?.message,
        errors: err?.errors,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="p-6">
      <h2 className="text-xl font-semibold mb-4">📅 Quản lý lịch lái thử</h2>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <TestDriveList data={list} reload={load} />
      )}
    </section>
  );
}
