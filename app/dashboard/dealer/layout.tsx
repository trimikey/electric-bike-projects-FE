import DealerSidebar from "./components/DealerSidebar";

export default function DealerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <DealerSidebar />
      <div className="flex-1 flex flex-col">
        {/* header nếu có */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
