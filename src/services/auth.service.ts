import api from '@/lib/api';
import { AdminUser, AdminRole } from '@/types';

// Server response format (admin instead of user)
interface ServerAuthResponse {
  accessToken: string;
  refreshToken: string;
  admin: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

// Client-side format
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
}

interface LoginCredentials {
  email: string;
  password: string;
}

// Map server role string to AdminRole enum
const mapRole = (role: string): AdminRole => {
  const roleMap: Record<string, AdminRole> = {
    'super_admin': AdminRole.SUPER_ADMIN,
    'admin': AdminRole.ADMIN,
    'moderator': AdminRole.MODERATOR,
    'sponsor': AdminRole.SPONSOR,
  };
  return roleMap[role] || AdminRole.ADMIN;
};

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<ServerAuthResponse>('/auth/login', credentials);
    const { accessToken, refreshToken, admin } = response.data;
    
    // Transform server response to client format
    return {
      accessToken,
      refreshToken,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: mapRole(admin.role),
        sponsorId: null,
        isActive: true,
        lastLoginAt: new Date().toISOString(),
      },
    };
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  getCurrentUser: async (): Promise<AdminUser> => {
    const response = await api.get<{
      id: number;
      email: string;
      name: string;
      role: string;
      lastLoginAt: string | null;
    }>('/auth/me');
    const data = response.data;
    
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: mapRole(data.role),
      sponsorId: null,
      isActive: true,
      lastLoginAt: data.lastLoginAt,
    };
  },

  updateProfile: async (data: Partial<AdminUser>): Promise<AdminUser> => {
    const response = await api.patch('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.post('/auth/change-password', data);
  },
};
