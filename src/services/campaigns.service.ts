import api from '@/lib/api';
import { Campaign, PaginatedResponse } from '@/types';

interface CampaignsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sponsorId?: string;
}

interface CreateCampaignData {
  name: string;
  description: string;
  sponsorId: string;
  startDate: string;
  endDate: string;
  budget: number;
  metadata?: Record<string, unknown>;
}

export const campaignsService = {
  getCampaigns: async (params: CampaignsQuery): Promise<PaginatedResponse<Campaign>> => {
    const response = await api.get('/campaigns', { params });
    return response.data;
  },

  getCampaign: async (id: string): Promise<Campaign> => {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
  },

  createCampaign: async (data: CreateCampaignData): Promise<Campaign> => {
    const response = await api.post('/campaigns', data);
    return response.data;
  },

  updateCampaign: async (id: string, data: Partial<CreateCampaignData>): Promise<Campaign> => {
    const response = await api.patch(`/campaigns/${id}`, data);
    return response.data;
  },

  deleteCampaign: async (id: string): Promise<void> => {
    await api.delete(`/campaigns/${id}`);
  },

  updateCampaignStatus: async (id: string, status: string): Promise<Campaign> => {
    const response = await api.patch(`/campaigns/${id}/status`, { status });
    return response.data;
  },

  getCampaignStats: async (): Promise<{
    totalCampaigns: number;
    activeCampaigns: number;
    totalBudget: number;
    totalSpent: number;
  }> => {
    const response = await api.get('/campaigns/stats');
    return response.data;
  },
};
