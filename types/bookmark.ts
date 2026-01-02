// Bookmark Types (Phase 24)

export interface Bookmark {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  type: BookmarkType;
  config: BookmarkConfig;
  folder: string | null;
  position: number;
  campaignId: string;
  userId: string;
  characterId: string | null;
  locationId: string | null;
  itemId: string | null;
  questId: string | null;
  eventId: string | null;
  journalId: string | null;
  familyId: string | null;
  organisationId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookmarkWithRelations extends Bookmark {
  campaign?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  character?: {
    id: string;
    name: string;
  };
  location?: {
    id: string;
    name: string;
  };
  item?: {
    id: string;
    name: string;
  };
  quest?: {
    id: string;
    name: string;
  };
  event?: {
    id: string;
    name: string;
  };
  journal?: {
    id: string;
    name: string;
  };
  family?: {
    id: string;
    name: string;
  };
  organisation?: {
    id: string;
    name: string;
  };
}

// Bookmark Types

export type BookmarkType = "entity" | "search" | "filter" | "random";

export const BOOKMARK_TYPES = {
  ENTITY: "entity",
  SEARCH: "search",
  FILTER: "filter",
  RANDOM: "random",
} as const;

export const BOOKMARK_TYPE_LABELS: Record<BookmarkType, string> = {
  entity: "Direct Link",
  search: "Search Query",
  filter: "Filter Preset",
  random: "Random Entity",
};

// Bookmark Configuration

export interface BookmarkConfig {
  // For entity type
  entityType?: string; // character, location, etc.
  entityId?: string;

  // For search type
  searchQuery?: string;
  searchFilters?: Record<string, any>;

  // For filter type
  filterType?: string; // entity type to filter
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: "asc" | "desc";

  // For random type
  randomType?: string; // entity type
  randomFilters?: Record<string, any>;

  // Common
  url?: string; // Full URL for the bookmark
}

// Icon Constants

export const DEFAULT_ICONS: Record<string, string> = {
  character: "👤",
  location: "📍",
  item: "🎒",
  quest: "⚔️",
  event: "📅",
  journal: "📖",
  family: "👨‍👩‍👧‍👦",
  organisation: "🏛️",
  race: "🧬",
  search: "🔍",
  filter: "🔧",
  random: "🎲",
};

export const AVAILABLE_ICONS = [
  "⭐",
  "❤️",
  "🔥",
  "💡",
  "📌",
  "🎯",
  "🏆",
  "🎨",
  "🎭",
  "🎪",
  "📚",
  "📝",
  "📋",
  "📊",
  "📈",
  "📉",
  "🗂️",
  "🗄️",
  "🗃️",
  "🗺️",
  "⚔️",
  "🛡️",
  "🏹",
  "🗡️",
  "🪓",
  "🔱",
  "⚡",
  "🔮",
  "💎",
  "👑",
  "🏰",
  "🏛️",
  "🏠",
  "🏔️",
  "🌲",
  "🌊",
  "🔥",
  "💨",
  "⚡",
  "🌙",
  "👤",
  "👥",
  "👨‍👩‍👧‍👦",
  "🧙",
  "🧝",
  "🧛",
  "🧟",
  "👹",
  "👺",
  "👻",
];

// Color Constants

export const DEFAULT_COLORS: Record<string, string> = {
  red: "#ef4444",
  orange: "#f97316",
  amber: "#f59e0b",
  yellow: "#eab308",
  lime: "#84cc16",
  green: "#22c55e",
  emerald: "#10b981",
  teal: "#14b8a6",
  cyan: "#06b6d4",
  sky: "#0ea5e9",
  blue: "#3b82f6",
  indigo: "#6366f1",
  violet: "#8b5cf6",
  purple: "#a855f7",
  fuchsia: "#d946ef",
  pink: "#ec4899",
  rose: "#f43f5e",
};

// Helper Functions

export function getBookmarkIcon(bookmark: Bookmark): string {
  if (bookmark.icon) return bookmark.icon;

  if (bookmark.type === "entity") {
    const entityType = getBookmarkEntityType(bookmark);
    return (entityType && DEFAULT_ICONS[entityType]) || "🔗";
  }

  return DEFAULT_ICONS[bookmark.type] || "🔖";
}

export function getBookmarkColor(bookmark: Bookmark): string {
  return bookmark.color || "#3b82f6"; // Default blue
}

export function getBookmarkEntityType(bookmark: Bookmark): string | null {
  if (bookmark.characterId) return "character";
  if (bookmark.locationId) return "location";
  if (bookmark.itemId) return "item";
  if (bookmark.questId) return "quest";
  if (bookmark.eventId) return "event";
  if (bookmark.journalId) return "journal";
  if (bookmark.familyId) return "family";
  if (bookmark.organisationId) return "organisation";
  return null;
}

export function getBookmarkEntityId(bookmark: Bookmark): string | null {
  if (bookmark.characterId) return bookmark.characterId;
  if (bookmark.locationId) return bookmark.locationId;
  if (bookmark.itemId) return bookmark.itemId;
  if (bookmark.questId) return bookmark.questId;
  if (bookmark.eventId) return bookmark.eventId;
  if (bookmark.journalId) return bookmark.journalId;
  if (bookmark.familyId) return bookmark.familyId;
  if (bookmark.organisationId) return bookmark.organisationId;
  return null;
}

export function getBookmarkUrl(bookmark: Bookmark): string {
  if (bookmark.config.url) {
    return bookmark.config.url;
  }

  const entityType = getBookmarkEntityType(bookmark);
  const entityId = getBookmarkEntityId(bookmark);

  if (entityType && entityId) {
    return `/${entityType}s/${entityId}`;
  }

  if (bookmark.type === "search") {
    const query = bookmark.config.searchQuery || "";
    return `/search?q=${encodeURIComponent(query)}&campaignId=${
      bookmark.campaignId
    }`;
  }

  if (bookmark.type === "filter" && bookmark.config.filterType) {
    const filters = new URLSearchParams(bookmark.config.filters || {});
    return `/${bookmark.config.filterType}s?${filters.toString()}&campaignId=${
      bookmark.campaignId
    }`;
  }

  if (bookmark.type === "random" && bookmark.config.randomType) {
    return `/${bookmark.config.randomType}s?random=true&campaignId=${bookmark.campaignId}`;
  }

  return "#";
}

export function getBookmarkTypeLabel(type: BookmarkType): string {
  return BOOKMARK_TYPE_LABELS[type] || type;
}

export function groupBookmarksByFolder(
  bookmarks: Bookmark[]
): Record<string, Bookmark[]> {
  const grouped: Record<string, Bookmark[]> = {
    _root: [], // Bookmarks without folder
  };

  for (const bookmark of bookmarks) {
    const folder = bookmark.folder || "_root";
    if (!grouped[folder]) {
      grouped[folder] = [];
    }
    grouped[folder].push(bookmark);
  }

  // Sort within each folder by position
  for (const folder in grouped) {
    grouped[folder].sort((a, b) => a.position - b.position);
  }

  return grouped;
}

export function sortBookmarks(
  bookmarks: Bookmark[],
  sortBy: "name" | "date" | "position" = "position"
): Bookmark[] {
  return [...bookmarks].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "date") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.position - b.position;
  });
}

export function validateBookmark(bookmark: Partial<Bookmark>): string[] {
  const errors: string[] = [];

  if (!bookmark.name?.trim()) {
    errors.push("Bookmark name is required");
  }

  if (!bookmark.type) {
    errors.push("Bookmark type is required");
  }

  if (bookmark.type === "entity") {
    const hasEntity =
      bookmark.characterId ||
      bookmark.locationId ||
      bookmark.itemId ||
      bookmark.questId ||
      bookmark.eventId ||
      bookmark.journalId ||
      bookmark.familyId ||
      bookmark.organisationId;

    if (!hasEntity) {
      errors.push("Entity bookmark must have an entity selected");
    }
  }

  if (bookmark.type === "search" && !bookmark.config?.searchQuery) {
    errors.push("Search bookmark must have a search query");
  }

  if (bookmark.type === "filter" && !bookmark.config?.filterType) {
    errors.push("Filter bookmark must have a filter type");
  }

  if (bookmark.type === "random" && !bookmark.config?.randomType) {
    errors.push("Random bookmark must have a random type");
  }

  return errors;
}

export function createBookmarkFromEntity(
  entityType: string,
  entityId: string,
  entityName: string,
  campaignId: string,
  userId: string
): Partial<Bookmark> {
  return {
    name: entityName,
    type: "entity",
    icon: DEFAULT_ICONS[entityType],
    config: {
      entityType,
      entityId,
      url: `/${entityType}s/${entityId}`,
    },
    campaignId,
    userId,
    [`${entityType}Id`]: entityId,
  };
}
