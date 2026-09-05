// src/components/common/LoadingScreen.tsx
import { useTranslation } from 'react-i18next';
import './common.css';

interface LoadingScreenProps {
  label?: string;
}

export function LoadingScreen({ label }: LoadingScreenProps) {
  const { t } = useTranslation();
  const resolvedLabel = label ?? t('common.loading');

  return (
    <div className="loading-overlay">
      <div className="loading-backdrop" />

      <div
        className="loading-card"
        role="status"
        aria-live="polite"
        aria-label={resolvedLabel}
      >
        <div className="loading-spinner" />

        <div className="loading-text">
          <span className="loading-label">{resolvedLabel}</span>
          <span className="loading-subtitle">
            {t('common.loadingSubtitle')}
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
