import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

const handler = NextAuth({
  providers: [
    // 🌐 GOOGLE LOGIN (Customer)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { scope: "openid email profile" } },
    }),

    // 🔑 INTERNAL LOGIN (Admin / Dealer / EVM Staff)
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: {}, password: {} },

      async authorize(credentials) {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_BE_URL}/users/login`,
            {
              email: credentials?.email,
              password: credentials?.password,
            }
          );

          const { user } = res.data;
          const accessToken = res.data?.token?.accessToken;
          const refreshToken = res.data?.token?.refreshToken;

          if (!user || !accessToken) {
            throw new Error("Login response invalid");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.full_name || user.email,
            role_name: user.role_name,
            accessToken,
            refreshToken,
          };
        } catch (err: any) {
          console.error("❌ authorize() error:", err.response?.data || err);
          throw new Error("Đăng nhập thất bại");
        }
      },
    }),
  ],

  callbacks: {
    /**
     * ✅ JWT callback — xử lý token chung cho cả Google & Credentials
     */
    async jwt({ token, user, account }) {
      // 1️⃣ Lưu thông tin user khi login bằng Credentials
      if (user) {
        token.id = (user as any).id ?? token.id;
        token.email = (user as any).email ?? token.email;
        token.name = (user as any).name ?? token.name;
        token.role_name = (user as any).role_name ?? token.role_name;
        token.accessToken = (user as any).accessToken ?? token.accessToken;
        token.refreshToken = (user as any).refreshToken ?? token.refreshToken;
      }

      // 2️⃣ Nếu là Google login (OAuth2)
      if (account?.provider === "google" && account.id_token) {
        try {
          // Gửi ID token Google về BE để xác minh và upsert Customer
          const resp = await axios.post(
            `${process.env.NEXT_PUBLIC_BE_URL}/auth/google`,
            { idToken: account.id_token }
          );

          const data = resp.data;

          token.id = data?.customer?.id || token.id;
          token.name = data?.customer?.full_name || token.name;
          token.email = data?.customer?.email || token.email;
          token.role_name = data?.customer?.role_name || "Customer";
          token.accessToken = data?.accessToken || token.accessToken || null;
          token.refreshToken = data?.refreshToken || token.refreshToken || null;

          // Lưu lại ID token để FE dùng cho các API phụ (nếu cần)
          token.googleIdToken = account.id_token;
        } catch (error) {
          console.error("❌ BE /auth/google verify failed:", error);
          // fallback: vẫn cho login bằng Google profile, nhưng ko có token BE
          token.role_name = token.role_name || "Customer";
        }
      }

      return token;
    },

    /**
     * ✅ Session callback — gửi token từ JWT xuống FE
     */
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        role_name: token.role_name as string,
        accessToken: token.accessToken as string | undefined,
      };

      session.accessToken = token.accessToken as string | undefined;
      session.refreshToken = token.refreshToken as string | undefined;
      (session as any).googleIdToken = (token as any).googleIdToken ?? null;

      return session;
    },
  },

  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
