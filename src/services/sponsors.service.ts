import api from '@/lib/api';
import { AdminRole } from '@/types';

export interface Sponsor {
  id: number;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: AdminRole;
  sponsorId: number | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SponsorsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface InviteSponsorRequest {
  email: string;
  name: string;
  companyName?: string;
}

export interface SponsorsResponse {
  items: Sponsor[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const sponsorsService = {
  /**
   * Get list of sponsors (admin users with role = SPONSOR)
   */
  getSponsors: async (params: SponsorsQueryParams = {}): Promise<Sponsor[]> => {
    const response = await api.get('/auth/members', {
      params: {
        role: AdminRole.SPONSOR,
      },
    });
    // Filter by search and isActive on the client side for now
    let sponsors = response.data as Sponsor[];
    
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      sponsors = sponsors.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.email.toLowerCase().includes(searchLower)
      );
    }
    
    if (params.isActive !== undefined) {
      sponsors = sponsors.filter((s) => s.isActive === params.isActive);
    }
    
    return sponsors;
  },

  /**
   * Invite a new sponsor
   */
  inviteSponsor: async (data: InviteSponsorRequest): Promise<{ inviteLink: string; token: string }> => {
    const response = await api.post('/auth/invite', {
      email: data.email,
      name: data.name,
      role: AdminRole.SPONSOR,
    });
    return response.data;
  },

  /**
   * Deactivate a sponsor
   */
  deactivateSponsor: async (id: number): Promise<void> => {
    await api.patch(`/auth/members/${id}`, { isActive: false });
  },

  /**
   * Reactivate a sponsor
   */
  reactivateSponsor: async (id: number): Promise<void> => {
    await api.patch(`/auth/members/${id}`, { isActive: true });
  },

  /**
   * Resend invite email to a sponsor
   */
  resendInvite: async (email: string, name: string): Promise<{ inviteLink: string; token: string }> => {
    // This will create a new invite token and send email again
    const response = await api.post('/auth/resend-invite', {
      email,
      name,
    });
    return response.data;
  },
};
