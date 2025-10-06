import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { type MemberResponse } from '@repo/schemas/organization'

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

// GET /api/organizations/[id]/members - List organization members
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

    // Check if user is a member of the organization
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

    // Get filter from query params
    const { searchParams } = new URL(request.url)
    const roleFilter = searchParams.get('role')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const skip = (page - 1) * limit

    const whereClause: any = {
      organizationId: id
    }

    if (roleFilter) {
      whereClause.role = roleFilter.toUpperCase()
    }

    const [members, total] = await Promise.all([
      prisma.organizationMember.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          joinedAt: 'desc'
        }
      }),
      prisma.organizationMember.count({
        where: whereClause
      })
    ])

    const response: MemberResponse[] = members.map(member => ({
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
    }))

    return NextResponse.json({
      members: response,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Get organization members error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}