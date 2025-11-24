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

// NOVO: Função de delete com o mesmo padrão lindo que você usa
export async function deleteItem(id: number): Promise<void> {
  try {
    await api.delete(`/items/${id}`);
    // Não precisa retornar nada, só sucesso
  } catch (error) {
    throw parseApiError(error);
  }
}