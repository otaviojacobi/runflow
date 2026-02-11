import { prisma } from '@/lib/db'
import { createClient } from '@supabase/supabase-js'
import { createVerifiedTestUser } from '@/lib/supabase/test-client'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Base URL for API calls - this should be your running Next.js dev server
const API_BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000'

describe('Organizations API - Complete Test Suite', () => {
  const testUsers: { id: string; email: string; token: string }[] = []
  const testOrgs: string[] = []

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
      token: authData.session.access_token
    }
  }

  // Helper to make real API calls
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
    // Create initial test users
    const owner = await createTestUser('owner')
    const member = await createTestUser('member')
    const outsider = await createTestUser('outsider')

    testUsers.push(owner, member, outsider)
  })

  afterAll(async () => {
    // Clean up all test data
    for (const orgId of testOrgs) {
      try {
        await prisma.organization.delete({ where: { id: orgId } })
      } catch { }
    }

    for (const user of testUsers) {
      try {
        await prisma.userProfile.delete({ where: { id: user.id } })
        await supabase.auth.admin.deleteUser(user.id)
      } catch { }
    }

    await prisma.$disconnect()
  })

  describe('POST /api/organizations - Create Organization', () => {
    it('should create organization and assign creator as owner', async () => {
      const { response, data } = await apiCall(
        'POST',
        '/api/organizations',
        {
          name: 'Test Organization',
          description: 'A test organization',
          logo: 'https://example.com/logo.png'
        },
        testUsers[0].token
      )

      expect(response.status).toBe(201)
      expect(data.id).toBeDefined()
      expect(data.name).toBe('Test Organization')
      expect(data.slug).toBe('test-organization')
      expect(data.description).toBe('A test organization')
      expect(data.logo).toBe('https://example.com/logo.png')

      testOrgs.push(data.id)

      // Verify owner membership was created
      const membership = await prisma.organizationMember.findFirst({
        where: {
          organizationId: data.id,
          userId: testUsers[0].id
        }
      })

      expect(membership).toBeDefined()
      expect(membership?.role).toBe('OWNER')

      // Verify user's current organization was set
      const userProfile = await prisma.userProfile.findUnique({
        where: { id: testUsers[0].id }
      })
      expect(userProfile?.currentOrganizationId).toBe(data.id)
    })

    it('should handle duplicate names with unique slugs', async () => {
      // Create first org
      const { data: data1 } = await apiCall(
        'POST',
        '/api/organizations',
        { name: 'Duplicate Name Org' },
        testUsers[0].token
      )

      testOrgs.push(data1.id)
      expect(data1.slug).toBe('duplicate-name-org')

      // Create second org with same name
      const { data: data2 } = await apiCall(
        'POST',
        '/api/organizations',
        { name: 'Duplicate Name Org' },
        testUsers[0].token
      )

      testOrgs.push(data2.id)
      expect(data2.slug).toBe('duplicate-name-org-1')
    })

    it('should reject invalid data', async () => {
      const { response, data } = await apiCall(
        'POST',
        '/api/organizations',
        { description: 'Missing name' },
        testUsers[0].token
      )

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
    })

    it('should reject unauthenticated requests', async () => {
      const { response } = await apiCall(
        'POST',
        '/api/organizations',
        { name: 'Should Fail' }
      )

      expect(response.status).toBe(401)
    })
  })

  describe('Studio test -> Organization', () => {
    let orgId: string

    beforeAll(async () => {
      const { data } = await apiCall(
        'POST',
        '/api/organizations',
        {
          name: 'Test Organization',
          description: 'A test organization',
          logo: 'https://example.com/logo.png'
        },
        testUsers[0].token
      )

      orgId = data.id;

    })

    it('can modify colors', async () => {
      const { response, data } = await apiCall(
        'PATCH',
        `/api/organizations/${orgId}/studio`,
        {
          primaryColor: '#111184',
          secondaryColor: '#fff'
        },
        testUsers[0].token
      )

      expect(data.organization.primaryColor).toBe('#111184')
      expect(data.organization.secondaryColor).toBe('#fff')
      expect(response.status).toBe(200)
    })

    it('wrong json', async () => {
      const { response, data } = await apiCall(
        'PATCH',
        `/api/organizations/${orgId}/studio`,
        'bla',
        testUsers[0].token
      )

      expect(response.status).toBe(400)
    })

     it('wrong body', async () => {
      const { response } = await apiCall(
        'PATCH',
        `/api/organizations/${orgId}/studio`,
        {
          primaryColor: '111184'
        },
        testUsers[0].token
      )

       expect(response.status).toBe(400)
     })

     it('wrong property name', async () => {
      const { response } = await apiCall(
        'PATCH',
        `/api/organizations/${orgId}/studio`,
        {
          Color: '#111184'
        },
        testUsers[0].token
      )

       expect(response.status).toBe(400)
     })

     it('user unauthenticated', async () => {

      const { response, data } = await apiCall(
        'PATCH',
        `/api/organizations/${orgId}/studio`,
        {
          primaryColor: '#111184',
          secondaryColor: '#fff'
        },
        testUsers[0].token
      )
      
       expect(response.status).toBe(401)
     })


    it('user unauthorized (only organization owners can use the studio)', async () => {
      const { response } = await apiCall(
        'PATCH',
        `/api/organizations/${orgId}/studio`,
        {
          primaryColor: '#111184',
          secondaryColor: '#fff'
        },
        testUsers[1].token
      )

      expect(response.status).toBe(403)
    })



  })

  describe('GET /api/organizations - List Organizations', () => {
    let orgId1: string
    let orgId2: string

    beforeAll(async () => {
      // Create orgs for testing
      const org1 = await prisma.organization.create({
        data: { name: 'List Org 1', slug: `list-org-1-${Date.now()}` }
      })
      orgId1 = org1.id
      testOrgs.push(orgId1)

      const org2 = await prisma.organization.create({
        data: { name: 'List Org 2', slug: `list-org-2-${Date.now()}` }
      })
      orgId2 = org2.id
      testOrgs.push(orgId2)

      // Add user as owner of org1 and member of org2
      await prisma.organizationMember.createMany({
        data: [
          { organizationId: orgId1, userId: testUsers[0].id, role: 'OWNER' },
          { organizationId: orgId2, userId: testUsers[0].id, role: 'ATHLETE' }
        ]
      })
    })

    it('should list user organizations with roles', async () => {
      const { response, data } = await apiCall(
        'GET',
        '/api/organizations',
        undefined,
        testUsers[0].token
      )

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThanOrEqual(2)

      const org1 = data.find((o: any) => o.id === orgId1)
      const org2 = data.find((o: any) => o.id === orgId2)

      expect(org1).toBeDefined()
      expect(org1.role).toBe('OWNER')
      expect(org2).toBeDefined()
      expect(org2.role).toBe('ATHLETE')
    })

    it('should return empty array for user with no organizations', async () => {
      const { response, data } = await apiCall(
        'GET',
        '/api/organizations',
        undefined,
        testUsers[2].token // outsider
      )

      expect(response.status).toBe(200)
      expect(data).toEqual([])
    })
  })

  describe('Organization CRUD Operations', () => {
    let organizationId: string

    beforeAll(async () => {
      const org = await prisma.organization.create({
        data: { name: 'CRUD Test Org', slug: `crud-org-${Date.now()}` }
      })
      organizationId = org.id
      testOrgs.push(organizationId)

      await prisma.organizationMember.create({
        data: {
          organizationId,
          userId: testUsers[0].id,
          role: 'OWNER'
        }
      })
    })

    describe('GET /api/organizations/[id]', () => {
      it('should get organization details for member', async () => {
        const { response, data } = await apiCall(
          'GET',
          `/api/organizations/${organizationId}`,
          undefined,
          testUsers[0].token
        )

        expect(response.status).toBe(200)
        expect(data.id).toBe(organizationId)
        expect(data.name).toBe('CRUD Test Org')
      })

      it('should reject non-member access', async () => {
        const { response } = await apiCall(
          'GET',
          `/api/organizations/${organizationId}`,
          undefined,
          testUsers[2].token // outsider
        )

        expect(response.status).toBe(404)
      })
    })

    describe('PUT /api/organizations/[id]', () => {
      it('should update organization as owner', async () => {
        const { response, data } = await apiCall(
          'PUT',
          `/api/organizations/${organizationId}`,
          { name: 'Updated Name', description: 'Updated description' },
          testUsers[0].token
        )

        expect(response.status).toBe(200)
        expect(data.name).toBe('Updated Name')
        expect(data.description).toBe('Updated description')
      })

      it('should reject update from non-owner', async () => {
        // Add user as regular member
        await prisma.organizationMember.create({
          data: {
            organizationId,
            userId: testUsers[1].id,
            role: 'ATHLETE'
          }
        })

        const { response } = await apiCall(
          'PUT',
          `/api/organizations/${organizationId}`,
          { name: 'Should Fail' },
          testUsers[1].token
        )

        expect(response.status).toBe(403)
      })
    })

    describe('DELETE /api/organizations/[id]', () => {
      it('should reject deletion from non-owner', async () => {
        const { response } = await apiCall(
          'DELETE',
          `/api/organizations/${organizationId}`,
          undefined,
          testUsers[1].token
        )

        expect(response.status).toBe(403)
      })

      it('should delete organization as owner', async () => {
        const { response } = await apiCall(
          'DELETE',
          `/api/organizations/${organizationId}`,
          undefined,
          testUsers[0].token
        )

        expect(response.status).toBe(200)

        // Verify deletion
        const org = await prisma.organization.findUnique({
          where: { id: organizationId }
        })
        expect(org).toBeNull()
      })
    })
  })

  describe('Member Management', () => {
    let organizationId: string
    let athleteUserId: string

    beforeAll(async () => {
      const org = await prisma.organization.create({
        data: { name: 'Member Test Org', slug: `member-org-${Date.now()}` }
      })
      organizationId = org.id
      testOrgs.push(organizationId)

      // Add owner and athlete
      await prisma.organizationMember.createMany({
        data: [
          { organizationId, userId: testUsers[0].id, role: 'OWNER' },
          { organizationId, userId: testUsers[1].id, role: 'ATHLETE' }
        ]
      })

      athleteUserId = testUsers[1].id
    })

    describe('GET /api/organizations/[id]/members', () => {
      it('should list organization members', async () => {
        const { response, data } = await apiCall(
          'GET',
          `/api/organizations/${organizationId}/members`,
          undefined,
          testUsers[0].token
        )

        expect(response.status).toBe(200)
        expect(data.members).toBeDefined()
        expect(data.members.length).toBe(2)
        expect(data.pagination).toBeDefined()

        const owner = data.members.find((m: any) => m.userId === testUsers[0].id)
        const athlete = data.members.find((m: any) => m.userId === testUsers[1].id)

        expect(owner.role).toBe('OWNER')
        expect(athlete.role).toBe('ATHLETE')
      })

      it('should filter members by role', async () => {
        const { response, data } = await apiCall(
          'GET',
          `/api/organizations/${organizationId}/members?role=OWNER`,
          undefined,
          testUsers[0].token
        )

        expect(response.status).toBe(200)
        expect(data.members.length).toBe(1)
        expect(data.members[0].role).toBe('OWNER')
      })

      it('should reject non-member access', async () => {
        const { response } = await apiCall(
          'GET',
          `/api/organizations/${organizationId}/members`,
          undefined,
          testUsers[2].token // outsider
        )

        expect(response.status).toBe(403)
      })
    })

    describe('PUT /api/organizations/[id]/members/[userId]', () => {
      it('should update member role as owner', async () => {
        const { response, data } = await apiCall(
          'PUT',
          `/api/organizations/${organizationId}/members/${athleteUserId}`,
          { role: 'TRAINER' },
          testUsers[0].token
        )

        expect(response.status).toBe(200)
        expect(data.role).toBe('TRAINER')
      })

      it('should prevent changing role of last owner', async () => {
        const { response, data } = await apiCall(
          'PUT',
          `/api/organizations/${organizationId}/members/${testUsers[0].id}`,
          { role: 'ATHLETE' },
          testUsers[0].token
        )

        expect(response.status).toBe(400)
        expect(data.error).toContain('last owner')
      })

      it('should reject role update from non-owner', async () => {
        const { response } = await apiCall(
          'PUT',
          `/api/organizations/${organizationId}/members/${testUsers[0].id}`,
          { role: 'ATHLETE' },
          testUsers[1].token
        )

        expect(response.status).toBe(403)
      })
    })

    describe('DELETE /api/organizations/[id]/members/[userId]', () => {
      it('should allow members to remove themselves', async () => {
        const { response } = await apiCall(
          'DELETE',
          `/api/organizations/${organizationId}/members/${athleteUserId}`,
          undefined,
          testUsers[1].token
        )

        expect(response.status).toBe(200)

        // Verify removal
        const member = await prisma.organizationMember.findUnique({
          where: {
            organizationId_userId: {
              organizationId,
              userId: athleteUserId
            }
          }
        })
        expect(member).toBeNull()
      })

      it('should prevent removing last owner', async () => {
        const { response, data } = await apiCall(
          'DELETE',
          `/api/organizations/${organizationId}/members/${testUsers[0].id}`,
          undefined,
          testUsers[0].token
        )

        expect(response.status).toBe(400)
        expect(data.error).toContain('last owner')
      })
    })
  })

  describe('Invitation Flow', () => {
    let organizationId: string
    let inviteToken: string
    let inviteId: string
    let newUserEmail: string

    beforeAll(async () => {
      const org = await prisma.organization.create({
        data: { name: 'Invite Test Org', slug: `invite-org-${Date.now()}` }
      })
      organizationId = org.id
      testOrgs.push(organizationId)

      await prisma.organizationMember.createMany({
        data: [
          { organizationId, userId: testUsers[0].id, role: 'OWNER' },
          { organizationId, userId: testUsers[1].id, role: 'TRAINER' }
        ]
      })
    })

    describe('POST /api/organizations/[id]/invites', () => {
      it('should create invitation for non-existent user', async () => {
        newUserEmail = `newuser-${Date.now()}@example.com`

        const { response, data } = await apiCall(
          'POST',
          `/api/organizations/${organizationId}/invites`,
          { email: newUserEmail, role: 'ATHLETE' },
          testUsers[0].token
        )

        expect(response.status).toBe(201)
        expect(data.email).toBe(newUserEmail)
        expect(data.role).toBe('ATHLETE')
        expect(data.token).toBeDefined()
        expect(data.status).toBe('PENDING')

        inviteToken = data.token
        inviteId = data.id
      })

      it('should allow trainer to create invites', async () => {
        const { response } = await apiCall(
          'POST',
          `/api/organizations/${organizationId}/invites`,
          { email: `trainer-invite-${Date.now()}@example.com`, role: 'ATHLETE' },
          testUsers[1].token // trainer
        )

        expect(response.status).toBe(201)
      })

      it('should reject duplicate pending invites', async () => {
        const { response, data } = await apiCall(
          'POST',
          `/api/organizations/${organizationId}/invites`,
          { email: newUserEmail, role: 'TRAINER' },
          testUsers[0].token
        )

        expect(response.status).toBe(400)
        expect(data.error).toContain('already been sent')
      })

      it('should reject inviting existing members', async () => {
        const { response, data } = await apiCall(
          'POST',
          `/api/organizations/${organizationId}/invites`,
          { email: testUsers[1].email, role: 'ATHLETE' },
          testUsers[0].token
        )

        expect(response.status).toBe(400)
        expect(data.error).toContain('already a member')
      })
    })

    describe('GET /api/organizations/[id]/invites', () => {
      it('should list pending invites for owners/trainers', async () => {
        const { response, data } = await apiCall(
          'GET',
          `/api/organizations/${organizationId}/invites`,
          undefined,
          testUsers[0].token
        )

        expect(response.status).toBe(200)
        expect(Array.isArray(data)).toBe(true)
        expect(data.length).toBeGreaterThan(0)
        expect(data.find((i: any) => i.email === newUserEmail)).toBeDefined()
      })

      it('should reject access from regular members', async () => {
        // Add user as regular athlete
        const tempOrg = await prisma.organization.create({
          data: { name: 'Temp', slug: `temp-${Date.now()}` }
        })
        testOrgs.push(tempOrg.id)

        await prisma.organizationMember.create({
          data: { organizationId: tempOrg.id, userId: testUsers[2].id, role: 'ATHLETE' }
        })

        const { response } = await apiCall(
          'GET',
          `/api/organizations/${tempOrg.id}/invites`,
          undefined,
          testUsers[2].token
        )

        expect(response.status).toBe(403)
      })
    })

    describe('GET /api/invites/[token]', () => {
      it('should get invite details publicly', async () => {
        const { response, data } = await apiCall(
          'GET',
          `/api/invites/${inviteToken}`,
          undefined,
          undefined // no auth required
        )

        expect(response.status).toBe(200)
        expect(data.invite.email).toBe(newUserEmail)
        expect(data.organization.id).toBe(organizationId)
        expect(data.invitedBy).toBeDefined()
      })

      it('should return 404 for invalid token', async () => {
        const { response } = await apiCall(
          'GET',
          '/api/invites/invalid-token',
          undefined,
          undefined
        )

        expect(response.status).toBe(404)
      })
    })

    describe('POST /api/invites/[token]/accept', () => {
      let newUserId: string
      let newUserToken: string

      beforeAll(async () => {
        // Register the invited user
        const newUser = await createTestUser('invited')

        // Update the email to match the invite
        await prisma.userProfile.update({
          where: { id: newUser.id },
          data: { email: newUserEmail }
        })

        newUserId = newUser.id
        newUserToken = newUser.token
      })

      it('should accept invitation', async () => {
        const { response, data } = await apiCall(
          'POST',
          `/api/invites/${inviteToken}/accept`,
          undefined,
          newUserToken
        )

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.organization.id).toBe(organizationId)
        expect(data.role).toBe('ATHLETE')

        // Verify membership was created
        const membership = await prisma.organizationMember.findUnique({
          where: {
            organizationId_userId: {
              organizationId,
              userId: newUserId
            }
          }
        })

        expect(membership).toBeDefined()
        expect(membership?.role).toBe('ATHLETE')

        // Verify invite status changed
        const invite = await prisma.organizationInvite.findUnique({
          where: { id: inviteId }
        })
        expect(invite?.status).toBe('ACCEPTED')
      })

      it('should reject accepting already accepted invite', async () => {
        const { response, data } = await apiCall(
          'POST',
          `/api/invites/${inviteToken}/accept`,
          undefined,
          newUserToken
        )

        expect(response.status).toBe(410)
        expect(data.error).toContain('already been accepted')
      })
    })

    describe('DELETE /api/organizations/[id]/invites/[inviteId]', () => {
      let deleteInviteId: string

      beforeAll(async () => {
        // Create an invite to delete
        const invite = await prisma.organizationInvite.create({
          data: {
            organizationId,
            email: `delete-test-${Date.now()}@example.com`,
            role: 'ATHLETE',
            invitedById: testUsers[0].id,
            token: `delete-token-${Date.now()}`,
            status: 'PENDING',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        })
        deleteInviteId = invite.id
      })

      it('should delete invitation as owner', async () => {
        const { response } = await apiCall(
          'DELETE',
          `/api/organizations/${organizationId}/invites/${deleteInviteId}`,
          undefined,
          testUsers[0].token
        )

        expect(response.status).toBe(200)

        // Verify deletion
        const invite = await prisma.organizationInvite.findUnique({
          where: { id: deleteInviteId }
        })
        expect(invite).toBeNull()
      })

      it('should reject deletion from non-owner', async () => {
        // Create another invite
        const invite = await prisma.organizationInvite.create({
          data: {
            organizationId,
            email: `another-${Date.now()}@example.com`,
            role: 'ATHLETE',
            invitedById: testUsers[0].id,
            token: `another-token-${Date.now()}`,
            status: 'PENDING',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        })

        const { response } = await apiCall(
          'DELETE',
          `/api/organizations/${organizationId}/invites/${invite.id}`,
          undefined,
          testUsers[1].token // trainer (not owner)
        )

        expect(response.status).toBe(403)
      })
    })
  })

  describe('User Context Endpoints', () => {
    let userId: string
    let userToken: string
    let userEmail: string

    beforeAll(async () => {
      // Create user with multiple invites
      const user = await createTestUser('context')
      userId = user.id
      userToken = user.token
      userEmail = user.email

      // Create organizations and invites
      for (let i = 0; i < 2; i++) {
        const org = await prisma.organization.create({
          data: { name: `Context Org ${i}`, slug: `context-org-${i}-${Date.now()}` }
        })
        testOrgs.push(org.id)

        await prisma.organizationMember.create({
          data: { organizationId: org.id, userId: testUsers[0].id, role: 'OWNER' }
        })

        await prisma.organizationInvite.create({
          data: {
            organizationId: org.id,
            email: userEmail,
            role: i === 0 ? 'TRAINER' : 'ATHLETE',
            invitedById: testUsers[0].id,
            token: `context-token-${i}-${Date.now()}`,
            status: 'PENDING',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        })
      }
    })

    describe('GET /api/users/me', () => {
      it('should get user profile with organizations and pending invites', async () => {
        const { response, data } = await apiCall(
          'GET',
          '/api/users/me',
          undefined,
          userToken
        )

        expect(response.status).toBe(200)
        expect(data.user.id).toBe(userId)
        expect(data.user.email).toBe(userEmail)
        expect(data.organizations).toBeDefined()
        expect(data.pendingInvites).toBeDefined()
        expect(data.pendingInvites.length).toBe(2)

        const roles = data.pendingInvites.map((i: any) => i.role).sort()
        expect(roles).toEqual(['ATHLETE', 'TRAINER'])
      })
    })

    describe('GET /api/users/me/pending-invites', () => {
      it('should list pending invites for user email', async () => {
        const { response, data } = await apiCall(
          'GET',
          '/api/users/me/pending-invites',
          undefined,
          userToken
        )

        expect(response.status).toBe(200)
        expect(data.invites).toBeDefined()
        expect(data.invites.length).toBe(2)

        for (const invite of data.invites) {
          expect(invite.token).toBeDefined()
          expect(invite.organization).toBeDefined()
          expect(invite.invitedBy).toBeDefined()
        }
      })
    })

    describe('POST /api/users/switch-organization', () => {
      let switchOrgId: string

      beforeAll(async () => {
        // Accept one of the invites to have an organization to switch to
        const invite = await prisma.organizationInvite.findFirst({
          where: { email: userEmail, status: 'PENDING' }
        })

        if (invite) {
          await prisma.$transaction(async (tx) => {
            await tx.organizationInvite.update({
              where: { id: invite.id },
              data: { status: 'ACCEPTED' }
            })

            await tx.organizationMember.create({
              data: {
                organizationId: invite.organizationId,
                userId,
                role: invite.role,
                invitedById: invite.invitedById
              }
            })
          })

          switchOrgId = invite.organizationId
        }
      })

      it('should switch current organization', async () => {
        const { response, data } = await apiCall(
          'POST',
          '/api/users/switch-organization',
          { organizationId: switchOrgId },
          userToken
        )

        expect(response.status).toBe(200)
        expect(data.user.currentOrganizationId).toBe(switchOrgId)
        expect(data.organization.id).toBe(switchOrgId)

        // Verify in database
        const profile = await prisma.userProfile.findUnique({
          where: { id: userId }
        })
        expect(profile?.currentOrganizationId).toBe(switchOrgId)
      })

      it('should reject switching to non-member organization', async () => {
        // Try to switch to an org the user is not a member of
        const nonMemberOrg = await prisma.organization.findFirst({
          where: {
            NOT: {
              members: {
                some: { userId }
              }
            }
          }
        })

        if (nonMemberOrg) {
          const { response } = await apiCall(
            'POST',
            '/api/users/switch-organization',
            { organizationId: nonMemberOrg.id },
            userToken
          )

          expect(response.status).toBe(403)
        }
      })
    })
  })
})