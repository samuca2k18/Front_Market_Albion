// src/components/layout/Footer.tsx
import './layout.css';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="app-container footer-content">
        <div className="footer-brand">
          <h4>Albion Market</h4>
          <p>
            Monitoramento de preços, histórico e inteligência de mercado para jogadores
            e traders de Albion Online.
          </p>
        </div>

        <div className="footer-columns">
          <div className="footer-column">
            <h5>Produto</h5>
            <ul>
              <li>Dashboard em tempo real</li>
              <li>Histórico de preços</li>
              <li>Integração com API própria</li>
            </ul>
          </div>
          <div className="footer-column">
            <h5>Dados</h5>
            <ul>
              <li>Albion Online Data API</li>
              <li>Atualização periódica</li>
              <li>Foco em leitura de mercado</li>
            </ul>
          </div>
        </div>

        <div className="footer-meta">
          <span>© {year} Albion Market Intelligence</span>
          <span className="footer-sub">
            Não afiliado oficialmente à Sandbox Interactive. Albion Online é marca de seus
            respectivos detentores.
          </span>
        </div>
      </div>
    </footer>
  );
}
