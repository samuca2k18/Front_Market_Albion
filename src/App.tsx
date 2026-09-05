import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n';
import './styles/global.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/utilities.css';
import './styles/animations.css';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { GuestRoute } from './components/routing/GuestRoute';
import { GlobalSearch } from './components/search/GlobalSearch';
import { ThemeProvider } from './context/ThemeContext';

const DashboardPage = lazy(() =>
  import('./pages/dashboard/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  })),
);
const OpportunitiesPage = lazy(() =>
  import('./pages/OpportunitiesPage').then((module) => ({
    default: module.OpportunitiesPage,
  })),
);
const KillboardPage = lazy(() =>
  import('./pages/KillboardPage').then((module) => ({
    default: module.KillboardPage,
  })),
);
const PricesPage = lazy(() =>
  import('./pages/PricesPage').then((module) => ({
    default: module.PricesPage,
  })),
);
const CraftingPage = lazy(() =>
  import('./pages/CraftingPage').then((module) => ({
    default: module.CraftingPage,
  })),
);
const ItemDatabasePage = lazy(() =>
  import('./pages/ItemDatabasePage').then((module) => ({
    default: module.ItemDatabasePage,
  })),
);
const TrackerPage = lazy(() =>
  import('./pages/TrackerPage').then((module) => ({
    default: module.TrackerPage,
  })),
);
const MetaMarketPage = lazy(() =>
  import('./pages/MetaMarketPage').then((module) => ({
    default: module.MetaMarketPage,
  })),
);
const GuildHubPage = lazy(() =>
  import('./pages/GuildHubPage').then((module) => ({
    default: module.GuildHubPage,
  })),
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((module) => ({
    default: module.NotFoundPage,
  })),
);
const DataClientPage = lazy(() =>
  import('./pages/DataClientPage').then((module) => ({
    default: module.DataClientPage,
  })),
);

function RouteFallback() {
  return (
    <div className="w-full py-12 text-center text-sm text-muted-foreground">
      Carregando página...
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <I18nextProvider i18n={i18n}>
        {/* Global Search Modal (Ctrl+K) */}
        <GlobalSearch />

        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* Layout principal (navbar, etc) */}
            <Route element={<AppLayout />}>
              {/* Rotas para visitantes (não logados) */}
              <Route element={<GuestRoute />}>
                <Route index element={<LandingPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="signup" element={<SignupPage />} />
                <Route path="verify-email" element={<VerifyEmailPage />} />
              </Route>

              {/* Rotas públicas (acessível por qualquer um) */}
              <Route path="data-client" element={<DataClientPage />} />
              <Route path="items" element={<ItemDatabasePage />} />

              {/* Rotas protegidas (somente logado) */}
              <Route element={<ProtectedRoute />}>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="prices" element={<PricesPage />} />
                <Route path="opportunities" element={<OpportunitiesPage />} />
                <Route path="crafting" element={<CraftingPage />} />
                <Route path="killboard" element={<KillboardPage />} />
                <Route path="tracker" element={<TrackerPage />} />
                <Route path="meta-market" element={<MetaMarketPage />} />
                <Route path="guild-hub" element={<GuildHubPage />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </I18nextProvider>
    </ThemeProvider>
  );
}

export default App;
