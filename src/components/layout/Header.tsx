// src/components/layout/Header.tsx
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './layout.css';

const navItems = [
  { label: 'Painel', path: '/dashboard', protected: true },
  { label: 'Preços', path: '/prices', protected: true },
];

export function Header() {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const availableItems = navItems.filter((item) => (item.protected ? !!token : true));
  const hasNavigation = availableItems.length > 0;

  const closeMenu = () => setIsMenuOpen(false);

  const firstLetter = user?.username?.[0]?.toUpperCase() ?? 'A';

  return (
    <header className="app-header">
      <div className="app-container header-content">
        <div className="brand-block">
          <Link to="/" className="brand" onClick={closeMenu}>
            <div className="brand-logo">
              <span className="brand-logo-icon">₿</span>
            </div>
            <div className="brand-text">
              <span className="brand-mark">Albion Market</span>
              <span className="brand-tagline">Market Intelligence</span>
            </div>
          </Link>
        </div>

        {hasNavigation && (
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={isMenuOpen}
            aria-label="Alternar navegação"
            onClick={() => setIsMenuOpen((state) => !state)}
          >
            <span />
            <span />
          </button>
        )}

        <div className="header-controls">
          {hasNavigation && (
            <nav className={`main-nav${isMenuOpen ? ' open' : ''}`}>
              {availableItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    isActive ? 'nav-item active' : 'nav-item'
                  }
                  onClick={closeMenu}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}

          <div className="header-actions">
            {user ? (
              <>
                <div className="user-info">
                  <div className="user-avatar">
                    <span>{firstLetter}</span>
                    <span className="user-status-dot" />
                  </div>
                  <div className="user-meta">
                    <span className="user-label">Logado como</span>
                    <span className="user-name">{user.username}</span>
                  </div>
                </div>
                <button className="ghost-button" onClick={handleLogout}>
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link className="ghost-button" to="/login" onClick={closeMenu}>
                  Entrar
                </Link>
                <Link className="primary-button" to="/signup" onClick={closeMenu}>
                  Criar conta
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
