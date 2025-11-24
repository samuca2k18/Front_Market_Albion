import './layout.css';

export function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-container footer-content">
        <div className="footer-brand">
          <h4>Albion Market</h4>
          <p>Inteligência de preços e monitoramento em tempo real com o padrão visual do painel.</p>
        </div>

        <div className="footer-meta">
          <span>© {new Date().getFullYear()} Albion Market Intelligence</span>
          <span>Dados oficiais: Albion Online Data API</span>
        </div>
      </div>
    </footer>
  );
}

