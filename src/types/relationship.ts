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
  | "map";

export type RelationshipType =
  // Character relationships
  | "ally"
  | "enemy"
  | "friend"
  | "rival"
  | "family"
  | "mentor"
  | "student"
  | "employer"
  | "employee"
  // Location relationships
  | "located_in"
  | "adjacent_to"
  | "connected_to"
  | "rules"
  | "ruled_by"
  // Ownership relationships
  | "owns"
  | "owned_by"
  | "created_by"
  | "guards"
  | "guarded_by"
  // Organization relationships
  | "member_of"
  | "leader_of"
  | "allied_with"
  | "at_war_with"
  // Quest relationships
  | "quest_giver"
  | "quest_target"
  | "requires"
  | "unlocks"
  // Event relationships
  | "participant"
  | "organizer"
  | "affected_by"
  // Generic relationships
  | "related_to"
  | "parent_of"
  | "child_of"
  | "contains"
  | "contained_in"
  | "custom";

export const RELATIONSHIP_TYPE_LABELS: Record<RelationshipType, string> = {
  ally: "Ally",
  enemy: "Enemy",
  friend: "Friend",
  rival: "Rival",
  family: "Family",
  mentor: "Mentor",
  student: "Student",
  employer: "Employer",
  employee: "Employee",
  located_in: "Located In",
  adjacent_to: "Adjacent To",
  connected_to: "Connected To",
  rules: "Rules",
  ruled_by: "Ruled By",
  owns: "Owns",
  owned_by: "Owned By",
  created_by: "Created By",
  guards: "Guards",
  guarded_by: "Guarded By",
  member_of: "Member Of",
  leader_of: "Leader Of",
  allied_with: "Allied With",
  at_war_with: "At War With",
  quest_giver: "Quest Giver",
  quest_target: "Quest Target",
  requires: "Requires",
  unlocks: "Unlocks",
  participant: "Participant",
  organizer: "Organizer",
  affected_by: "Affected By",
  related_to: "Related To",
  parent_of: "Parent Of",
  child_of: "Child Of",
  contains: "Contains",
  contained_in: "Contained In",
  custom: "Custom",
};

// Bidirectional relationship pairs
export const RELATIONSHIP_INVERSES: Partial<
  Record<RelationshipType, RelationshipType>
> = {
  ally: "ally",
  enemy: "enemy",
  friend: "friend",
  rival: "rival",
  mentor: "student",
  student: "mentor",
  employer: "employee",
  employee: "employer",
  located_in: "contains",
  contains: "contained_in",
  contained_in: "contains",
  adjacent_to: "adjacent_to",
  connected_to: "connected_to",
  rules: "ruled_by",
  ruled_by: "rules",
  owns: "owned_by",
  owned_by: "owns",
  guards: "guarded_by",
  guarded_by: "guards",
  member_of: "member_of",
  leader_of: "leader_of",
  allied_with: "allied_with",
  at_war_with: "at_war_with",
  parent_of: "child_of",
  child_of: "parent_of",
};

export interface Relationship {
  id: string;
  sourceEntityType: EntityType;
  sourceEntityId: string;
  targetEntityType: EntityType;
  targetEntityId: string;
  relationshipType: RelationshipType;
  description?: string | null;
  metadata?: Record<string, any> | null;
  bidirectional: boolean;
  isPrivate: boolean;
  campaignId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  // Populated fields
  sourceEntity?: EntityReference;
  targetEntity?: EntityReference;
}

export interface EntityReference {
  id: string;
  name: string;
  type: EntityType;
  image?: string | null;
  slug?: string;
}

export interface RelationshipFormData {
  sourceEntityType: EntityType;
  sourceEntityId: string;
  targetEntityType: EntityType;
  targetEntityId: string;
  relationshipType: RelationshipType;
  description?: string;
  metadata?: Record<string, any>;
  bidirectional?: boolean;
  isPrivate?: boolean;
}

export interface RelationshipWithEntities extends Relationship {
  sourceEntity: EntityReference;
  targetEntity: EntityReference;
}

// Validation schemas
export const relationshipFormSchema = z.object({
  sourceEntityType: z.string(),
  sourceEntityId: z.string(),
  targetEntityType: z.string(),
  targetEntityId: z.string(),
  relationshipType: z.string(),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  bidirectional: z.boolean().optional(),
  isPrivate: z.boolean().optional(),
});

// Helper functions
export function getInverseRelationshipType(
  type: RelationshipType
): RelationshipType | null {
  return RELATIONSHIP_INVERSES[type] ?? null;
}

export function groupRelationshipsByType(
  relationships: RelationshipWithEntities[]
): Record<RelationshipType, RelationshipWithEntities[]> {
  const grouped: Record<string, RelationshipWithEntities[]> = {};

  relationships.forEach((rel) => {
    if (!grouped[rel.relationshipType]) {
      grouped[rel.relationshipType] = [];
    }
    grouped[rel.relationshipType].push(rel);
  });

  return grouped as Record<RelationshipType, RelationshipWithEntities[]>;
}

export function getEntityLabel(entity: EntityReference): string {
  return entity.name;
}

export function getEntityPath(entity: EntityReference): string {
  const pluralMap: Record<EntityType, string> = {
    character: "characters",
    location: "locations",
    item: "items",
    quest: "quests",
    event: "events",
    journal: "journals",
    note: "notes",
    family: "families",
    race: "races",
    organisation: "organisations",
    tag: "tags",
    timeline: "timelines",
    map: "maps",
  };
  return `/${pluralMap[entity.type]}/${entity.id}`;
}

// Suggested relationships by entity type
export const SUGGESTED_RELATIONSHIPS: Record<EntityType, RelationshipType[]> = {
  character: [
    "ally",
    "enemy",
    "friend",
    "rival",
    "family",
    "mentor",
    "student",
    "member_of",
    "owns",
  ],
  location: [
    "located_in",
    "adjacent_to",
    "connected_to",
    "contains",
    "ruled_by",
  ],
  item: ["owned_by", "created_by", "located_in", "requires"],
  quest: ["quest_giver", "quest_target", "requires", "unlocks", "related_to"],
  event: ["participant", "organizer", "affected_by", "located_in"],
  journal: ["related_to", "created_by"],
  note: ["related_to", "created_by"],
  family: ["member_of", "allied_with", "at_war_with", "rules"],
  race: ["member_of", "allied_with", "at_war_with", "located_in"],
  organisation: [
    "member_of",
    "leader_of",
    "allied_with",
    "at_war_with",
    "located_in",
  ],
  tag: ["related_to"],
  timeline: ["contains", "related_to"],
  map: ["contains", "related_to", "located_in"],
};
