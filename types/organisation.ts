export interface Organisation {
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

export interface OrganisationFormData {
  name: string
  type?: string
  description?: string
  image?: string
  location?: string
  isPrivate?: boolean
}

export const ORGANISATION_TYPES = [
  'Guild',
  'Government',
  'Military',
  'Religious',
  'Criminal',
  'Mercantile',
  'Academic',
  'Secret Society',
  'Noble House',
  'Adventuring Company',
  'Cult',
  'Council',
  'Other'
] as const

export type OrganisationType = typeof ORGANISATION_TYPES[number]
