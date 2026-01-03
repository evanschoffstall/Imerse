// Campaign types - extending from Prisma types
import type { Campaign as PrismaCampaign, User as PrismaUser } from '@prisma/client';

// Base Campaign type from Prisma with relations
export interface Campaign extends PrismaCampaign {
  owner: Pick<PrismaUser, 'id' | 'name' | 'email'>;
}

// Form data types
export interface CampaignFormData {
  name: string;
  description?: string;
  image?: string;
}

// API request types
export interface CreateCampaignRequest {
  name: string;
  description?: string;
  image?: string;
}

export interface UpdateCampaignRequest {
  name?: string;
  description?: string;
  image?: string;
}

// API response types
export interface CampaignsResponse {
  campaigns: Campaign[];
}

export interface CampaignResponse {
  campaign: Campaign;
}
