import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

// DELETE /api/organizations/[id]/invites/[inviteId] - Cancel invitation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; inviteId: string }> }
) {
  try {
    const { id, inviteId } = await params
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
        { error: 'Only organization owners can delete invites' },
        { status: 403 }
      )
    }

    // Check if invite exists and belongs to this organization
    const invite = await prisma.organizationInvite.findFirst({
      where: {
        id: inviteId,
        organizationId: id
      }
    })

    if (!invite) {
      return NextResponse.json(
        { error: 'Invite not found' },
        { status: 404 }
      )
    }

    // Delete the invite
    await prisma.organizationInvite.delete({
      where: { id: inviteId }
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Delete invite error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}