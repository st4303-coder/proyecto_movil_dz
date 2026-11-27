import { apiFetch } from "./apiFetch";

export async function getBooks({ search = "", categoria = "" } = {}) {
  const params = new URLSearchParams();
  if (search.trim()) params.append("search", search.trim());
  if (categoria && categoria !== "TODAS" && categoria !== "Todas") {
    params.append("categoria", categoria);
  }

  const query = params.toString() ? `?${params.toString()}` : "";
  const data = await apiFetch(`/books${query}`, { method: "GET" });

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.books)) return data.books;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}