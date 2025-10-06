import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

// POST /api/invites/[token]/accept - Accept invitation (authenticated)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to get email
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: user.id }
    })

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Find the invite
    const invite = await prisma.organizationInvite.findUnique({
      where: {
        token
      },
      include: {
        organization: true
      }
    })

    if (!invite) {
      return NextResponse.json(
        { error: 'Invite not found' },
        { status: 404 }
      )
    }

    // Check if invite is for this user's email
    if (invite.email !== userProfile.email) {
      return NextResponse.json(
        { error: 'This invitation was sent to a different email address' },
        { status: 403 }
      )
    }

    // Check if invite is expired
    if (invite.expiresAt < new Date()) {
      // Update status if not already expired
      if (invite.status === 'PENDING') {
        await prisma.organizationInvite.update({
          where: { id: invite.id },
          data: { status: 'EXPIRED' }
        })
      }
      return NextResponse.json(
        { error: 'This invitation has expired' },
        { status: 410 }
      )
    }

    if (invite.status !== 'PENDING') {
      return NextResponse.json(
        { error: `This invitation has already been ${invite.status.toLowerCase()}` },
        { status: 410 }
      )
    }

    // Check if user is already a member
    const existingMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId: invite.organizationId,
        userId: user.id
      }
    })

    if (existingMember) {
      // Mark invite as accepted anyway
      await prisma.organizationInvite.update({
        where: { id: invite.id },
        data: { status: 'ACCEPTED' }
      })

      return NextResponse.json(
        { error: 'You are already a member of this organization' },
        { status: 400 }
      )
    }

    // Accept the invitation in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update invite status
      const updatedInvite = await tx.organizationInvite.update({
        where: { id: invite.id },
        data: { status: 'ACCEPTED' }
      })

      // Add user to organization
      const membership = await tx.organizationMember.create({
        data: {
          organizationId: invite.organizationId,
          userId: user.id,
          role: invite.role,
          invitedById: invite.invitedById
        }
      })

      // If this is the user's first organization, set it as current
      if (!userProfile.currentOrganizationId) {
        await tx.userProfile.update({
          where: { id: user.id },
          data: { currentOrganizationId: invite.organizationId }
        })
      }

      return { invite: updatedInvite, membership }
    })

    return NextResponse.json({
      success: true,
      organization: {
        id: invite.organization.id,
        name: invite.organization.name,
        slug: invite.organization.slug,
        description: invite.organization.description,
        logo: invite.organization.logo
      },
      role: result.membership.role
    }, { status: 200 })
  } catch (error) {
    console.error('Accept invite error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}