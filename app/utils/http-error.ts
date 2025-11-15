import { ApiErrorPayload } from "../types/api";


export function parseApiError(e: any): { message: string; errors?: Record<string,string> } {
  const data: ApiErrorPayload | undefined = e?.response?.data;
  return {
    message: data?.message || e?.message || "Đã có lỗi xảy ra",
    errors: data?.errors,
  };
}
