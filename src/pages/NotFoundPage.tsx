import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="not-found">
      <h2>Página não encontrada</h2>
      <p className="muted">O link acessado não existe ou foi movido.</p>
      <Link to="/" className="primary-button">
        Voltar para o início
      </Link>
    </div>
  );
}

