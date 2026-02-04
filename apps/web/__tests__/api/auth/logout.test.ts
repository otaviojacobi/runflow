import { prisma } from '@/lib/db'
import { createClient } from '@supabase/supabase-js'
import { createVerifiedTestUser } from '@/lib/supabase/test-client'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

describe('/api/auth/logout', () => {
  const testEmail = `test-logout-${Date.now()}@example.com`
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
        name: 'Logout Test User',
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

  it('should return 200 on successful logout', async () => {
    // Login first to get a session
    const { data: loginData } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })
    expect(loginData.session).toBeDefined()

    const response = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `sb-access-token=${loginData.session!.access_token}; sb-refresh-token=${loginData.session!.refresh_token}`,
      },
    })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.message).toBe('Successfully signed out')
  })

  it('should handle unauthenticated request', async () => {
    const response = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    // Should still return 200 (signOut on no session is not an error)
    expect(response.status).toBe(200)
  })
})
