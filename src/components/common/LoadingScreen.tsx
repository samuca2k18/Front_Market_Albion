import './common.css';

export function LoadingScreen({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="loading-overlay">
      <div className="spinner" aria-label={label} />
      <span>{label}</span>
    </div>
  );
}

