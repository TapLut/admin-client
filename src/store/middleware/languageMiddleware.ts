import { Middleware, isAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export const languageMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  if (isAction(action) && action.type === 'ui/setLanguage') {
    const state = store.getState() as RootState;
    const language = state.ui?.language;
    if (typeof window !== 'undefined' && language) {
      localStorage.setItem('admin_language', language);
    }
  }
  return result;
};
