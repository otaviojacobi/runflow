import { createClient } from '@supabase/supabase-js'

// Test client that doesn't require Next.js request context
export function createTestClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
