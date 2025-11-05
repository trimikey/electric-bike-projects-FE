"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user;

  // 🧭 Hàm xác định dashboard theo role
  const getDashboardPath = () => {
    const role = user?.role_name;
    switch (role) {
      case "Admin":
      case "EVM Staff":
        return "/dashboard/evm"; // Admin và EVM Staff đều vào EVM dashboard
      case "Dealer Manager":
      case "Dealer Staff":
        return "/dashboard/dealer";
      default:
        return "/dashboard/customer";
    }
  };

  // 🔹 Khi click logo hoặc Dashboard
  const handleNavigateDashboard = () => {
    const path = getDashboardPath();
    router.push(path);
  };

  return (
    <nav className="flex justify-between items-center px-6 py-3 border-b bg-white shadow-sm">
      {/* Logo → chuyển đúng dashboard theo role */}
      <button
        onClick={handleNavigateDashboard}
        className="text-lg font-semibold hover:text-blue-600 transition-all"
      >
        EV Dealer
      </button>

      <div className="flex items-center gap-4">
        {/* Dashboard link cũng xử lý giống logo */}
        <button
          onClick={handleNavigateDashboard}
          className="text-gray-700 hover:text-blue-600 transition-all"
        >
          Dashboard
        </button>

        {status === "loading" ? (
          <span className="text-gray-400 text-sm">Đang tải...</span>
        ) : user ? (
          <>
            <span className="text-sm text-gray-700">
              👋 Xin chào, <b>{user.username || user.email}</b>
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="border px-3 py-1 rounded hover:bg-gray-100"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <Link href="/login">
            <button className="border px-3 py-1 rounded hover:bg-gray-100">
              Login
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
}
