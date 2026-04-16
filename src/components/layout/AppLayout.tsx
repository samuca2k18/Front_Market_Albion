import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { SideNav } from './SideNav';
import { useAuth } from '../../hooks/useAuth';

import './layout.css';

export function AppLayout() {
  const { token } = useAuth();
  const showSideNav = !!token;

  return (
    <div className="app-shell">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-emerald-400/10 blur-[110px] animate-pulse-slow" />
        <div
          className="absolute top-1/4 -right-24 h-80 w-80 rounded-full bg-cyan-400/10 blur-[110px] animate-pulse-slow"
          style={{ animationDelay: "1.4s" }}
        />
      </div>
      <Header />
      <main className="app-main">
        <div className="app-container">
          {showSideNav ? (
            <div className="grid grid-cols-1 md:grid-cols-[250px_minmax(0,1fr)] gap-6">
              <SideNav />
              <div className="min-w-0">
                <Outlet />
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

