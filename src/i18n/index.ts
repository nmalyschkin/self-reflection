import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from './locales/en/common.json';
import enDomains from './locales/en/domains.json';
import enPersonas from './locales/en/personas.json';
import esCommon from './locales/es/common.json';
import esDomains from './locales/es/domains.json';
import esPersonas from './locales/es/personas.json';
import jaCommon from './locales/ja/common.json';
import jaDomains from './locales/ja/domains.json';
import jaPersonas from './locales/ja/personas.json';
import { getUserLanguage } from '../language/languageSelection';

void i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon as any,
      domains: enDomains as any,
      personas: enPersonas as any,
    },
    es: {
      common: esCommon as any,
      domains: esDomains as any,
      personas: esPersonas as any,
    },
    ja: {
      common: jaCommon as any,
      domains: jaDomains as any,
      personas: jaPersonas as any,
    },
  },
  lng: getUserLanguage(),
  fallbackLng: 'en',
  ns: ['common', 'domains', 'personas'],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

export default i18n;
