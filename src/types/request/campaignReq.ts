import { CampaignStatus } from '../enum/campaign';

export interface CreateCampaignReq {
  name: string;
  companyName: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  totalBudget: number;
  campaignType: string;
  platform: string;
  costPerAction: number;
  rewardPointsPerAction: number;
  sponsorId?: string | null;
  companyLogoUrl?: string;
  maxTotalActions?: number;
  targetAccounts?: string[];
}

export interface UpdateCampaignReq {
  name?: string;
  companyName?: string;
  description?: string;
  startsAt?: string;
  endsAt?: string;
  totalBudget?: number;
  campaignType?: string;
  platform?: string;
  costPerAction?: number;
  rewardPointsPerAction?: number;
  sponsorId?: string | null;
  companyLogoUrl?: string;
  maxTotalActions?: number;
  status?: CampaignStatus | string;
}

export interface CampaignsQueryReq {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sponsorId?: string;
}
