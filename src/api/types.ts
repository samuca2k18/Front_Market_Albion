export interface User {
  id: number;
  username: string;
  email: string;
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

export interface ItemPayload {
  item_name: string;
}

export interface Item {
  id: number;
  item_name: string;
  created_at?: string;
}

export interface AlbionMarketEntry {
  city: string;
  item_id?: string;
  item_count?: number;
  quality?: number;
  sell_price_min: number;
  sell_price_min_date?: string;
  buy_price_max?: number;
  buy_price_max_date?: string;
}

export interface AlbionPriceResponse {
  item: string;
  cities_checked: string[];
  cheapest_city: string;
  cheapest_price: number;
  all_data: AlbionMarketEntry[];
}

export interface MyItemPrice {
  item_name: string;
  price: number;
  city?: string;
  quality: number;
  enchantment: number;
  last_update?: string;
  cheapest_city?: string;
  cheapest_price?: number;
}

export interface PriceFilters {
  item_name: string;
  cities?: string[];
  quality?: number;
  enchantment?: number;
}

