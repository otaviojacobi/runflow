import { prisma } from '@/lib/db'
import { createClient } from '@supabase/supabase-js'
import { createVerifiedTestUser } from '@/lib/supabase/test-client'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const API_BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000'

describe('Trainings API - Complete Integration Test Suite', () => {
  const testUsers: { id: string; email: string; token: string; name: string }[] = []
  const testOrgs: string[] = []
  const testTrainings: string[] = []

  // Helper function to create a test user with profile
  async function createTestUser(prefix: string) {
    const email = `${prefix}-${Date.now()}@example.com`
    const password = 'TestPassword123!'

    const { data: authData, error } = await createVerifiedTestUser({
      email,
      password
    })

    if (error || !authData.user || !authData.session) {
      throw new Error('Failed to create test user')
    }

    await prisma.userProfile.create({
      data: {
        id: authData.user.id,
        email,
        name: `${prefix} User`
      }
    })

    return {
      id: authData.user.id,
      email,
      token: authData.session.access_token,
      name: `${prefix} User`
    }
  }

  // Helper to make API calls
  async function apiCall(
    method: string,
    path: string,
    body?: any,
    token?: string
  ) {
    const url = `${API_BASE_URL}${path}`
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    })

    const data = response.status === 204 ? null : await response.json()
    return { response, data }
  }

  beforeAll(async () => {
    // Create all test users in parallel
    const [owner, trainer, athlete1, athlete2, outsider] = await Promise.all([
      createTestUser('owner'),
      createTestUser('trainer'),
      createTestUser('athlete1'),
      createTestUser('athlete2'),
      createTestUser('outsider'),
    ])

    testUsers.push(owner, trainer, athlete1, athlete2, outsider)

    // Create organization and add members in a single transaction
    const org = await prisma.$transaction(async (tx) => {
      // Create organization
      const newOrg = await tx.organization.create({
        data: {
          name: 'Training Test Org',
          slug: `training-test-org-${Date.now()}`,
          description: 'Test org for trainings',
        }
      })

      // Add all members at once
      await tx.organizationMember.createMany({
        data: [
          { organizationId: newOrg.id, userId: owner.id, role: 'OWNER' },
          { organizationId: newOrg.id, userId: trainer.id, role: 'TRAINER' },
          { organizationId: newOrg.id, userId: athlete1.id, role: 'ATHLETE' },
          { organizationId: newOrg.id, userId: athlete2.id, role: 'ATHLETE' },
        ]
      })

      // Set owner's current organization
      await tx.userProfile.update({
        where: { id: owner.id },
        data: { currentOrganizationId: newOrg.id }
      })

      return newOrg
    })

    testOrgs.push(org.id)
  }, 8000) // 8 second timeout for parallel user creation + single transaction

  afterAll(async () => {
    // Clean up trainings
    for (const trainingId of testTrainings) {
      try {
        await prisma.training.delete({ where: { id: trainingId } })
      } catch {}
    }

    // Clean up organizations
    for (const orgId of testOrgs) {
      try {
        await prisma.organization.delete({ where: { id: orgId } })
      } catch {}
    }

    // Clean up users
    for (const user of testUsers) {
      try {
        await prisma.userProfile.delete({ where: { id: user.id } })
        await supabase.auth.admin.deleteUser(user.id)
      } catch {}
    }

    await prisma.$disconnect()
  })

  describe('POST /api/trainings - Create Training', () => {
    it('should allow owner to create training for athlete', async () => {
      const owner = testUsers[0]
      const athlete = testUsers[2]
      const org = await prisma.organization.findFirst({
        where: { members: { some: { userId: owner.id, role: 'OWNER' } } }
      })

      const { response, data } = await apiCall(
        'POST',
        '/api/trainings',
        {
          title: '5K Morning Run',
          subtitle: 'Easy pace',
          description: 'Focus on maintaining steady breathing',
          type: 'RUNNING',
          memberId: athlete.id,
          organizationId: org!.id
        },
        owner.token
      )

      expect(response.status).toBe(201)
      expect(data.id).toBeDefined()
      expect(data.title).toBe('5K Morning Run')
      expect(data.type).toBe('RUNNING')
      expect(data.status).toBe('TODO')
      expect(data.trainerId).toBe(owner.id)
      expect(data.memberId).toBe(athlete.id)
      expect(data.trainer).toBeDefined()
      expect(data.member).toBeDefined()

      testTrainings.push(data.id)
    })

    it('should allow trainer to create training for athlete', async () => {
      const trainer = testUsers[1]
      const athlete = testUsers[2]
      const org = await prisma.organization.findFirst({
        where: { members: { some: { userId: trainer.id, role: 'TRAINER' } } }
      })

      const { response, data } = await apiCall(
        'POST',
        '/api/trainings',
        {
          title: 'Strength Training - Upper Body',
          type: 'STRENGTH',
          memberId: athlete.id,
          organizationId: org!.id
        },
        trainer.token
      )

      expect(response.status).toBe(201)
      expect(data.type).toBe('STRENGTH')
      expect(data.trainerId).toBe(trainer.id)

      testTrainings.push(data.id)
    })

    it('should reject when athlete tries to create training', async () => {
      const athlete = testUsers[2]
      const org = await prisma.organization.findFirst({
        where: { members: { some: { userId: athlete.id } } }
      })

      const { response, data } = await apiCall(
        'POST',
        '/api/trainings',
        {
          title: 'Self-assigned training',
          type: 'RUNNING',
          memberId: athlete.id,
          organizationId: org!.id
        },
        athlete.token
      )

      expect(response.status).toBe(403)
      expect(data.error).toContain('Forbidden')
    })

    it('should reject when creating training for non-member', async () => {
      const owner = testUsers[0]
      const outsider = testUsers[4]
      const org = await prisma.organization.findFirst({
        where: { members: { some: { userId: owner.id, role: 'OWNER' } } }
      })

      const { response, data } = await apiCall(
        'POST',
        '/api/trainings',
        {
          title: 'Invalid training',
          type: 'RUNNING',
          memberId: outsider.id,
          organizationId: org!.id
        },
        owner.token
      )

      expect(response.status).toBe(404)
      expect(data.error).toContain('Member not found')
    })

    it('should reject when outsider tries to create training', async () => {
      const outsider = testUsers[4]
      const athlete = testUsers[2]
      const org = await prisma.organization.findFirst({
        where: { members: { some: { userId: athlete.id } } }
      })

      const { response, data } = await apiCall(
        'POST',
        '/api/trainings',
        {
          title: 'Unauthorized training',
          type: 'RUNNING',
          memberId: athlete.id,
          organizationId: org!.id
        },
        outsider.token
      )

      expect(response.status).toBe(403)
      expect(data.error).toContain('Forbidden')
    })

    it('should validate required fields', async () => {
      const owner = testUsers[0]

      const { response, data } = await apiCall(
        'POST',
        '/api/trainings',
        {
          type: 'RUNNING'
          // Missing title, memberId, organizationId
        },
        owner.token
      )

      expect(response.status).toBe(400)
      expect(data.error).toContain('Validation failed')
    })
  })

  describe('GET /api/trainings - List Trainings', () => {
    let setupTrainingId: string

    beforeAll(async () => {
      // Create a training directly in DB for listing tests
      const trainer = testUsers[1]
      const athlete = testUsers[2]
      const org = testOrgs[0]

      const training = await prisma.training.create({
        data: {
          title: 'List Test Training',
          type: 'RUNNING',
          trainerId: trainer.id,
          memberId: athlete.id,
          organizationId: org,
        }
      })

      setupTrainingId = training.id
      testTrainings.push(training.id)
    })

    it('should allow athlete to list their own trainings', async () => {
      const athlete = testUsers[2]

      const { response, data } = await apiCall(
        'GET',
        '/api/trainings',
        null,
        athlete.token
      )

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThan(0)

      // All trainings should be for this athlete
      data.forEach((training: any) => {
        expect(training.memberId).toBe(athlete.id)
      })
    })

    it('should allow trainer to list trainings in their org', async () => {
      const trainer = testUsers[1]

      const { response, data } = await apiCall(
        'GET',
        '/api/trainings',
        null,
        trainer.token
      )

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThan(0)
    })

    it('should filter trainings by organizationId', async () => {
      const owner = testUsers[0]
      const org = await prisma.organization.findFirst({
        where: { members: { some: { userId: owner.id, role: 'OWNER' } } }
      })

      const { response, data } = await apiCall(
        'GET',
        `/api/trainings?organizationId=${org!.id}`,
        null,
        owner.token
      )

      expect(response.status).toBe(200)
      data.forEach((training: any) => {
        expect(training.organizationId).toBe(org!.id)
      })
    })

    it('should filter trainings by memberId', async () => {
      const trainer = testUsers[1]
      const athlete = testUsers[2]

      const { response, data } = await apiCall(
        'GET',
        `/api/trainings?memberId=${athlete.id}`,
        null,
        trainer.token
      )

      expect(response.status).toBe(200)
      data.forEach((training: any) => {
        expect(training.memberId).toBe(athlete.id)
      })
    })

    it('should filter trainings by status', async () => {
      const athlete = testUsers[2]

      const { response, data } = await apiCall(
        'GET',
        '/api/trainings?status=TODO',
        null,
        athlete.token
      )

      expect(response.status).toBe(200)
      data.forEach((training: any) => {
        expect(training.status).toBe('TODO')
      })
    })

    it('should filter trainings by type', async () => {
      const athlete = testUsers[2]

      const { response, data } = await apiCall(
        'GET',
        '/api/trainings?type=RUNNING',
        null,
        athlete.token
      )

      expect(response.status).toBe(200)
      data.forEach((training: any) => {
        expect(training.type).toBe('RUNNING')
      })
    })

    it('should not show trainings to outsiders', async () => {
      const outsider = testUsers[4]

      const { response, data } = await apiCall(
        'GET',
        '/api/trainings',
        null,
        outsider.token
      )

      expect(response.status).toBe(200)
      expect(data.length).toBe(0)
    })

    it('should respect pagination', async () => {
      const athlete = testUsers[2]

      const { response, data } = await apiCall(
        'GET',
        '/api/trainings?limit=1&offset=0',
        null,
        athlete.token
      )

      expect(response.status).toBe(200)
      expect(data.length).toBeLessThanOrEqual(1)
    })
  })

  describe('GET /api/trainings/[id] - Get Single Training', () => {
    let testTrainingId: string

    beforeAll(async () => {
      const trainer = testUsers[1]
      const athlete = testUsers[2]
      const org = testOrgs[0]

      const training = await prisma.training.create({
        data: {
          title: 'Get Test Training',
          subtitle: 'For single fetch tests',
          description: 'Detailed description here',
          type: 'RUNNING',
          trainerId: trainer.id,
          memberId: athlete.id,
          organizationId: org,
        }
      })

      testTrainingId = training.id
      testTrainings.push(training.id)
    })

    it('should allow athlete to view their own training', async () => {
      const athlete = testUsers[2]

      const { response, data } = await apiCall(
        'GET',
        `/api/trainings/${testTrainingId}`,
        null,
        athlete.token
      )

      expect(response.status).toBe(200)
      expect(data.id).toBe(testTrainingId)
      expect(data.title).toBe('Get Test Training')
      expect(data.subtitle).toBe('For single fetch tests')
      expect(data.description).toBe('Detailed description here')
      expect(data.trainer).toBeDefined()
      expect(data.member).toBeDefined()
    })

    it('should allow trainer to view training they created', async () => {
      const trainer = testUsers[1]

      const { response, data } = await apiCall(
        'GET',
        `/api/trainings/${testTrainingId}`,
        null,
        trainer.token
      )

      expect(response.status).toBe(200)
      expect(data.id).toBe(testTrainingId)
    })

    it('should allow owner to view trainings in their org', async () => {
      const owner = testUsers[0]

      const { response, data } = await apiCall(
        'GET',
        `/api/trainings/${testTrainingId}`,
        null,
        owner.token
      )

      expect(response.status).toBe(200)
      expect(data.id).toBe(testTrainingId)
    })

    it('should reject outsider from viewing training', async () => {
      const outsider = testUsers[4]

      const { response, data } = await apiCall(
        'GET',
        `/api/trainings/${testTrainingId}`,
        null,
        outsider.token
      )

      expect(response.status).toBe(404)
      expect(data.error).toContain('Training not found')
    })

    it('should return 404 for non-existent training', async () => {
      const athlete = testUsers[2]

      const { response, data } = await apiCall(
        'GET',
        '/api/trainings/00000000-0000-0000-0000-000000000000',
        null,
        athlete.token
      )

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/trainings/[id] - Update Training', () => {
    let testTrainingId: string

    beforeAll(async () => {
      const trainer = testUsers[1]
      const athlete = testUsers[2]
      const org = testOrgs[0]

      const training = await prisma.training.create({
        data: {
          title: 'Update Test Training',
          type: 'RUNNING',
          trainerId: trainer.id,
          memberId: athlete.id,
          organizationId: org,
        }
      })

      testTrainingId = training.id
      testTrainings.push(training.id)
    })

    it('should allow trainer to update training details', async () => {
      const trainer = testUsers[1]

      const { response, data } = await apiCall(
        'PUT',
        `/api/trainings/${testTrainingId}`,
        {
          title: 'Updated Training Title',
          subtitle: 'New subtitle',
          description: 'Updated description'
        },
        trainer.token
      )

      expect(response.status).toBe(200)
      expect(data.title).toBe('Updated Training Title')
      expect(data.subtitle).toBe('New subtitle')
      expect(data.description).toBe('Updated description')
    })

    it('should allow athlete to update training status', async () => {
      const athlete = testUsers[2]

      const { response, data } = await apiCall(
        'PUT',
        `/api/trainings/${testTrainingId}`,
        {
          status: 'COMPLETED'
        },
        athlete.token
      )

      expect(response.status).toBe(200)
      expect(data.status).toBe('COMPLETED')
    })

    it('should reject athlete updating non-status fields', async () => {
      const athlete = testUsers[2]

      const { response, data } = await apiCall(
        'PUT',
        `/api/trainings/${testTrainingId}`,
        {
          title: 'Athlete trying to change title'
        },
        athlete.token
      )

      expect(response.status).toBe(403)
      expect(data.error).toContain('Members can only update training status')
    })

    it('should allow athlete to add completion details', async () => {
      const athlete = testUsers[2]

      const { response, data } = await apiCall(
        'PUT',
        `/api/trainings/${testTrainingId}`,
        {
          distanceKm: 5.0,
          durationSeconds: 1800,
          paceMinPerKm: 6.0,
          averageHeartRate: 150,
          calories: 300,
          completedAt: new Date().toISOString()
        },
        athlete.token
      )

      expect(response.status).toBe(200)
      expect(data.doneDetails).toBeDefined()
      expect(data.doneDetails.distanceKm).toBe(5.0)
      expect(data.doneDetails.durationSeconds).toBe(1800)
      expect(data.doneDetails.paceMinPerKm).toBe(6.0)
    })

    it('should reject trainer from updating completion details', async () => {
      const trainer = testUsers[1]

      const { response, data } = await apiCall(
        'PUT',
        `/api/trainings/${testTrainingId}`,
        {
          distanceKm: 10.0,
          durationSeconds: 3600
        },
        trainer.token
      )

      expect(response.status).toBe(403)
      expect(data.error).toContain('Only members can update completion details')
    })

    it('should reject outsider from updating training', async () => {
      const outsider = testUsers[4]

      const { response, data } = await apiCall(
        'PUT',
        `/api/trainings/${testTrainingId}`,
        {
          status: 'MISSED'
        },
        outsider.token
      )

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/trainings/[id] - Update Strength Training Completion', () => {
    let strengthTrainingId: string

    beforeAll(async () => {
      const trainer = testUsers[1]
      const athlete = testUsers[2]
      const org = testOrgs[0]

      const training = await prisma.training.create({
        data: {
          title: 'Strength Session',
          type: 'STRENGTH',
          trainerId: trainer.id,
          memberId: athlete.id,
          organizationId: org,
        }
      })

      strengthTrainingId = training.id
      testTrainings.push(training.id)
    })

    it('should allow athlete to add strength training completion details', async () => {
      const athlete = testUsers[2]

      const { response, data } = await apiCall(
        'PUT',
        `/api/trainings/${strengthTrainingId}`,
        {
          exercises: [
            {
              name: 'Bench Press',
              sets: 3,
              reps: 10,
              weight: 80,
              restTimeSeconds: 90
            },
            {
              name: 'Squats',
              sets: 4,
              reps: 8,
              weight: 100
            }
          ],
          totalVolume: 2400,
          durationSeconds: 3600,
          calories: 400,
          notes: 'Great session, felt strong',
          completedAt: new Date().toISOString()
        },
        athlete.token
      )

      expect(response.status).toBe(200)
      expect(data.doneDetails).toBeDefined()
      expect(data.doneDetails.exercises).toBeDefined()
      expect(data.doneDetails.exercises.length).toBe(2)
      expect(data.doneDetails.totalVolume).toBe(2400)
      expect(data.doneDetails.notes).toBe('Great session, felt strong')
    })
  })

  describe('DELETE /api/trainings/[id] - Delete Training', () => {
    it('should allow trainer to delete their own training', async () => {
      const trainer = testUsers[1]
      const athlete = testUsers[2]
      const org = await prisma.organization.findFirst({
        where: { members: { some: { userId: trainer.id, role: 'TRAINER' } } }
      })

      // Create training to delete
      const { data: training } = await apiCall(
        'POST',
        '/api/trainings',
        {
          title: 'Training to Delete',
          type: 'RUNNING',
          memberId: athlete.id,
          organizationId: org!.id
        },
        trainer.token
      )

      const { response, data } = await apiCall(
        'DELETE',
        `/api/trainings/${training.id}`,
        null,
        trainer.token
      )

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Verify training is deleted
      const deleted = await prisma.training.findUnique({
        where: { id: training.id }
      })
      expect(deleted).toBeNull()
    })

    it('should allow owner to delete trainings in their org', async () => {
      const owner = testUsers[0]
      const athlete = testUsers[2]
      const org = await prisma.organization.findFirst({
        where: { members: { some: { userId: owner.id, role: 'OWNER' } } }
      })

      // Create training to delete
      const { data: training } = await apiCall(
        'POST',
        '/api/trainings',
        {
          title: 'Owner Delete Test',
          type: 'RUNNING',
          memberId: athlete.id,
          organizationId: org!.id
        },
        owner.token
      )

      const { response } = await apiCall(
        'DELETE',
        `/api/trainings/${training.id}`,
        null,
        owner.token
      )

      expect(response.status).toBe(200)
    })

    it('should reject athlete from deleting training', async () => {
      const trainer = testUsers[1]
      const athlete = testUsers[2]
      const org = await prisma.organization.findFirst({
        where: { members: { some: { userId: trainer.id, role: 'TRAINER' } } }
      })

      // Create training
      const { data: training } = await apiCall(
        'POST',
        '/api/trainings',
        {
          title: 'Athlete Cannot Delete',
          type: 'RUNNING',
          memberId: athlete.id,
          organizationId: org!.id
        },
        trainer.token
      )

      testTrainings.push(training.id)

      // Try to delete as athlete
      const { response, data } = await apiCall(
        'DELETE',
        `/api/trainings/${training.id}`,
        null,
        athlete.token
      )

      expect(response.status).toBe(404)
      expect(data.error).toContain('Training not found or forbidden')
    })

    it('should reject outsider from deleting training', async () => {
      const trainer = testUsers[1]
      const athlete = testUsers[2]
      const outsider = testUsers[4]
      const org = await prisma.organization.findFirst({
        where: { members: { some: { userId: trainer.id, role: 'TRAINER' } } }
      })

      // Create training
      const { data: training } = await apiCall(
        'POST',
        '/api/trainings',
        {
          title: 'Outsider Cannot Delete',
          type: 'RUNNING',
          memberId: athlete.id,
          organizationId: org!.id
        },
        trainer.token
      )

      testTrainings.push(training.id)

      // Try to delete as outsider
      const { response, data } = await apiCall(
        'DELETE',
        `/api/trainings/${training.id}`,
        null,
        outsider.token
      )

      expect(response.status).toBe(404)
    })

    it('should cascade delete completion details', async () => {
      const trainer = testUsers[1]
      const athlete = testUsers[2]
      const org = await prisma.organization.findFirst({
        where: { members: { some: { userId: trainer.id, role: 'TRAINER' } } }
      })

      // Create training
      const { data: training } = await apiCall(
        'POST',
        '/api/trainings',
        {
          title: 'Cascade Delete Test',
          type: 'RUNNING',
          memberId: athlete.id,
          organizationId: org!.id
        },
        trainer.token
      )

      // Add completion details
      await apiCall(
        'PUT',
        `/api/trainings/${training.id}`,
        {
          distanceKm: 5.0,
          durationSeconds: 1800
        },
        athlete.token
      )

      // Delete training
      await apiCall(
        'DELETE',
        `/api/trainings/${training.id}`,
        null,
        trainer.token
      )

      // Verify completion details are also deleted
      const details = await prisma.trainingDoneDetails.findUnique({
        where: { trainingId: training.id }
      })
      expect(details).toBeNull()
    })
  })

  describe('Authorization and Security', () => {
    it('should require authentication for all endpoints', async () => {
      const { response } = await apiCall(
        'GET',
        '/api/trainings',
        null,
        undefined // No token
      )

      expect(response.status).toBe(401)
    })

    it('should enforce RLS - athlete cannot see other athletes trainings', async () => {
      const trainer = testUsers[1]
      const athlete1 = testUsers[2]
      const athlete2 = testUsers[3]
      const org = await prisma.organization.findFirst({
        where: { members: { some: { userId: trainer.id, role: 'TRAINER' } } }
      })

      // Create training for athlete1
      const { data: training } = await apiCall(
        'POST',
        '/api/trainings',
        {
          title: 'Athlete1 Private Training',
          type: 'RUNNING',
          memberId: athlete1.id,
          organizationId: org!.id
        },
        trainer.token
      )

      testTrainings.push(training.id)

      // Try to access as athlete2
      const { response, data } = await apiCall(
        'GET',
        `/api/trainings/${training.id}`,
        null,
        athlete2.token
      )

      expect(response.status).toBe(404)
    })

    it('should prevent athlete from modifying other athletes completion details', async () => {
      const trainer = testUsers[1]
      const athlete1 = testUsers[2]
      const athlete2 = testUsers[3]
      const org = await prisma.organization.findFirst({
        where: { members: { some: { userId: trainer.id, role: 'TRAINER' } } }
      })

      // Create training for athlete1
      const { data: training } = await apiCall(
        'POST',
        '/api/trainings',
        {
          title: 'Protected Training',
          type: 'RUNNING',
          memberId: athlete1.id,
          organizationId: org!.id
        },
        trainer.token
      )

      testTrainings.push(training.id)

      // Try to add completion details as athlete2
      const { response } = await apiCall(
        'PUT',
        `/api/trainings/${training.id}`,
        {
          distanceKm: 10.0,
          durationSeconds: 3600
        },
        athlete2.token
      )

      expect(response.status).toBe(404)
    })
  })
})
