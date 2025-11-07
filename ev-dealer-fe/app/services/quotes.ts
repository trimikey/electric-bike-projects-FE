import api from "@/lib/api";
import type { Quote, QuotePayload } from "@/app/schemas/quote";

export async function fetchQuotes() {
  const { data } = await api.get<Quote[]>("/quotes");
  return data;
}

export async function createQuoteService(payload: QuotePayload) {
  const { data } = await api.post<Quote>("/quotes", payload);
  return data;
}

export async function updateQuoteService(id: string, payload: QuotePayload) {
  const { data } = await api.put<Quote>(`/quotes/${id}`, payload);
  return data;
}

export async function deleteQuoteService(id: string) {
  await api.delete(`/quotes/${id}`);
}

export async function createOrderFromQuoteService(quoteId: string) {
  const { data } = await api.post(`/orders/from-quote`, { quote_id: quoteId });
  return data as { id: string } & any;
}