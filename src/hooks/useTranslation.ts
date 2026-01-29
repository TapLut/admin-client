import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';

export function useTranslation() {
  const { t, i18n, ready } = useI18nTranslation();
  const language = useAppSelector((state) => state.ui.language);
  const [isReady, setIsReady] = useState(false);

  // Sync Redux state with i18next
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  // Track when translations are loaded
  useEffect(() => {
    if (ready) {
      setIsReady(true);
    }
  }, [ready]);

  return { t, isReady };
}
