import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import {
  updateTrainingSchema,
  updateTrainingDetailsSchema,
  type TrainingResponse,
} from '@repo/schemas/training'
import { ZodError } from 'zod'

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

/**
 * GET /api/trainings/[id]
 * Get a single training by ID
 */
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

    // Fetch training with explicit filters for query planner optimization
    // Check if user has access (member or trainer/owner in org)
    const training = await prisma.training.findFirst({
      where: {
        id,
        OR: [
          // User is the member
          { memberId: user.id },
          // User is trainer/owner in the organization
          {
            organization: {
              members: {
                some: {
                  userId: user.id,
                  role: {
                    in: ['OWNER', 'TRAINER']
                  }
                }
              }
            }
          }
        ]
      },
      include: {
        trainer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        member: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        doneDetails: true,
      }
    })

    if (!training) {
      return NextResponse.json(
        { error: 'Training not found' },
        { status: 404 }
      )
    }

    const response: TrainingResponse = {
      id: training.id,
      title: training.title,
      subtitle: training.subtitle,
      description: training.description,
      type: training.type as 'RUNNING' | 'STRENGTH',
      status: training.status as 'TODO' | 'COMPLETED' | 'MISSED',
      scheduledDate: training.scheduledDate.toISOString(),
      trainerId: training.trainerId,
      memberId: training.memberId,
      organizationId: training.organizationId,
      createdAt: training.createdAt.toISOString(),
      updatedAt: training.updatedAt.toISOString(),
      trainer: training.trainer,
      member: training.member,
      doneDetails: training.doneDetails ? {
        id: training.doneDetails.id,
        trainingId: training.doneDetails.trainingId,
        distanceKm: training.doneDetails.distanceKm,
        paceMinPerKm: training.doneDetails.paceMinPerKm,
        elevationGainM: training.doneDetails.elevationGainM,
        routeData: training.doneDetails.routeData,
        exercises: training.doneDetails.exercises,
        totalVolume: training.doneDetails.totalVolume,
        durationSeconds: training.doneDetails.durationSeconds,
        averageHeartRate: training.doneDetails.averageHeartRate,
        maxHeartRate: training.doneDetails.maxHeartRate,
        calories: training.doneDetails.calories,
        notes: training.doneDetails.notes,
        completedAt: training.doneDetails.completedAt?.toISOString() ?? null,
        createdAt: training.doneDetails.createdAt.toISOString(),
        updatedAt: training.doneDetails.updatedAt.toISOString(),
      } : undefined,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Error fetching training:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/trainings/[id]
 * Update a training
 */
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

    const body = await request.json()

    // Check if this is a completion details update or basic training update
    // Details update will have fields from trainingDoneDetailsSchema
    const hasDetailsFields = body.distanceKm !== undefined ||
      body.paceMinPerKm !== undefined ||
      body.exercises !== undefined ||
      body.durationSeconds !== undefined ||
      body.completedAt !== undefined

    if (hasDetailsFields) {
      // Handle completion details update (member only)
      const validatedData = updateTrainingDetailsSchema.parse(body)

      // First, fetch training to check if it exists and get permissions
      const training = await prisma.training.findFirst({
        where: {
          id,
          OR: [
            { memberId: user.id },
            {
              organization: {
                members: {
                  some: {
                    userId: user.id,
                    role: { in: ['OWNER', 'TRAINER'] }
                  }
                }
              }
            }
          ]
        }
      })

      if (!training) {
        return NextResponse.json(
          { error: 'Training not found' },
          { status: 404 }
        )
      }

      // Only members can update completion details
      if (training.memberId !== user.id) {
        return NextResponse.json(
          { error: 'Forbidden: Only members can update completion details' },
          { status: 403 }
        )
      }

      // Prepare data for upsert
      const detailsData = {
        ...validatedData,
        trainingId: id,
        completedAt: validatedData.completedAt
          ? new Date(validatedData.completedAt)
          : undefined,
      }

      // Upsert completion details
      await prisma.trainingDoneDetails.upsert({
        where: { trainingId: id },
        create: detailsData,
        update: detailsData,
      })

      // Fetch updated training
      const updatedTraining = await prisma.training.findUnique({
        where: { id },
        include: {
          trainer: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          member: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          doneDetails: true,
        }
      })

      if (!updatedTraining) {
        return NextResponse.json(
          { error: 'Training not found after update' },
          { status: 500 }
        )
      }

      const response: TrainingResponse = {
        id: updatedTraining.id,
        title: updatedTraining.title,
        subtitle: updatedTraining.subtitle,
        description: updatedTraining.description,
        type: updatedTraining.type as 'RUNNING' | 'STRENGTH',
        status: updatedTraining.status as 'TODO' | 'COMPLETED' | 'MISSED',
        scheduledDate: updatedTraining.scheduledDate.toISOString(),
        trainerId: updatedTraining.trainerId,
        memberId: updatedTraining.memberId,
        organizationId: updatedTraining.organizationId,
        createdAt: updatedTraining.createdAt.toISOString(),
        updatedAt: updatedTraining.updatedAt.toISOString(),
        trainer: updatedTraining.trainer,
        member: updatedTraining.member,
        doneDetails: updatedTraining.doneDetails ? {
          id: updatedTraining.doneDetails.id,
          trainingId: updatedTraining.doneDetails.trainingId,
          distanceKm: updatedTraining.doneDetails.distanceKm,
          paceMinPerKm: updatedTraining.doneDetails.paceMinPerKm,
          elevationGainM: updatedTraining.doneDetails.elevationGainM,
          routeData: updatedTraining.doneDetails.routeData,
          exercises: updatedTraining.doneDetails.exercises,
          totalVolume: updatedTraining.doneDetails.totalVolume,
          durationSeconds: updatedTraining.doneDetails.durationSeconds,
          averageHeartRate: updatedTraining.doneDetails.averageHeartRate,
          maxHeartRate: updatedTraining.doneDetails.maxHeartRate,
          calories: updatedTraining.doneDetails.calories,
          notes: updatedTraining.doneDetails.notes,
          completedAt: updatedTraining.doneDetails.completedAt?.toISOString() ?? null,
          createdAt: updatedTraining.doneDetails.createdAt.toISOString(),
          updatedAt: updatedTraining.doneDetails.updatedAt.toISOString(),
        } : undefined,
      }

      return NextResponse.json(response, { status: 200 })
    } else {
      // Handle basic training update
      const validatedData = updateTrainingSchema.parse(body)

      // Convert scheduledDate if provided
      const updateData: any = { ...validatedData }
      if (validatedData.scheduledDate) {
        updateData.scheduledDate = new Date(validatedData.scheduledDate)
      }

      // Fetch training with explicit filter for query planner
      const training = await prisma.training.findFirst({
        where: {
          id,
          OR: [
            // User is the member (can update status only)
            { memberId: user.id },
            // User is the trainer (can update any field)
            { trainerId: user.id },
          ]
        }
      })

      if (!training) {
        return NextResponse.json(
          { error: 'Training not found' },
          { status: 404 }
        )
      }

      // Check permissions
      // Trainers can update any field, members can only update status
      const isMember = training.memberId === user.id
      const isTrainer = training.trainerId === user.id

      if (!isMember && !isTrainer) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }

      // If member is updating, only allow status changes
      if (isMember && !isTrainer) {
        const hasNonStatusChanges = Object.keys(validatedData).some(
          key => key !== 'status'
        )
        if (hasNonStatusChanges) {
          return NextResponse.json(
            { error: 'Members can only update training status' },
            { status: 403 }
          )
        }
      }

      // Update training (RLS will handle final authorization)
      const updatedTraining = await prisma.training.update({
        where: { id },
        data: updateData,
        include: {
          trainer: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          member: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          doneDetails: true,
        }
      })

      const response: TrainingResponse = {
        id: updatedTraining.id,
        title: updatedTraining.title,
        subtitle: updatedTraining.subtitle,
        description: updatedTraining.description,
        type: updatedTraining.type as 'RUNNING' | 'STRENGTH',
        status: updatedTraining.status as 'TODO' | 'COMPLETED' | 'MISSED',
        scheduledDate: updatedTraining.scheduledDate.toISOString(),
        trainerId: updatedTraining.trainerId,
        memberId: updatedTraining.memberId,
        organizationId: updatedTraining.organizationId,
        createdAt: updatedTraining.createdAt.toISOString(),
        updatedAt: updatedTraining.updatedAt.toISOString(),
        trainer: updatedTraining.trainer,
        member: updatedTraining.member,
        doneDetails: updatedTraining.doneDetails ? {
          id: updatedTraining.doneDetails.id,
          trainingId: updatedTraining.doneDetails.trainingId,
          distanceKm: updatedTraining.doneDetails.distanceKm,
          paceMinPerKm: updatedTraining.doneDetails.paceMinPerKm,
          elevationGainM: updatedTraining.doneDetails.elevationGainM,
          routeData: updatedTraining.doneDetails.routeData,
          exercises: updatedTraining.doneDetails.exercises,
          totalVolume: updatedTraining.doneDetails.totalVolume,
          durationSeconds: updatedTraining.doneDetails.durationSeconds,
          averageHeartRate: updatedTraining.doneDetails.averageHeartRate,
          maxHeartRate: updatedTraining.doneDetails.maxHeartRate,
          calories: updatedTraining.doneDetails.calories,
          notes: updatedTraining.doneDetails.notes,
          completedAt: updatedTraining.doneDetails.completedAt?.toISOString() ?? null,
          createdAt: updatedTraining.doneDetails.createdAt.toISOString(),
          updatedAt: updatedTraining.doneDetails.updatedAt.toISOString(),
        } : undefined,
      }

      return NextResponse.json(response, { status: 200 })
    }
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

    console.error('Error updating training:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH alias for PUT (both do the same thing)
export const PATCH = PUT

/**
 * DELETE /api/trainings/[id]
 * Delete a training
 */
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

    // Fetch training with explicit filter - only trainer who created it
    // and who is still a trainer/owner in the org can delete
    const training = await prisma.training.findFirst({
      where: {
        id,
        trainerId: user.id, // Only the trainer who created it
        organization: {
          members: {
            some: {
              userId: user.id,
              role: {
                in: ['OWNER', 'TRAINER']
              }
            }
          }
        }
      }
    })

    if (!training) {
      return NextResponse.json(
        { error: 'Training not found or forbidden' },
        { status: 404 }
      )
    }

    // Delete training with explicit filter (cascade will delete details)
    await prisma.training.delete({
      where: {
        id,
      }
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting training:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
