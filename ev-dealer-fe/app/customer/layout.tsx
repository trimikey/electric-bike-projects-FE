"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const tabs = [
    { href: "/customer", label: "Trang chủ" },
    { href: "/customer/vehicle", label: "Danh sách xe" },
    { href: "/customer/compare", label: "So sánh xe" },
    { href: "/customer/test-drives", label: "Lái thử" },

  ];

  return (
    <section className="max-w-6xl mx-auto px-4 py-6">
      {/* Tabs */}
      <div className="mb-5 bg-white rounded-xl shadow p-2 flex justify-center gap-2">
        {tabs.map((t) => {
          const active = pathname === t.href; // 👈 chỉ active khi đúng đường dẫn

          return (
            <Link
              key={t.href}
              href={t.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Content */}
      <div className="mt-4">{children}</div>
    </section>
  );
}
