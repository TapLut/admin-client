import { GameTemplateType, GameDifficulty, GameStatus } from '../enum/game';
import { GameConfig, RewardTiers } from '../dto/game';

export interface GamesQueryReq {
  search?: string;
  templateType?: GameTemplateType;
  status?: GameStatus;
  difficulty?: GameDifficulty;
  isActive?: boolean;
  isPvpEnabled?: boolean;
  sponsorId?: number;
  page?: number;
  limit?: number;
}

export interface CreateGameReq {
  name: string;
  description?: string;
  thumbnailUrl?: string;
  templateType: GameTemplateType;
  difficulty?: GameDifficulty;
  status?: GameStatus;
  config?: GameConfig;
  rewardPointsBase?: number;
  rewardPointsBonus?: number;
  rewardTickets?: number;
  rewardTiers?: RewardTiers;
  dailyPlayLimit?: number;
  totalPlayLimit?: number;
  isActive?: boolean;
  startsAt?: string;
  expiresAt?: string;
  isPvpEnabled?: boolean;
  pvpMaxPlayers?: number;
  pvpMatchDuration?: number;
  campaignId?: number;
}

export interface UpdateGameReq extends Partial<CreateGameReq> {
  displayOrder?: number;
}
