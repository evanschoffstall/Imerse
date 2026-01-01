export interface Journal {
  id: string
  name: string
  slug: string
  type?: string | null
  date?: string | null
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

export interface JournalFormData {
  name: string
  type?: string
  date?: string
  description?: string
  image?: string
  isPrivate?: boolean
}

export const JOURNAL_TYPES = [
  'Session Log',
  'Character Diary',
  'Campaign Notes',
  'Story',
  'Report',
  'Letter',
  'Research',
  'Dream',
  'Memory',
  'Other'
] as const
