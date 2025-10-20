import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import {
  createTrainingSchema,
  listTrainingsQuerySchema,
  type TrainingResponse
} from '@repo/schemas/training'
import { ZodError } from 'zod'

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

/**
 * GET /api/trainings
 * List trainings with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const queryParams = {
      organizationId: searchParams.get('organizationId') || undefined,
      memberId: searchParams.get('memberId') || undefined,
      trainerId: searchParams.get('trainerId') || undefined,
      status: searchParams.get('status') || undefined,
      type: searchParams.get('type') || undefined,
      limit: searchParams.get('limit') || '50',
      offset: searchParams.get('offset') || '0',
    }

    const validatedQuery = listTrainingsQuerySchema.parse(queryParams)

    // Build where clause
    // IMPORTANT: Always add explicit filters for query planner optimization
    // Even though RLS enforces security, explicit WHERE clauses help Postgres
    // generate better execution plans
    const where: any = {
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
    }

    // Add optional filters
    if (validatedQuery.organizationId) {
      where.organizationId = validatedQuery.organizationId
    }
    if (validatedQuery.memberId) {
      where.memberId = validatedQuery.memberId
    }
    if (validatedQuery.trainerId) {
      where.trainerId = validatedQuery.trainerId
    }
    if (validatedQuery.status) {
      where.status = validatedQuery.status
    }
    if (validatedQuery.type) {
      where.type = validatedQuery.type
    }

    // Fetch trainings with explicit filters for query planner
    const trainings = await prisma.training.findMany({
      where,
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
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: validatedQuery.limit,
      skip: validatedQuery.offset,
    })

    // Format response
    const response: TrainingResponse[] = trainings.map((training) => ({
      id: training.id,
      title: training.title,
      subtitle: training.subtitle,
      description: training.description,
      type: training.type as 'RUNNING' | 'STRENGTH',
      status: training.status as 'TODO' | 'COMPLETED' | 'MISSED',
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
    }))

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

    console.error('Error fetching trainings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/trainings
 * Create a new training
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createTrainingSchema.parse(body)

    // Check if user is trainer/owner in the organization with explicit filter
    // This helps query planner even though RLS would enforce it
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: validatedData.organizationId,
        userId: user.id,
        role: {
          in: ['OWNER', 'TRAINER']
        }
      }
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Forbidden: Only trainers and owners can create trainings' },
        { status: 403 }
      )
    }

    // Check if member exists in the same organization with explicit filter
    const memberExists = await prisma.organizationMember.findFirst({
      where: {
        organizationId: validatedData.organizationId,
        userId: validatedData.memberId,
      }
    })

    if (!memberExists) {
      return NextResponse.json(
        { error: 'Member not found in organization' },
        { status: 404 }
      )
    }

    // Create training
    const training = await prisma.training.create({
      data: {
        title: validatedData.title,
        subtitle: validatedData.subtitle,
        description: validatedData.description,
        type: validatedData.type,
        trainerId: user.id,
        memberId: validatedData.memberId,
        organizationId: validatedData.organizationId,
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
      }
    })

    const response: TrainingResponse = {
      id: training.id,
      title: training.title,
      subtitle: training.subtitle,
      description: training.description,
      type: training.type as 'RUNNING' | 'STRENGTH',
      status: training.status as 'TODO' | 'COMPLETED' | 'MISSED',
      trainerId: training.trainerId,
      memberId: training.memberId,
      organizationId: training.organizationId,
      createdAt: training.createdAt.toISOString(),
      updatedAt: training.updatedAt.toISOString(),
      trainer: training.trainer,
      member: training.member,
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

    console.error('Error creating training:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
