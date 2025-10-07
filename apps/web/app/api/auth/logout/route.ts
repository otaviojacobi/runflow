import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookieStore = await cookies()
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    )
  }

  // Clear any session cookies
  cookieStore.delete('sb-access-token')
  cookieStore.delete('sb-refresh-token')

  return NextResponse.json(
    { message: 'Successfully signed out' },
    { status: 200 }
  )
}