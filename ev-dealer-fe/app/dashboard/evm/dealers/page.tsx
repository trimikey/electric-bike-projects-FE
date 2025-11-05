"use client";

import useSWR from "swr";
import { useState } from "react";
import { listUsers, createUser, updateUser, deleteUser } from "@/app/services/users";
import type { User, UserCreate, UserUpdate } from "@/app/types/user";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ROLES = ["Admin", "EVM Staff", "Dealer Manager", "Dealer Staff"];

export default function UsersAdminPage() {
    const { data, error, isLoading, mutate } = useSWR("users:list", listUsers);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<User | null>(null);
    const [form, setForm] = useState<UserCreate | UserUpdate>({ username: "", email: "", role_name: "EVM Staff" });
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string>("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const onOpenCreate = () => {
        setEditing(null);
        setForm({ username: "", email: "", password: "", role_name: "EVM Staff" });
        setFieldErrors({});
        setFormError("");
        setOpen(true);
    };

    const onOpenEdit = (u: User) => {
        setEditing(u);
        setForm({ 
            username: u.username, 
            phone: u.phone || "", 
            role_name: u.role_name
        } as UserUpdate);
        setFieldErrors({});
        setFormError("");
        setOpen(true);
    };

    const validateField = (name: string, value: string, isCreate: boolean): string => {
        switch (name) {
            case "username":
                if (!value?.trim()) return "Username là bắt buộc";
                if (value.trim().length < 3) return "Username phải có ít nhất 3 ký tự";
                break;
            case "email":
                if (!value?.trim()) return "Email là bắt buộc";
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value.trim())) return "Email không hợp lệ";
                break;
            case "password":
                if (isCreate && !value?.trim()) return "Mật khẩu là bắt buộc";
                if (isCreate && value.trim().length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
                break;
            case "role_name":
                if (isCreate && !value?.trim()) return "Vui lòng chọn Role";
                break;
        }
        return "";
    };

    const onSubmit = async () => {
        try {
            setSubmitting(true);
            setFormError("");
            setFieldErrors({});

            if (editing) {
                const username = (form as any).username?.trim();
                const phone = (form as any).phone?.trim();

                const errors: Record<string, string> = {};
                const usernameError = validateField("username", username, false);
                if (usernameError) errors.username = usernameError;

                if (Object.keys(errors).length > 0) {
                    setFieldErrors(errors);
                    return;
                }

                const payload: UserUpdate = {
                    username,
                    ...(phone ? { phone } : {}),
                };
                
                await updateUser(editing.id, payload);
            } else {
                const username = (form as any).username?.trim();
                const email = (form as any).email?.trim();
                const password = (form as any).password?.trim();
                const role_name = (form as any).role_name?.trim();
                const phone = (form as any).phone?.trim();

                const errors: Record<string, string> = {};
                const usernameError = validateField("username", username, true);
                if (usernameError) errors.username = usernameError;
                
                const emailError = validateField("email", email, true);
                if (emailError) errors.email = emailError;
                
                const passwordError = validateField("password", password, true);
                if (passwordError) errors.password = passwordError;
                
                const roleError = validateField("role_name", role_name, true);
                if (roleError) errors.role_name = roleError;

                if (Object.keys(errors).length > 0) {
                    setFieldErrors(errors);
                    return;
                }

                const payload: UserCreate = { 
                    username, 
                    email, 
                    password, 
                    role_name,
                    status: "active",
                    ...(phone ? { phone } : {}),
                };
                
                await createUser(payload);
            }

            setOpen(false);
            setFormError("");
            setFieldErrors({});
            await mutate();
        } catch (e: any) {
            const errorObj = e || {};
            const status = errorObj?.status;
            const errorMessage = errorObj?.message || errorObj?.raw?.response?.data?.message || "Lỗi không xác định";
            const errors = errorObj?.raw?.response?.data?.errors || {};
            
            // Nếu có field-specific errors từ backend
            if (Object.keys(errors).length > 0) {
                setFieldErrors(errors);
            } else {
                let errorMsg = "Lỗi không xác định";
                if (status === 401) {
                    errorMsg = "Lỗi xác thực: Vui lòng đăng nhập lại.";
                } else if (status === 403) {
                    errorMsg = "Không có quyền truy cập. Vui lòng kiểm tra role của bạn.";
                } else if (status === 400) {
                    errorMsg = errorMessage || "Dữ liệu không hợp lệ.";
                } else if (status === 404) {
                    errorMsg = "Không tìm thấy người dùng.";
                } else if (status === 500) {
                    errorMsg = errorMessage || "Lỗi server: Vui lòng thử lại sau.";
                } else {
                    errorMsg = errorMessage || `Lỗi: ${status || "Không xác định"}`;
                }
                setFormError(errorMsg);
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) return <div>Đang tải người dùng...</div>;
    if (error) return <div className="text-red-500">Lỗi: {(error as any)?.message || "Không tải được"}</div>;

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Tài khoản đại lý</h2>
                    <p className="text-sm text-gray-500">Quản lý người dùng nội bộ</p>
                </div>
                <Button onClick={onOpenCreate}>Thêm người dùng</Button>
            </div>

            <div className="overflow-hidden rounded-xl border bg-white">
                <table className="min-w-full divide-y">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Username</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Phone</th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Trạng thái</th>
                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {data?.map((u) => {
                            const status = u.status || "active";
                            const statusColors = {
                                active: "bg-green-100 text-green-800",
                                inactive: "bg-yellow-100 text-yellow-800",
                            };
                            const statusLabels = {
                                active: "Hoạt động",
                                inactive: "Tạm khóa",
                            };
                            return (
                                <tr key={u.id} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3 text-sm">{u.username}</td>
                                    <td className="px-4 py-3 text-sm">{u.email}</td>
                                    <td className="px-4 py-3 text-sm">{u.role_name || (u as any)?.role?.name || "-"}</td>
                                    <td className="px-4 py-3 text-sm">{u.phone || "-"}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}`}>
                                            {statusLabels[status as keyof typeof statusLabels] || status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" onClick={() => onOpenEdit(u)}>Sửa</Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {!data?.length && (
                            <tr>
                                <td className="px-4 py-6 text-sm text-gray-500" colSpan={6}>Chưa có người dùng</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? "Cập nhật người dùng" : "Thêm người dùng"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {formError ? (
                            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                                {formError}
                            </div>
                        ) : null}

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Username <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder="Nhập username"
                                value={(form as any).username || ""}
                                onChange={(e) => {
                                    setForm({ ...form, username: e.target.value });
                                    if (fieldErrors.username) {
                                        setFieldErrors({ ...fieldErrors, username: "" });
                                    }
                                }}
                                disabled={submitting}
                                className={fieldErrors.username ? "border-red-500" : ""}
                            />
                            {fieldErrors.username && (
                                <p className="text-xs text-red-500 mt-1">{fieldErrors.username}</p>
                            )}
                        </div>

                        {/* Email */}
                        {editing ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-xs text-gray-500">(chỉ xem, không thể sửa)</span>
                                </label>
                                <Input
                                    value={editing.email || ""}
                                    disabled
                                    className="bg-gray-50 cursor-not-allowed"
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="Nhập email"
                                    type="email"
                                    value={(form as any).email || ""}
                                    onChange={(e) => {
                                        setForm({ ...form, email: e.target.value });
                                        if (fieldErrors.email) {
                                            setFieldErrors({ ...fieldErrors, email: "" });
                                        }
                                    }}
                                    disabled={submitting}
                                    className={fieldErrors.email ? "border-red-500" : ""}
                                />
                                {fieldErrors.email && (
                                    <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
                                )}
                            </div>
                        )}

                        {/* Role */}
                        {editing ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role <span className="text-xs text-gray-500">(chỉ xem, không thể sửa)</span>
                                </label>
                                <Input
                                    value={editing.role_name || (editing as any)?.role?.name || "-"}
                                    disabled
                                    className="bg-gray-50 cursor-not-allowed"
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black ${fieldErrors.role_name ? "border-red-500" : "border-gray-200"}`}
                                    value={(form as any).role_name || ""}
                                    onChange={(e) => {
                                        setForm({ ...form, role_name: e.target.value });
                                        if (fieldErrors.role_name) {
                                            setFieldErrors({ ...fieldErrors, role_name: "" });
                                        }
                                    }}
                                    disabled={submitting}
                                >
                                    <option value="">-- Chọn Role --</option>
                                    {ROLES.map((role) => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                                {fieldErrors.role_name && (
                                    <p className="text-xs text-red-500 mt-1">{fieldErrors.role_name}</p>
                                )}
                            </div>
                        )}

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Số điện thoại <span className="text-xs text-gray-500">(tùy chọn)</span>
                            </label>
                            <Input
                                placeholder="Nhập số điện thoại"
                                value={(form as any).phone || ""}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                disabled={submitting}
                            />
                        </div>

                        {/* Status - chỉ hiển thị khi edit (read-only) */}
                        {editing && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Trạng thái <span className="text-xs text-gray-500">(chỉ xem, không thể sửa)</span>
                                </label>
                                <Input
                                    value={editing.status === "active" ? "Hoạt động" : editing.status === "inactive" ? "Tạm khóa" : editing.status || "Hoạt động"}
                                    disabled
                                    className="bg-gray-50 cursor-not-allowed"
                                />
                            </div>
                        )}

                        {/* Password - chỉ hiển thị khi create */}
                        {!editing && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mật khẩu <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                                    type="password"
                                    value={(form as any).password || ""}
                                    onChange={(e) => {
                                        setForm({ ...(form as any), password: e.target.value });
                                        if (fieldErrors.password) {
                                            setFieldErrors({ ...fieldErrors, password: "" });
                                        }
                                    }}
                                    disabled={submitting}
                                    className={fieldErrors.password ? "border-red-500" : ""}
                                />
                                {fieldErrors.password && (
                                    <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
                        <Button onClick={onSubmit} disabled={submitting}>{submitting ? "Đang lưu..." : (editing ? "Lưu" : "Tạo")}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    );
}

