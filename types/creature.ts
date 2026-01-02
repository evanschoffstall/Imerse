export interface Creature {
  id: string;
  name: string;
  entry: string | null;
  type: string | null;
  image: string | null;
  isExtinct: boolean;
  isDead: boolean;
  isPrivate: boolean;
  campaignId: string;
  createdById: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatureWithRelations extends Creature {
  campaign: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
  parent?: {
    id: string;
    name: string;
  } | null;
  children?: Creature[];
  locations?: CreatureLocationWithLocation[];
  _count?: {
    children: number;
    locations: number;
  };
}

export interface CreatureLocation {
  id: string;
  creatureId: string;
  locationId: string;
  createdAt: Date;
}

export interface CreatureLocationWithLocation extends CreatureLocation {
  location: {
    id: string;
    name: string;
  };
}

export interface CreatureLocationWithCreature extends CreatureLocation {
  creature: {
    id: string;
    name: string;
    type: string | null;
  };
}

export interface CreatureFormData {
  name: string;
  entry?: string;
  type?: string;
  image?: string;
  isExtinct?: boolean;
  isDead?: boolean;
  isPrivate?: boolean;
  campaignId: string;
  parentId?: string | null;
}

export interface CreatureLocationFormData {
  creatureId: string;
  locationId: string;
}

// Creature types based on D&D 5e
export const CREATURE_TYPES = [
  "Aberration",
  "Beast",
  "Celestial",
  "Construct",
  "Dragon",
  "Elemental",
  "Fey",
  "Fiend",
  "Giant",
  "Humanoid",
  "Monstrosity",
  "Ooze",
  "Plant",
  "Undead",
  "Other",
] as const;

export type CreatureType = (typeof CREATURE_TYPES)[number];

// Size categories
export const CREATURE_SIZES = [
  "Tiny",
  "Small",
  "Medium",
  "Large",
  "Huge",
  "Gargantuan",
] as const;

export type CreatureSize = (typeof CREATURE_SIZES)[number];

// Challenge ratings (for stat blocks)
export const CHALLENGE_RATINGS = [
  "0",
  "1/8",
  "1/4",
  "1/2",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "30",
] as const;

export type ChallengeRating = (typeof CHALLENGE_RATINGS)[number];
