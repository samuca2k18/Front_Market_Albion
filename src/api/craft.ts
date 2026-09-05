import { api, parseApiError } from './client';

export interface CraftMaterial {
  unique_name: string;
  count: number;
  name_pt?: string;
  name_en?: string;
  unit_price?: number | null;
  total_cost?: number | null;
  price_date?: string | null;
}

export interface CraftRecipe {
  unique_name: string;
  enchant: number;
  focus_cost: number | null;
  silver: number;
  time?: number;
  materials: CraftMaterial[];
  name_pt: string;
  name_en: string;
  tier?: number;
  family?: string;
  bonus_city?: string;
  source?: string;
}

export interface CraftProfitResponse {
  item: string;
  name_pt: string;
  name_en: string;
  enchant: number;
  tier?: number | null;
  family?: string | null;
  region: string;
  city_buy: string;
  city_sell: string;
  is_black_market: boolean;
  focus_return_pct: number;
  city_bonus_pct?: number;
  resource_return_pct?: number;
  journal_bonus_pct: number;
  market_tax_pct: number;
  tax_note: string | null;
  crafting_fee: number;
  quality: number | null;
  focus_cost: number | null;
  recipe_silver: number;
  bonus_city?: string | null;
  materials: CraftMaterial[];
  raw_material_cost: number | null;
  effective_cost: number | null;
  sell_price: number | null;
  sell_price_date: string | null;
  sell_price_kind: string;
  net_revenue: number | null;
  profit: number | null;
  roi: number | null;
  silver_per_focus: number | null;
  data_age_hours: number | null;
  missing_prices: boolean;
}

export interface CraftTopItem {
  item: string;
  name_pt: string;
  name_en: string;
  enchant: number;
  tier?: number | null;
  family?: string | null;
  focus_cost: number | null;
  raw_material_cost: number;
  effective_cost: number;
  sell_price: number;
  net_revenue: number;
  profit: number;
  roi: number;
  silver_per_focus: number | null;
  data_age_hours: number | null;
  bonus_city?: string | null;
}

export interface CraftTopResponse {
  region: string;
  city_buy: string;
  city_sell: string;
  is_black_market: boolean;
  market_tax_pct: number;
  scanned: number;
  with_recipe: number;
  sort_by: string;
  items: CraftTopItem[];
  focus_return_pct?: number;
  city_bonus_pct?: number;
  resource_return_pct?: number;
  family?: string | null;
}

export async function fetchCraftRecipe(uniqueName: string): Promise<CraftRecipe> {
  try {
    const { data } = await api.get<CraftRecipe>(
      `/craft/recipe/${encodeURIComponent(uniqueName)}`,
    );
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export async function fetchCraftProfit(params: {
  item: string;
  city_buy: string;
  city_sell: string;
  region?: string;
  focus_return_pct?: number;
  journal_bonus_pct?: number;
  market_tax_pct?: number;
  crafting_fee?: number;
  quality?: number;
}): Promise<CraftProfitResponse> {
  try {
    const { data } = await api.get<CraftProfitResponse>('/craft/profit', {
      params: {
        item: params.item,
        city_buy: params.city_buy,
        city_sell: params.city_sell,
        region: params.region ?? 'west',
        focus_return_pct: params.focus_return_pct ?? 0,
        journal_bonus_pct: params.journal_bonus_pct ?? 0,
        market_tax_pct: params.market_tax_pct,
        crafting_fee: params.crafting_fee ?? 0,
        quality: params.quality,
      },
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export async function fetchCraftTop(params: {
  city_buy: string;
  city_sell: string;
  region?: string;
  focus_return_pct?: number;
  journal_bonus_pct?: number;
  market_tax_pct?: number;
  crafting_fee?: number;
  limit?: number;
  scan_limit?: number;
  sort_by?: 'profit' | 'roi' | 'silver_per_focus';
}): Promise<CraftTopResponse> {
  try {
    const { data } = await api.get<CraftTopResponse>('/craft/top', {
      params: {
        city_buy: params.city_buy,
        city_sell: params.city_sell,
        region: params.region ?? 'west',
        focus_return_pct: params.focus_return_pct ?? 0,
        journal_bonus_pct: params.journal_bonus_pct ?? 0,
        market_tax_pct: params.market_tax_pct,
        crafting_fee: params.crafting_fee ?? 0,
        limit: params.limit ?? 20,
        scan_limit: params.scan_limit ?? 200,
        sort_by: params.sort_by ?? 'profit',
      },
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export async function fetchRefineProfit(params: {
  item: string;
  city_buy: string;
  city_sell: string;
  region?: string;
  focus_return_pct?: number;
  city_bonus_pct?: number;
  market_tax_pct?: number;
  crafting_fee?: number;
}): Promise<CraftProfitResponse> {
  try {
    const { data } = await api.get<CraftProfitResponse>('/craft/refine/profit', {
      params: {
        item: params.item,
        city_buy: params.city_buy,
        city_sell: params.city_sell,
        region: params.region ?? 'west',
        focus_return_pct: params.focus_return_pct ?? 0,
        city_bonus_pct: params.city_bonus_pct ?? 0,
        market_tax_pct: params.market_tax_pct,
        crafting_fee: params.crafting_fee ?? 0,
      },
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export async function fetchRefineTop(params: {
  city_buy: string;
  city_sell: string;
  region?: string;
  focus_return_pct?: number;
  city_bonus_pct?: number;
  market_tax_pct?: number;
  crafting_fee?: number;
  family?: string;
  limit?: number;
  sort_by?: 'profit' | 'roi' | 'silver_per_focus';
}): Promise<CraftTopResponse> {
  try {
    const { data } = await api.get<CraftTopResponse>('/craft/refine/top', {
      params: {
        city_buy: params.city_buy,
        city_sell: params.city_sell,
        region: params.region ?? 'west',
        focus_return_pct: params.focus_return_pct ?? 0,
        city_bonus_pct: params.city_bonus_pct ?? 0,
        market_tax_pct: params.market_tax_pct,
        crafting_fee: params.crafting_fee ?? 0,
        family: params.family || undefined,
        limit: params.limit ?? 20,
        sort_by: params.sort_by ?? 'profit',
      },
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}
