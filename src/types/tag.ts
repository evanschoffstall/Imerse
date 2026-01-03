export interface Tag {
  id: string
  name: string
  slug: string
  type?: string
  description?: string
  color?: string
  isPrivate: boolean
  createdAt: Date
  updatedAt: Date
  campaignId: string
  campaign?: {
    id: string
    name: string
  }
  createdById: string
  createdBy?: {
    id: string
    name?: string
    email: string
  }
}

export interface TagFormData {
  name: string
  type?: string
  description?: string
  color?: string
  isPrivate?: boolean
}

export const TAG_TYPES = [
  'Character',
  'Location',
  'Story Arc',
  'Theme',
  'Faction',
  'Magic',
  'Technology',
  'Religion',
  'Culture',
  'Event',
  'Combat',
  'NPC',
  'Player',
  'Other'
] as const

export type TagType = typeof TAG_TYPES[number]

export const TAG_COLORS = [
  '#ef4444', // red
  '#f59e0b', // amber
  '#eab308', // yellow
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#ec4899', // pink
  '#6b7280', // gray
] as const
