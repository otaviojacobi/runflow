import { z } from 'zod'

// Enums
export const MemberRole = z.enum(['OWNER', 'TRAINER', 'ATHLETE'])
export const InviteStatus = z.enum(['PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED'])

// Organization schemas
export const createOrganizationSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
})

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
})

export const organizationResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  logo: z.string().nullable(),
  primaryColor: z.string().nullable(),
  secondaryColor: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

// Member schemas
export const updateMemberRoleSchema = z.object({
  role: MemberRole,
})

export const memberResponseSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  userId: z.string().uuid(),
  role: MemberRole,
  joinedAt: z.string().datetime(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string().nullable(),
  }).optional(),
})

// Invite schemas
export const createInviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['TRAINER', 'ATHLETE']), // Can't invite as OWNER
})

export const inviteResponseSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  email: z.string().email(),
  role: MemberRole,
  invitedById: z.string().uuid(),
  token: z.string(),
  status: InviteStatus,
  expiresAt: z.string().datetime(),
  createdAt: z.string().datetime(),
})

// User organization switch schema
export const switchOrganizationSchema = z.object({
  organizationId: z.string().uuid(),
})

// Types
export type CreateOrganization = z.infer<typeof createOrganizationSchema>
export type UpdateOrganization = z.infer<typeof updateOrganizationSchema>
export type OrganizationResponse = z.infer<typeof organizationResponseSchema>
export type UpdateMemberRole = z.infer<typeof updateMemberRoleSchema>
export type MemberResponse = z.infer<typeof memberResponseSchema>
export type CreateInvite = z.infer<typeof createInviteSchema>
export type InviteResponse = z.infer<typeof inviteResponseSchema>
export type SwitchOrganization = z.infer<typeof switchOrganizationSchema>
export type MemberRoleType = z.infer<typeof MemberRole>
export type InviteStatusType = z.infer<typeof InviteStatus>