// app/customer/(shop)/page.tsx
"use client";

import Link from "next/link";

export default function HomeShopPage() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
        <div className="p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold">Chọn chiếc xe điện phù hợp cho bạn</h1>
          <p className="mt-3 opacity-90">
            Xem giá, so sánh phiên bản, đặt lái thử và mua online – nhanh chóng, minh bạch.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/customer/vehicles" className="px-5 py-3 rounded-lg bg-white text-blue-700 font-semibold">
              Khám phá mẫu xe
            </Link>
            <Link href="/customer/compare" className="px-5 py-3 rounded-lg border border-white/70">
              So sánh nhanh
            </Link>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-20 text-9xl pr-6 pb-2">⚡</div>
      </div>

      {/* Lợi ích nhanh */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          ["Giá rõ ràng", "Niêm yết và cập nhật theo phiên bản."],
          ["Đặt lái thử", "Chọn đại lý và thời gian thuận tiện."],
          ["Hỗ trợ thanh toán", "Momo/VNPay & trả góp tuỳ chọn."],
        ].map(([t, d]) => (
          <div key={t} className="bg-white rounded-xl shadow p-5">
            <h3 className="font-semibold">{t}</h3>
            <p className="text-gray-600 text-sm mt-1">{d}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between bg-white rounded-xl shadow p-5">
        <div>
          <h3 className="font-semibold text-lg">Sẵn sàng trải nghiệm?</h3>
          <p className="text-gray-600 text-sm">Vào danh sách xe để chọn mẫu phù hợp rồi đặt lái thử.</p>
        </div>
        <Link href="/customer/vehicle" className="px-4 py-2 rounded-lg bg-blue-600 text-white">
          Xem danh sách xe
        </Link>
      </div>
    </div>
  );
}
