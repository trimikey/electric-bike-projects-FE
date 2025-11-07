import api from "@/lib/api";
import { Complaint, } from "@/app/types/complaint";
import { ComplaintPayload } from "@/app/schemas/complaint";

export async function fetchComplaints(query?: Record<string, any>) {
  const res = await api.get("/complaints", { params: query });
  // BE trả { data, meta } hoặc mảng — handle cả 2
  return Array.isArray(res.data) ? res.data as Complaint[] : (res.data.data as Complaint[]);
}

export async function createComplaint(payload: ComplaintPayload) {
  const res = await api.post("/complaints", payload);
  return res.data as Complaint;
}

export async function updateComplaint(id: string, payload: Partial<ComplaintPayload>) {
  const res = await api.put(`/complaints/${id}`, payload);
  return res.data as Complaint;
}

export async function deleteComplaint(id: string) {
  await api.delete(`/complaints/${id}`);
}

export async function resolveComplaint(id: string, status: "resolved" | "rejected" = "resolved") {
  const res = await api.post(`/complaints/resolve`, { id, status });
  return res.data as Complaint;
}
