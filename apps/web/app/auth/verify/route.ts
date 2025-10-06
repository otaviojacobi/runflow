import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token = requestUrl.searchParams.get('token')
  const type = requestUrl.searchParams.get('type')
  const redirectTo = requestUrl.searchParams.get('redirect_to') || '/profile'

  if (token && type) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Verify the token
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as any,
    })

    if (!error) {
      // Successful verification - redirect to profile or intended page
      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
    }

    // If there's an error, redirect to verify-email page with error
    return NextResponse.redirect(
      new URL(`/verify-email?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
    )
  }

  // No token provided, redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}
