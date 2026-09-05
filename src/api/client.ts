import axios, { AxiosError } from 'axios';

const DEFAULT_API_URL = 'https://market-albion-online.vercel.app';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  DEFAULT_API_URL
).replace(/\/$/, '');

export const STORAGE_KEYS = {
  user: 'albion_market_user',
  // Legacy keys kept only for cleanup migration.
  token: 'albion_market_token',
  refreshToken: 'albion_market_refresh_token',
  sessionExpiry: 'albion_market_session_expiry',
};

let currentAccessToken: string | null = null;

export function getAccessToken(): string | null {
  return currentAccessToken;
}

export function setAccessToken(token: string | null): void {
  currentAccessToken = token;
}

export function clearAccessToken(): void {
  currentAccessToken = null;
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
});

const PROTECTED_ROUTE_PREFIXES = [
  '/dashboard',
  '/prices',
  '/opportunities',
  '/crafting',
  '/tracker',
  '/meta-market',
  '/guild-hub',
];

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown, newToken: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error || !newToken) reject(error);
    else resolve(newToken);
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

    const requestUrl = String(originalRequest?.url ?? '');
    const isAuthRefreshRequest = requestUrl.includes('/refresh');
    const isAuthLoginRequest = requestUrl.includes('/login');

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      isAuthRefreshRequest ||
      isAuthLoginRequest
    ) {
      return Promise.reject(error);
    }

    // Guests (no access token) must not trigger /refresh loops — e.g. landing
    // calling protected price endpoints. Only attempt refresh when we had a session.
    if (!getAccessToken()) {
      return Promise.reject(error);
    }

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

    try {
      const { data } = await axios.post<{ access_token: string }>(
        `${API_BASE_URL}/refresh`,
        null,
        { withCredentials: true },
      );

      const newAccessToken = data.access_token;
      setAccessToken(newAccessToken);

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

function _clearSessionAndRedirect() {
  clearAccessToken();

  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem(STORAGE_KEYS.sessionExpiry);

  const pathname = window.location.pathname.toLowerCase();
  const isProtectedPath = PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtectedPath && !pathname.includes('/login')) {
    const returnTo = encodeURIComponent(
      `${window.location.pathname}${window.location.search}`,
    );
    window.location.href = `/login?returnTo=${returnTo}`;
  }
}

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

export function buildQuery(
  params: Record<string, string | number | undefined | string[]>,
) {
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
