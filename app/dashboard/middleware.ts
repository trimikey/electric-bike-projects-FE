import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
  pages: {
    signIn: "/login", // ✅ redirect người chưa login về /login
  },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
