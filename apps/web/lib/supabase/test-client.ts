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

  const { data, error } = await client.auth.admin.createUser({
    email: params.email,
    password: params.password,
    email_confirm: params.emailConfirm ?? true, // Auto-verify email by default
  })

  return { data, error }
}
