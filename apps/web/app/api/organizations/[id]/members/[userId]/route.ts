import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import {
  updateMemberRoleSchema,
  type MemberResponse
} from '@repo/schemas/organization'
import { ZodError } from 'zod'

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

// PUT /api/organizations/[id]/members/[userId] - Update member role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is owner
    const userMembership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        userId: user.id,
        role: 'OWNER'
      }
    })

    if (!userMembership) {
      return NextResponse.json(
        { error: 'Only organization owners can update member roles' },
        { status: 403 }
      )
    }

    // Can't update your own role if you're the last owner
    if (userId === user.id) {
      const ownerCount = await prisma.organizationMember.count({
        where: {
          organizationId: id,
          role: 'OWNER'
        }
      })

      if (ownerCount === 1) {
        return NextResponse.json(
          { error: 'Cannot change role of the last owner' },
          { status: 400 }
        )
      }
    }

    const body = await request.json()
    const validatedData = updateMemberRoleSchema.parse(body)

    const member = await prisma.organizationMember.update({
      where: {
        organizationId_userId: {
          organizationId: id,
          userId: userId
        }
      },
      data: {
        role: validatedData.role
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    const response: MemberResponse = {
      id: member.id,
      organizationId: member.organizationId,
      userId: member.userId,
      role: member.role as any,
      joinedAt: member.joinedAt.toISOString(),
      user: member.user ? {
        id: member.user.id,
        email: member.user.email,
        name: member.user.name
      } : undefined
    }

    return NextResponse.json(response, { status: 200 })
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

    console.error('Update member role error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/organizations/[id]/members/[userId] - Remove member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is owner or removing themselves
    const userMembership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        userId: user.id
      }
    })

    if (!userMembership) {
      return NextResponse.json(
        { error: 'You are not a member of this organization' },
        { status: 403 }
      )
    }

    const canRemove = userMembership.role === 'OWNER' || userId === user.id

    if (!canRemove) {
      return NextResponse.json(
        { error: 'Only organization owners can remove members' },
        { status: 403 }
      )
    }

    // Can't remove the last owner
    if (userId === user.id && userMembership.role === 'OWNER') {
      const ownerCount = await prisma.organizationMember.count({
        where: {
          organizationId: id,
          role: 'OWNER'
        }
      })

      if (ownerCount === 1) {
        return NextResponse.json(
          { error: 'Cannot remove the last owner from the organization' },
          { status: 400 }
        )
      }
    }

    await prisma.organizationMember.delete({
      where: {
        organizationId_userId: {
          organizationId: id,
          userId: userId
        }
      }
    })

    // If user removed themselves, clear their current organization
    if (userId === user.id) {
      const userProfile = await prisma.userProfile.findUnique({
        where: { id: user.id }
      })

      if (userProfile?.currentOrganizationId === id) {
        await prisma.userProfile.update({
          where: { id: user.id },
          data: { currentOrganizationId: null }
        })
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Remove member error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}