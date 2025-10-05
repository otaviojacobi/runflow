import { prisma } from '@/lib/db'
import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

describe('/api/auth/login', () => {
  const testEmail = `test-login-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  const testName = 'Login Test User'
  let testUserId: string | null = null

  beforeEach(async () => {
    // Create a user to test login
    const { data: authData } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    testUserId = authData.user!.id

    await prisma.userProfile.create({
      data: {
        id: authData.user!.id,
        email: testEmail,
        name: testName,
      },
    })
  })

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

  it('should login with correct email and password', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    expect(error).toBeNull()
    expect(data.user).toBeDefined()
    expect(data.user?.email).toBe(testEmail)
    expect(data.session).toBeDefined()
  })

  it('should return error with incorrect password', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: 'WrongPassword123!',
    })

    expect(error).toBeDefined()
    expect(data.user).toBeNull()
    expect(data.session).toBeNull()
  })

  it('should return error with non-existent email', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'nonexistent@example.com',
      password: testPassword,
    })

    expect(error).toBeDefined()
    expect(data.user).toBeNull()
  })

  it('should handle multiple login attempts with same credentials', async () => {
    for (let i = 0; i < 3; i++) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      })

      expect(error).toBeNull()
      expect(data.user?.email).toBe(testEmail)
    }
  })

  describe('validation via API route', () => {
    it('should reject invalid email format with specific error message', async () => {
      const { POST } = await import('@/app/api/auth/login/route')

      const request = new Request('http://localhost:3000/api/auth/login', {
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

    it('should reject empty password with specific error message', async () => {
      const { POST } = await import('@/app/api/auth/login/route')

      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
          password: '',
        }),
      })

      const response = await POST(request as NextRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation failed')
      expect(data.details?.password).toBeDefined()
      expect(data.details.password).toContain('Password is required')
    })

    it('should reject missing email with specific error message', async () => {
      const { POST } = await import('@/app/api/auth/login/route')

      const request = new Request('http://localhost:3000/api/auth/login', {
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
      const { POST } = await import('@/app/api/auth/login/route')

      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testEmail,
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
