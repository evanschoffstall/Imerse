import { z } from 'zod'

export interface Location {
  id: string
  name: string
  slug: string
  type?: string | null
  parentId?: string | null
  description?: string | null
  image?: string | null
  mapImage?: string | null
  isPrivate: boolean
  campaignId: string
  createdById: string
  createdAt: Date
  updatedAt: Date
  campaign?: {
    id: string
    name: string
    ownerId: string
  }
  createdBy?: {
    id: string
    name: string
  }
  parent?: {
    id: string
    name: string
  } | null
  children?: {
    id: string
    name: string
    type?: string | null
  }[]
}

// Form data allows isPrivate to be optional (will default to false)
export const locationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  type: z.string().max(100).optional(),
  parentId: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
  mapImage: z.string().url().optional().or(z.literal('')),
  isPrivate: z.boolean().optional(),
})

export type LocationFormData = z.infer<typeof locationSchema> & {
  isPrivate?: boolean
}
