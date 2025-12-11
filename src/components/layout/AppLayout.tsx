import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

import './layout.css';

export function AppLayout() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <div className="app-container">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}

