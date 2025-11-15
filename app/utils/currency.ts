// Trả về "—" nếu không có giá trị hợp lệ
export const vnd = (n?: number | string | null) => {
  if (n === null || n === undefined) return "—";
  const num =
    typeof n === "string"
      ? Number(n.replace?.(/[^\d.-]/g, "") ?? n) // nếu lỡ là "2,499.00" thì parse
      : Number(n);

  if (!Number.isFinite(num)) return "—";
  return new Intl.NumberFormat("vi-VN").format(num) + " ₫";
};
