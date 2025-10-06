import { prisma } from '@/lib/db'
import { createClient } from '@supabase/supabase-js'
import { createVerifiedTestUser } from '@/lib/supabase/test-client'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

describe('Full Authentication Flow', () => {
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

  it('should complete full auth flow: register -> create profile -> login', async () => {
    const testEmail = `test-flow-${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'
    const testName = 'Flow Test User'

    // Step 1: Register a new user with auto-verified email
    const { data: registerData, error: registerError } = await createVerifiedTestUser({
      email: testEmail,
      password: testPassword,
    })

    expect(registerError).toBeNull()
    expect(registerData.user).toBeDefined()
    testUserId = registerData.user!.id

    // Step 2: Create user profile in database
    const userProfile = await prisma.userProfile.create({
      data: {
        id: registerData.user!.id,
        email: testEmail,
        name: testName,
      },
    })

    expect(userProfile).toBeDefined()
    expect(userProfile.email).toBe(testEmail)
    expect(userProfile.name).toBe(testName)

    // Step 3: Login with the registered user
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    expect(loginError).toBeNull()
    expect(loginData.user).toBeDefined()
    expect(loginData.user?.email).toBe(testEmail)
    expect(loginData.user?.id).toBe(testUserId)
    expect(loginData.session).toBeDefined()

    // Verify profile still exists in database
    const dbProfile = await prisma.userProfile.findUnique({
      where: { id: testUserId },
    })
    expect(dbProfile).toBeDefined()
    expect(dbProfile?.name).toBe(testName)
  })

  it('should fail login with wrong password after registration', async () => {
    const testEmail = `test-wrong-pw-${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'

    // Register with auto-verified email
    const { data: registerData } = await createVerifiedTestUser({
      email: testEmail,
      password: testPassword,
    })

    testUserId = registerData.user!.id

    await prisma.userProfile.create({
      data: {
        id: registerData.user!.id,
        email: testEmail,
      },
    })

    // Attempt login with wrong password
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: 'WrongPassword123!',
    })

    expect(loginError).toBeDefined()
    expect(loginData.user).toBeNull()
    expect(loginData.session).toBeNull()
  })

  it('should maintain session across multiple requests', async () => {
    const testEmail = `test-session-${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'

    // Register with auto-verified email
    const { data: registerData } = await createVerifiedTestUser({
      email: testEmail,
      password: testPassword,
    })

    testUserId = registerData.user!.id

    await prisma.userProfile.create({
      data: {
        id: registerData.user!.id,
        email: testEmail,
      },
    })

    // Login and get session
    const { data: loginData } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    })

    const session = loginData.session
    expect(session).toBeDefined()

    // Create a new client with the session
    const clientWithSession = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${session!.access_token}`,
          },
        },
      }
    )

    // Verify session works
    const { data: userData } = await clientWithSession.auth.getUser()
    expect(userData.user?.email).toBe(testEmail)
  })
})
