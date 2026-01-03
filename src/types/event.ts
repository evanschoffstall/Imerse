export interface Event {
  id: string;
  name: string;
  slug: string;
  type?: string | null;
  date?: string | null;
  description?: string | null;
  image?: string | null;
  location?: string | null;
  isPrivate: boolean;

  // Calendar Integration
  calendarId?: string | null;
  calendar?: {
    id: string;
    name: string;
  };
  calendarDate?: string | null; // YYYY-MM-DD format
  isRecurring?: boolean;
  recurrenceRule?: RecurrenceRule | null;

  // Timeline Integration
  timelineId?: string | null;
  timeline?: {
    id: string;
    name: string;
  };

  campaignId: string;
  campaign?: {
    id: string;
    name: string;
  };
  createdById: string;
  createdBy?: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Recurrence Rule Types
export type RecurrenceType = "daily" | "weekly" | "monthly" | "yearly" | "moon";

export interface RecurrenceRule {
  type: RecurrenceType;
  interval: number; // Repeat every X days/weeks/months/years
  moonPhase?: "new" | "full" | "first" | "last"; // For moon-based recurrence
  endDate?: string; // Optional end date (YYYY-MM-DD)
  count?: number; // Optional: repeat X times
}

export interface EventFormData {
  name: string;
  type?: string;
  date?: string;
  description?: string;
  image?: string;
  location?: string;
  isPrivate?: boolean;

  // Calendar fields
  calendarId?: string;
  calendarDate?: string;
  isRecurring?: boolean;
  recurrenceRule?: RecurrenceRule;

  // Timeline field
  timelineId?: string;
}

export const EVENT_TYPES = [
  "Battle",
  "Celebration",
  "Ceremony",
  "Discovery",
  "Festival",
  "Meeting",
  "Birth",
  "Death",
  "Coronation",
  "Treaty",
  "Natural Disaster",
  "Founding",
  "Other",
] as const;
// Helper functions for event-calendar integration
export function getEventOccurrences(
  event: Event,
  startDate: string,
  endDate: string
): string[] {
  if (!event.isRecurring || !event.recurrenceRule || !event.calendarDate) {
    return event.calendarDate ? [event.calendarDate] : [];
  }

  const occurrences: string[] = [];
  const rule = event.recurrenceRule;
  const start = new Date(startDate);
  const end = new Date(endDate);
  let current = new Date(event.calendarDate);

  while (current <= end) {
    if (current >= start) {
      occurrences.push(current.toISOString().split("T")[0]);
    }

    // Increment based on recurrence type
    switch (rule.type) {
      case "daily":
        current.setDate(current.getDate() + rule.interval);
        break;
      case "weekly":
        current.setDate(current.getDate() + 7 * rule.interval);
        break;
      case "monthly":
        current.setMonth(current.getMonth() + rule.interval);
        break;
      case "yearly":
        current.setFullYear(current.getFullYear() + rule.interval);
        break;
      default:
        // For moon phases, would need calendar-specific logic
        return [event.calendarDate];
    }

    // Check end conditions
    if (rule.endDate && current > new Date(rule.endDate)) break;
    if (rule.count && occurrences.length >= rule.count) break;
  }

  return occurrences;
}
