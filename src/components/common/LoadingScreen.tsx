// src/components/common/LoadingScreen.tsx
import './common.css';

export function LoadingScreen({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="loading-overlay">
      <div className="spinner" aria-label={label} />
      <span>{label}</span>
    </div>
  );
}

// alias para manter o import { Loader } funcionando
export function Loader(props: { label?: string }) {
  return <LoadingScreen {...props} />;
}

// opcional: default export
export default LoadingScreen;
