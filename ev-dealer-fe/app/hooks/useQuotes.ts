"use client";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/swr";
import type { Quote, QuotePayload } from "@/app/schemas/quote";
import { createOrderFromQuoteService, createQuoteService, deleteQuoteService, fetchQuotes, updateQuoteService } from "@/app/services/quotes";

export function useQuotes() {
  const { data, isLoading, error } = useSWR<Quote[]>("/quotes", fetcher, { revalidateOnFocus: false });

  const createQuote = async (payload: QuotePayload) => {
    const created = await createQuoteService(payload);
    mutate("/quotes", async () => fetchQuotes(), { revalidate: true });
    return created;
  };

  const updateQuote = async (id: string, payload: QuotePayload) => {
    const updated = await updateQuoteService(id, payload);
    mutate("/quotes", async () => fetchQuotes(), { revalidate: true });
    return updated;
  };

  const removeQuote = async (id: string) => {
    await deleteQuoteService(id);
    mutate("/quotes", async () => fetchQuotes(), { revalidate: true });
  };

  const createOrderFromQuote = async (quoteId: string) => {
    const order = await createOrderFromQuoteService(quoteId);
    return order;
  };

  return {
    quotes: data ?? [],
    isLoading,
    error,
    createQuote,
    updateQuote,
    removeQuote,
    createOrderFromQuote,
  };
}
