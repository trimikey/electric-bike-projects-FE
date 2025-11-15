import { useCallback } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/swr";
import { Customer } from "../types/customer";
import { createCustomer, deleteCustomer, updateCustomer } from "../services/customers";


const KEY = "/customers";


export function useCustomers() {
    const { data, error, isLoading, mutate } = useSWR<Customer[]>(KEY, fetcher);


    const add = useCallback(async (input: any) => {
        await mutate(async (current) => {
            const newItem = await createCustomer(input);
            return current ? [newItem, ...current] : [newItem];
        }, { revalidate: false });
        await mutate();
    }, [mutate]);


    const update = useCallback(async (id: string, input: any) => {
        await mutate(async (current) => {
            const updated = await updateCustomer(id, input);
            return (current || []).map((c) => (c.id === id ? updated : c));
        }, { revalidate: false });
        await mutate();
    }, [mutate]);


    const remove = useCallback(async (id: string) => {
        await mutate(async (current) => {
            await deleteCustomer(id);
            return (current || []).filter((c) => c.id !== id);
        }, { revalidate: false });
        await mutate();
    }, [mutate]);


    return {
        customers: data ?? [],
        isLoading,
        isError: !!error,
        add,
        update,
        remove,
        mutate,
    };
}