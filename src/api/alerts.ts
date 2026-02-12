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
}

export async function createPriceAlert(
  payload: CreatePriceAlertPayload,
): Promise<PriceAlert> {
  try {
    const { data } = await api.post<PriceAlert>('/alerts', {
      // regra simples: alvo fixo
      ...payload,
      expected_price: null,
      percent_below: null,
      use_ai_expected: false,
      ai_days: 7,
      ai_resolution: '6h',
      ai_stat: 'median',
      ai_min_points: 10,
      cooldown_minutes: 60,
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

