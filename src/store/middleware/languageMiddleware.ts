import { Middleware } from '@reduxjs/toolkit';

export const languageMiddleware: Middleware = (store) => (next) => (action: any) => {
  const result = next(action);
  if (action.type === 'ui/setLanguage') {
    const state = store.getState() as any;
    const language = state.ui?.language;
    if (typeof window !== 'undefined' && language) {
      localStorage.setItem('admin_language', language);
    }
  }
  return result;
};
