

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
 
      <main className="flex-1 bg-gray-50 p-6">{children}</main>

    </div>
  );
}
