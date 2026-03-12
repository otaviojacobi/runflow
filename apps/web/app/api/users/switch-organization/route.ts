import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { switchOrganizationSchema } from '@repo/schemas/organization'
import { ZodError } from '@repo/schemas/zod'
import { getSignedLogoUrl } from '@/lib/blob'

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

// POST /api/users/switch-organization - Switch current organization
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = switchOrganizationSchema.parse(body)

    // Verify user is a member of the organization
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: validatedData.organizationId,
        userId: user.id
      }
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a member of this organization' },
        { status: 403 }
      )
    }

    // Update user's current organization
    const updatedProfile = await prisma.userProfile.update({
      where: { id: user.id },
      data: { currentOrganizationId: validatedData.organizationId },
      include: {
        currentOrganization: true
      }
    })

    return NextResponse.json({
      user: {
        id: updatedProfile.id,
        email: updatedProfile.email,
        name: updatedProfile.name,
        currentOrganizationId: updatedProfile.currentOrganizationId
      },
      organization: updatedProfile.currentOrganization ? {
        id: updatedProfile.currentOrganization.id,
        name: updatedProfile.currentOrganization.name,
        slug: updatedProfile.currentOrganization.slug,
        description: updatedProfile.currentOrganization.description,
        logo: getSignedLogoUrl(updatedProfile.currentOrganization.logo)
      } : null,
      role: membership.role
    }, { status: 200 })
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

    console.error('Switch organization error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}