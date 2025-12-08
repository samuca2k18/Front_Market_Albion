// src/components/common/LanguageSwitcher.tsx
import { useLanguage } from '../../hooks/useLanguage';

export function LanguageSwitcher() {
  const { isPortuguese, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 bg-card/60 hover:bg-card/80 transition-colors"
      title={isPortuguese ? 'Switch to English' : 'Mudar para Português'}
    >
      <span className="text-sm font-medium">
        {isPortuguese ? '🇧🇷 PT' : '🇺🇸 EN'}
      </span>
    </button>
  );
}