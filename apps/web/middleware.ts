import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

// Create i18n middleware
const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Skip i18n middleware for all auth routes
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth/')

  // If there's a 'code' parameter in the query, redirect to auth callback
  const code = request.nextUrl.searchParams.get('code')
  if (code && !isAuthRoute) {
    const callbackUrl = new URL('/auth/callback', request.url)
    callbackUrl.searchParams.set('code', code)

    // Preserve the type parameter if present (e.g., recovery for password reset)
    const type = request.nextUrl.searchParams.get('type')
    if (type) {
      callbackUrl.searchParams.set('type', type)
    }

    return NextResponse.redirect(callbackUrl)
  }

  if (!isAuthRoute) {
    // Apply i18n middleware
    const intlResponse = intlMiddleware(request)
    if (intlResponse) {
      response = intlResponse
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if needed
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
}
