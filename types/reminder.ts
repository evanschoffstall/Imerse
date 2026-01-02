import type {
  EntityEventType as PrismaEntityEventType,
  Reminder as PrismaReminder,
} from "@/generated/prisma/client";
import type { RecurrenceRule, RecurrenceType } from "./event";

// Base types from Prisma
export type Reminder = PrismaReminder;
export type EntityEventType = PrismaEntityEventType;

// Re-export recurrence types from event for compatibility
export type { RecurrenceRule, RecurrenceType };

// Extended types with relations
export type ReminderWithRelations = Reminder & {
  eventType: EntityEventType;
  calendar?: {
    id: string;
    name: string;
    slug: string;
  } | null;
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
};

// Form types
export type CreateReminderInput = {
  name: string;
  description?: string;
  entityType: string; // character, location, event, quest, etc.
  entityId: string;
  eventTypeId: string;
  calendarId?: string;
  calendarDate?: string; // YYYY-MM-DD format
  isRecurring?: boolean;
  recurrenceRule?: RecurrenceRule;
  notifyBefore?: number; // Days before to notify
  isNotification?: boolean;
  campaignId: string;
};

export type UpdateReminderInput = Partial<CreateReminderInput>;

// Filter types
export type ReminderFilters = {
  campaignId?: string;
  entityType?: string;
  entityId?: string;
  eventTypeId?: string;
  calendarId?: string;
  isRecurring?: boolean;
  isNotification?: boolean;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
};

// Entity event types
export const DEFAULT_EVENT_TYPES = [
  { name: "birth", icon: "🎂", color: "#4CAF50" },
  { name: "death", icon: "💀", color: "#F44336" },
  { name: "event", icon: "📅", color: "#2196F3" },
  { name: "custom", icon: "✨", color: "#9C27B0" },
] as const;

// Age calculation types
export type AgeCalculation = {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  displayString: string; // e.g., "25 years, 3 months, 15 days"
};

// Entity event history
export type EntityEvent = {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  eventType: EntityEventType;
  description?: string;
  age?: AgeCalculation; // Age at time of event (for characters)
  elapsed?: AgeCalculation; // Time elapsed since event
};

// Timeline view for entity events
export type EntityEventTimeline = {
  entityId: string;
  entityType: string;
  entityName: string;
  birthDate?: string;
  deathDate?: string;
  age?: AgeCalculation;
  events: EntityEvent[];
};

// Upcoming reminders view
export type UpcomingReminder = ReminderWithRelations & {
  daysUntil: number;
  nextOccurrence: string; // YYYY-MM-DD
  shouldNotify: boolean;
};
