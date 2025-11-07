export type Complaint = {
  id: string;
  customer_id: string;
  dealer_id?: string | null;
  description: string;
  status: "pending" | "in_progress" | "resolved" | "rejected";
  resolved_at?: string | null;
  created_at?: string;
  updated_at?: string;

  customer?: { id: string; full_name: string; email: string; phone?: string };
  dealer?: { id: string; name: string; email: string; phone?: string };
};
