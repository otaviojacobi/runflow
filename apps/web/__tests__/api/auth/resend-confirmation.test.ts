import { prisma } from '@/lib/db'
import { createClient } from '@supabase/supabase-js'
import { createVerifiedTestUser } from '@/lib/supabase/test-client'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

describe('/api/auth/resend-confirmation', () => {
  const testEmail = `test-resend-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  let testUserId: string | null = null

  beforeEach(async () => {
    const { data: authData } = await createVerifiedTestUser({
      email: testEmail,
      password: testPassword,
    })

    testUserId = authData.user!.id

    await prisma.userProfile.create({
      data: {
        id: authData.user!.id,
        email: testEmail,
        name: 'Resend Test User',
      },
    })
  })

  afterEach(async () => {
    if (testUserId) {
      try {
        await prisma.userProfile.delete({ where: { id: testUserId } })
      } catch {}
      try {
        await supabase.auth.admin.deleteUser(testUserId)
      } catch {}
      testUserId = null
    }
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should return 200 for a valid email', async () => {
    const response = await fetch(`${BASE_URL}/api/auth/resend-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Confirmation email sent successfully')
  })

  it('should return 400 for an invalid email format', async () => {
    const response = await fetch(`${BASE_URL}/api/auth/resend-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' }),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Validation failed')
    expect(data.details?.email).toBeDefined()
  })

  it('should return 400 for missing email field', async () => {
    const response = await fetch(`${BASE_URL}/api/auth/resend-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Validation failed')
  })

  it('should handle OPTIONS request', async () => {
    const response = await fetch(`${BASE_URL}/api/auth/resend-confirmation`, {
      method: 'OPTIONS',
    })

    expect(response.status).toBe(200)
  })
})
