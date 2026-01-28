'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

i18n
  .use(initReactI18next)
  .use(
    resourcesToBackend((language: string, namespace: string) => {
      return import(`@/locales/${language}/${namespace}.json`);
    })
  )
  .init({
    lng: 'ko', // Default language
    fallbackLng: 'en',
    ns: ['translation'],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false, // React already safe from XSS
    },
    react: {
      useSuspense: false // Avoid hydration mismatch on server
    }
  });

export default i18n;
