import { QuestPlatform, QuestAction } from '../enum/quest';

export interface Quest {
  id: number;
  title: string;
  description: string;
  platform: QuestPlatform;
  action: QuestAction;
  targetUrl: string;
  rewardPoints: string; // BigInt serialized as string
  currentCompletions: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
