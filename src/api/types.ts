// src/api/types.ts

// === Auth / User ===
export interface User {
  id: number;
  username: string;
  email: string;
  is_verified: boolean;
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface SignupPayload extends AuthCredentials {
  email: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface VerificationMessage {
  message: string;
}

// === Itens do usuário ===
export interface ItemPayload {
  item_name: string;
  display_name?: string;
}

export interface Item {
  id: number;
  item_name: string;
  display_name?: string;
  created_at?: string;
}

// === Albion API (resposta de /albion/prices) ===
export interface AlbionMarketEntry {
  city: string;
  item_id?: string;
  item_count?: number;
  quality?: number;
  sell_price_min: number;
  sell_price_min_date?: string;
  buy_price_max?: number;
  buy_price_max_date?: string;
  enchantment?: number;
}

// Resumo que o backend devolve em /albion/prices
// { items: { [itemId]: { city, price, quality, enchantment, updated } }, all_data: [...dados brutos] }
export interface AlbionCheapestEntry {
  city: string;
  price: number;
  quality: number;
  enchantment: number;
  updated: string;
}

export interface AlbionPricesResponse {
  items: Record<string, AlbionCheapestEntry>;
  all_data: AlbionMarketEntry[];
}

// === /albion/price-by-name ===
export interface AlbionPriceByNameResponse {
  searched: string;
  item_found: string;
  name_pt: string;
  name_en: string;
  cheapest_city: string;
  price: number;
  quality: number;
  updated_at: string;
  all_prices: AlbionMarketEntry[];
}

// === /albion/search ===
export interface AlbionSearchItem {
  unique_name: string;
  name_pt: string;
  name_en: string;
  matched: string;
}

// === /albion/my-items-prices ===
export interface MyItemPrice {
  item_name: string;
  display_name?: string;
  city: string;
  price: number;
  quality: number;
  enchantment: number;
}

// === Alertas de preço ===
export interface PriceAlert {
  id: number;
  item_id: string;
  display_name?: string | null;
  city?: string | null;
  quality?: number | null;

  target_price?: number | null;
  expected_price?: number | null;
  percent_below?: number | null;

  use_ai_expected: boolean;
  ai_days: number;
  ai_resolution: string;
  ai_stat: string;
  ai_min_points: number;

  cooldown_minutes: number;
  is_active: boolean;

  last_triggered_at?: string | null;
  last_expected_price?: number | null;
  last_expected_at?: string | null;
}

export interface UserNotification {
  id: number;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

// === Filtros (frontend) ===
export interface PriceFilters {
  item_name: string;
  cities?: string[];
  quality?: number;
  enchantment?: number;
}
