// src/hooks/useLanguage.ts
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

type Language = 'pt-BR' | 'en-US';

export function useLanguage() {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language as Language;
  const isPortuguese = currentLanguage === 'pt-BR';
  const isEnglish = currentLanguage === 'en-US';

  const toggleLanguage = useCallback(() => {
    const newLang: Language = isPortuguese ? 'en-US' : 'pt-BR';
    i18n.changeLanguage(newLang);
    
    try {
      localStorage.setItem('app_language', newLang);
    } catch {
      console.warn('Could not save language preference');
    }
  }, [i18n, isPortuguese]);

  const setLanguage = useCallback(
    (lang: Language) => {
      i18n.changeLanguage(lang);
      try {
        localStorage.setItem('app_language', lang);
      } catch {
        console.warn('Could not save language preference');
      }
    },
    [i18n],
  );

  return {
    currentLanguage,
    isPortuguese,
    isEnglish,
    toggleLanguage,
    setLanguage,
  };
}