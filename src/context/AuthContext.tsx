import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import {
  loginRequest,
  logoutRequest,
  meRequest,
  refreshAccessRequest,
  signupRequest,
} from '../api/auth';
import {
  clearAccessToken,
  parseApiError,
  setAccessToken,
  type ApiErrorShape,
} from '../api/client';
import type { AuthCredentials, SignupPayload, User } from '../api/types';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const persistToken = useCallback((value: string | null) => {
    if (!value) {
      clearAccessToken();
      setToken(null);
      return;
    }
    setAccessToken(value);
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
      console.error('Erro ao buscar usuario', error);
      persistToken(null);
      setUser(null);
    }
  }, [token, persistToken]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapAuth() {
      try {
        const refreshed = await refreshAccessRequest();
        if (cancelled) return;
        persistToken(refreshed.access_token);
        const profile = await meRequest();
        if (!cancelled) {
          setUser(profile);
        }
      } catch {
        if (!cancelled) {
          persistToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    }

    void bootstrapAuth();
    return () => {
      cancelled = true;
    };
  }, [persistToken]);

  const login = useCallback(
    async (credentials: AuthCredentials) => {
      try {
        const data = await loginRequest(credentials);
        persistToken(data.access_token);
        await refreshUser();
      } catch (error) {
        throw parseApiError(error) as ApiErrorShape;
      }
    },
    [persistToken, refreshUser],
  );

  const signup = useCallback(async (payload: SignupPayload) => {
    try {
      await signupRequest(payload);
    } catch (error) {
      throw parseApiError(error) as ApiErrorShape;
    }
  }, []);

  const logout = useCallback(() => {
    void logoutRequest().catch(() => undefined);
    persistToken(null);
    setUser(null);
  }, [persistToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isBootstrapping,
      isAuthenticated: !!user,
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
