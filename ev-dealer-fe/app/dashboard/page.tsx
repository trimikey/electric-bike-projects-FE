"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardEntry() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    if (!session?.user) return;
    const role = session.user.role ?? "customer";
    if (role === "admin") router.replace("/dashboard/admin");
    else if (role === "evm_staff") router.replace("/dashboard/evm");
    else if (role === "dealer" || role === "dealer_manager") router.replace("/dashboard/dealer");
    else router.replace("/dashboard/customer");
  }, [session, router]);

  return <div>Đang chuyển hướng…</div>;
}
