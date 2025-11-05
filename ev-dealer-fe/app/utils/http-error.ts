import { ApiErrorPayload } from "../types/api";

/**
 * Parse API error từ interceptor hoặc axios error
 * Interceptor đã chuẩn hóa lỗi thành: { status, message, errors, raw }
 */
export function parseApiError(e: any): { message: string; errors?: Record<string, string> } {
  // ✅ TH1: Lỗi đã qua interceptor (format: { status, message, errors, raw })
  if (e?.message && (e?.status !== undefined || e?.errors !== undefined)) {
    return {
      message: e.message || "Đã có lỗi xảy ra",
      errors: e.errors,
    };
  }

  // ✅ TH2: Lỗi axios chưa qua interceptor (fallback)
  const data: ApiErrorPayload | undefined = e?.response?.data;
  return {
    message: data?.message || e?.message || "Đã có lỗi xảy ra",
    errors: data?.errors,
  };
}
