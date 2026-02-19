// src/i18n.js
// Internationalization configuration
// Arabic is the default language

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from './locales/ar.json';
import en from './locales/en.json';

// Get saved language from localStorage, default to Arabic
const savedLanguage = localStorage.getItem('language') || 'ar';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
    },
    lng: savedLanguage, // Default language (Arabic)
    fallbackLng: 'en',  // Fallback to English if translation missing
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    // Debug mode in development
    debug: process.env.NODE_ENV === 'development',
  });

// Export a helper to change language and save to localStorage
export const changeLanguage = (lang) => {
  localStorage.setItem('language', lang);
  i18n.changeLanguage(lang);
};

// Export helper to get current language
export const getCurrentLanguage = () => i18n.language;

export default i18n;
