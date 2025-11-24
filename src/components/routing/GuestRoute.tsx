import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { token, isBootstrapping, sessionExpiresAt } = useAuth();
  const isExpired = sessionExpiresAt ? Date.now() > sessionExpiresAt : false;

  if (isBootstrapping) {
    return null;
  }

  if (token && !isExpired) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

