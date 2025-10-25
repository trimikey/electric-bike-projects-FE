"use client";

import { Home, Car, ShoppingCart, Users, BarChart } from "lucide-react";

const menuItems = [
  { id: "overview", label: "Tổng quan", icon: Home },
  { id: "vehicles", label: "Danh mục xe", icon: Car },
  { id: "sales", label: "Bán hàng", icon: ShoppingCart },
  { id: "customers", label: "Khách hàng", icon: Users },
  { id: "reports", label: "Báo cáo", icon: BarChart },
];

export default function DealerSidebar({ activeTab, onSelect }: any) {
  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-5 border-b">
        <h2 className="text-xl font-bold text-blue-700">EV Dealer</h2>
        <p className="text-sm text-gray-500">Dealer Management</p>
      </div>
      <nav className="flex-1 p-3 space-y-2">
        {menuItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`flex items-center w-full gap-3 px-4 py-2 rounded-lg transition ${
              activeTab === id
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
