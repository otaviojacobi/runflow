import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { registerSchema, type RegisterResponse, type AuthErrorResponse } from '@repo/schemas/auth'
import { ZodError } from '@repo/schemas/zod'

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

export async function POST(request: NextRequest): Promise<NextResponse<RegisterResponse | AuthErrorResponse>> {
  try {
    const body = await request.json()

    // Validate input with Zod schema
    const validatedData = registerSchema.parse(body)

    const supabase = await createClient()

    // Create user in Supabase Auth with captcha token (if provided)
    // Supabase will verify the captcha token automatically if captcha is enabled in settings
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: validatedData.captchaToken
        ? { captchaToken: validatedData.captchaToken }
        : undefined,
    })

    if (authError) {
      // Detect duplicate user from Supabase error
      if (
        authError.message.toLowerCase().includes('user already registered') ||
        authError.status === 422
      ) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in instead.', code: 'USER_ALREADY_EXISTS' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // When email confirmation is enabled, Supabase returns a user with empty
    // identities array instead of an error for duplicate signups (to prevent
    // email enumeration). Detect this case.
    if (
      authData.user.identities &&
      authData.user.identities.length === 0
    ) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead.', code: 'USER_ALREADY_EXISTS' },
        { status: 409 }
      )
    }

    // Create user profile in database
    const userProfile = await prisma.userProfile.create({
      data: {
        id: authData.user.id,
        email: validatedData.email,
        name: validatedData.name || null,
      },
    })

    return NextResponse.json(
      {
        user: {
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const details = error.errors.reduce((acc, err) => {
        const path = err.path.join('.')
        if (!acc[path]) acc[path] = []
        acc[path].push(err.message)
        return acc
      }, {} as Record<string, string[]>)

      return NextResponse.json(
        { error: 'Validation failed', details },
        { status: 400 }
      )
    }

    // Handle Prisma unique constraint violation (email already exists in UserProfile)
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead.', code: 'USER_ALREADY_EXISTS' },
        { status: 409 }
      )
    }

    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
