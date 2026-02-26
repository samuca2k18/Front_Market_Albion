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
  region?: string,
): Promise<AlbionPricesResponse> {
  try {
    const params: Record<string, string | undefined> = {
      items: items.join(','),
      cities: cities?.join(','),
      qualities: qualities?.join(','),
      region: region ?? 'europe',
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
  region?: string,
): Promise<AlbionPriceByNameResponse> {
  try {
    const { data } = await api.get<AlbionPriceByNameResponse>(
      '/albion/price-by-name',
      { params: { name, region: region ?? 'europe' } },
    );
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

// Preços apenas dos itens do usuário (/albion/my-items-prices)
export async function fetchMyItemsPrices(region?: string): Promise<MyItemPrice[]> {
  try {
    const { data } = await api.get<MyItemPrice[]>('/albion/my-items-prices', {
      params: { region: region ?? 'europe' },
    });
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
  region?: string,
): Promise<AlbionHistoryResponse> {
  try {
    const params = {
      days,
      cities: cities.join(','),
      resolution,
      region: region ?? 'europe',
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

export interface AlbionRegion {
  id: string;
  label: string;
  flag: string;
  host: string;
}

// Lista de regiões do backend (/albion/regions) — sem autenticação
export async function getRegions(): Promise<AlbionRegion[]> {
  try {
    const { data } = await api.get<AlbionRegion[]>('/albion/regions');
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

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
  getRegions,
};
