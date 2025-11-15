import apiClient from "@/lib/api";
import { Customer } from "../types/customer";
import { CustomerCreateInput, CustomerUpdateInput } from "../schemas/customer";



export const listCustomers = async (): Promise<Customer[]> => {
const { data } = await apiClient.get("/customers");
return data;
};


export const createCustomer = async (payload: CustomerCreateInput) => {
const { data } = await apiClient.post("/customers", payload);
return data as Customer;
};


export const updateCustomer = async (
id: string,
payload: CustomerUpdateInput
) => {
const { data } = await apiClient.put(`/customers/${id}`, payload);
return data as Customer;
};


export const deleteCustomer = async (id: string) => {
await apiClient.delete(`/customers/${id}`);
};