/**
 * LanguageContext.jsx
 * Thin wrapper around i18next so the rest of the app can read/set
 * the active language through one hook (useLanguage), and so the
 * choice persists to localStorage and is reused for AI generation
 * (the `language` field sent to /api/ai/plan).
 */
import { createContext, useContext, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext(null);

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
];

export function LanguageProvider({ children }) {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState(() => localStorage.getItem('intellitrip_lang') || 'en');

  const setLanguage = useCallback(
    (code) => {
      setLanguageState(code);
      localStorage.setItem('intellitrip_lang', code);
      i18n.changeLanguage(code);
    },
    [i18n]
  );

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
