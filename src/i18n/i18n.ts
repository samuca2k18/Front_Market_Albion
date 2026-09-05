// src/i18n/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ptBR from './locales/pt-BR.json';
import enUS from './locales/en-US.json';

const resources = {
  'pt-BR': { translation: ptBR },
  'en-US': { translation: enUS },
};

function readSavedLanguage(): 'pt-BR' | 'en-US' {
  try {
    const saved = localStorage.getItem('app_language');
    if (saved === 'en-US' || saved === 'pt-BR') return saved;
  } catch {
    // ignore
  }
  return 'pt-BR';
}

const defaultLanguage = typeof window !== 'undefined' ? readSavedLanguage() : 'pt-BR';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLanguage,
    fallbackLng: 'pt-BR',
    interpolation: {
      escapeValue: false,
    },
  });

if (typeof document !== 'undefined') {
  document.documentElement.lang = defaultLanguage;
  i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
  });
}

export default i18n;
