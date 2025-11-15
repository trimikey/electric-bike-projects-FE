"use client";

import { QRCodeSVG } from "qrcode.react";

interface MomoPaymentModalProps {
  qrUrl: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function MomoPaymentModal({ qrUrl, onClose, onConfirm }: MomoPaymentModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full text-center">
        <h3 className="text-lg font-semibold mb-4">💰 Thanh toán qua MoMo</h3>

        {/* ✅ Tạo QR Code từ chuỗi momo:// */}
        <div className="flex justify-center mb-4">
          <QRCodeSVG value={qrUrl} size={200} />
        </div>

        <p className="text-gray-600 mb-4">
          Quét mã bằng ứng dụng <b>MoMo</b> để hoàn tất thanh toán.
        </p>

        <div className="flex justify-center gap-3">
          <button
            className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
            onClick={onConfirm}
          >
            Đã thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}
