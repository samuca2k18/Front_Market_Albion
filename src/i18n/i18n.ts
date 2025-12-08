// src/i18n/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ptBR from './locales/pt-BR.json';
import enUS from './locales/en-US.json';

const resources = {
  'pt-BR': { translation: ptBR },
  'en-US': { translation: enUS },
};

// Detecta o idioma do navegador
const getBrowserLanguage = (): string => {
  const nav = navigator.language || 'pt-BR';
  return nav.startsWith('en') ? 'en-US' : 'pt-BR';
};

// Tenta obter o idioma salvo no localStorage
const getSavedLanguage = (): string | null => {
  try {
    return localStorage.getItem('app_language');
  } catch {
    return null;
  }
};

const defaultLanguage = getSavedLanguage() || getBrowserLanguage() || 'pt-BR';

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

export default i18n;