import type {
  CreateNotificationInput,
  NotificationType,
} from "@/types/notification";
import { generateNotificationMessage } from "@/types/notification";
import { prisma } from "./prisma";

/**
 * Create a notification for a user
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link,
        entityType: input.entityType,
        entityId: input.entityId,
        userId: input.userId,
        creatorId: input.creatorId,
        campaignId: input.campaignId,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
    // Don't throw - notification failures shouldn't break the main operation
  }
}

/**
 * Create a notification for multiple users
 */
export async function createBulkNotifications(
  inputs: CreateNotificationInput[]
): Promise<void> {
  try {
    await prisma.notification.createMany({
      data: inputs.map((input) => ({
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link,
        entityType: input.entityType,
        entityId: input.entityId,
        userId: input.userId,
        creatorId: input.creatorId,
        campaignId: input.campaignId,
      })),
    });
  } catch (error) {
    console.error("Failed to create bulk notifications:", error);
  }
}

/**
 * Notify campaign members about an entity update
 */
export async function notifyCampaignMembers(
  campaignId: string,
  type: NotificationType,
  title: string,
  message: string,
  link: string,
  creatorId: string,
  entityType?: string,
  entityId?: string,
  excludeUserIds: string[] = []
): Promise<void> {
  try {
    // Get all campaign members except excluded users
    const members = await prisma.campaignRole.findMany({
      where: {
        campaignId,
        userId: {
          notIn: [...excludeUserIds, creatorId], // Exclude creator and specified users
        },
      },
      select: {
        userId: true,
      },
    });

    if (members.length === 0) return;

    // Create notifications for all members
    const notifications: CreateNotificationInput[] = members.map((member) => ({
      type,
      title,
      message,
      link,
      entityType,
      entityId,
      userId: member.userId,
      creatorId,
      campaignId,
    }));

    await createBulkNotifications(notifications);
  } catch (error) {
    console.error("Failed to notify campaign members:", error);
  }
}

/**
 * Create a mention notification
 */
export async function notifyMention(
  mentionedUserId: string,
  mentionerUserId: string,
  mentionerName: string,
  entityType: string,
  entityId: string,
  entityName: string,
  link: string,
  campaignId?: string
): Promise<void> {
  // Check if user has mention notifications enabled
  const preferences = await prisma.notificationPreference.findUnique({
    where: { userId: mentionedUserId },
  });

  if (preferences && !preferences.notifyOnMention) {
    return;
  }

  await createNotification({
    type: "mention",
    title: "You were mentioned",
    message: generateNotificationMessage("mention", mentionerName, entityName),
    link,
    entityType,
    entityId,
    userId: mentionedUserId,
    creatorId: mentionerUserId,
    campaignId,
  });
}

/**
 * Create a comment notification
 */
export async function notifyComment(
  authorUserId: string,
  commenterUserId: string,
  commenterName: string,
  entityType: string,
  entityId: string,
  entityName: string,
  link: string,
  campaignId?: string
): Promise<void> {
  // Don't notify if commenting on own content
  if (authorUserId === commenterUserId) return;

  const preferences = await prisma.notificationPreference.findUnique({
    where: { userId: authorUserId },
  });

  if (preferences && !preferences.notifyOnComment) {
    return;
  }

  await createNotification({
    type: "comment",
    title: "New comment",
    message: generateNotificationMessage("comment", commenterName, entityName),
    link,
    entityType,
    entityId,
    userId: authorUserId,
    creatorId: commenterUserId,
    campaignId,
  });
}

/**
 * Create a reminder notification
 */
export async function notifyReminder(
  userId: string,
  reminderTitle: string,
  reminderMessage: string,
  link: string,
  campaignId?: string
): Promise<void> {
  const preferences = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  if (preferences && !preferences.notifyOnReminder) {
    return;
  }

  await createNotification({
    type: "reminder",
    title: reminderTitle,
    message: reminderMessage,
    link,
    entityType: "reminder",
    userId,
    campaignId,
  });
}

/**
 * Create a calendar event notification
 */
export async function notifyCalendarEvent(
  campaignId: string,
  eventId: string,
  eventName: string,
  eventDate: Date,
  link: string,
  creatorId?: string
): Promise<void> {
  // Get campaign members who have calendar notifications enabled
  const members = await prisma.campaignRole.findMany({
    where: {
      campaignId,
      ...(creatorId && { userId: { not: creatorId } }),
    },
    select: {
      userId: true,
      user: {
        select: {
          notificationPreferences: true,
        },
      },
    },
  });

  const notifications: CreateNotificationInput[] = [];

  for (const member of members) {
    const preferences = member.user.notificationPreferences;
    if (!preferences || preferences.notifyOnCalendar) {
      notifications.push({
        type: "calendar",
        title: "Upcoming event",
        message: `Event "${eventName}" is coming up`,
        link,
        entityType: "event",
        entityId: eventId,
        userId: member.userId,
        creatorId,
        campaignId,
      });
    }
  }

  if (notifications.length > 0) {
    await createBulkNotifications(notifications);
  }
}

/**
 * Delete notifications for an entity
 */
export async function deleteNotificationsForEntity(
  entityType: string,
  entityId: string
): Promise<void> {
  try {
    await prisma.notification.deleteMany({
      where: {
        entityType,
        entityId,
      },
    });
  } catch (error) {
    console.error("Failed to delete notifications:", error);
  }
}
