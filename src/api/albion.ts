// src/api/albion.ts
import { api, parseApiError } from './client';
import type {
  AlbionPricesResponse,
  AlbionPriceByNameResponse,
  AlbionSearchItem,
  MyItemPrice,
  MetaBuildsResponse,
  GuildSummaryResponse,
  GuildEconomyResponse,
  GuildSearchResult,
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
  fetchGoldPrices,
};

export interface GoldPricePoint {
  price: number;
  timestamp: string;
}

export interface GoldPriceResponse {
  current: GoldPricePoint | null;
  previous: GoldPricePoint | null;
  variation: number;
  all: GoldPricePoint[];
  region: string;
}

export async function fetchGoldPrices(region?: string): Promise<GoldPriceResponse> {
  try {
    const { data } = await api.get<GoldPriceResponse>('/albion/gold', {
      params: { region: region ?? 'europe', count: 200 },
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}
export interface ArbitrageOpportunity {
  item_id: string;
  quality: number;
  buy_from: string;
  buy_price: number;
  sell_at: string;
  sell_price: number;
  profit: number;
  roi: number;
  buy_date: string;
  sell_date: string;
}

export interface ArbitrageRouteOpportunity {
  item_id: string;
  quality: number;
  buy_from: string;
  buy_price: number;
  sell_at: string;
  sell_price: number;
  unit_profit: number;
  unit_roi: number;
  item_weight: number;
  weight_source: 'gameinfo' | 'heuristic' | 'default';
  max_units_by_capacity: number;
  total_weight: number;
  trip_profit: number;
  investment_required: number;
  profit_per_kg?: number;
  buy_date: string;
  sell_date: string;
}

export interface ArbitrageRouteResponse {
  region: string;
  origin: string;
  destination: string;
  mount_capacity: number;
  default_weight: number;
  budget_cap?: number;
  tax: number;
  setup_fee: number;
  item_count_considered: number;
  weight_sources: {
    gameinfo: number;
    heuristic: number;
    default: number;
  };
  opportunities: ArbitrageRouteOpportunity[];
}

export async function fetchArbitrageOpportunities(
  region?: string,
  tax: number = 0.08,
  items?: string[],
): Promise<ArbitrageOpportunity[]> {
  try {
    const params: any = {
      region: region ?? 'europe',
      tax,
    };
    if (items && items.length > 0) {
      params.items = items;
    }

    const { data } = await api.get<ArbitrageOpportunity[]>('/albion/arbitrage', {
      params,
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

// === Bandit Event ===
export interface BanditEventStatus {
  status: 'active' | 'soon' | 'waiting';
  phase: number;
  next_event_utc: string;
  minutes_remaining: number;
  cycle_minutes: number;
  event_duration_minutes: number;
}

export async function fetchBanditEvent(): Promise<BanditEventStatus> {
  const { data } = await api.get<BanditEventStatus>('/albion/bandit-event');
  return data;
}

// === Killboard ===
export interface KillboardPlayer {
  id?: string;
  name: string;
  guild_id?: string;
  guild: string;
  alliance_id?: string;
  alliance: string;
  ip: number;
  weapon: string | null;
  death_fame?: number;
}

export interface KillEvent {
  event_id: number;
  timestamp: string;
  kill_area: string;
  total_fame: number;
  participants: number;
  killer: KillboardPlayer;
  victim: KillboardPlayer;
}

export async function fetchKillboard(limit = 20, region?: string): Promise<KillEvent[]> {
  const { data } = await api.get<KillEvent[]>('/albion/killboard', {
    params: { limit, region: region ?? 'west' },
  });
  return data;
}

export interface PlayerSearchResult {
  id: string;
  name: string;
  guild_name?: string;
  alliance_name?: string;
}

export interface MetaMarketRow {
  item_id: string;
  meta_frequency: number;
  buy_city: string;
  sell_city: string;
  buy_price: number;
  sell_price: number;
  spread: number;
  spread_pct: number;
  meta_market_score: number;
}

export interface MetaMarketResponse {
  region: string;
  cities: string[];
  kill_events_analyzed: number;
  as_of: string;
  data: MetaMarketRow[];
}

export async function searchPlayers(
  q: string,
  limit: number = 15,
  region?: string,
): Promise<PlayerSearchResult[]> {
  try {
    const { data } = await api.get<PlayerSearchResult[]>('/albion/player/search', {
      params: { q, limit, region: region ?? 'west' },
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export async function fetchArbitrageRouteOpportunities(params: {
  origin: string;
  destination: string;
  region?: string;
  tax?: number;
  setupFee?: number;
  mountCapacity?: number;
  defaultWeight?: number;
  budgetCap?: number;
  maxResults?: number;
  items?: string[];
}): Promise<ArbitrageRouteResponse> {
  try {
    const { data } = await api.get<ArbitrageRouteResponse>('/albion/arbitrage-route', {
      params: {
        origin: params.origin,
        destination: params.destination,
        region: params.region ?? 'west',
        tax: params.tax ?? 0.08,
        setup_fee: params.setupFee ?? 0.01,
        mount_capacity: params.mountCapacity ?? 1200,
        default_weight: params.defaultWeight ?? 1,
        budget_cap: params.budgetCap ?? 0,
        max_results: params.maxResults ?? 100,
        items: params.items,
      },
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export async function fetchPlayerProfile(playerId: string, region?: string): Promise<any> {
  try {
    const { data } = await api.get(`/albion/player/${playerId}`, {
      params: { region: region ?? 'west' },
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export async function fetchPlayerKills(
  playerId: string,
  limit: number = 20,
  offset: number = 0,
  region?: string,
): Promise<KillEvent[]> {
  try {
    const { data } = await api.get<KillEvent[]>(`/albion/player/${playerId}/kills`, {
      params: { limit, offset, region: region ?? 'west' },
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export async function fetchPlayerDeaths(
  playerId: string,
  limit: number = 20,
  offset: number = 0,
  region?: string,
): Promise<KillEvent[]> {
  try {
    const { data } = await api.get<KillEvent[]>(`/albion/player/${playerId}/deaths`, {
      params: { limit, offset, region: region ?? 'west' },
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export async function fetchGuildProfile(guildId: string, region?: string): Promise<any> {
  try {
    const { data } = await api.get(`/albion/guild/${guildId}`, {
      params: { region: region ?? 'west' },
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export async function fetchGuildMembers(guildId: string, region?: string): Promise<any[]> {
  try {
    const { data } = await api.get<any[]>(`/albion/guild/${guildId}/members`, {
      params: { region: region ?? 'west' },
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export async function fetchAllianceProfile(allianceId: string, region?: string): Promise<any> {
  try {
    const { data } = await api.get(`/albion/alliance/${allianceId}`, {
      params: { region: region ?? 'west' },
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export async function fetchMetaMarket(
  region?: string,
  killLimit: number = 40,
  topItems: number = 12,
  cities?: string[],
): Promise<MetaMarketResponse> {
  try {
    const { data } = await api.get<MetaMarketResponse>('/albion/meta-market', {
      params: {
        region: region ?? 'europe',
        kill_limit: killLimit,
        top_items: topItems,
        cities: cities?.join(','),
      },
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

// === Meta Builds ===
export async function fetchMetaBuilds(
  region?: string,
  killLimit: number = 40,
  topBuilds: number = 8,
  minIp: number = 0,
): Promise<MetaBuildsResponse> {
  try {
    const { data } = await api.get<MetaBuildsResponse>('/albion/meta-builds', {
      params: {
        region: region ?? 'europe',
        kill_limit: killLimit,
        top_builds: topBuilds,
        min_ip: minIp || undefined,
      },
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

// === Guild Hub ===
export async function searchGuilds(q: string, limit = 15, region?: string): Promise<GuildSearchResult[]> {
  try {
    const { data } = await api.get<GuildSearchResult[]>('/albion/guild/search', {
      params: { q, limit, region: region ?? 'west' },
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export async function fetchGuildSummary(guildId: string, region?: string): Promise<GuildSummaryResponse> {
  try {
    const { data } = await api.get<GuildSummaryResponse>(`/albion/guild/${guildId}/summary`, {
      params: { region: region ?? 'west' },
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export async function fetchGuildEconomy(
  guildId: string,
  memberLimit = 15,
  region = 'europe',
): Promise<GuildEconomyResponse> {
  try {
    const { data } = await api.get<GuildEconomyResponse>(`/albion/guild/${guildId}/economy`, {
      params: { member_limit: memberLimit, region },
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}


// === Black Market flips ===
export interface BmFlip {
  item_id: string;
  name_pt: string;
  name_en: string;
  buy_city: string;
  buy_price: number;
  buy_date: string;
  buy_age_hours: number | null;
  bm_buy_price: number;
  bm_date: string;
  bm_age_hours: number | null;
  profit: number;
  roi: number;
  tax: number;
  setup_fee: number;
  weight: number;
  weight_source: string;
  profit_per_kg: number;
}

export interface BmFlipsResponse {
  region: string;
  cities: string[];
  min_profit: number;
  max_age_hours: number;
  items_considered: number;
  flips: BmFlip[];
}

export async function fetchBmFlips(params: {
  region?: string;
  cities?: string[];
  minProfit?: number;
  maxAgeHours?: number;
  limit?: number;
  tax?: number;
  items?: string[];
}): Promise<BmFlipsResponse> {
  try {
    const { data } = await api.get<BmFlipsResponse>('/albion/bm-flips', {
      params: {
        region: params.region ?? 'west',
        cities: params.cities?.join(','),
        min_profit: params.minProfit ?? 0,
        max_age_hours: params.maxAgeHours ?? 12,
        limit: params.limit ?? 50,
        tax: params.tax ?? 0,
        items: params.items,
      },
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

// === Multi-city price grid ===
export interface PriceGridCell {
  city: string;
  sell_min: number | null;
  sell_min_date?: string | null;
  buy_max: number | null;
  buy_max_date?: string | null;
  age_hours: number | null;
  quality?: number;
}

export interface PriceGridItem {
  item_id: string;
  name_pt: string;
  name_en: string;
  cities: PriceGridCell[];
  cheapest_sell: number | null;
  best_buy: number | null;
}

export interface PriceGridResponse {
  region: string;
  cities: string[];
  qualities: number[];
  items: PriceGridItem[];
}

export async function fetchPriceGrid(params: {
  items: string[];
  region?: string;
  cities?: string[];
  qualities?: number[];
}): Promise<PriceGridResponse> {
  try {
    const { data } = await api.get<PriceGridResponse>('/albion/price-grid', {
      params: {
        items: params.items.join(','),
        region: params.region ?? 'west',
        cities: params.cities?.join(','),
        qualities: params.qualities?.join(',') ?? '1',
      },
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}
