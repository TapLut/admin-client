import { QuestPlatform, QuestAction } from '../enum/quest';

export interface CreateQuestReq {
  title: string;
  description: string;
  action: QuestAction | string;
  platform: QuestPlatform | string;
  rewardPoints: string;
  targetUrl: string;
  targetAccount: string;
  campaignId?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateQuestReq {
  title?: string;
  description?: string;
  action?: QuestAction | string;
  platform?: QuestPlatform | string;
  rewardPoints?: string;
  targetUrl?: string;
  targetAccount?: string;
  campaignId?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export interface QuestsQueryReq {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  platform?: string;
  isActive?: boolean;
  campaignId?: number;
}
