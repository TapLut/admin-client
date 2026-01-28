import api from '@/lib/api';
import { Quest, PaginatedResponse } from '@/types';

interface QuestsQuery {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  platform?: string;
  isActive?: boolean;
  campaignId?: number;
}

interface CreateQuestData {
  title: string;
  description: string;
  action: string;
  platform: string;
  rewardPoints: string;
  targetUrl: string;
  targetAccount: string;
  campaignId?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export const questsService = {
  getQuests: async (params: QuestsQuery): Promise<PaginatedResponse<Quest>> => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null && v !== '')
    );
    const response = await api.get('/quests', { params: cleanParams });
    return response.data;
  },

  getQuest: async (id: number): Promise<Quest> => {
    const response = await api.get(`/quests/${id}`);
    return response.data;
  },

  createQuest: async (data: CreateQuestData): Promise<Quest> => {
    const response = await api.post('/quests', data);
    return response.data;
  },

  updateQuest: async (id: number, data: Partial<CreateQuestData>): Promise<Quest> => {
    const response = await api.put(`/quests/${id}`, data);
    return response.data;
  },

  deleteQuest: async (id: number): Promise<void> => {
    await api.delete(`/quests/${id}`);
  },

  toggleQuestActive: async (id: string, isActive: boolean): Promise<Quest> => {
    const response = await api.patch(`/quests/${id}/toggle`, { isActive });
    return response.data;
  },

  reorderQuests: async (orders: { id: string; displayOrder: number }[]): Promise<void> => {
    await api.post('/quests/reorder', { orders });
  },

  getQuestStats: async (): Promise<{
    totalQuests: number;
    activeQuests: number;
    totalCompletions: number;
    totalRewardsDistributed: number;
  }> => {
    const response = await api.get('/quests/stats');
    return response.data;
  },
};
