export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  ownerId: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignFormData {
  name: string;
  description?: string;
  image?: string;
}

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
