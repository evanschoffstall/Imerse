import type {
  CampaignDashboard as PrismaCampaignDashboard,
  CampaignDashboardRole as PrismaCampaignDashboardRole,
  CampaignDashboardWidget as PrismaCampaignDashboardWidget,
  CampaignDashboardWidgetTag as PrismaCampaignDashboardWidgetTag,
} from "@prisma/client";

// Base types from Prisma
export type CampaignDashboard = PrismaCampaignDashboard;
export type CampaignDashboardWidget = PrismaCampaignDashboardWidget;
export type CampaignDashboardRole = PrismaCampaignDashboardRole;
export type CampaignDashboardWidgetTag = PrismaCampaignDashboardWidgetTag;

// Extended types with relations
export type CampaignDashboardWithRelations = CampaignDashboard & {
  campaign: {
    id: string;
    name: string;
    slug: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  widgets: CampaignDashboardWidgetWithRelations[];
  roles?: CampaignDashboardRole[];
};

export type CampaignDashboardWidgetWithRelations = CampaignDashboardWidget & {
  dashboard: {
    id: string;
    name: string;
  };
  tags?: Array<{
    id: string;
    tagId: string;
    tag: {
      id: string;
      name: string;
      color?: string;
    };
  }>;
};

// Widget types
export type WidgetType =
  | "calendar"
  | "events"
  | "characters"
  | "locations"
  | "quests"
  | "items"
  | "notes"
  | "journals"
  | "stats"
  | "recent"
  | "preview"
  | "map"
  | "timeline"
  | "families"
  | "organisations"
  | "creatures"
  | "abilities"
  | "dice-rolls"
  | "conversations"
  | "reminders"
  | "custom";

// Widget configuration types
export type WidgetConfig = {
  // Common config
  title?: string;
  refreshInterval?: number; // Auto-refresh in seconds

  // Entity filters
  entityTypes?: string[];
  tags?: string[];
  isPrivate?: boolean;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";

  // Calendar widget
  calendarId?: string;
  dateRange?: {
    start: string;
    end: string;
  };

  // Map widget
  mapId?: string;
  showMarkers?: boolean;

  // Stats widget
  statType?: "count" | "chart" | "progress";
  metrics?: string[];

  // Preview widget
  entityId?: string;
  entityType?: string;

  // Custom widget
  customContent?: string;
  customHTML?: string;
};

// Grid layout
export type GridLayout = {
  cols: number;
  rows: number;
  gap: number;
  cellSize: number;
};

// Form types
export type CreateDashboardInput = {
  name: string;
  description?: string;
  isDefault?: boolean;
  visibility?: string;
  layout?: GridLayout;
  campaignId: string;
};

export type UpdateDashboardInput = Partial<CreateDashboardInput> & {
  widgets?: CreateWidgetInput[];
};

export type CreateWidgetInput = {
  type: WidgetType;
  title: string;
  config?: WidgetConfig;
  x: number;
  y: number;
  width?: number;
  height?: number;
  dashboardId: string;
};

export type UpdateWidgetInput = Partial<CreateWidgetInput>;

// Filter types
export type DashboardFilters = {
  campaignId: string;
  visibility?: string;
  isDefault?: boolean;
};

// Widget library
export type WidgetDefinition = {
  type: WidgetType;
  name: string;
  description: string;
  icon: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultConfig?: WidgetConfig;
  category: "entities" | "calendar" | "stats" | "other";
};

export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  {
    type: "calendar",
    name: "Calendar",
    description: "Display campaign calendar with events",
    icon: "📅",
    defaultWidth: 6,
    defaultHeight: 4,
    category: "calendar",
  },
  {
    type: "events",
    name: "Upcoming Events",
    description: "List of upcoming campaign events",
    icon: "🎉",
    defaultWidth: 4,
    defaultHeight: 4,
    category: "calendar",
  },
  {
    type: "characters",
    name: "Characters",
    description: "List of campaign characters",
    icon: "👥",
    defaultWidth: 4,
    defaultHeight: 4,
    category: "entities",
  },
  {
    type: "locations",
    name: "Locations",
    description: "List of campaign locations",
    icon: "📍",
    defaultWidth: 4,
    defaultHeight: 4,
    category: "entities",
  },
  {
    type: "quests",
    name: "Quests",
    description: "Active and completed quests",
    icon: "⚔️",
    defaultWidth: 4,
    defaultHeight: 4,
    category: "entities",
  },
  {
    type: "stats",
    name: "Statistics",
    description: "Campaign statistics and charts",
    icon: "📊",
    defaultWidth: 4,
    defaultHeight: 3,
    category: "stats",
  },
  {
    type: "recent",
    name: "Recent Activity",
    description: "Recently created or updated entities",
    icon: "🕐",
    defaultWidth: 4,
    defaultHeight: 4,
    category: "other",
  },
  {
    type: "map",
    name: "Map",
    description: "Interactive campaign map",
    icon: "🗺️",
    defaultWidth: 6,
    defaultHeight: 6,
    category: "other",
  },
  {
    type: "timeline",
    name: "Timeline",
    description: "Campaign timeline visualization",
    icon: "⏳",
    defaultWidth: 6,
    defaultHeight: 4,
    category: "other",
  },
  {
    type: "notes",
    name: "Notes",
    description: "Quick access to notes",
    icon: "📝",
    defaultWidth: 4,
    defaultHeight: 4,
    category: "entities",
  },
  {
    type: "journals",
    name: "Journals",
    description: "Recent journal entries",
    icon: "📖",
    defaultWidth: 4,
    defaultHeight: 4,
    category: "entities",
  },
  {
    type: "creatures",
    name: "Creatures",
    description: "Campaign creatures and monsters",
    icon: "🐉",
    defaultWidth: 4,
    defaultHeight: 4,
    category: "entities",
  },
  {
    type: "dice-rolls",
    name: "Dice Rolls",
    description: "Recent dice rolls",
    icon: "🎲",
    defaultWidth: 4,
    defaultHeight: 4,
    category: "other",
  },
  {
    type: "reminders",
    name: "Reminders",
    description: "Upcoming reminders",
    icon: "🔔",
    defaultWidth: 4,
    defaultHeight: 4,
    category: "calendar",
  },
];
