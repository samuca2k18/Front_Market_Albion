// src/api/albion.ts
import { api, parseApiError } from './client';
import type {
  AlbionPricesResponse,
  AlbionPriceByNameResponse,
  AlbionSearchItem,
  MyItemPrice,
} from './types';

function resolveSearchPath(language?: string): string {
  const lang = (language || '').toLowerCase();
  if (lang.startsWith('en')) return '/albion/search/en-us';
  if (lang.startsWith('pt')) return '/albion/search/pt-br';
  return '/albion/search/pt-br';
}

// Busca de itens por nome (/albion/search/{lang})
export async function searchItems(
  query: string,
  language?: 'pt-BR' | 'en-US',
): Promise<AlbionSearchItem[]> {
  try {
    const searchPath = resolveSearchPath(language);
    const { data } = await api.get<AlbionSearchItem[]>(searchPath, {
      params: { q: query },
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

// Preços para múltiplos itens (/albion/prices)
export async function fetchAlbionPrices(
  items: string[],
  cities?: string[],
  qualities?: number[],
): Promise<AlbionPricesResponse> {
  try {
    const params = {
      items: items.join(','),
      cities: cities?.join(','),
      qualities: qualities?.join(','),
    };

    const { data } = await api.get<AlbionPricesResponse>('/albion/prices', {
      params,
    });

    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

// Preço para um item por nome amigável (/albion/price-by-name)
export async function fetchAlbionPriceByName(
  name: string,
): Promise<AlbionPriceByNameResponse> {
  try {
    const { data } = await api.get<AlbionPriceByNameResponse>(
      '/albion/price-by-name',
      { params: { name } },
    );
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

// Preços apenas dos itens do usuário (/albion/my-items-prices)
export async function fetchMyItemsPrices(): Promise<MyItemPrice[]> {
  try {
    const { data } = await api.get<MyItemPrice[]>('/albion/my-items-prices');
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

// ======================
// Histórico de preços (/albion/history/{item_id})
// ======================

export interface AlbionPriceHistoryPoint {
  timestamp: number;   // vem em ms
  date: string;        // ISO string
  city: string;
  avg_price: number;
  item_count: number;
  min_price: number;
  max_price: number;
}

export interface AlbionHistoryResponse {
  item: string;
  cities: string[];
  resolution: string;
  days: number;
  data: AlbionPriceHistoryPoint[];
}

export async function fetchAlbionHistory(
  itemId: string,
  days: number = 7,
  cities: string[] = ['Caerleon'],
  resolution: '1h' | '6h' | '24h' = '6h',
): Promise<AlbionHistoryResponse> {
  try {
    const params = {
      days,
      cities: cities.join(','),
      resolution,
    };

    const { data } = await api.get<AlbionHistoryResponse>(
      `/albion/history/${itemId}`,
      { params },
    );

    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

/**
 * NOVO: endpoints usados pela PricesPage
 * Ajuste as rotas ('/albion/unique-items' e '/albion/cities')
 * se no seu backend o path for diferente.
 */

// Lista de itens únicos disponíveis para consulta
export async function getUniqueItems(): Promise<any[]> {
  try {
    const { data } = await api.get<any[]>('/albion/unique-items');
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

// Lista de cidades disponíveis
export async function getCities(): Promise<string[]> {
  try {
    const { data } = await api.get<string[]>('/albion/cities');
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

// Objeto usado na PricesPage
export const albionAPI = {
  getUniqueItems,
  getCities,
};
