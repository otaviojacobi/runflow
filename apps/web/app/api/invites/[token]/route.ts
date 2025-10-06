import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { type InviteResponse } from '@repo/schemas/organization'

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

// GET /api/invites/[token] - Get invite details (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const invite = await prisma.organizationInvite.findUnique({
      where: {
        token
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            logo: true
          }
        },
        invitedBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!invite) {
      return NextResponse.json(
        { error: 'Invite not found' },
        { status: 404 }
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

    return NextResponse.json({
      invite: {
        id: invite.id,
        organizationId: invite.organizationId,
        email: invite.email,
        role: invite.role,
        status: invite.status,
        expiresAt: invite.expiresAt.toISOString(),
        createdAt: invite.createdAt.toISOString()
      },
      organization: invite.organization,
      invitedBy: invite.invitedBy
    }, { status: 200 })
  } catch (error) {
    console.error('Get invite error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}