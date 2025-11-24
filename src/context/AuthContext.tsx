import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { loginRequest, meRequest, signupRequest } from '../api/auth';
import { STORAGE_KEYS } from '../api/client';
import type { AuthCredentials, SignupPayload, User } from '../api/types';
import { parseApiError } from '../api/client';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isBootstrapping: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const profile = await meRequest();
      setUser(profile);
    } catch (error) {
      console.error('Erro ao buscar usuário', error);
      persistToken(null);
      setUser(null);
    }
  }, [token, persistToken]);

  useEffect(() => {
    if (!token) {
      setIsBootstrapping(false);
      return;
    }

    refreshUser().finally(() => setIsBootstrapping(false));
  }, [token, refreshUser]);

  const login = useCallback(
    async (credentials: AuthCredentials) => {
      try {
        const data = await loginRequest(credentials);
        persistToken(data.access_token);
        await refreshUser();
      } catch (error) {
        throw parseApiError(error);
      }
    },
    [persistToken, refreshUser],
  );

  const signup = useCallback(
    async (payload: SignupPayload) => {
      try {
        await signupRequest(payload);
        await login({ username: payload.username, password: payload.password });
      } catch (error) {
        throw parseApiError(error);
      }
    },
    [login],
  );

  const logout = useCallback(() => {
    persistToken(null);
    setUser(null);
  }, [persistToken]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.token) {
        setToken(event.newValue);
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
    [user, token, isBootstrapping, login, signup, logout, refreshUser],
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

