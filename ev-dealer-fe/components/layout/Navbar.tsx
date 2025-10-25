"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <nav className="flex justify-between items-center px-6 py-3 border-b bg-white shadow-sm">
      <div className="text-lg font-semibold">
        <Link href="/">EV Dealer</Link>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/dashboard">Dashboard</Link>

        {status === "loading" ? (
          <span className="text-gray-400 text-sm">Đang tải...</span>
        ) : user ? (
          <>
            <span className="text-sm text-gray-700">
              👋 Xin chào, <b>{user.name || user.email}</b>
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
