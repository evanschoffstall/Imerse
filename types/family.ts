export interface Family {
  id: string
  name: string
  slug: string
  type?: string
  description?: string
  image?: string
  location?: string
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

export interface FamilyFormData {
  name: string
  type?: string
  description?: string
  image?: string
  location?: string
  isPrivate?: boolean
}

export const FAMILY_TYPES = [
  'Noble House',
  'Royal Family',
  'Merchant Family',
  'Military Dynasty',
  'Criminal Syndicate',
  'Religious Order',
  'Clan',
  'Tribe',
  'Guild Family',
  'Other'
] as const

export type FamilyType = typeof FAMILY_TYPES[number]
