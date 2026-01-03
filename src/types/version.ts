import { z } from "zod";

export type EntityType =
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
  | "map"
  | "campaign";

export type ChangeType = "create" | "update" | "delete";

export interface Version {
  id: string;
  entityType: EntityType;
  entityId: string;
  versionNumber: number;
  snapshot: Record<string, any>;
  changeType: ChangeType;
  changesMade?: string | null;
  changedFields?: string[] | null;
  createdAt: Date;
  campaignId: string;
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
    avatar?: string | null;
  };
}

export interface VersionWithDiff extends Version {
  diff?: FieldDiff[];
}

export interface FieldDiff {
  field: string;
  oldValue: any;
  newValue: any;
  type: "added" | "removed" | "changed";
}

export interface CreateVersionData {
  entityType: EntityType;
  entityId: string;
  snapshot: Record<string, any>;
  changeType?: ChangeType;
  changesMade?: string;
  changedFields?: string[];
  campaignId: string;
}

export interface VersionListResponse {
  versions: Version[];
  total: number;
  entityName?: string;
}

export interface VersionCompareResponse {
  version1: Version;
  version2: Version;
  diff: FieldDiff[];
}

// Validation schemas
export const createVersionSchema = z.object({
  entityType: z.string(),
  entityId: z.string(),
  snapshot: z.record(z.string(), z.any()),
  changeType: z.enum(["create", "update", "delete"]).optional(),
  changesMade: z.string().optional(),
  changedFields: z.array(z.string()).optional(),
  campaignId: z.string(),
});

// Helper functions
export function compareSnapshots(
  oldSnapshot: Record<string, any>,
  newSnapshot: Record<string, any>
): FieldDiff[] {
  const diffs: FieldDiff[] = [];
  const allKeys = new Set([
    ...Object.keys(oldSnapshot),
    ...Object.keys(newSnapshot),
  ]);

  allKeys.forEach((key) => {
    const oldValue = oldSnapshot[key];
    const newValue = newSnapshot[key];

    // Skip system fields
    if (
      ["id", "createdAt", "updatedAt", "createdById", "campaignId"].includes(
        key
      )
    ) {
      return;
    }

    if (!(key in oldSnapshot) && key in newSnapshot) {
      diffs.push({ field: key, oldValue: undefined, newValue, type: "added" });
    } else if (key in oldSnapshot && !(key in newSnapshot)) {
      diffs.push({
        field: key,
        oldValue,
        newValue: undefined,
        type: "removed",
      });
    } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      diffs.push({ field: key, oldValue, newValue, type: "changed" });
    }
  });

  return diffs;
}

export function getChangedFields(
  oldSnapshot: Record<string, any>,
  newSnapshot: Record<string, any>
): string[] {
  const diffs = compareSnapshots(oldSnapshot, newSnapshot);
  return diffs.map((d) => d.field);
}

export function formatFieldValue(value: any): string {
  if (value === null || value === undefined) {
    return "Empty";
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  if (typeof value === "string") {
    if (value.length > 100) {
      return value.substring(0, 100) + "...";
    }
    return value;
  }
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

export function formatFieldName(field: string): string {
  // Convert camelCase to Title Case
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

export function generateChangesSummary(
  changedFields: string[],
  changeType: ChangeType = "update"
): string {
  if (changeType === "create") {
    return "Initial version created";
  }
  if (changeType === "delete") {
    return "Entity deleted";
  }
  if (changedFields.length === 0) {
    return "No changes detected";
  }
  if (changedFields.length === 1) {
    return `Updated ${formatFieldName(changedFields[0])}`;
  }
  if (changedFields.length <= 3) {
    return `Updated ${changedFields.map(formatFieldName).join(", ")}`;
  }
  return `Updated ${changedFields.length} fields: ${changedFields
    .slice(0, 3)
    .map(formatFieldName)
    .join(", ")}...`;
}

export function getVersionLabel(version: Version): string {
  return `Version ${version.versionNumber}`;
}

export function getVersionTimestamp(version: Version): string {
  return new Date(version.createdAt).toLocaleString();
}

// Entity-specific field labels
export const FIELD_LABELS: Record<string, Record<string, string>> = {
  character: {
    name: "Name",
    title: "Title",
    type: "Type",
    age: "Age",
    sex: "Sex",
    pronouns: "Pronouns",
    location: "Location",
    family: "Family",
    description: "Description",
    image: "Image",
    isPrivate: "Private",
  },
  location: {
    name: "Name",
    type: "Type",
    description: "Description",
    image: "Image",
    parentLocationId: "Parent Location",
    isPrivate: "Private",
  },
  // Add more entity types as needed
};

export function getFieldLabel(entityType: EntityType, field: string): string {
  return FIELD_LABELS[entityType]?.[field] || formatFieldName(field);
}
