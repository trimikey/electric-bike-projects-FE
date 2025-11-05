import apiClient from "@/lib/api";
import type { User, UserCreate, UserUpdate } from "@/app/types/user";

export async function listUsers() {
  const { data } = await apiClient.get<User[]>("/users");
  return data;
}

export async function getUser(id: string) {
  const { data } = await apiClient.get<User>(`/users/${id}`);
  return data;
}

export async function createUser(payload: UserCreate) {
  try {
    console.log("📤 POST /users - Payload:", JSON.stringify(payload, null, 2));
    const { data } = await apiClient.post<User>("/users", payload);
    console.log("✅ POST /users - Success:", data);
    return data;
  } catch (error: any) {
    console.error("❌ POST /users - Error:", error);
    console.error("❌ POST /users - Error response:", error?.response?.data);
    throw error;
  }
}

export async function updateUser(id: string, payload: UserUpdate) {
  try {
    console.log("📤 PUT /users/" + id + " - Payload:", JSON.stringify(payload, null, 2));
    const { data } = await apiClient.put<User>(`/users/${id}`, payload);
    console.log("✅ PUT /users/" + id + " - Success:", data);
    return data;
  } catch (error: any) {
    console.error("❌ PUT /users/" + id + " - Error:", error);
    console.error("❌ PUT /users/" + id + " - Error status:", error?.status);
    console.error("❌ PUT /users/" + id + " - Error message:", error?.message);
    if (error?.raw) {
      console.error("❌ PUT /users/" + id + " - Raw error data:", error.raw?.response?.data);
    }
    throw error;
  }
}

export async function deleteUser(id: string) {
  try {
    console.log("📤 DELETE /users/" + id);
    await apiClient.delete(`/users/${id}`);
    console.log("✅ DELETE /users/" + id + " - Success");
  } catch (error: any) {
    console.error("❌ DELETE /users/" + id + " - Error:", error);
    throw error;
  }
}

