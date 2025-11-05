export interface User {
    id: string;
    username: string;
    email: string;
    phone?: string;
    role_name: "Admin" | "EVM Staff" | "Dealer Manager" | "Dealer Staff" | string;
    role?: { name?: string } | null;
    status?: "active" | "inactive" | "deleted" | string;
    created_at?: string;
}

export type UserCreate = {
    username: string;
    email: string;
    password: string;
    role_name: string;
    phone?: string;
    status?: "active" | "inactive";
};

export type UserUpdate = Partial<Pick<User, "username" | "phone">>;

