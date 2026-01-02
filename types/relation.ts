export interface Relation {
  id: string
  relation: string
  attitude: number // -3 to +3
  colour?: string
  isPinned: boolean
  visibility: string
  mirrorId?: string
  ownerId: string
  ownerType: string
  targetId: string
  targetType: string
  campaignId: string
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface RelationWithEntities extends Relation {
  owner?: {
    id: string
    name: string
    type: string
  }
  target?: {
    id: string
    name: string
    type: string
  }
  mirror?: Relation
}

export interface CreateRelationInput {
  relation: string
  attitude?: number
  colour?: string
  isPinned?: boolean
  visibility?: string
  ownerId: string
  ownerType: string
  targetId: string
  targetType: string
  createMirror?: boolean
  mirrorRelation?: string
}

export interface UpdateRelationInput {
  relation?: string
  attitude?: number
  colour?: string
  isPinned?: boolean
  visibility?: string
}

// Common relation types for worldbuilding
export const RELATION_TYPES = [
  // Family
  'parent',
  'child',
  'sibling',
  'spouse',
  'ancestor',
  'descendant',
  
  // Social
  'friend',
  'ally',
  'rival',
  'enemy',
  'acquaintance',
  
  // Professional
  'employer',
  'employee',
  'colleague',
  'mentor',
  'student',
  
  // Organizational
  'member',
  'leader',
  'founder',
  
  // Location
  'birthplace',
  'home',
  'workplace',
  'visited',
  
  // Other
  'owner',
  'creator',
  'protector',
  'guardian',
  'related',
  'associated',
] as const

export type RelationType = typeof RELATION_TYPES[number]

// Entity types that can have relations
export const ENTITY_TYPES = [
  'character',
  'location',
  'item',
  'quest',
  'event',
  'journal',
  'note',
  'family',
  'race',
  'organisation',
  'timeline',
  'map',
] as const

export type EntityType = typeof ENTITY_TYPES[number]

// Attitude levels
export const ATTITUDE_LABELS: Record<number, string> = {
  '-3': 'Hostile',
  '-2': 'Unfriendly',
  '-1': 'Wary',
  '0': 'Neutral',
  '1': 'Friendly',
  '2': 'Allied',
  '3': 'Devoted',
}

// Colours for relation visualization
export const RELATION_COLOURS = [
  '#ef4444', // red
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#f97316', // orange
  '#84cc16', // lime
] as const
