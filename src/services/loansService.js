import { apiFetch } from "./apiFetch";

export function createBookLoan(payload) {
  return apiFetch("/loans/books", {
    method: "POST",
    body: payload,
  });
}

export async function getMyLoans() {
  const data = await apiFetch("/loans/books", { method: "GET" });
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.loans)) return data.loans;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}