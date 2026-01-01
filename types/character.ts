import { z } from 'zod'

export interface Character {
  id: string
  name: string
  slug: string
  title?: string | null
  type?: string | null
  age?: string | null
  sex?: string | null
  pronouns?: string | null
  location?: string | null
  family?: string | null
  description?: string | null
  image?: string | null
  isPrivate: boolean  // Not optional in database
  
  // Birthday tracking
  birthCalendarId?: string | null
  birthCalendar?: {
    id: string
    name: string
  }
  birthDate?: string | null // YYYY-MM-DD format in calendar system
  
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

// Form data allows isPrivate to be optional (will default to false)
export const characterSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  title: z.string().max(255).optional(),
  type: z.string().max(100).optional(),
  age: z.string().max(50).optional(),
  sex: z.string().max(50).optional(),
  pronouns: z.string().max(50).optional(),
  location: z.string().max(255).optional(),
  family: z.string().max(255).optional(),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
  isPrivate: z.boolean().optional(),
  
  // Birthday fields
  birthCalendarId: z.string().optional(),
  birthDate: z.string().regex(/^-?\d{1,5}-\d{1,2}-\d{1,2}$/, 'Birth date must be in YYYY-MM-DD format').optional().or(z.literal('')),
})

// Transform to add default value when converting to form data
export type CharacterFormData = z.infer<typeof characterSchema> & {
  isPrivate?: boolean
  birthCalendarId?: string
  birthDate?: string
}

// Helper function to calculate character age
export function calculateCharacterAge(
  birthDate: string,
  currentDate: string
): number {
  const birth = birthDate.split('-').map(Number)
  const current = currentDate.split('-').map(Number)
  
  let age = current[0] - birth[0] // Year difference
  
  // Adjust if birthday hasn't occurred this year
  if (current[1] < birth[1] || (current[1] === birth[1] && current[2] < birth[2])) {
    age--
  }
  
  return age
}
