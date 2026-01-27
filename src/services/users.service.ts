import api from '@/lib/api';
import { User, PaginatedResponse } from '@/types';

interface UsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  minLevel?: number;
  maxLevel?: number;
  createdAfter?: string;
  createdBefore?: string;
}

export const usersService = {
  getUsers: async (params: UsersQuery): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getUser: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  getUserStats: async (): Promise<{
    totalUsers: number;
    newUsersToday: number;
    activeUsers: number;
    averageLevel: number;
  }> => {
    const response = await api.get('/users/stats');
    return response.data;
  },

  getUserActivity: async (id: string): Promise<{
    lastLogin: string;
    totalLogins: number;
    questsCompleted: number;
    ordersPlaced: number;
  }> => {
    const response = await api.get(`/users/${id}/activity`);
    return response.data;
  },
};
