import { z } from "zod";

export type EntityType =
  | "campaign"
  | "character"
  | "location"
  | "item"
  | "quest"
  | "event"
  | "journal"
  | "note"
  | "family"
  | "race"
  | "organisation"
  | "tag"
  | "timeline"
  | "map";

export interface SearchResult {
  id: string;
  type: EntityType;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  campaignId?: string;
  campaign?: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
  // Additional type-specific fields for display
  title?: string; // For characters
  type_name?: string; // For items, quests, etc.
  color?: string; // For tags
  match?: "name" | "description" | "content"; // What matched
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  entityTypes?: EntityType[];
  campaignId?: string;
  page?: number;
  limit?: number;
  filters?: SearchFilterOptions;
  pagination?: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface SearchFilterOptions {
  includePrivate?: boolean;
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  sortBy?: "relevance" | "name" | "updated" | "created";
  sortOrder?: "asc" | "desc";
}

export interface SearchFilters {
  query: string;
  campaignId?: string;
  entityTypes?: EntityType[];
  page?: number;
  limit?: number;
  sortBy?: "relevance" | "name" | "updated" | "created";
  sortOrder?: "asc" | "desc";
  includePrivate?: boolean;
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
}

export const searchQuerySchema = z.object({
  query: z.string().min(1, "Search query is required"),
  campaignId: z.string().optional(),
  entityTypes: z
    .array(
      z.enum([
        "campaign",
        "character",
        "location",
        "item",
        "quest",
        "event",
        "journal",
        "note",
        "family",
        "race",
        "organisation",
        "tag",
        "timeline",
        "map",
      ])
    )
    .optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  sortBy: z
    .enum(["relevance", "name", "updated", "created"])
    .optional()
    .default("relevance"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

// Entity type display names
export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  campaign: "Campaign",
  character: "Character",
  location: "Location",
  item: "Item",
  quest: "Quest",
  event: "Event",
  journal: "Journal",
  note: "Note",
  family: "Family",
  race: "Race",
  organisation: "Organisation",
  tag: "Tag",
  timeline: "Timeline",
  map: "Map",
};

// Entity type icons (can be used with icon libraries)
export const ENTITY_TYPE_ICONS: Record<EntityType, string> = {
  campaign: "🏰",
  character: "👤",
  location: "📍",
  item: "📦",
  quest: "🎯",
  event: "📅",
  journal: "📖",
  note: "📝",
  family: "👨‍👩‍👧‍👦",
  race: "🧬",
  organisation: "🏢",
  tag: "🏷️",
  timeline: "⏱️",
  map: "🗺️",
};
