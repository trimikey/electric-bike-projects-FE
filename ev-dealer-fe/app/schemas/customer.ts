import { z } from "zod";


export const customerCreateSchema = z.object({
full_name: z.string().min(2, "Tên quá ngắn"),
email: z.string().email("Email không hợp lệ"),
phone: z.string().optional().or(z.literal("")),
address: z.string().optional().or(z.literal("")),
dob: z.string().optional().or(z.literal("")), // yyyy-MM-dd
password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});


export const customerUpdateSchema = customerCreateSchema
.omit({ password: true, email: true })
.extend({ email: z.string().email().optional() }); // server có thể bỏ qua


export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>