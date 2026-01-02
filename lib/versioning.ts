import { prisma } from "@/lib/prisma";
import {
  ChangeType,
  EntityType,
  generateChangesSummary,
  getChangedFields,
} from "@/types/version";
import { Prisma } from "../generated/prisma/client";

export interface CreateVersionOptions {
  entityType: EntityType;
  entityId: string;
  snapshot: Record<string, any>;
  campaignId: string;
  createdById: string;
  changeType?: ChangeType;
  changesMade?: string;
  previousSnapshot?: Record<string, any>;
}

/**
 * Creates a new version entry for an entity
 */
export async function createVersion(options: CreateVersionOptions) {
  const {
    entityType,
    entityId,
    snapshot,
    campaignId,
    createdById,
    changeType = "update",
    changesMade,
    previousSnapshot,
  } = options;

  // Get the latest version number for this entity
  const latestVersion = await prisma.version.findFirst({
    where: { entityType, entityId },
    orderBy: { versionNumber: "desc" },
    select: { versionNumber: true },
  });

  const versionNumber = (latestVersion?.versionNumber || 0) + 1;

  // Calculate changed fields if we have a previous snapshot
  let changedFields: string[] = [];
  let autoChangesMade = changesMade;

  if (previousSnapshot && changeType === "update") {
    changedFields = getChangedFields(previousSnapshot, snapshot);
    if (!autoChangesMade) {
      autoChangesMade = generateChangesSummary(changedFields, changeType);
    }
  } else if (changeType === "create") {
    autoChangesMade = autoChangesMade || "Initial version created";
  }

  // Create the version
  const version = await prisma.version.create({
    data: {
      entityType,
      entityId,
      versionNumber,
      snapshot,
      changeType,
      changesMade: autoChangesMade,
      changedFields:
        changedFields.length > 0 ? (changedFields as any) : Prisma.JsonNull,
      campaignId,
      createdById,
    },
  });

  return version;
}

/**
 * Get the current snapshot of an entity by type and ID
 */
export async function getEntitySnapshot(
  entityType: EntityType,
  entityId: string
): Promise<Record<string, any> | null> {
  let entity: any = null;

  switch (entityType) {
    case "character":
      entity = await prisma.character.findUnique({ where: { id: entityId } });
      break;
    case "location":
      entity = await prisma.location.findUnique({ where: { id: entityId } });
      break;
    case "item":
      entity = await prisma.item.findUnique({ where: { id: entityId } });
      break;
    case "quest":
      entity = await prisma.quest.findUnique({ where: { id: entityId } });
      break;
    case "event":
      entity = await prisma.event.findUnique({ where: { id: entityId } });
      break;
    case "journal":
      entity = await prisma.journal.findUnique({ where: { id: entityId } });
      break;
    case "note":
      entity = await prisma.note.findUnique({ where: { id: entityId } });
      break;
    case "family":
      entity = await prisma.family.findUnique({ where: { id: entityId } });
      break;
    case "race":
      entity = await prisma.race.findUnique({ where: { id: entityId } });
      break;
    case "organisation":
      entity = await prisma.organisation.findUnique({
        where: { id: entityId },
      });
      break;
    case "tag":
      entity = await prisma.tag.findUnique({ where: { id: entityId } });
      break;
    case "timeline":
      entity = await prisma.timeline.findUnique({ where: { id: entityId } });
      break;
    case "map":
      entity = await prisma.map.findUnique({ where: { id: entityId } });
      break;
    case "campaign":
      entity = await prisma.campaign.findUnique({ where: { id: entityId } });
      break;
  }

  if (!entity) return null;

  // Convert to plain object and remove sensitive fields
  const snapshot = JSON.parse(JSON.stringify(entity));
  delete snapshot.createdAt;
  delete snapshot.updatedAt;

  return snapshot;
}

/**
 * Auto-version middleware: Creates a version before updating an entity
 * Returns the previous snapshot for comparison
 */
export async function captureVersionBeforeUpdate(
  entityType: EntityType,
  entityId: string
): Promise<Record<string, any> | null> {
  return getEntitySnapshot(entityType, entityId);
}

/**
 * Auto-version middleware: Creates a version after entity is updated
 */
export async function createVersionAfterUpdate(
  entityType: EntityType,
  entityId: string,
  campaignId: string,
  userId: string,
  previousSnapshot: Record<string, any> | null,
  changesMade?: string
): Promise<void> {
  const currentSnapshot = await getEntitySnapshot(entityType, entityId);

  if (!currentSnapshot) {
    console.warn(`Could not capture snapshot for ${entityType} ${entityId}`);
    return;
  }

  await createVersion({
    entityType,
    entityId,
    snapshot: currentSnapshot,
    campaignId,
    createdById: userId,
    changeType: previousSnapshot ? "update" : "create",
    changesMade,
    previousSnapshot: previousSnapshot || undefined,
  });
}

/**
 * Helper to automatically version create operations
 */
export async function versionCreate(
  entityType: EntityType,
  entityId: string,
  campaignId: string,
  userId: string
): Promise<void> {
  const snapshot = await getEntitySnapshot(entityType, entityId);

  if (!snapshot) {
    console.warn(
      `Could not capture snapshot for new ${entityType} ${entityId}`
    );
    return;
  }

  await createVersion({
    entityType,
    entityId,
    snapshot,
    campaignId,
    createdById: userId,
    changeType: "create",
    changesMade: "Initial version created",
  });
}

/**
 * Helper to automatically version delete operations
 */
export async function versionDelete(
  entityType: EntityType,
  entityId: string,
  campaignId: string,
  userId: string,
  snapshot: Record<string, any>
): Promise<void> {
  await createVersion({
    entityType,
    entityId,
    snapshot,
    campaignId,
    createdById: userId,
    changeType: "delete",
    changesMade: "Entity deleted",
  });
}
