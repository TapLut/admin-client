import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import productsReducer from './slices/productsSlice';
import ordersReducer from './slices/ordersSlice';
import campaignsReducer from './slices/campaignsSlice';
import questsReducer from './slices/questsSlice';
import usersReducer from './slices/usersSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    products: productsReducer,
    orders: ordersReducer,
    campaigns: campaignsReducer,
    quests: questsReducer,
    users: usersReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
