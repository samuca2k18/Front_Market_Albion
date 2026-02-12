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

