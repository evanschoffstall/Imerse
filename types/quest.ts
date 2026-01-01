export interface Quest {
  id: string
  name: string
  slug: string
  type?: string | null
  description?: string | null
  image?: string | null
  status?: string | null
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

export interface QuestFormData {
  name: string
  type?: string
  description?: string
  image?: string
  status?: string
  isPrivate?: boolean
}

export const QUEST_TYPES = [
  'Main Quest',
  'Side Quest',
  'Personal Quest',
  'Faction Quest',
  'Bounty',
  'Investigation',
  'Rescue',
  'Fetch',
  'Escort',
  'Defense',
  'Assassination',
  'Other'
] as const

export const QUEST_STATUSES = [
  'active',
  'completed',
  'failed',
  'on-hold'
] as const
