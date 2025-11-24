import { api, buildQuery, parseApiError } from './client';
import type { AlbionPriceResponse, MyItemPrice, PriceFilters } from './types';

export async function fetchAlbionPrice(filters: PriceFilters): Promise<AlbionPriceResponse> {
  try {
    const query = buildQuery({
      item_name: filters.item_name,
      quality: filters.quality,
      enchantment: filters.enchantment,
      cities: filters.cities,
    });

    const { data } = await api.get<AlbionPriceResponse>(`/albion/price?${query}`);
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export async function fetchMyItemsPrices(): Promise<MyItemPrice[]> {
  try {
    const { data } = await api.get<MyItemPrice[]>('/albion/my-items-prices');
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

