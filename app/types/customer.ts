export interface Customer {
id: string;
full_name: string;
email: string;
phone?: string | null;
address?: string | null;
dob?: string | null; // ISO date string
}
