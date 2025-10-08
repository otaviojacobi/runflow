import { z } from 'zod'

// User Profile schemas
export const userProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  currentOrganizationId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const userWithOrganizationsSchema = userProfileSchema.extend({
  organizations: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
    description: z.string().nullable(),
    role: z.enum(['OWNER', 'TRAINER', 'ATHLETE']),
    joinedAt: z.string().datetime(),
  })),
  pendingInvites: z.array(z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    role: z.enum(['OWNER', 'TRAINER', 'ATHLETE']),
    token: z.string(),
    organizationId: z.string().uuid(),
    organization: z.object({
      id: z.string().uuid(),
      name: z.string(),
      description: z.string().nullable(),
    }),
    invitedBy: z.object({
      id: z.string().uuid(),
      name: z.string().nullable(),
      email: z.string().email(),
    }),
    expiresAt: z.string().datetime(),
    createdAt: z.string().datetime(),
  })),
})

// Types
export type UserProfile = z.infer<typeof userProfileSchema>
export type UserWithOrganizations = z.infer<typeof userWithOrganizationsSchema>
