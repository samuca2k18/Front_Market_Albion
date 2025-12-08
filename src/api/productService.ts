// src/api/productService.ts
import axios from "axios";

export interface Product {
  unique_name: string;
  name_pt: string;
  name_en: string;
  matched?: string;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

/**
 * Normaliza os dados do produto retornados pela API
 * Garante que os campos estejam consistentes e bem formatados
 */
function normalizeProduct(rawProduct: any): Product {
  // Extrai o nome único (pode vir em diferentes formatos)
  const unique_name = 
    rawProduct.unique_name || 
    rawProduct.UniqueName || 
    rawProduct.internal_name ||
    rawProduct.id ||
    "";

  // Extrai nome em português (pode vir em diferentes campos)
  const name_pt = 
    rawProduct.name_pt || 
    rawProduct["PT-BR"] ||
    rawProduct.name ||
    rawProduct.title ||
    "";

  // Extrai nome em inglês (pode vir em diferentes campos)
  const name_en = 
    rawProduct.name_en || 
    rawProduct["EN-US"] ||
    rawProduct.english_name ||
    "";

  // Se não tiver nome em português, usa o inglês como fallback
  const finalNamePt = name_pt || name_en || unique_name;
  
  // Se não tiver nome em inglês, usa o português como fallback
  const finalNameEn = name_en || name_pt || unique_name;

  return {
    unique_name: unique_name.toUpperCase().trim(),
    name_pt: finalNamePt.trim(),
    name_en: finalNameEn.trim(),
    matched: rawProduct.matched || "",
  };
}

/**
 * Busca produtos pela query
 * Normaliza todos os resultados antes de retornar
 */
export async function searchProducts(query: string): Promise<Product[]> {
  try {
    const { data } = await api.get("/albion/search", {
      params: { q: query },
    });

    // Garante que é um array
    if (!Array.isArray(data)) {
      console.warn("API retornou dados não-array:", data);
      return [];
    }

    // Normaliza cada produto
    return data.map((rawProduct) => normalizeProduct(rawProduct));
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    throw error;
  }
}