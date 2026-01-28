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
    createdAt: string;
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

interface InviteUserDto {
  email: string;
  name: string;
  role: AdminRole;
  sponsorId?: number;
}

interface SetupPasswordDto {
  token: string;
  password: string;
}

interface UpdateAdminDto {
  name?: string;
  role?: AdminRole;
  isActive?: boolean;
}

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
        createdAt: admin.createdAt,
      },
    };
  },

  invite: async (data: InviteUserDto): Promise<{ inviteLink: string; token: string }> => {
    const response = await api.post<{ inviteLink: string; token: string }>('/auth/invite', data);
    return response.data;
  },

  setupPassword: async (data: SetupPasswordDto): Promise<void> => {
    await api.post('/auth/setup-password', data);
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
    }
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
      lastLoginIp: string | null;
      createdAt: string;
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
      lastLoginIp: data.lastLoginIp,
      createdAt: data.createdAt,
    };
  },

  updateProfile: async (data: Partial<AdminUser>): Promise<AdminUser> => {
    const response = await api.patch('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.post('/auth/change-password', {
      currentPassword: data.currentPassword,
      password: data.newPassword,
    });
  },

  getMembers: async (): Promise<AdminUser[]> => {
    const response = await api.get<AdminUser[]>('/auth/members');
    return response.data.map(admin => ({
      ...admin,
      role: mapRole(admin.role as any),
    }));
  },

  updateMember: async (id: number, data: UpdateAdminDto): Promise<void> => {
    await api.patch(`/auth/members/${id}`, data);
  },

  deleteMember: async (id: number): Promise<void> => {
    await api.delete(`/auth/members/${id}`);
  },

  resendInvite: async (id: number): Promise<void> => {
    await api.post(`/auth/members/${id}/resend-invite`);
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (data: SetupPasswordDto): Promise<void> => {
    await api.post('/auth/reset-password', data);
  },
};
