import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { getSignedLogoUrl } from '@/lib/blob'

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

// GET /api/users/me/pending-invites - Get all pending invites for current user's email
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to get email
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: user.id },
      select: { email: true }
    })

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get all pending invites for this email
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      invites: pendingInvites.map(invite => ({
        id: invite.id,
        token: invite.token,
        role: invite.role,
        expiresAt: invite.expiresAt.toISOString(),
        createdAt: invite.createdAt.toISOString(),
        organization: {
          id: invite.organization.id,
          name: invite.organization.name,
          slug: invite.organization.slug,
          description: invite.organization.description,
          logo: getSignedLogoUrl(invite.organization.logo)
        },
        invitedBy: invite.invitedBy
      }))
    }, { status: 200 })
  } catch (error) {
    console.error('Get pending invites error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}