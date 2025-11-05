"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Car } from "lucide-react";

export default function EvmLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const nav = [
    { href: "/dashboard/evm/dealers", label: "Tài khoản đại lý", icon: Users },
    { href: "/dashboard/evm/vehicle-catalog", label: "Danh mục xe đại lý", icon: Car },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 shrink-0 border-r bg-white">
        <div className="p-4 border-b">
          <div className="text-lg font-semibold">EVM Admin</div>
          <div className="text-xs text-gray-500">Quản trị hệ thống</div>
        </div>
        <nav className="p-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm " +
                  (active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100")
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

