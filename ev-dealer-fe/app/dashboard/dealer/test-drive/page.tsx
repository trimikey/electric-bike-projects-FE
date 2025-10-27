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
      toast.error("Không thể tải danh sách lịch lái thử");
      console.error("❌ Lỗi lấy test drives:", err.response?.data || err.message);
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
