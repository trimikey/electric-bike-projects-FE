// app/layout.tsx
import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import SessionClientProvider from "@/components/providers/SessionClientProvider";
import Navbar from "@/components/layout/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-gray-50">
        <SessionClientProvider>
          <AuthProvider>
            {/* Navbar cố định 1 lần duy nhất */}
            <Navbar />
            {/* Chừa top padding = chiều cao Navbar (64px -> pt-16) */}
            <main className="min-h-screen pt-16">{children}</main>
          </AuthProvider>
        </SessionClientProvider>
      </body>
    </html>
  );
}
