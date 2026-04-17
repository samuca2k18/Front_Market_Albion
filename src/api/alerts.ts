import { api, parseApiError } from './client';
import type { PriceAlert, UserNotification } from './types';

// === Alertas de preço (/alerts) ===

export async function listPriceAlerts(): Promise<PriceAlert[]> {
  try {
    const { data } = await api.get<PriceAlert[]>('/alerts');
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export interface CreatePriceAlertPayload {
  item_id: string;
  display_name?: string;
  city?: string | null;
  quality?: number | null;
  target_price?: number | null;
  expected_price?: number | null;
  percent_below?: number | null;
  use_ai_expected?: boolean;
  ai_days?: number;
  ai_resolution?: '1h' | '6h' | '24h';
  ai_stat?: 'median' | 'mean';
  ai_min_points?: number;
  cooldown_minutes?: number;
}

export async function createPriceAlert(
  payload: CreatePriceAlertPayload,
): Promise<PriceAlert> {
  try {
    const body = {
      item_id: payload.item_id,
      display_name: payload.display_name ?? null,
      city: payload.city ?? null,
      quality: payload.quality ?? null,
      target_price: payload.target_price ?? null,
      expected_price: payload.expected_price ?? null,
      percent_below: payload.percent_below ?? null,
      use_ai_expected: payload.use_ai_expected ?? false,
      ai_days: payload.ai_days ?? 7,
      ai_resolution: payload.ai_resolution ?? '6h',
      ai_stat: payload.ai_stat ?? 'median',
      ai_min_points: payload.ai_min_points ?? 10,
      cooldown_minutes: payload.cooldown_minutes ?? 60,
    };

    const { data } = await api.post<PriceAlert>('/alerts', {
      ...body,
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

// === Notificações do usuário (/alerts/notifications) ===

export async function listNotifications(params?: {
  unread?: boolean;
}): Promise<UserNotification[]> {
  try {
    const { data } = await api.get<UserNotification[]>('/alerts/notifications', {
      params: params?.unread ? { unread: true } : undefined,
    });
    return data;
  } catch (error) {
    throw parseApiError(error);
  }
}

export async function markNotificationRead(id: number): Promise<void> {
  try {
    await api.post(`/alerts/notifications/${id}/read`);
  } catch (error) {
    throw parseApiError(error);
  }
}

