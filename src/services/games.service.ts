import api from '@/lib/api';
import {
  Game,
  GameTemplate,
  PaginatedResponse,
  GamesQueryReq,
  CreateGameReq,
  UpdateGameReq,
  GameStats,
  GameLeaderboardEntry,
} from '@/types';

export const gamesService = {
  getGames: async (params: GamesQueryReq): Promise<PaginatedResponse<Game>> => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null && v !== '')
    );
    const response = await api.get('/games', { params: cleanParams });
    return response.data;
  },

  getGame: async (id: number): Promise<Game> => {
    const response = await api.get(`/games/${id}`);
    return response.data;
  },

  createGame: async (data: CreateGameReq): Promise<Game> => {
    const response = await api.post('/games', data);
    return response.data;
  },

  updateGame: async (id: number, data: UpdateGameReq): Promise<Game> => {
    const response = await api.put(`/games/${id}`, data);
    return response.data;
  },

  deleteGame: async (id: number): Promise<void> => {
    await api.delete(`/games/${id}`);
  },

  duplicateGame: async (id: number): Promise<Game> => {
    const response = await api.post(`/games/${id}/duplicate`);
    return response.data;
  },

  getTemplates: async (): Promise<GameTemplate[]> => {
    const response = await api.get('/games/templates');
    return response.data;
  },

  getStats: async (): Promise<GameStats> => {
    const response = await api.get('/games/stats');
    return response.data;
  },

  getLeaderboard: async (gameId: number, limit?: number): Promise<GameLeaderboardEntry[]> => {
    const response = await api.get(`/games/${gameId}/leaderboard`, {
      params: { limit },
    });
    return response.data;
  },
};
