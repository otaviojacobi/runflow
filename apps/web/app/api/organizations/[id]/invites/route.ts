import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import {
  createInviteSchema,
  type InviteResponse
} from '@repo/schemas/organization'
import { ZodError } from 'zod'
import { generateInviteToken, getInviteExpirationDate } from '@/lib/utils/token'

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

// GET /api/organizations/[id]/invites - List pending invites
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is owner or trainer
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        userId: user.id,
        role: {
          in: ['OWNER', 'TRAINER']
        }
      }
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Only organization owners and trainers can view invites' },
        { status: 403 }
      )
    }

    const invites = await prisma.organizationInvite.findMany({
      where: {
        organizationId: id,
        status: 'PENDING'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const response: InviteResponse[] = invites.map(invite => ({
      id: invite.id,
      organizationId: invite.organizationId,
      email: invite.email,
      role: invite.role as any,
      invitedById: invite.invitedById,
      token: invite.token,
      status: invite.status as any,
      expiresAt: invite.expiresAt.toISOString(),
      createdAt: invite.createdAt.toISOString()
    }))

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Get invites error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/organizations/[id]/invites - Create invitation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is owner or trainer
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        userId: user.id,
        role: {
          in: ['OWNER', 'TRAINER']
        }
      }
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Only organization owners and trainers can create invites' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createInviteSchema.parse(body)

    // Check if user is already a member
    const existingMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        user: {
          email: validatedData.email
        }
      }
    })

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this organization' },
        { status: 400 }
      )
    }

    // Check if there's already a pending invite
    const existingInvite = await prisma.organizationInvite.findFirst({
      where: {
        organizationId: id,
        email: validatedData.email,
        status: 'PENDING'
      }
    })

    if (existingInvite) {
      return NextResponse.json(
        { error: 'An invitation has already been sent to this email' },
        { status: 400 }
      )
    }

    // Create the invite
    const invite = await prisma.organizationInvite.create({
      data: {
        organizationId: id,
        email: validatedData.email,
        role: validatedData.role,
        invitedById: user.id,
        token: generateInviteToken(),
        expiresAt: getInviteExpirationDate(),
        status: 'PENDING'
      }
    })

    // TODO: Send invitation email here
    // For now, we'll just return the invite with the token

    const response: InviteResponse = {
      id: invite.id,
      organizationId: invite.organizationId,
      email: invite.email,
      role: invite.role as any,
      invitedById: invite.invitedById,
      token: invite.token,
      status: invite.status as any,
      expiresAt: invite.expiresAt.toISOString(),
      createdAt: invite.createdAt.toISOString()
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.errors.reduce((acc, err) => {
        const path = err.path.join('.')
        if (!acc[path]) acc[path] = []
        acc[path].push(err.message)
        return acc
      }, {} as Record<string, string[]>)

      return NextResponse.json(
        { error: 'Validation failed', details },
        { status: 400 }
      )
    }

    console.error('Create invite error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}