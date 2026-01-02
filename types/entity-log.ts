import type {
  EntityLog as PrismaEntityLog,
  UserLog as PrismaUserLog,
} from "@/generated/prisma/client";

// Base types from Prisma
export type EntityLog = PrismaEntityLog;
export type UserLog = PrismaUserLog;

// Extended types with relations
export type EntityLogWithRelations = EntityLog & {
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
  campaign: {
    id: string;
    name: string;
    slug: string;
  };
};

export type UserLogWithRelations = UserLog & {
  user: {
    id: string;
    name: string;
    email: string;
  };
};

// Action types
export type EntityAction = "create" | "update" | "delete" | "restore";
export type UserAction =
  | "login"
  | "logout"
  | "password_change"
  | "email_change"
  | "profile_update"
  | "register"
  | "email_verify"
  | "password_reset";

// Change tracking
export type EntityChanges = {
  before?: Record<string, any>;
  after?: Record<string, any>;
  fields?: string[]; // List of changed fields
  diff?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
};

// Form types
export type CreateEntityLogInput = {
  entityType: string;
  entityId: string;
  action: EntityAction;
  changes: EntityChanges;
  campaignId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
};

export type CreateUserLogInput = {
  action: UserAction;
  details: Record<string, any>;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
};

// Filter types
export type EntityLogFilters = {
  entityType?: string;
  entityId?: string;
  action?: EntityAction;
  userId?: string;
  campaignId?: string;
  startDate?: string;
  endDate?: string;
};

export type UserLogFilters = {
  userId?: string;
  action?: UserAction;
  startDate?: string;
  endDate?: string;
};

// Activity timeline
export type ActivityTimelineItem = {
  id: string;
  type: "entity" | "user";
  action: EntityAction | UserAction;
  timestamp: Date;
  user?: {
    id: string;
    name: string;
  };
  entity?: {
    type: string;
    id: string;
    name?: string;
  };
  changes?: EntityChanges;
  description: string; // Human-readable description
};

// History view
export type EntityHistory = {
  entityType: string;
  entityId: string;
  entityName?: string;
  logs: EntityLogWithRelations[];
  totalChanges: number;
  firstCreated: Date;
  lastModified: Date;
  contributors: Array<{
    id: string;
    name: string;
    changeCount: number;
  }>;
};

// Rollback (future feature)
export type RollbackRequest = {
  logId: string;
  entityType: string;
  entityId: string;
  targetVersion?: string;
};

// Statistics
export type LogStatistics = {
  totalLogs: number;
  byAction: Record<string, number>;
  byEntityType: Record<string, number>;
  byUser: Record<string, number>;
  recentActivity: ActivityTimelineItem[];
  topContributors: Array<{
    userId: string;
    userName: string;
    count: number;
  }>;
};

// Utility types for logging
export type LoggableEntity =
  | "character"
  | "location"
  | "item"
  | "quest"
  | "event"
  | "journal"
  | "note"
  | "family"
  | "organisation"
  | "race"
  | "tag"
  | "timeline"
  | "map"
  | "calendar"
  | "ability"
  | "creature"
  | "dice-roll"
  | "conversation"
  | "post"
  | "reminder"
  | "whiteboard"
  | "dashboard";

// Action descriptions for UI
export const ACTION_DESCRIPTIONS: Record<EntityAction, string> = {
  create: "created",
  update: "updated",
  delete: "deleted",
  restore: "restored",
};

export const USER_ACTION_DESCRIPTIONS: Record<UserAction, string> = {
  login: "logged in",
  logout: "logged out",
  password_change: "changed password",
  email_change: "changed email",
  profile_update: "updated profile",
  register: "registered",
  email_verify: "verified email",
  password_reset: "reset password",
};

// Helper function types
export type LoggingOptions = {
  includeIp?: boolean;
  includeUserAgent?: boolean;
  captureFullSnapshot?: boolean; // Capture complete entity state
  excludeFields?: string[]; // Fields to exclude from logging
};

export type DiffOptions = {
  ignoreCase?: boolean;
  ignoreWhitespace?: boolean;
  deepCompare?: boolean;
};
