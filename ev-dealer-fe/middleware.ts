import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // ✅ Nếu chưa login và đang ở dashboard → redirect về login
  if (!token && pathname.startsWith("/dashboard")) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname + search); // quay lại sau login
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Nếu user vừa login và truy cập /dashboard → chuyển role tương ứng
  if (pathname === "/dashboard") {
    const role = token?.role_name;
    const map: Record<string, string> = {
      Admin: "/dashboard/evm", // Admin cũng vào EVM dashboard
      "EVM Staff": "/dashboard/evm",
      "Dealer Manager": "/dashboard/dealer",
      "Dealer Staff": "/dashboard/dealer",
      Customer: "/dashboard/customer",
    };
    const dest = map[role || "Customer"] || "/dashboard/customer";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // ✅ Các route con giữ nguyên (reload không bị reset)
  return NextResponse.next();
}

// Áp dụng cho các route này
export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
