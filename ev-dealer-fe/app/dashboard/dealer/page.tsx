"use client";

import { useState } from "react";
import DealerSidebar from "./components/DealerSidebar";
import VehicleList from "./components/VehicleList";
import SalesManagement from "./components/SalesManagement";
import CustomerManagement from "./components/CustomerManagement";
import Reports from "./components/Reports";
import TestDriveList from "./components/TestDriveList";
import DealerManagement from "./components/DealerManagement";
import OrderManagement from "./components/OrderManagement";


export default function DealerDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const renderContent = () => {
    switch (activeTab) {
      case "vehicles":
        return <VehicleList />;
      case "sales":
        return <SalesManagement />;
      case "customers":
        return <CustomerManagement />;
      case "reports":
        return <Reports />;
      case "testdrive":
        return <TestDriveList data={[]} reload={() => { }} />;
      case "dealers":
        return <DealerManagement />;
      case "orders":
        return <OrderManagement/>
      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Dealer Dashboard</h1>
            <p className="text-gray-600">
              Chào mừng bạn đến trang quản lý đại lý. Hãy chọn một chức năng từ menu bên trái.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <DealerSidebar activeTab={activeTab} onSelect={setActiveTab} />
      <div className="flex-1 flex flex-col">

        <main className="flex-1 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
}
