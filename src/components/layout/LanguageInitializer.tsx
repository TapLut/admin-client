'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setLanguage } from '@/store/slices/uiSlice';

export function LanguageInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const savedLanguage = localStorage.getItem('admin_language');
    if (savedLanguage && (savedLanguage === 'ko' || savedLanguage === 'en')) {
      dispatch(setLanguage(savedLanguage as 'ko' | 'en'));
    }
  }, [dispatch]);

  return null;
}
