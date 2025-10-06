import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const resendSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validation = resendSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { email } = validation.data

    const supabase = await createClient()

    // Resend confirmation email
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })

    if (error) {
      console.error('Resend confirmation error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to resend confirmation email' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Confirmation email sent successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Resend confirmation error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
