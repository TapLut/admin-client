import { CampaignStatus } from '../enum/campaign';

export interface Campaign {
  id: number;
  name: string;
  companyName: string;
  companyLogoUrl?: string;
  description: string;
  status: CampaignStatus;
  startsAt: string;
  endsAt: string;
  totalBudget: number;
  spentBudget: number;
  campaignType: string;
  platform: string;
  completedActions: number;
  maxTotalActions?: number;
  costPerAction: number;
  rewardPointsPerAction: number;

  // UI/Mock fields that might not be in basic entity response yet
  productCount?: number;
  roi?: number;

  createdAt: string;
  updatedAt: string;
}
