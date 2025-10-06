import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

// GET /api/users/me - Get current user profile with organizations and pending invites
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: user.id },
      include: {
        currentOrganization: true
      }
    })

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get user's organizations with roles
    const organizations = await prisma.organizationMember.findMany({
      where: { userId: user.id },
      include: {
        organization: true
      }
    })

    // Get pending invites for user's email
    const pendingInvites = await prisma.organizationInvite.findMany({
      where: {
        email: userProfile.email,
        status: 'PENDING',
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        organization: true,
        invitedBy: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      user: {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        currentOrganizationId: userProfile.currentOrganizationId,
        createdAt: userProfile.createdAt.toISOString(),
        updatedAt: userProfile.updatedAt.toISOString()
      },
      currentOrganization: userProfile.currentOrganization ? {
        id: userProfile.currentOrganization.id,
        name: userProfile.currentOrganization.name,
        slug: userProfile.currentOrganization.slug,
        description: userProfile.currentOrganization.description,
        logo: userProfile.currentOrganization.logo
      } : null,
      organizations: organizations.map(om => ({
        id: om.organization.id,
        name: om.organization.name,
        slug: om.organization.slug,
        description: om.organization.description,
        logo: om.organization.logo,
        role: om.role,
        joinedAt: om.joinedAt.toISOString()
      })),
      pendingInvites: pendingInvites.map(invite => ({
        id: invite.id,
        token: invite.token,
        role: invite.role,
        expiresAt: invite.expiresAt.toISOString(),
        organization: {
          id: invite.organization.id,
          name: invite.organization.name,
          slug: invite.organization.slug,
          description: invite.organization.description,
          logo: invite.organization.logo
        },
        invitedBy: invite.invitedBy
      }))
    }, { status: 200 })
  } catch (error) {
    console.error('Get user profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}