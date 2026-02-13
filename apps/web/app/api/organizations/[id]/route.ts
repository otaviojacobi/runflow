import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import {
  updateOrganizationSchema,
  type OrganizationResponse
} from '@repo/schemas/organization'
import { ZodError } from '@repo/schemas/zod'

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

// GET /api/organizations/[id] - Get organization details
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

    const organization = await prisma.organization.findFirst({
      where: {
        id,
        members: {
          some: {
            userId: user.id
          }
        }
      }
    })

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    const response: OrganizationResponse = {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      description: organization.description,
      logo: organization.logo,
      createdAt: organization.createdAt.toISOString(),
      updatedAt: organization.updatedAt.toISOString(),
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Get organization error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/organizations/[id] - Update organization
export async function PUT(
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

    // Check if user is owner
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        userId: user.id,
        role: 'OWNER'
      }
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Only organization owners can update organization details' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateOrganizationSchema.parse(body)

    const organization = await prisma.organization.update({
      where: { id },
      data: validatedData
    })

    const response: OrganizationResponse = {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      description: organization.description,
      logo: organization.logo,
      createdAt: organization.createdAt.toISOString(),
      updatedAt: organization.updatedAt.toISOString(),
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

    console.error('Update organization error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/organizations/[id] - Delete organization
export async function DELETE(
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

    // Check if user is owner
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        userId: user.id,
        role: 'OWNER'
      }
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Only organization owners can delete organizations' },
        { status: 403 }
      )
    }

    // Delete organization (cascade will handle members and invites)
    await prisma.organization.delete({
      where: { id }
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Delete organization error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}