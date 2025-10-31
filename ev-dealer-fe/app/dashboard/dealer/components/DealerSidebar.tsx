"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Car, ShoppingCart, Users, BarChart, CalendarClock, Building2, Building
} from "lucide-react";

type Item = { href: string; label: string; icon: React.ComponentType<{ size?: number }> };

const items: Item[] = [
  { href: "/dashboard/dealer",               label: "Tổng quan",      icon: Home },
  { href: "/dashboard/dealer/vehicle",      label: "Danh mục xe",    icon: Car },
  { href: "/dashboard/dealer/sales",         label: "Bán hàng",       icon: ShoppingCart },
  { href: "/dashboard/dealer/customers",     label: "Khách hàng",     icon: Users },
  { href: "/dashboard/dealer/test-drive",    label: "Lịch lái thử",   icon: CalendarClock },
  { href: "/dashboard/dealer/dealers",       label: "Quản lý đại lý", icon: Building2 },
  { href: "/dashboard/dealer/orders",        label: "Quản lý order",  icon: Building },
  { href: "/dashboard/dealer/reports",       label: "Báo cáo",        icon: BarChart },
];

export default function DealerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-5 border-b">
        <h2 className="text-xl font-bold text-blue-700">EV Dealer</h2>
        <p className="text-sm text-gray-500">Dealer Management</p>
      </div>

      <nav className="flex-1 p-3 space-y-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition
                ${active ? "bg-blue-100 text-blue-700 font-semibold"
                         : "text-gray-700 hover:bg-gray-100"}
              `}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
