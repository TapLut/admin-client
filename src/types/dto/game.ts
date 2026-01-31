import { GameTemplateType, GameDifficulty, GameStatus } from '../enum/game';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  timePerQuestion?: number;
}

export interface RewardTier {
  minScore: number;
  points: number;
}

export interface GameConfig {
  // Common settings
  timeLimit?: number;
  maxAttempts?: number;
  showLeaderboard?: boolean;

  // Memory game config
  gridSize?: number;
  cardImages?: string[];

  // Quiz config
  questions?: QuizQuestion[];

  // Reaction game config
  targetTime?: number;
  tolerance?: number;

  // Tetris config
  speed?: number;
  linesToClear?: number;

  // Catch game config
  itemsToCollect?: number;
  fallSpeed?: number;

  // Advertisement settings
  adBannerUrl?: string;
  adBannerLink?: string;
  showAdAfterGame?: boolean;
}

export interface RewardTiers {
  bronze?: RewardTier;
  silver?: RewardTier;
  gold?: RewardTier;
}

export interface Game {
  id: number;
  name: string;
  description: string | null;
  thumbnailUrl: string | null;
  templateType: GameTemplateType;
  difficulty: GameDifficulty;
  status: GameStatus;
  config: GameConfig;
  rewardPointsBase: string;
  rewardPointsBonus: string;
  rewardTickets: number;
  rewardTiers: RewardTiers;
  dailyPlayLimit: number | null;
  totalPlayLimit: number | null;
  totalPlays: number;
  uniquePlayers: number;
  isActive: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  isPvpEnabled: boolean;
  pvpMaxPlayers: number;
  pvpMatchDuration: number | null;
  campaignId: number | null;
  createdById: number | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface GameTemplate {
  type: GameTemplateType;
  name: string;
  description: string;
  defaultConfig: Record<string, unknown>;
}

export interface GameStats {
  totalGames: number;
  activeGames: number;
  totalPlays: number;
  uniquePlayers: number;
  byTemplateType: Record<string, number>;
}

export interface GameLeaderboardEntry {
  id: number;
  gameId: number;
  userId: number;
  highScore: number;
  totalPlays: number;
  totalScore: number;
  wins: number;
  losses: number;
  user?: {
    id: number;
    username: string;
    profileImageUrl?: string;
  };
}
