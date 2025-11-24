import { Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import '../components/common/common.css';

const featureList = [
  {
    title: 'Monitoramento Inteligente',
    description: 'Sincronize seus itens favoritos e receba os preços mais baixos em segundos.',
  },
  {
    title: 'Filtros Profissionais',
    description: 'Refine por cidade, qualidade e nível de encantamento para decisões precisas.',
  },
  {
    title: 'Login Seguro',
    description: 'Autenticação JWT com proteção avançada e auditoria de atividades.',
  },
];

const heroStats = [
  { value: '+6', label: 'Cidades monitoradas' },
  { value: '1s', label: 'Tempo médio de resposta' },
  { value: '100%', label: 'Integração com API oficial' },
];

const trustBadges = ['Cobertura oficial', 'Sem limites ocultos', 'Painel responsivo'];

export function LandingPage() {
  return (
    <div className="landing">
      <section className="hero hero-grid">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow">Albion Online • Inteligência de Mercado</p>
          <h1>
            Controle total dos preços do mercado com <span>visual profissional</span>
          </h1>
          <p className="hero-subtitle">
            Consulte valores em tempo real, mantenha seus itens sincronizados e descubra onde vender com
            o melhor retorno.
          </p>

          <div className="hero-actions">
            <Link to="/signup" className="primary-button">
              Começar agora
            </Link>
            <Link to="/dashboard" className="ghost-button">
              Ver painel
            </Link>
          </div>

          <div className="hero-meta">
            {trustBadges.map((badge) => (
              <span className="hero-meta-item" key={badge}>
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-panel-header">
            <span className="hero-panel-title">Monitoramento instantâneo</span>
            <span className="pill hero-pill">Tempo real</span>
          </div>
          <div className="hero-stats">
            {heroStats.map((stat) => (
              <div key={stat.label} className="hero-stat">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
          <p className="hero-panel-description">
            Sem sobrecarga visual: apenas os indicadores essenciais para você decidir onde comprar ou vender
            com maior margem.
          </p>
        </div>
      </section>

      <section className="features">
        <div className="section-heading">
          <p className="eyebrow">Recursos principais</p>
          <h2>Por que usar o Market Albion Online?</h2>
          <p>Estrutura totalmente responsiva, centralizada e com o mesmo padrão de cor do restante do app.</p>
        </div>
        <div className="feature-grid">
          {featureList.map((feature) => (
            <Card key={feature.title} title={feature.title} description={feature.description}>
              <ul className="feature-list">
                <li>• Insight imediato</li>
                <li>• Interface responsiva</li>
                <li>• API segura</li>
              </ul>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

