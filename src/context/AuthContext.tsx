import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { loginRequest, meRequest, signupRequest } from '../api/auth';
import { STORAGE_KEYS, type ApiErrorShape } from '../api/client';
import type { AuthCredentials, SignupPayload, User } from '../api/types';
import { parseApiError } from '../api/client';
import type { ApiErrorShape } from '../api/client';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 horas

function parseUser(value: string | null): User | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as User;
  } catch {
    return null;
  }
}

function loadStoredUser(): User | null {
  return parseUser(localStorage.getItem(STORAGE_KEYS.user));
}

function loadStoredExpiry(): number | null {
  const raw = localStorage.getItem(STORAGE_KEYS.sessionExpiry);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEYS.token));
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const persistToken = useCallback((value: string | null) => {
    if (!value) {
      localStorage.removeItem(STORAGE_KEYS.token);
      setToken(null);
      return;
    }
    localStorage.setItem(STORAGE_KEYS.token, value);
    setToken(value);
  }, []);

  const persistSessionExpiry = useCallback((value: number | null) => {
    if (!value) {
      localStorage.removeItem(STORAGE_KEYS.sessionExpiry);
      setSessionExpiresAt(null);
      return;
    }
    localStorage.setItem(STORAGE_KEYS.sessionExpiry, String(value));
    setSessionExpiresAt(value);
  }, []);

  const persistUser = useCallback((value: User | null) => {
    if (!value) {
      localStorage.removeItem(STORAGE_KEYS.user);
      setUser(null);
      return;
    }
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(value));
    setUser(value);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) {
      persistUser(null);
      return;
    }

    if (sessionExpiresAt && Date.now() > sessionExpiresAt) {
      persistToken(null);
      persistSessionExpiry(null);
      persistUser(null);
      return;
    }

    try {
      const profile = await meRequest();
      persistUser(profile);
    } catch (error) {
      console.error('Erro ao buscar usuário', error);
      persistToken(null);
      setUser(null);
    }
  }, [token, sessionExpiresAt, persistToken, persistSessionExpiry, persistUser]);

  useEffect(() => {
    if (!token) {
      persistSessionExpiry(null);
      persistUser(null);
      setIsBootstrapping(false);
      return;
    }

    if (sessionExpiresAt && Date.now() > sessionExpiresAt) {
      persistToken(null);
      persistSessionExpiry(null);
      persistUser(null);
      setIsBootstrapping(false);
      return;
    }

    refreshUser().finally(() => setIsBootstrapping(false));
  }, [token, sessionExpiresAt, refreshUser, persistSessionExpiry, persistToken, persistUser]);

  const login = useCallback(
    async (credentials: AuthCredentials) => {
      try {
        const data = await loginRequest(credentials);
        persistToken(data.access_token);
        persistSessionExpiry(Date.now() + SESSION_DURATION_MS);
        persistUser({
          id: user?.id ?? 0,
          username: credentials.username,
          email: user?.email ?? '',
        });
        await refreshUser();
      } catch (error) {
        // sempre lançar ApiErrorShape
        throw parseApiError(error) as ApiErrorShape;
      }
    },
    [persistToken, persistSessionExpiry, persistUser, refreshUser, user],
  );

  const signup = useCallback(
    async (payload: SignupPayload) => {
      try {
        await signupRequest(payload);
        await login({ username: payload.username, password: payload.password });
      } catch (error) {
        throw parseApiError(error) as ApiErrorShape;
      }
    },
    [login],
  );

  const logout = useCallback(() => {
    persistToken(null);
    persistSessionExpiry(null);
    persistUser(null);
  }, [persistToken, persistSessionExpiry, persistUser]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.token) {
        setToken(event.newValue);
      }
      if (event.key === STORAGE_KEYS.sessionExpiry) {
        setSessionExpiresAt(event.newValue ? Number(event.newValue) : null);
      }
      if (event.key === STORAGE_KEYS.user) {
        setUser(parseUser(event.newValue));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isBootstrapping,
      login,
      signup,
      logout,
      refreshUser,
    }),
    [user, token, isBootstrapping, sessionExpiresAt, login, signup, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext deve ser usado dentro de AuthProvider');
  }
  return context;
}
