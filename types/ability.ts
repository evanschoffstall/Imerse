export interface Ability {
  id: string;
  name: string;
  entry: string | null;
  charges: number | null;
  type: string | null;
  isPrivate: boolean;
  campaignId: string;
  createdById: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AbilityWithRelations extends Ability {
  campaign: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
  parent?: Ability | null;
  children?: Ability[];
  entityAbilities?: EntityAbility[];
  _count?: {
    children: number;
    entityAbilities: number;
  };
}

export interface EntityAbility {
  id: string;
  charges: number | null;
  position: number;
  note: string | null;
  isPrivate: boolean;
  entityId: string;
  entityType: string;
  abilityId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EntityAbilityWithRelations extends EntityAbility {
  ability: Ability;
  createdBy: {
    id: string;
    name: string;
  };
}

export interface AbilityFormData {
  name: string;
  entry?: string;
  charges?: number | null;
  type?: string;
  isPrivate?: boolean;
  campaignId: string;
  parentId?: string | null;
}

export interface EntityAbilityFormData {
  abilityId: string;
  entityId: string;
  entityType: string;
  charges?: number | null;
  position?: number;
  note?: string;
  isPrivate?: boolean;
}

// Ability types/categories
export const ABILITY_TYPES = [
  "Action",
  "Bonus Action",
  "Reaction",
  "Passive",
  "Spell",
  "Feature",
  "Trait",
  "Attack",
  "Defense",
  "Utility",
  "Social",
  "Movement",
  "Other",
] as const;

export type AbilityType = (typeof ABILITY_TYPES)[number];

// Entity types that can have abilities
export const ENTITY_TYPES_WITH_ABILITIES = [
  "character",
  "creature",
  "item",
  "race",
] as const;

export type EntityTypeWithAbility =
  (typeof ENTITY_TYPES_WITH_ABILITIES)[number];
