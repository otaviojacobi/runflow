import { z } from 'zod'

/**
 * Schema for user registration
 */
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  name: z.string().min(1, 'Name is required').optional(),
})

/**
 * Schema for user login
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

/**
 * TypeScript types inferred from schemas
 */
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>

/**
 * Response types for auth endpoints
 */
export type RegisterResponse = {
  user: {
    id: string
    email: string
    name: string | null
  }
}

export type LoginResponse = {
  user: {
    id: string
    email: string
  }
  session: {
    access_token: string
    refresh_token: string
  }
}

export type AuthErrorResponse = {
  error: string
  details?: Record<string, string[]>
}
