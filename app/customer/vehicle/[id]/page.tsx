// app/customer/vehicle/[id]/page.tsx
"use client";

import api from "@/lib/api";
import { use, useEffect, useMemo, useState } from "react";
import OrderDialog from "@/app/customer/components/OrderDialog";
import TestDriveDialog from "@/app/customer/components/TestDriveDialog";
import { useRouter } from "next/navigation";

type Variant = {
  id: string;
  version: string;
  color: string;
  base_price: number | string;
  thumbnail_url?: string | null;
};
type VehicleModel = {
  id: string;
  name: string;
  description?: string | null;
  variants: Variant[];
};
type Dealer = { id: string; name: string };

const vnd = (n?: number | string | null) =>
  n == null ? "—" : (typeof n === "string" ? Number(n) : n).toLocaleString("vi-VN") + " đ";

// ✅ params giờ là Promise —> dùng use() để unwrap
export default function ModelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params); // <-- quan trọng

  const [model, setModel] = useState<VehicleModel | null>(null);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);

  const [orderOpen, setOrderOpen] = useState(false);
  const [testDriveOpen, setTestDriveOpen] = useState(false);

  // ✅ Mọi setState đều nằm trong useEffect (không setState trong render)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [mRes] = await Promise.all([
          api.get<VehicleModel>(`/vehicles/models/${id}`),
        ]);
        if (!cancelled) {
          setModel(mRes.data);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const firstVariant = useMemo(() => model?.variants?.[0], [model]);

  if (loading) return <p>Đang tải…</p>;
  if (!model) return <p>Không tìm thấy model.</p>;

  return (
    <section>
      <button
        onClick={() => router.back()}
        className="text-sm text-gray-600 hover:underline"
      >
        ← Quay lại
      </button>

      <div className="mt-3 bg-white rounded-lg shadow p-4">
        <h1 className="text-xl font-semibold">{model.name}</h1>
        <p className="text-gray-600">{model.description || "—"}</p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {model.variants?.map((v) => (
            <div key={v.id} className="border rounded-lg p-3">
              <img
                src={v.thumbnail_url || "/vehicles/default.jpg"}
                alt={`${model.name} ${v.version}`}
                className="w-full h-40 object-cover rounded"
              />
              <div className="mt-2">
                <div className="font-medium">
                  {v.version} – {v.color}
                </div>
                <div className="text-gray-700">Giá: {vnd(v.base_price)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => setOrderOpen(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Đặt mua
          </button>
          <button
            onClick={() => setTestDriveOpen(true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Đặt lịch lái thử
          </button>
        </div>
      </div>

      <OrderDialog
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        modelName={model.name}
        variants={model.variants || []}
        defaultVariantId={firstVariant?.id}
      />

      <TestDriveDialog
        open={testDriveOpen}
        onClose={() => setTestDriveOpen(false)}
        model={{ id: model.id, name: model.name }}
        dealers={dealers}
      />
    </section>
  );
}
