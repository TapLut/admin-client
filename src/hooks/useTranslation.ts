import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';

export function useTranslation() {
  const { t, i18n } = useI18nTranslation();
  const language = useAppSelector((state) => state.ui.language);

  // Sync Redux state with i18next
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  return { t };
}
