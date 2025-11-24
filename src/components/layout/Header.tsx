import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './layout.css';

const navItems = [
  { label: 'Início', path: '/' },
  { label: 'Painel', path: '/dashboard', protected: true },
  { label: 'Preços', path: '/prices', protected: true },
];

export function Header() {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="app-container header-content">
        <Link to="/" className="brand">
          <span className="brand-mark">Albion Market</span>
          <span className="brand-dot" />
        </Link>

        <nav className="main-nav">
          {navItems
            .filter((item) => (item.protected ? !!token : true))
            .map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              >
                {item.label}
              </NavLink>
            ))}
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <span className="user-chip">Olá, {user.username}</span>
              <button className="ghost-button" onClick={handleLogout}>
                Sair
              </button>
            </>
          ) : (
            <>
              <Link className="ghost-button" to="/login">
                Entrar
              </Link>
              <Link className="primary-button" to="/signup">
                Criar conta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

