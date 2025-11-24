import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { token, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return null;
  }

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

