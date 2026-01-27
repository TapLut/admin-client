import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface Modal {
  id: string;
  isOpen: boolean;
  data?: Record<string, unknown>;
}

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toasts: Toast[];
  modals: Record<string, Modal>;
  globalLoading: boolean;
  theme: 'light' | 'dark' | 'system';
  breadcrumbs: { label: string; href?: string }[];
}

const initialState: UIState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  toasts: [],
  modals: {},
  globalLoading: false,
  theme: 'system',
  breadcrumbs: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      state.toasts.push({ ...action.payload, id });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
    openModal: (
      state,
      action: PayloadAction<{ id: string; data?: Record<string, unknown> }>
    ) => {
      state.modals[action.payload.id] = {
        id: action.payload.id,
        isOpen: true,
        data: action.payload.data,
      };
    },
    closeModal: (state, action: PayloadAction<string>) => {
      if (state.modals[action.payload]) {
        state.modals[action.payload].isOpen = false;
      }
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    setBreadcrumbs: (
      state,
      action: PayloadAction<{ label: string; href?: string }[]>
    ) => {
      state.breadcrumbs = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  addToast,
  removeToast,
  clearToasts,
  openModal,
  closeModal,
  setGlobalLoading,
  setTheme,
  setBreadcrumbs,
} = uiSlice.actions;

export default uiSlice.reducer;
