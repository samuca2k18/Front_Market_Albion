import { Routes, Route } from 'react-router-dom';
import './App.css';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { PricesPage } from './pages/PricesPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { GuestRoute } from './components/routing/GuestRoute';

function App() {
  return (
    <Routes>
      {/* Layout principal (navbar, etc) */}
      <Route element={<AppLayout />}>
        {/* Rotas para visitantes (não logados) */}
        <Route element={<GuestRoute />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
        </Route>

        {/* Rotas protegidas (somente logado) */}
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="prices" element={<PricesPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
