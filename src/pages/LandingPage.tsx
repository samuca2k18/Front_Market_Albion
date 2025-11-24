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

export function LandingPage() {
  return (
    <div className="landing">
      <section className="hero">
        <p className="eyebrow">Albion Online • Inteligência de Mercado</p>
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

        <div className="hero-highlight">
          <div>
            <strong>+6</strong>
            <span>Cidades monitoradas</span>
          </div>
          <div>
            <strong>1s</strong>
            <span>Tempo médio de resposta</span>
          </div>
          <div>
            <strong>100%</strong>
            <span>Integração com API oficial</span>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Por que usar o Market Albion Online?</h2>
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

