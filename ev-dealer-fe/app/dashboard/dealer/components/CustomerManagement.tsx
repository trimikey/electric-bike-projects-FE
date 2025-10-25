"use client";

import { Users, CalendarCheck, MessageSquare } from "lucide-react";

export default function CustomerManagement() {
  const features = [
    {
      id: "profile",
      title: "Quản lý hồ sơ khách hàng",
      description:
        "Xem, tìm kiếm và thêm mới hồ sơ khách hàng của đại lý. Quản lý thông tin cá nhân, lịch sử mua hàng và trạng thái khách.",
      icon: Users,
      actionLabel: "+ Thêm khách hàng",
      onClick: () => alert("Chuyển đến trang thêm khách hàng"),
    },
    {
      id: "testDrive",
      title: "Quản lý lịch hẹn lái thử",
      description:
        "Tạo và theo dõi lịch hẹn lái thử xe cho khách hàng. Kiểm tra trạng thái và kết quả lái thử.",
      icon: CalendarCheck,
      actionLabel: "+ Tạo lịch hẹn",
      onClick: () => alert("Đi đến quản lý lịch hẹn"),
    },
    {
      id: "complaint",
      title: "Khiếu nại & phản hồi",
      description:
        "Ghi nhận và xử lý các phản hồi, khiếu nại của khách hàng để nâng cao chất lượng dịch vụ.",
      icon: MessageSquare,
      actionLabel: "Xem khiếu nại",
      onClick: () => alert("Đi đến danh sách khiếu nại"),
    },
  ];

  return (
    <section className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Quản lý khách hàng</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map(({ id, title, description, icon: Icon, actionLabel, onClick }) => (
          <div
            key={id}
            className="bg-white shadow-md rounded-xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-4">{description}</p>

            <button
              onClick={onClick}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
            >
              {actionLabel}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
