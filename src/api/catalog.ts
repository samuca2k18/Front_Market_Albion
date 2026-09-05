// src/api/catalog.ts — local backend catalog (no OpenAlbion HTTP)
import { api, parseApiError } from './client';

// ── Types (kept OpenAlbion* names for thin migration / existing imports) ──

export interface OpenAlbionItem {
  id: number;
  name: string;
  tier: string;
  item_power: number;
  icon: string;
  identifier?: string;
  unique_name?: string;
}

export type CatalogItem = OpenAlbionItem;

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
  q?: string;
  lang?: 'pt_br' | 'en_us';
  limit?: number;
  offset?: number;
  /** Default false on backend — omit unless browsing vanity/tools. */
  include_vanity?: boolean;
}

export type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable';

// ── API Functions ─────────────────────────────────────────────────────────

export async function fetchCategories(
  type?: ItemType,
  opts?: { lang?: 'pt_br' | 'en_us'; include_vanity?: boolean },
): Promise<OpenAlbionCategoriesResponse> {
  try {
    const params: Record<string, string | boolean> = {};
    if (type) params.type = type;
    if (opts?.lang) params.lang = opts.lang;
    if (opts?.include_vanity != null) params.include_vanity = opts.include_vanity;
    const { data } = await api.get<OpenAlbionCategoriesResponse>(
      '/catalog/categories',
      { params },
    );
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

async function fetchItems(
  type: ItemType,
  params?: OpenAlbionItemQueryParams,
): Promise<OpenAlbionItemsResponse> {
  try {
    const { data } = await api.get<OpenAlbionItemsResponse>('/catalog/items', {
      params: { type, ...params },
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export async function fetchWeapons(
  params?: OpenAlbionItemQueryParams,
): Promise<OpenAlbionItemsResponse> {
  return fetchItems('weapon', params);
}

export async function fetchArmors(
  params?: OpenAlbionItemQueryParams,
): Promise<OpenAlbionItemsResponse> {
  return fetchItems('armor', params);
}

export async function fetchAccessories(
  params?: OpenAlbionItemQueryParams,
): Promise<OpenAlbionItemsResponse> {
  return fetchItems('accessory', params);
}

export async function fetchConsumables(
  params?: OpenAlbionItemQueryParams,
): Promise<OpenAlbionItemsResponse> {
  return fetchItems('consumable', params);
}

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
  return '';
}

/** Alias — catalog always sends unique_name. */
export const getCatalogUniqueName = getOpenAlbionUniqueName;

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
      '/catalog/consumable-craftings',
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
      `/catalog/item-detail/${itemType}/${itemId}`,
    );
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}
