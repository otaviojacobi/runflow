import { registerSchema, loginSchema } from '@repo/schemas/auth'
import { ZodError } from 'zod'

describe('Auth Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Test1234',
        name: 'Test User',
      }

      const result = registerSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should validate registration data without name', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Test1234',
      }

      const result = registerSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Test1234',
      }

      expect(() => registerSchema.parse(invalidData)).toThrow(ZodError)

      try {
        registerSchema.parse(invalidData)
      } catch (error) {
        if (error instanceof ZodError) {
          expect(error.errors[0]?.message).toBe('Invalid email address')
          expect(error.errors[0]?.path).toEqual(['email'])
        }
      }
    })

    it('should reject password shorter than 8 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Test1',
      }

      expect(() => registerSchema.parse(invalidData)).toThrow(ZodError)

      try {
        registerSchema.parse(invalidData)
      } catch (error) {
        if (error instanceof ZodError) {
          expect(error.errors[0]?.message).toBe('Password must be at least 8 characters')
          expect(error.errors[0]?.path).toEqual(['password'])
        }
      }
    })

    it('should reject password without uppercase letter', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'test1234',
      }

      expect(() => registerSchema.parse(invalidData)).toThrow(ZodError)

      try {
        registerSchema.parse(invalidData)
      } catch (error) {
        if (error instanceof ZodError) {
          expect(error.errors[0]?.message).toContain('uppercase')
        }
      }
    })

    it('should reject password without lowercase letter', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'TEST1234',
      }

      expect(() => registerSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should reject password without number', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'TestPassword',
      }

      expect(() => registerSchema.parse(invalidData)).toThrow(ZodError)
    })
  })

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'anypassword',
      }

      const result = loginSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'anypassword',
      }

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError)

      try {
        loginSchema.parse(invalidData)
      } catch (error) {
        if (error instanceof ZodError) {
          expect(error.errors[0]?.message).toBe('Invalid email address')
          expect(error.errors[0]?.path).toEqual(['email'])
        }
      }
    })

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      }

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError)

      try {
        loginSchema.parse(invalidData)
      } catch (error) {
        if (error instanceof ZodError) {
          expect(error.errors[0]?.message).toBe('Password is required')
          expect(error.errors[0]?.path).toEqual(['password'])
        }
      }
    })

    it('should reject missing email', () => {
      const invalidData = {
        password: 'anypassword',
      } as any

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should reject missing password', () => {
      const invalidData = {
        email: 'test@example.com',
      }

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError)
    })
  })
})
