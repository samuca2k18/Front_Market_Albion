import './layout.css';

export function Footer() {
  return (
    <footer className="app-footer">
      <div className="app-container footer-content">
        <p>© {new Date().getFullYear()} Albion Market Intelligence</p>
        <span>Dados oficiais: Albion Online Data API</span>
      </div>
    </footer>
  );
}

