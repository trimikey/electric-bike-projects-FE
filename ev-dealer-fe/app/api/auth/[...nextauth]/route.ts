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

      async profile(profile) {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_BE_URL}/auth/google`,
            {
              email: profile.email,
              name: profile.name,
            }
          );

          const data = res.data;

          return {
            id: data.customer?.id || profile.sub,
            name: data.customer?.full_name || profile.name,
            email: profile.email,
            role_name: data.customer?.role_name || "Customer",
            accessToken: data?.accessToken || null,
            refreshToken: data?.refreshToken || null,
          };
        } catch (err) {
          console.error("❌ Google login BE failed:", err);
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            role_name: "Customer",
          };
        }
      },
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
    // ✅ Lưu token vào JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role_name = user.role_name;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
      }
      return token;
    },

    // ✅ Truyền token sang session cho FE
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        name: token.name,
        role_name: token.role_name,
        accessToken: token.accessToken,
      };

      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;

      return session;
    },
  },

  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
