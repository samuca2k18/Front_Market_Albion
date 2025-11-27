// src/api/albion.ts
import { api, parseApiError } from './client';
import type {
  AlbionPricesResponse,
  AlbionPriceByNameResponse,
  AlbionSearchItem,
  MyItemPrice,
} from './types';

// Busca de itens por nome (/albion/search)
export async function searchItems(query: string): Promise<AlbionSearchItem[]> {
  try {
    const { data } = await api.get<AlbionSearchItem[]>('/albion/search', {
      params: { q: query },
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

// Preços para múltiplos itens (/albion/prices)
// Exemplo de uso:
// fetchAlbionPrices(['T4_BAG', 'T5_CAPE'], ['Caerleon'], [1, 2, 3, 4, 5])
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
