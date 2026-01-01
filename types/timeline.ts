export interface Timeline {
  id: string;
  name: string;
  slug: string;
  type?: string;
  description?: string;
  image?: string;
  startDate?: string | null; // Flexible date format for timeline range
  endDate?: string | null; // Flexible date format for timeline range
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  campaignId: string;
  campaign?: {
    id: string;
    name: string;
  };
  createdById: string;
  createdBy?: {
    id: string;
    name?: string;
    email: string;
  };
  events?: Array<{
    id: string;
    name: string;
    date?: string | null;
    calendarDate?: string | null;
    type?: string | null;
  }>;
}

export interface TimelineFormData {
  name: string;
  type?: string;
  description?: string;
  image?: string;
  startDate?: string;
  endDate?: string;
  isPrivate?: boolean;
}

export const TIMELINE_TYPES = [
  "Historical",
  "Campaign",
  "Character",
  "World Events",
  "Faction",
  "War",
  "Dynasty",
  "Technology",
  "Magic",
  "Religion",
  "Political",
  "Economic",
  "Cultural",
  "Natural",
  "Other",
] as const;

export type TimelineType = (typeof TIMELINE_TYPES)[number];
