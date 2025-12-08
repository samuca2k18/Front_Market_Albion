// src/components/common/LoadingScreen.tsx
import './common.css';

interface LoadingScreenProps {
  label?: string;
}

export function LoadingScreen({ label = 'Carregando...' }: LoadingScreenProps) {
  return (
    <div className="loading-overlay">
      <div className="loading-backdrop" />

      <div
        className="loading-card"
        role="status"
        aria-live="polite"
        aria-label={label}
      >
        <div className="loading-spinner" />

        <div className="loading-text">
          <span className="loading-label">{label}</span>
          <span className="loading-subtitle">
            Isso pode levar apenas alguns segundos.
          </span>
        </div>
      </div>
    </div>
  );
}

// alias para manter o import { Loader } funcionando
export function Loader(props: LoadingScreenProps) {
  return <LoadingScreen {...props} />;
}

export default LoadingScreen;
