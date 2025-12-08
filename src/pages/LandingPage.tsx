// src/pages/LandingPage.tsx
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { useAuth } from '../hooks/useAuth';
import '../components/common/common.css';

const featureList = [
  {
    title: 'Monitoramento inteligente',
    description:
      'Sincronize seus itens favoritos e veja os menores preços em segundos, sem precisar abrir o game.',
  },
  {
    title: 'Filtros profissionais',
    description:
      'Refine por cidade, qualidade e encantamento para decidir onde comprar e onde vender.',
  },
  {
    title: 'Login seguro',
    description:
      'Autenticação JWT, sessões protegidas e integração direta com sua API backend.',
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleViewDashboard = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login', { state: { from: { pathname: '/dashboard' } } });
    }
  };

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-left">
          <span className="hero-chip">Albion Online • Inteligência de Mercado</span>

          <h1 className="hero-title">
            Controle total dos preços do mercado
            <span className="hero-title-highlight"> com visual profissional</span>
          </h1>

          <p className="hero-subtitle">
            Consulte preços em tempo real, monitore seus itens favoritos e descubra
            em qual cidade está o melhor retorno antes de se mover pelo mapa.
          </p>

          <div className="hero-actions">
            {!isAuthenticated && (
              <Link to="/signup" className="btn btn-primary">
                Começar agora
              </Link>
            )}

            <button
              type="button"
              className="btn btn-outline"
              onClick={handleViewDashboard}
            >
              Ver painel em ação
            </button>
          </div>

          <div className="hero-metrics">
            <div className="metric-card">
              <span className="metric-label">Cidades monitoradas</span>
              <strong className="metric-value">+6</strong>
            </div>
            <div className="metric-card">
              <span className="metric-label">Tempo de resposta</span>
              <strong className="metric-value">~1s</strong>
            </div>
            <div className="metric-card">
              <span className="metric-label">Integração com API</span>
              <strong className="metric-value">100%</strong>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-preview-card">
            <p className="preview-title">Snapshot do mercado</p>
            <ul className="preview-list">
              <li>
                <span className="preview-pill">Caerleon</span>
                <div className="preview-line">
                  <span className="preview-item">T8_BAG@3</span>
                  <span className="preview-price">1.245.000</span>
                </div>
              </li>
              <li>
                <span className="preview-pill">Bridgewatch</span>
                <div className="preview-line">
                  <span className="preview-item">T6_CAPE</span>
                  <span className="preview-price">312.400</span>
                </div>
              </li>
              <li>
                <span className="preview-pill">Martlock</span>
                <div className="preview-line">
                  <span className="preview-item">T4_ARMOR_PLATE</span>
                  <span className="preview-price">48.900</span>
                </div>
              </li>
            </ul>
            <p className="preview-footer">Dados simulados • Veja o painel real após login</p>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-header">
          <h2>Por que usar o Market Albion Online?</h2>
          <p className="features-subtitle">
            Pensado para quem leva economia de silver a sério: traders, economistas de
            guilda e jogadores que não querem perder tempo.
          </p>
        </div>

        <div className="feature-grid">
          {featureList.map((feature) => (
            <Card
              key={feature.title}
              title={feature.title}
              description={feature.description}
            >
              <ul className="feature-list">
                <li>• Insight imediato dos preços</li>
                <li>• Layout limpo e responsivo</li>
                <li>• Integrado ao seu backend seguro</li>
              </ul>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
