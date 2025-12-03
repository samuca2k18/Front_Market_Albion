// src/api/productService.ts
import axios from "axios";

export interface Product {
  unique_name: string;
  name_pt: string;
  name_en: string;
  matched: string;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export async function searchProducts(query: string): Promise<Product[]> {
  const { data } = await api.get<Product[]>("/albion/search", {
    params: { q: query },
  });
  return data;
}
