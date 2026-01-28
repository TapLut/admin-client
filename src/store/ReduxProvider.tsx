'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/store';
import '@/lib/i18n'; // Initialize i18n
import { LanguageInitializer } from '@/components/layout/LanguageInitializer';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <LanguageInitializer />
      {children}
    </Provider>
  );
}
