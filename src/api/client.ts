// src/api/client.ts
import axios, { AxiosError } from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000';

export const STORAGE_KEYS = {
  token: 'albion_market_token',
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.token);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ApiErrorShape {
  message: string;
  status?: number;
  details?: string[];
}

export function parseApiError(error: unknown): ApiErrorShape {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ detail?: any }>;
    const status = err.response?.status;

    const detail = err.response?.data?.detail;

    // FastAPI pode mandar:
    // - string: "msg"
    // - lista de strings: ["msg1", "msg2"]
    // - lista de objetos: [{ msg: "erro", loc: [...], type: "..." }]
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

    return {
      message,
      status,
    };
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