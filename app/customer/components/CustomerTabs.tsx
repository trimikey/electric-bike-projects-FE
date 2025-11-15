// app/customer/_components/CustomerTabs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/customer", label: "Danh sách xe" },
  { href: "/customer/orders", label: "Đơn hàng của tôi" },
  { href: "/customer/test-drives", label: "Lịch lái thử" },
];

export default function CustomerTabs() {
  const pathname = usePathname();
  return (
    <nav className="border-b bg-white rounded-lg">
      <ul className="flex gap-1 p-2">
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`inline-block rounded-md px-4 py-2 text-sm transition
                  ${active ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"}`}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
