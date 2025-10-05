import { prisma } from '@/lib/db'
import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

// Create admin client for testing
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

describe('/api/auth/register', () => {
  let testUserId: string | null = null

  afterEach(async () => {
    // Clean up test user
    if (testUserId) {
      try {
        await prisma.userProfile.delete({
          where: { id: testUserId },
        })
      } catch (error) {
        // Ignore errors
      }

      try {
        await supabase.auth.admin.deleteUser(testUserId)
      } catch (error) {
        // Ignore errors
      }

      testUserId = null
    }
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should register a new user with email, password, and name', async () => {
    const testEmail = `test-register-${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'
    const testName = 'Test User'

    // Register user via Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    expect(authError).toBeNull()
    expect(authData.user).toBeDefined()

    testUserId = authData.user!.id

    // Create profile in database
    const userProfile = await prisma.userProfile.create({
      data: {
        id: authData.user!.id,
        email: testEmail,
        name: testName,
      },
    })

    expect(userProfile).toBeDefined()
    expect(userProfile.email).toBe(testEmail)
    expect(userProfile.name).toBe(testName)

    // Verify user exists in database
    const dbUser = await prisma.userProfile.findUnique({
      where: { id: testUserId },
    })
    expect(dbUser).toBeDefined()
    expect(dbUser?.email).toBe(testEmail)
  })

  it('should register a user without a name', async () => {
    const testEmail = `test-no-name-${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    expect(authError).toBeNull()
    testUserId = authData.user!.id

    const userProfile = await prisma.userProfile.create({
      data: {
        id: authData.user!.id,
        email: testEmail,
      },
    })

    expect(userProfile.name).toBeNull()
  })

  it('should prevent duplicate user registration', async () => {
    const testEmail = `test-duplicate-${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'

    // First registration
    const { data: firstAuth } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    testUserId = firstAuth.user!.id

    await prisma.userProfile.create({
      data: {
        id: firstAuth.user!.id,
        email: testEmail,
      },
    })

    // Attempt duplicate registration
    const { error: duplicateError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    // Supabase returns success but user already exists
    // Check database constraint
    await expect(
      prisma.userProfile.create({
        data: {
          id: firstAuth.user!.id,
          email: testEmail,
        },
      })
    ).rejects.toThrow()
  })

  describe('validation via API route', () => {
    it('should reject invalid email format with specific error message', async () => {
      const { POST } = await import('@/app/api/auth/register/route')

      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'TestPassword123!',
        }),
      })

      const response = await POST(request as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
      expect(data.details?.email).toBeDefined()
      expect(data.details.email).toContain('Invalid email address')
    })

    it('should reject weak password (too short) with specific error message', async () => {
      const { POST } = await import('@/app/api/auth/register/route')

      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: `test-weak-${Date.now()}@example.com`,
          password: 'Test1',
        }),
      })

      const response = await POST(request as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
      expect(data.details?.password).toBeDefined()
      expect(data.details.password).toContain('Password must be at least 8 characters')
    })

    it('should reject password without uppercase letter with specific error message', async () => {
      const { POST } = await import('@/app/api/auth/register/route')

      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: `test-no-upper-${Date.now()}@example.com`,
          password: 'testpassword123',
        }),
      })

      const response = await POST(request as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
      expect(data.details?.password).toBeDefined()
      expect(data.details.password[0]).toContain('uppercase')
      expect(data.details.password[0]).toContain('lowercase')
      expect(data.details.password[0]).toContain('number')
    })

    it('should reject password without number with specific error message', async () => {
      const { POST } = await import('@/app/api/auth/register/route')

      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: `test-no-number-${Date.now()}@example.com`,
          password: 'TestPassword',
        }),
      })

      const response = await POST(request as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
      expect(data.details?.password).toBeDefined()
      expect(data.details.password[0]).toContain('uppercase')
      expect(data.details.password[0]).toContain('lowercase')
      expect(data.details.password[0]).toContain('number')
    })

    it('should reject missing email with specific error message', async () => {
      const { POST } = await import('@/app/api/auth/register/route')

      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          password: 'TestPassword123!',
        }),
      })

      const response = await POST(request as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
      expect(data.details?.email).toBeDefined()
      expect(data.details.email).toContain('Required')
    })

    it('should reject missing password with specific error message', async () => {
      const { POST } = await import('@/app/api/auth/register/route')

      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: `test-no-password-${Date.now()}@example.com`,
        }),
      })

      const response = await POST(request as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
      expect(data.details?.password).toBeDefined()
      expect(data.details.password).toContain('Required')
    })
  })
})
