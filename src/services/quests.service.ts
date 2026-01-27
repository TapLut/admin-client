import api from '@/lib/api';
import { Quest, PaginatedResponse } from '@/types';

interface QuestsQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  platform?: string;
  isActive?: boolean;
  campaignId?: string;
}

interface CreateQuestData {
  title: string;
  description: string;
  type: string;
  platform: string;
  reward: number;
  verificationUrl?: string;
  metadata?: Record<string, unknown>;
  campaignId?: string;
  displayOrder?: number;
}

export const questsService = {
  getQuests: async (params: QuestsQuery): Promise<PaginatedResponse<Quest>> => {
    const response = await api.get('/quests', { params });
    return response.data;
  },

  getQuest: async (id: string): Promise<Quest> => {
    const response = await api.get(`/quests/${id}`);
    return response.data;
  },

  createQuest: async (data: CreateQuestData): Promise<Quest> => {
    const response = await api.post('/quests', data);
    return response.data;
  },

  updateQuest: async (id: string, data: Partial<CreateQuestData>): Promise<Quest> => {
    const response = await api.patch(`/quests/${id}`, data);
    return response.data;
  },

  deleteQuest: async (id: string): Promise<void> => {
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
