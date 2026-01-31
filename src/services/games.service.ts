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
  GameAsset,
  GameAssetQueryReq,
  CreateGameAssetReq,
  UpdateGameAssetReq,
  BulkCreateGameAssetsReq,
  TemplateRequirement,
  GameAssetValidation,
  GameTemplateType,
} from '@/types';

export const gamesService = {
  // ============== Game CRUD ==============
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

  // ============== Game Assets ==============
  getAssets: async (params: GameAssetQueryReq): Promise<PaginatedResponse<GameAsset>> => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null && v !== '')
    );
    const response = await api.get('/game-assets', { params: cleanParams });
    return response.data;
  },

  getAssetsByGame: async (gameId: number): Promise<GameAsset[]> => {
    const response = await api.get(`/game-assets/game/${gameId}`);
    return response.data;
  },

  getAsset: async (id: number): Promise<GameAsset> => {
    const response = await api.get(`/game-assets/${id}`);
    return response.data;
  },

  createAsset: async (data: CreateGameAssetReq): Promise<GameAsset> => {
    const response = await api.post('/game-assets', data);
    return response.data;
  },

  createAssetsBulk: async (data: BulkCreateGameAssetsReq): Promise<GameAsset[]> => {
    const response = await api.post('/game-assets/bulk', data);
    return response.data;
  },

  updateAsset: async (id: number, data: UpdateGameAssetReq): Promise<GameAsset> => {
    const response = await api.put(`/game-assets/${id}`, data);
    return response.data;
  },

  deleteAsset: async (id: number): Promise<void> => {
    await api.delete(`/game-assets/${id}`);
  },

  deleteAssetsByGame: async (gameId: number): Promise<void> => {
    await api.delete(`/game-assets/game/${gameId}`);
  },

  reorderAssets: async (gameId: number, assetIds: number[]): Promise<void> => {
    await api.post(`/game-assets/game/${gameId}/reorder`, { assetIds });
  },

  getTemplateRequirements: async (): Promise<Record<GameTemplateType, TemplateRequirement>> => {
    const response = await api.get('/game-assets/template-requirements');
    return response.data;
  },

  validateGameAssets: async (gameId: number): Promise<GameAssetValidation> => {
    const response = await api.get(`/game-assets/game/${gameId}/validate`);
    return response.data;
  },
};
