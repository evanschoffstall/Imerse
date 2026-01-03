import { z } from 'zod'

export interface Item {
  id: string
  name: string
  slug: string
  type?: string | null
  description?: string | null
  image?: string | null
  location?: string | null
  character?: string | null
  price?: string | null
  size?: string | null
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
}

export const itemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  type: z.string().max(100).optional(),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
  location: z.string().max(255).optional(),
  character: z.string().max(255).optional(),
  price: z.string().max(100).optional(),
  size: z.string().max(100).optional(),
  isPrivate: z.boolean().optional(),
})

export type ItemFormData = z.infer<typeof itemSchema> & {
  isPrivate?: boolean
}
