import { Navigate, Outlet, useLocation, type Location } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getSafeReturnTo } from '../../utils/returnTo';

export function GuestRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

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
    const searchParams = new URLSearchParams(location.search);
    const returnTo = getSafeReturnTo(searchParams.get('returnTo'));
    const from = (location.state as { from?: Location } | null)?.from;
    const fromPath =
      from != null ? `${from.pathname}${from.search || ''}` : null;
    const redirectTo = returnTo ?? fromPath ?? '/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
