import type {
  CreateEntityLogInput,
  CreateUserLogInput,
  EntityChanges,
  LoggableEntity,
  LoggingOptions,
} from "@/types/entity-log";
import { prisma } from "./prisma";

/**
 * Log an entity action (create, update, delete, restore)
 */
export async function logEntityAction(
  input: CreateEntityLogInput
): Promise<void> {
  try {
    await prisma.entityLog.create({
      data: {
        entityType: input.entityType,
        entityId: input.entityId,
        action: input.action,
        changes: input.changes as any,
        campaignId: input.campaignId,
        userId: input.userId,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to create entity log:", error);
    // Don't throw - logging failures shouldn't break the main operation
  }
}

/**
 * Log a user action (login, logout, etc.)
 */
export async function logUserAction(input: CreateUserLogInput): Promise<void> {
  try {
    await prisma.userLog.create({
      data: {
        action: input.action,
        details: input.details as any,
        userId: input.userId,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to create user log:", error);
    // Don't throw - logging failures shouldn't break the main operation
  }
}

/**
 * Compare two objects and generate a diff
 */
export function generateDiff(
  before: Record<string, any>,
  after: Record<string, any>,
  excludeFields: string[] = ["updatedAt", "createdAt"]
): EntityChanges {
  const diff: Array<{ field: string; oldValue: any; newValue: any }> = [];
  const fields: string[] = [];

  // Find changed fields
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of allKeys) {
    if (excludeFields.includes(key)) continue;

    const oldValue = before[key];
    const newValue = after[key];

    // Deep comparison for objects
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      fields.push(key);
      diff.push({
        field: key,
        oldValue,
        newValue,
      });
    }
  }

  return {
    before,
    after,
    fields,
    diff,
  };
}

/**
 * Extract client info from request headers
 */
export function extractClientInfo(headers: Headers): {
  ipAddress?: string;
  userAgent?: string;
} {
  return {
    ipAddress:
      headers.get("x-forwarded-for") || headers.get("x-real-ip") || undefined,
    userAgent: headers.get("user-agent") || undefined,
  };
}

/**
 * Middleware helper: Log entity creation
 */
export async function logCreate(
  entityType: LoggableEntity,
  entityId: string,
  entityData: Record<string, any>,
  campaignId: string,
  userId?: string,
  options?: LoggingOptions
): Promise<void> {
  await logEntityAction({
    entityType,
    entityId,
    action: "create",
    changes: {
      after: entityData,
      fields: Object.keys(entityData),
    },
    campaignId,
    userId,
    ipAddress: options?.includeIp ? undefined : undefined,
    userAgent: options?.includeUserAgent ? undefined : undefined,
  });
}

/**
 * Middleware helper: Log entity update
 */
export async function logUpdate(
  entityType: LoggableEntity,
  entityId: string,
  before: Record<string, any>,
  after: Record<string, any>,
  campaignId: string,
  userId?: string,
  options?: LoggingOptions
): Promise<void> {
  const changes = generateDiff(before, after, options?.excludeFields);

  // Only log if there are actual changes
  if (changes.fields && changes.fields.length > 0) {
    await logEntityAction({
      entityType,
      entityId,
      action: "update",
      changes,
      campaignId,
      userId,
      ipAddress: options?.includeIp ? undefined : undefined,
      userAgent: options?.includeUserAgent ? undefined : undefined,
    });
  }
}

/**
 * Middleware helper: Log entity deletion
 */
export async function logDelete(
  entityType: LoggableEntity,
  entityId: string,
  entityData: Record<string, any>,
  campaignId: string,
  userId?: string,
  options?: LoggingOptions
): Promise<void> {
  await logEntityAction({
    entityType,
    entityId,
    action: "delete",
    changes: {
      before: options?.captureFullSnapshot ? entityData : { id: entityId },
    },
    campaignId,
    userId,
    ipAddress: options?.includeIp ? undefined : undefined,
    userAgent: options?.includeUserAgent ? undefined : undefined,
  });
}

/**
 * Middleware helper: Log entity restoration
 */
export async function logRestore(
  entityType: LoggableEntity,
  entityId: string,
  entityData: Record<string, any>,
  campaignId: string,
  userId?: string,
  options?: LoggingOptions
): Promise<void> {
  await logEntityAction({
    entityType,
    entityId,
    action: "restore",
    changes: {
      after: entityData,
    },
    campaignId,
    userId,
    ipAddress: options?.includeIp ? undefined : undefined,
    userAgent: options?.includeUserAgent ? undefined : undefined,
  });
}

/**
 * Get entity history
 */
export async function getEntityHistory(
  entityType: string,
  entityId: string,
  limit = 50
) {
  const logs = await prisma.entityLog.findMany({
    where: {
      entityType,
      entityId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      campaign: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  return logs;
}

/**
 * Get campaign activity timeline
 */
export async function getCampaignActivity(campaignId: string, limit = 50) {
  const logs = await prisma.entityLog.findMany({
    where: {
      campaignId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  // Transform to ActivityTimelineItem format
  return logs.map((log) => ({
    id: log.id,
    type: "entity" as const,
    action: log.action,
    timestamp: log.createdAt,
    user: log.user
      ? {
          id: log.user.id,
          name: log.user.name || "Unknown User",
        }
      : undefined,
    entity: {
      type: log.entityType,
      id: log.entityId,
    },
    changes: log.changes as any,
    description: `${log.action} ${log.entityType}`,
  }));
}

/**
 * Get user activity
 */
export async function getUserActivity(userId: string, limit = 50) {
  const [entityLogs, userLogs] = await Promise.all([
    prisma.entityLog.findMany({
      where: { userId },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    }),
    prisma.userLog.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    }),
  ]);

  return { entityLogs, userLogs };
}
