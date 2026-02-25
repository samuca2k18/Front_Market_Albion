// src/api/client.ts
import axios, { AxiosError } from 'axios';

const DEFAULT_API_URL = 'https://market-albion-online.onrender.com';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || DEFAULT_API_URL;

export const STORAGE_KEYS = {
  token: 'albion_market_token',
  refreshToken: 'albion_market_refresh_token',
  sessionExpiry: 'albion_market_session_expiry',
  user: 'albion_market_user',
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// ── Injeta access token em toda requisição ────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.token);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Interceptor de resposta: tenta refresh automático no 401 ─────────────
let isRefreshing = false;
// fila de requisições que chegaram durante o refresh
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown, newToken: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(newToken!);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

    // Só tenta refresh em 401 e apenas uma vez por requisição
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Se já está em processo de refresh, enfileira esta requisição
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest!.headers!.Authorization = `Bearer ${newToken}`;
          return api(originalRequest!);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);

    if (!refreshToken) {
      // Sem refresh token → desloga e redireciona
      _clearSessionAndRedirect();
      isRefreshing = false;
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post<{ access_token: string }>(
        `${API_BASE_URL}/refresh`,
        null,
        { params: { refresh_token: refreshToken } },
      );

      const newAccessToken = data.access_token;
      localStorage.setItem(STORAGE_KEYS.token, newAccessToken);

      processQueue(null, newAccessToken);
      originalRequest!.headers!.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest!);
    } catch (refreshError) {
      processQueue(refreshError, null);
      _clearSessionAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

/** Remove a sessão e redireciona para /login */
function _clearSessionAndRedirect() {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.user);
  // Evita loop se já estiver na página de login
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
}

// ── Helpers de erro ───────────────────────────────────────────────────────
export interface ApiErrorShape {
  message: string;
  status?: number;
  details?: string[];
}

export function parseApiError(error: unknown): ApiErrorShape {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ detail?: unknown }>;
    const status = err.response?.status;
    const detail = err.response?.data?.detail;

    let message = 'Erro inesperado.';

    if (typeof detail === 'string') {
      message = detail;
    } else if (Array.isArray(detail)) {
      const msgs = detail
        .map((d) => {
          if (typeof d === 'string') return d;
          if (d && typeof d === 'object' && 'msg' in d) return String(d.msg);
          return null;
        })
        .filter(Boolean) as string[];

      if (msgs.length > 0) {
        message = msgs.join(', ');
      }
    }

    return { message, status };
  }

  return {
    message: error instanceof Error ? error.message : 'Erro inesperado.',
  };
}

export function buildQuery(params: Record<string, string | number | undefined | string[]>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((entry) => search.append(key, entry));
    } else {
      search.append(key, String(value));
    }
  });
  return search.toString();
}

export { API_BASE_URL };