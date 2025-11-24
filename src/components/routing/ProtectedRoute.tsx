import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoadingScreen } from '../common/LoadingScreen';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isBootstrapping, sessionExpiresAt } = useAuth();
  const location = useLocation();

  const isExpired = sessionExpiresAt ? Date.now() > sessionExpiresAt : false;

  if (isBootstrapping) {
    return <LoadingScreen label="Validando sessão..." />;
  }

  if (!token || isExpired) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

