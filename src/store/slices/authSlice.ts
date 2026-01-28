import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AdminUser, AdminRole } from '@/types';

interface AuthState {
  user: AdminUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: AdminUser;
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    updateTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    setUser: (state, action: PayloadAction<AdminUser>) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Selectors
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectUserRole = (state: { auth: AuthState }) =>
  state.auth.user?.role ?? null;
export const selectIsSponsor = (state: { auth: AuthState }) =>
  state.auth.user?.role === AdminRole.SPONSOR;
export const selectSponsorId = (state: { auth: AuthState }) =>
  state.auth.user?.sponsorId ?? null;
export const selectCanManageUsers = (state: { auth: AuthState }) =>
  state.auth.user?.role === AdminRole.SUPER_ADMIN ||
  state.auth.user?.role === AdminRole.ADMIN;
export const selectCanManageQuests = (state: { auth: AuthState }) =>
  state.auth.user?.role === AdminRole.SUPER_ADMIN ||
  state.auth.user?.role === AdminRole.ADMIN;
export const selectCanManageAdmins = (state: { auth: AuthState }) =>
  state.auth.user?.role === AdminRole.SUPER_ADMIN;
export const selectIsReadOnly = (state: { auth: AuthState }) =>
  state.auth.user?.role === AdminRole.MODERATOR;

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateTokens,
  setUser,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
