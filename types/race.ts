export interface Race {
  id: string
  name: string
  slug: string
  type?: string
  description?: string
  image?: string
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

export interface RaceFormData {
  name: string
  type?: string
  description?: string
  image?: string
  isPrivate?: boolean
}

export const RACE_TYPES = [
  'Humanoid',
  'Elf',
  'Dwarf',
  'Orc',
  'Goblinoid',
  'Dragonborn',
  'Celestial',
  'Fiend',
  'Fey',
  'Undead',
  'Construct',
  'Beast',
  'Aberration',
  'Other'
] as const

export type RaceType = typeof RACE_TYPES[number]
