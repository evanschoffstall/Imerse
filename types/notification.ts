import type {
  Notification as PrismaNotification,
  NotificationPreference as PrismaNotificationPreference,
} from "@/generated/prisma/client";

// Base types from Prisma
export type Notification = PrismaNotification;
export type NotificationPreference = PrismaNotificationPreference;

// Extended types with relations
export type NotificationWithRelations = Notification & {
  creator?: {
    id: string;
    name: string;
    avatar?: string;
  } | null;
  campaign?: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

// Notification types
export type NotificationType =
  | "mention"
  | "comment"
  | "calendar"
  | "reminder"
  | "campaign"
  | "quest"
  | "character"
  | "location"
  | "event"
  | "journal"
  | "note"
  | "conversation"
  | "post"
  | "system";

// Email digest frequency
export type EmailDigestFrequency = "daily" | "weekly" | "never";

// Form types
export type CreateNotificationInput = {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  entityType?: string;
  entityId?: string;
  userId: string;
  creatorId?: string;
  campaignId?: string;
};

export type UpdateNotificationInput = {
  read?: boolean;
  readAt?: Date;
};

export type UpdateNotificationPreferenceInput = {
  emailOnMention?: boolean;
  emailOnComment?: boolean;
  emailOnCalendar?: boolean;
  emailOnReminder?: boolean;
  emailOnCampaign?: boolean;
  emailOnQuest?: boolean;
  emailOnCharacter?: boolean;
  emailDigest?: boolean;
  emailDigestFrequency?: EmailDigestFrequency;
  notifyOnMention?: boolean;
  notifyOnComment?: boolean;
  notifyOnCalendar?: boolean;
  notifyOnReminder?: boolean;
  notifyOnCampaign?: boolean;
  notifyOnQuest?: boolean;
  notifyOnCharacter?: boolean;
};

// Filter types
export type NotificationFilters = {
  read?: boolean;
  type?: NotificationType;
  campaignId?: string;
  startDate?: string;
  endDate?: string;
};

// Notification statistics
export type NotificationStats = {
  total: number;
  unread: number;
  byType: Record<string, number>;
};

// Notification icon mapping for UI
export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  mention: "@",
  comment: "💬",
  calendar: "📅",
  reminder: "⏰",
  campaign: "🎲",
  quest: "⚔️",
  character: "👤",
  location: "📍",
  event: "📆",
  journal: "📖",
  note: "📝",
  conversation: "💬",
  post: "📄",
  system: "🔔",
};

// Notification color mapping for UI
export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  mention: "bg-blue-100 text-blue-800",
  comment: "bg-green-100 text-green-800",
  calendar: "bg-purple-100 text-purple-800",
  reminder: "bg-yellow-100 text-yellow-800",
  campaign: "bg-red-100 text-red-800",
  quest: "bg-orange-100 text-orange-800",
  character: "bg-indigo-100 text-indigo-800",
  location: "bg-pink-100 text-pink-800",
  event: "bg-teal-100 text-teal-800",
  journal: "bg-cyan-100 text-cyan-800",
  note: "bg-lime-100 text-lime-800",
  conversation: "bg-green-100 text-green-800",
  post: "bg-blue-100 text-blue-800",
  system: "bg-gray-100 text-gray-800",
};

// Helper function to generate notification messages
export function generateNotificationMessage(
  type: NotificationType,
  creatorName: string,
  entityName?: string
): string {
  switch (type) {
    case "mention":
      return `${creatorName} mentioned you`;
    case "comment":
      return `${creatorName} commented on ${entityName || "a post"}`;
    case "calendar":
      return `${entityName || "An event"} is coming up`;
    case "reminder":
      return `Reminder: ${entityName || "You have a notification"}`;
    case "campaign":
      return `${creatorName} updated the campaign`;
    case "quest":
      return `${creatorName} updated quest "${entityName}"`;
    case "character":
      return `${creatorName} updated character "${entityName}"`;
    case "location":
      return `${creatorName} updated location "${entityName}"`;
    case "event":
      return `${creatorName} created event "${entityName}"`;
    case "journal":
      return `${creatorName} added a journal entry`;
    case "note":
      return `${creatorName} added a note`;
    case "conversation":
      return `${creatorName} sent you a message`;
    case "post":
      return `${creatorName} created a new post`;
    case "system":
      return `System notification`;
    default:
      return `${creatorName} created a notification`;
  }
}
