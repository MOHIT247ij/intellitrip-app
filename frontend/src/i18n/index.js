/**
 * i18n/index.js
 * -----------------------------------------------------------------
 * react-i18next configuration. UI strings live in en.json / hi.json /
 * mr.json rather than being hard-coded inside components, so adding
 * a language only means adding a new JSON file. The active language
 * is also sent to the backend on AI planner requests so Gemini
 * generates itinerary text (titles, descriptions) in that language.
 * -----------------------------------------------------------------
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import hi from './hi.json';
import mr from './mr.json';
import ta from './ta.json';
import te from './te.json';
import bn from './bn.json';
import gu from './gu.json';
import kn from './kn.json';

const savedLang = localStorage.getItem('intellitrip_lang') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    mr: { translation: mr },
    ta: { translation: ta },
    te: { translation: te },
    bn: { translation: bn },
    gu: { translation: gu },
    kn: { translation: kn },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
