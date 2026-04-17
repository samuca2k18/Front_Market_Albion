// src/api/items.ts
import { api, parseApiError } from './client';
import type { Item, ItemPayload } from './types';

export async function listItems(): Promise<Item[]> {
  try {
    const { data } = await api.get<Item[]>('/items/');
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

function normalizeItemLang(lang?: string): 'pt_br' | 'en_us' {
  const langNorm = (lang ?? '').toLowerCase();
  return langNorm.startsWith('en') ? 'en_us' : 'pt_br';
}

export async function createItem(payload: ItemPayload, lang?: string): Promise<Item> {
  try {
    const browserLanguage =
      typeof navigator !== 'undefined' ? navigator.language : 'pt-BR';
    const savedLanguage =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('app_language')
        : null;
    const language =
      lang ??
      savedLanguage ??
      browserLanguage;

    const { data } = await api.post<Item>('/items/', payload, {
      params: { lang: normalizeItemLang(language) },
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export async function deleteItem(id: number): Promise<void> {
  try {
    await api.delete(`/items/${id}`);
  } catch (error) {
    throw parseApiError(error);
  }
}

export async function reorderItems(items: { id: number; sort_order: number }[]): Promise<void> {
  try {
    await api.put('/items/reorder', items);
  } catch (error) {
    throw parseApiError(error);
  }
}
