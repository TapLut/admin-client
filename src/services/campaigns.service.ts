import api from '@/lib/api';
import {
  Campaign,
  PaginatedResponse,
  CampaignsQueryReq,
  CreateCampaignReq,
  UpdateCampaignReq,
} from '@/types';

export const campaignsService = {
  getCampaigns: async (params: CampaignsQueryReq): Promise<PaginatedResponse<Campaign>> => {
    const response = await api.get('/campaigns', { params });
    return response.data;
  },

  getCampaign: async (id: number): Promise<Campaign> => {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
  },

  createCampaign: async (data: CreateCampaignReq): Promise<Campaign> => {
    const response = await api.post('/campaigns', data);
    return response.data;
  },

  updateCampaign: async (id: number, data: UpdateCampaignReq): Promise<Campaign> => {
    const response = await api.put(`/campaigns/${id}`, data);
    return response.data;
  },

  deleteCampaign: async (id: number): Promise<void> => {
    await api.delete(`/campaigns/${id}`);
  },

  updateCampaignStatus: async (id: number, status: string): Promise<Campaign> => {
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
