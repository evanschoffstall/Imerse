export interface Note {
  id: string
  name: string
  slug: string
  type?: string | null
  description?: string | null
  image?: string | null
  isPrivate: boolean
  campaignId: string
  campaign?: {
    id: string
    name: string
  }
  createdById: string
  createdBy?: {
    id: string
    name: string | null
    email: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface NoteFormData {
  name: string
  type?: string
  description?: string
  image?: string
  isPrivate?: boolean
}

export const NOTE_TYPES = [
  'Quick Note',
  'Plot Hook',
  'NPC Note',
  'Location Note',
  'Rules Note',
  'Lore',
  'Reminder',
  'Secret',
  'Clue',
  'Other'
] as const
