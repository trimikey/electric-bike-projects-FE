export default function Home() {
  return (
    <div className="rounded-2xl bg-white shadow p-8">
      <h1 className="text-2xl font-semibold">Electric Vehicle Dealer Management System</h1>
      <p className="mt-2 text-gray-600">Phần mềm quản lý bán xe điện qua kênh đại lý.</p>
      <ul className="mt-4 list-disc pl-6 text-gray-700">
        <li>Đăng nhập Google</li>
        <li>Dashboard theo vai trò: Dealer / EVM / Admin / Customer</li>
        <li>Báo giá, đơn hàng, quản lý khách hàng, phân phối, báo cáo</li>
      </ul>
    </div>
  );
}
