import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function GuestRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  // Enquanto está bootstrapping, evita flicker de tela
  if (isBootstrapping) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Carregando...
      </div>
    );
  }

  // Se já estiver logado, não faz sentido ver login/cadastro
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
