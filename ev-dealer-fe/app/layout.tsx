import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import SessionClientProvider from "@/components/providers/SessionClientProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <SessionClientProvider>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
          </AuthProvider>
        </SessionClientProvider>
      </body>
    </html>
  );
}
