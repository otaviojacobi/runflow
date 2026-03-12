import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import {
  createOrganizationSchema,
  type OrganizationResponse
} from '@repo/schemas/organization'
import { ZodError } from '@repo/schemas/zod'
import { generateUniqueSlug } from '@/lib/utils/slug'
import { getSignedLogoUrl } from '@/lib/blob'

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

// GET /api/organizations - List user's organizations
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizations = await prisma.organization.findMany({
      where: {
        members: {
          some: {
            userId: user.id
          }
        }
      },
      include: {
        members: {
          where: {
            userId: user.id
          }
        }
      }
    })

    const response = organizations.map(org => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      description: org.description,
      logo: getSignedLogoUrl(org.logo),
      primaryColor: org.primaryColor,
      secondaryColor: org.secondaryColor,
      createdAt: org.createdAt.toISOString(),
      updatedAt: org.updatedAt.toISOString(),
      role: org.members[0]?.role || 'ATHLETE'
    }))

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Get organizations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/organizations - Create new organization
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createOrganizationSchema.parse(body)

    // Generate unique slug
    const slug = await generateUniqueSlug(
      validatedData.name,
      async (slug) => {
        const existing = await prisma.organization.findUnique({
          where: { slug }
        })
        return !!existing
      }
    )

    // Create organization and add creator as owner in a transaction
    const organization = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          slug,
        }
      })

      // Add creator as owner
      await tx.organizationMember.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          role: 'OWNER'
        }
      })

      // Set as user's current organization
      await tx.userProfile.update({
        where: { id: user.id },
        data: { currentOrganizationId: org.id }
      })

      return org
    })

    const response: OrganizationResponse = {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      description: organization.description,
      logo: getSignedLogoUrl(organization.logo),
      primaryColor: organization.primaryColor,
      secondaryColor: organization.secondaryColor,
      createdAt: organization.createdAt.toISOString(),
      updatedAt: organization.updatedAt.toISOString(),
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

    console.error('Create organization error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}