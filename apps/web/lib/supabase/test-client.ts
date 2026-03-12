import { createClient } from '@supabase/supabase-js'

// Test client that doesn't require Next.js request context
export function createTestClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Creates a test user with email already verified
 * This bypasses email confirmation for testing purposes
 */
export async function createVerifiedTestUser(params: {
  email: string
  password: string
  emailConfirm?: boolean
}) {
  const client = createTestClient()

  const { data: createData, error: createError } = await client.auth.admin.createUser({
    email: params.email,
    password: params.password,
    email_confirm: params.emailConfirm ?? true, // Auto-verify email by default
  })

  if (createError || !createData.user) {
    return { data: { user: createData.user, session: null }, error: createError }
  }

  // Sign in to get a session
  const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
    email: params.email,
    password: params.password,
  })

  if (signInError) {
    return { data: { user: createData.user, session: null }, error: signInError }
  }

  return { data: { user: createData.user, session: signInData.session }, error: null }
}
