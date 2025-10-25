"use client";

export default function SalesManagement() {
  return (
    <section className="p-6">
      <h2 className="text-xl font-semibold mb-4">Quản lý bán hàng</h2>
      <ul className="list-disc pl-5 text-gray-700 space-y-2">
        <li>Tạo báo giá, đơn hàng, hợp đồng bán hàng.</li>
        <li>Quản lý khuyến mãi và đặt xe theo nhu cầu.</li>
        <li>Theo dõi tình trạng giao xe và thanh toán.</li>
      </ul>
      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
        + Tạo báo giá mới
      </button>
    </section>
  );
}
