// src/i18n/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ptBR from './locales/pt-BR.json';
import enUS from './locales/en-US.json';

const resources = {
  'pt-BR': { translation: ptBR },
  'en-US': { translation: enUS },
};

// Force pt-BR until EN translations cover landing/auth chrome fully.
// LanguageSwitcher is hidden in HeaderActions/MobileMenu for the same reason.
const defaultLanguage = 'pt-BR';

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
  document.documentElement.lang = 'pt-BR';
}

export default i18n;
