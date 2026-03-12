import { prisma } from '@/lib/db'
import { createClient } from '@supabase/supabase-js'
import { createVerifiedTestUser } from '@/lib/supabase/test-client'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const API_BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000'

// Helper to create a tiny valid PNG file
function createTestPng(): File {
  // Minimal 1x1 transparent PNG
  const pngBytes = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
    0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x78, 0x9c, 0x62, 0x00, 0x00, 0x00, 0x02,
    0x00, 0x01, 0xe5, 0x27, 0xde, 0xfc, 0x00, 0x00, // IEND chunk
    0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42,
    0x60, 0x82
  ])
  return new File([pngBytes], 'logo.png', { type: 'image/png' })
}

function createTestJpeg(): File {
  const jpegBytes = new Uint8Array([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
    0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
    0x00, 0x01, 0x00, 0x00, 0xff, 0xd9
  ])
  return new File([jpegBytes], 'logo.jpg', { type: 'image/jpeg' })
}

function createOversizedFile(): File {
  // 3MB file (exceeds 2MB limit)
  const bytes = new Uint8Array(3 * 1024 * 1024)
  return new File([bytes], 'huge.png', { type: 'image/png' })
}

function createInvalidTypeFile(): File {
  const bytes = new Uint8Array([0x00, 0x01, 0x02])
  return new File([bytes], 'doc.pdf', { type: 'application/pdf' })
}

describe('Organization Logo API', () => {
  const testUsers: { id: string; email: string; token: string }[] = []
  const testOrgs: string[] = []

  async function createTestUser(prefix: string) {
    const email = `${prefix}-logo-${Date.now()}@example.com`
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

  async function uploadLogo(orgId: string, file: File, token: string) {
    const url = `${API_BASE_URL}/api/organizations/${orgId}/logo`
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    })

    const data = await response.json()
    return { response, data }
  }

  beforeAll(async () => {
    const owner = await createTestUser('logo-owner')
    const member = await createTestUser('logo-member')
    testUsers.push(owner, member)
  })

  afterAll(async () => {
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

  describe('POST /api/organizations/[id]/logo - Upload Logo', () => {
    let orgId: string

    beforeAll(async () => {
      const { data } = await apiCall(
        'POST',
        '/api/organizations',
        { name: 'Logo Upload Test Org' },
        testUsers[0]!.token
      )
      orgId = data.id
      testOrgs.push(orgId)

      // Add second user as athlete
      await prisma.organizationMember.create({
        data: {
          organizationId: orgId,
          userId: testUsers[1]!.id,
          role: 'ATHLETE'
        }
      })
    })

    // Skipped: requires a real Vercel Blob connection (BLOB_READ_WRITE_TOKEN pointing to Vercel infrastructure)
    it.skip('should upload logo as OWNER and return signed URL', async () => {
      const file = createTestPng()
      const { response, data } = await uploadLogo(orgId, file, testUsers[0]!.token)

      expect(response.status).toBe(200)
      expect(data.logo).toBeDefined()
      expect(data.logo).not.toBeNull()
      // Signed URL should be different from the stored blob URL
      expect(data.id).toBe(orgId)
    })

    // Skipped: requires a real Vercel Blob connection
    it.skip('should replace existing logo on re-upload', async () => {
      const file = createTestJpeg()
      const { response, data } = await uploadLogo(orgId, file, testUsers[0]!.token)

      expect(response.status).toBe(200)
      expect(data.logo).toBeDefined()
      expect(data.logo).not.toBeNull()
    })

    it('should reject upload from non-OWNER (403)', async () => {
      const file = createTestPng()
      const { response, data } = await uploadLogo(orgId, file, testUsers[1]!.token)

      expect(response.status).toBe(403)
      expect(data.error).toContain('owners')
    })

    it('should reject invalid MIME type (400)', async () => {
      const file = createInvalidTypeFile()
      const { response, data } = await uploadLogo(orgId, file, testUsers[0]!.token)

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid file type')
    })

    it('should reject file exceeding 2MB (400)', async () => {
      const file = createOversizedFile()
      const { response, data } = await uploadLogo(orgId, file, testUsers[0]!.token)

      expect(response.status).toBe(400)
      expect(data.error).toContain('too large')
    })

    it('should reject unauthenticated upload (401)', async () => {
      const file = createTestPng()
      const url = `${API_BASE_URL}/api/organizations/${orgId}/logo`
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(url, {
        method: 'POST',
        body: formData
      })

      expect(response.status).toBe(401)
    })
  })

  describe('DELETE /api/organizations/[id]/logo - Remove Logo', () => {
    let orgId: string

    beforeAll(async () => {
      const { data } = await apiCall(
        'POST',
        '/api/organizations',
        { name: 'Logo Delete Test Org' },
        testUsers[0]!.token
      )
      orgId = data.id
      testOrgs.push(orgId)

      // Add member
      await prisma.organizationMember.create({
        data: {
          organizationId: orgId,
          userId: testUsers[1]!.id,
          role: 'ATHLETE'
        }
      })

      // Upload a logo first
      const file = createTestPng()
      await uploadLogo(orgId, file, testUsers[0]!.token)
    })

    it('should delete logo as OWNER', async () => {
      const { response, data } = await apiCall(
        'DELETE',
        `/api/organizations/${orgId}/logo`,
        undefined,
        testUsers[0]!.token
      )

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Verify logo is null
      const { data: orgData } = await apiCall(
        'GET',
        `/api/organizations/${orgId}`,
        undefined,
        testUsers[0]!.token
      )

      expect(orgData.logo).toBeNull()
    })

    it('should reject delete from non-OWNER (403)', async () => {
      const { response, data } = await apiCall(
        'DELETE',
        `/api/organizations/${orgId}/logo`,
        undefined,
        testUsers[1]!.token
      )

      expect(response.status).toBe(403)
      expect(data.error).toContain('owners')
    })

    it('should reject unauthenticated delete (401)', async () => {
      const { response } = await apiCall(
        'DELETE',
        `/api/organizations/${orgId}/logo`
      )

      expect(response.status).toBe(401)
    })
  })

  // Skipped: these tests depend on a successful logo upload which requires a real Vercel Blob connection
  describe.skip('GET endpoints return signed logo URLs', () => {
    let orgId: string

    beforeAll(async () => {
      const { data } = await apiCall(
        'POST',
        '/api/organizations',
        { name: 'Logo Signed URL Test Org' },
        testUsers[0]!.token
      )
      orgId = data.id
      testOrgs.push(orgId)

      // Upload a logo
      const file = createTestPng()
      await uploadLogo(orgId, file, testUsers[0]!.token)
    })

    it('GET /api/organizations/[id] returns signed logo URL', async () => {
      const { response, data } = await apiCall(
        'GET',
        `/api/organizations/${orgId}`,
        undefined,
        testUsers[0]!.token
      )

      expect(response.status).toBe(200)
      expect(data.logo).toBeDefined()
      expect(data.logo).not.toBeNull()
    })

    it('GET /api/organizations returns signed logo URLs', async () => {
      const { response, data } = await apiCall(
        'GET',
        '/api/organizations',
        undefined,
        testUsers[0]!.token
      )

      expect(response.status).toBe(200)
      const org = data.find((o: any) => o.id === orgId)
      expect(org).toBeDefined()
      expect(org!.logo).toBeDefined()
      expect(org!.logo).not.toBeNull()
    })
  })
})
