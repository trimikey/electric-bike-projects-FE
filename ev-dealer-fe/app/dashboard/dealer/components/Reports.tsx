"use client";

export default function Reports() {
  return (
    <section className="p-6">
      <h2 className="text-xl font-semibold mb-4">Báo cáo & Thống kê</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="font-medium mb-2">Doanh số theo nhân viên</h3>
          <p className="text-gray-500 text-sm">Biểu đồ doanh số tháng này.</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="font-medium mb-2">Công nợ khách hàng</h3>
          <p className="text-gray-500 text-sm">Báo cáo công nợ, thanh toán.</p>
        </div>
      </div>
    </section>
  );
}
