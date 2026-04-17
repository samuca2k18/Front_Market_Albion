// src/api/openalbion.ts
import { api, parseApiError } from './client';

// ── Types ─────────────────────────────────────────────────────────────────

export interface OpenAlbionItem {
  id: number;
  name: string;
  tier: string;
  item_power: number;
  icon: string;
  identifier?: string;
  unique_name?: string;
}

export interface OpenAlbionSubcategory {
  id: number;
  name: string;
  type: string;
}

export interface OpenAlbionCategory {
  id: number;
  name: string;
  type: string;
  subcategories: OpenAlbionSubcategory[];
}

export interface OpenAlbionCategoriesResponse {
  data: OpenAlbionCategory[];
}

export interface OpenAlbionItemsResponse {
  data: OpenAlbionItem[];
}

export interface OpenAlbionItemQueryParams {
  category_id?: number;
  subcategory_id?: number;
  tier?: number;
}

// ── API Functions ─────────────────────────────────────────────────────────

export async function fetchCategories(
  type?: 'weapon' | 'armor' | 'accessory' | 'consumable',
): Promise<OpenAlbionCategoriesResponse> {
  try {
    const params: Record<string, string> = {};
    if (type) params.type = type;
    const { data } = await api.get<OpenAlbionCategoriesResponse>(
      '/openalbion/categories',
      { params },
    );
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export async function fetchWeapons(params?: {
  category_id?: number;
  subcategory_id?: number;
  tier?: number;
}): Promise<OpenAlbionItemsResponse> {
  try {
    const { data } = await api.get<OpenAlbionItemsResponse>(
      '/openalbion/weapons',
      { params },
    );
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export async function fetchArmors(params?: {
  category_id?: number;
  subcategory_id?: number;
  tier?: number;
}): Promise<OpenAlbionItemsResponse> {
  try {
    const { data } = await api.get<OpenAlbionItemsResponse>(
      '/openalbion/armors',
      { params },
    );
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export async function fetchAccessories(params?: {
  category_id?: number;
  subcategory_id?: number;
  tier?: number;
}): Promise<OpenAlbionItemsResponse> {
  try {
    const { data } = await api.get<OpenAlbionItemsResponse>(
      '/openalbion/accessories',
      { params },
    );
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export async function fetchConsumables(params?: {
  category_id?: number;
  subcategory_id?: number;
  tier?: number;
}): Promise<OpenAlbionItemsResponse> {
  try {
    const { data } = await api.get<OpenAlbionItemsResponse>(
      '/openalbion/consumables',
      { params },
    );
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable';

type ItemFetcher = (
  params?: OpenAlbionItemQueryParams,
) => Promise<OpenAlbionItemsResponse>;

const FETCH_MAP: Record<ItemType, ItemFetcher> = {
  weapon: fetchWeapons,
  armor: fetchArmors,
  accessory: fetchAccessories,
  consumable: fetchConsumables,
};

export async function fetchItemsByType(
  type: ItemType,
  params?: OpenAlbionItemQueryParams,
): Promise<OpenAlbionItemsResponse> {
  return FETCH_MAP[type](params);
}

function looksLikeUniqueName(raw: string | undefined): boolean {
  if (!raw) return false;
  return /^T\d+_[A-Z0-9_]+(?:@\d+)?$/i.test(raw.trim());
}

export function getOpenAlbionUniqueName(item: OpenAlbionItem): string {
  const candidates = [item.unique_name, item.identifier, item.name];
  const match = candidates.find((value) => looksLikeUniqueName(value));
  if (match) return match.toUpperCase();
  return "";
}

export interface ConsumableCraftingRecipe {
  id: number;
  yield_amount: number;
  item_id: number;
  category_id: number;
  materials: {
    id: number;
    amount: number;
    item_id: number;
    resource: string;
  }[];
}

export async function fetchConsumableCraftings(
  consumable_id: number,
): Promise<{ data: ConsumableCraftingRecipe[] }> {
  try {
    const { data } = await api.get<{ data: ConsumableCraftingRecipe[] }>(
      '/openalbion/consumable-craftings',
      { params: { consumable_id } },
    );
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export interface OpenAlbionItemDetailResponse {
  type: ItemType;
  id: number;
  item?: OpenAlbionItem;
  stats?: {
    data?: Record<string, unknown>[];
  } | Record<string, unknown>;
  spells?: {
    data?: Array<{
      slot?: string;
      spells?: Array<{
        id?: number;
        name?: string;
      }>;
    }>;
  } | Record<string, unknown>;
}

export async function fetchItemDetail(
  itemType: ItemType,
  itemId: number,
): Promise<OpenAlbionItemDetailResponse> {
  try {
    const { data } = await api.get<OpenAlbionItemDetailResponse>(
      `/openalbion/item-detail/${itemType}/${itemId}`,
    );
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}
