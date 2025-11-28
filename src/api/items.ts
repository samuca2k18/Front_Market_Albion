// src/api/items.ts
import { api, parseApiError } from './client';
import type { Item, ItemPayload } from './types';

export async function listItems(): Promise<Item[]> {
  try {
    const { data } = await api.get<Item[]>('/items');
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export async function createItem(payload: ItemPayload): Promise<Item> {
  try {
    const { data } = await api.post<Item>('/items', payload);
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
