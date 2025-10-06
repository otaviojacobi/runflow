import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, type LoginResponse, type AuthErrorResponse } from '@repo/schemas/auth'
import { ZodError } from 'zod'

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

export async function POST(request: NextRequest): Promise<NextResponse<LoginResponse | AuthErrorResponse>> {
  try {
    const body = await request.json()

    // Validate input with Zod schema
    const validatedData = loginSchema.parse(body)

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    if (!data.session) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        user: {
          id: data.user.id,
          email: data.user.email!,
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        },
      },
      { status: 200 }
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

    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
