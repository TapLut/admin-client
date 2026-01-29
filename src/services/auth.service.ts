import api from '@/lib/api';
import { AdminUser } from '@/types/dto/admin';
import LoginResponse from '@/types/dto/loginResponse';
import { AdminRole } from '@/types/enum/adminRole';
import ChangePasswordReq from '@/types/request/changePasswordReq';
import InviteUserReq from '@/types/request/inviteUserReq';
import LoginCredentialsReq from '@/types/request/loginCredentialsReq';
import SetupPasswordReq from '@/types/request/setupPasswordReq';
import UpdateAdminReq from '@/types/request/updateAdminReq';
import ServerAuthResponse from '@/types/response/serverAuthResponse';
import { ServerAdminUserResponse } from '@/types/response/serverAdminUserResponse';

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

// Helper to transform server response to strongly typed AdminUser
const transformAdminUser = (data: ServerAdminUserResponse): AdminUser => {
  const role = mapRole(data.role);
  
  const baseUser = {
    id: data.id,
    email: data.email,
    name: data.name,
    avatarUrl: data.avatarUrl,
    isActive: true, // simplified, assuming active if logged in/fetched
    lastLoginAt: data.lastLoginAt || new Date().toISOString(),
    lastLoginIp: data.lastLoginIp,
    createdAt: data.createdAt,
  };

  if (role === AdminRole.SPONSOR) {
    return {
      ...baseUser,
      role: AdminRole.SPONSOR,
      sponsorId: data.sponsorId ?? 0, // Ensure strictly number
      sponsorName: data.sponsorName ?? 'Unknown',
      sponsorLogo: data.sponsorLogo,
    };
  }
  
  if (role === AdminRole.SUPER_ADMIN) {
    return {
      ...baseUser,
      role: AdminRole.SUPER_ADMIN,
    };
  }

  if (role === AdminRole.MODERATOR) {
    return {
      ...baseUser,
      role: AdminRole.MODERATOR,
    };
  }

  // Default to Regular Admin (including Moderator mapped to Admin if needed, or if regular Admin)
  return {
    ...baseUser,
    role: AdminRole.ADMIN,
  };
};

export const authService = {
  login: async (credentials: LoginCredentialsReq): Promise<LoginResponse> => {
    const response = await api.post<ServerAuthResponse>('/auth/login', credentials);
    const { accessToken, refreshToken, admin } = response.data;
    
    // Transform server response to client format - add lastLoginAt which is required
    return {
      accessToken,
      refreshToken,
      user: transformAdminUser({
        ...admin,
        lastLoginAt: admin.lastLoginAt ?? null,
      }),
    };
  },

  invite: async (data: InviteUserReq): Promise<{ inviteLink: string; token: string }> => {
    const response = await api.post<{ inviteLink: string; token: string }>('/auth/invite', data);
    return response.data;
  },

  setupPassword: async (data: SetupPasswordReq): Promise<void> => {
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
    const response = await api.get<ServerAdminUserResponse>('/auth/me');
    return transformAdminUser(response.data);
  },

  updateProfile: async (data: Partial<AdminUser> & { avatarUrl?: string }): Promise<AdminUser> => {
    const response = await api.patch<ServerAdminUserResponse>('/auth/profile', data);
    return transformAdminUser(response.data);
  },

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ avatarUrl: string }>('/auth/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  changePassword: async (data: ChangePasswordReq): Promise<void> => {
    await api.post('/auth/change-password', {
      currentPassword: data.currentPassword,
      password: data.newPassword,
    });
  },

  getMembers: async (): Promise<AdminUser[]> => {
    const response = await api.get<ServerAdminUserResponse[]>('/auth/members');
    return response.data.map(transformAdminUser);
  },

  updateMember: async (id: number, data: UpdateAdminReq): Promise<void> => {
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

  resetPassword: async (data: SetupPasswordReq): Promise<void> => {
    await api.post('/auth/reset-password', data);
  },
};
