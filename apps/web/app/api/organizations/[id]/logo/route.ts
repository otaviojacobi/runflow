import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import {
  uploadOrganizationLogo,
  deleteBlob,
  getSignedLogoUrl,
  ValidationError,
} from '@/lib/blob'

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

// POST /api/organizations/[id]/logo - Upload organization logo
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
        { error: 'Only organization owners can upload logos' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Get current org to check for existing logo
    const currentOrg = await prisma.organization.findUnique({
      where: { id },
      select: { logo: true }
    })

    if (!currentOrg) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Delete old logo if exists
    if (currentOrg.logo) {
      await deleteBlob(currentOrg.logo)
    }

    // Upload new logo
    const blobUrl = await uploadOrganizationLogo(id, file)

    // Update organization with new logo URL
    const organization = await prisma.organization.update({
      where: { id },
      data: { logo: blobUrl }
    })

    return NextResponse.json({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      description: organization.description,
      logo: getSignedLogoUrl(organization.logo),
      primaryColor: organization.primaryColor,
      secondaryColor: organization.secondaryColor,
      createdAt: organization.createdAt.toISOString(),
      updatedAt: organization.updatedAt.toISOString(),
    }, { status: 200 })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    console.error('Upload logo error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/organizations/[id]/logo - Remove organization logo
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
        { error: 'Only organization owners can remove logos' },
        { status: 403 }
      )
    }

    const organization = await prisma.organization.findUnique({
      where: { id },
      select: { logo: true }
    })

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Delete blob if exists
    if (organization.logo) {
      await deleteBlob(organization.logo)
    }

    // Set logo to null
    await prisma.organization.update({
      where: { id },
      data: { logo: null }
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Delete logo error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
